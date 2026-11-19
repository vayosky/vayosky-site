// Space Slice · Funke auf dem Rand, Lunte, Leben verlieren
const SPARX_LVL = 15, SPARX_OFF = 75, FUSE_LVL = 20, FUSE_SPEED = 8 * S, LUNTE_SPEED = BASE_SPEED * 1.35;
// v73 (Idee von Hans): Treffer auf der offenen Linie zuenden eine Lunte, die zur Figur brennt – wer vorher den Rand erreicht, ist gerettet
function igniteAt(x, y) {
  const tr0 = player.trail;
  if (!player.drawing || tr0.length < 2) return false;
  let k = 0, bd = 1e9;
  for (let i = 0; i < tr0.length; i++) { const d = (tr0[i][0] + 0.5 - x) ** 2 + (tr0[i][1] + 0.5 - y) ** 2; if (d < bd) { bd = d; k = i; } }
  if (fuse && fuse.hit) { if (k > fuse.pos) fuse.pos = k; return true; }
  fuse = { hit: true, pos: k, from: k, lit: true };
  sfx('hit'); flashT = Math.max(flashT, 0.15); say(tr('🔥 Lunte brennt – schnell zum Rand!'));
  return true;
}
function burst(x, y, col, n = 12, sp = 1) {
  for (let i = 0; i < n && fx.length < 140; i++) { const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 7) * S * sp; fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 0.25 + Math.random() * 0.3, life: 0.4 + Math.random() * 0.35, max: 0.75, col }); }
}
const edgeOk = (x, y, nx, ny) => nx >= 0 && ny >= 0 && nx < cols && ny < rows && grid[idx(nx, ny)] === SAFE && shareOpen(x, y, nx, ny);
function stepSparx(z) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const ok = dirs.filter(d => edgeOk(z.x, z.y, z.x + d[0], z.y + d[1]));
  if (!ok.length) { respawnSparx(z); return; }
  const fwd = ok.filter(d => !(d[0] === -z.dir[0] && d[1] === -z.dir[1]));
  const pool = fwd.length ? fwd : ok;
  const straight = pool.find(d => d[0] === z.dir[0] && d[1] === z.dir[1]);
  z.dir = straight && Math.random() > 0.15 ? straight : pool[Math.floor(Math.random() * pool.length)];
  z.x += z.dir[0]; z.y += z.dir[1];
}
function respawnSparx(z) {         // an eine Randstelle weit weg vom Spieler setzen
  let best = null, bd = -1;
  for (let k = 0; k < 400; k++) {
    const i = Math.floor(Math.random() * grid.length), x = i % cols, y = Math.floor(i / cols);
    if (grid[i] !== SAFE) continue;
    let edge = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (edgeOk(x, y, x + dx, y + dy)) { edge = true; break; }
    if (!edge) continue;
    const d = Math.abs(x - player.x) + Math.abs(y - player.y);
    if (d > bd) { bd = d; best = [x, y]; }
  }
  if (best) { z.x = best[0]; z.y = best[1]; }
  z.wait = Math.max(z.wait, 1.5); z.acc = 0;
}
function loseLife() {
  lostInLvl++; lives--; flashT = 0.4; sfx('hit'); shots = [];
  if (lives <= 0) { updateHud(); endGame(false); return; }
  const p = player;
  for (let i = 0; i < grid.length; i++) if (grid[i] === TRAIL) grid[i] = OPEN;
  if (p.trail.length) { p.x = p.trail[0][0]; p.y = p.trail[0][1]; }
  p.drawing = false; p.trail = []; p.canEnter = false; stopPlayer();
  freezeT = Math.max(freezeT, 1);
  updateHud();
}

