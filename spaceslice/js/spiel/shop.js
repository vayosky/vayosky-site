// Space Slice · Shop, Münzen, Boni, Weiterspielen
/* ---------- Laden: mit erspielten Muenzen Einmal-Boni kaufen ---------- */
const SHOP = [
  { k: 'speed', ic: '⚡', name: tr('Turbo'), txt: tr('Deine Figur ist 6 Sekunden schneller.'), price: 8 },
  { k: 'shield', ic: '🛡', name: tr('Schutz'), txt: tr('Deine Linie ist 6 Sekunden geschützt.'), price: 12 },
  { k: 'slow', ic: '🐌', name: tr('Zeitlupe'), txt: tr('Gegner und Geschosse sind 6 Sekunden langsam.'), price: 12 },
  { k: 'freeze', ic: '❄', name: tr('Einfrieren'), txt: tr('Gegner und Geschosse stehen 4 Sekunden still.'), price: 15 },
  { k: 'life', ic: '❤', name: tr('Extraleben'), txt: tr('Wird beim nächsten Levelstart automatisch eingesetzt.'), price: 20 }
];
let wallet = 0, inv = { speed: 0, shield: 0, slow: 0, freeze: 0, life: 0 };
try {
  const sv = JSON.parse(localStorage.getItem('shop') || 'null');
  if (sv) { wallet = Math.max(0, sv.wallet | 0); for (const k in inv) inv[k] = Math.max(0, (sv.inv && sv.inv[k]) | 0); }
} catch (err) {}
// Testmodus: unendlich Muenzen (nur zum Ausprobieren, vor einer Veroeffentlichung entfernen)
let testCoins = false;
const canPay = price => testCoins || wallet >= price;
const pay = price => { if (!testCoins) wallet -= price; };
const coinTxt = () => '🪙 ' + (testCoins ? '∞' : wallet);
function setTest(on) {
  testCoins = on; el('testOn').classList.toggle('on', on); el('testOff').classList.toggle('on', !on);
  try { localStorage.setItem('testCoins', on ? '1' : '0'); } catch (err) {}
  renderShop();
}
function saveShop() { try { localStorage.setItem('shop', JSON.stringify({ wallet, inv })); } catch (err) {} renderShop(); }
// Nach einer Niederlage gegen Muenzen an derselben Stelle weiterspielen (freigelegte Flaeche bleibt erhalten)
let canCont = false, contN = 0;
const contPrice = () => 15 * Math.pow(2, Math.min(contN, 3));        // 15, 30, 60, 120 im selben Level
function refreshCont() {
  const b = el('contBtn'), show = canCont && state === 'over';
  b.style.display = show ? '' : 'none';
  if (show) { b.textContent = tr('Hier weiterspielen · ') + contPrice() + ' 🪙'; b.disabled = !canPay(contPrice()); }
}
function continueHere() {
  if (!canCont || state !== 'over' || !canPay(contPrice())) return;
  pay(contPrice()); contN++; canCont = false;
  const p = player;
  for (let i = 0; i < grid.length; i++) if (grid[i] === TRAIL) grid[i] = OPEN;
  if (p.trail.length) { p.x = p.trail[0][0]; p.y = p.trail[0][1]; }
  p.drawing = false; p.trail = []; p.canEnter = false; stopPlayer();
  lives = 3; shots = []; shotT = 4; freezeT = Math.max(freezeT, 1.5);
  state = 'play'; el('overlay').classList.add('hidden');
  initAudio(); sfx('start'); say('Weiter geht es mit 3 Leben');
  saveShop(); updateHud();
}
const BUNDLE_PRICE = 35;                              // Paket: je 1 Turbo, Schutz, Zeitlupe, Einfrieren (einzeln 47)
const today = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
let freeDay = '';
try { freeDay = localStorage.getItem('freeDay') || ''; } catch (err) {}
function card(k, cls, ic, name, txt, own, priceTxt, enabled) {
  return '<button type="button" class="sc ' + cls + '" data-k="' + k + '"' + (enabled ? '' : ' disabled') + '><span class="sc-ic">' + ic + '</span><span class="sc-n">' + name +
         '</span><span class="sc-t">' + txt + '</span>' + (own === null ? '' : tr('<span class="sc-own">du hast ') + own + '</span>') + '<span class="sc-p">' + priceTxt + '</span></button>';
}
function renderShop() {
  el('wallet').textContent = coinTxt(); el('shopWallet').textContent = coinTxt(); el('svWallet').textContent = coinTxt();
  refreshCont();
  for (const it of SHOP) {
    if (it.k === 'life') continue;
    const b = el('bb_' + it.k); b.innerHTML = it.ic + '<i>' + inv[it.k] + '</i>'; b.classList.toggle('empty', inv[it.k] <= 0);
  }
  const life = SHOP.find(x => x.k === 'life'), freeOk = freeDay !== today();
  el('svDeals').innerHTML =
    card('free', 'free', '🎁', tr('Tagesgeschenk'), tr('5 Münzen, einmal pro Tag'), null, freeOk ? tr('Gratis') : tr('Morgen wieder'), freeOk) +
    card('life', '', life.ic, life.name, tr('beim nächsten Levelstart'), inv.life, life.price + ' 🪙', canPay(life.price)) +
    card('bundle', '', '🎒', tr('Starter-Paket'), tr('je 1 von allen vier Boni'), null, BUNDLE_PRICE + ' 🪙', canPay(BUNDLE_PRICE));
  el('svItems').innerHTML = SHOP.filter(it => it.k !== 'life').map(it => card(it.k, '', it.ic, it.name, it.txt, inv[it.k], it.price + ' 🪙', canPay(it.price))).join('');
}
function buy(k) {
  if (k === 'free') {
    if (freeDay === today()) return;
    freeDay = today(); try { localStorage.setItem('freeDay', freeDay); } catch (err) {}
    wallet += 5;
  } else if (k === 'bundle') {
    if (!canPay(BUNDLE_PRICE)) return;
    pay(BUNDLE_PRICE); ['speed', 'shield', 'slow', 'freeze'].forEach(x => { inv[x]++; });
  } else {
    const it = SHOP.find(x => x.k === k);
    if (!it || !canPay(it.price)) return;
    pay(it.price); inv[k]++;
  }
  initAudio(); sfx('coin'); saveShop();
}
function useBonus(k) {
  if (state !== 'play' || !(inv[k] > 0)) return;
  inv[k]--;
  if (k === 'freeze') { freezeT = FREEZE_SEC; say('❄ Eingefroren'); }
  else if (k === 'slow') { slowT = 6; say('🐌 Zeitlupe'); }
  else if (k === 'shield') { shieldT = 6; say('🛡 Linie geschützt'); }
  else if (k === 'speed') { speedT = SPEED_SEC; say('⚡ Turbo'); }
  sfx('bonus'); saveShop();
}
setTest(testCoins);
el('testOn').addEventListener('click', () => setTest(true));
el('testOff').addEventListener('click', () => setTest(false));
el('contBtn').addEventListener('click', continueHere);
el('contBtn').addEventListener('pointerdown', e => e.stopPropagation());
const shopClick = e => { const c = e.target && e.target.closest ? e.target.closest('[data-k]') : null; if (c && !c.disabled) buy(c.getAttribute('data-k')); };
el('svDeals').addEventListener('click', shopClick); el('svItems').addEventListener('click', shopClick);
el('shopOpen').addEventListener('click', () => { renderShop(); el('shopView').classList.remove('hidden'); });
el('shopOpen').addEventListener('pointerdown', e => e.stopPropagation());
el('svClose').addEventListener('click', () => el('shopView').classList.add('hidden'));
el('svHome').addEventListener('click', () => el('shopView').classList.add('hidden'));
['freeze', 'slow', 'shield', 'speed'].forEach((k, i) => {
  el('bb_' + k).addEventListener('pointerdown', e => { e.stopPropagation(); useBonus(k); });
  window.addEventListener('keydown', e => { if (e.key === String(i + 1)) useBonus(k); });
});

