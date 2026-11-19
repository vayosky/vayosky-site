// Space Slice · Energie-Tank und Galerie
// v64: Energie-Tank – nur ein verlorenes Level kostet 1 Energie; alle 20 Minuten kommt 1 zurueck
const E_MAX = 8, E_REGEN = 20 * 60 * 1000, E_PRICE = 20;
let energy = E_MAX, eT = Date.now();
try { const sv = JSON.parse(localStorage.getItem('energy') || 'null'); if (sv) { energy = Math.max(0, Math.min(E_MAX, sv.e | 0)); eT = +sv.t || Date.now(); } } catch (err) {}
function saveEnergy() { try { localStorage.setItem('energy', JSON.stringify({ e: energy, t: eT })); } catch (err) {} }
function tickEnergy() {
  const now = Date.now();
  if (energy >= E_MAX) { eT = now; return; }
  if (eT > now) eT = now;                                   // Uhr zurueckgestellt
  const n = Math.floor((now - eT) / E_REGEN);
  if (n > 0) { energy = Math.min(E_MAX, energy + n); eT = energy >= E_MAX ? now : eT + n * E_REGEN; saveEnergy(); }
}
function useEnergy() { tickEnergy(); if (energy >= E_MAX) eT = Date.now(); energy = Math.max(0, energy - 1); saveEnergy(); }
const mmss = ms => { const t = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); };
function renderEnergy() {
  tickEnergy();
  const row = el('energyRow'); if (!row) return;
  el('energyTxt').textContent = '🔋 ' + tr('Energie ') + energy + '/' + E_MAX;
  const wait = E_REGEN - (Date.now() - eT);
  el('energyInfo').textContent = energy >= E_MAX ? tr('Tank voll. Nur ein verlorenes Level kostet 1 Energie.')
    : energy === 0 ? tr('Tank leer. Nächste Energie in ') + mmss(wait)
    : tr('Nächste Energie in ') + mmss(wait);
  row.classList.toggle('empty', energy === 0);
  const r = el('refillBtn'); r.style.display = energy < E_MAX ? '' : 'none';
  r.textContent = tr('Sofort auffüllen · ') + E_PRICE + ' 🪙'; r.disabled = !canPay(E_PRICE);
  el('oBtn').disabled = energy === 0 && !(replay && state === 'won');
  el('oBtn').style.opacity = el('oBtn').disabled ? '.4' : '';
}
setInterval(() => { if (!el('overlay').classList.contains('hidden')) renderEnergy(); }, 1000);

// v66: Galerie – pro Boss das freigelegte Bild, beste Sterne, goldener Rahmen bei 3 Sternen
let galStars = {}, galGold = {};
try { const g = JSON.parse(localStorage.getItem('gallery') || 'null'); if (g) { galStars = g.s || {}; galGold = g.g || {}; } } catch (err) {}
function saveGal() { try { localStorage.setItem('gallery', JSON.stringify({ s: galStars, g: galGold })); } catch (err) {} galCountTxt(); }
const picName = bt => { for (const c of BOSS[bt].pic) if (typeof c === 'string') return c; return null; };
function galCountTxt() {
  const n = BOSS.filter((_, i) => galStars[i]).length, t = n + '/' + BOSS.length;
  if (el('galCount')) el('galCount').textContent = t;
  if (el('galPill')) el('galPill').textContent = t;
}
function renderGal() {
  let h = '';
  BOSS.forEach((b, i) => {
    const st = galStars[i] || 0, nm = picName(i);
    if (!st || !nm) { h += '<div class="gt lock"><span>🔒</span>' + tr('Level ') + (i + 1) + '</div>'; return; }
    h += '<button type="button" class="gt' + (st === 3 ? ' gold' : '') + '" data-i="' + i + '"><img loading="lazy" src="img/' + nm + '.jpg" alt=""><span class="gs"><b>' +
         '★'.repeat(st) + '<span style="opacity:.3">' + '★'.repeat(3 - st) + '</span></b>' + tr('Level ') + (i + 1) + ' · ' + b.name + '</span></button>';
  });
  el('galGrid').innerHTML = h; galCountTxt();
}

