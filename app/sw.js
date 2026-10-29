/**
 * Service Worker – Offlinebetrieb
 *
 * App-Gerüst: Stale-While-Revalidate aus dem Cache.
 * Die App läuft vollständig lokal und offline.
 * VERSION bei jeder Veröffentlichung erhöhen.
 */
const VERSION = "provisio-beta-1.1";
const DATEIEN = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./css/01-basis.css?v=38",
  "./css/02-layout.css?v=38",
  "./css/03-farbwelten.css?v=38",
  "./css/04-planer.css?v=38",
  "./css/05-heute-team.css?v=38",
  "./css/06-gestaltung.css?v=38",
  "./css/07-bedienung.css?v=38",
  "./css/08-planer-bloecke.css?v=38",
  "./css/09-fenster-tabellen.css?v=38",
  "./css/10-verkaeufe.css?v=38",
  "./css/11-anmeldungen-katalog.css?v=38",
  "./css/13-animationen.css?v=38",
  "./css/14-inventur-provision.css?v=38",
  "./css/15-motion.css?v=38",
  "./css/16-listen-motion.css?v=38",
  "./css/17-oberflaeche.css?v=38",
  "./css/18-performance.css?v=38",
  "./css/19-langzeitziel.css?v=38",
  "./css/20-heute-provision-planer.css?v=38",
  "./css/21-apple.css?v=38",
  "./js/01-konstanten.js?v=38",
  "./js/02-datum.js?v=38",
  "./js/03-daten.js?v=38",
  "./js/04-raster.js?v=38",
  "./js/05-dialog.js?v=38",
  "./js/06-nachbereitung.js?v=38",
  "./js/07-potenzial.js?v=38",
  "./js/08-wiedervorlage.js?v=38",
  "./js/09-dialogschritte.js?v=38",
  "./js/10-statistik.js?v=38",
  "./js/11-druck.js?v=38",
  "./js/12-vertriebsmonat-provision.js?v=38",
  "./js/13-provisionsrechner.js?v=38",
  "./js/14-provisionswunsch.js?v=38",
  "./js/15-auswertungen.js?v=38",
  "./js/16-cloud-sync.js?v=38",
  "./js/17-anmeldung.js?v=38",
  "./js/18-teamansicht.js?v=38",
  "./js/19-profil.js?v=38",
  "./js/20-wochenmeldung.js?v=38",
  "./js/21-adresse.js?v=38",
  "./js/22-inventur.js?v=38",
  "./js/23-ziele-jobtickets.js?v=38",
  "./js/24-team-wochenmeldung.js?v=38",
  "./js/25-fahrtenbuch.js?v=38",
  "./js/26-kundenliste.js?v=38",
  "./js/27-abgleich-papierkorb.js?v=38",
  "./js/28-heute.js?v=38",
  "./js/29-jahresrueckblick.js?v=38",
  "./js/30-zaehlen.js?v=38",
  "./js/31-hilfe.js?v=38",
  "./js/32-rahmen.js?v=38",
  "./js/33-planer-raster.js?v=38",
  "./js/34-messe.js?v=38",
  "./js/35-wochenmeldung-kennzahlen.js?v=38",
  "./js/36-heute-uebersicht.js?v=38",
  "./js/37-inventur-mindestbestand.js?v=38",
  "./js/38-team-provision.js?v=38",
  "./js/39-einstellungen-team.js?v=38",
  "./js/40-nichtkauf-checkin.js?v=38",
  "./js/41-buero-verkaeufe.js?v=38",
  "./js/42-anmeldungen-kampagnen.js?v=38",
  "./js/43-katalog.js?v=38",
  "./js/44-animationen.js?v=38",
  "./js/45-datenfreigabe.js?v=38",
  "./js/46-sicherheit.js?v=38",
  "./js/47-motion.js?v=38",
  "./js/48-zaehlwerk.js?v=38",
  "./js/49-listen-motion.js?v=38",
  "./js/50-interessenten.js?v=38",
  "./js/51-oberflaeche.js?v=38",
  "./js/52-langzeitziel.js?v=38",
  "./js/53-heute-provision-planer.js?v=38",
  "./js/54-terminmodus-trichter-urlaub.js?v=38",
  "./js/55-nachbereitung-assistent.js?v=38",
  "./js/56-provisionsaufteilung.js?v=38",
  "./js/57-teamsatz.js?v=38",
  "./js/58-provision-ansicht.js?v=38",
  "./js/59-versionen.js?v=38",
  "./js/60-einstellungen.js?v=38",
  "./js/61-gedrueckt-halten.js?v=38",
  "./js/62-verkaeufe-provision.js?v=38",
  "./js/63-planer-extras.js?v=38",
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
