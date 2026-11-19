// Space Slice · Bild einpassen, Deckbild, gezeichnete Ersatzszenen
/* ---------- Bilder ---------- */
// Bild ins Feld setzen. Passt die Form ungefaehr, fuellt es das Feld. Sonst wird das GANZE Bild gezeigt
// und der Rest mit demselben Bild, gross und abgedunkelt, aufgefuellt (kein abgeschnittenes Motiv).
function fitImage(img, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), iw = img.width, ih = img.height;
  const cover = Math.max(W / iw, H / ih), contain = Math.min(W / iw, H / ih);
  g.drawImage(img, (W - iw * cover) / 2, (H - ih * cover) / 2, iw * cover, ih * cover);
  if (contain / cover >= 0.86) return c;                  // weniger als ca. 14 % wuerden abgeschnitten: fuellen
  g.fillStyle = 'rgba(5,8,28,.62)'; g.fillRect(0, 0, W, H);
  const w = iw * contain, h = ih * contain, x = (W - w) / 2, y = (H - h) / 2;
  g.drawImage(img, x, y, w, h);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = Math.max(3, Math.min(W, H) * 0.006); g.strokeRect(x, y, w, h);
  return c;
}

// Weltraum-Motive: nur noch fuer den Galaxie-Flug (Rakete, Planeten)
const ICONS = { img: null, ok: false };
try { ICONS.img = new Image(); ICONS.img.onload = () => { ICONS.ok = true; }; ICONS.img.src = 'img/weltraum.png'; } catch (err) {}
// Deckbild (Vorderseite): Nachthimmel in der Farbe des Bosses, darauf gross seine dunkle Silhouette
function makeCover(W, H, lv) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), TAU = Math.PI * 2, bt = BOSS_ORDER[(lv - 1) % BOSS_ORDER.length];
  const col = SHOT_COL[bt] || '#3fa9f5';
  const rgb = [1, 3, 5].map(i => parseInt(col.slice(i, i + 2), 16));
  const mix = (k, a) => 'rgba(' + rgb.map(v => Math.round(v * k + 8 * (1 - k))).join(',') + ',' + a + ')';
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, mix(0.10, 1)); gr.addColorStop(0.6, mix(0.20, 1)); gr.addColorStop(1, mix(0.32, 1));
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.6);
  glow.addColorStop(0, mix(0.55, 0.35)); glow.addColorStop(1, mix(0.2, 0)); g.fillStyle = glow; g.fillRect(0, 0, W, H);
  // v68: feines Raster, zwei Nebelwolken und farbige Sterne (einmal pro Level gezeichnet)
  g.strokeStyle = mix(0.7, 0.10); g.lineWidth = Math.max(1, W * 0.0016);
  const stp = Math.max(24, Math.round(W / 16));
  g.beginPath();
  for (let x = stp / 2; x <= W; x += stp) { g.moveTo(x, 0); g.lineTo(x, H); }
  for (let y = stp / 2; y <= H; y += stp) { g.moveTo(0, y); g.lineTo(W, y); }
  g.stroke();
  for (const [nx, ny, nr, na] of [[0.22, 0.25, 0.4, 0.22], [0.8, 0.72, 0.45, 0.18]]) {
    const ng = g.createRadialGradient(W * nx, H * ny, 0, W * nx, H * ny, Math.max(W, H) * nr);
    ng.addColorStop(0, mix(0.9, na)); ng.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ng; g.fillRect(0, 0, W, H);
  }
  for (let i = 0; i < 140; i++) {
    g.fillStyle = i % 9 === 0 ? 'rgba(127,232,255,.9)' : i % 13 === 0 ? 'rgba(255,210,63,.9)' : 'rgba(255,255,255,' + (0.25 + Math.random() * 0.6) + ')';
    g.beginPath(); g.arc(Math.random() * W, Math.random() * H, W * (0.0012 + Math.random() * 0.0028), 0, TAU); g.fill();
  }
  if (BSHEET.ok) {
    const sz = Math.min(W, H) * 0.86, t = document.createElement('canvas'); t.width = t.height = 192;
    const tg = t.getContext('2d');
    tg.drawImage(BSHEET.img, (bt % 6) * 192, Math.floor(bt / 6) * 192, 192, 192, 0, 0, 192, 192);
    tg.globalCompositeOperation = 'source-in'; tg.fillStyle = mix(0.08, 1); tg.fillRect(0, 0, 192, 192);
    g.save(); g.shadowColor = col; g.shadowBlur = sz * 0.04; g.globalAlpha = 0.9;
    g.drawImage(t, (W - sz) / 2, H * 0.45 - sz / 2, sz, sz); g.restore();
  }
  return c;
}

function makeScene(n, W, H) {
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'), TAU = Math.PI * 2;
  const grad = (y0, y1, stops) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    stops.forEach((s, i) => gr.addColorStop(i / (stops.length - 1), s));
    return gr;
  };
  const hills = (base, amp, col, seed) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
    for (let i = 0; i <= 60; i++) {
      const x = W * i / 60;
      g.lineTo(x, base - amp * (0.5 + 0.5 * Math.sin(x / W * 8 + seed) + 0.3 * Math.sin(x / W * 19 + seed * 2)));
    }
    g.lineTo(W, H); g.closePath(); g.fill();
  };
  const disc = (x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
  if (n === 0) {            // Sonnenuntergang in den Bergen
    g.fillStyle = grad(0, H, ['#2b1b5a', '#b3406b', '#ff8a3c', '#ffd27a']); g.fillRect(0, 0, W, H);
    disc(W * 0.5, H * 0.5, W * 0.2, 'rgba(255,240,190,.35)'); disc(W * 0.5, H * 0.5, W * 0.13, '#fff3c4');
    hills(H * 0.6, H * 0.14, '#8a3d74', 1); hills(H * 0.72, H * 0.13, '#57275f', 2.5); hills(H * 0.88, H * 0.11, '#26133a', 4);
  } else if (n === 1) {     // Insel im Meer
    g.fillStyle = grad(0, H * 0.55, ['#3fa9f5', '#bfe9ff']); g.fillRect(0, 0, W, H * 0.55);
    disc(W * 0.78, H * 0.13, W * 0.09, '#fff6a8');
    for (const [cx, cy, s] of [[0.22, 0.14, 1], [0.55, 0.26, 0.8], [0.85, 0.36, 0.6]]) {
      for (const [ox, r] of [[-0.07, 0.045], [0, 0.065], [0.07, 0.05]]) disc(W * (cx + ox * s), H * cy, W * r * s, '#ffffff');
    }
    g.fillStyle = grad(H * 0.55, H, ['#1e88c9', '#0b3f73']); g.fillRect(0, H * 0.55, W, H * 0.45);
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = W * 0.006;
    for (let i = 0; i < 9; i++) {
      const y = H * (0.6 + i * 0.045), x = W * ((i * 0.37) % 0.8);
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + W * 0.06, y - H * 0.008, x + W * 0.12, y); g.stroke();
    }
    g.fillStyle = '#f2d48a'; g.beginPath(); g.ellipse(W * 0.35, H * 0.62, W * 0.28, H * 0.05, 0, Math.PI, TAU); g.fill();
    g.strokeStyle = '#7a4a21'; g.lineWidth = W * 0.022; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * 0.33, H * 0.6); g.quadraticCurveTo(W * 0.3, H * 0.47, W * 0.38, H * 0.36); g.stroke();
    g.strokeStyle = '#2f9e44'; g.lineWidth = W * 0.02;
    for (let a = 0; a < 7; a++) {
      const an = -Math.PI + a * Math.PI / 6;
      g.beginPath(); g.moveTo(W * 0.38, H * 0.36);
      g.quadraticCurveTo(W * 0.38 + Math.cos(an) * W * 0.12, H * 0.36 + Math.sin(an) * H * 0.09 - H * 0.03,
                         W * 0.38 + Math.cos(an) * W * 0.2, H * 0.36 + Math.sin(an) * H * 0.07 + H * 0.04);
      g.stroke();
    }
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(W * 0.76, H * 0.66); g.lineTo(W * 0.76, H * 0.76); g.lineTo(W * 0.88, H * 0.76); g.closePath(); g.fill();
    g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(W * 0.68, H * 0.77); g.lineTo(W * 0.92, H * 0.77); g.lineTo(W * 0.88, H * 0.8); g.lineTo(W * 0.72, H * 0.8); g.closePath(); g.fill();
  } else if (n === 2) {     // Stadt bei Nacht
    g.fillStyle = grad(0, H, ['#070b24', '#1b2a6b', '#4a3f8f']); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) disc(Math.random() * W, Math.random() * H * 0.6, W * (0.002 + Math.random() * 0.003), 'rgba(255,255,255,.85)');
    disc(W * 0.72, H * 0.16, W * 0.1, '#f6f1d5'); disc(W * 0.76, H * 0.145, W * 0.085, '#131c52');
    let x = 0;
    while (x < W) {
      const bw = W * (0.08 + Math.random() * 0.09), bh = H * (0.18 + Math.random() * 0.38);
      g.fillStyle = ['#0c1030', '#141a45', '#0f1538'][Math.floor(Math.random() * 3)];
      g.fillRect(x, H - bh, bw, bh);
      const ww = bw / 7, wh = ww * 1.2;
      for (let wy = H - bh + wh; wy < H - wh * 2; wy += wh * 2) for (let wx = x + ww; wx < x + bw - ww; wx += ww * 2) {
        if (Math.random() < 0.55) { g.fillStyle = Math.random() < 0.8 ? '#ffd86b' : '#9fd8ff'; g.fillRect(wx, wy, ww, wh); }
      }
      x += bw + W * 0.008;
    }
  } else if (n === 3) {     // Weltraum
    g.fillStyle = grad(0, H, ['#05030f', '#1a1040', '#3a1d5c']); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 140; i++) disc(Math.random() * W, Math.random() * H, W * (0.0015 + Math.random() * 0.003), 'rgba(255,255,255,.9)');
    const px = W * 0.58, py = H * 0.42, pr = W * 0.26;
    disc(px, py, pr, '#e8a04c');
    g.save(); g.beginPath(); g.arc(px, py, pr, 0, TAU); g.clip();
    g.fillStyle = 'rgba(150,70,35,.4)';
    for (const [o, t] of [[-0.6, 0.12], [-0.25, 0.2], [0.2, 0.1], [0.5, 0.18]]) g.fillRect(px - pr, py + pr * o, pr * 2, pr * t);
    g.restore();
    g.strokeStyle = 'rgba(255,232,190,.85)'; g.lineWidth = W * 0.028;
    g.beginPath(); g.ellipse(px, py, W * 0.42, W * 0.085, -0.35, 0, TAU); g.stroke();
    disc(W * 0.2, H * 0.78, W * 0.09, '#cfd6e6');
    disc(W * 0.17, H * 0.765, W * 0.02, '#aab3c8'); disc(W * 0.23, H * 0.8, W * 0.027, '#aab3c8'); disc(W * 0.2, H * 0.74, W * 0.012, '#aab3c8');
    disc(W * 0.84, H * 0.86, W * 0.05, '#5ac8c8'); disc(W * 0.12, H * 0.14, W * 0.035, '#e5484d');
  } else if (n === 4) {     // Wiese mit Regenbogen
    g.fillStyle = grad(0, H, ['#58b7ff', '#d4f1ff']); g.fillRect(0, 0, W, H);
    ['#e5484d', '#ff9a3c', '#ffd23f', '#4fae4a', '#3fa9f5', '#7a5cd6'].forEach((col, i) => {
      g.strokeStyle = col; g.lineWidth = W * 0.032;
      g.beginPath(); g.arc(W * 0.5, H * 0.64, W * (0.56 - i * 0.03), Math.PI, TAU); g.stroke();
    });
    disc(W * 0.15, H * 0.1, W * 0.08, '#fff2a0');
    hills(H * 0.64, H * 0.1, '#7ccf6b', 1.3); hills(H * 0.77, H * 0.1, '#4fae4a', 3); hills(H * 0.92, H * 0.08, '#2f8c3a', 5);
    const fc = ['#ffffff', '#ffd23f', '#ff8fa3', '#e5484d', '#c9a7ff'];
    for (let i = 0; i < 45; i++) disc(Math.random() * W, H * (0.74 + Math.random() * 0.25), W * 0.012, fc[i % fc.length]);
  } else {                  // Wueste mit Pyramiden
    g.fillStyle = grad(0, H, ['#ff9d3c', '#ffd596', '#fff1d0']); g.fillRect(0, 0, W, H);
    disc(W * 0.76, H * 0.18, W * 0.1, '#fff8d6');
    hills(H * 0.6, H * 0.05, '#e9c183', 2);
    const pyr = (cx, by, w, h) => {
      g.fillStyle = '#e3b064'; g.beginPath(); g.moveTo(cx - w / 2, by); g.lineTo(cx, by - h); g.lineTo(cx + w * 0.15, by); g.closePath(); g.fill();
      g.fillStyle = '#b98342'; g.beginPath(); g.moveTo(cx + w * 0.15, by); g.lineTo(cx, by - h); g.lineTo(cx + w / 2, by); g.closePath(); g.fill();
    };
    pyr(W * 0.34, H * 0.7, W * 0.56, H * 0.27); pyr(W * 0.74, H * 0.71, W * 0.38, H * 0.18);
    hills(H * 0.8, H * 0.08, '#d99a4e', 4); hills(H * 0.94, H * 0.08, '#b97a35', 6);
    g.strokeStyle = '#2f7d3b'; g.lineWidth = W * 0.035; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(W * 0.14, H * 0.92); g.lineTo(W * 0.14, H * 0.72); g.stroke();
    g.lineWidth = W * 0.025;
    g.beginPath(); g.moveTo(W * 0.14, H * 0.84); g.lineTo(W * 0.07, H * 0.84); g.lineTo(W * 0.07, H * 0.78); g.stroke();
    g.beginPath(); g.moveTo(W * 0.14, H * 0.8); g.lineTo(W * 0.21, H * 0.8); g.lineTo(W * 0.21, H * 0.75); g.stroke();
  }
  return c;
}

