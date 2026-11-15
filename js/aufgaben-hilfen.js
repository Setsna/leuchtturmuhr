/* Leuchtturmuhr: kleine Helfer für die Aufgaben aller Stationen (Kärtchen, Ziffernfelder, Prüfregeln).
   Klassisches Skript, legt window.LU.ah an. Braucht LU.zeit. Keine Oberfläche.
   Prüfregeln rechnen immer mit LU.zeit, nie mit Textvergleich. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit;

  /* Kärtchen: richtige und falsche, ohne doppelte Texte, gemischt */
  function karten(zufall, richtige, falsche, anzahl = 4) {
    const gesehen = new Set(), liste = [];
    for (const t of richtige) if (!gesehen.has(t)) { gesehen.add(t); liste.push({ text: t, richtig: true }); }
    for (const t of falsche) { if (liste.length >= anzahl) break; if (!gesehen.has(t)) { gesehen.add(t); liste.push({ text: t, richtig: false }); } }
    return zufall.mische(liste);
  }

  /* Ziffernzeilen */
  const zeileUhrzeit = (titel, p = '') => ({ titel, teile: [{ feld: p + 'h', stellen: 2, label: 'Stunden' }, { text: ':' }, { feld: p + 'm', stellen: 2, label: 'Minuten' }, { text: 'Uhr' }] });
  const zeileDauer = (titel, p = '') => ({ titel, teile: [{ feld: p + 'h', stellen: 2, label: 'Stunden' }, { text: 'h' }, { feld: p + 'm', stellen: 2, label: 'Minuten' }, { text: 'min' }] });
  const zeileMinuten = titel => ({ titel, teile: [{ feld: 'min', stellen: 3, label: 'Minuten' }, { text: 'min' }] });

  /* Werte → Zeitpunkt bzw. Dauer; null, wenn ungültig */
  function alsZeitpunkt(h, m) { return h === null || m === null ? null : Z.zeitpunkt(h, m); }
  function alsDauer(h, m) {
    if (h === null && m === null) return null;
    const hh = h || 0, mm = m || 0;
    if (mm > 59) return null;   /* „1 h 75 min“ ist keine Schreibweise; 60 Minuten sind 1 Stunde */
    return hh * 60 + mm;
  }
  const loesungUhrzeit = (m, p = '') => ({ [p + 'h']: String(Z.stunde(m)).padStart(2, '0'), [p + 'm']: String(Z.minute(m)).padStart(2, '0') });
  const loesungDauer = (d, p = '') => ({ [p + 'h']: String(Math.floor(d / 60)), [p + 'm']: String(d % 60) });

  /* Hinweise in Worten */
  const zahl = n => (n % 12) || 12;
  /* Wohin gehört der lange Zeiger? „auf die 9“ oder „zwischen die 2 und die 3“ */
  function minuteOrt(m) {
    const mi = Z.minute(m);
    if (mi % 5 === 0) return `auf die ${zahl(mi / 5)}`;
    return `zwischen die ${zahl(Math.floor(mi / 5))} und die ${zahl(Math.floor(mi / 5) + 1)}`;
  }

  /* Tageszeit eines Zeitpunkts (nur für die Bildzeichen; Abend hat kein Zeichen und kommt nicht vor) */
  function tageszeit(m) {
    const h = Z.stunde(m);
    if (h < 5 || h >= 21) return 'nachts';
    if (h < 12) return 'vormittags';
    if (h < 18) return 'nachmittags';
    return null;
  }

  LU.ah = { karten, zeileUhrzeit, zeileDauer, zeileMinuten, alsZeitpunkt, alsDauer, loesungUhrzeit, loesungDauer, minuteOrt, tageszeit };
})();
