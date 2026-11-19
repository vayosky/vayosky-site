// Space Slice · Joystick, Tasten, Einstellungen
/* ---------- Steuerung ---------- */
const setWant = (dx, dy) => { if (state === 'play' && !paused) player.want = [dx, dy]; };
let ptr = null;
const base = el('base'), knob = el('knob');
function ptrStart(e, joy) {
  // Mittelpunkt ist dort, wo der Daumen aufsetzt (nicht die Mitte des Kreises)
  ptr = { ox: e.clientX, oy: e.clientY, joy, id: e.pointerId };
  if (state === 'play') player.canEnter = true;
  ptrMove(e);
}
function ptrMove(e) {
  if (!ptr || e.pointerId !== ptr.id) return;
  const dx = e.clientX - ptr.ox, dy = e.clientY - ptr.oy, d = Math.hypot(dx, dy);
  const DEAD = 3, REACH = 14;   // kleine Totzone, kurzer Weg bis zum Richtungswechsel
  if (ptr.joy) {
    const k = d ? Math.min(d, REACH) / d * (base.clientWidth * 0.28 / REACH) : 0;
    knob.style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)';
  }
  if (d < DEAD) {          // Mitte: anhalten und neu ansetzen
    if (ptr.joy && state === 'play') { if (player.dir) stopPlayer(); player.canEnter = true; }
    return;
  }
  if (Math.abs(dx) > Math.abs(dy)) setWant(Math.sign(dx), 0); else setWant(0, Math.sign(dy));
  if (d > REACH) { ptr.ox = e.clientX - dx / d * REACH; ptr.oy = e.clientY - dy / d * REACH; }
}
const endPtr = e => {
  if (!ptr || (e.pointerId !== undefined && e.pointerId !== ptr.id)) return;
  if (state === 'play') stopPlayer();
  knob.style.transform = ''; ptr = null;
};
stage.addEventListener('pointerdown', e => ptrStart(e, false));
el('pad').addEventListener('pointerdown', e => ptrStart(e, true));
window.addEventListener('pointermove', ptrMove);
window.addEventListener('pointerup', endPtr);
window.addEventListener('pointercancel', endPtr);
let heldKey = null;
window.addEventListener('keydown', e => {
  const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
              a: [-1, 0], d: [1, 0], w: [0, -1], s: [0, 1] }[e.key];
  if (k) {
    if (state === 'play' && !e.repeat && !player.dir) player.canEnter = true;
    setWant(k[0], k[1]); heldKey = e.key; e.preventDefault();
  }
});
window.addEventListener('keyup', e => {
  if (e.key === heldKey) { heldKey = null; if (state === 'play') stopPlayer(); }
});
document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.card, .sv-body')) e.preventDefault(); }, { passive: false });

el('oBtn').addEventListener('click', () => {
  if (replay) {
    if (state === 'won') { endReplay(); return; }
    if (state === 'over') { startReplay(level - 1); return; }
  }
  tickEnergy(); if (energy <= 0) { renderEnergy(); return; }
  initAudio(); sfx('start');
  if (pickedLevel) { level = pickedLevel; lives = 3; score = 0; }    // im Startfenster gewaehltes Level
  else if (state === 'won') level++; else { lives = 3; score = 0; }
  pickedLevel = 0;
  if (duel) { duel = null; setP({ duelId: null, dState: null, fin: null, out: null }); }
  startLevel();
});
el('oBtn').addEventListener('pointerdown', e => e.stopPropagation());
let skin = 'plane';
const SKINS = ['plane', 'rocket', 'snake', 'otter'];
function setSkin(k) {
  skin = 'rocket';
  SKINS.forEach(nm => el('sk_' + nm).classList.toggle('on', nm === skin));
  try { localStorage.setItem('skin', skin); } catch (err) {}
}
try { skin = localStorage.getItem('skin') || 'plane'; } catch (err) {}
setSkin(skin);
SKINS.forEach(nm => el('sk_' + nm).addEventListener('click', () => setSkin(nm)));

// Platz des Joysticks: links, Mitte oder rechts. Im Querformat gibt es nur links und rechts (Mitte zaehlt als rechts).
function setJoy(pos) {
  if (pos !== 'left' && pos !== 'mid') pos = 'right';
  const app = el('app');
  app.classList.toggle('joy-left', pos === 'left');
  app.classList.toggle('joy-p-left', pos === 'left'); app.classList.toggle('joy-p-right', pos === 'right');
  el('joyL').classList.toggle('on', pos === 'left'); el('joyM').classList.toggle('on', pos === 'mid'); el('joyR').classList.toggle('on', pos === 'right');
  try { localStorage.setItem('joyPos', pos); } catch (err) {}
  if (grid) fitCanvas();
}
let joyPos = '';
try { joyPos = localStorage.getItem('joyPos') || ''; } catch (err) {}
// Ohne gespeicherte Wahl: am Handy in der Mitte, am Tablet rechts
if (!joyPos) { try { joyPos = Math.min(window.innerWidth, window.innerHeight) >= 600 ? 'right' : 'mid'; } catch (err) { joyPos = 'mid'; } }
setJoy(joyPos);
el('joyL').addEventListener('click', () => setJoy('left'));
el('joyM').addEventListener('click', () => setJoy('mid'));
el('joyR').addEventListener('click', () => setJoy('right'));
el('file').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const img = new Image();
  img.onload = () => { userImg = img; el('pickInfo').textContent = tr('Eigenes Bild gewählt ✓'); };
  img.onerror = () => { el('pickInfo').textContent = tr('Bild konnte nicht geladen werden.'); };
  img.src = URL.createObjectURL(f);
});
let rsT = 0;
window.addEventListener('resize', () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => {
    if (!grid) return;
    // v59: Beim Drehen bleibt das Spielfeld erhalten und wird nur neu eingepasst (kein Neustart des Levels)
    fitCanvas(); checkRot();
  }, 150);
});


