/* Leuchtturmuhr: Station „Uhrzeit“ (Etappe 2). Uhrzeiten lesen und stellen.
   Mini-Spec Etappe 2 (Ingo, 15.11.2026): Sprechweisen beider Systeme zählen, 24-Stunden-Sprechweise zugelassen,
   Stempel ab 5 von 6, Tageszeit als drei verschiedene Zeichen mit Wort, Stundenzeiger-Detektiv in „knifflig“.
   Aufgaben werden erzeugt, die Lösung rechnet LU.zeit. Texte: Entwurf (Dateien/Beispiele-Entwuerfe/stationen.md), noch nicht freigegeben. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit, H = LU.ah;
  const sprech = () => LU.config.sprechweise;

  /* ---------- Zeiten je Stufe ---------- */
  function zeit(stufe, zf, { ganzerTag = false } = {}) {
    if (stufe === 'leicht') return zf.zahl(12) * 60 + zf.waehle([0, 30]);
    const tag = ganzerTag ? zf.zahl(2) * 720 : 0;
    if (stufe === 'mittel') return tag + zf.zahl(144) * 5;
    let m; do { m = zf.zahl(720); } while (m % 5 === 0 && zf.zahl(4) > 0);   /* meist „krumme“ Minuten */
    return tag + m;
  }
  const raster = stufe => ({ leicht: 30, mittel: 5, knifflig: 1 }[stufe]);
  const uhrTeil = (stufe, m, extra = {}) => ({ typ: 'uhr', zeit: m, zahlen: stufe !== 'knifflig', striche: true, raster: raster(stufe), ...extra });

  /* Alle richtigen Sprechweisen für die Kärtchen: Lumis Form und, wo es sie gibt, die andere regionale Form */
  function richtigeSprechformen(m, mit24) {
    const z = Z.zifferblatt(m);
    const formen = [Z.lumiSagt(z, sprech())];
    const andere = Z.lumiSagt(z, sprech() === 'nach' ? 'ost' : 'nach');
    if (andere !== formen[0]) formen.push(andere);
    if (mit24) { const f24 = Z.sprechweisen(m).find(f => f.tag); if (f24) formen.push(f24.text); }
    return formen;
  }

  /* Typische Ablese-Fehler als falsche Kärtchen (Zifferblatt-Stellungen) */
  function fehlerStellungen(z, zf) {
    const h = Math.floor(z / 60), mi = z % 60;
    const kandidaten = [
      ((mi / 5 | 0) % 12) * 60 + (h * 5) % 60,                       /* Zeiger vertauscht */
      (z + 60) % 720, (z + 660) % 720,                                /* Stunde daneben (kurz vor der nächsten Zahl) */
      h * 60 + (mi % 5 === 0 && mi ? mi / 5 : (mi + 7) % 60),         /* Zahl am Blatt als Minuten gelesen */
      (z + 30) % 720, (z + 360) % 720
    ];
    return zf.mische([...new Set(kandidaten)]).filter(x => x !== z && Z.istZeitpunkt(x));
  }
  const digital = m => Z.alsUhrzeit(m);

  /* ---------- Aufgabenarten ---------- */
  function lesenDigital(stufe, zf) {
    const m = zeit(stufe, zf), z = Z.zifferblatt(m);
    const falsche = fehlerStellungen(z, zf).map(digital);
    return {
      art: 'lesenDigital', auftrag: 'Wie spät ist es? Tippe auf die passende Uhrzeit.', hilfe: 'minutenzahlen',
      buehne: [uhrTeil(stufe, z)],
      schritte: [{ typ: 'karten', karten: H.karten(zf, [digital(z)], falsche), richtigText: 'Das stimmt.', erklaerung: LU.uhr.beschreibung(z, sprech()),
        loesungText: 'Hier ist die richtige Uhrzeit.', hinweisKarte: () => 'Noch nicht ganz. Schau zuerst auf den kurzen Zeiger: Er zeigt die Stunde.' }],
      zeit: z
    };
  }
  function lesenSprech(stufe, zf) {
    const ganzerTag = stufe !== 'leicht';
    const m = ganzerTag ? zeitMitTageszeit(stufe, zf) : zeit(stufe, zf);
    const z = Z.zifferblatt(m);
    const tz = ganzerTag ? H.tageszeit(m) : null;
    const richtige = richtigeSprechformen(m, !!tz);
    /* leicht: nur volle und halbe Stunden als Ablenker, sonst 5-Minuten-Formen bzw. beliebige */
    const falsche = (stufe === 'leicht'
      ? zf.mische(Array.from({ length: 24 }, (_, i) => i * 30)).filter(x => x !== z).map(x => Z.lumiSagt(x, sprech()))
      : Z.ablenker(z, 4, zf, { nurFuenfer: stufe !== 'knifflig', system: sprech() })).filter(t => !Z.sprechweiseRichtig(t, m));
    const buehne = [uhrTeil(stufe, z)];
    if (tz) buehne.push({ typ: 'tageszeit', wann: tz });
    return {
      art: 'lesenSprech', auftrag: richtige.length > 1 ? 'Wie sagt man dazu? Es passen mehrere Kärtchen, eins reicht.' : 'Wie sagt man dazu? Tippe auf das passende Kärtchen.', hilfe: 'minutenzahlen',
      buehne,
      schritte: [{ typ: 'karten', karten: H.karten(zf, richtige, falsche, Math.max(4, richtige.length + 2)), richtigText: 'Das stimmt.', erklaerung: LU.uhr.beschreibung(z, sprech()),
        loesungText: 'Hier sind die passenden Kärtchen.', hinweisKarte: () => 'Noch nicht ganz. Wohin zeigt der lange Zeiger?' }],
      zeit: m
    };
  }
  function stellen(stufe, zf) {
    const m = stufe === 'leicht' ? zeit(stufe, zf) : zeit(stufe, zf, { ganzerTag: true });
    const z = Z.zifferblatt(m);
    const alsText = zf.zahl(2) === 0 || stufe === 'knifflig' && z % 5 !== 0;
    const formen = richtigeSprechformen(z, false);
    const zielText = alsText ? digital(m) : zf.waehle(formen);
    const start = z === 0 ? 360 : 0;
    return {
      art: 'stellen', auftrag: `Stell die Uhr auf ${zielText}.`, hilfe: 'minutenzahlen',
      buehne: [uhrTeil(stufe, start, { stellbar: true })],
      schritte: [{
        typ: 'stellen', ziel: z,
        pruefe: w => Z.zifferblatt(w) === z,
        hinweis: w => Z.minute(w) !== Z.minute(z)
          ? `Deine Uhr zeigt ${Z.lumiSagt(w, sprech())}. Der lange Zeiger gehört ${H.minuteOrt(z)}.`
          : `Der lange Zeiger stimmt. Der kurze Zeiger zeigt noch die falsche Stunde.`,
        richtigText: 'Das stimmt. Deine Uhr zeigt die richtige Zeit.', erklaerung: LU.uhr.beschreibung(z, sprech()),
        loesungText: 'So sieht die Uhr richtig aus.'
      }],
      zeit: m
    };
  }
  function beide(stufe, zf) {
    const z = Z.zifferblatt(zeit(stufe, zf));
    return {
      art: 'beide', auftrag: 'Schreibe beide Möglichkeiten.', hilfe: 'minutenzahlen',
      buehne: [uhrTeil(stufe, z)],
      schritte: [{
        typ: 'ziffern', zeilen: [H.zeileUhrzeit('vormittags oder nachts', 'a'), H.zeileUhrzeit('nachmittags oder abends', 'b')],
        pruefe: w => H.alsZeitpunkt(w.ah, w.am) === z && H.alsZeitpunkt(w.bh, w.bm) === z + 720,
        hinweis: w => {
          const a = H.alsZeitpunkt(w.ah, w.am), b = H.alsZeitpunkt(w.bh, w.bm);
          if (a === null || b === null) return 'Eine Stunde hat 60 Minuten, ein Tag 24 Stunden. Schau noch einmal auf deine Zahlen.';
          if (a === z + 720 && b === z) return 'Fast. Du hast die beiden vertauscht. Vormittags kommt zuerst.';
          if (a === z) return 'Die erste stimmt. Am Nachmittag rechnest du 12 Stunden dazu.';
          return 'Noch nicht ganz. Lies zuerst die Uhr ab. Das ist die erste Möglichkeit.';
        },
        loesung: { ...H.loesungUhrzeit(z, 'a'), ...H.loesungUhrzeit(z + 720, 'b') },
        richtigText: `Das stimmt: ${digital(z)} und ${digital(z + 720)}.`, erklaerung: 'Am Nachmittag zählt man weiter: 1 Uhr nachmittags ist 13 Uhr.',
        loesungText: `Die beiden Möglichkeiten sind ${digital(z)} und ${digital(z + 720)}.`
      }],
      zeit: z
    };
  }
  /* Zeit mit eindeutiger Tageszeit: die andere Hälfte des Tages hat ein anderes Zeichen (oder ist Abend) */
  function zeitMitTageszeit(stufe, zf) {
    for (let i = 0; i < 200; i++) {
      const m = zeit(stufe, zf, { ganzerTag: true });
      const tz = H.tageszeit(m), anders = H.tageszeit((m + 720) % 1440);
      if (tz && tz !== anders) return m;
    }
    return 600;
  }
  function mitTageszeit(stufe, zf) {
    const m = zeitMitTageszeit(stufe, zf), z = Z.zifferblatt(m), tz = H.tageszeit(m);
    return {
      art: 'tageszeit', auftrag: `Wie spät ist es? Es ist ${tz}. Schreib die Uhrzeit auf.`, hilfe: 'minutenzahlen',
      buehne: [uhrTeil(stufe, z), { typ: 'tageszeit', wann: tz }],
      schritte: [{
        typ: 'ziffern', zeilen: [H.zeileUhrzeit(tz)],
        pruefe: w => H.alsZeitpunkt(w.h, w.m) === m,
        hinweis: w => H.alsZeitpunkt(w.h, w.m) === (m + 720) % 1440 ? `Die Uhrzeit stimmt, aber es ist ${tz}. Denk an die andere Möglichkeit.` : 'Noch nicht ganz. Lies zuerst den kurzen, dann den langen Zeiger.',
        loesung: H.loesungUhrzeit(m),
        richtigText: `Das stimmt: ${digital(m)}.`, erklaerung: LU.uhr.beschreibung(z, sprech()),
        loesungText: `Es ist ${digital(m)}.`
      }],
      zeit: m
    };
  }
  function detektiv(stufe, zf) {
    const z = zf.zahl(12) * 60 + zf.waehle([0, 15, 30, 45]);
    const richtige = richtigeSprechformen(z, false);
    const h = Math.floor(z / 60);
    const naheliegend = [0, 15, 30, 45].map(q => h * 60 + q).concat([0, 15, 30, 45].map(q => ((h + 1) % 12) * 60 + q), [0, 15, 30, 45].map(q => ((h + 11) % 12) * 60 + q));
    const falsche = zf.mische(naheliegend).filter(x => x !== z).map(x => Z.lumiSagt(x, sprech())).filter(t => !Z.sprechweiseRichtig(t, z));
    return {
      art: 'detektiv', auftrag: 'Nur der kurze Zeiger ist zu sehen. Wie spät ist es?',
      buehne: [{ typ: 'uhr', zeit: z, zahlen: true, striche: true, nurStunde: true }],
      tipps: ['Steht der kurze Zeiger genau auf einer Zahl, ist es eine volle Stunde.', 'Genau in der Mitte zwischen zwei Zahlen ist es halb.', 'Ein Viertel des Weges zur nächsten Zahl: Viertel nach. Drei Viertel des Weges: Viertel vor.'],
      schritte: [{ typ: 'karten', karten: H.karten(zf, richtige, falsche, Math.max(4, richtige.length + 3)), richtigText: 'Gut geprüft. Der kurze Zeiger verrät die Zeit.', erklaerung: `Der ${LU.uhr.stundenzeigerText(z).replace('Stundenzeiger', 'Stundenzeiger steht')}.`,
        loesungText: 'Schau, wo der kurze Zeiger steht: Daran siehst du es.' }],
      zeit: z
    };
  }

  const ARTEN = { lesenDigital, lesenSprech, stellen, beide, tageszeit: mitTageszeit, detektiv };
  const PLAN = {
    leicht: ['lesenSprech', 'lesenDigital', 'stellen', 'lesenSprech', 'stellen', 'stellen'],
    mittel: ['lesenSprech', 'lesenDigital', 'stellen', 'beide', 'tageszeit', 'stellen'],
    knifflig: ['lesenDigital', 'lesenSprech', 'stellen', 'tageszeit', 'detektiv', 'detektiv']
  };
  /* Eine Runde: 6 Aufgaben, keine Uhrzeit doppelt */
  function runde(stufe, zf) {
    const liste = [], zeiten = new Set();
    for (const art of PLAN[stufe]) {
      let a, n = 0;
      do { a = ARTEN[art](stufe, zf); } while (zeiten.has(a.zeit % 720) && n++ < 30);
      zeiten.add(a.zeit % 720);
      liste.push(a);
    }
    return stufe === 'leicht' ? liste : [liste[0], ...zf.mische(liste.slice(1))];
  }

  LU.aufgaben = LU.aufgaben || {};
  LU.aufgaben.uhr = { runde, ARTEN, PLAN };

  LU.motor.station({
    id: 'uhr', titel: 'Uhrzeit', unterzeile: 'Uhr lesen und stellen',
    einleitung: 'Ich zeige dir Uhren. Du liest ab, wie spät es ist, und stellst die Zeiger selbst.',
    soGehts: ['Schau zuerst auf den kurzen Zeiger. Er zeigt die Stunde.', 'Dann auf den langen Zeiger. Er zeigt die Minuten.', 'Tippe ein Kärtchen an oder stell die Uhr. Dann tippe auf Prüfen.'],
    stufenText: { leicht: 'volle und halbe Stunden', mittel: 'Viertelstunden und 5 Minuten, beide Möglichkeiten', knifflig: 'genaue Minuten, Uhr ohne Zahlen, Stundenzeiger-Detektiv' },
    amTisch: { titel: 'Am Tisch: Uhren-Diktat', schritte: [
      'Ihr braucht eine Lernuhr oder eure gebastelte Uhr und ein paar Kärtchen.',
      'Kind A schreibt eine Uhrzeit auf ein Kärtchen, zum Beispiel 03:45 Uhr oder „halb sieben“.',
      'Kind B stellt die Uhr. Kind A prüft.',
      'Dann tauscht ihr.',
      'Schwerer: Sagt zu jeder Uhr beide Möglichkeiten, zum Beispiel 03:45 Uhr und 15:45 Uhr.',
      'Schaut heute dreimal auf die Uhr im Klassenraum und schreibt die Uhrzeit auf.'],
      notiz: 'Material: Lernuhr oder gebastelte Uhr, Zettel, Stift.' },
    woerter: [
      ['Stundenzeiger', 'der kurze Zeiger. Er zeigt die Stunde.'],
      ['Minutenzeiger', 'der lange Zeiger. Er zeigt die Minuten.'],
      ['Uhrzeit, Zeitpunkt', 'wann etwas ist, zum Beispiel 07:30 Uhr.'],
      ['halb', '30 Minuten nach der vollen Stunde. Halb vier ist 03:30 Uhr.'],
      ['Viertel nach / viertel', 'Viertel nach drei und viertel vier sind beide 03:15 Uhr.'],
      ['Viertel vor / dreiviertel', 'Viertel vor vier und dreiviertel vier sind beide 03:45 Uhr.'],
      ['um', 'um 8 Uhr: genau zur vollen Stunde.'],
      ['vormittags, nachmittags', 'Die Uhr zeigt 12 Stunden. Der Tag hat 24. Darum gibt es zwei Möglichkeiten.']
    ],
    tippsStandard: ['Schau zuerst auf den kurzen Zeiger. Er zeigt die Stunde.', 'Der lange Zeiger zählt die Minuten. Von einer Zahl zur nächsten sind es 5 Minuten.', 'Ich schreibe dir jetzt die Minuten außen an die Uhr.'],
    stempelMotiv: '<circle class="stempel__welle" cx="50" cy="50" r="22"/><path class="stempel__welle" d="M50 50V34M50 50l10 6"/><circle class="stempel__kugel" cx="50" cy="50" r="3"/>',
    aufgaben: runde
  });
})();
