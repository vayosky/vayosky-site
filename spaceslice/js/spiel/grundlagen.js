// Space Slice · Grundwerte, Hilfsfunktionen, Spielzustand
const OPEN = 0, SAFE = 1, TRAIL = 2, BLOCK = 3;
let R3D = false;                  // 3D-Darstellung aktiv (wird beim Start eingeschaltet, wenn WebGL geht)   // BLOCK = festes Hindernis
const S = 2, PADC = 3 * S;        // S = Feinheit des Rasters; PADC = Rand um das Feld in Feldern
const goal = () => Math.min(95, 88 + (level - 1)), FREEZE_SEC = 4, SPEED_SEC = 6;
const BASE_SPEED = 15 * S, BOOST_SPEED = 27 * S;
const ITEM = { freeze: ['#6cc4ff', '❄'], speed: ['#ff9a3c', '⚡'], shield: ['#b9f27c', '🛡'], life: ['#ff8fa3', '❤'] };

const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const stage = document.getElementById('stage');
const el = id => document.getElementById(id);

let cols = 0, rows = 0, cell = 10, U = 20, grid, borderCount = 0;
let player, spiders = [], items = [], blocks = [], sparx = [], fuse = null, fx = [];
let replay = null, galSel = -1;      // v69: Wiederholung aus der Galerie
let edgePath = null, edgeKey = '', lowFx = false, fpsAcc = 0, fpsN = 0;   // v74: Leistung
let revealT = 0, revealCv = null, shimCv = null, shimCtx = null; const REVEAL_SEC = 0.75;
const solid = v => v === SAFE || v === BLOCK;
// Der Boss schrumpft mit dem Fortschritt: volle Groesse bis 40 %, danach immer kleiner bis zur Haelfte
const bossScale = () => Math.max(0.5, Math.min(1, 1 - (pct - 40) * 0.0095));
const WORLD2 = 9;                 // ab diesem Level: feste Steine (grau, rechteckig, in der Mitte)
const STONE_FANCY = 17;           // ab diesem Level: farbige Steine in verschiedenen Formen
const STONE_EDGE = 25;            // ab diesem Level: Steine auch am Rand und in den Ecken
// Formen in Kacheln (X = Stein), werden zufaellig gedreht
const STONE_SHAPES = [                       // nur Rechtecke und Quadrate
  ['XX', 'XX'], ['XXX', 'XXX', 'XXX'], ['XXXX', 'XXXX', 'XXXX', 'XXXX'],
  ['XXX', 'XXX'], ['XXXX', 'XXXX'], ['XXXXX', 'XXXXX'], ['XXXXXX', 'XXXXXX'],
  ['XXXX', 'XXXX', 'XXXX'], ['XXXXX', 'XXXXX', 'XXXXX']
];
// [Grundfarbe, helle Kante, dunkle Kante]
const STONE_GREY = ['#7b8496', '#b4bccb', '#4a5263'];
const STONE_COLS = [['#3fa9f5', '#a6dcff', '#1b5c94'], ['#e5484d', '#ffa3a6', '#8a1f23'], ['#30c46f', '#a6f0c6', '#16723f'],
                    ['#a873ec', '#dcc6ff', '#5b3393'], ['#f5a524', '#ffe0a3', '#9c5d10'], ['#25c2bb', '#a4f1ec', '#11706b']];
let state = 'start', level = 1, pct = 0;
let freezeT = 0, speedT = 0, itemTimer = 0, time = 0, slowT = 0, bossType = 0;
