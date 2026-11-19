// Space Slice · Figur, Linie schliessen, Spinnen, Geschosse, Rand des offenen Bereichs
function stopPlayer() {
  player.dir = null; player.want = null; player.px = player.x; player.py = player.y; player.acc = 0;
}

function stepPlayer() {
  const p = player;
  if (p.want) {
    const rev = p.drawing && p.dir && p.want[0] === -p.dir[0] && p.want[1] === -p.dir[1];
    if (!rev) p.dir = p.want;
  }
  if (!p.dir) return;
  const tx = p.x + p.dir[0], ty = p.y + p.dir[1];
  if (tx < 0 || ty < 0 || tx >= cols || ty >= rows) { stopPlayer(); return; }
  const t = grid[idx(tx, ty)];
  if (t === TRAIL || t === BLOCK) { stopPlayer(); return; }
  if (t === SAFE && !p.drawing && !shareOpen(p.x, p.y, tx, ty)) { stopPlayer(); return; }
  if (t === SAFE) p.canEnter = false;
  if (t === OPEN && !p.drawing && !p.canEnter) { stopPlayer(); return; }
  p.px = p.x; p.py = p.y; p.x = tx; p.y = ty; p.face = p.dir;
  if (t === OPEN) {
    if (!p.drawing) p.trail = [[p.px, p.py]];
    grid[idx(tx, ty)] = TRAIL; p.drawing = true; p.trail.push([tx, ty]);
  }
  else if (p.drawing) {
    const saved = fuse && fuse.hit; fuse = null;
    p.drawing = false; p.trail = []; p.canEnter = false; closeTrail(); stopPlayer();
    if (saved) { say(tr('😅 Gerettet!')); sfx('bonus'); }
  }
}

function closeTrail() {
  // Linie wird fest; danach bleibt genau ein offener Bereich verdeckt.
  const n = grid.length, comp = new Int32Array(n).fill(-1), sizes = [], stack = [];
  const wasSafe = new Uint8Array(n); for (let i = 0; i < n; i++) wasSafe[i] = grid[i] === SAFE ? 1 : 0;
  const score0 = score, cx0 = player.x, cy0 = player.y;      // v76: fuer die schwebenden Punkte
  for (let i = 0; i < n; i++) if (grid[i] === TRAIL) grid[i] = SAFE;
  for (let s = 0; s < n; s++) {
    if (grid[s] !== OPEN || comp[s] >= 0) continue;
    const id = sizes.length; let count = 0;
    comp[s] = id; stack.push(s);
    while (stack.length) {
      const i = stack.pop(), x = i % cols; count++;
      const nb = [i - cols, i + cols, x > 0 ? i - 1 : -1, x < cols - 1 ? i + 1 : -1];
      for (const j of nb) {
        if (j >= 0 && j < n && grid[j] === OPEN && comp[j] < 0) { comp[j] = id; stack.push(j); }
      }
    }
    sizes.push(count);
  }
  // Dunkel bleibt der Bereich mit der Boss-Spinne; alle anderen Bereiche werden aufgedeckt.
  const boss = spiders.find(sp => sp.boss);
  let big = boss ? comp[idx(Math.floor(boss.x), Math.floor(boss.y))] : -1;
  const bossLost = big < 0;
  if (big < 0) sizes.forEach((sz, k) => { if (big < 0 || sz > sizes[big]) big = k; });
  let safe = 0; const keep = [];
  for (let i = 0; i < n; i++) {
    if (grid[i] === OPEN) { if (comp[i] === big) keep.push(i); else grid[i] = SAFE; }
    if (grid[i] === SAFE) safe++;
  }
  // Sonderfall (Schild): Boss stand auf der Linie -> zurueck ins dunkle Feld setzen
  if (boss && bossLost && keep.length) {
    const i = keep[Math.floor(Math.random() * keep.length)];
    boss.x = (i % cols) + 0.5; boss.y = Math.floor(i / cols) + 0.5;
  }
  // Hindernisse, die ganz im aufgedeckten Bereich liegen, loesen sich auf
  blocks = blocks.filter(b => {
    for (const [cx, cy] of b.cells) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && grid[idx(nx, ny)] === OPEN) return true;
    }
    for (const [cx, cy] of b.cells) grid[idx(cx, cy)] = SAFE;
    safe += b.cells.length;
    return false;
  });
  // Kleine Spinnen in aufgedeckten Bereichen sind gefangen
  const before = spiders.length;
  spiders = spiders.filter(sp => { const keep = sp.boss || grid[idx(Math.floor(sp.x), Math.floor(sp.y))] === OPEN; if (!keep) burst(sp.x, sp.y, '#ff9a3c', 14, 1.1); return keep; });
  const caught = before - spiders.length;
  try {                                   // v68: Maske der neu aufgedeckten Felder fuer den Lichtschimmer
    if (!revealCv || revealCv.width !== cols || revealCv.height !== rows) { revealCv = document.createElement('canvas'); revealCv.width = cols; revealCv.height = rows; }
    const rc = revealCv.getContext('2d'), im = rc.createImageData(cols, rows);
    for (let i = 0; i < n; i++) if (grid[i] === SAFE && !wasSafe[i]) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = im.data[i * 4 + 3] = 255; }
    rc.putImageData(im, 0, 0); revealT = REVEAL_SEC;
  } catch (err) {}
  for (const z of sparx) { respawnSparx(z); z.wait = 2; }   // v67b: Belohnung fuer jeden Schnitt – Funke weit weg und kurz harmlos
  const gainedPct = Math.max(0, safe - lastSafe) / Math.max(1, grid.length - borderCount) * 100;
  score += Math.round(Math.max(0, safe - lastSafe) * 5 / (S * S)) + caught * 500; lastSafe = safe;
  if (caught) say(caught === 1 ? tr('🕷 Spinne gefangen! +500') : '🕷 ' + caught + tr(' Spinnen gefangen! +') + caught * 500);
  if (gainedPct >= 30 && state === 'play') {          // v67: Mega-Slice – mutiger grosser Schnitt
    score += 1000; wallet += 1; slowT = Math.max(slowT, 3); flashT = Math.max(flashT, 0.15);
    say(tr('🔥 Mega-Slice! +1000 · +1 🪙')); sfx('bonus');
    buzz([30, 40, 70]);                                            // v76
    burst(player.x + 0.5, player.y + 0.5, '#ffd23f', 30, 1.5);
  }
  let loot = 0, crate = false;
  items = items.filter(it => {
    if (grid[idx(it.x, it.y)] !== SAFE) return true;
    if (it.type === 'coin') { loot += 100; wallet += 1; burst(it.x + 0.5, it.y + 0.5, '#ffd23f', 8, 0.8); return false; }
    if (it.type === 'gem') { loot += 300; wallet += 2; burst(it.x + 0.5, it.y + 0.5, '#5ee0e6', 12, 1); return false; }
    crate = true;
    if (it.type === 'slow') { slowT = 6; say('🐌 Gegner in Zeitlupe'); }
    else if (it.type === 'bomb') {
      const k = spiders.filter(sp => !sp.boss).length;
      spiders = spiders.filter(sp => sp.boss); score += k * 300;
      say('💥 Alle kleinen Spinnen weg! +' + k * 300);
    }
    else if (it.type === 'freeze') { freezeT = FREEZE_SEC; say('❄ Spinnen eingefroren'); }
    else if (it.type === 'speed') { speedT = SPEED_SEC; say('⚡ Turbo'); }
    else if (it.type === 'shield') { shieldT = 6; say('🛡 Linie geschützt'); }
    else if (it.type === 'life') { lives = Math.min(5, lives + 1); say('❤ Extraleben'); }
    else { score += 500; say('★ +500 Punkte'); }
    return false;
  });
  // v58: gefangene Spinnen geben nur noch Punkte, keine Muenzen
  if (loot || caught) saveShop();
  if (loot) { score += loot; if (!crate && !caught) say('💰 +' + loot + tr(' Punkte')); }
  sfx(crate ? 'bonus' : caught ? 'catch' : loot ? 'coin' : 'close');
  relocatePlayer();
  fxPoints(cx0, cy0, score - score0, gainedPct >= 30);           // v76: «+Punkte» an der Schnittstelle
  const blockCells = blocks.reduce((a, b) => a + b.cells.length, 0);       // Hindernisse zaehlen nicht gegen den Spieler
  pct = (safe + blockCells - borderCount) / (grid.length - borderCount) * 100;
  updateHud();
  if (pct >= goal()) endGame(true);
}

function spawnItem(kind) {
  for (let k = 0; k < 60; k++) {
    const x = 3 * S + Math.floor(Math.random() * (cols - 6 * S)), y = 3 * S + Math.floor(Math.random() * (rows - 6 * S));
    if (grid[idx(x, y)] !== OPEN) continue;
    if (items.some(it => Math.abs(it.x - x) + Math.abs(it.y - y) < 6 * S)) continue;
    const pool = ['freeze', 'speed', 'shield', 'points', 'slow', 'bomb'];
    if (lives < 5) pool.push('life');
    items.push({ x, y, type: kind || pool[Math.floor(Math.random() * pool.length)] });
    return;
  }
}

function moveSpider(s, dt) {
  s.turn -= dt;
  if (s.turn <= 0) {
    const sp = Math.hypot(s.vx, s.vy), a = Math.atan2(s.vy, s.vx) + (Math.random() - 0.5) * 1.8;
    s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; s.turn = (0.8 + Math.random() * 2) * (s.tm || 1);
  }
  const r = (s.boss ? (s.rad || 0.8) * 1.35 * bossScale() : 0.35) * S;
  const nx = s.x + s.vx * dt;
  if (solid(cellAt(nx + Math.sign(s.vx) * r, s.y))) s.vx = -s.vx; else s.x = nx;
  const ny = s.y + s.vy * dt;
  if (solid(cellAt(s.x, ny + Math.sign(s.vy) * r))) s.vy = -s.vy; else s.y = ny;
}

function spiderHitsTrail(s) {
  const r = (s.boss ? (s.rad || 0.8) * 1.3 * bossScale() : 0.3) * S;
  if (cellAt(s.x, s.y) === TRAIL) return true;
  for (const q of [r, r / 2]) {
    if (cellAt(s.x + q, s.y) === TRAIL || cellAt(s.x - q, s.y) === TRAIL ||
        cellAt(s.x, s.y + q) === TRAIL || cellAt(s.x, s.y - q) === TRAIL) return true;
  }
  return false;
}

function update(dt) {
  time += dt;
  if (flashT > 0) flashT = Math.max(0, flashT - dt);
  if (revealT > 0) revealT = Math.max(0, revealT - dt);
  if (msgT > 0) msgT = Math.max(0, msgT - dt);
  for (let i = fx.length - 1; i >= 0; i--) { const q = fx[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.93; q.vy *= 0.93; q.life -= dt; if (q.life <= 0) fx.splice(i, 1); }
  if (state !== 'play') return;
  if (freezeT > 0) freezeT = Math.max(0, freezeT - dt);
  if (speedT > 0) speedT = Math.max(0, speedT - dt);
  if (shieldT > 0) shieldT = Math.max(0, shieldT - dt);
  if (slowT > 0) slowT = Math.max(0, slowT - dt);

  const p = player;
  if (p.dir || p.want) {
    p.acc += dt * (speedT > 0 ? BOOST_SPEED : BASE_SPEED);
    while (p.acc >= 1 && state === 'play') {
      p.acc -= 1; stepPlayer();
      if (!p.dir) { p.acc = 0; break; }
    }
  }
  if (state !== 'play') return;

  for (const s of spiders) {
    for (let k = 0; k < 4; k++) {      // in kleinen Schritten, damit kein Gegner ueber die duenne Linie springt
      if (freezeT <= 0) moveSpider(s, (slowT > 0 ? dt * 0.4 : dt) / 4);
      if (shieldT <= 0 && spiderHitsTrail(s)) { if (!igniteAt(s.x, s.y)) { loseLife(); return; } }
    }
  }

  // v67: Funken laufen auf dem sicheren Rand; Zuendschnur brennt die Linie entlang, wenn der Spieler im Feld stehen bleibt
  if (sparx.length && pct >= SPARX_OFF) {          // v67c: ab 75 % erlischt der Funke (der Rand wird sonst zu kurz)
    for (const z of sparx) burst(z.x + 0.5, z.y + 0.5, '#ff3d6e', 18, 1);
    sparx = []; say(tr('✨ Der Funke ist erloschen!'));
  }
  if (sparx.length && freezeT <= 0) {
    for (const z of sparx) {
      if (z.wait > 0) { z.wait -= dt; continue; }
      z.acc += dt * BASE_SPEED * 0.32 * (slowT > 0 ? 0.4 : 1);
      while (z.acc >= 1) { z.acc -= 1; stepSparx(z); }
      if (shieldT <= 0 && !player.drawing && z.wait <= 0 && Math.abs(z.x - player.x) + Math.abs(z.y - player.y) <= 1) {
        say(tr('⚡ Vom Funken erwischt!')); respawnSparx(z); loseLife(); return;
      }
    }
  }
  if (player.drawing && player.trail.length > 1) {
    if (fuse && fuse.hit) {            // v73: Lunte nach einem Treffer – brennt schneller, als die Rakete fliegt
      if (freezeT <= 0 && shieldT <= 0) fuse.pos += dt * LUNTE_SPEED * (slowT > 0 ? 0.4 : 1);
      if (fuse.pos >= player.trail.length - 1) { say(tr('💥 Die Lunte hat dich erreicht!')); fuse = null; loseLife(); return; }
    } else if (level >= FUSE_LVL) {
      if (!fuse) fuse = { idle: 0, pos: 0, from: 0 };
      if (player.dir) fuse.idle = 0; else fuse.idle += dt;
      if (fuse.idle > 1 && freezeT <= 0 && shieldT <= 0) {
        if (!fuse.lit) { fuse.lit = true; sfx('shoot'); }
        fuse.pos += dt * FUSE_SPEED * (slowT > 0 ? 0.4 : 1);
        if (fuse.pos >= player.trail.length - 1) { say(tr('🔥 Die Zündschnur hat dich erreicht!')); fuse = null; loseLife(); return; }
      }
    }
  } else fuse = null;

  // Boss greift an: ab Level 2 schiesst er in Abstaenden, ab Level 5 zielt er auf die offene Linie
  const boss = spiders.find(sp => sp.boss), slowF = slowT > 0 ? 0.4 : 1;
  if (boss && level >= 2 && freezeT <= 0) {
    shotT -= dt * slowF;
    if (shotT <= 0) {
      shotT = Math.max(2.2, 6.5 - level * 0.2);
      const n = level < 8 ? 1 : level < 16 ? 3 : 5, sp = (7 + Math.min(6, level * 0.3)) * S;
      const ang = level >= 5 && player.drawing ? Math.atan2(player.y - boss.y, player.x - boss.x) : Math.random() * Math.PI * 2;
      for (let i = 0; i < n; i++) { const a = ang + (i - (n - 1) / 2) * 0.3; shots.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp }); }
      sfx('shoot');
    }
  }
  if (freezeT <= 0) {
    for (let i = shots.length - 1; i >= 0; i--) {
      const sh = shots[i]; let gone = false;
      for (let k = 0; k < 4 && !gone; k++) {
        sh.x += sh.vx * dt * slowF / 4; sh.y += sh.vy * dt * slowF / 4;
        const v = cellAt(sh.x, sh.y);
        if (solid(v)) gone = true;
        else if (v === TRAIL && shieldT <= 0) { if (!igniteAt(sh.x, sh.y)) { loseLife(); return; } gone = true; }
      }
      if (gone) shots.splice(i, 1);
    }
  }
  itemTimer -= dt;
  if (itemTimer <= 0) { if (items.filter(it => it.type !== 'coin' && it.type !== 'gem').length < 2) spawnItem(); itemTimer = Math.min(12, 4 + level); }
  updateHud();
}

/* ---------- Rand des offenen Bereichs ---------- */
function isFrontier(x, y) {
  if (grid[idx(x, y)] !== SAFE) return false;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && grid[idx(nx, ny)] === OPEN) return true;
  }
  return false;
}

// Zwei Randfelder gehoeren zur selben Kante, wenn beide dasselbe verdeckte Feld oder denselben Steinblock beruehren.
function shareOpen(ax, ay, bx, by) {
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = ax + dx, ny = ay + dy;
    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
    const v = grid[idx(nx, ny)];
    if (v !== OPEN && v !== BLOCK) continue;       // auch ein Steinblock zaehlt als gemeinsame Kante
    if (Math.abs(nx - bx) <= 1 && Math.abs(ny - by) <= 1) return true;
  }
  return false;
}

function relocatePlayer() {
  const p = player;
  if (isFrontier(p.x, p.y)) return;
  const seen = new Uint8Array(grid.length), q = [idx(p.x, p.y)];
  seen[q[0]] = 1;
  for (let h = 0; h < q.length; h++) {
    const i = q[h], x = i % cols, y = (i - x) / cols;
    if (isFrontier(x, y)) { p.x = x; p.y = y; return; }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const j = idx(nx, ny);
      if (!seen[j] && grid[j] === SAFE) { seen[j] = 1; q.push(j); }
    }
  }
}

