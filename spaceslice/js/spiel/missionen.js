// Space Slice · Missionen, Galaxie-Flug, Bild ansehen
/* ---------- Missionen: je 3 Level, danach Flug in die naechste Galaxie ---------- */
const MISSION_LEN = 3;
// Reiseziele [Motiv-Nummer im Weltraum-Bogen, Name] – Namen sind Platzhalter
const DEST = [[3, tr('Blauer Ringplanet')], [9, tr('Roter Planet')], [6, tr('Violetter Planet')], [16, tr('Grüner Ringplanet')], [13, tr('Kristallplanet')],
              [4, tr('Sonnenstern')], [14, tr('Raumstation')], [12, tr('Schwarzes Loch')], [11, tr('Spiralnebel')]];
const missionOf = lv => Math.ceil(lv / MISSION_LEN);
const destOf = m => DEST[(m - 1) % DEST.length];
function refreshMission() {
  const lv = state === 'won' ? level + 1 : level, m = missionOf(lv);
  const eb = el('eyebrow');
  if (eb) eb.textContent = tr('Mission ') + m + tr(' · Galaxie ') + m + ' · Level ' + ((lv - 1) % MISSION_LEN + 1) + tr(' von ') + MISSION_LEN;
}
const travel = { on: false, t: 0, m: 1, stars: [] };
let pendingTravel = 0;
function startTravel(m) {
  travel.on = true; travel.t = 0; travel.m = m; travel.stars = [];
  for (let i = 0; i < 140; i++) travel.stars.push({ a: Math.random() * Math.PI * 2, d: Math.random(), v: 0.25 + Math.random() * 0.9 });
  const cv2 = el('tc'), dpr = window.devicePixelRatio || 1;
  cv2.width = Math.round(window.innerWidth * dpr); cv2.height = Math.round(window.innerHeight * dpr);
  el('tA').textContent = tr('Mission ') + m + tr(' geschafft!'); el('tB').textContent = tr('+5 Münzen'); el('tC').textContent = '';
  el('travel').classList.remove('hidden');
}
function endTravel(showOverlay) {
  if (!travel.on) return;
  travel.on = false; el('travel').classList.add('hidden');
  if (showOverlay) showOv();
}
function travelFrame(dt) {
  travel.t += dt;
  const t = travel.t, cv2 = el('tc'), g = cv2.getContext('2d'), W = cv2.width, H = cv2.height, R = Math.hypot(W, H) / 2, TAU = Math.PI * 2;
  const warp = t < 1.2 ? 0.15 : t < 3.6 ? Math.min(1, (t - 1.2) / 0.6) : Math.max(0.12, 1 - (t - 3.6) / 0.8);
  g.fillStyle = 'rgba(5,3,15,' + (0.9 - warp * 0.55) + ')'; g.fillRect(0, 0, W, H);
  const hue = (travel.m * 47 + 237) % 360;                // Farbe der Zielgalaxie
  if (t > 3.2) { const gl = g.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, R); gl.addColorStop(0, 'hsla(' + hue + ',70%,45%,' + Math.min(0.5, (t - 3.2) * 0.4) + ')'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(0, 0, W, H); }
  g.lineCap = 'round';
  for (const st of travel.stars) {
    const d0 = st.d; st.d += st.v * dt * (0.08 + warp * 1.6);
    if (st.d > 1) { st.d = 0.02; st.a = Math.random() * TAU; continue; }
    const c = Math.cos(st.a), sn = Math.sin(st.a), len = 0.004 + warp * 0.05 * st.v;
    g.strokeStyle = 'rgba(255,255,255,' + Math.min(1, 0.25 + st.d) + ')'; g.lineWidth = Math.max(1, W * 0.0035 * (0.4 + st.d));
    g.beginPath(); g.moveTo(W / 2 + c * (d0 - len) * R, H * 0.42 + sn * (d0 - len) * R); g.lineTo(W / 2 + c * st.d * R, H * 0.42 + sn * st.d * R); g.stroke();
  }
  const spr = (k, x, y, size, rot) => {
    g.save(); g.translate(x, y); if (rot) g.rotate(rot);
    if (ICONS.ok) g.drawImage(ICONS.img, (k % 5) * 256, Math.floor(k / 5) * 256, 256, 256, -size / 2, -size / 2, size, size);
    else { g.fillStyle = k === 0 ? '#f4f6fb' : 'hsl(' + hue + ',60%,55%)'; g.beginPath(); g.arc(0, 0, size * 0.35, 0, TAU); g.fill(); }
    g.restore();
  };
  const [dk, dname] = destOf(travel.m), base = Math.min(W, H);
  if (t > 3.4) { const k = Math.min(1, (t - 3.4) / 1.8), ease = 1 - Math.pow(1 - k, 3); spr(dk, W / 2, H * 0.42, base * (0.06 + ease * 0.62), 0); }
  const shake = warp > 0.5 ? (Math.random() - 0.5) * base * 0.012 : 0, lift = t > 3.6 ? Math.min(1, (t - 3.6) / 1.6) : 0;
  spr(0, W / 2 + shake, H * (0.76 - lift * 0.12) + shake, base * (0.3 - lift * 0.12), -Math.PI / 4);
  if (t > 1.2 && t < 3.4) { el('tA').textContent = tr('Flug in Galaxie ') + (travel.m + 1); el('tB').textContent = ''; }
  else if (t >= 3.4) {
    if (el('tB').textContent === '') sfx('bonus');
    el('tA').textContent = tr('Galaxie ') + (travel.m + 1) + tr(' erreicht'); el('tB').textContent = tr('Anflug auf: ') + dname;
    if (t > 5.2) el('tC').textContent = tr('Tippe, um zu landen und weiterzuspielen.');
  }
}
const tapTravel = e => { if (travel.on && travel.t > 1.5) { if (e && e.stopPropagation) e.stopPropagation(); endTravel(true); } };
el('travel').addEventListener('pointerup', tapTravel);
window.addEventListener('keydown', tapTravel);

let picShownAt = 0;
function closePicture() {
  if (!picShownAt || performance.now() - picShownAt < 700) return;   // kurze Sperre, damit das Loslassen des letzten Zugs nicht zaehlt
  picShownAt = 0;
  el('picHint').classList.add('hidden');
  if (pendingTravel) { const m = pendingTravel; pendingTravel = 0; startTravel(m); }
  else showOv();
}
window.addEventListener('pointerup', closePicture);
window.addEventListener('keydown', closePicture);

