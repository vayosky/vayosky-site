// Space Slice · Boss-Fähigkeiten (v78)
// Jeder Boss in dieser Liste bekommt eine eigene Fähigkeit. Jede Gefahr kündigt sich vorher an (Vorwarnung),
// Einfrieren und Pause halten sie an, Zeitlupe verlangsamt sie, Schutz schützt die Linie wie bisher.
// Schlüssel = Nummer des Bosses in BOSS (0 = Mech-Spinne, 4 = Hai, …)
const ABIL = { 4: 'sprint', 6: 'abtauchen', 9: 'welle', 10: 'rudel', 11: 'puls', 12: 'feuer' };
const ABIL_NAME = {
  sprint: tr('Sprint'), abtauchen: tr('Abtauchen'), welle: tr('Schlangenlinie'),
  rudel: tr('Rudel'), puls: tr('Pulsieren'), feuer: tr('Feuerstrahl')
};
const abilOf = bt => ABIL[bt] || null;
const abEvery = () => (level > BOSS_ORDER.length ? 5 : 8);    // Runde 1: etwa alle 8 s, ab Runde 2: etwa alle 5 s

let ab = null;              // Zustand der Fähigkeit im laufenden Level
let bossAlpha = 1;          // Sichtbarkeit des Bosses (Fledermaus taucht ab)

// Beim Levelstart aufgerufen (level.js)
function abReset() {
  bossAlpha = 1;
  const type = abilOf(bossType), boss = spiders.find(sp => sp.boss);
  ab = type && boss ? { type, cd: 4 + Math.random() * 2, phase: 'idle', pt: 0, spd0: Math.hypot(boss.vx, boss.vy), rad0: boss.rad || 1, done: false } : null;
}

// Ziel: nächste Stelle der offenen Linie, sonst die Figur
function abTarget(boss) {
  let tx = player.x + 0.5, ty = player.y + 0.5;
  if (player.drawing && player.trail.length) {
    let bd = 1e9;
    for (const [x, y] of player.trail) { const d = (x + 0.5 - boss.x) ** 2 + (y + 0.5 - boss.y) ** 2; if (d < bd) { bd = d; tx = x + 0.5; ty = y + 0.5; } }
  }
  return Math.atan2(ty - boss.y, tx - boss.x);
}

// Freier Platz im dunklen Feld, weit weg von der Figur und nicht an der offenen Linie (für die Fledermaus)
function abFreeSpot(r) {
  for (let k = 0; k < 400; k++) {
    const x = Math.floor(cols * (0.1 + Math.random() * 0.8)), y = Math.floor(rows * (0.1 + Math.random() * 0.8));
    if (Math.hypot(x - player.x, y - player.y) < 12 * S) continue;
    let ok = true;
    for (let dy = -r; dy <= r && ok; dy++) for (let dx = -r; dx <= r && ok; dx++) if (cellAt(x + dx, y + dy) !== OPEN) ok = false;
    if (ok) return [x + 0.5, y + 0.5];
  }
  return null;
}

// Jedes Bild aufgerufen (spiellogik.js update), nur während des Spiels
function abUpdate(dt) {
  if (!ab || freezeT > 0) return;
  const boss = spiders.find(sp => sp.boss);
  if (!boss) return;
  const t = dt * (slowT > 0 ? 0.4 : 1);

  // Seeschlange: schwimmt dauernd in Wellen (Richtung pendelt, Tempo bleibt gleich)
  if (ab.type === 'welle') {
    const w = 0.9 * 3 * Math.cos(time * 3) * t, c = Math.cos(w), sn = Math.sin(w);
    const vx = boss.vx * c - boss.vy * sn, vy = boss.vx * sn + boss.vy * c; boss.vx = vx; boss.vy = vy;
    return;
  }
  if (ab.done) return;

  if (ab.phase === 'idle') {
    ab.cd -= t;
    if (ab.cd > 0) return;
    ab.phase = 'warn'; ab.pt = 0;
    if (ab.type === 'abtauchen') { ab.spot = abFreeSpot(Math.ceil((boss.rad || 1) * 1.4 * S)); if (!ab.spot) { ab.phase = 'idle'; ab.cd = 2; return; } }
    if (ab.type === 'feuer') ab.ang = abTarget(boss);
    if (ab.type === 'rudel') { say(tr('🐺 Der Wolf ruft sein Rudel!')); sfx('shoot'); buzz(40); }
    return;
  }

  ab.pt += t;
  const WARN = { sprint: 0.7, abtauchen: 0.8, rudel: 1.0, puls: 0.6, feuer: 0.8 }[ab.type];
  if (ab.phase === 'warn') {
    if (ab.type === 'abtauchen') bossAlpha = Math.max(0.15, 1 - ab.pt / WARN);
    if (ab.type === 'feuer') ab.ang = ab.ang * 0.9 + abTarget(boss) * 0.1;      // Strahl folgt leicht, bleibt aber gut sichtbar
    if (ab.pt < WARN) return;
    ab.phase = 'act'; ab.pt = 0; ab.n = 0;
    if (ab.type === 'sprint') { const a = abTarget(boss), sp = ab.spd0 * 2.2; boss.vx = Math.cos(a) * sp; boss.vy = Math.sin(a) * sp; boss.turn = 2; sfx('shoot'); }
    if (ab.type === 'abtauchen') { boss.x = ab.spot[0]; boss.y = ab.spot[1]; burst(boss.x, boss.y, '#c9a7ff', 16, 1); }
    if (ab.type === 'rudel') {
      const sp = Math.min(13, 5.5 + level * 1.2) * 1.2 * S;
      for (let i = 0; i < 2; i++) { const a = Math.random() * Math.PI * 2; spiders.push({ boss: false, x: boss.x, y: boss.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, turn: 1 + Math.random() * 2 }); }
      burst(boss.x, boss.y, '#f08a3c', 18, 1.2);
    }
    return;
  }

  // Phase «act»
  if (ab.type === 'sprint' && ab.pt >= 1.0) {
    const sp = Math.hypot(boss.vx, boss.vy) || 1; boss.vx = boss.vx / sp * ab.spd0; boss.vy = boss.vy / sp * ab.spd0; abNext();
  } else if (ab.type === 'abtauchen') {
    bossAlpha = Math.min(1, 0.15 + ab.pt / 0.35);
    if (ab.pt >= 0.35) { bossAlpha = 1; abNext(); }
  } else if (ab.type === 'rudel') {
    ab.done = true; ab.phase = 'idle';                                           // nur einmal pro Level
  } else if (ab.type === 'puls') {
    const k = Math.min(1, ab.pt / 1.6), f = 1 + 0.7 * Math.sin(k * Math.PI);    // wächst auf das 1,7-Fache und wieder zurück
    boss.rad = ab.rad0 * f;
    if (k >= 1) { boss.rad = ab.rad0; abNext(); }
  } else if (ab.type === 'feuer') {
    const sp = (7 + Math.min(6, level * 0.3)) * S * 1.5;
    while (ab.n < 5 && ab.pt >= ab.n * 0.09) {
      shots.push({ x: boss.x, y: boss.y, vx: Math.cos(ab.ang) * sp, vy: Math.sin(ab.ang) * sp }); ab.n++;
      if (ab.n === 1) sfx('shoot');
    }
    if (ab.n >= 5) abNext();
  }
}
function abNext() { ab.phase = 'idle'; ab.pt = 0; ab.cd = abEvery() * (0.8 + Math.random() * 0.4); }

// Vorwarnungen auf das Spielfeld zeichnen (zeichnen.js; in der 3D-Ansicht liegen sie auf dem Brett)
function drawAbility() {
  if (!ab || state !== 'play') return;
  const boss = spiders.find(sp => sp.boss);
  if (!boss) return;
  const bx = boss.x * cell, by = boss.y * cell, rr = U * (boss.rad || 1) * 2.2 * bossScale();
  ctx.save();
  if (ab.phase === 'warn' && (ab.type === 'sprint' || ab.type === 'puls' || ab.type === 'rudel')) {
    const k = Math.sin(time * 30) * 0.5 + 0.5;                                  // flackernder Ring = «gleich passiert etwas»
    ctx.strokeStyle = ab.type === 'rudel' ? '#f08a3c' : '#ff3d6e'; ctx.lineWidth = Math.max(2, U * 0.25);
    ctx.globalAlpha = 0.5 + k * 0.5;
    ctx.beginPath(); ctx.arc(bx, by, rr * (1 + k * 0.15), 0, Math.PI * 2); ctx.stroke();
  }
  if (ab.type === 'abtauchen' && ab.phase === 'warn' && ab.spot) {             // Schatten, wo die Fledermaus auftaucht
    const sx = ab.spot[0] * cell, sy = ab.spot[1] * cell, k = Math.min(1, ab.pt / 0.8);
    ctx.globalAlpha = 0.25 + k * 0.45; ctx.fillStyle = '#1a0b2e';
    ctx.beginPath(); ctx.ellipse(sx, sy, rr * 0.9, rr * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a7ff'; ctx.lineWidth = Math.max(1.5, U * 0.15); ctx.setLineDash([U * 0.5, U * 0.4]); ctx.stroke();
  }
  if (ab.type === 'feuer' && ab.phase === 'warn') {                            // gestrichelte rote Linie = Richtung des Feuerstrahls
    const L = Math.hypot(cols, rows) * cell;
    ctx.strokeStyle = '#ff5a2a'; ctx.lineWidth = Math.max(2, U * 0.3); ctx.setLineDash([U * 0.9, U * 0.6]);
    ctx.globalAlpha = 0.45 + Math.sin(time * 25) * 0.25;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(ab.ang) * L, by + Math.sin(ab.ang) * L); ctx.stroke();
  }
  ctx.restore();
}
