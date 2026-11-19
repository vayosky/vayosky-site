// Space Slice · Effekte (v76): schwebende Punkte, Vibration, Wackeln bei Treffer, Boss-Vorstellung
// Die Punkte werden auf das 2D-Spielfeld gezeichnet. Die 3D-Ansicht legt dieses Feld als Bild auf das Brett,
// deshalb sind sie in beiden Ansichten zu sehen.
let floats = [];

// Nach einem Schnitt: «+315» steigt an der Stelle auf, wo die Linie geschlossen wurde
function fxPoints(x, y, pts, mega) {
  if (!(pts > 0)) return;
  const cx = Math.min(cols - 5 * S, Math.max(5 * S, x + 0.5)), cy = Math.min(rows - 3 * S, Math.max(4 * S, y - S));
  floats.push({ x: cx, y: cy, t0: time, txt: '+' + pts, col: mega ? '#ff9a3c' : '#ffd23f', big: mega ? 1.5 : 1 });
  if (floats.length > 6) floats.shift();
}

// Wird von drawField aufgerufen (Koordinaten in Feldern * cell, wie die Teilchen)
function drawFloats() {
  if (!floats.length) return;
  floats = floats.filter(f => time - f.t0 < 1.2);
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  for (const f of floats) {
    const a = time - f.t0, pop = a < 0.12 ? 0.7 + a / 0.12 * 0.4 : 1.1 - Math.min(0.1, a - 0.12);
    const fs = Math.round(Math.max(16, U * 1.6) * f.big * pop);
    ctx.globalAlpha = a > 0.8 ? Math.max(0, 1 - (a - 0.8) / 0.4) : 1;
    ctx.font = fs + 'px Bungee, "Arial Black", sans-serif';
    const px = f.x * cell, py = (f.y - a * 2 * S) * cell;
    ctx.lineWidth = Math.max(3, fs * 0.2); ctx.strokeStyle = 'rgba(8,12,28,.9)'; ctx.strokeText(f.txt, px, py);
    ctx.fillStyle = f.col; ctx.fillText(f.txt, px, py);
  }
  ctx.restore();
}

// Vibration (nur Android; das iPhone erlaubt es im Browser nicht). Aus, wenn der Ton aus ist.
const buzz = pattern => { try { if (!muted && navigator.vibrate) navigator.vibrate(pattern); } catch (err) {} };

// Treffer: Spielfeld wackelt kurz, Handy vibriert
function fxHit() {
  try {
    stage.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,3px)' }, { transform: 'translate(6px,-4px)' },
      { transform: 'translate(-4px,-2px)' }, { transform: 'translate(3px,3px)' }, { transform: 'translate(0,0)' }], { duration: 320 });
  } catch (err) {}
  buzz(160);
}

// Boss-Vorstellung beim Levelstart: Bild und Name gross, nach gut einer Sekunde ausgeblendet. Das Spiel laeuft dabei weiter.
let introT = 0;
function bossIntro(bt) {
  try {
    const box = el('bossIntro'), B = BOSS[bt];
    el('biImg').style.backgroundPosition = (bt % 6) * 20 + '% ' + Math.floor(bt / 6) * (100 / 3) + '%';
    el('biImg').style.filter = 'drop-shadow(0 0 18px ' + (SHOT_COL[bt] || '#ffd23f') + ')';
    el('biLvl').textContent = tr('Level ') + level + ' · BOSS';
    el('biName').textContent = tr(B.name);
    box.classList.remove('hidden', 'out'); void box.offsetWidth; box.classList.add('show');
    clearTimeout(introT);
    introT = setTimeout(() => { box.classList.add('out'); introT = setTimeout(() => box.classList.add('hidden'), 400); }, 1300);
  } catch (err) {}
}
