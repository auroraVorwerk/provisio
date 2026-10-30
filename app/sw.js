/**
 * Service Worker – Offlinebetrieb
 *
 * App-Gerüst: Stale-While-Revalidate aus dem Cache.
 * Die App läuft vollständig lokal und offline.
 * VERSION bei jeder Veröffentlichung erhöhen.
 */
const VERSION = "provisio-beta-1.6";
const DATEIEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./css/01-basis.css?v=51",
  "./css/02-layout.css?v=51",
  "./css/03-farbwelten.css?v=51",
  "./css/04-planer.css?v=51",
  "./css/05-heute-team.css?v=51",
  "./css/06-gestaltung.css?v=51",
  "./css/07-bedienung.css?v=51",
  "./css/08-planer-bloecke.css?v=51",
  "./css/09-fenster-tabellen.css?v=51",
  "./css/10-verkaeufe.css?v=51",
  "./css/11-anmeldungen-katalog.css?v=51",
  "./css/13-animationen.css?v=51",
  "./css/14-inventur-provision.css?v=51",
  "./css/15-motion.css?v=51",
  "./css/16-listen-motion.css?v=51",
  "./css/17-oberflaeche.css?v=51",
  "./css/18-performance.css?v=51",
  "./css/19-langzeitziel.css?v=51",
  "./css/20-heute-provision-planer.css?v=51",
  "./css/21-apple.css?v=51",
  "./css/22-duo.css?v=51",
  "./css/23-einfuehrung.css?v=51",
  "./js/01-konstanten.js?v=51",
  "./js/02-datum.js?v=51",
  "./js/03-daten.js?v=51",
  "./js/04-raster.js?v=51",
  "./js/05-dialog.js?v=51",
  "./js/06-nachbereitung.js?v=51",
  "./js/07-potenzial.js?v=51",
  "./js/08-wiedervorlage.js?v=51",
  "./js/09-dialogschritte.js?v=51",
  "./js/10-statistik.js?v=51",
  "./js/11-druck.js?v=51",
  "./js/12-vertriebsmonat-provision.js?v=51",
  "./js/13-provisionsrechner.js?v=51",
  "./js/14-provisionswunsch.js?v=51",
  "./js/15-auswertungen.js?v=51",
  "./js/16-cloud-sync.js?v=51",
  "./js/17-anmeldung.js?v=51",
  "./js/18-teamansicht.js?v=51",
  "./js/19-profil.js?v=51",
  "./js/20-wochenmeldung.js?v=51",
  "./js/21-adresse.js?v=51",
  "./js/22-inventur.js?v=51",
  "./js/23-ziele-jobtickets.js?v=51",
  "./js/24-team-wochenmeldung.js?v=51",
  "./js/25-fahrtenbuch.js?v=51",
  "./js/26-kundenliste.js?v=51",
  "./js/27-abgleich-papierkorb.js?v=51",
  "./js/28-heute.js?v=51",
  "./js/29-jahresrueckblick.js?v=51",
  "./js/30-zaehlen.js?v=51",
  "./js/31-hilfe.js?v=51",
  "./js/32-rahmen.js?v=51",
  "./js/33-planer-raster.js?v=51",
  "./js/34-messe.js?v=51",
  "./js/35-wochenmeldung-kennzahlen.js?v=51",
  "./js/36-heute-uebersicht.js?v=51",
  "./js/37-inventur-mindestbestand.js?v=51",
  "./js/38-team-provision.js?v=51",
  "./js/39-einstellungen-team.js?v=51",
  "./js/40-nichtkauf-checkin.js?v=51",
  "./js/41-buero-verkaeufe.js?v=51",
  "./js/42-anmeldungen-kampagnen.js?v=51",
  "./js/43-katalog.js?v=51",
  "./js/44-animationen.js?v=51",
  "./js/45-datenfreigabe.js?v=51",
  "./js/46-sicherheit.js?v=51",
  "./js/47-motion.js?v=51",
  "./js/48-zaehlwerk.js?v=51",
  "./js/49-listen-motion.js?v=51",
  "./js/50-interessenten.js?v=51",
  "./js/51-oberflaeche.js?v=51",
  "./js/52-langzeitziel.js?v=51",
  "./js/53-heute-provision-planer.js?v=51",
  "./js/54-terminmodus-trichter-urlaub.js?v=51",
  "./js/55-nachbereitung-assistent.js?v=51",
  "./js/56-provisionsaufteilung.js?v=51",
  "./js/57-teamsatz.js?v=51",
  "./js/58-provision-ansicht.js?v=51",
  "./js/59-versionen.js?v=51",
  "./js/60-einstellungen.js?v=51",
  "./js/61-gedrueckt-halten.js?v=51",
  "./js/62-verkaeufe-provision.js?v=51",
  "./js/63-planer-extras.js?v=51",
  "./js/64-schnelltermin.js?v=51",
  "./js/65-leiste-fixieren.js?v=51",
  "./js/66-demo.js?v=51",
  "./js/67-duo.js?v=51",
  "./js/68-fenster-ruhig.js?v=51",
  "./js/69-einfuehrung.js?v=51",
  "./js/70-viertelstunde.js?v=51",
  "./js/71-kw-uebersicht.js?v=51",
  "./js/72-tagesfuelle.js?v=51",
  "./js/73-sicherung.js?v=51",
];

self.addEventListener("install", (ev) => {
  self.skipWaiting();
  ev.waitUntil(
    caches
      .open(VERSION)
      .then((c) =>
        /* einzeln statt addAll: fehlt eine Datei, bricht nicht die ganze Installation ab */
        Promise.all(DATEIEN.map((d) => c.add(d).catch(() => {}))),
      )
      .catch(() => {}),
  );
});
self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("message", (ev) => {
  if (ev.data === "uebernehmen") self.skipWaiting();
});

self.addEventListener("fetch", (ev) => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== "GET") return;

  const eigen = url.origin === location.origin;
  if (eigen) {
    /* Gerüst: erst aus dem Speicher ausliefern, dann im Hintergrund erneuern */
    ev.respondWith(
      caches.match(ev.request).then((treffer) => {
        const frisch = fetch(ev.request)
          .then((r) => {
            const kopie = r.clone();
            caches
              .open(VERSION)
              .then((c) => c.put(ev.request, kopie))
              .catch(() => {});
            return r;
          })
          .catch(() => treffer || caches.match("./index.html"));
        return treffer || frisch;
      }),
    );
    return;
  }
  ev.respondWith(fetch(ev.request).catch(() => caches.match(ev.request)));
});
