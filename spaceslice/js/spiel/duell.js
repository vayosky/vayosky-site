// Space Slice · Duell auf zwei Geräten
/* ---------- Duell (zwei Geraete, live) ---------- */
let room = null, duel = null, seenDuel = '', myFin = null, oppPct = 0;
const fmt = sec => Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0') + ' min';
const setP = patch => { if (room) { try { room.presence(patch).catch(() => {}); } catch (err) {} } };
const others = () => {
  if (!room) return [];
  try { return room.peers().filter(p => !p.isMe && p.kind === 'viewer'); } catch (err) { return []; }
};
function refreshDuelUi() {
  const b = el('duelBtn'), info = el('duelInfo');
  if (!room) {
    b.disabled = true;
    info.textContent = tr('Duell hier nicht verfügbar. Beide brauchen ein Claude-Konto, müssen angemeldet und zu diesem Spiel eingeladen sein.');
    return;
  }
  const n = others().length;
  b.disabled = n === 0;
  b.textContent = n === 0 ? tr('⏳ Noch kein Gegner da') : tr('⚔ Duell starten');
  info.textContent = n === 0
    ? tr('Du bist verbunden, aber allein. Das Duell kann erst starten, wenn dein Gegner diese Seite angemeldet geöffnet hat.')
    : n + (n === 1 ? tr(' Gegner ist online.') : tr(' Gegner sind online.')) + tr(' Wer auf «Duell starten» tippt, startet für alle.');
}
function beginDuel(id, lvl) {
  if (duel && duel.id === id) return;
  duel = { id, running: false, over: false, sent: -1, t0: 0 };
  seenDuel = id; myFin = null; oppPct = 0;
  setP({ duelId: id, dState: 'count', dLevel: lvl, pct: 0, fin: null, out: null });
  state = 'count';
  el('overlay').classList.add('hidden');
  let n = 3;
  el('cdN').textContent = n; el('cd').classList.remove('hidden');
  const iv = setInterval(() => {
    n--;
    if (n > 0) { el('cdN').textContent = n; return; }
    clearInterval(iv); el('cd').classList.add('hidden');
    if (!duel || duel.id !== id) return;
    level = lvl; lives = 3; score = 0; startLevel();
    duel.running = true; duel.t0 = performance.now();
    setP({ dState: 'run' });
  }, 1000);
}
function onPeersChange() {
  refreshDuelUi();
  const os = others();
  if (!duel || (!duel.running && duel.over)) {
    for (const p of os) {
      const pr = p.presence || {};
      if (pr.dState === 'count' && typeof pr.duelId === 'string' && pr.duelId && pr.duelId !== seenDuel) {
        beginDuel(pr.duelId.slice(0, 24), Math.max(1, Math.min(20, Math.floor(+pr.dLevel) || 1)));
        return;
      }
    }
  }
  if (!duel) return;
  const inD = os.filter(p => p.presence && p.presence.duelId === duel.id);
  oppPct = inD.reduce((m, p) => Math.max(m, Math.floor(+p.presence.pct) || 0), 0);
  const fins = inD.map(p => +p.presence.fin).filter(v => v > 0);
  const best = fins.length ? Math.min.apply(null, fins) : 0;
  if (duel.running && state === 'play') {
    if (best) endGame(false, tr('Duell verloren'), tr('Dein Gegner war zuerst fertig, in ') + fmt(best) + tr('. Du hattest ') + Math.floor(pct) + ' %.');
    else if (inD.length && inD.every(p => p.presence.out)) endGame(true, tr('Duell gewonnen!'), tr('Dein Gegner hat keine Leben mehr.'));
  } else if (duel.over && state === 'won' && myFin && best && best < myFin) {
    el('oTitle').textContent = tr('Knapp verloren');
    el('oText').textContent = tr('Dein Gegner war schneller: ') + fmt(best) + tr(' gegen deine ') + fmt(myFin) + '.';
  }
}
el('duelBtn').addEventListener('click', () => {
  if (!room || !others().length) return;
  initAudio();
  beginDuel(Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4), level);
});
(async () => {
  try { room = null; } catch (err) { room = null; }
  if (room) {
    try { room.onPeers(onPeersChange, () => { room = null; refreshDuelUi(); }); setP({ here: true }); }
    catch (err) { room = null; }
  }
  refreshDuelUi();
})();

