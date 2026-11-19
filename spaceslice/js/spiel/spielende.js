// Space Slice · Gewonnen/verloren
function endGame(won, t, x) {
  canCont = !won && !(duel && duel.running);
  state = won ? 'won' : 'over';
  if (!won && !duel && !replay) useEnergy();          // Wiederholung aus der Galerie hat schon beim Start bezahlt
  sfx(won ? 'win' : 'over');
  if (won) { grid.fill(SAFE); spiders = []; items = []; blocks = []; shots = []; el('overlay').classList.add('won'); }
  el('setupBox').open = false; el('helpBox').open = false;
  el('oTitle').textContent = won ? tr('Level ') + level + tr(' geschafft!') : tr('Erwischt!');
  // v81: nach einem Sieg kein langer Erklärtext mehr (die Infos stehen unter «So wird gespielt»), dafür die Vorschau aufs nächste Level
  el('oText').textContent = won ? ''
    : tr('Keine Leben mehr. Freigelegt: ') + Math.floor(pct) + tr(' %. Mit Münzen kannst du an dieser Stelle weiterspielen.');
  el('oText').style.textAlign = 'center';
  el('oBtn').textContent = won ? tr('Nächstes Level') : tr('Nochmal versuchen');
  if (duel && duel.running) {
    duel.running = false; duel.over = true;
    if (t) setP({ dState: 'end' });
    else if (won) {
      myFin = Math.round((performance.now() - duel.t0) / 100) / 10;
      setP({ fin: myFin, pct: Math.floor(pct), dState: 'end' });
      t = tr('Duell gewonnen!'); x = tr('Du warst zuerst fertig, in ') + fmt(myFin) + '.';
    } else { setP({ out: true, dState: 'end' }); t = tr('Duell verloren'); x = tr('Du hast keine Leben mehr.'); }
  }
  if (t) el('oTitle').textContent = t;
  if (x) el('oText').textContent = x;
  refreshCont();
  pendingTravel = 0;
  if (won && !duel && !replay) {                 // Mission: nach dem dritten Level folgt der Flug in die naechste Galaxie
    const m = missionOf(level), left = MISSION_LEN - 1 - (level - 1) % MISSION_LEN;
    if (left) el('oText').textContent += tr(' Noch ') + left + tr(' Level bis zum Flug in Galaxie ') + (m + 1) + '.';
    else { pendingTravel = m; wallet += 5; el('oText').textContent = tr('Mission ') + m + tr(' geschafft! Du bist in Galaxie ') + (m + 1) + tr(' gelandet, Ziel «') + destOf(m)[1] + tr('». +5 Münzen.'); }
  }
  refreshMission();
  let bonusTxt = '';
  if (won && pct >= goal()) {
    const bonus = Math.max(0, Math.floor(pct) - goal()) * 1000 + lives * 200;
    score += bonus; bonusTxt = tr(' (inkl. Bonus +') + bonus + ')';
    if (!replay) wallet += 3; saveShop();
  }
  el('oStars').classList.add('hidden');
  if (won && !duel && !userImg) {        // v66: Sterne und Galerie
    const bt = BOSS_ORDER[(level - 1) % BOSS_ORDER.length], n = 1 + (pct >= Math.min(99, goal() + 5) ? 1 : 0) + (lostInLvl === 0 ? 1 : 0);
    const had = galStars[bt] || 0;
    if (n > had) galStars[bt] = n;
    let extra = '';
    if (n === 3 && !galGold[bt]) { galGold[bt] = 1; wallet += 2; saveShop(); extra = tr('Goldener Rahmen! +2 Münzen'); }
    else if (!had) extra = tr('Neues Bild in der Galerie');
    saveGal();
    el('oStars').innerHTML = '★'.repeat(n) + '<span style="opacity:.25">' + '★'.repeat(3 - n) + '</span>' + (extra ? '<small>' + extra + '</small>' : '') +
      '<small>' + tr('★ geschafft · ★★ Ziel + 5 % · ★★★ ohne Leben zu verlieren') + '</small>';
    el('oStars').classList.remove('hidden');
  }
  if (score > best) { best = score; try { localStorage.setItem('best', String(best)); } catch (err) {} }
  el('oText').textContent += ' ★ ' + score + tr(' Punkte') + bonusTxt + tr(' · Bestwert ') + best + '.';
  el('oText').textContent = el('oText').textContent.trim();
  updateHud();
  refreshDuelUi();
  if (replay) {         // v69: Wiederholung aus der Galerie – danach zurueck zum eigentlichen Spielstand
    el('oBtn').textContent = won ? tr('Zurück zu Level ') + replay.ret : tr('Nochmal versuchen · 🔋 1');
    el('replayBack').textContent = tr('Zurück zu Level ') + replay.ret;
    el('replayBack').style.display = won ? 'none' : '';
    el('oText').textContent = won ? tr('Wiederholung geschafft. Deine Sterne sind in der Galerie gespeichert.') : tr('Versuch es nochmals oder kehre zu deinem Spielstand zurück.');
    el('eyebrow').textContent = tr('Wiederholung aus der Galerie');
  }
  showNext(won && !duel && !replay);      // v81: Vorschau «Als Nächstes» über dem Knopf
  if (won) {            // erst das ganze freigelegte Bild zeigen; die Meldung kommt nach einem Tippen
    picShownAt = performance.now();
    el('picHint').classList.remove('hidden');
  } else showOv();
}

