// Space Slice · Drehen, Startfenster, Pause, obere Leiste
// v60: Passt das Feld nicht zur Lage des Handys, kann der Spieler das Level im neuen Format neu starten
function checkRot() {
  const b = el('rotBtn'); if (!b) return;
  const land = stage.clientWidth > stage.clientHeight;
  const show = state === 'play' && !!grid && land !== (cols > rows);
  if (show) b.textContent = land ? tr('↻ Im Querformat neu starten') : tr('↻ Im Hochformat neu starten');
  b.classList.toggle('hidden', !show);
}
// v61: Sprachflaggen nur auf dem Startbildschirm (sonst ueberdecken sie den Titel)
// v62: Overlay zeigen; kurz keine Klicks annehmen, damit der Tipp zum Schliessen des Bildes nicht «Einstellungen» oeffnet
function showOv() {
  const o = el('overlay'); o.classList.remove('hidden'); flagsVis(); renderEnergy();
  o.style.pointerEvents = 'none'; clearTimeout(showOv.t);
  showOv.t = setTimeout(() => { o.style.pointerEvents = ''; }, 450);
}
function flagsVis() { const f = el('langFlags'); if (f) f.style.display = state === 'start' ? '' : 'none'; }
// v63: Pause – haelt Spiel, Boni-Zeiten und Musik an; automatisch, wenn das Handy die App verlaesst
let paused = false;
function canPause() { return state === 'play' && !(duel && duel.running); }
function setPause(on) {
  if (on && !canPause()) return;
  paused = on;
  if (on) { stopPlayer(); heldKey = null; }
  el('pauseOv').classList.toggle('hidden', !on);
  if (!on) { last = 0; player.canEnter = true; }
}
function pauseVis() { for (const id of ['pauseBtn', 'padPause']) { const b = el(id); if (b) b.classList.toggle('hidden', !canPause()); } if (paused && state !== 'play') setPause(false); }
function updateHud() {
  checkRot(); pauseVis();
  el('lvl').textContent = level;
  el('bar').style.width = Math.min(100, pct) + '%';
  el('pct').textContent = Math.floor(pct) + ' % / ' + goal() + ' %';
  el('goal').style.left = goal() + '%';
  const f = el('bFreeze'), s = el('bSpeed');
  f.classList.toggle('on', freezeT > 0); s.classList.toggle('on', speedT > 0);
  if (freezeT > 0) f.textContent = '❄ ' + Math.ceil(freezeT) + ' s';
  if (speedT > 0) s.textContent = '⚡ ' + Math.ceil(speedT) + ' s';
  const sh = el('bShield'); sh.classList.toggle('on', shieldT > 0);
  if (shieldT > 0) sh.textContent = '🛡 ' + Math.ceil(shieldT) + ' s';
  el('lives').textContent = '❤'.repeat(Math.max(0, lives));
  el('score').textContent = '★ ' + score;
  const run = !!(duel && duel.running), o = el('bOpp');
  o.classList.toggle('on', run);
  if (run) {
    o.textContent = tr('Gegner ') + oppPct + ' %';
    const v = Math.floor(pct);
    if (v !== duel.sent) { duel.sent = v; setP({ pct: v }); }
  }
}

