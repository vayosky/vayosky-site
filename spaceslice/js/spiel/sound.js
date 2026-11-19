// Space Slice · Töne, Musik, Ton aus, Vollbild
/* ---------- Sound (im Geraet erzeugte Toene, keine Dateien) ---------- */
let ac = null, muted = false;
try { muted = localStorage.getItem('mute') === '1'; } catch (err) {}
function initAudio() {
  try {
    if (!ac) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { ac = new AC(); setInterval(musicTick, 90); } }
    if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
  } catch (err) { ac = null; }
}
function tone(f, at, dur, type, vol, f2) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
  o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol || 0.07, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.03);
}
function sfx(name) {
  if (muted || !ac) return;
  try {
    if (name === 'close') { tone(330, 0, 0.09); tone(494, 0.07, 0.12); }
    else if (name === 'coin') { tone(988, 0, 0.07, 'square', 0.05); tone(1319, 0.07, 0.16, 'square', 0.05); }
    else if (name === 'bonus') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.07, 0.14, 'triangle', 0.1)); }
    else if (name === 'catch') { tone(220, 0, 0.1, 'sawtooth', 0.07, 660); tone(880, 0.1, 0.18, 'square', 0.05); }
    else if (name === 'hit') { tone(200, 0, 0.35, 'sawtooth', 0.12, 50); }
    else if (name === 'win') { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.11)); }
    else if (name === 'over') { [392, 330, 262, 196].forEach((f, i) => tone(f, i * 0.18, 0.3, 'triangle', 0.11)); }
    else if (name === 'shoot') { tone(760, 0, 0.09, 'square', 0.035, 280); }
    else if (name === 'start') { tone(392, 0, 0.1, 'triangle', 0.09); tone(587, 0.1, 0.16, 'triangle', 0.09); }
  } catch (err) {}
}
/* ---------- Hintergrundmusik: eigene kleine Arcade-Schleife, im Geraet erzeugt ---------- */
let musicOn = true, mStep = 0, mNext = 0;
try { musicOn = localStorage.getItem('music') !== '0'; } catch (err) {}
const CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]];
const ARP = [0, 1, 2, 1, 0, 2, 1, 2, 0, 1, 2, 1, 2, 1, 0, 1];
const TUNE = [2, -1, -1, 1, -1, 2, -1, -1, 0, -1, 1, -1, 2, -1, 1, -1];
// Gemeinfreie klassische Melodien als [Ton (MIDI-Nummer, 0 = Pause), Laenge in Sechzehnteln]
const ODE_A = [[64,4],[64,4],[65,4],[67,4],[67,4],[65,4],[64,4],[62,4],[60,4],[60,4],[62,4],[64,4]];
const ELISE_A = [[76,1],[75,1],[76,1],[75,1],[76,1],[71,1],[74,1],[72,1],[69,2],[0,1],[60,1],[64,1],[69,1],[71,2],[0,1],[64,1],[68,1],[71,1],[72,2],[0,1],[64,1],
                 [76,1],[75,1],[76,1],[75,1],[76,1],[71,1],[74,1],[72,1],[69,2],[0,1],[60,1],[64,1],[69,1],[71,2],[0,1],[64,1],[72,1],[71,1],[69,4],[0,2]];
const SONGS = {
  ode: { step: 0.125, n: [].concat(ODE_A, [[64,6],[62,2],[62,8]], ODE_A, [[62,6],[60,2],[60,8]],
    [[62,4],[62,4],[64,4],[60,4],[62,4],[64,2],[65,2],[64,4],[60,4],[62,4],[64,2],[65,2],[64,4],[62,4],[60,4],[62,4],[55,8]],
    ODE_A, [[62,6],[60,2],[60,8],[0,8]]) },
  elise: { step: 0.17, n: [].concat(ELISE_A, ELISE_A,
    [[71,1],[72,1],[74,1],[76,3],[67,1],[77,1],[76,1],[74,3],[65,1],[76,1],[74,1],[72,3],[64,1],[74,1],[72,1],[71,2],[0,1],[64,1],[76,1],[0,1]]) },
  marsch: { step: 0.115, n: [[71,1],[69,1],[68,1],[69,1],[72,2],[0,2],[74,1],[72,1],[71,1],[72,1],[76,2],[0,2],[77,1],[76,1],[75,1],[76,1],
    [83,1],[81,1],[80,1],[81,1],[83,1],[81,1],[80,1],[81,1],[84,4],[81,2],[84,2],
    [83,2],[81,2],[79,2],[81,2],[83,2],[81,2],[79,2],[81,2],[83,2],[81,2],[79,2],[78,2],[76,4],[0,4]] },
  berg: { step: 0.14, faster: true, n: [[59,2],[61,2],[62,2],[64,2],[66,2],[62,2],[66,4],[65,2],[61,2],[65,4],[64,2],[60,2],[64,4],
    [59,2],[61,2],[62,2],[64,2],[66,2],[62,2],[66,2],[71,2],[69,2],[66,2],[62,2],[66,2],[69,8]] }
};
const AUTO = ['ode', 'elise', 'marsch', 'berg'];
let tuneSel = 'auto', curSong = '', mIdx = 0, mLoops = 0;
try { tuneSel = localStorage.getItem('tune') || 'auto'; } catch (err) {}
// v66: gegen Levelende (noch 15 % bis zum Ziel) etwa 10 % schneller, mit nur einem Leben weitere 5 %; sanfter Uebergang
let mTf = 1;
function musicTick() {
  if (!ac || muted || !musicOn || state !== 'play' || paused || ac.state !== 'running') { mNext = 0; mTf = 1; return; }
  const tfWant = 1 + (pct >= goal() - 15 ? 0.1 : 0) + (lives === 1 ? 0.05 : 0);
  mTf += Math.max(-0.01, Math.min(0.004, tfWant - mTf));
  if (mNext < ac.currentTime) mNext = ac.currentTime + 0.05;
  const want = tuneSel === 'auto' ? AUTO[(level - 1) % AUTO.length] : tuneSel;
  if (want !== curSong) { curSong = want; mIdx = 0; mLoops = 0; mStep = 0; }
  try {
    if (curSong === 'arcade') {
      const stepLen = 0.17 / mTf;
      while (mNext < ac.currentTime + 0.3) {
        const st = mStep % 16, bar = Math.floor(mStep / 16) % 4, ch = CHORDS[bar], at = mNext - ac.currentTime;
        if (st % 8 === 0) tone(ch[0] / 2, at, stepLen * 5, 'sine', 0.09);
        if (st % 2 === 0) tone(ch[ARP[st]] * 2, at, stepLen * 1.8, 'triangle', 0.03);
        if (TUNE[st] >= 0 && st % 4 === 0 && Math.floor(mStep / 64) % 2 === 1) tone(ch[TUNE[st]] * 4, at, stepLen * 3, 'sine', 0.022);
        mNext += stepLen; mStep++;
      }
      return;
    }
    const sg = SONGS[curSong] || SONGS.ode;
    // "Bergkoenig" wird wie im Original von Runde zu Runde etwas schneller, dann beginnt es wieder ruhig
    const step = (sg.faster ? Math.max(0.085, sg.step * Math.pow(0.93, mLoops % 8)) : sg.step) / mTf;
    while (mNext < ac.currentTime + 0.3) {
      const nt = sg.n[mIdx], len = nt[1] * step;
      if (nt[0]) tone(440 * Math.pow(2, (nt[0] - 69) / 12), mNext - ac.currentTime, Math.min(len * 0.92, 0.9), 'triangle', 0.05);
      mNext += len; mIdx++;
      if (mIdx >= sg.n.length) { mIdx = 0; mLoops++; }
    }
  } catch (err) {}
}
function setMusic(on) {
  musicOn = on; el('music').classList.toggle('off', !on);
  try { localStorage.setItem('music', on ? '1' : '0'); } catch (err) {}
}
setMusic(musicOn);
el('tune').value = tuneSel;
if (el('tune').value !== tuneSel) { tuneSel = 'auto'; el('tune').value = 'auto'; }
el('tune').addEventListener('change', e => { tuneSel = e.target.value; try { localStorage.setItem('tune', tuneSel); } catch (err) {} });
el('music').addEventListener('click', () => { setMusic(!musicOn); initAudio(); });
el('music').addEventListener('pointerdown', e => e.stopPropagation());

function setMute(m) {
  muted = m; el('mute').textContent = m ? '🔇' : '🔊';
  try { localStorage.setItem('mute', m ? '1' : '0'); } catch (err) {}
}
setMute(muted);
// Vollbild: blendet Browser- und App-Leisten aus (nicht ueberall erlaubt, z. B. nicht auf dem iPhone)
let toastT = 0;
function toast(t) { const e = el('toast'); e.textContent = t; e.classList.remove('hidden'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.add('hidden'), 3500); }
el('fs').addEventListener('click', () => {
  const d = document, r = d.documentElement;
  try {
    if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    const f = r.requestFullscreen || r.webkitRequestFullscreen;
    if (!f) { toast('Vollbild geht hier nicht. Tipp: im Browser «Zum Startbildschirm hinzufügen».'); return; }
    const pr = f.call(r);
    if (pr && pr.catch) pr.catch(() => toast('Vollbild wurde blockiert. Öffne das Spiel in Chrome und versuche es dort.'));
  } catch (err) { toast('Vollbild wurde blockiert. Öffne das Spiel in Chrome und versuche es dort.'); }
});
el('fs').addEventListener('pointerdown', e => e.stopPropagation());
// iPhone haelt den Ton nach App-Wechsel oder Sperrbildschirm an: bei jedem Tippen wieder aufwecken
['pointerup', 'touchend', 'click'].forEach(ev => window.addEventListener(ev, () => {
  if (ac && ac.state !== 'running') { try { ac.resume().catch(() => {}); } catch (err) {} }
}));
el('mute').addEventListener('click', () => { setMute(!muted); initAudio(); sfx('coin'); });
el('mute').addEventListener('pointerdown', e => e.stopPropagation());

