// Space Slice · Spielzustand, Raster und Spielfeldgrösse
let shots = [], shotT = 4;
let bgImg = null, userImg = null, coverImg = null;
let maskCv = null, maskCtx = null, maskData = null, layer = null, lctx = null;
let lives = 3, shieldT = 0, flashT = 0, lostInLvl = 0;
let score = 0, best = 0, lastSafe = 0, msg = '', msgT = 0;
try { best = +localStorage.getItem('best') || 0; } catch (err) {}
const say = t => { msg = t; msgT = 1.8; };

const idx = (x, y) => y * cols + x;
const cellAt = (x, y) => {
  const cx = Math.floor(x), cy = Math.floor(y);
  if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) return SAFE;
  return grid[idx(cx, cy)];
};

function fitCanvas() {
  const W = stage.clientWidth - 2, H = stage.clientHeight - 2;
  const dpr0 = window.devicePixelRatio || 1;
  cell = Math.max(2, Math.floor(Math.min(W / (cols + PADC), H / (rows + PADC)) * dpr0) / dpr0);
  U = cell * S;
  // v82: in 3D schärfer (bis 2-fach statt 1,5-fach); schwache Handys (lowFx) bleiben bei 1,5
  const dpr = R3D ? Math.min(lowFx ? 1.5 : 2, window.devicePixelRatio || 1) : (window.devicePixelRatio || 1);
  cv.style.width = (cols + PADC) * cell + 'px';
  cv.style.height = (rows + PADC) * cell + 'px';
  cv.width = Math.round((cols + PADC) * cell * dpr);
  cv.height = Math.round((rows + PADC) * cell * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  maskCv = document.createElement('canvas'); maskCv.width = cols; maskCv.height = rows;
  maskCtx = maskCv.getContext('2d'); maskData = maskCtx.createImageData(cols, rows);
  layer = document.createElement('canvas'); layer.width = Math.round(cols * cell * dpr); layer.height = Math.round(rows * cell * dpr);
  lctx = layer.getContext('2d');
}

function chooseGrid() {
  const W = stage.clientWidth - 2, H = stage.clientHeight - 2;
  if (H >= W) { cols = 34 * S; rows = Math.max(30 * S, Math.min(62 * S, Math.floor(H / (W / (cols + PADC))) - PADC)); }
  else { rows = 26 * S; cols = Math.max(34 * S, Math.min(64 * S, Math.floor(W / (H / (rows + PADC))) - PADC)); }
}

