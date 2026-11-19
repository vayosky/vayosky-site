// Space Slice · 3D-Darstellung
/* ---------- 3D-Darstellung (Vorschau): Spielfeld als schraeg liegendes Brett, Steine und Boss in 3D ---------- */
let T = null;
function setup3D() {
  if (!window.THREE) return;
  const THREE = window.THREE, can = el('c3d');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: can, antialias: true, alpha: false }); } catch (err) { return; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05071a');
  const camera = new THREE.PerspectiveCamera(24, 1, 0.5, 2000);
  scene.add(new THREE.AmbientLight(0xffffff, 0.42));
  const sun = new THREE.DirectionalLight(0xffffff, 1.05); sun.position.set(-45, 110, -35); scene.add(sun);
  const rim = new THREE.DirectionalLight(0x8fb4ff, 0.35); rim.position.set(50, 30, -60); scene.add(rim);
  // Sterne rundherum
  const sg = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 900; i++) { const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), r = 400 + Math.random() * 300; sp.push(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false })));
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  if ('encoding' in tex) tex.encoding = THREE.sRGBEncoding;
  renderer.outputEncoding = THREE.sRGBEncoding;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex }));
  board.rotation.x = -Math.PI / 2; scene.add(board);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), (() => { const m = new THREE.MeshStandardMaterial({ color: 0x24306a, roughness: 0.55, metalness: 0.35 }); m.color.convertSRGBToLinear(); return m; })());
  scene.add(frame);
  const stones = new THREE.Group(); scene.add(stones);
  // Boss: Sprite mit Schatten und Leuchten
  const glowCan = document.createElement('canvas'); glowCan.width = glowCan.height = 128;
  const gg = glowCan.getContext('2d'), rg = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
  rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); gg.fillStyle = rg; gg.fillRect(0, 0, 128, 128);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCan), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 }));
  const bossSpr = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true }));
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  scene.add(glow); scene.add(bossSpr); scene.add(shadow);
  const bossTex = {};
  function bossTexture(bt, flip) {
    const key = bt + (flip ? 'f' : '');
    if (bossTex[key]) return bossTex[key];
    const c = document.createElement('canvas'); c.width = c.height = 192; const g = c.getContext('2d');
    if (flip) { g.translate(192, 0); g.scale(-1, 1); }
    g.imageSmoothingEnabled = false;
    g.drawImage(BSHEET.img, (bt % 6) * 192, Math.floor(bt / 6) * 192, 192, 192, 0, 0, 192, 192);
    const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; if ('encoding' in t) t.encoding = THREE.sRGBEncoding;
    return (bossTex[key] = t);
  }
  // Spielfigur: 3D-Rakete (zeigt im Modell nach -z)
  const rocket = new THREE.Group(), rk = new THREE.Group(); rocket.add(rk);
  const M = (c, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.35, metalness: 0.25 }, o || {})); m.color.convertSRGBToLinear(); return m; };
  const prof = [[0,0],[0.55,0.05],[0.78,0.6],[0.85,1.6],[0.8,2.6],[0.6,3.3],[0.32,3.8],[0,4.05]].map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), M('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.45 }));
  const nose = new THREE.Mesh(new THREE.LatheGeometry([[0,2.95],[0.68,2.95],[0.6,3.3],[0.32,3.8],[0,4.08]].map(([r, y]) => new THREE.Vector2(r * 1.02, y)), 28), M('#ff4d55', { emissive: '#ff2a35', emissiveIntensity: 0.6 }));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.87, 0.87, 0.22, 28), M('#e5484d')); band.position.y = 0.55;
  const win = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 14), M('#3fa9f5', { emissive: '#1d6fb8', emissiveIntensity: 0.5, roughness: 0.1 }));
  win.position.set(0, 2.05, 0.68); win.scale.z = 0.55;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.07, 10, 24), M('#c9d1e0', { metalness: 0.7 })); ring.position.set(0, 2.05, 0.74);
  const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(0.75, -0.35); finShape.lineTo(0.75, 0.25); finShape.lineTo(0, 1.4); finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.12, bevelEnabled: false }); finGeo.translate(0, 0, -0.06);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(finGeo, M('#e5484d')); f.position.set(0, 0.1, 0); f.rotation.y = i * Math.PI / 2 + Math.PI / 4; f.children; const piv = new THREE.Group(); f.position.x = 0.7; piv.add(f); piv.rotation.y = i * Math.PI / 2 + Math.PI / 4; f.rotation.y = 0; rk.add(piv); }
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb330, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 16, 1, true), flameMat); flame.rotation.x = Math.PI; flame.position.y = -0.75;
  const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })); flame2.rotation.x = Math.PI; flame2.position.y = -0.45;
  rk.add(body, nose, band, win, ring, flame, flame2);
  rk.rotation.x = -Math.PI / 2 + 0.18;        // liegt fast flach, Nase leicht angehoben, zeigt nach -z
  rk.position.z = 2.0;                         // Mitte der Rakete auf der Spielerposition
  const rGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow.material.map, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
  const rShadow = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false }));
  rShadow.rotation.x = -Math.PI / 2;
  const ringCan = document.createElement('canvas'); ringCan.width = ringCan.height = 128;
  ringCan.width = ringCan.height = 256;
  { const g2 = ringCan.getContext('2d'), c0 = 128;
    for (let k = 0; k < 12; k++) {                     // Strahlen, abwechselnd lang und kurz
      const a = k / 12 * Math.PI * 2, L = k % 2 ? 80 : 124, wd = k % 2 ? 0.09 : 0.13;
      const gr = g2.createLinearGradient(c0, c0, c0 + Math.cos(a) * L, c0 + Math.sin(a) * L);
      gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g2.fillStyle = gr; g2.beginPath(); g2.moveTo(c0, c0);
      g2.lineTo(c0 + Math.cos(a - wd) * L, c0 + Math.sin(a - wd) * L); g2.lineTo(c0 + Math.cos(a + wd) * L, c0 + Math.sin(a + wd) * L); g2.closePath(); g2.fill();
    }
    const rg2 = g2.createRadialGradient(c0, c0, 0, c0, c0, 40); rg2.addColorStop(0, 'rgba(255,255,255,1)'); rg2.addColorStop(1, 'rgba(255,255,255,0)');
    g2.fillStyle = rg2; g2.fillRect(0, 0, 256, 256); }
  const rRing = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(ringCan), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  rRing.rotation.x = -Math.PI / 2;
  scene.add(rocket, rGlow, rShadow, rRing);
  // Wunderkisten: schwebende, drehende 3D-Kisten mit Fragezeichen und Goldschein
  const boxCan = document.createElement('canvas'); boxCan.width = boxCan.height = 128;
  { const g3 = boxCan.getContext('2d'), gr = g3.createLinearGradient(0, 0, 128, 128);
    gr.addColorStop(0, '#b05cff'); gr.addColorStop(1, '#4b1fa8'); g3.fillStyle = gr; g3.fillRect(0, 0, 128, 128);
    g3.strokeStyle = '#ffd23f'; g3.lineWidth = 12; g3.strokeRect(6, 6, 116, 116);
    g3.fillStyle = '#ffd23f'; for (const [a, b] of [[6, 6], [122, 6], [6, 122], [122, 122]]) { g3.beginPath(); g3.arc(a, b, 9, 0, Math.PI * 2); g3.fill(); }
    g3.font = 'bold 84px system-ui, sans-serif'; g3.textAlign = 'center'; g3.textBaseline = 'middle';
    g3.lineWidth = 8; g3.strokeStyle = '#3a1180'; g3.strokeText('?', 64, 70); g3.fillStyle = '#fff6c8'; g3.fillText('?', 64, 70); }
  const boxTex = new THREE.CanvasTexture(boxCan); if ('encoding' in boxTex) boxTex.encoding = THREE.sRGBEncoding;
  const boxMat = new THREE.MeshStandardMaterial({ map: boxTex, emissiveMap: boxTex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.2 });
  const boxGeo = new THREE.BoxGeometry(1, 1, 1), boxes = [];
  const boxGlowMat = new THREE.SpriteMaterial({ map: glow.material.map, color: 0xffc94a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 });
  function boxAt(i) {
    if (!boxes[i]) { const m = new THREE.Mesh(boxGeo, boxMat), g = new THREE.Sprite(boxGlowMat); scene.add(g, m); boxes[i] = { m, g }; }
    return boxes[i];
  }
  T = { boxes, boxAt, rRing, rocket, rk, flame, flame2, rGlow, rShadow, THREE, renderer, scene, camera, tex, board, frame, stones, glow, bossSpr, shadow, bossTexture, sig: '', size: '', can };
  R3D = true; el('app').classList.add('r3d');
}
function fitCamera3D() {
  const W = stage.clientWidth, H = stage.clientHeight;
  T.renderer.setSize(W, H, false);
  T.camera.aspect = W / H;
  const bw = cols + PADC, bh = rows + PADC, tilt = 0.0;         // von oben, keine Neigung
  const fov = T.camera.fov * Math.PI / 180, tanV = Math.tan(fov / 2), tanH = tanV * T.camera.aspect;
  let D = Math.max((bh / 2) * Math.cos(tilt) / tanV + (bh / 2) * Math.sin(tilt), (bw / 2) / tanH + (bh / 2) * Math.sin(tilt) * 0.55) * 1.03;
  T.camera.position.set(0, D * Math.cos(tilt), D * Math.sin(tilt) + bh * 0.04);
  T.camera.up.set(0, 0, -1); T.camera.position.z = 0; T.camera.lookAt(0, 0, 0);
  T.camera.updateProjectionMatrix();
}
function render3D(dt) {
  if (!T || !grid) return;
  const THREE = T.THREE, bw = cols + PADC, bh = rows + PADC;
  const sizeKey = cols + 'x' + rows + ':' + stage.clientWidth + 'x' + stage.clientHeight;
  if (sizeKey !== T.size) {
    T.size = sizeKey;
    T.board.scale.set(bw, bh, 1);
    T.frame.scale.set(bw + 1.6, 2.4, bh + 1.6); T.frame.position.set(0, -1.25, 0);
    fitCamera3D();
  }
  T.tex.needsUpdate = true;
  // Steine neu bauen, wenn sich die Steine aendern
  const sig = level + ':' + blocks.map(b => b.x + ',' + b.y + ',' + b.cells.length).join(';');
  if (sig !== T.sig) {
    T.sig = sig;
    while (T.stones.children.length) { const m = T.stones.children.pop(); m.geometry.dispose(); [].concat(m.material).forEach(q => q.dispose()); }
    const H3 = 1.5, dummy = new THREE.Object3D();
    for (const b of blocks) {
      // Umriss der Zellen bestimmen (gemeinsame Kanten fallen weg) und als ein Stueck extrudieren
      const key = (x, y) => x + ',' + y, has = new Set(b.cells.map(([x, y]) => key(x, y))), next = new Map();
      for (const [x, y] of b.cells) {
        if (!has.has(key(x, y - 1))) next.set(key(x, y), [x + 1, y]);
        if (!has.has(key(x + 1, y))) next.set(key(x + 1, y) + 'r', [x + 1, y + 1]);
        if (!has.has(key(x, y + 1))) next.set(key(x + 1, y + 1) + 'b', [x, y + 1]);
        if (!has.has(key(x - 1, y))) next.set(key(x, y + 1) + 'l', [x, y]);
      }
      const edges = []; for (const [k, to] of next) { const [fx, fy] = k.replace(/[rbl]$/, '').split(',').map(Number); edges.push([fx, fy, to[0], to[1]]); }
      const shapes = [], used = new Array(edges.length).fill(false);
      for (let i = 0; i < edges.length; i++) {
        if (used[i]) continue;
        const pts = []; let e = i;
        while (e >= 0 && !used[e]) {
          used[e] = true; pts.push([edges[e][0], edges[e][1]]);
          const ex = edges[e][2], ey = edges[e][3]; e = edges.findIndex((q, j) => !used[j] && q[0] === ex && q[1] === ey);
        }
        if (pts.length > 2) shapes.push(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x - cols / 2, y - rows / 2))));
      }
      const top = new THREE.MeshStandardMaterial({ color: b.col[0], roughness: 0.35, metalness: 0.25, emissive: b.col[0], emissiveIntensity: 0.08 });   // v68: mehr Kontrast
      const side = new THREE.MeshStandardMaterial({ color: b.col[2], roughness: 0.6, metalness: 0.05 });
      top.color.convertSRGBToLinear(); top.emissive.convertSRGBToLinear(); side.color.convertSRGBToLinear();
      const geo = new THREE.ExtrudeGeometry(shapes, { depth: H3, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 3 });
      const mesh = new THREE.Mesh(geo, [top, side]);
      mesh.rotation.x = Math.PI / 2; mesh.position.y = H3;
      T.stones.add(mesh);
      const sh = new THREE.Mesh(new THREE.ShapeGeometry(shapes), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }));
      sh.rotation.x = Math.PI / 2; sh.position.set(0.55, 0.03, 0.75); sh.scale.set(1, 1, 1); T.stones.add(sh);
    }
  }
  // Boss
  const boss = spiders.find(sp => sp.boss);
  const show = !!(boss && BSHEET.ok);
  T.bossSpr.visible = T.glow.visible = T.shadow.visible = show;
  if (show) {
    const sz = (boss.rad || 1) * 5.2 * bossScale() * S, frozen = freezeT > 0;
    const tx = T.bossTexture(bossType, boss.vx < 0);
    if (T.bossSpr.material.map !== tx) { T.bossSpr.material.map = tx; T.bossSpr.material.needsUpdate = true; }
    T.bossSpr.material.color.set(frozen ? 0x9fd8ff : 0xffffff);
    const bob = frozen ? 0 : Math.sin(time * 4) * 0.35;
    const x = boss.x - cols / 2, z = boss.y - rows / 2, y = sz * 0.5 + 1.2 + bob;
    T.bossSpr.position.set(x, y, z); T.bossSpr.scale.set(sz, sz, 1);
    T.glow.position.set(x, y, z - 0.1); T.glow.scale.set(sz * 1.5, sz * 1.5, 1);
    T.glow.material.color.set(frozen ? '#6cc4ff' : SHOT_COL[bossType]);
    T.glow.material.opacity = 0.35 + Math.sin(time * 6) * 0.12;
    T.shadow.position.set(x, 0.06, z); T.shadow.scale.set(sz * 0.32, sz * 0.32 * 0.6, 1);
    T.shadow.material.opacity = 0.45 - bob * 0.05;
  }
  // Wunderkisten
  {
    let n = 0;
    for (const it of items) {
      if (it.type === 'coin' || it.type === 'gem') continue;
      const b = T.boxAt(n++), x = it.x + 0.5 - cols / 2, z = it.y + 0.5 - rows / 2, ph = (it.x * 7 + it.y * 3) % 6;
      const bs = 3.4 * S * 0.5 * (1 + Math.sin(time * 4 + ph) * 0.05);
      b.m.visible = b.g.visible = true;
      b.m.position.set(x, 1.6 + Math.sin(time * 2.5 + ph) * 0.3, z); b.m.scale.setScalar(bs);
      b.m.rotation.set(0.55, time * 1.1 + ph, 0.35);
      b.g.position.set(x, 0.8, z); const gs = bs * (2.6 + Math.sin(time * 5 + ph) * 0.3); b.g.scale.set(gs, gs, 1);
    }
    for (let k = n; k < T.boxes.length; k++) T.boxes[k].m.visible = T.boxes[k].g.visible = false;
  }
  // Rakete
  {
    const p = player, t = p.dir ? Math.min(1, p.acc) : 1, on = state !== 'won';
    T.rocket.visible = T.rShadow.visible = on;
    const x = p.px + (p.x - p.px) * t + 0.5 - cols / 2, z = p.py + (p.y - p.py) * t + 0.5 - rows / 2;
    const sc = 0.62 * S * 0.7, moving = !!p.dir;
    const want = Math.atan2(-p.face[0], -p.face[1]);
    let cur = T.rocket.rotation.y, d = want - cur; d = Math.atan2(Math.sin(d), Math.cos(d));
    T.rocket.rotation.y = cur + d * Math.min(1, dt * 14);
    const hover = 1.6 + Math.sin(time * 3) * 0.15;
    T.rocket.position.set(x, hover, z); T.rocket.scale.setScalar(sc);
    T.rk.rotation.z = moving ? Math.sin(time * 7) * 0.12 : Math.sin(time * 2) * 0.05;
    const fl = moving ? 1 + Math.sin(time * 40) * 0.18 : 0.35;
    T.flame.scale.set(1, fl * (speedT > 0 ? 1.5 : 1), 1); T.flame2.scale.set(1, fl, 1);
    T.flame.material.color.set(speedT > 0 ? 0xff6a20 : 0xffb330);
    T.rGlow.visible = on;
    T.rGlow.material.color.set(shieldT > 0 ? '#b9f27c' : speedT > 0 ? '#ff9a3c' : '#7fe8ff'); T.rGlow.material.opacity = 0.75 + Math.sin(time * 5) * 0.15;
    T.rGlow.position.set(x, hover, z); T.rGlow.scale.set(sc * 11, sc * 11, 1);
    T.rRing.visible = on; const rs = sc * (12 + Math.sin(time * 5) * 1.2); T.rRing.rotation.z = time * 1.2;
    T.rRing.position.set(x, 0.07, z); T.rRing.scale.set(rs, rs, 1); T.rRing.material.color.set(shieldT > 0 ? '#b9f27c' : '#7fe8ff');
    T.rShadow.position.set(x, 0.05, z); T.rShadow.scale.set(sc * 1.6, sc * 2.6, 1); T.rShadow.rotation.z = T.rocket.rotation.y;
  }
  T.renderer.render(T.scene, T.camera);
}
