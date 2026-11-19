// Space Slice · Spielfeld und Figuren zeichnen, Spielschleife
/* ---------- Zeichnen ---------- */
function drawBoss(s) {
  if (BSHEET.ok) {                 // Pixel-Sprite mit leuchtendem Rand in der Farbe seiner Geschosse
    const frozen = freezeT > 0, size = U * (s.rad || 1) * 4.6 * bossScale(), bob = frozen ? 0 : Math.sin(time * 5) * U * 0.08;
    ctx.save(); ctx.translate(s.x * cell, s.y * cell + bob);
    if (s.vx < 0) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.shadowColor = frozen ? '#6cc4ff' : SHOT_COL[bossType]; ctx.shadowBlur = U * (0.7 + (frozen ? 0 : Math.sin(time * 6) * 0.25));
    if (frozen) ctx.globalAlpha = 0.65;
    ctx.drawImage(BSHEET.img, (bossType % 6) * 192, Math.floor(bossType / 6) * 192, 192, 192, -size / 2, -size / 2, size, size);
    ctx.restore(); ctx.imageSmoothingEnabled = true;
    return;
  }
  const frozen = freezeT > 0, R = U * (s.rad || 0.8) * 1.2 * bossScale(), TAU = Math.PI * 2;
  const col = c => frozen ? '#6cc4ff' : c, dark = c => frozen ? '#3f8fc7' : c, out = '#0b1220';
  const wig = i => frozen ? 0 : Math.sin(time * 12 + i * 1.9) * 0.2;
  const disc = (x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x * R, y * R, r * R, 0, TAU); ctx.fill(); };
  const oval = (x, y, rx, ry, c) => { ctx.beginPath(); ctx.ellipse(x * R, y * R, rx * R, ry * R, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = c; ctx.fill(); };
  const eyes = (y, dx, r) => { disc(-dx, y, r, '#fff'); disc(dx, y, r, '#fff'); disc(-dx, y - r * 0.2, r * 0.5, out); disc(dx, y - r * 0.2, r * 0.5, out); };
  ctx.save(); ctx.translate(s.x * cell, s.y * cell);
  if (bossType !== 3 && bossType !== 9) ctx.rotate(Math.atan2(s.vy, s.vx) + Math.PI / 2);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
  const legs = (n, y0, dy, len, c) => {
    ctx.strokeStyle = c; ctx.lineWidth = Math.max(1.5, R * 0.14);
    for (let i = 0; i < n; i++) for (const sd of [-1, 1]) {
      const y = y0 + i * dy, a = wig(i + (sd > 0 ? 5 : 0));
      ctx.beginPath(); ctx.moveTo(sd * 0.5 * R, y * R); ctx.lineTo(sd * (0.5 + len * 0.6) * R, (y - 0.25 + a) * R);
      ctx.lineTo(sd * (0.5 + len) * R, (y + 0.25 + a) * R); ctx.stroke();
    }
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
  };
  if (bossType === 1) {            // Kaefer
    legs(3, -0.5, 0.6, 0.9, dark('#14532d'));
    ctx.strokeStyle = dark('#14532d'); ctx.lineWidth = Math.max(1.2, R * 0.1);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 0.2 * R, -1.3 * R); ctx.quadraticCurveTo(sd * 0.5 * R, -1.9 * R, sd * 0.9 * R, -1.8 * R); ctx.stroke(); }
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
    oval(0, -1.0, 0.5, 0.42, dark('#1f6e3d'));
    oval(0, 0.2, 0.9, 1.15, col('#2fa35a'));
    ctx.beginPath(); ctx.moveTo(0, -0.9 * R); ctx.lineTo(0, 1.3 * R); ctx.stroke();
    for (const [x, y] of [[-0.42, -0.2], [0.42, -0.2], [-0.4, 0.6], [0.4, 0.6]]) disc(x, y, 0.17, dark('#14532d'));
    eyes(-1.12, 0.22, 0.13);
  } else if (bossType === 2) {     // Skorpion
    legs(4, -0.4, 0.4, 0.8, dark('#8a4a12'));
    const tw = frozen ? 0.5 : 0.5 + Math.sin(time * 5) * 0.25;
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(Math.sin(i * 0.5) * tw * R * (i / 3), (1.0 + i * 0.38) * R, (0.3 - i * 0.03) * R, 0, TAU); ctx.stroke(); ctx.fillStyle = col('#c9772b'); ctx.fill(); }
    const tx = Math.sin(2.5) * tw * R * (5 / 3), ty = 2.95 * R;
    ctx.beginPath(); ctx.moveTo(tx - 0.2 * R, ty - 0.15 * R); ctx.lineTo(tx + 0.25 * R, ty + 0.35 * R); ctx.lineTo(tx + 0.2 * R, ty - 0.2 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#e5484d'); ctx.fill();
    for (const sd of [-1, 1]) {
      ctx.strokeStyle = dark('#8a4a12'); ctx.lineWidth = Math.max(2, R * 0.2);
      ctx.beginPath(); ctx.moveTo(sd * 0.35 * R, -0.8 * R); ctx.lineTo(sd * 1.0 * R, -1.25 * R); ctx.stroke();
      ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
      oval(sd * 1.15, -1.55, 0.3, 0.42, col('#e08a3a'));
    }
    oval(0, 0.1, 0.62, 1.05, col('#c9772b'));
    for (const y of [-0.3, 0.15, 0.6]) { ctx.beginPath(); ctx.moveTo(-0.5 * R, y * R); ctx.lineTo(0.5 * R, y * R); ctx.stroke(); }
    eyes(-0.7, 0.2, 0.12);
  } else if (bossType === 3) {     // Krake
    for (let i = 0; i < 8; i++) {
      const a = i * TAU / 8 + 0.2;
      const path = () => {
        ctx.beginPath(); ctx.moveTo(Math.cos(a) * 0.6 * R, Math.sin(a) * 0.6 * R);
        for (let k = 1; k <= 6; k++) {
          const d = 0.6 + k * 0.24, b = a + (frozen ? 0 : Math.sin(time * 5 + i + k * 0.9) * 0.16 * k / 3);
          ctx.lineTo(Math.cos(b) * d * R, Math.sin(b) * d * R);
        }
      };
      path(); ctx.strokeStyle = out; ctx.lineWidth = R * 0.36; ctx.stroke();
      path(); ctx.strokeStyle = dark('#8b4fd6'); ctx.lineWidth = R * 0.22; ctx.stroke();
    }
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
    oval(0, 0, 0.92, 0.92, col('#b07cf0'));
    disc(-0.4, 0.45, 0.14, dark('#8b4fd6')); disc(0.45, 0.4, 0.1, dark('#8b4fd6'));
    eyes(-0.2, 0.34, 0.22);
  } else if (bossType === 5) {     // Schlange (rot-violett, damit sie sich von der gruenen Spielfigur abhebt)
    const path = () => {
      ctx.beginPath(); ctx.moveTo(0, -0.7 * R);
      for (let i = 1; i <= 16; i++) {
        const y = -0.7 + i * 0.26, x = Math.sin(i * 0.75 + (frozen ? 0 : time * 9)) * 0.55 * Math.min(1, i / 4) * (1 - i / 50);
        ctx.lineTo(x * R, y * R);
      }
    };
    path(); ctx.strokeStyle = out; ctx.lineWidth = 0.78 * R; ctx.stroke();
    path(); ctx.strokeStyle = col('#c2377a'); ctx.lineWidth = 0.56 * R; ctx.stroke();
    path(); ctx.strokeStyle = dark('#ffd23f'); ctx.lineWidth = 0.2 * R; ctx.setLineDash([0.22 * R, 0.5 * R]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = dark('#e5484d'); ctx.lineWidth = Math.max(1, 0.1 * R);
    ctx.beginPath(); ctx.moveTo(0, -1.6 * R); ctx.lineTo(0, -2.0 * R); ctx.lineTo(-0.18 * R, -2.3 * R); ctx.moveTo(0, -2.0 * R); ctx.lineTo(0.18 * R, -2.3 * R); ctx.stroke();
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
    oval(0, -1.0, 0.6, 0.72, col('#d94f8c'));
    disc(-0.28, -1.2, 0.17, dark('#ffd23f')); disc(0.28, -1.2, 0.17, dark('#ffd23f'));
    disc(-0.28, -1.24, 0.07, out); disc(0.28, -1.24, 0.07, out);
  } else if (bossType === 6) {     // Krokodil
    const wag = frozen ? 0 : Math.sin(time * 6) * 0.45;
    ctx.beginPath(); ctx.moveTo(-0.42 * R, 1.3 * R); ctx.quadraticCurveTo((wag * 0.4 - 0.2) * R, 2.3 * R, wag * R, 3.2 * R);
    ctx.quadraticCurveTo((wag * 0.4 + 0.2) * R, 2.3 * R, 0.42 * R, 1.3 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#3f7d33'); ctx.fill();
    for (const [x, y] of [[-0.85, -0.25], [0.85, -0.25], [-0.85, 1.0], [0.85, 1.0]]) {
      const a = wig(x > 0 ? y * 3 : y * 3 + 4) * 0.5;
      oval(x, y + a, 0.36, 0.26, dark('#3f7d33'));
    }
    oval(0, 0.35, 0.68, 1.3, col('#4f9a40'));
    for (let i = 0; i < 5; i++) for (const sd of [-1, 1]) disc(sd * 0.22, -0.4 + i * 0.4, 0.1, dark('#2f6327'));
    ctx.beginPath(); ctx.moveTo(-0.5 * R, -0.75 * R); ctx.quadraticCurveTo(-0.42 * R, -1.9 * R, -0.3 * R, -2.25 * R);
    ctx.quadraticCurveTo(0, -2.45 * R, 0.3 * R, -2.25 * R); ctx.quadraticCurveTo(0.42 * R, -1.9 * R, 0.5 * R, -0.75 * R); ctx.closePath();
    ctx.stroke(); ctx.fillStyle = col('#63b150'); ctx.fill();
    disc(-0.14, -2.15, 0.06, out); disc(0.14, -2.15, 0.06, out);
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(sd * 0.43 * R, (-1.2 - i * 0.3) * R); ctx.lineTo(sd * 0.62 * R, (-1.3 - i * 0.3) * R); ctx.lineTo(sd * 0.42 * R, (-1.4 - i * 0.3) * R); ctx.closePath(); ctx.fill(); }
    oval(-0.36, -0.85, 0.2, 0.2, dark('#ffd23f')); oval(0.36, -0.85, 0.2, 0.2, dark('#ffd23f'));
    disc(-0.36, -0.88, 0.07, out); disc(0.36, -0.88, 0.07, out);
  } else if (bossType === 7) {     // Hai
    const wag = frozen ? 0 : Math.sin(time * 10) * 0.4;
    ctx.beginPath(); ctx.moveTo(0, 1.7 * R); ctx.lineTo((wag - 0.75) * R, 3.0 * R); ctx.quadraticCurveTo(wag * R, 2.55 * R, (wag + 0.75) * R, 3.0 * R); ctx.closePath();
    ctx.stroke(); ctx.fillStyle = dark('#4f6b82'); ctx.fill();
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * 0.6 * R, -0.45 * R); ctx.lineTo(sd * 1.55 * R, 0.55 * R); ctx.lineTo(sd * 0.55 * R, 0.35 * R); ctx.closePath();
      ctx.stroke(); ctx.fillStyle = dark('#4f6b82'); ctx.fill();
    }
    ctx.beginPath(); ctx.moveTo(0, -2.1 * R); ctx.bezierCurveTo(0.95 * R, -1.3 * R, 0.85 * R, 0.6 * R, 0, 2.0 * R);
    ctx.bezierCurveTo(-0.85 * R, 0.6 * R, -0.95 * R, -1.3 * R, 0, -2.1 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = col('#7d9db8'); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -0.55 * R); ctx.lineTo(0.2 * R, 0.5 * R); ctx.lineTo(-0.2 * R, 0.5 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#4f6b82'); ctx.fill();
    for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(sd * (0.38 + i * 0.03) * R, (-0.95 + i * 0.16) * R); ctx.lineTo(sd * (0.62 + i * 0.02) * R, (-0.85 + i * 0.16) * R); ctx.stroke(); }
    disc(-0.42, -1.35, 0.1, out); disc(0.42, -1.35, 0.1, out);
  } else if (bossType === 8) {     // Fledermaus
    const fl = frozen ? 0.2 : Math.sin(time * 16) * 0.35;
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * 0.3 * R, -0.5 * R);
      ctx.lineTo(sd * 1.5 * R, (-1.2 + fl) * R); ctx.lineTo(sd * 2.5 * R, (-0.3 + fl * 2) * R);
      ctx.quadraticCurveTo(sd * 2.1 * R, (0.2 + fl) * R, sd * 1.9 * R, (0.8 + fl) * R);
      ctx.quadraticCurveTo(sd * 1.5 * R, 0.3 * R, sd * 1.2 * R, 0.9 * R);
      ctx.quadraticCurveTo(sd * 0.9 * R, 0.4 * R, sd * 0.4 * R, 0.8 * R); ctx.closePath();
      ctx.stroke(); ctx.fillStyle = dark('#5b3a8c'); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sd * 0.25 * R, -1.0 * R); ctx.lineTo(sd * 0.6 * R, -1.75 * R); ctx.lineTo(sd * 0.62 * R, -0.85 * R); ctx.closePath();
      ctx.stroke(); ctx.fillStyle = dark('#5b3a8c'); ctx.fill();
    }
    oval(0, 0.1, 0.55, 0.95, col('#7a52b8'));
    oval(0, -0.85, 0.52, 0.48, col('#7a52b8'));
    disc(-0.2, -0.95, 0.13, dark('#ffd23f')); disc(0.2, -0.95, 0.13, dark('#ffd23f')); disc(-0.2, -0.97, 0.06, out); disc(0.2, -0.97, 0.06, out);
    ctx.fillStyle = '#ffffff';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 0.06 * R, -0.62 * R); ctx.lineTo(sd * 0.2 * R, -0.62 * R); ctx.lineTo(sd * 0.13 * R, -0.4 * R); ctx.closePath(); ctx.fill(); }
  } else if (bossType === 9) {     // Qualle (wird nicht gedreht, Tentakel haengen nach unten)
    for (let i = 0; i < 7; i++) {
      const x0 = (-0.75 + i * 0.25);
      const path = () => {
        ctx.beginPath(); ctx.moveTo(x0 * R, 0.1 * R);
        for (let k = 1; k <= 7; k++) ctx.lineTo((x0 + (frozen ? 0 : Math.sin(time * 5 + i * 1.3 + k * 0.9) * 0.14)) * R, (0.1 + k * (i % 2 ? 0.3 : 0.36)) * R);
      };
      path(); ctx.strokeStyle = out; ctx.lineWidth = R * 0.2; ctx.stroke();
      path(); ctx.strokeStyle = dark(i % 2 ? '#ff9ad5' : '#c46bd6'); ctx.lineWidth = R * 0.1; ctx.stroke();
    }
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
    ctx.beginPath(); ctx.arc(0, 0.1 * R, 1.05 * R, Math.PI, 0); ctx.quadraticCurveTo(0.5 * R, 0.45 * R, 0, 0.3 * R); ctx.quadraticCurveTo(-0.5 * R, 0.45 * R, -1.05 * R, 0.1 * R); ctx.closePath();
    ctx.stroke(); ctx.fillStyle = col('#ff8ccf'); ctx.fill();
    disc(-0.45, -0.55, 0.16, 'rgba(255,255,255,.5)'); disc(0.3, -0.7, 0.1, 'rgba(255,255,255,.5)');
    eyes(-0.15, 0.36, 0.17);
  } else if (bossType === 10) {    // Wespe
    const fl = frozen ? 0 : Math.sin(time * 40) * 0.25;
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.rotate(sd * (0.5 + fl)); ctx.beginPath(); ctx.ellipse(sd * 1.05 * R, -0.3 * R, 0.95 * R, 0.36 * R, 0, 0, TAU);
      ctx.fillStyle = 'rgba(220,240,255,.7)'; ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.beginPath(); ctx.moveTo(-0.2 * R, 1.7 * R); ctx.lineTo(0, 2.3 * R); ctx.lineTo(0.2 * R, 1.7 * R); ctx.closePath(); ctx.fillStyle = out; ctx.fill();
    const abd = () => { ctx.beginPath(); ctx.ellipse(0, 0.85 * R, 0.6 * R, 1.0 * R, 0, 0, TAU); };
    abd(); ctx.stroke(); ctx.fillStyle = col('#ffd23f'); ctx.fill();
    ctx.save(); abd(); ctx.clip(); ctx.fillStyle = out; for (const y of [0.3, 0.8, 1.3]) ctx.fillRect(-R, y * R, 2 * R, 0.24 * R); ctx.restore();
    oval(0, -0.35, 0.5, 0.48, dark('#3a2f10'));
    oval(0, -1.0, 0.45, 0.4, col('#ffd23f'));
    ctx.lineWidth = Math.max(1.2, R * 0.09);
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 0.15 * R, -1.3 * R); ctx.quadraticCurveTo(sd * 0.3 * R, -1.8 * R, sd * 0.65 * R, -1.85 * R); ctx.stroke(); }
    disc(-0.24, -1.05, 0.14, out); disc(0.24, -1.05, 0.14, out);
  } else if (bossType === 11) {    // Drache
    const wag = frozen ? 0 : Math.sin(time * 6) * 0.5, fl = frozen ? 0 : Math.sin(time * 7) * 0.2;
    ctx.beginPath(); ctx.moveTo(-0.35 * R, 1.2 * R); ctx.quadraticCurveTo((wag * 0.4 - 0.15) * R, 2.2 * R, wag * R, 3.0 * R);
    ctx.lineTo((wag - 0.35) * R, 3.25 * R); ctx.lineTo(wag * R, 3.7 * R); ctx.lineTo((wag + 0.35) * R, 3.25 * R); ctx.lineTo(wag * R, 3.0 * R);
    ctx.quadraticCurveTo((wag * 0.4 + 0.15) * R, 2.2 * R, 0.35 * R, 1.2 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#b3261e'); ctx.fill();
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * 0.4 * R, -0.3 * R); ctx.lineTo(sd * 1.6 * R, (-1.3 + fl) * R); ctx.lineTo(sd * 2.7 * R, (-0.2 + fl * 2) * R);
      ctx.quadraticCurveTo(sd * 2.2 * R, 0.3 * R, sd * 2.1 * R, (1.0 + fl) * R); ctx.quadraticCurveTo(sd * 1.6 * R, 0.5 * R, sd * 1.3 * R, 1.1 * R);
      ctx.quadraticCurveTo(sd * 0.9 * R, 0.6 * R, sd * 0.4 * R, 0.9 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#ff9a3c'); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sd * 0.45 * R, -0.25 * R); ctx.lineTo(sd * 1.6 * R, (-1.3 + fl) * R); ctx.stroke();
    }
    oval(0, 0.3, 0.62, 1.15, col('#d9362b'));
    for (let i = 0; i < 4; i++) { ctx.fillStyle = dark('#ffd23f'); ctx.beginPath(); ctx.moveTo(-0.14 * R, (-0.3 + i * 0.4) * R); ctx.lineTo(0, (-0.55 + i * 0.4) * R); ctx.lineTo(0.14 * R, (-0.3 + i * 0.4) * R); ctx.closePath(); ctx.fill(); }
    oval(0, -1.0, 0.36, 0.5, col('#d9362b'));
    ctx.beginPath(); ctx.moveTo(-0.42 * R, -1.4 * R); ctx.quadraticCurveTo(-0.3 * R, -2.3 * R, 0, -2.45 * R); ctx.quadraticCurveTo(0.3 * R, -2.3 * R, 0.42 * R, -1.4 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = col('#e2463a'); ctx.fill();
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 0.3 * R, -1.45 * R); ctx.lineTo(sd * 0.75 * R, -1.15 * R); ctx.lineTo(sd * 0.4 * R, -1.2 * R); ctx.closePath(); ctx.stroke(); ctx.fillStyle = dark('#ffd23f'); ctx.fill(); }
    disc(-0.12, -2.25, 0.05, out); disc(0.12, -2.25, 0.05, out);
    disc(-0.22, -1.65, 0.12, dark('#ffd23f')); disc(0.22, -1.65, 0.12, dark('#ffd23f')); disc(-0.22, -1.67, 0.05, out); disc(0.22, -1.67, 0.05, out);
  } else {                         // Krabbe
    legs(3, -0.1, 0.38, 0.95, dark('#a8401c'));
    for (const sd of [-1, 1]) {
      ctx.strokeStyle = dark('#a8401c'); ctx.lineWidth = Math.max(2, R * 0.22);
      ctx.beginPath(); ctx.moveTo(sd * 0.8 * R, -0.4 * R); ctx.lineTo(sd * 1.35 * R, -0.95 * R); ctx.stroke();
      ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
      oval(sd * 1.45, -1.3, 0.42, 0.5, col('#ff7a4a'));
      ctx.beginPath(); ctx.moveTo(sd * 1.45 * R, -1.8 * R); ctx.lineTo(sd * 1.45 * R, -1.25 * R); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sd * 0.35 * R, -0.6 * R); ctx.lineTo(sd * 0.4 * R, -1.05 * R); ctx.stroke();
    }
    oval(0, 0.1, 1.2, 0.8, col('#e86a3a'));
    eyes(-1.08, 0.4, 0.17);
    ctx.beginPath(); ctx.arc(0, 0.2 * R, 0.4 * R, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  }
  ctx.restore();
}

function drawSpider(s) {
  if (s.boss && (BSHEET.ok || bossType !== 0)) { drawBoss(s); return; }
  const frozen = freezeT > 0, R = U * (s.boss ? bossScale() : 0.45);
  ctx.save(); ctx.translate(s.x * cell, s.y * cell);
  ctx.strokeStyle = frozen ? '#bfe6ff' : '#f1f1f1';
  ctx.lineWidth = Math.max(1.2, U * 0.13); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1, k = i % 4;
    const wig = frozen ? 0 : Math.sin(time * 14 + i * 1.7) * 0.22;
    const a = -0.95 + k * 0.62 + wig;
    ctx.beginPath();
    ctx.moveTo(side * R * 0.4, 0);
    ctx.lineTo(side * R * 1.25 * Math.cos(a), R * 1.25 * Math.sin(a) - R * 0.25);
    ctx.lineTo(side * R * 1.9 * Math.cos(a), R * 1.9 * Math.sin(a) + R * 0.45);
    ctx.stroke();
  }
  const sgr = ctx.createRadialGradient(-R * 0.2, -R * 0.1, R * 0.08, 0, R * 0.15, R * 0.78);
  if (frozen) { sgr.addColorStop(0, '#e0f2fe'); sgr.addColorStop(1, '#0284c7'); }
  else if (s.boss) { sgr.addColorStop(0, '#fda4af'); sgr.addColorStop(0.5, '#e11d48'); sgr.addColorStop(1, '#881337'); }
  else { sgr.addColorStop(0, '#fde047'); sgr.addColorStop(0.55, '#f97316'); sgr.addColorStop(1, '#9a3412'); }
  ctx.fillStyle = sgr;
  ctx.beginPath(); ctx.arc(0, R * 0.15, R * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -R * 0.62, R * 0.42, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0b1220';
  ctx.beginPath(); ctx.arc(-R * 0.16, -R * 0.7, R * 0.1, 0, Math.PI * 2);
  ctx.arc(R * 0.16, -R * 0.7, R * 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function draw() {
  if (!grid) return;
  const pad = U * 1.5;
  ctx.clearRect(0, 0, (cols + PADC) * cell, (rows + PADC) * cell);
  ctx.save(); ctx.translate(pad, pad);
  drawField();
  // v68: Neonrahmen in der Farbe des Levels (zwei Striche statt Schatten – schont das Handy)
  const fc = SHOT_COL[bossType] || '#5ee0c0', fw = cols * cell, fh = rows * cell, fo = U * 0.55;
  ctx.globalAlpha = 0.18; ctx.strokeStyle = fc; ctx.lineWidth = U * 0.6;
  ctx.strokeRect(-fo, -fo, fw + fo * 2, fh + fo * 2);
  ctx.globalAlpha = 0.9 + 0.1 * Math.sin(time * 2); ctx.lineWidth = Math.max(1.5, U * 0.22);
  ctx.strokeRect(-fo, -fo, fw + fo * 2, fh + fo * 2);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawField() {
  const w = cols * cell, h = rows * cell;
  if (bgImg) ctx.drawImage(bgImg, 0, 0, w, h); else { ctx.fillStyle = '#1fa98a'; ctx.fillRect(0, 0, w, h); }
  // Deckbild ueber eine Maske in Feldaufloesung legen (keine feinen Streifen zwischen den Zeilen)
  const md = maskData.data;
  let nSafe = 0;
  for (let i = 0; i < grid.length; i++) { const sf = grid[i] === SAFE; md[i * 4 + 3] = sf ? 0 : 255; if (sf) nSafe++; }
  maskCtx.putImageData(maskData, 0, 0);
  lctx.globalCompositeOperation = 'source-over';
  lctx.clearRect(0, 0, layer.width, layer.height);
  if (coverImg) lctx.drawImage(coverImg, 0, 0, layer.width, layer.height);
  else { lctx.fillStyle = '#0d1528'; lctx.fillRect(0, 0, layer.width, layer.height); }
  lctx.globalCompositeOperation = 'destination-in'; lctx.imageSmoothingEnabled = false;
  lctx.drawImage(maskCv, 0, 0, layer.width, layer.height);
  ctx.drawImage(layer, 0, 0, w, h);
  // v74: Kante als fertiger Pfad zwischenspeichern – nur neu, wenn sich die freigelegte Flaeche aendert
  const ek = nSafe + '|' + cell + '|' + cols + '|' + rows;
  if (ek !== edgeKey || !edgePath) {
    edgeKey = ek; edgePath = new Path2D();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const a = grid[idx(x, y)] !== SAFE;
      if (x + 1 < cols && (grid[idx(x + 1, y)] !== SAFE) !== a) { edgePath.moveTo((x + 1) * cell, y * cell); edgePath.lineTo((x + 1) * cell, (y + 1) * cell); }
      if (y + 1 < rows && (grid[idx(x, y + 1)] !== SAFE) !== a) { edgePath.moveTo(x * cell, (y + 1) * cell); edgePath.lineTo((x + 1) * cell, (y + 1) * cell); }
    }
  }
  // v68: leuchtende Schnittkante – breiter farbiger Schein und heller Kern
  ctx.lineCap = 'square';
  if (!lowFx) { ctx.globalAlpha = 0.35 + 0.1 * Math.sin(time * 3); ctx.strokeStyle = SHOT_COL[bossType] || '#5ee0c0'; ctx.lineWidth = Math.max(4, U * 0.7); ctx.stroke(edgePath); }
  ctx.globalAlpha = 1; ctx.strokeStyle = '#eafcff'; ctx.lineWidth = Math.max(1.5, U * 0.16); ctx.stroke(edgePath);
  // v68: Lichtschimmer ueber dem frisch aufgedeckten Stueck
  if (revealT > 0 && revealCv && !lowFx) {
    const k = 1 - revealT / REVEAL_SEC, tw = cols, th = rows;
    if (!shimCv || shimCv.width !== tw || shimCv.height !== th) { shimCv = document.createElement('canvas'); shimCv.width = tw; shimCv.height = th; shimCtx = shimCv.getContext('2d'); }
    const sc = shimCtx, band = (tw + th) * 0.25, x0 = -band + k * (tw + th + band * 2);
    sc.globalCompositeOperation = 'source-over'; sc.clearRect(0, 0, tw, th);
    const gl = sc.createLinearGradient(x0 - band, 0, x0 + band, th * 0.6);
    gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.5, 'rgba(255,255,240,' + (0.55 * (1 - k * 0.5)) + ')'); gl.addColorStop(1, 'rgba(255,255,255,0)');
    sc.fillStyle = gl; sc.fillRect(0, 0, tw, th);
    sc.globalCompositeOperation = 'destination-in'; sc.drawImage(revealCv, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(shimCv, 0, 0, w, h); ctx.restore();
  }
  for (const b of blocks) {          // Stein: Grundfarbe, helle Kante oben/links, dunkle Kante unten/rechts, Umriss
    const [base, lite, dark] = b.col, e = Math.max(1.5, U * 0.2), c = cell;
    let bx0 = 1e9, by0 = 1e9, bx1 = -1, by1 = -1;
    for (const [cx, cy] of b.cells) { bx0 = Math.min(bx0, cx); by0 = Math.min(by0, cy); bx1 = Math.max(bx1, cx + 1); by1 = Math.max(by1, cy + 1); }
    const sgd = ctx.createLinearGradient(bx0 * c, by0 * c, bx1 * c, by1 * c);     // v68: Licht von oben links
    sgd.addColorStop(0, lite); sgd.addColorStop(0.35, base); sgd.addColorStop(1, dark);
    ctx.fillStyle = sgd;
    for (const [cx, cy] of b.cells) ctx.fillRect(cx * c, cy * c, c + 0.5, c + 0.5);
    const has = (x, y) => b.set.has(idx(x, y));
    ctx.fillStyle = lite;
    for (const [cx, cy] of b.cells) {
      if (!has(cx, cy - 1)) ctx.fillRect(cx * c, cy * c, c + 0.5, e);
      if (!has(cx - 1, cy)) ctx.fillRect(cx * c, cy * c, e, c + 0.5);
    }
    ctx.fillStyle = dark;
    for (const [cx, cy] of b.cells) {
      if (!has(cx, cy + 1)) ctx.fillRect(cx * c, (cy + 1) * c - e, c + 0.5, e);
      if (!has(cx + 1, cy)) ctx.fillRect((cx + 1) * c - e, cy * c, e, c + 0.5);
    }
    ctx.beginPath();
    for (const [cx, cy] of b.cells) {
      if (!has(cx, cy - 1)) { ctx.moveTo(cx * c, cy * c); ctx.lineTo((cx + 1) * c, cy * c); }
      if (!has(cx, cy + 1)) { ctx.moveTo(cx * c, (cy + 1) * c); ctx.lineTo((cx + 1) * c, (cy + 1) * c); }
      if (!has(cx - 1, cy)) { ctx.moveTo(cx * c, cy * c); ctx.lineTo(cx * c, (cy + 1) * c); }
      if (!has(cx + 1, cy)) { ctx.moveTo((cx + 1) * c, cy * c); ctx.lineTo((cx + 1) * c, (cy + 1) * c); }
    }
    ctx.strokeStyle = '#141a2a'; ctx.lineWidth = Math.max(1.5, U * 0.12); ctx.lineCap = 'square'; ctx.stroke();
    if (b.col !== STONE_GREY) {        // kleiner Glanzpunkt auf farbigen Steinen
      const [gx, gy] = b.cells[0], tw = Math.sin(time * 3 + gx) * 0.5 + 0.5;
      ctx.fillStyle = 'rgba(255,255,255,' + (0.45 + tw * 0.4) + ')';
      ctx.beginPath(); ctx.arc((gx + 1) * c + e, (gy + 1) * c + e, Math.max(1.5, U * 0.16), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const it of items) {
    const cx = (it.x + 0.5) * cell, cy = (it.y + 0.5) * cell, r = U * (0.85 + Math.sin(time * 4) * 0.07);
    if (it.type === 'coin') {
      const cg = ctx.createRadialGradient(cx - U * 0.2, cy - U * 0.2, U * 0.05, cx, cy, U * 0.65);
      cg.addColorStop(0, '#fff7b2'); cg.addColorStop(0.55, '#ffd23f'); cg.addColorStop(1, '#d97706');
      ctx.beginPath(); ctx.arc(cx, cy, U * (0.62 + Math.sin(time * 4 + it.x) * 0.04), 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = Math.max(1, U * 0.1); ctx.stroke();
      ctx.fillStyle = '#b45309'; ctx.fillRect(cx - U * 0.08, cy - U * 0.26, U * 0.16, U * 0.52);
      continue;
    }
    if (it.type === 'gem') {
      const g = U * 0.8;
      ctx.beginPath(); ctx.moveTo(cx, cy - g); ctx.lineTo(cx + g * 0.8, cy - g * 0.2); ctx.lineTo(cx, cy + g); ctx.lineTo(cx - g * 0.8, cy - g * 0.2); ctx.closePath();
      const gg = ctx.createLinearGradient(cx - g, cy - g, cx + g, cy + g);
      gg.addColorStop(0, '#e0f2fe'); gg.addColorStop(0.45, '#38bdf8'); gg.addColorStop(1, '#0284c7');
      ctx.fillStyle = gg; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, U * 0.12); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - g * 0.8, cy - g * 0.2); ctx.lineTo(cx + g * 0.8, cy - g * 0.2); ctx.stroke();
      continue;
    }
    if (R3D) continue;
    const sz = r * 2;      // geschlossene Kiste: Inhalt bleibt bis zum Einkreisen geheim
    ctx.fillStyle = '#b9782f'; ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
    ctx.strokeStyle = '#6e4315'; ctx.lineWidth = Math.max(1, U * 0.16); ctx.strokeRect(cx - sz / 2, cy - sz / 2, sz, sz);
    ctx.fillStyle = '#fff3d0'; ctx.font = 'bold ' + Math.round(U * 1.2) + 'px system-ui, sans-serif';
    ctx.fillText('?', cx, cy + U * 0.06);
  }
  for (const s of spiders) if (!(R3D && s.boss)) drawSpider(s);
  for (const sh of shots) {         // leuchtende Geschosse des Bosses
    const z = U * 1.7, px2 = sh.x * cell, py2 = sh.y * cell;
    ctx.save(); ctx.shadowColor = SHOT_COL[bossType]; ctx.shadowBlur = U * 0.9; ctx.imageSmoothingEnabled = false;
    if (SSHEET.ok) ctx.drawImage(SSHEET.img, bossType * 40, 0, 40, 40, px2 - z / 2, py2 - z / 2, z, z);
    else { ctx.fillStyle = SHOT_COL[bossType]; ctx.fillRect(px2 - z * 0.3, py2 - z * 0.3, z * 0.6, z * 0.6); }
    ctx.restore(); ctx.imageSmoothingEnabled = true;
  }
  for (const z of sparx) {              // v67: Funke auf dem Rand
    const zx = (z.x + 0.5) * cell, zy = (z.y + 0.5) * cell, zr = U * (0.9 + Math.sin(time * 20) * 0.2);
    ctx.save(); ctx.globalAlpha = z.wait > 0 ? 0.35 + 0.3 * Math.sin(time * 10) : 1;
    ctx.strokeStyle = '#fff7b2'; ctx.lineWidth = Math.max(1.5, U * 0.16);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = time * 9 + k * Math.PI / 3; ctx.moveTo(zx, zy); ctx.lineTo(zx + Math.cos(a) * zr * 1.4, zy + Math.sin(a) * zr * 1.4); }
    ctx.stroke();
    ctx.fillStyle = '#ff3d6e'; ctx.beginPath(); ctx.arc(zx, zy, zr * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(zx, zy, zr * 0.25, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  for (const q of fx) {                 // Teilchen (ohne Schatten, damit es auf dem Handy fluessig bleibt)
    ctx.globalAlpha = Math.max(0, Math.min(1, q.life / q.max)); ctx.fillStyle = q.col;
    ctx.beginPath(); ctx.arc(q.x * cell, q.y * cell, U * q.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  const p = player, t = p.dir ? Math.min(1, p.acc) : 1;
  const px = (p.px + (p.x - p.px) * t + 0.5) * cell, py = (p.py + (p.y - p.py) * t + 0.5) * cell;
  if (p.trail.length > 1) {
    ctx.save();
    const tc = shieldT > 0 ? '#b9f27c' : '#ffd23f';
    if (!lowFx) { ctx.shadowColor = tc; ctx.shadowBlur = U * 0.6; }
    ctx.strokeStyle = tc; ctx.lineWidth = Math.max(2, U * 0.28); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo((p.trail[0][0] + 0.5) * cell, (p.trail[0][1] + 0.5) * cell);
    for (let k = 1; k < p.trail.length - 1; k++) ctx.lineTo((p.trail[k][0] + 0.5) * cell, (p.trail[k][1] + 0.5) * cell);
    ctx.lineTo(px, py); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(1, U * 0.09); ctx.stroke();
    if (fuse && (fuse.pos > 0 || fuse.hit)) {         // v67: abgebrannter Teil der Linie und Flamme
      const n2 = Math.min(p.trail.length - 1, Math.floor(fuse.pos)), f0 = Math.min(n2, fuse.from || 0);
      ctx.strokeStyle = '#3b0d0d'; ctx.lineWidth = Math.max(2, U * 0.3);
      ctx.beginPath(); ctx.moveTo((p.trail[f0][0] + 0.5) * cell, (p.trail[f0][1] + 0.5) * cell);
      for (let k = f0 + 1; k <= n2; k++) ctx.lineTo((p.trail[k][0] + 0.5) * cell, (p.trail[k][1] + 0.5) * cell);
      ctx.stroke();
      const fxp = (p.trail[n2][0] + 0.5) * cell, fyp = (p.trail[n2][1] + 0.5) * cell, fr = U * (0.7 + Math.sin(time * 25) * 0.15);
      ctx.fillStyle = '#ff6b35'; ctx.beginPath(); ctx.arc(fxp, fyp, fr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(fxp, fyp, fr * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  if (state !== 'won' && !R3D) drawPlane(px, py, p.face);
  if (flashT > 0) { ctx.fillStyle = 'rgba(229,72,77,' + (flashT * 0.9) + ')'; ctx.fillRect(0, 0, w, h); }
  if (msgT > 0 && state === 'play') {
    const fs = Math.round(Math.max(15, U * 1.4));
    ctx.font = 'bold ' + fs + 'px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(msg).width;
    ctx.globalAlpha = Math.min(1, msgT * 2);
    ctx.fillStyle = 'rgba(11,18,32,.88)'; ctx.fillRect(w / 2 - tw / 2 - 12, fs * 1.2, tw + 24, fs * 1.8);
    ctx.fillStyle = '#ffd23f'; ctx.fillText(msg, w / 2, fs * 2.1);
    ctx.globalAlpha = 1;
  }
}

// Weitere Figuren, alle mit Blick nach oben gezeichnet (wird in Flugrichtung gedreht)
function drawSkin(u, moving) {
  const TAU = Math.PI * 2, out = '#0b1220';
  const disc = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x * u, y * u, r * u, 0, TAU); ctx.fill(); };
  const oval = (x, y, rx, ry, col, line) => {
    ctx.beginPath(); ctx.ellipse(x * u, y * u, rx * u, ry * u, 0, 0, TAU);
    if (line) ctx.stroke();
    ctx.fillStyle = col; ctx.fill();
  };
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
  if (skin === 'rocket') {
    if (moving) {
      ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(-0.5 * u, 1.5 * u);
      ctx.lineTo(0, (2.7 + Math.sin(time * 30) * 0.35) * u); ctx.lineTo(0.5 * u, 1.5 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff7a2f'; ctx.beginPath(); ctx.moveTo(-0.28 * u, 1.5 * u);
      ctx.lineTo(0, (2.1 + Math.sin(time * 30) * 0.25) * u); ctx.lineTo(0.28 * u, 1.5 * u); ctx.closePath(); ctx.fill();
    }
    for (const sd of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(sd * 0.55 * u, 0.5 * u); ctx.lineTo(sd * 1.35 * u, 1.75 * u); ctx.lineTo(sd * 0.55 * u, 1.5 * u); ctx.closePath();
      ctx.stroke(); ctx.fillStyle = '#e5484d'; ctx.fill();
    }
    const body = () => {
      ctx.beginPath(); ctx.moveTo(0, -2.1 * u); ctx.quadraticCurveTo(0.95 * u, -0.9 * u, 0.65 * u, 1.5 * u);
      ctx.lineTo(-0.65 * u, 1.5 * u); ctx.quadraticCurveTo(-0.95 * u, -0.9 * u, 0, -2.1 * u); ctx.closePath();
    };
    body(); ctx.stroke(); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.save(); body(); ctx.clip(); ctx.fillStyle = '#e5484d'; ctx.fillRect(-u, -2.2 * u, 2 * u, 1.0 * u); ctx.restore();
    ctx.beginPath(); ctx.arc(0, -0.25 * u, 0.34 * u, 0, TAU); ctx.stroke(); ctx.fillStyle = '#3fa9f5'; ctx.fill();
  } else if (skin === 'snake') {
    const path = () => {
      ctx.beginPath(); ctx.moveTo(0, -1.0 * u);
      for (let i = 1; i <= 12; i++) {
        const y = -1.0 + i * 0.33, x = Math.sin(i * 0.85 + (moving ? time * 10 : 0)) * 0.5 * Math.min(1, i / 4) * (1 - i / 40);
        ctx.lineTo(x * u, y * u);
      }
    };
    path(); ctx.strokeStyle = out; ctx.lineWidth = 0.95 * u; ctx.stroke();
    path(); ctx.strokeStyle = '#3fae4a'; ctx.lineWidth = 0.66 * u; ctx.stroke();
    path(); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 0.16 * u; ctx.setLineDash([0.3 * u, 0.5 * u]); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = '#e5484d'; ctx.lineWidth = Math.max(1, 0.13 * u);
    ctx.beginPath(); ctx.moveTo(0, -2.0 * u); ctx.lineTo(0, -2.45 * u); ctx.lineTo(-0.2 * u, -2.75 * u);
    ctx.moveTo(0, -2.45 * u); ctx.lineTo(0.2 * u, -2.75 * u); ctx.stroke();
    ctx.strokeStyle = out; ctx.lineWidth = Math.max(1.5, U * 0.16);
    oval(0, -1.35, 0.68, 0.82, '#4cc35a', true);
    disc(-0.3, -1.6, 0.2, '#ffffff'); disc(0.3, -1.6, 0.2, '#ffffff');
    disc(-0.3, -1.66, 0.1, out); disc(0.3, -1.66, 0.1, out);
  } else {
    const wag = moving ? Math.sin(time * 9) * 0.35 : 0;
    ctx.beginPath(); ctx.moveTo(-0.32 * u, 1.3 * u); ctx.quadraticCurveTo((wag - 0.25) * u, 2.2 * u, wag * u, 3.0 * u);
    ctx.quadraticCurveTo((wag + 0.25) * u, 2.2 * u, 0.32 * u, 1.3 * u); ctx.closePath(); ctx.stroke(); ctx.fillStyle = '#6b4423'; ctx.fill();
    for (const [x, y] of [[-0.8, -0.45], [0.8, -0.45], [-0.8, 0.95], [0.8, 0.95]]) oval(x, y, 0.27, 0.34, '#5a381c', true);
    oval(0, 0.3, 0.78, 1.4, '#8a5a2e', true);
    oval(0, 0.45, 0.42, 0.95, '#b58555', false);
    disc(-0.58, -1.75, 0.22, '#5a381c'); disc(0.58, -1.75, 0.22, '#5a381c');
    ctx.beginPath(); ctx.arc(0, -1.3 * u, 0.74 * u, 0, TAU); ctx.stroke(); ctx.fillStyle = '#8a5a2e'; ctx.fill();
    oval(0, -1.62, 0.44, 0.33, '#ecd9b6', false);
    disc(0, -1.86, 0.13, '#2b1a0e');
    disc(-0.33, -1.38, 0.1, out); disc(0.33, -1.38, 0.1, out);
  }
}

function drawPlane(px, py, face) {
  const u = U * 0.62;
  ctx.save(); ctx.translate(px, py); ctx.rotate(Math.atan2(face[1], face[0]) + Math.PI / 2);
  if (skin !== 'plane') {
    if (speedT > 0) { ctx.fillStyle = 'rgba(255,154,60,.45)'; ctx.beginPath(); ctx.arc(0, 0, u * 2.6, 0, Math.PI * 2); ctx.fill(); }
    drawSkin(u, !!player.dir); ctx.restore(); return;
  }
  ctx.fillStyle = speedT > 0 ? '#ff9a3c' : '#ffffff';
  ctx.strokeStyle = '#0b1220'; ctx.lineWidth = Math.max(1.5, U * 0.18); ctx.lineJoin = 'round';
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(0, -2.0 * u);
    ctx.quadraticCurveTo(0.45 * u, -1.6 * u, 0.42 * u, -0.5 * u);
    ctx.lineTo(2.1 * u, 0.5 * u); ctx.lineTo(2.1 * u, 0.95 * u); ctx.lineTo(0.4 * u, 0.55 * u);
    ctx.lineTo(0.3 * u, 1.35 * u);
    ctx.lineTo(0.95 * u, 1.8 * u); ctx.lineTo(0.95 * u, 2.1 * u); ctx.lineTo(0, 1.85 * u);
    ctx.lineTo(-0.95 * u, 2.1 * u); ctx.lineTo(-0.95 * u, 1.8 * u);
    ctx.lineTo(-0.3 * u, 1.35 * u);
    ctx.lineTo(-0.4 * u, 0.55 * u); ctx.lineTo(-2.1 * u, 0.95 * u); ctx.lineTo(-2.1 * u, 0.5 * u);
    ctx.lineTo(-0.42 * u, -0.5 * u);
    ctx.quadraticCurveTo(-0.45 * u, -1.6 * u, 0, -2.0 * u);
    ctx.closePath();
  };
  shape(); ctx.stroke(); shape(); ctx.fill();
  ctx.fillStyle = '#3b82c4';
  ctx.beginPath(); ctx.ellipse(0, -1.2 * u, 0.2 * u, 0.35 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

let last = 0;
function loop(ts) {
  const rawDt = (ts - last) / 1000 || 0;
  let dt = Math.min(0.05, rawDt); last = ts;
  if (!lowFx && state === 'play' && !paused && rawDt > 0 && rawDt < 0.5) {     // v74: ruckelt es, Effekte sparsamer schalten
    fpsAcc += rawDt; fpsN++;
    if (fpsN >= 90) { if (fpsAcc / fpsN > 0.03) lowFx = true; fpsAcc = 0; fpsN = 0; }
  }
  if (paused) dt = 0;
  update(dt); draw();
  if (R3D) { try { render3D(dt); } catch (err) { console.error(err); } }
  if (travel.on) { try { travelFrame(dt); } catch (err) { endTravel(true); } }
  requestAnimationFrame(loop);
}

