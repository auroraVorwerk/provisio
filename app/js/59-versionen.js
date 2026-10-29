/**
 * Versionsverlauf
 *
 * Kurze Liste der Versionen; ein Tipp öffnet, was sich jeweils geändert hat.
 * Neue Versionen kommen oben in VERSIONEN dazu. Bis der Verlauf einmal
 * angesehen wurde, trägt der Eintrag in den Einstellungen einen Punkt.
 */
const VERSIONEN = [
  {
    v: "Beta 1.1",
    datum: "Oktober 2026",
    kurz: "Serientermine, Rückgängig, Verkäufe und Provision neu",
    teile: [
      [
        "Neu",
        [
          "Serientermine: Meeting, Privat, Individuell und Büro täglich, werktags oder wöchentlich – immer 52 Wochen im Voraus. Beim Löschen: nur dieser oder alle zukünftigen.",
          "Rückgängig im Planer für versehentlich Gelöschtes oder Angelegtes.",
          "Aus Chat einfügen: eine Terminzeile aus dem Chat mit Claude direkt eintragen.",
          "Verkäufe: Leadverkauf (5 %), Leervorführung (10 %) und Eigenkauf neben dem Distanzverkauf.",
          "Provision mit Versicherungszuschuss (9 % RV + 5 % KV), Sonstiges und Teamprovision im Detail; „Was wäre, wenn“ bis +25.",
          "Team: nur noch 10, 6 oder 4 %; erwarteter Umsatz und Einheiten rechnen sich aus deinen bisherigen Meldungen.",
          "Langzeitziel als bunter Balken auf der Heute-Seite; Ziele als Säulen nebeneinander.",
          "Must-have-K70-Artikel in den Einstellungen.",
          "Plus und Minus gedrückt halten zählt immer schneller.",
        ],
      ],
      [
        "Verbessert",
        [
          "Provisionsaufteilung als zwei Häkchen direkt unter dem Bruttoumsatz.",
          "Nachbereitung: erst K70, dann Kauf; Status nur am Anfang; keine Aufbau-Animation bei jeder Eingabe.",
          "Promotion: Ziel zählt Termine und Kontakte; rund 65 % der Kontakte fließen in die Prognose.",
          "Nicht angetroffen bleibt im Planer stehen. Terminierungen zeigen ihre echte Zeit.",
          "Abholtermin zählt Verkäufe nicht mehr doppelt.",
          "Statistik-PDF hell mit farbigen Spaltenköpfen; Säulen flach.",
          "Klareres Glas in der Leiste, Fenster ohne Glas, größere Seitenränder.",
        ],
      ],
      [
        "Entfernt",
        [
          "Sonne oben, Woche kopieren, Jobtickets, Trichter, Hilfe und Rundgang.",
          "Mindestbestand und Nachbestellliste, Wetter, „Für Kundenberater geschrieben“, „Termin startet jetzt“.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.0",
    datum: "Oktober 2026",
    kurz: "Neues Design und geteilte Provision",
    teile: [
      [
        "Neu",
        [
          "Ruhigeres Design im Apple-Stil mit Glas-Effekt – in den Einstellungen abschaltbar.",
          "Provision aufteilen: Nach jedem Verkauf legst du per Schieberegler fest, wie viel der Verkaufs- (15 %) und Kontaktprovision (5 %) bei dir bleibt.",
          "Teamleiter-Satz je Woche: In der Wochenmeldung eines Teammitglieds wählst du deinen Anteil. Die letzte Angabe ist vorbelegt, ein Wechsel wird im Provisionsrechner getrennt gezeigt.",
          "Statistik als PDF im A4-Querformat.",
          "Versionsverlauf zum Nachlesen.",
        ],
      ],
      [
        "Verbessert",
        [
          "Provisionsrechner zeigt schlicht, woraus sich die Überweisung zusammensetzt.",
          "Einstellungen in klare Bereiche gegliedert, Rolle per Schieberegler.",
          "Neuer Wiederherstellungs-Code jederzeit erzeugbar.",
        ],
      ],
      ["Entfernt", ["Verspielte Effekte wie Münzen, Druckwellen und Konfetti.", "Technische Statusanzeigen in den Einstellungen."]],
    ],
  },
  {
    v: "Security 1.0",
    datum: "Oktober 2026",
    kurz: "Lokal, offline und verschlüsselt",
    teile: [
      [
        "Neu",
        [
          "Alle Daten liegen verschlüsselt (AES-256) in einer geschützten Datei auf dem Gerät.",
          "Wiederherstellungs-Code, falls du dein Passwort vergisst.",
          "Klare Passwortregeln: mindestens 8 Zeichen mit Groß- und Kleinbuchstabe, Zahl und Sonderzeichen.",
          "Erinnerung an Datensicherungen.",
          "Neuer Name Provisio mit Schwebebahn-Icon und blauem Farbthema.",
        ],
      ],
      [
        "Verbessert",
        [
          "Läuft komplett offline – ohne Datenbank, ohne Server, ohne Adresssuche.",
          "Rolle Kundenberatung oder Teamleitung selbst wählbar, Team wird selbst eingetragen.",
        ],
      ],
      ["Entfernt", ["Cloud-Datenbank, Kalender-Synchronisation, Admin-Bereich und iPad-Ansicht."]],
    ],
  },
];

function versionDetail(i) {
  const v = VERSIONEN[i];
  unterseiteOeffnen(
    v.v,
    "Versionen",
    `<p class="vsdatum">${v.datum}${i === 0 ? " · aktuell" : ""}</p>
     <p class="vskurz">${v.kurz}</p>
     ${v.teile
       .map(
         ([titel, punkte]) => `<p class="esgh">${titel}</p>
       <ul class="vspunkte">${punkte.map((p) => `<li>${p}</li>`).join("")}</ul>`,
       )
       .join("")}`,
  );
}

function versionenUnterseite() {
  store.set("pv-version-gesehen", VERSIONEN[0].v);
  const punkt = document.querySelector("#esVersionen .esneu");
  if (punkt) punkt.remove();
  unterseiteOeffnen(
    "Versionen",
    "Einstellungen",
    `<div class="esgrp">${VERSIONEN.map(
      (v, i) => `<button type="button" class="esz eszhoch" data-version="${i}">
        <span class="eszt">${v.v}${i === 0 ? ' <span class="vsjetzt">Aktuell</span>' : ""}
          <small>${v.kurz}</small></span><em>${v.datum.split(" ")[0].slice(0, 3)}.</em>${CHEV}</button>`,
    ).join("")}</div>
     <p class="esfuss">Tippe auf eine Version, um zu lesen, was sich geändert hat.</p>`,
    (ebene) =>
      ebene.querySelectorAll("[data-version]").forEach((b) => (b.onclick = () => versionDetail(+b.dataset.version))),
  );
}
