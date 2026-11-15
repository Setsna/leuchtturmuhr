/* Leuchtturmuhr: der Zeitbaustein (Etappe 1b). Rechnet, zeigt nichts an.
   Klassisches Skript, legt window.LU.zeit an. Getestet in tools/zeit-test.html.

   Grundregeln (Projekt-CLAUDE.md, „Fachliche Regeln“):
   - Ein ZEITPUNKT ist eine ganze Zahl Minuten seit Mitternacht, 0 bis 1439 (00:00 bis 23:59).
   - Eine ZEITSPANNE (Dauer) ist eine ganze Zahl Minuten, 0 oder mehr.
   - Zeitpunkte werden nur mit alsUhrzeit() angezeigt („09:05 Uhr“), Spannen nur mit alsDauer() („1 h 5 min“).
     Keine Funktion zeigt beides. Eine Uhrzeit nie als Dauer, eine Dauer nie als Uhrzeit.
   - Antworten werden gerechnet, nie als Text verglichen.
   - Analoguhr: Minutenzeiger 6° je Minute, Stundenzeiger 30° je Stunde plus 0,5° je Minute (bei 3:45 also 112,5°).
   - 24:00 gibt es nicht, Mitternacht ist 00:00 (Buch K3 S. 123).
   - Sprechweisen: beide Systeme gelten („Viertel nach zwei“ und „viertel drei“ = 2:15). Lumi spricht nach config.sprechweise.
     Jede Form bedeutet genau eine Stellung auf dem Zifferblatt, deshalb ist ein Ablenker nie regional richtig. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};

  const TAG = 1440, HALB = 720;
  const ganz = x => typeof x === 'number' && Number.isInteger(x);
  const mod = (a, n) => ((a % n) + n) % n;
  const istZeitpunkt = m => ganz(m) && m >= 0 && m < TAG;
  const istSpanne = d => ganz(d) && d >= 0;
  const zwei = n => String(n).padStart(2, '0');

  /* ---------- Zeitpunkte ---------- */
  function zeitpunkt(h, min) {
    if (!ganz(h) || !ganz(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
  }
  const stunde = m => Math.floor(m / 60);
  const minute = m => m % 60;

  /* „7:12“, „07:12“, „7.12“, „19:12 Uhr“ → Minuten. Alles andere (14:63, 24:00, „7“) → null. */
  function leseUhrzeit(text) {
    const t = String(text == null ? '' : text).trim().replace(/\s*uhr$/i, '').trim();
    const r = /^(\d{1,2})[:.](\d{2})$/.exec(t);
    if (!r) return null;
    return zeitpunkt(Number(r[1]), Number(r[2]));
  }

  function alsUhrzeit(m) {
    if (!istZeitpunkt(m)) throw new Error('kein Zeitpunkt: ' + m);
    return `${zwei(stunde(m))}:${zwei(minute(m))} Uhr`;
  }
  /* „Schreibe beide Möglichkeiten“ (Buch K3 S. 123): vormittags/nachts und nachmittags/abends */
  function beideSchreibweisen(m) {
    if (!istZeitpunkt(m)) throw new Error('kein Zeitpunkt: ' + m);
    const z = mod(m, HALB);
    return [alsUhrzeit(z), alsUhrzeit(z + HALB)];
  }
  /* Was das Zifferblatt zeigt: 0 bis 719 */
  const zifferblatt = m => mod(m, HALB);

  /* Gleich, wenn dieselbe Minute. Mit beideHaelften zählt auch die andere Tageshälfte (07:12 und 19:12). */
  function gleicheUhrzeit(antwort, loesung, { beideHaelften = false } = {}) {
    const a = typeof antwort === 'number' ? antwort : leseUhrzeit(antwort);
    const l = typeof loesung === 'number' ? loesung : leseUhrzeit(loesung);
    if (!istZeitpunkt(a) || !istZeitpunkt(l)) return false;
    return beideHaelften ? zifferblatt(a) === zifferblatt(l) : a === l;
  }

  /* ---------- Zeitspannen ---------- */
  function alsDauer(d) {
    if (!istSpanne(d)) throw new Error('keine Zeitspanne: ' + d);
    const h = Math.floor(d / 60), min = d % 60;
    if (!h) return `${min} min`;
    return min ? `${h} h ${min} min` : `${h} h`;
  }
  function alsDauerWorte(d) {
    if (!istSpanne(d)) throw new Error('keine Zeitspanne: ' + d);
    const h = Math.floor(d / 60), min = d % 60;
    const hs = `${h} ${h === 1 ? 'Stunde' : 'Stunden'}`, ms = `${min} ${min === 1 ? 'Minute' : 'Minuten'}`;
    if (!h) return ms;
    return min ? `${hs} ${ms}` : hs;
  }
  /* Wortspeicher (Buch K3 S. 124): als Wortbild, ohne mit Brüchen zu rechnen */
  const WORTSPEICHER = [
    { wort: 'Viertelstunde', bild: '¼ h', minuten: 15 },
    { wort: 'halbe Stunde', bild: '½ h', minuten: 30 },
    { wort: 'Dreiviertelstunde', bild: '¾ h', minuten: 45 },
    { wort: 'Stunde', bild: '1 h', minuten: 60 }
  ];
  const stundenInMinuten = h => (istSpanne(h) ? h * 60 : null);
  const inStundenUndMinuten = d => (istSpanne(d) ? { h: Math.floor(d / 60), min: d % 60 } : null);

  /* Dauer zwischen Beginn und Ende. Ende vor Beginn: null, außer ueberMitternacht (nur Stufe „knifflig“). */
  function dauer(beginn, ende, { ueberMitternacht = false } = {}) {
    if (!istZeitpunkt(beginn) || !istZeitpunkt(ende)) return null;
    const d = ende - beginn;
    if (d >= 0) return d;
    return ueberMitternacht ? d + TAG : null;
  }
  function endeNach(beginn, d, { ueberMitternacht = false } = {}) {
    if (!istZeitpunkt(beginn) || !istSpanne(d)) return null;
    const e = beginn + d;
    if (e < TAG) return e;
    return ueberMitternacht && d < TAG ? e - TAG : null;
  }
  function beginnVor(ende, d, { ueberMitternacht = false } = {}) {
    if (!istZeitpunkt(ende) || !istSpanne(d)) return null;
    const b = ende - d;
    if (b >= 0) return b;
    return ueberMitternacht && d < TAG ? b + TAG : null;
  }

  /* Zeitstrahl mit Sprüngen (Buch K3 S. 124): bis zur nächsten vollen Stunde, dann volle Stunden, dann der Rest.
     Jeder Sprung: { von, bis, dauer }, von/bis als Zeitpunkte (Mitternacht als 0). Summe = dauer(). */
  function spruenge(beginn, ende, opt = {}) {
    const ges = dauer(beginn, ende, opt);
    if (ges === null) return null;
    const liste = [];
    let t = beginn, rest = ges;
    const sprung = d => { liste.push({ von: mod(t, TAG), bis: mod(t + d, TAG), dauer: d }); t += d; rest -= d; };
    if (rest === 0) return liste;
    const bisVoll = mod(-t, 60);
    if (bisVoll > 0) sprung(Math.min(bisVoll, rest));
    const volle = Math.floor(rest / 60) * 60;
    if (volle > 0) sprung(volle);
    if (rest > 0) sprung(rest);
    return liste;
  }

  /* ---------- Analoguhr ---------- */
  function zeigerWinkel(m) {
    if (!istZeitpunkt(m)) throw new Error('kein Zeitpunkt: ' + m);
    return { stunde: zifferblatt(m) * 0.5, minute: minute(m) * 6 };
  }
  const winkelNorm = w => mod(Number(w), 360);
  /* Winkel des Minutenzeigers → Minute 0 bis 59, eingerastet auf raster (1, 5, 15, 30) */
  function minuteAusWinkel(w, raster = 1) {
    const roh = winkelNorm(w) / 6;
    return mod(Math.round(roh / raster) * raster, 60);
  }
  /* Minutenzeiger gezogen: Er wandert den kürzeren Weg zur neuen Minute. Über die 12 nach rechts schiebt
     das die Stunde vor, nach links zurück (wie eine echte Uhr). */
  function minutenzeigerGezogen(m, w, raster = 1) {
    const alt = minute(m), neu = minuteAusWinkel(w, raster);
    const weg = mod(neu - alt + 30, 60) - 30;   /* -30 bis 29 Minuten */
    return mod(m + weg, TAG);
  }
  /* Stundenzeiger gezogen: Der Winkel legt die ganze Uhrzeit auf dem Zifferblatt fest (0,5° je Minute),
     der Minutenzeiger läuft mit. Die Tageshälfte bleibt. */
  function stundenzeigerGezogen(m, w, raster = 1) {
    const roh = winkelNorm(w) * 2;
    const z = mod(Math.round(roh / raster) * raster, HALB);
    return (m >= HALB ? HALB : 0) + z;
  }
  /* Tasten: Stunde oder Minute plus/minus. Der Tag läuft rund (23:59 + 1 = 00:00). */
  const schritt = (m, d) => mod(m + d, TAG);

  /* ---------- Sprechweisen ---------- */
  const EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf',
    'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig'];
  function zahlwort(n) {
    if (!ganz(n) || n < 0 || n > 59) throw new Error('Zahl außerhalb 0–59: ' + n);
    if (n < 20) return EINER[n];
    const e = n % 10, z = ZEHNER[Math.floor(n / 10)];
    return e ? `${e === 1 ? 'ein' : EINER[e]}und${z}` : z;
  }
  /* Stundenwort auf dem Zifferblatt: 0 und 12 → „zwölf“, 1 → „eins“ */
  const uhrStunde = h => EINER[mod(h, 12) || 12];
  /* „ein Uhr“ statt „eins Uhr“ */
  const vorUhr = h => (h === 1 ? 'ein' : zahlwort(h));

  /* Alle zugelassenen Formen für eine Stellung (0–719). system: 'nach', 'ost' oder 'alle' (gilt überall). */
  function formenZifferblatt(z) {
    const h = Math.floor(z / 60), min = z % 60;
    const jetzt = uhrStunde(h), naechste = uhrStunde(h + 1);
    const f = [];
    const add = (text, system = 'alle') => f.push({ text, system });
    switch (min) {
      case 0: add(`${vorUhr(mod(h, 12) || 12)} Uhr`); break;
      case 5: add(`fünf nach ${jetzt}`); break;
      case 10: add(`zehn nach ${jetzt}`); break;
      case 15: add(`Viertel nach ${jetzt}`, 'nach'); add(`viertel ${naechste}`, 'ost'); break;
      case 20: add(`zwanzig nach ${jetzt}`); add(`zehn vor halb ${naechste}`); break;
      case 25: add(`fünf vor halb ${naechste}`); break;
      case 30: add(`halb ${naechste}`); break;
      case 35: add(`fünf nach halb ${naechste}`); break;
      case 40: add(`zwanzig vor ${naechste}`); add(`zehn nach halb ${naechste}`); break;
      case 45: add(`Viertel vor ${naechste}`, 'nach'); add(`dreiviertel ${naechste}`, 'ost'); break;
      case 50: add(`zehn vor ${naechste}`); break;
      case 55: add(`fünf vor ${naechste}`); break;
      default: break;
    }
    /* Für jede Minute: „drei Uhr zwölf“ (wie man eine Digitaluhr vorliest) */
    if (min) add(`${vorUhr(mod(h, 12) || 12)} Uhr ${zahlwort(min)}`);
    return f;
  }
  /* Formen für einen Zeitpunkt (0–1439): die des Zifferblatts, dazu die 24-Stunden-Form („fünfzehn Uhr zwölf“) */
  function sprechweisen(m) {
    if (!istZeitpunkt(m)) throw new Error('kein Zeitpunkt: ' + m);
    const f = formenZifferblatt(zifferblatt(m));
    const h = stunde(m), min = minute(m);
    if (h === 0 || h > 12) f.push({ text: `${vorUhr(h)} Uhr${min ? ' ' + zahlwort(min) : ''}`, system: 'alle', tag: true });
    return f;
  }
  const norm = t => String(t == null ? '' : t).trim().replace(/\s+/g, ' ').toLowerCase();

  /* Rückweg: Form → Stellung auf dem Zifferblatt (0–719) bzw. bei 24-Stunden-Form der Zeitpunkt. Einmal aufgebaut. */
  let rueck = null;
  function rueckweg() {
    if (rueck) return rueck;
    rueck = new Map();
    for (let m = 0; m < TAG; m++) {
      for (const f of sprechweisen(m)) {
        const k = norm(f.text);
        const ziel = f.tag ? m : zifferblatt(m);
        if (!rueck.has(k)) rueck.set(k, new Set());
        rueck.get(k).add(ziel);
      }
    }
    return rueck;
  }
  /* Was bedeutet diese Form? Liste der Zifferblatt-Stellungen (bzw. Zeitpunkte bei 24-Stunden-Form). */
  const bedeutung = text => [...(rueckweg().get(norm(text)) || [])];

  /* Ist die gesprochene Antwort für den Zeitpunkt richtig? Beide Systeme zählen.
     Die 12-Stunden-Formen passen zu beiden Tageshälften (wie auf dem Zifferblatt). */
  function sprechweiseRichtig(text, m) {
    if (!istZeitpunkt(m)) return false;
    return sprechweisen(m).some(f => norm(f.text) === norm(text));
  }

  /* So sagt es Lumi: das gewählte System, sonst die überall gültige Form, sonst „drei Uhr zwölf“ */
  function lumiSagt(m, system = 'nach') {
    const f = formenZifferblatt(zifferblatt(m));
    return (f.find(x => x.system === system) || f.find(x => x.system === 'alle') || f[0]).text;
  }

  /* Falsche Antwortkärtchen für einen Zeitpunkt: anzahl verschiedene Formen anderer Stellungen,
     nie eine Form, die für m in irgendeinem System richtig ist. zufall(n) liefert eine ganze Zahl in [0, n). */
  function ablenker(m, anzahl, zufall, { nurFuenfer = true, system = 'nach' } = {}) {
    const ziel = zifferblatt(m);
    if (typeof zufall !== 'function') { const zo = zufall; zufall = n => zo.zahl(n); }   /* LU.zufall-Objekt oder Funktion */
    const raus = new Set(), versuche = { n: 0 };
    while (raus.size < anzahl && versuche.n++ < 2000) {
      let z = zufall(HALB);
      if (nurFuenfer) z -= z % 5;
      if (z === ziel) continue;
      const t = lumiSagt(z, system);
      if (sprechweiseRichtig(t, m)) continue;
      raus.add(t);
    }
    return [...raus];
  }

  LU.zeit = {
    TAG, HALB, WORTSPEICHER,
    istZeitpunkt, istSpanne, zeitpunkt, stunde, minute, leseUhrzeit,
    alsUhrzeit, beideSchreibweisen, zifferblatt, gleicheUhrzeit,
    alsDauer, alsDauerWorte, stundenInMinuten, inStundenUndMinuten,
    dauer, endeNach, beginnVor, spruenge,
    zeigerWinkel, minuteAusWinkel, minutenzeigerGezogen, stundenzeigerGezogen, schritt,
    zahlwort, sprechweisen, bedeutung, sprechweiseRichtig, lumiSagt, ablenker
  };
})();
