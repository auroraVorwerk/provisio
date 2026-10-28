/**
 * Provisionsaufteilung
 *
 * Die Basisprovision von 20 % besteht aus 15 % Verkaufsprovision und 5 %
 * Kontaktprovision. Teilen sich Berater einen Verkauf, fragt die App nach
 * dem Speichern, welcher Teil bei dir bleibt (zwei Schieberegler).
 * Gespeichert wird am Termin: nb.provVK und nb.provKT in Prozentpunkten.
 * Umsatz, Statistik und Bonusstufe zählen weiter voll – gekürzt wird nur
 * der abgegebene Teil der 20 %.
 */
const PROV_VK = 15,
  PROV_KT = 5,
  PROV_BASIS = PROV_VK + PROV_KT;

function provAnteil(n) {
  const lies = (v, max) => {
    const z = v === undefined || v === null || v === "" ? max : +v;
    return Number.isFinite(z) ? Math.max(0, Math.min(max, z)) : max;
  };
  const vk = lies(n && n.provVK, PROV_VK),
    kt = lies(n && n.provKT, PROV_KT);
  return { vk, kt, f: (vk + kt) / PROV_BASIS, geteilt: vk + kt < PROV_BASIS };
}

/* Bruttobetrag eines Termins, auf den die Basisprovision läuft – nach denselben Regeln wie umsatz() */
function verkaufsTeile(n) {
  const t = { fg: 0, wg: 0, messe: 0 };
  if (!n || n.fremd === "Ja") return t;
  if (n.verkauft === "Ja") {
    if (n.gebiet === "Festgebiet") t.fg += num(n.umsatz);
    else if (n.gebiet === "Weißgebiet") t.wg += num(n.umsatz);
  }
  t.fg += num(n.umsatzFG);
  t.wg += num(n.umsatzWG);
  t.messe += num(n.umsatzMesse);
  return t;
}
const verkaufsSumme = (n) => {
  const t = verkaufsTeile(n);
  return t.fg + t.wg + t.messe;
};
function terminName(e) {
  const n = [e.vorname, e.nachname].filter((x) => (x || "").trim()).join(" ");
  if (n) return n;
  if (e.quelle === "Promotion") return "Promotion";
  if (e.kind === "messe" || (e.nb && num(e.nb.umsatzMesse))) return "Messe";
  return "Verkauf";
}

/* ---------- Umsatz: abgegebene Anteile mitführen ---------- */
const umsatzVorAufteilung = umsatz;
umsatz = function (fromK, toK) {
  const u = umsatzVorAufteilung(fromK, toK);
  u.abFG = 0;
  u.abWG = 0;
  u.abMesse = 0;
  u.geteilt = [];
  Object.keys(entries).forEach((k) => {
    const e = entries[k],
      n = e && e.nb;
    if (!n || n.fremd === "Ja") return;
    const a = provAnteil(n);
    if (!a.geteilt) return;
    const day = abrechnungsTag(k.split("|")[0], n);
    if (day < fromK || day > toK) return;
    const t = verkaufsTeile(n);
    const weg = 1 - a.f;
    u.abFG += t.fg * weg;
    u.abWG += t.wg * weg;
    u.abMesse += t.messe * weg;
    if (t.fg + t.wg + t.messe > 0)
      u.geteilt.push({ k, tag: day, name: terminName(e), brutto: t.fg + t.wg + t.messe, vk: a.vk, kt: a.kt });
  });
  u.geteilt.sort((a, b) => b.tag.localeCompare(a.tag));
  return u;
};

/* ---------- Provision: nur der abgegebene Teil der 20 % fällt weg ---------- */
const provisionVorAufteilung = provision;
provision = function (u, weeks) {
  const p = provisionVorAufteilung(u, weeks);
  const abFG = netto(u.abFG || 0) * 0.2,
    abWG = netto(u.abWG || 0) * 0.2,
    abMe = netto(u.abMesse || 0) * 0.2;
  p.abFG = abFG;
  p.abWG = abWG;
  p.abMesse = abMe;
  p.abgegeben = abFG + abWG + abMe;
  if (!p.abgegeben) return p;
  p.pFG -= abFG;
  p.pWG -= abWG;
  if (p.pMesse !== undefined) p.pMesse -= abMe;
  p.prov -= p.abgegeben;
  p.vers = p.prov * 0.14;
  p.saldo = p.prov + p.vers - p.warenkredit - p.minus;
  p.gesamt = Math.max(0, p.saldo);
  p.uebertrag = p.saldo < 0 ? -p.saldo : 0;
  return p;
};

/* ---------- Abfrage nach dem Verkauf ---------- */
const pzahl = (v) => (+v).toLocaleString("de-DE", { maximumFractionDigits: 1 });

function aufteilungFragen(eintragKey) {
  const e = entries[eintragKey];
  if (!e || !e.nb) return;
  const brutto = verkaufsSumme(e.nb);
  if (brutto <= 0) return;
  const a = provAnteil(e.nb);
  const voll = netto(brutto) * 0.2;
  document.querySelectorAll(".mtoast").forEach((t) => t.remove());
  simpleDialog(
    "Provision aufteilen",
    `${entschaerfeText(terminName(e))} · ${eur(brutto)} € brutto`,
    `<div class="pa">
       <div class="pazeile">
         <div class="pakopf"><span>Verkaufsprovision</span><b id="paVkW" data-keinzaehlen>${pzahl(a.vk)} %</b></div>
         <input type="range" class="paregler" id="paVk" min="0" max="${PROV_VK}" step="0.5" value="${a.vk}"
           aria-label="Dein Anteil an der Verkaufsprovision in Prozent">
         <div class="paskala"><span>0 %</span><span>${PROV_VK} %</span></div>
       </div>
       <div class="pazeile">
         <div class="pakopf"><span>Kontaktprovision</span><b id="paKtW" data-keinzaehlen>${pzahl(a.kt)} %</b></div>
         <input type="range" class="paregler" id="paKt" min="0" max="${PROV_KT}" step="0.5" value="${a.kt}"
           aria-label="Dein Anteil an der Kontaktprovision in Prozent">
         <div class="paskala"><span>0 %</span><span>${PROV_KT} %</span></div>
       </div>
       <div class="pachips" role="group" aria-label="Schnellauswahl">
         <button type="button" data-pa="15,5">Alles bei mir</button>
         <button type="button" data-pa="7.5,2.5">Halb und halb</button>
         <button type="button" data-pa="15,0">Nur Verkauf</button>
         <button type="button" data-pa="0,5">Nur Kontakt</button>
       </div>
       <div class="pasumme"><span>Dein Anteil</span><b id="paSum" data-keinzaehlen>${pzahl(a.vk + a.kt)} %</b></div>
       <p class="pageld" id="paEur" data-keinzaehlen></p>
     </div>
     <p class="hinweis">Umsatz und Bonusstufe zählen weiter voll. Abgezogen wird nur der Teil der
       20 % Basisprovision, den du abgibst.</p>`,
    () => {
      const vk = +document.getElementById("paVk").value,
        kt = +document.getElementById("paKt").value;
      const n = e.nb;
      if (vk === PROV_VK && kt === PROV_KT) {
        delete n.provVK;
        delete n.provKT;
      } else {
        n.provVK = vk;
        n.provKT = kt;
      }
      n.provGefragt = 1;
      saveData();
      closeModal();
      try {
        renderAll();
      } catch (err) {}
    },
    "Übernehmen",
  );
  const vkF = document.getElementById("paVk"),
    ktF = document.getElementById("paKt");
  const zeigen = () => {
    const vk = +vkF.value,
      kt = +ktF.value;
    document.getElementById("paVkW").textContent = pzahl(vk) + " %";
    document.getElementById("paKtW").textContent = pzahl(kt) + " %";
    document.getElementById("paSum").textContent = pzahl(vk + kt) + " %";
    [vkF, ktF].forEach((f) => f.style.setProperty("--p", ((+f.value / +f.max) * 100).toFixed(1) + "%"));
    const mein = netto(brutto) * ((vk + kt) / 100);
    document.getElementById("paEur").textContent =
      vk + kt >= PROV_BASIS
        ? `Die volle Basisprovision von ${eur(voll)} € bleibt bei dir.`
        : `Rund ${eur(mein)} € von ${eur(voll)} € Basisprovision bleiben bei dir.`;
    document.querySelectorAll("[data-pa]").forEach((b) => {
      const [v, k] = b.dataset.pa.split(",").map(Number);
      b.setAttribute("aria-pressed", String(v === vk && k === kt));
    });
  };
  vkF.oninput = zeigen;
  ktF.oninput = zeigen;
  document.querySelectorAll("[data-pa]").forEach(
    (b) =>
      (b.onclick = () => {
        const [v, k] = b.dataset.pa.split(",");
        vkF.value = v;
        ktF.value = k;
        zeigen();
      }),
  );
  zeigen();
}

/*
 * Nach jedem gelungenen Speichern mit Verkauf fragen. Gelungen heißt: das
 * Fenster ist zu (bei fehlenden Angaben bleibt es offen).
 */
function nachVerkaufFragen(name, eintragVon) {
  const vor = window[name];
  if (typeof vor !== "function") return;
  window[name] = function () {
    const vorher = new Set(Object.keys(entries));
    const r = vor.apply(this, arguments);
    try {
      if (!modal.classList.contains("open")) {
        const k = eintragVon(arguments[0], vorher);
        if (k && entries[k] && verkaufsSumme(entries[k].nb) > 0)
          aufteilungSpaeter(k, 0);
      }
    } catch (err) {
      console.warn("Provisionsaufteilung:", err);
    }
    return r;
  };
}
/* Öffnet sich danach noch ein anderes Fenster, wird gefragt, sobald es zu ist */
function aufteilungSpaeter(k, versuch) {
  setTimeout(() => {
    if (modal.classList.contains("open")) {
      if (versuch < 240) aufteilungSpaeter(k, versuch + 1);
      return;
    }
    if (entries[k]) aufteilungFragen(k);
  }, 420);
}
const schluesselVon = (e) => Object.keys(entries).find((k) => entries[k] === e);
nachVerkaufFragen("saveNb", (e) => schluesselVon(e));
nachVerkaufFragen("saveNbPremium", (e) => schluesselVon(e));
nachVerkaufFragen("saveNbTerm", (e) => schluesselVon(e));
nachVerkaufFragen("saveAbhol", (e) => {
  if (e && e.vonTag !== undefined) {
    const k = key(e.vonTag, e.vonStunde);
    if (entries[k] && verkaufsSumme(entries[k].nb) > 0) return k;
  }
  return schluesselVon(e);
});
nachVerkaufFragen("distanzSpeichern", (_, vorher) => Object.keys(entries).find((k) => !vorher.has(k)));
