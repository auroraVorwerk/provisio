/**
 * Inventur – Mindestbestand
 *
 * Ergänzt renderInventur() aus 22-inventur.js um den Filter "Nur Vorhandene",
 * individuelle Mindestbestände und eine Nachbestellliste.
 * Speicherung in settings.invMin und settings.invNurDa.
 */

let invMinBearbeiten = false;

function invMin() {
  return settings.invMin || (settings.invMin = {});
}

function invNachbestellen() {
  const liste = [];
  const min = invMin();
  (katalog.liste || []).forEach((k) =>
    (k.artikel || []).forEach((a) => {
      const id = artKey(k.kat + "|" + a.n);
      const soll = +min[id] || 0;
      if (!soll) return;
      const ist = +inventur[id] || 0;
      if (ist < soll) liste.push({ kat: k.kat, n: a.n, p: +a.p || 0, ist, soll, fehlt: soll - ist });
    }),
  );
  return liste;
}

const renderInventurAlt = renderInventur;
renderInventur = function () {
  renderInventurAlt();
  const box = document.getElementById("inventur");
  if (!box || !me) return;
  const min = invMin();
  const nurDa = !!settings.invNurDa;
  const fehlt = invNachbestellen();

  /* Bedienleiste unter der Suche */
  const kopf = box.querySelector(".asec");
  if (kopf && !kopf.querySelector(".invextra")) {
    const leiste = document.createElement("div");
    leiste.className = "invextra";
    leiste.innerHTML = `
      <div class="invschalter" role="group" aria-label="Ansicht">
        <button type="button" data-invda="0" aria-pressed="${!nurDa}">Alles zeigen</button>
        <button type="button" data-invda="1" aria-pressed="${nurDa}">Nur Vorhandene</button>
      </div>
      <div class="invknoepfe">
        <button type="button" class="invkachel${fehlt.length ? " heiss" : ""}" id="invNachb">
          <span class="hz">${fehlt.length}</span>
          <span class="htx"><b>Nachbestellliste</b><span>${fehlt.length ? "unter Mindestbestand" : "alles da"}</span></span>
        </button>
        <button type="button" class="invkachel${invMinBearbeiten ? " an" : ""}" id="invMinBtn">
          <span class="hz">☰</span>
          <span class="htx"><b>Mindestbestände</b><span>${invMinBearbeiten ? "fertig tippen" : Object.keys(min).length + " festgelegt"}</span></span>
        </button>
      </div>
      ${
        invMinBearbeiten
          ? `<p class="hinweis">Tippe bei jedem Artikel auf „Min“, den du überwachen willst.
        Nur diese erscheinen später in der Nachbestellliste.</p>`
          : ""
      }`;
    const nach = kopf.querySelector("#invTreffer") || kopf.lastElementChild;
    nach.insertAdjacentElement("afterend", leiste);
  }

  /* Jede Zeile: Mindestbestand anzeigen oder setzen */
  box.querySelectorAll(".invzeile").forEach((z) => {
    const m = z.querySelector("[data-menge]");
    if (!m) return;
    const id = m.dataset.menge;
    const soll = +min[id] || 0;
    const ist = +inventur[id] || 0;
    z.dataset.ist = ist;
    z.classList.toggle("unter", soll > 0 && ist < soll);
    const nm = z.querySelector(".nm");
    if (nm && soll && !nm.querySelector(".invminlbl"))
      nm.insertAdjacentHTML("beforeend", `<em class="invminlbl">Mindestbestand ${soll}</em>`);
    if (invMinBearbeiten && !z.querySelector("[data-invmin]")) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mini invminknopf" + (soll ? " an" : "");
      b.dataset.invmin = id;
      b.dataset.name = (nm ? nm.firstChild.textContent : "Artikel").trim();
      b.textContent = soll ? `Min ${soll}` : "Min";
      z.appendChild(b);
    }
  });

  /* Bedienung */
  box.querySelectorAll("[data-invda]").forEach(
    (b) =>
      (b.onclick = () => {
        settings.invNurDa = b.dataset.invda === "1";
        saveData();
        invNeuZeichnen();
      }),
  );
  const mb = document.getElementById("invMinBtn");
  if (mb)
    mb.onclick = () => {
      invMinBearbeiten = !invMinBearbeiten;
      invNeuZeichnen();
    };
  box.querySelectorAll("[data-invmin]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.invmin;
        zahlEingabe("Mindestbestand · " + b.dataset.name, +invMin()[id] || 0, (v) => {
          if (v > 0) invMin()[id] = v;
          else delete invMin()[id];
          saveData();
          invNeuZeichnen();
        });
      }),
  );
  const nb = document.getElementById("invNachb");
  if (nb)
    nb.onclick = () => {
      const l = invNachbestellen();
      if (!l.length) {
        simpleDialog(
          "Nachbestellliste",
          "alles über Mindestbestand",
          `<p class="hinweis">Kein Artikel liegt unter seinem Mindestbestand.${
            Object.keys(invMin()).length
              ? ""
              : " Du hast noch keine Mindestbestände festgelegt – tippe dafür auf „Mindestbestände“."
          }</p>`,
          () => closeModal(),
          "Schließen",
        );
        return;
      }
      const wert = l.reduce((s, x) => s + x.fehlt * x.p, 0);
      const text = l.map((x) => `${x.fehlt} × ${x.n}`).join("\n");
      simpleDialog(
        "Nachbestellliste",
        `${l.length} Artikel unter Mindestbestand`,
        `<div class="ascroll"><table class="atable invnach"><thead><tr>
         <th>Artikel</th><th>Bestand</th><th>Min</th><th>fehlt</th></tr></thead><tbody>
       ${l.map((x) => `<tr><td>${x.n}<small>${x.kat}</small></td><td class="v">${x.ist}</td><td class="v">${x.soll}</td><td class="v"><b>${x.fehlt}</b></td></tr>`).join("")}
       </tbody></table></div>
       <p class="hinweis">Warenwert der Fehlmenge: ${preis(wert)} €</p>`,
        () => {
          navigator.clipboard.writeText(text).catch(() => {});
          closeModal();
        },
        "Liste kopieren",
      );
    };

  invFiltern();
};

/* Die Suche blendet Zeilen ein und aus – „Nur Vorhandene" muss danach greifen */
const invFilternAlt = invFiltern;
invFiltern = function () {
  invFilternAlt();
  if (!settings.invNurDa) return;
  const box = document.getElementById("invliste");
  if (!box) return;
  box.querySelectorAll(".invzeile").forEach((z) => {
    const m = z.querySelector("[data-menge]");
    const ist = m ? +inventur[m.dataset.menge] || 0 : 0;
    if (!ist) z.hidden = true;
  });
  /* Kategorien ohne sichtbare Artikel ganz ausblenden */
  box.querySelectorAll(".invgruppe").forEach((gr) => {
    const sichtbar = [...gr.querySelectorAll(".invzeile")].some((z) => !z.hidden);
    gr.hidden = !sichtbar;
    const kopf = box.querySelector(`[data-katzu="${gr.dataset.gruppe}"]`);
    if (kopf) kopf.hidden = !sichtbar;
  });
};
