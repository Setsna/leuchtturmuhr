/* Leuchtturmuhr: Station „Hafen“ (Etappe 4). Fahrpläne lesen, Fahrzeit, Wartezeit, Umsteigen.
   Nach Art und Stufe von Denken und Rechnen 4, gedruckt S. 86 und 87, und 3, S. 126. Fahrpläne sind erfunden und werden erzeugt:
   der Leuchtturm-Hafen mit Fähren und Booten zu ausgedachten Inseln. Alle Antworten rechnet LU.zeit aus dem Plan.
   Texte: Entwurf, noch nicht freigegeben. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit, H = LU.ah;
  const u = m => Z.alsUhrzeit(m);
  const k = m => u(m).replace(' Uhr', '');

  /* Ziele mit Artikel: „auf der Muschelinsel“, „zum Möwenfelsen“ */
  const ZIELE = [
    { name: 'Muschelinsel', auf: 'auf der', zu: 'zur' }, { name: 'Möwenfelsen', auf: 'auf dem', zu: 'zum' },
    { name: 'Robbenbank', auf: 'auf der', zu: 'zur' }, { name: 'Sanddüne', auf: 'auf der', zu: 'zur' }, { name: 'Krabbenbucht', auf: 'in der', zu: 'zur' }
  ];
  const zielVon = name => ZIELE.find(z => z.name === name);

  /* Ein Fahrplan: Fähre vom Leuchtturm-Hafen zu einem Ziel, 4 Fahrten, feste Fahrzeit */
  function plan(stufe, zf, { ziel, frueh = 7 * 60 } = {}) {
    const fahrzeit = stufe === 'leicht' ? zf.waehle([15, 30, 45, 60]) : stufe === 'mittel' ? zf.zwischen(4, 14) * 5 : zf.zwischen(17, 95);
    const ab = []; let t = frueh + zf.zwischen(0, 8) * 5;
    for (let i = 0; i < 4; i++) { ab.push(t); t += stufe === 'leicht' ? zf.waehle([60, 90, 120]) : zf.zwischen(9, 30) * 5; }
    return { ziel: ziel || zf.waehle(ZIELE).name, fahrzeit, fahrten: ab.map(a => ({ ab: a, an: a + fahrzeit })) };
  }
  const tabelle = (p, von = 'Leuchtturm-Hafen') => ({
    typ: 'tabelle', titel: `Fähre: ${von} → ${p.ziel}`, kopf: ['Fahrt', `Abfahrt ${von}`, `Ankunft ${p.ziel}`],
    zeilen: p.fahrten.map((f, i) => [`${i + 1}`, k(f.ab), k(f.an)])
  });

  /* Wann kommt die Fähre an? (Ablesen) */
  function ankunft(stufe, zf) {
    const p = plan(stufe, zf); const i = zf.zahl(4), f = p.fahrten[i];
    const falsche = p.fahrten.filter((_, j) => j !== i).map(x => u(x.an)).concat(u(f.ab));
    return {
      art: 'ankunft', auftrag: `Du fährst um ${u(f.ab)} los. Wann bist du ${zielVon(p.ziel).auf} ${p.ziel}?`,
      buehne: [{ ...tabelle(p), hervor: i }],
      tipps: ['Such die Zeile mit der Abfahrt.', 'Geh in derselben Zeile nach rechts.', 'Dort steht die Ankunft.'],
      schritte: [{ typ: 'karten', karten: H.karten(zf, [u(f.an)], falsche), richtigText: `Das stimmt: um ${u(f.an)}.`, erklaerung: `In der Zeile mit ${u(f.ab)} steht als Ankunft ${u(f.an)}.`, loesungText: `Du bist um ${u(f.an)} da.` }],
      schluessel: `a${f.ab}`
    };
  }
  /* Welche Fähre nimmst du? Du bist um … am Hafen */
  function naechste(stufe, zf) {
    const p = plan(stufe, zf); const i = zf.zwischen(1, 3);
    const da = p.fahrten[i].ab - (stufe === 'leicht' ? zf.waehle([10, 15, 20]) : zf.zwischen(2, Math.max(3, p.fahrten[i].ab - p.fahrten[i - 1].ab - 1)));
    const f = p.fahrten.find(x => x.ab >= da);
    const warten = f.ab - da;
    return {
      art: 'naechste', auftrag: `Du bist um ${u(da)} am Hafen. Wie lange musst du auf die nächste Fähre warten?`,
      buehne: [tabelle(p)],
      tipps: ['Welche Fähre fährt als nächste nach deiner Ankunft ab?', 'Rechne von deiner Ankunft bis zur Abfahrt.', `Die nächste Fähre fährt um ${u(f.ab)}.`],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileDauer('Wartezeit')], leerIstNull: true, pruefe: w => H.alsDauer(w.h, w.m) === warten,
        hinweis: w => H.alsDauer(w.h, w.m) === p.fahrzeit ? 'Das ist die Fahrzeit. Gefragt ist, wie lange du am Hafen wartest.' : 'Noch nicht ganz. Von wann bis wann wartest du?',
        loesung: H.loesungDauer(warten), richtigText: `Das stimmt: ${Z.alsDauer(warten)}.`, erklaerung: `Von ${u(da)} bis ${u(f.ab)} sind es ${Z.alsDauer(warten)}.`, loesungText: `Du wartest ${Z.alsDauer(warten)}.` }],
      schluessel: `n${da}`
    };
  }
  /* Wie lange fährt die Fähre? */
  function fahrzeit(stufe, zf) {
    const p = plan(stufe, zf); const f = zf.waehle(p.fahrten);
    return {
      art: 'fahrzeit', auftrag: `Wie lange fährt die Fähre vom Leuchtturm-Hafen ${zielVon(p.ziel).zu} ${p.ziel}?`,
      buehne: [tabelle(p)],
      tipps: ['Nimm eine Zeile: Abfahrt und Ankunft.', 'Rechne von der Abfahrt bis zur Ankunft.', `Zum Beispiel von ${u(f.ab)} bis ${u(f.an)}.`],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileDauer('Fahrzeit')], leerIstNull: true, pruefe: w => H.alsDauer(w.h, w.m) === p.fahrzeit,
        hinweis: () => 'Noch nicht ganz. Spring von der Abfahrt bis zur Ankunft.',
        loesung: H.loesungDauer(p.fahrzeit), richtigText: `Das stimmt: ${Z.alsDauer(p.fahrzeit)}.`, erklaerung: `Von ${u(f.ab)} bis ${u(f.an)} sind es ${Z.alsDauer(p.fahrzeit)}. Bei jeder Fahrt gleich.`, loesungText: `Die Fähre fährt ${Z.alsDauer(p.fahrzeit)}.` }],
      schluessel: `f${p.fahrzeit}-${p.ziel}`
    };
  }
  /* Rechtzeitig? Du musst um … auf der Insel sein. Welche Fähre nimmst du spätestens? */
  function spaetestens(stufe, zf) {
    const p = plan(stufe, zf); const i = zf.zwischen(1, 3);
    const termin = p.fahrten[i].an + zf.zwischen(1, 6) * 5;
    const ok = p.fahrten.filter(f => f.an <= termin);
    const richtig = ok[ok.length - 1];
    return {
      art: 'spaetestens', auftrag: `Du willst um ${u(termin)} ${zielVon(p.ziel).auf} ${p.ziel} sein. Welche Fähre nimmst du spätestens? Tippe auf ihre Abfahrt.`,
      buehne: [tabelle(p)],
      tipps: ['Schau auf die Ankunftszeiten.', `Welche Fähren kommen vor ${u(termin)} an?`, 'Davon nimmst du die letzte.'],
      schritte: [{ typ: 'karten', karten: p.fahrten.map(f => ({ text: u(f.ab), richtig: f === richtig })), richtigText: `Das stimmt: die Fähre um ${u(richtig.ab)}.`,
        erklaerung: `Sie kommt um ${u(richtig.an)} an. Die nächste käme zu spät.`, loesungText: `Die Fähre um ${u(richtig.ab)} kommt rechtzeitig an.` }],
      schluessel: `t${termin}`
    };
  }
  /* Umsteigen (knifflig, Buch K4 S. 87 nach Art): Fähre zur Muschelinsel, dann Boot zum Möwenfelsen */
  function umsteigen(stufe, zf) {
    for (let n = 0; n < 50; n++) {
      const p1 = plan('mittel', zf, { ziel: 'Muschelinsel' });
      const p2 = plan('knifflig', zf, { ziel: 'Möwenfelsen', frueh: p1.fahrten[0].an + zf.zwischen(1, 4) * 5 });
      const f1 = p1.fahrten[zf.zahl(3)];
      const f2 = p2.fahrten.find(f => f.ab >= f1.an + 5);   /* mindestens 5 Minuten zum Umsteigen */
      if (!f2) continue;
      const warten = f2.ab - f1.an, ges = f2.an - f1.ab;
      const frage = zf.zahl(2) === 0;
      const t2 = { typ: 'tabelle', titel: 'Boot: Muschelinsel → Möwenfelsen', kopf: ['Fahrt', 'Abfahrt Muschelinsel', 'Ankunft Möwenfelsen'], zeilen: p2.fahrten.map((f, i) => [`${i + 1}`, k(f.ab), k(f.an)]) };
      return {
        art: 'umsteigen', auftrag: frage
          ? `Du nimmst die Fähre um ${u(f1.ab)} und steigst auf der Muschelinsel ins nächste Boot. Wie lange wartest du dort?`
          : `Du nimmst die Fähre um ${u(f1.ab)} und steigst auf der Muschelinsel ins nächste Boot. Wie lange bist du insgesamt unterwegs bis zum Möwenfelsen?`,
        buehne: [tabelle(p1), t2],
        tipps: ['Wann kommt deine Fähre auf der Muschelinsel an?', 'Welches Boot fährt danach als erstes ab? Zum Umsteigen brauchst du mindestens 5 Minuten.', frage ? 'Rechne von der Ankunft der Fähre bis zur Abfahrt des Bootes.' : 'Rechne von der ersten Abfahrt bis zur letzten Ankunft.'],
        schritte: [{ typ: 'ziffern', zeilen: [H.zeileDauer(frage ? 'Wartezeit' : 'unterwegs')], leerIstNull: true,
          pruefe: w => H.alsDauer(w.h, w.m) === (frage ? warten : ges),
          hinweis: () => frage ? `Deine Fähre kommt um ${u(f1.an)} an. Welches Boot fährt danach?` : 'Von der ersten Abfahrt bis zur Ankunft am Möwenfelsen, mit Warten.',
          loesung: H.loesungDauer(frage ? warten : ges),
          richtigText: `Das stimmt: ${Z.alsDauer(frage ? warten : ges)}.`,
          erklaerung: `Fähre ${u(f1.ab)} bis ${u(f1.an)}, Boot ${u(f2.ab)} bis ${u(f2.an)}. Warten: ${Z.alsDauer(warten)}. Zusammen: ${Z.alsDauer(ges)}.`,
          loesungText: frage ? `Du wartest ${Z.alsDauer(warten)}.` : `Du bist ${Z.alsDauer(ges)} unterwegs.` }],
        schluessel: `u${f1.ab}-${f2.ab}-${frage}`
      };
    }
    return naechste(stufe, zf);
  }

  const ARTEN = { ankunft, naechste, fahrzeit, spaetestens, umsteigen };
  const PLAN = {
    leicht: ['ankunft', 'fahrzeit', 'ankunft', 'naechste', 'fahrzeit', 'ankunft'],
    mittel: ['ankunft', 'fahrzeit', 'naechste', 'spaetestens', 'naechste', 'fahrzeit'],
    knifflig: ['fahrzeit', 'naechste', 'spaetestens', 'umsteigen', 'umsteigen', 'naechste']
  };
  function runde(stufe, zf) {
    const liste = [], schl = new Set();
    for (const art of PLAN[stufe]) {
      let a, n = 0;
      do { a = ARTEN[art](stufe, zf); } while (schl.has(a.schluessel) && n++ < 30);
      schl.add(a.schluessel); liste.push(a);
    }
    return liste;
  }

  LU.aufgaben = LU.aufgaben || {};
  LU.aufgaben.fahrplan = { runde, ARTEN, PLAN, plan };

  LU.motor.station({
    id: 'fahrplan', titel: 'Hafen', unterzeile: 'Fahrpläne lesen',
    einleitung: 'Vom Leuchtturm-Hafen fahren Fähren zu den Inseln. Im Fahrplan steht, wann sie abfahren und wann sie ankommen.',
    soGehts: ['Lies den Fahrplan: Jede Zeile ist eine Fahrt.', 'Links steht die Abfahrt, rechts die Ankunft.', 'Tippe ein Kärtchen an oder die Zeit mit den Ziffernknöpfen ein.'],
    stufenText: { leicht: 'Fahrplan lesen, Fahrzeit', mittel: 'Wartezeit, rechtzeitig ankommen', knifflig: 'Umsteigen, genaue Minuten' },
    amTisch: { titel: 'Am Tisch: Unser Fahrplan', schritte: [
      'Denkt euch eine Fähre zu einer Insel aus. Wie lange fährt sie?',
      'Schreibt einen Fahrplan mit vier Fahrten: Abfahrt und Ankunft.',
      'Tauscht die Fahrpläne und stellt euch Fragen: Wann bin ich da? Wie lange warte ich?',
      'Prüft die Antworten mit der Lernuhr.'],
      notiz: 'Material: Heft, Lineal, Stift, Lernuhr.' },
    woerter: [
      ['Fahrplan', 'eine Tabelle mit Abfahrt und Ankunft.'],
      ['Abfahrt', 'wann die Fähre losfährt (eine Uhrzeit).'],
      ['Ankunft', 'wann sie ankommt (eine Uhrzeit).'],
      ['Fahrzeit', 'wie lange die Fahrt dauert (eine Zeitspanne).'],
      ['Wartezeit', 'wie lange du wartest (eine Zeitspanne).'],
      ['umsteigen', 'von einer Fähre in ein anderes Boot wechseln.']
    ],
    tippsStandard: ['Jede Zeile im Fahrplan ist eine Fahrt.', 'Links Abfahrt, rechts Ankunft.', 'Zeitspannen rechnest du wie am Zeitstrahl.'],
    stempelMotiv: '<path class="stempel__welle" d="M26 58h48l-8 12H34z"/><path class="stempel__welle" d="M50 58V28l14 22H50"/><path class="stempel__welle" d="M24 76c6-4 10-4 16 0s10 4 16 0 10-4 16 0"/>',
    aufgaben: runde
  });
})();
