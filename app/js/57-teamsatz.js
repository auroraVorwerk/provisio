/**
 * Teamleiter-Satz je Woche
 *
 * Bei jeder Wochenmeldung eines Teammitglieds wird gefragt, welchen Satz du
 * als Teamleiterin von ihm bekommst. Vorbelegt ist die letzte Angabe – wechselt
 * der Satz mitten im Vertriebsmonat (z. B. von 10 % auf 6 %), rechnet die
 * Teamprovision die Wochen getrennt.
 * Gespeichert wird je Woche: teamMeldungen()[id][wochenKey].satz (Prozent).
 */
const TL_SAETZE = [10, 8, 6, 5, 4, 2, 0];

/* Satz nach Betriebszugehörigkeit in einer bestimmten Woche – nur als Vorschlag */
function satzNachEinstellung(m, wochenKey) {
  if (!m || !m.einst) return null;
  const wochen = Math.max(0, Math.floor((fromDk(wochenKey) - fromDk(m.einst)) / (7 * 864e5)) + 1);
  return Math.round(tpSatz(wochen) * 100);
}
/* Letzte Angabe vor (oder in) dieser Woche */
function letzterSatz(id, wochenKey) {
  const alle = teamMeldungen()[id] || {};
  const frueher = Object.keys(alle)
    .filter((k) => k <= wochenKey && alle[k] && alle[k].satz !== undefined && alle[k].satz !== "")
    .sort();
  return frueher.length ? +alle[frueher[frueher.length - 1]].satz : null;
}
function satzFuer(id, wochenKey) {
  const w = (teamMeldungen()[id] || {})[wochenKey];
  if (w && w.satz !== undefined && w.satz !== "") return +w.satz;
  const l = letzterSatz(id, wochenKey);
  if (l !== null) return l;
  const m = teamManuell().find((x) => x.id === id);
  const s = satzNachEinstellung(m, wochenKey);
  return s === null ? 10 : s;
}

meldungManuellDialog = function (id, wochenKey) {
  const m = teamManuell().find((x) => x.id === id);
  if (!m) return;
  const alt = (teamMeldungen()[id] || {})[wochenKey] || {};
  const { week } = isoWeek(fromDk(wochenKey));
  const satz = satzFuer(id, wochenKey);
  const vorher = letzterSatz(id, dk(new Date(fromDk(wochenKey).getTime() - 864e5)));
  simpleDialog(
    `${entschaerfeText(m.name)} · KW ${week}`,
    "Wochenmeldung von Hand",
    `<div class="grp">
       <div class="field"><label for="mmSatz">Dein Anteil als Teamleiterin</label>
         <select id="mmSatz">${TL_SAETZE.map(
           (s) => `<option value="${s}"${s === satz ? " selected" : ""}>${s} %</option>`,
         ).join("")}</select></div>
       <p class="hinweis" style="margin:0">${
         vorher !== null
           ? `Letzte Woche: ${vorher} %. Ändert sich der Satz, rechnet die Teamprovision ab dieser Woche neu.`
           : "Gilt ab dieser Woche und wird für die nächsten Meldungen vorgeschlagen."
       }</p>
     </div>
     <div class="h4">Zahlen der Woche</div>
     <div class="grp mmgitter">${MANUELL_FELDER.map(([k, l]) =>
       fld("mm_" + k, l, alt[k] ?? "", "text", 'inputmode="decimal"'),
     ).join("")}</div>`,
    () => {
      const w = {};
      MANUELL_FELDER.forEach(([k]) => {
        const v = document.getElementById("mm_" + k).value;
        if (v !== "") w[k] = num(v);
      });
      w.satz = +document.getElementById("mmSatz").value;
      const alle = teamMeldungen();
      alle[id] = alle[id] || {};
      alle[id][wochenKey] = w;
      saveData();
      closeModal();
      renderTeamManuell();
      try {
        renderProv();
      } catch (e) {}
    },
    "Woche speichern",
  );
};

/* In der Teamliste den Satz der Woche mit anzeigen */
const renderTeamManuellOhneSatz = renderTeamManuell;
renderTeamManuell = function () {
  renderTeamManuellOhneSatz();
  const box = document.getElementById("tmManuell");
  if (!box) return;
  const woche = dk(tmMontag || monday);
  box.querySelectorAll(".rszeile").forEach((z) => {
    const b = z.querySelector("[data-mmel]");
    const small = z.querySelector("small");
    if (!b || !small || small.dataset.satz) return;
    const hat = (teamMeldungen()[b.dataset.mmel] || {})[woche];
    small.dataset.satz = "1";
    small.textContent += ` · ${satzFuer(b.dataset.mmel, woche)} %${hat ? "" : " (vorgeschlagen)"}`;
  });
};

/* Teamprovision je Mitglied und Satz – Wochen mit anderem Satz stehen getrennt */
function teamProvisionDaten(vm) {
  const zeilen = [];
  teamManuell().forEach((m) => {
    const gruppen = {};
    Object.entries(teamMeldungen()[m.id] || {}).forEach(([wk, w]) => {
      if (wk < vm.fromK || wk > vm.toK) return;
      const s = satzFuer(m.id, wk);
      const g = (gruppen[s] = gruppen[s] || { satz: s, nettoUm: 0, wochen: [] });
      g.nettoUm += +w.umsatzNetto || 0;
      g.wochen.push(isoWeek(fromDk(wk)).week);
    });
    const liste = Object.values(gruppen).sort((a, b) => Math.min(...a.wochen) - Math.min(...b.wochen));
    if (!liste.length)
      zeilen.push({ id: m.id, name: m.name, satz: satzFuer(m.id, dk(monday)), nettoUm: 0, anteil: 0, wochen: [] });
    liste.forEach((g) =>
      zeilen.push({
        id: m.id,
        name: m.name,
        satz: g.satz,
        nettoUm: g.nettoUm,
        anteil: (g.nettoUm * g.satz) / 100,
        wochen: g.wochen.sort((a, b) => a - b),
        geteilt: liste.length > 1,
      }),
    );
  });
  return zeilen;
}
