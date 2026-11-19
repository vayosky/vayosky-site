// Space Slice · Die 24 Bosse, Schussfarben, Boss- und Hintergrundbilder
// 24 Pixel-Bosse aus Erols Bogen (Reihenfolge wie im Bogen, zeilenweise):
// sp = Tempo, tm = wie selten er die Richtung wechselt, rad = Groesse, pic = passende Bilder (Name oder Nummer einer gezeichneten Szene)
const BOSS = [
  { name: tr('Mech-Spinne'), sp: 1, tm: 1, rad: 0.95, pic: ['spinnenwald'] },
  { name: tr('Skorpion'), sp: 1.05, tm: 0.5, rad: 0.95, pic: ['wueste'] },
  { name: tr('Nachtfalter'), sp: 1.25, tm: 0.5, rad: 0.95, pic: ['zauberwald'] },
  { name: tr('Stachelstern'), sp: 0.8, tm: 1, rad: 1.05, pic: ['unterwasser'] },
  { name: tr('Hai'), sp: 1.35, tm: 1.8, rad: 1.0, pic: ['riff', 'unterwasser'] },
  { name: tr('Panzerkäfer'), sp: 1.2, tm: 2.2, rad: 0.95, pic: ['wiese'] },
  { name: tr('Fledermaus'), sp: 1.3, tm: 0.5, rad: 0.95, pic: ['hoehle', 'fantasie'] },
  { name: tr('Krabbe'), sp: 1.15, tm: 1.3, rad: 1.0, pic: ['strand', 1] },
  { name: tr('Adler'), sp: 1.35, tm: 1.2, rad: 1.0, pic: ['berggipfel', 0] },
  { name: tr('Seeschlange'), sp: 1.1, tm: 0.6, rad: 1.0, pic: ['dschungelfluss'] },
  { name: tr('Wolf'), sp: 1.25, tm: 1.5, rad: 1.0, pic: ['winterburg'] },
  { name: tr('Qualle'), sp: 0.8, tm: 1, rad: 1.05, pic: ['nachtmeer', 'unterwasser'] },
  { name: tr('Feuerdrache'), sp: 1.05, tm: 1.4, rad: 1.1, pic: ['vulkan'] },
  { name: tr('Rochen'), sp: 1.2, tm: 1.6, rad: 1.05, pic: ['hafen'] },
  { name: tr('Krake'), sp: 0.85, tm: 1, rad: 1.1, pic: ['tiefsee', 'hafen'] },
  { name: tr('Riesenwurm'), sp: 1.0, tm: 0.6, rad: 1.05, pic: ['duenen', 5] },
  { name: tr('Tintenfisch'), sp: 1.1, tm: 1, rad: 1.0, pic: ['korallen', 'unterwasser'] },
  { name: tr('Nashorn'), sp: 1.3, tm: 2.5, rad: 1.1, pic: ['savanne', 'wiese'] },
  { name: tr('Wespe'), sp: 1.45, tm: 0.7, rad: 0.95, pic: ['obstgarten', 4] },
  { name: tr('Stachelhai'), sp: 1.4, tm: 1.8, rad: 1.0, pic: ['packeis', 'hafen'] },
  { name: tr('Schattenrochen'), sp: 1.25, tm: 1.4, rad: 1.05, pic: ['mondmeer', 'unterwasser'] },
  { name: tr('Tausendfüssler'), sp: 1.15, tm: 0.5, rad: 1.0, pic: ['dschungel', 'zauberwald'] },
  { name: tr('Eisvogel'), sp: 1.4, tm: 1.0, rad: 1.0, pic: ['schloss'] },
  { name: tr('Kristallpanzer'), sp: 0.75, tm: 1.5, rad: 1.2, pic: ['kristallhoehle', 'tempel'] }
];
const BOSS_ORDER = BOSS.map((_, i) => i);
const SHOT_COL = ['#f62b13', '#3ce02b', '#f029f2', '#fc911e', '#2780fc', '#f9361a', '#ca23f3', '#f96017', '#288dfa', '#19bea9', '#f9531a', '#f727e4',
                  '#fa501b', '#2898fc', '#26c523', '#fb6e1e', '#2172fc', '#1bb51f', '#fa6418', '#f92c20', '#f72af4', '#f9371e', '#2ea5fa', '#3bd828'];
const loadImg = src => { const o = { img: null, ok: false }; try { o.img = new Image(); o.img.onload = () => { o.ok = true; }; o.img.src = src; } catch (err) {} return o; };
const BSHEET = loadImg('img/bosse.png'), SSHEET = loadImg('img/schuesse.png');
const PICS = {};
// Bilder, die noch nicht geliefert sind, werden einfach uebersprungen (dann gilt das Ersatzbild in der Liste des Bosses)
['spinnenwald', 'unterwasser', 'wiese', 'dschungelfluss', 'wueste', 'zauberwald', 'tempel', 'fantasie', 'winterburg', 'vulkan', 'hafen', 'schloss',
 'riff', 'hoehle', 'strand', 'berggipfel', 'nachtmeer', 'tiefsee', 'duenen', 'korallen', 'savanne', 'obstgarten', 'packeis', 'mondmeer',
 'dschungel', 'kristallhoehle'].forEach(nm => { PICS[nm] = loadImg('img/' + nm + '.jpg'); });
