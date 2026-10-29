/**
 * Planer-Extras (Beta 1.1)
 *
 * 1 · Serien: Meeting, Privat, Individuell und Büro lassen sich täglich,
 *     werktags oder wöchentlich wiederholen. Angelegt werden immer die
 *     nächsten 52 Wochen; mit jeder neuen Woche wächst die Serie nach.
 *     Beim Löschen: nur diesen Termin oder diesen und alle zukünftigen.
 * 2 · Rückgängig: die letzten Änderungen im Kalender zurücknehmen.
 * 3 · Aus Chat einfügen: eine Zeile „PROVISIO-TERMIN | …“ legt einen Termin an.
 * 4 · Kleinigkeiten: keine X-Markierung mehr im Raster, Nichtkauf-Gründe umbenennen.
 */
(function () {
  "use strict";
  const sicher = (f) => {
    try {
      return f();
    } catch (e) {
      console.warn("Planer-Extras:", e);
    }
  };
  const TAG = 864e5;
  const plusTageK = (k, n) => dk(new Date(fromDk(k).getTime() + n * TAG + 12 * 36e5));

  /* ---------- 1 · Serien ---------- */
  const SERIEN_ARTEN = ["meeting", "privat", "individuell", "buero"];
  const WDH = [
    ["nie", "Nie"],
    ["tag", "Täglich"],
    ["werktag", "Werktags"],
    ["woche", "Wöchentlich"],
  ];
  const serien = () => settings.serien || (settings.serien = {});

  function frei(tag, h, e) {
    if (entries[key(tag, h)]) return false;
    const ende = toDec(e.bis) || h + 2;
    return !coveredHours(h, ende).some((x) => x !== h && entries[key(tag, x)]);
  }
  function passtTag(art, k) {
    if (art === "werktag") {
      const wd = fromDk(k).getDay();
      return wd !== 0 && wd !== 6;
    }
    return true;
  }
  /* Termine einer Serie bis 52 Wochen nach heute anlegen */
  function serieFuellen(id) {
    const s = serien()[id];
    if (!s || s.ende) return 0;
    const grenze = dk(new Date(Date.now() + 364 * TAG));
    const schritt = s.art === "woche" ? 7 : 1;
    let k = plusTageK(s.bis || s.start, schritt),
      neu = 0;
    while (k <= grenze) {
      if (passtTag(s.art, k) && !(s.ohne || []).includes(k) && frei(k, s.h, s.vorlage)) {
        entries[key(k, s.h)] = { ...JSON.parse(JSON.stringify(s.vorlage)), serie: id };
        neu++;
      }
      s.bis = k;
      k = plusTageK(k, schritt);
    }
    return neu;
  }
  function serieAnlegen(tag, h, art) {
    const e = entries[key(tag, h)];
    if (!e || art === "nie") return;
    const id = "S" + Date.now().toString(36);
    const vorlage = JSON.parse(JSON.stringify(e));
    delete vorlage.nb;
    delete vorlage.status;
    delete vorlage.serie;
    delete vorlage.bisTag;
    e.serie = id;
    serien()[id] = { art, h, start: tag, bis: tag, vorlage };
    serieFuellen(id);
    saveData();
    renderAll();
  }
  /* Beim Start und jede Woche: Serien wachsen nach */
  function serienNachziehen() {
    if (!me || !dataReady) return;
    let neu = 0;
    Object.keys(serien()).forEach((id) => (neu += serieFuellen(id) || 0));
    if (neu) {
      saveData();
      renderAll();
    }
  }

  /* Wiederholung im Formular anbieten (nur beim Neuanlegen) */
  let wdhWahl = "nie",
    wdhFuer = "";
  function wdhEinbauen() {
    if (typeof step === "undefined" || !draft) return;
    const formular = ["zeit", "indiv", "buero"].includes(step) && SERIEN_ARTEN.includes(draft.kind);
    if (!formular) return;
    const vorhanden = entries[key(draft.day, draft.hour)];
    if (vorhanden && vorhanden.serie) return;
    const sig = draft.day + "|" + draft.hour + "|" + draft.kind;
    if (wdhFuer !== sig) {
      wdhFuer = sig;
      wdhWahl = "nie";
    }
    const save = sheet.querySelector("#save");
    if (!save || sheet.querySelector(".wdhwahl")) return;
    const reihe = save.closest(".actions");
    const i = WDH.findIndex(([w]) => w === wdhWahl);
    reihe.insertAdjacentHTML(
      "beforebegin",
      `<div class="h4">Wiederholen</div>
       <div class="ioseg wdhwahl klein4" role="group" aria-label="Wiederholen" style="--n:${WDH.length};--i:${i}">
         <span class="iosegdaumen" aria-hidden="true"></span>${WDH.map(
           ([w, t]) => `<button type="button" data-wdh="${w}" aria-pressed="${w === wdhWahl}">${t}</button>`,
         ).join("")}</div>
       <p class="hinweis wdhhin">${wdhWahl === "nie" ? "Einmaliger Termin." : "Wird für die nächsten 52 Wochen eingetragen und wächst jede Woche nach."}</p>`,
    );
    sheet.querySelectorAll("[data-wdh]").forEach(
      (b) =>
        (b.onclick = () => {
          wdhWahl = b.dataset.wdh;
          const seg = b.closest(".ioseg");
          seg.style.setProperty("--i", WDH.findIndex(([w]) => w === wdhWahl));
          seg.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
          const h = sheet.querySelector(".wdhhin");
          if (h)
            h.textContent =
              wdhWahl === "nie"
                ? "Einmaliger Termin."
                : "Wird für die nächsten 52 Wochen eingetragen und wächst jede Woche nach.";
        }),
    );
  }
  /* Nach dem Speichern die Serie anlegen */
  document.addEventListener(
    "click",
    (ev) => {
      const b = ev.target.closest && ev.target.closest("#sheet #save");
      if (!b || !sheet.querySelector(".wdhwahl") || wdhWahl === "nie") return;
      const tag = draft.day,
        h = draft.hour,
        art = wdhWahl;
      setTimeout(() => {
        if (!modal.classList.contains("open") && entries[key(tag, h)]) {
          serieAnlegen(tag, h, art);
          wdhWahl = "nie";
        }
      }, 0);
    },
    true,
  );

  /* Löschen in einer Serie: nur diesen oder alle zukünftigen */
  document.addEventListener(
    "click",
    (ev) => {
      const b = ev.target.closest && ev.target.closest("#sheet #del");
      if (!b || !draft) return;
      const tag = draft.day,
        h = draft.hour;
      const e = entries[key(tag, h)];
      if (!e || !e.serie) return;
      ev.stopImmediatePropagation();
      ev.preventDefault();
      const id = e.serie;
      simpleDialog(
        "Serientermin löschen",
        "Dieser Termin wiederholt sich",
        `<div class="sheetkoerper"><button class="opt" data-serweg="einer">Nur diesen Termin</button>
         <button class="opt" data-serweg="alle">Diesen und alle zukünftigen</button></div>`,
        () => closeModal(),
        "Abbrechen",
      );
      const okb = document.getElementById("okBtn");
      if (okb) okb.closest(".actions").remove();
      sheet.querySelectorAll("[data-serweg]").forEach(
        (x) =>
          (x.onclick = () => {
            const s = serien()[id];
            if (x.dataset.serweg === "einer") {
              if (s) (s.ohne = s.ohne || []).push(tag);
              inPapierkorb(tag, h);
            } else {
              Object.keys(entries).forEach((k) => {
                const [t] = k.split("|");
                if (entries[k].serie === id && t >= tag) delete entries[k];
              });
              if (s) s.ende = tag;
            }
            saveData();
            closeModal();
            renderAll();
          }),
      );
    },
    true,
  );

  /* ---------- 2 · Rückgängig ---------- */
  const STAPEL_MAX = 25;
  const stapel = [];
  let letzterStand = null,
    stellt = false;
  const stand = () => JSON.stringify(entries);
  function merken() {
    if (stellt || !me || !dataReady) return;
    const jetzt = stand();
    if (letzterStand === null) {
      letzterStand = jetzt;
      return;
    }
    if (jetzt === letzterStand) return;
    stapel.push(letzterStand);
    if (stapel.length > STAPEL_MAX) stapel.shift();
    letzterStand = jetzt;
    knopfZeigen();
  }
  function rueckgaengig() {
    if (!stapel.length) return;
    stellt = true;
    const alt = JSON.parse(stapel.pop());
    Object.keys(entries).forEach((k) => delete entries[k]);
    Object.assign(entries, alt);
    letzterStand = stand();
    saveData();
    renderAll();
    stellt = false;
    knopfZeigen();
  }
  const saveDataOhneMerken = saveData;
  saveData = function () {
    sicher(merken);
    return saveDataOhneMerken.apply(this, arguments);
  };
  const starteOhneMerken = window.starteSitzung;
  if (typeof starteOhneMerken === "function")
    window.starteSitzung = async function () {
      const r = await starteOhneMerken.apply(this, arguments);
      stapel.length = 0;
      letzterStand = stand();
      sicher(alteDatenPflegen);
      sicher(serienNachziehen);
      knopfZeigen();
      return r;
    };

  /* ---------- 3 · Aus Chat einfügen ---------- */
  const ARTEN = {
    kundentermin: "kunde",
    kunde: "kunde",
    "premium checkin": "premium",
    premium: "premium",
    meeting: "meeting",
    teammeeting: "meeting",
    training: "meeting",
    schulung: "meeting",
    event: "meeting",
    privat: "privat",
    terminieren: "terminieren",
    festgebietsbegehung: "terminieren",
    promotion: "terminieren",
    büro: "buero",
    buero: "buero",
  };
  const zeit = (t) => {
    const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(t.trim());
    return m ? `${pad(+m[1])}:${m[2] || "00"}` : null;
  };
  function chatLesen(text) {
    const zeile = (text || "")
      .split(/\n/)
      .map((z) => z.trim())
      .find((z) => /^PROVISIO-TERMIN/i.test(z));
    if (!zeile) throw new Error("Keine Zeile mit „PROVISIO-TERMIN“ gefunden.");
    const teile = zeile.split("|").map((x) => x.trim()).slice(1);
    const r = { felder: {} };
    teile.forEach((t) => {
      const kv = /^([^:]+):\s*(.*)$/.exec(t);
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) r.tag = t;
      else if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(t)) {
        const [d, m, y] = t.split(".");
        r.tag = `${y}-${pad(+m)}-${pad(+d)}`;
      } else if (/^\d{1,2}(:\d{2})?\s*[-–]\s*\d{1,2}(:\d{2})?$/.test(t)) {
        const [a, b] = t.split(/[-–]/);
        r.von = zeit(a);
        r.bis = zeit(b);
      } else if (/^\d{1,2}:\d{2}$/.test(t)) r.von = zeit(t);
      else if (kv && !/^\d/.test(t)) r.felder[kv[1].trim().toLowerCase()] = kv[2].trim();
      else if (ARTEN[t.toLowerCase()]) {
        r.art = ARTEN[t.toLowerCase()];
        r.artText = t;
      }
    });
    if (!r.tag) throw new Error("Das Datum fehlt.");
    if (!r.von) throw new Error("Die Uhrzeit fehlt.");
    if (!r.art) throw new Error("Die Terminart fehlt.");
    const h = +r.von.slice(0, 2);
    if (h < 7 || h > 22) throw new Error("Die Startzeit muss zwischen 7 und 22 Uhr liegen.");
    r.h = h;
    return r;
  }
  function eintragAus(r) {
    const f = r.felder,
      x = (s) => entschaerfeText(s || "");
    const e = { kind: r.art };
    const regulaerBis = `${pad(Math.min(24, r.h + 2))}:00`;
    if (r.von !== `${pad(r.h)}:00`) e.start = r.von;
    if (r.bis && r.bis !== regulaerBis) {
      e.von = `${pad(r.h)}:00`;
      e.bis = r.bis;
    }
    if (r.art === "kunde" || r.art === "premium") {
      const name = (f.name || "").trim();
      const an = /^(Familie|Frau|Herr)\s+/i.exec(name);
      const rest = an ? name.slice(an[0].length) : name;
      const woerter = rest.split(/\s+/).filter(Boolean);
      if (an) e.anrede = x(an[1]);
      e.nachname = x(woerter.pop() || "");
      e.vorname = x(woerter.join(" "));
      const adr = (f.adresse || "").split(",").map((s) => s.trim());
      e.strasse = x(adr[0] || "");
      const po = /^(\d{5})\s+(.*)$/.exec(adr[1] || "");
      if (po) {
        e.plz = po[1];
        e.ort = x(po[2]);
      } else if (adr[1]) e.ort = x(adr[1]);
      if (f.telefon) e.telefon = x(f.telefon);
      if (r.art === "kunde") e.quelle = x(f.quelle || "Festgebietsbegehung");
      if (f.notiz) e.notiz = x(f.notiz);
    } else if (r.art === "meeting") {
      e.art = x(f.art || (/meeting|training|schulung|event/i.test(r.artText) && !/^meeting$/i.test(r.artText) ? r.artText : "Teammeeting"));
      e.von = e.von || `${pad(r.h)}:00`;
      e.bis = e.bis || regulaerBis;
    } else if (r.art === "privat" || r.art === "buero") {
      e.von = e.von || `${pad(r.h)}:00`;
      e.bis = e.bis || regulaerBis;
    } else if (r.art === "terminieren") {
      e.quelle = /promotion/i.test(r.artText + " " + (f.art || "")) ? "Promotion" : "Festgebietsbegehung";
      e.ziel = Math.max(1, Math.round(num(f.ziel || "4")));
      if (f.ort) e.ort = x(f.ort);
      e.gebiet = /wei/i.test(f.gebiet || "") ? "Weißgebiet" : "Festgebiet";
    }
    return e;
  }
  function chatDialog() {
    simpleDialog(
      "Aus Chat einfügen",
      "Die Zeile mit PROVISIO-TERMIN hier einfügen",
      `<div class="grp"><div class="field"><label for="chatText">Zeile aus dem Chat</label>
         <textarea id="chatText" rows="4" placeholder="PROVISIO-TERMIN | 2026-11-03 | 10:00-12:00 | Kundentermin | Name: … "></textarea></div>
         <div class="actions"><button type="button" class="btn" id="chatPaste">Aus Zwischenablage holen</button></div></div>
       <div id="chatVorschau"></div>
       <p class="err" id="chatErr" hidden></p>`,
      () => {
        const err = document.getElementById("chatErr");
        try {
          const r = chatLesen(document.getElementById("chatText").value);
          if (entries[key(r.tag, r.h)]) throw new Error("Zu dieser Zeit steht schon ein Termin im Kalender.");
          entries[key(r.tag, r.h)] = eintragAus(r);
          saveData();
          closeModal();
          renderAll();
          if (typeof gpGeheZu === "function") gpGeheZu(r.tag);
        } catch (e) {
          err.textContent = e.message;
          err.hidden = false;
        }
      },
      "Eintragen",
    );
    const feld = document.getElementById("chatText");
    const vorschau = () => {
      const box = document.getElementById("chatVorschau");
      const err = document.getElementById("chatErr");
      err.hidden = true;
      try {
        const r = chatLesen(feld.value);
        const e = eintragAus(r);
        const d = fromDk(r.tag);
        box.innerHTML = `<div class="grp chatvor"><b>${DAYS_L[(d.getDay() + 6) % 7]}, ${fmt(d)} · ${r.von}${r.bis ? "–" + r.bis : ""} Uhr</b>
          <span>${r.artText || r.art}${e.nachname ? " · " + [e.anrede, e.vorname, e.nachname].filter(Boolean).join(" ") : ""}${e.ort ? " · " + e.ort : ""}</span></div>`;
      } catch (ex) {
        box.innerHTML = "";
      }
    };
    feld.addEventListener("input", vorschau);
    document.getElementById("chatPaste").onclick = async () => {
      try {
        feld.value = await navigator.clipboard.readText();
        vorschau();
      } catch (e) {
        feld.focus();
      }
    };
  }

  /* Leiste unten im Planer: Rückgängig und Aus Chat einfügen */
  function leisteEinbauen() {
    const seite = document.getElementById("page-planer");
    if (!seite || seite.querySelector(".planaktionen")) return;
    const d = document.createElement("div");
    d.className = "planaktionen";
    d.innerHTML = `<button type="button" class="planakt" id="planUndo" disabled>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg>
        Rückgängig</button>
      <button type="button" class="planakt" id="planChat">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>
        Aus Chat einfügen</button>`;
    const legende = seite.querySelector(".legend");
    (legende || seite.lastElementChild).after(d);
    d.querySelector("#planUndo").onclick = rueckgaengig;
    d.querySelector("#planChat").onclick = chatDialog;
    knopfZeigen();
  }
  function knopfZeigen() {
    const b = document.getElementById("planUndo");
    if (b) {
      b.disabled = !stapel.length;
      b.title = stapel.length ? `${stapel.length} Schritt${stapel.length === 1 ? "" : "e"} zurück möglich` : "";
    }
  }

  /* ---------- 4 · Kleinigkeiten ---------- */
  /* Keine X-Markierung mehr im Raster */
  if (typeof archivMark === "function") archivMark = () => "";
  /* Alte Daten an Beta 1.1 anpassen */
  function alteDatenPflegen() {
    let geaendert = false;
    const umbenennen = (liste) => {
      if (!Array.isArray(liste)) return liste;
      return liste.map((g) => {
        if (NK_UMBENANNT[g]) {
          geaendert = true;
          return NK_UMBENANNT[g];
        }
        return g;
      });
    };
    Object.values(entries).forEach((e) => {
      if (e && e.nb && e.nb.nkgruende) e.nb.nkgruende = umbenennen(e.nb.nkgruende);
    });
    [potenzial, wiedervorlagen].forEach((l) =>
      (l || []).forEach((x) => {
        if (x && x.nkgruende) x.nkgruende = umbenennen(x.nkgruende);
      }),
    );
    /* Abholtermine, deren Verkauf schon im ursprünglichen Termin steht, nicht doppelt zählen */
    Object.keys(entries).forEach((k) => {
      const e = entries[k];
      if (!e || e.kind !== "abholen" || !e.nb || e.nb.verkauft !== "Ja" || e.vonTag === undefined) return;
      const u = entries[key(e.vonTag, e.vonStunde)];
      if (u && u.nb && u.nb.verkauft === "Ja" && u.nb.lieferdatum === k.split("|")[0]) {
        e.nb.verkauft = "Übertragen";
        if (e.nb.k70 === "Ja") e.nb.k70 = "Übertragen";
        geaendert = true;
      }
    });
    if (geaendert) saveData();
  }

  if (typeof window.paint === "function") {
    const paintOhneWdh = window.paint;
    window.paint = function () {
      const r = paintOhneWdh.apply(this, arguments);
      sicher(wdhEinbauen);
      return r;
    };
  }
  if (typeof window.render === "function") {
    const renderOhneLeiste = window.render;
    window.render = function () {
      const r = renderOhneLeiste.apply(this, arguments);
      sicher(leisteEinbauen);
      return r;
    };
  }
  /* „Woche kopieren“ gibt es nicht mehr – dafür Serien */
  const kopier = document.getElementById("kopierBtn");
  if (kopier) kopier.remove();
  setInterval(() => sicher(serienNachziehen), 6 * 36e5);
  window.chatLesen = chatLesen;
  window.serienNachziehen = serienNachziehen;
})();
