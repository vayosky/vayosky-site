// Space Slice · Spielstart, Feedback, Galerie-Wiederholung (wird als letzte Datei geladen)
// Testmodus: ausserhalb von vayosky.ch (Vorschau auf claude.ai, lokal am PC) Levelauswahl und «Münzen ∞» zeigen
try { if (!/(^|\.)vayosky\.ch$/i.test(location.hostname)) document.documentElement.classList.add('testmode'); } catch (err) {}
try { setup3D(); } catch (err) { R3D = false; }
try { level = Math.max(1, Math.min(999, parseInt(localStorage.getItem('lastLvl'), 10) || 1)); } catch (err) {}
fillLevels(); refreshMission(); el('lvl').textContent = level;
    // Tester-Hilfe: Reise-Szene direkt ansehen
el('lvlSel').addEventListener('change', e => { pickedLevel = Math.max(1, parseInt(e.target.value, 10) || 1); });
el('rotBtn').addEventListener('pointerdown', e => e.stopPropagation());
el('rotBtn').addEventListener('click', e => {
  e.stopPropagation();
  if (state !== 'play') return;
  startLevel(); checkRot();
});
el('refillBtn').addEventListener('click', () => {
  if (!canPay(E_PRICE)) return;
  pay(E_PRICE); energy = E_MAX; eT = Date.now(); saveEnergy(); saveShop(); renderEnergy(); sfx('start');
});
el('refillBtn').addEventListener('pointerdown', e => e.stopPropagation());
renderEnergy();
// v65: Feedback per E-Mail (die App selbst sammelt keine Daten) und Link zur Datenschutzerklaerung
const APP_VER = 'v82', SUPPORT = 'vayosky.games@gmail.com';
el('mailBtn').addEventListener('click', () => {
  const body = tr('Hallo Vayosky-Team,') + '\n\n\n\n---\n' + tr('Version: ') + APP_VER + ' · Level ' + level + '\n' + tr('Gerät: ') + navigator.userAgent;
  location.href = 'mailto:' + SUPPORT + '?subject=' + encodeURIComponent('Space Slice – Feedback') + '&body=' + encodeURIComponent(body);
});
el('privBtn').addEventListener('click', () => { window.open(LANG === 'en' ? 'https://vayosky.ch/privacy' : 'https://vayosky.ch/datenschutz', '_blank'); });
el('galOpen').addEventListener('click', () => { renderGal(); el('galView').classList.remove('hidden'); });
el('galOpen').addEventListener('pointerdown', e => e.stopPropagation());
el('galClose').addEventListener('click', () => el('galView').classList.add('hidden'));
el('galHome').addEventListener('click', () => el('galView').classList.add('hidden'));
el('galGrid').addEventListener('click', e => {
  const t = e.target && e.target.closest ? e.target.closest('[data-i]') : null; if (!t) return;
  const i = +t.getAttribute('data-i'), st = galStars[i] || 0, im = el('galBigImg');
  galSel = i;
  el('replayBtn').textContent = (st < 3 ? tr('▶ Für ★★★ nochmals spielen') : tr('▶ Nochmals spielen')) + ' · 🔋 1';
  im.src = 'img/' + picName(i) + '.jpg'; im.classList.toggle('gold', st === 3);
  el('galBigT').textContent = tr('Level ') + (i + 1) + ' · ' + BOSS[i].name + '  ' + '★'.repeat(st);
  el('galBig').classList.remove('hidden');
});
el('galBigClose').addEventListener('click', () => el('galBig').classList.add('hidden'));
// v69: Level aus der Galerie nochmals spielen (kostet 1 Energie; Spielstand und Mission bleiben unveraendert)
function startReplay(i) {
  tickEnergy();
  if (energy <= 0) { el('galBigT').textContent = tr('Tank leer – warte auf neue Energie oder fülle ihn im Startfenster auf.'); renderEnergy(); return; }
  useEnergy();
  if (!replay) replay = { ret: level };
  level = i + 1; lives = 3; score = 0; pickedLevel = 0;
  el('galBig').classList.add('hidden'); el('galView').classList.add('hidden'); el('replayBack').style.display = 'none';
  initAudio(); sfx('start'); startLevel();
}
function endReplay() { saveShop(); saveGal(); location.reload(); }   // zurueck zum gespeicherten Level
el('replayBtn').addEventListener('click', () => { if (galSel >= 0) startReplay(galSel); });
el('replayBack').addEventListener('click', endReplay);
el('replayBack').addEventListener('pointerdown', e => e.stopPropagation());
el('galBig').addEventListener('click', e => { if (e.target === el('galBig')) el('galBig').classList.add('hidden'); });
galCountTxt();
el('pauseBtn').addEventListener('click', () => setPause(true));
el('pauseBtn').addEventListener('pointerdown', e => e.stopPropagation());
el('padPause').addEventListener('click', () => setPause(true));
el('padPause').addEventListener('pointerdown', e => e.stopPropagation());
el('resumeBtn').addEventListener('click', () => { initAudio(); setPause(false); });
el('quitBtn').addEventListener('click', () => {
  saveShop(); location.reload();     // Level-Stand und Muenzen bleiben gespeichert
});
for (const id of ['pauseOv', 'resumeBtn', 'quitBtn']) el(id).addEventListener('pointerdown', e => e.stopPropagation());
document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });
window.addEventListener('blur', () => setPause(true));
window.addEventListener('keydown', e => { if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && state === 'play') setPause(!paused); });
// v79: eigene Rückfrage im Spiel-Stil (vorher graue Handy-Meldung «vayosky.ch enthält …», ohne Hinweis auf die Galerie)
el('resetBtn').addEventListener('click', () => el('resetOv').classList.remove('hidden'));
el('resetNo').addEventListener('click', () => el('resetOv').classList.add('hidden'));
el('resetYes').addEventListener('click', () => {
  try { ['lastLvl', 'best', 'shop', 'freeDay', 'energy', 'gallery'].forEach(k => localStorage.removeItem(k)); } catch (err) {}
  location.reload();
});
for (const id of ['resetOv', 'resetYes', 'resetNo']) el(id).addEventListener('pointerdown', e => e.stopPropagation());
requestAnimationFrame(loop);
