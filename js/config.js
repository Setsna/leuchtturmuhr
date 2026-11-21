/* Leuchtturmuhr: alle Einstellungen an einer Stelle.
   Klassisches Skript, legt window.LU.config an. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};

  LU.config = {
    name: 'Leuchtturmuhr',
    unterzeile: 'Wie spät? Wie lange?',
    maskottchen: 'Lumi',
    sammelbuch: 'Leuchtfeuerbuch',

    /* Speicher im Browser (Baukasten js/konto-speicher.js):
       localStorage   leuchtturmuhr-v1.k<kennung>            Stand samt Vorname (für die Anzeige ohne Netz)
                      leuchtturmuhr-v1.k<kennung>.abgleich   zuletzt abgeglichener Stand
       sessionStorage leuchtturmuhr-v1-wer                   welches Kind in diesem Tab angemeldet ist
       Die Kennung wird aus dem Code errechnet, der Code selbst steht nicht im Namen. */
    speicher: { schluessel: 'leuchtturmuhr', schema: 1 },
    codeLaenge: 8,
    nameMaxLaenge: 20,

    /* Gemeinsames Konto: das Firebase-Projekt des Perlentauchers.
       Diese Angaben sind keine Geheimnisse, sie stehen bei jeder Firebase-Seite im Quelltext.
       Geschützt werden die Daten durch die Regeln in der Firebase-Konsole (Block lu_stand). */
    firebase: {
      apiKey: 'AIzaSyBX3MUJq69uFyejbEiJimGeAtHMER3OCdE',
      authDomain: 'lernplattform-44aa1.firebaseapp.com',
      projectId: 'lernplattform-44aa1',
      storageBucket: 'lernplattform-44aa1.firebasestorage.app',
      messagingSenderId: '213839225177',
      appId: '1:213839225177:web:4cf676269e50c708466c48'
    },
    cloud: {
      kinder: 'kinder',        /* kinder/<code>: Vorname, von der Lehrkraft angelegt (nur lesen) */
      stand: 'lu_stand',       /* lu_stand/<code>: der Stand dieses Kindes in der Leuchtturmuhr */
      schreibPauseMs: 2500,    /* so lange nach der letzten Änderung warten, dann gebündelt schreiben */
      freigabe: 'leuchtturmuhr' /* Schlüssel im Lehrerbereich des Perlentauchers (oeffentlich/plattformen), seit 21.11.2026 */
    },

    /* Stationen und Stufen. Die Ids sind Teil der Firebase-Regeln (feste Schlüssel 'station:stufe').
       Eine neue Station oder Stufe braucht eine Regeländerung (Regel-Block lu_stand und tools/test/lu-gueltig.js).
       live: false = Karte „Kommt bald“. Live wird eine Station erst, wenn ihr Modul geladen ist (LU.stationen[id]). */
    stationen: [
      { id: 'uhr', name: 'Uhrzeit', kurz: 'Uhr lesen und stellen', live: true },
      { id: 'spannen', name: 'Zeit\u00ADspannen',   /* weicher Trennstrich: bricht auf schmalen Karten als „Zeit-spannen“ */ kurz: 'Stunden und Minuten', live: true },
      { id: 'dauer', name: 'Wie lange?', kurz: 'Beginn, Ende, Dauer', live: true },
      { id: 'fahrplan', name: 'Hafen', kurz: 'Fahrpläne lesen', live: true },
      { id: 'stimmt', name: 'Kann das stimmen?', kurz: 'Lumi prüfen', live: true }
    ],
    stufen: ['leicht', 'mittel', 'knifflig'],

    /* Sprechweise (Mini-Spec Etappe 1, Ingo 15.11.2026): So spricht Lumi.
       'nach' = „Viertel nach zwei / Viertel vor drei“, 'ost' = „viertel drei / dreiviertel drei“.
       Beim Prüfen gelten immer beide Formen. */
    sprechweise: 'nach',

    /* Runde: 6 Aufgaben, Stempel ab 5 geschafften (Ingo, 15.11.2026, wie Chancenbucht) */
    runde: { aufgaben: 6, stempelAb: 5 },

    /* Obergrenze für runden je Schlüssel (wie im Regel-Block) */
    rundenMax: 100000,

    /* Versionsnummer der Bilder, getrennt von ?v=N für js und css */
    bildStand: 2
  };
})();
