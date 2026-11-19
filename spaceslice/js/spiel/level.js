// Space Slice · Levelaufbau, Steinblöcke, Levelauswahl
function startLevel() {
  chooseGrid();
  fitCanvas();
  grid = new Uint8Array(cols * rows);
  borderCount = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) { grid[idx(x, y)] = SAFE; borderCount++; }
  }
  lostInLvl = 0; fuse = null; fx = []; sparx = [];
  if (level >= SPARX_LVL) for (let k = 0; k < 1; k++) sparx.push({ x: Math.floor(cols * (k ? 0.15 : 0.5)), y: 0, dir: [k ? -1 : 1, 0], acc: 0, wait: 3 + k * 2 });
  const sx = Math.floor(cols / 2), sy = rows - 1;
  player = { x: sx, y: sy, px: sx, py: sy, dir: null, want: null, drawing: false, acc: 0, face: [0, -1], trail: [] };
  const iw = cols * cell * 2, ih = rows * cell * 2;
  // Bild zum Freilegen: das erste geladene Bild aus der Liste des Bosses, sonst eine gezeichnete Szene
  const bt = BOSS_ORDER[(level - 1) % BOSS_ORDER.length];
  let pick = null;
  for (const c of BOSS[bt].pic) {
    if (typeof c === 'number') { pick = makeScene(c, iw, ih); break; }
    if (PICS[c] && PICS[c].ok) { pick = fitImage(PICS[c].img, iw, ih); break; }
  }
  bgImg = userImg ? fitImage(userImg, iw, ih) : pick || makeScene((level - 1) % 6, iw, ih);
  coverImg = makeCover(iw, ih, level);
  el('overlay').classList.remove('won');
  if (level === SPARX_LVL || level === FUSE_LVL) {
    const key = level === SPARX_LVL ? 'seenSparx' : 'seenFuse';
    let seen = false; try { seen = localStorage.getItem(key) === '1'; localStorage.setItem(key, '1'); } catch (err) {}
    if (!seen) setTimeout(() => { say(level === SPARX_LVL ? tr('⚡ Neu: Ein Funke läuft auf dem Rand – bleib nicht stehen!') : tr('🔥 Neu: Bleibst du im Feld stehen, brennt eine Zündschnur deine Linie entlang!')); msgT = 5; }, 600);
  }
  // Feste Hindernisse: Steinbloecke, an denen Spieler und Gegner nicht vorbeikommen.
  // Ihre Plaetze werden aus der Levelnummer berechnet und sind deshalb bei jedem Versuch gleich.
  blocks = [];
  if (level >= WORLD2) {
    let seed = (level * 7919 + (cols > rows ? 104729 : 0)) >>> 0;
    const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const fancy = level >= STONE_FANCY, edges = level >= STONE_EDGE;
    const nB = Math.min(fancy ? 7 : 6, 3 + Math.floor((level - WORLD2) / 2)), m = 3 * S;
    const taken = new Uint8Array(grid.length);         // Steine plus Abstandszone
    for (let tries = 0; tries < 800 && blocks.length < nB; tries++) {
      // Form waehlen (Raster in Kacheln zu S Feldern) und zufaellig drehen
      let mask;
      if (!fancy) { const w = 3 + Math.floor(rnd() * 2), h = 3 + Math.floor(rnd() * 2); mask = Array.from({ length: h }, () => 'X'.repeat(w)); }
      else {
        mask = STONE_SHAPES[Math.floor(rnd() * STONE_SHAPES.length)];
        for (let r = Math.floor(rnd() * 4); r > 0; r--) mask = mask[0].split('').map((_, c) => mask.map(row => row[c]).reverse().join(''));
      }
      const w = mask[0].length * S, h = mask.length * S;
      let x, y;
      if (edges && rnd() < 0.45) {                        // an den Rand oder in eine Ecke legen
        const side = Math.floor(rnd() * 4), along = rnd(), corner = rnd() < 0.4;
        if (side === 0) { y = 1; x = corner ? (along < 0.5 ? 1 : cols - 1 - w) : Math.round(1 + along * (cols - 2 - w)); }
        else if (side === 1) { x = cols - 1 - w; y = corner ? (along < 0.5 ? 1 : rows - 1 - h) : Math.round(1 + along * (rows - 2 - h)); }
        else if (side === 2) { x = 1; y = corner ? (along < 0.5 ? 1 : rows - 1 - h) : Math.round(1 + along * (rows - 2 - h)); }
        else { y = rows - 1 - h; x = corner ? (along < 0.5 ? 1 : cols - 1 - w) : Math.round(1 + along * (cols - 2 - w)); }
      } else {
        // Lage als Anteil des Feldes, damit sie auf jedem Bildschirm an derselben Stelle liegen
        x = Math.round((0.12 + rnd() * 0.76) * cols - w / 2); y = Math.round((0.12 + rnd() * 0.62) * rows - h / 2);
        if (x < 5 * S || y < 5 * S || x + w > cols - 5 * S || y + h > rows - 8 * S) continue;
      }
      if (x < 1 || y < 1 || x + w > cols - 1 || y + h > rows - 1) continue;
      // Startplatz der Figur unten in der Mitte bleibt frei
      if (y + h > rows - 9 * S && x < cols * 0.5 + 9 * S && x + w > cols * 0.5 - 9 * S) continue;
      const cells = [];
      for (let ty = 0; ty < mask.length; ty++) for (let tx = 0; tx < mask[0].length; tx++) if (mask[ty][tx] === 'X')
        for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) cells.push([x + tx * S + xx, y + ty * S + yy]);
      if (cells.some(([cx, cy]) => taken[idx(cx, cy)])) continue;
      const set = new Set(cells.map(([cx, cy]) => idx(cx, cy)));
      const col = fancy ? STONE_COLS[Math.floor(rnd() * STONE_COLS.length)] : STONE_GREY;
      blocks.push({ x, y, w, h, cells, set, col });
      for (const [cx, cy] of cells) {
        grid[idx(cx, cy)] = BLOCK;
        for (let dy = -m; dy <= m; dy++) for (let dx = -m; dx <= m; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) taken[idx(nx, ny)] = 1;
        }
      }
    }
  }
  spiders = [];
  const bsp = Math.min(13, 5.5 + level * 1.2), nSmall = Math.min(6, 1 + level);
  const mkSp = (boss, sp) => {
    const a = Math.random() * Math.PI * 2, m = 3 * S;
    let x = 0, y = 0;
    for (let k = 0; k < 60; k++) {       // Startplatz mit Abstand zu den Steinen suchen
      x = cols * (0.25 + 0.5 * Math.random()); y = rows * (0.15 + 0.4 * Math.random());
      if (!blocks.some(bk => x > bk.x - m && x < bk.x + bk.w + m && y > bk.y - m && y < bk.y + bk.h + m)) break;
    }
    spiders.push({ boss, x, y, vx: Math.cos(a) * sp * S, vy: Math.sin(a) * sp * S, turn: 1 + Math.random() * 2 });
  };
  bossType = BOSS_ORDER[(level - 1) % BOSS_ORDER.length];
  const B = BOSS[bossType];
  mkSp(true, bsp * B.sp);
  spiders[0].tm = B.tm; spiders[0].rad = B.rad;
  for (let i = 0; i < nSmall; i++) mkSp(false, bsp * 1.2);
  abReset();                        // v78: Boss-Fähigkeit für dieses Level vorbereiten
  lastSafe = borderCount;
  shots = []; shotT = 4; canCont = false; contN = 0; refreshCont();
  items = []; itemTimer = 2; freezeT = 0; speedT = 0; shieldT = 0; slowT = 0; pct = 0;
  for (let i = 0; i < 6; i++) spawnItem(i < 4 ? 'coin' : 'gem');
  endTravel(false); pendingTravel = 0;
  say(((level - 1) % MISSION_LEN === 0 ? tr('Galaxie ') + missionOf(level) + ' · ' : '') + tr('Boss: ') + B.name + (level === WORLD2 ? tr(' · neu: Steine') : level === STONE_FANCY ? tr(' · neu: bunte Steine') : level === STONE_EDGE ? tr(' · Steine auch am Rand') : level === 2 ? tr(' · er schiesst!') : ''));
  if (inv.life > 0 && lives < 5) { inv.life--; lives++; saveShop(); say('❤ Extraleben eingesetzt · Boss: ' + B.name); }
  state = 'play';
  bossIntro(bossType);                                             // v76: Boss-Vorstellung
  el('overlay').classList.add('hidden');
  picShownAt = 0; el('picHint').classList.add('hidden');
  if (!replay) try { localStorage.setItem('lastLvl', String(level)); } catch (err) {}
  fillLevels(); refreshMission();
  updateHud();
}

// Levelauswahl: alle Level frei waehlbar (Prototyp zum Testen); das zuletzt gespielte Level wird gemerkt
let pickedLevel = 0;
function fillLevels() {
  // 99 Level waehlbar; nach 24 Level beginnt eine neue Runde mit denselben Bossen, aber schneller und mit mehr Steinen
  const sel = el('lvlSel'), n = Math.max(99, level + 4), R = BOSS_ORDER.length;
  let h = '';
  for (let i = 1; i <= n; i++) {
    const tag = i >= STONE_EDGE ? tr(' · Steine bunt, auch am Rand') : i >= STONE_FANCY ? tr(' · Steine bunt') : i >= WORLD2 ? tr(' · Steine') : '';
    const runde = Math.floor((i - 1) / R) + 1;
    if ((i - 1) % R === 0) h += (i > 1 ? '</optgroup>' : '') + '<optgroup label="Runde ' + runde + '">';
    h += '<option value="' + i + '">Level ' + i + ' – ' + BOSS[BOSS_ORDER[(i - 1) % R]].name + tag + '</option>';
  }
  h += '</optgroup>';
  sel.innerHTML = h; sel.value = String(level);
}

