/**
 * Versionsverlauf
 *
 * Kurze Liste der Versionen; ein Tipp öffnet, was sich jeweils geändert hat.
 * Neue Versionen kommen oben in VERSIONEN dazu. Bis der Verlauf einmal
 * angesehen wurde, trägt der Eintrag in den Einstellungen einen Punkt.
 */
const VERSIONEN = [
  {
    v: "Beta 1.5.3",
    datum: "Oktober 2026",
    kurz: "KW-Übersicht und Notiz für Meetings",
    teile: [
      [
        "Neu",
        [
          "Tipp im Planer oder in der Statistik auf „KW …“: Monatskalender mit Kalenderwochen wie bei Apple. Die aktuelle Woche ist umrandet, die angezeigte gefüllt, heute rot. Ein Tipp auf eine Woche springt hin – „Diese Woche“ bringt dich zurück.",
          "Meetings haben eine Notiz, z. B. das Thema der Schulung. Sie steht im Planer direkt hinter der Art.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.5.2",
    datum: "Oktober 2026",
    kurz: "Ohne Erklärtexte, Uhrzeiten mittig",
    teile: [
      [
        "Verbessert",
        [
          "Die kleinen grauen Erklärtexte sind aus der ganzen App verschwunden. Hinweise mit echtem Inhalt – Treffer, Strecke, Status, Knöpfe – bleiben.",
          "Uhrzeiten stehen in den Feldern mittig.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.5.1",
    datum: "Oktober 2026",
    kurz: "iPhone Duo wird zuverlässig erkannt",
    teile: [
      [
        "Verbessert",
        [
          "Der iPhone-Duo-Modus schaltet sich nur noch auf einem echten iPhone Duo von selbst ein. Auf normalen iPhones sprang er in Safari (Leisten oder Tastatur sichtbar) fälschlich an – auch in der Einführung.",
          "Zum Testen im Simulator: Einstellungen → Darstellung → iPhone Duo → An.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.5",
    datum: "Oktober 2026",
    kurz: "Uhrzeiten in Viertelstunden, ViKo und TL Runde",
    teile: [
      [
        "Verbessert",
        [
          "Alle Uhrzeiten wählst du jetzt in 15-Minuten-Schritten statt minutengenau – bei Meetings, Privat, Individuell, Terminieren, Büro, Nachbereitung und Fahrtenbuch.",
          "Leere Zeitfelder öffnen bei der aktuellen Uhrzeit.",
        ],
      ],
      ["Neu", ["Als Teamleiterin gibt es unter Meeting zusätzlich „ViKo“ und „TL Runde“."]],
    ],
  },
  {
    v: "Beta 1.4",
    datum: "Oktober 2026",
    kurz: "Praxis-Einführung und ruhige Fenster",
    teile: [
      [
        "Neu",
        [
          "Praxis-Einführung wie in einem Spiel: Jede Seite, jedes Fenster und jede Funktion probierst du einmal selbst aus – ein Lichtkreis zeigt, wohin du tippst, eine Karte erklärt kurz. 11 Kapitel, 91 Schritte.",
          "Neue Zugänge starten automatisch mit der Einführung. Erst wenn sie geschafft ist und alle Beispiele wieder gelöscht sind, ist die App frei.",
          "Die Einführung merkt sich den Stand – nach einem Neustart geht es am selben Schritt weiter.",
          "Einstellungen → Info → Einführung starten: jederzeit wiederholen. Deine echten Daten werden vorher gesichert und am Ende exakt wiederhergestellt.",
          "Zum Ausprobieren ohne Konto: ?demo=einfuehrung hinter der Adresse.",
        ],
      ],
      [
        "Verbessert",
        [
          "Fenster bauen sich nur beim ersten Öffnen mit Animation auf. Beim Antippen von Ja/Nein, Geräten oder Plus/Minus blinkt nichts mehr.",
          "Verkäufe ohne Vornamen zeigen nur den Nachnamen statt „. Name“.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.3",
    datum: "Oktober 2026",
    kurz: "Für das iPhone Duo",
    teile: [
      [
        "Neu",
        [
          "iPhone Duo zugeklappt: Die Leiste läuft senkrecht rechts unten bis etwa zur halben Höhe, das Plus im Planer sitzt darüber. Die rechte Spalte oben bleibt frei für Uhr und WLAN.",
          "iPhone Duo aufgeklappt quer: Die App verschwimmt, Eingaben sind gesperrt und ein Hinweis bittet ums Hochformat.",
          "iPhone Duo aufgeklappt hoch: Leiste wie gewohnt unten.",
          "Einstellungen → Darstellung → iPhone Duo: Auto erkennt das Gerät am Bildschirmformat (1:√2), An und Aus legen es fest.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.2.2",
    datum: "Oktober 2026",
    kurz: "Demo zum Ausprobieren",
    teile: [
      [
        "Neu",
        [
          "Demo: Mit ?demo hinter der Adresse startet Provisio ohne Anmeldung mit Beispieldaten – zum Testen auf anderen Geräten. Es wird nichts gespeichert, und deine echten Daten bleiben verschlüsselt und unberührt.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.2.1",
    datum: "Oktober 2026",
    kurz: "Menü ganz verschwommen, Statistik-PDF dunkel",
    teile: [
      [
        "Verbessert",
        [
          "Das Mehr-Menü legt sich jetzt über den ganzen Bildschirm – auch hinter der Leiste ist alles verschwommen.",
          "Statistik-PDF im dunklen Provisio-Design mit farbigen Spaltenköpfen und Rand.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.2",
    datum: "Oktober 2026",
    kurz: "Abholtermin, Einstunden-Termine, Provision und Glas",
    teile: [
      [
        "Verbessert",
        [
          "Abholtermin: Verkäufe zählen jetzt wirklich nur einmal – auch in Statistik, Verkäufen und Kundenliste. Bestehende Daten werden beim Start korrigiert.",
          "Planer: Termine von einer Stunde behalten ihre echte Höhe und überlappen nicht mehr.",
          "Provision: Brutto und netto in einer Zeile, die Sätze darunter; Sonstiges mit Leads und Leervorführungen, Zuschuss mit RV und KV getrennt.",
          "Ziele: Goldene Nadel und Vian als bunte Balken wie das persönliche Ziel. Anmeldungen für den Vian trägst du jetzt direkt dort ein.",
          "Statistik: Terminkarten mit Abstand zum Rand.",
          "Untere Leiste bleibt fest unten, auch nach dem Tippen.",
          "Flüssigglas in der Leiste mit Lichtkante und Glanz.",
        ],
      ],
    ],
  },
  {
    v: "Beta 1.1.3",
    datum: "Oktober 2026",
    kurz: "Termine in einem Satz eintragen",
    teile: [
      [
        "Neu",
        [
          "Schnell eintragen: Im Planer auf Plus tippen und den Termin in einem Satz sprechen oder tippen – zum Beispiel „Dienstag 10 Uhr Kundentermin Familie Becker, Hauptstraße 5, Empfehlung“. Tag, Uhrzeit, Art, Name, Adresse, Telefon und Ziel werden erkannt und vor dem Anlegen gezeigt.",
        ],
      ],
      ["Entfernt", ["„Termin-Modus starten“ bei Kundenterminen."]],
    ],
  },
  {
    v: "Beta 1.1.2",
    datum: "Oktober 2026",
    kurz: "Anmeldung mit DK-Nummer im Schlüsselbund",
    teile: [
      ["Verbessert", ["Das iPhone speichert beim Passwort nur noch die DK-Nummer als Benutzernamen – nicht mehr den Nachnamen."]],
      ["Entfernt", ["„Aus Chat einfügen“ im Planer."]],
    ],
  },
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
