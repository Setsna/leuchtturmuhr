/* Leuchtturmuhr: Station „Wie lange?“ (Etappe 3). Beginn, Ende, Dauer.
   Nach Art und Stufe von Denken und Rechnen 3, gedruckt S. 125 (Tabellen mit Beginn, Ende, Dauer) und S. 126
   (Verspätung). Eigene, erfundene Tätigkeiten. Keine Behauptung über die Länge einer Schulstunde.
   Vermuten, dann prüfen: Erst legt sich das Kind fest (kürzer, genau oder länger als eine Stunde), dann erscheint der
   Zeitstrahl mit den Sprüngen, dann rechnet es die Dauer. Über Mitternacht nur in „knifflig“.
   Texte: Entwurf, noch nicht freigegeben. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit, H = LU.ah;
  const u = m => Z.alsUhrzeit(m);

  /* Erfundene Tätigkeiten mit plausibler Dauer (Minuten von–bis) */
  const DINGE = [
    { was: 'Hausaufgaben machen', von: 20, bis: 60 }, { was: 'Schwimmtraining', von: 45, bis: 90 }, { was: 'Kinderfilm schauen', von: 70, bis: 110 },
    { was: 'Fahrradtour', von: 60, bis: 180 }, { was: 'Kuchen backen', von: 40, bis: 90 }, { was: 'Ausflug ans Meer', von: 120, bis: 300 },
    { was: 'Lesen', von: 15, bis: 45 }, { was: 'Spielen auf dem Spielplatz', von: 30, bis: 120 }, { was: 'Bootsfahrt zum Leuchtturm', von: 35, bis: 100 },
    { was: 'Musikunterricht', von: 30, bis: 60 }, { was: 'Fußballspiel', von: 50, bis: 100 }, { was: 'Museumsbesuch', von: 60, bis: 150 }
  ];
  function fall(stufe, zf) {
    const t = zf.waehle(DINGE);
    let d = zf.zwischen(t.von, t.bis);
    let b;
    if (stufe === 'leicht') { d = Math.max(15, Math.round(d / 15) * 15); b = zf.zwischen(28, 72) * 15; }
    else if (stufe === 'mittel') { d = Math.max(10, Math.round(d / 5) * 5); b = zf.zwischen(84, 228) * 5; }
    else { b = zf.zwischen(420, 1380); }
    if (b + d > 1439 && stufe !== 'knifflig') b = 1439 - d - zf.zwischen(0, 60);
    return { was: t.was, b, d };
  }
  const vergleich = d => d < 60 ? 'kuerzer' : d === 60 ? 'genau' : 'laenger';
  const VERMUTEN = [['kuerzer', 'kürzer als 1 Stunde'], ['genau', 'genau 1 Stunde'], ['laenger', 'länger als 1 Stunde']];

  /* Dauer gesucht: erst vermuten, dann Zeitstrahl, dann rechnen */
  function dauer(stufe, zf) {
    const { was, b, d } = fall(stufe, zf);
    const ueber = b + d >= 1440;
    const e = (b + d) % 1440;
    const tabelle = { typ: 'tabelle', titel: 'Wann ist was?', kopf: ['', 'Beginn', 'Ende', 'Dauer'], zeilen: [[was, u(b), u(e), '?']] };
    return {
      art: 'dauer', auftrag: `${was}: Wie lange dauert das?${ueber ? ' Achtung: über Mitternacht.' : ''}`,
      buehne: [tabelle, { typ: 'zeitstrahl', beginn: b, ende: e, ueberMitternacht: ueber, ab: 1 }],
      tipps: ['Erst bis zur nächsten vollen Stunde springen.', 'Dann in ganzen Stunden springen, dann den Rest.', 'Zähl am Ende alle Sprünge zusammen.'],
      schritte: [
        { typ: 'karten', vermutung: true, frage: 'Vermute zuerst: Ist es …', karten: VERMUTEN.map(([k, t]) => ({ text: t, richtig: k === vergleich(d) })),
          richtigText: 'Deine Vermutung passt. Jetzt rechne genau.', andersText: 'Der Zeitstrahl zeigt es genauer. Rechne jetzt nach.' },
        { typ: 'ziffern', frage: 'Wie lange dauert es genau?', zeilen: [H.zeileDauer('Dauer')], leerIstNull: true,
          pruefe: w => H.alsDauer(w.h, w.m) === d,
          hinweis: w => { const x = H.alsDauer(w.h, w.m); return x === null ? '60 min sind schon 1 h.' : x < d ? 'Es dauert länger. Zähl alle Sprünge zusammen.' : 'Es dauert kürzer. Schau noch einmal auf den Zeitstrahl.'; },
          loesung: H.loesungDauer(d), richtigText: `Das stimmt: ${Z.alsDauer(d)}.`,
          erklaerung: Z.spruenge(b, e, { ueberMitternacht: ueber }).length > 1
            ? `${Z.spruenge(b, e, { ueberMitternacht: ueber }).map(s => Z.alsDauer(s.dauer)).join(' + ')} = ${Z.alsDauer(d)}.`
            : `Von ${u(b)} bis ${u(e)} sind es ${Z.alsDauer(d)}.`,
          loesungText: `Es dauert ${Z.alsDauer(d)}.` }
      ],
      schluessel: `d${b}-${d}`
    };
  }
  /* Ende gesucht: Beginn + Dauer */
  function ende(stufe, zf) {
    const { was, b, d } = fall(stufe === 'knifflig' ? 'mittel' : stufe, zf);
    const e = b + d;
    return {
      art: 'ende', auftrag: `${was}: Beginn um ${u(b)}, Dauer ${Z.alsDauer(d)}. Wann ist das Ende?`,
      buehne: [{ typ: 'tabelle', titel: 'Wann ist was?', kopf: ['', 'Beginn', 'Dauer', 'Ende'], zeilen: [[was, u(b), Z.alsDauer(d), '?']] }],
      tipps: ['Das Ende ist eine Uhrzeit.', 'Spring vom Beginn erst die ganzen Stunden, dann die Minuten.', 'Über 60 Minuten? Dann beginnt die nächste Stunde.'],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileUhrzeit('Ende')], pruefe: w => H.alsZeitpunkt(w.h, w.m) === e,
        hinweis: w => { const x = H.alsZeitpunkt(w.h, w.m); return x === null ? 'Eine Stunde hat nur 60 Minuten.' : x < e ? 'Zu früh. Rechne die ganze Dauer dazu.' : 'Zu spät. Rechne noch einmal nach.'; },
        loesung: H.loesungUhrzeit(e), richtigText: `Das stimmt: um ${u(e)}.`, erklaerung: `${u(b)} und ${Z.alsDauer(d)} später ist es ${u(e)}.`, loesungText: `Das Ende ist um ${u(e)}.` }],
      schluessel: `e${b}-${d}`
    };
  }
  /* Beginn gesucht (knifflig): Ende − Dauer */
  function beginn(stufe, zf) {
    const { was, b, d } = fall('mittel', zf);
    const e = b + d;
    return {
      art: 'beginn', auftrag: `${was}: Ende um ${u(e)}, Dauer ${Z.alsDauer(d)}. Wann war der Beginn?`,
      buehne: [{ typ: 'tabelle', titel: 'Wann ist was?', kopf: ['', 'Beginn', 'Dauer', 'Ende'], zeilen: [[was, '?', Z.alsDauer(d), u(e)]] }],
      tipps: ['Der Beginn ist früher als das Ende.', 'Spring vom Ende rückwärts.', 'Erst die ganzen Stunden zurück, dann die Minuten.'],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileUhrzeit('Beginn')], pruefe: w => H.alsZeitpunkt(w.h, w.m) === b,
        hinweis: w => { const x = H.alsZeitpunkt(w.h, w.m); return x === null ? 'Eine Stunde hat nur 60 Minuten.' : x > b ? 'Noch früher. Geh die ganze Dauer zurück.' : 'Zu früh. Rechne noch einmal nach.'; },
        loesung: H.loesungUhrzeit(b), richtigText: `Das stimmt: um ${u(b)}.`, erklaerung: `${Z.alsDauer(d)} vor ${u(e)} ist es ${u(b)}.`, loesungText: `Der Beginn war um ${u(b)}.` }],
      schluessel: `b${b}-${d}`
    };
  }
  /* Verspätung (Buch S. 126 nach Art): geplante Ankunft + Verspätung */
  function verspaetung(stufe, zf) {
    const plan = zf.zwischen(84, 240) * 5 + (stufe === 'knifflig' ? zf.zwischen(0, 4) : 0);
    const sp = stufe === 'knifflig' ? zf.zwischen(12, 75) : zf.zwischen(2, 9) * 5;
    const e = plan + sp;
    return {
      art: 'verspaetung', auftrag: `Die Fähre sollte um ${u(plan)} ankommen. Sie hat ${Z.alsDauer(sp)} Verspätung. Wann kommt sie an?`,
      buehne: [{ typ: 'satz', text: `geplant: ${u(plan)}  ·  Verspätung: ${Z.alsDauer(sp)}` }],
      tipps: ['Verspätung heißt: später als geplant.', 'Rechne die Verspätung zur geplanten Uhrzeit dazu.', 'Über 60 Minuten? Dann beginnt die nächste Stunde.'],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileUhrzeit('Ankunft')], pruefe: w => H.alsZeitpunkt(w.h, w.m) === e,
        hinweis: w => H.alsZeitpunkt(w.h, w.m) === plan ? 'Das ist die geplante Zeit. Die Fähre kommt später.' : 'Noch nicht ganz. Rechne die Verspätung dazu.',
        loesung: H.loesungUhrzeit(e), richtigText: `Das stimmt: Sie kommt um ${u(e)} an.`, erklaerung: `${u(plan)} und ${Z.alsDauer(sp)} später ist es ${u(e)}.`, loesungText: `Sie kommt um ${u(e)} an.` }],
      schluessel: `s${plan}-${sp}`
    };
  }
  /* Vergleichen: Was dauert länger? (Tabelle wie Buch S. 125, eigene Inhalte) */
  function laenger(stufe, zf) {
    for (let n = 0; n < 40; n++) {
      const f1 = fall(stufe, zf), f2 = fall(stufe, zf);
      if (f1.was === f2.was || f1.d === f2.d || f1.b + f1.d > 1439 || f2.b + f2.d > 1439) continue;
      const lang = f1.d > f2.d ? f1 : f2;
      return {
        art: 'laenger', auftrag: 'Was dauert länger?',
        buehne: [{ typ: 'tabelle', titel: 'Wann ist was?', kopf: ['', 'Beginn', 'Ende'], zeilen: [[f1.was, u(f1.b), u(f1.b + f1.d)], [f2.was, u(f2.b), u(f2.b + f2.d)]] }],
        tipps: ['Rechne für beide die Dauer aus.', 'Spring vom Beginn bis zum Ende.', 'Vergleiche die beiden Dauern.'],
        schritte: [{ typ: 'karten', karten: [f1, f2].map(f => ({ text: f.was, richtig: f === lang })),
          richtigText: `Das stimmt: ${lang.was} dauert länger.`, erklaerung: `${f1.was}: ${Z.alsDauer(f1.d)}. ${f2.was}: ${Z.alsDauer(f2.d)}.`, loesungText: `${lang.was} dauert länger.` }],
        schluessel: `l${f1.b}-${f2.b}`
      };
    }
    return dauer(stufe, zf);
  }

  const ARTEN = { dauer, ende, beginn, verspaetung, laenger };
  const PLAN = {
    leicht: ['dauer', 'ende', 'dauer', 'laenger', 'ende', 'dauer'],
    mittel: ['dauer', 'ende', 'verspaetung', 'laenger', 'dauer', 'ende'],
    knifflig: ['dauer', 'beginn', 'verspaetung', 'dauer', 'laenger', 'beginn']
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
  LU.aufgaben.dauer = { runde, ARTEN, PLAN, DINGE };

  LU.motor.station({
    id: 'dauer', titel: 'Wie lange?', unterzeile: 'Beginn, Ende, Dauer',
    einleitung: 'Etwas beginnt und hört wieder auf. Wie lange hat es gedauert? Erst vermutest du, dann springst du am Zeitstrahl.',
    soGehts: ['Lies Beginn und Ende.', 'Vermute zuerst: kürzer, genau oder länger als eine Stunde?', 'Dann zeigt der Zeitstrahl die Sprünge. Rechne die Dauer und tippe sie ein.'],
    stufenText: { leicht: 'Viertelstunden', mittel: '5-Minuten-Schritte, Verspätung', knifflig: 'genaue Minuten, Beginn gesucht, über Mitternacht' },
    amTisch: { titel: 'Am Tisch: Mein Nachmittag', schritte: [
      'Schreib drei Dinge auf, die du heute Nachmittag machst, mit Beginn und Ende.',
      'Zeichne für jedes einen Zeitstrahl mit Sprüngen: bis zur vollen Stunde, dann ganze Stunden, dann der Rest.',
      'Was hat am längsten gedauert? Vergleicht zu zweit.',
      'Stellt Beginn und Ende auf der Lernuhr und dreht den langen Zeiger von einem zum anderen.'],
      notiz: 'Material: Heft, Stift, Lernuhr.' },
    woerter: [
      ['Beginn', 'wann etwas anfängt (eine Uhrzeit).'],
      ['Ende', 'wann etwas aufhört (eine Uhrzeit).'],
      ['Dauer', 'wie lange etwas dauert (eine Zeitspanne), zum Beispiel 1 h 20 min.'],
      ['Zeitstrahl', 'ein Strich mit Uhrzeiten. Die Bögen zeigen, wie viel Zeit vergeht.'],
      ['Verspätung', 'so viel später als geplant.'],
      ['früher als, später als', 'vor oder nach einer Uhrzeit.']
    ],
    tippsStandard: ['Erst bis zur nächsten vollen Stunde springen.', 'Dann ganze Stunden, dann den Rest.', 'Zähl alle Sprünge zusammen.'],
    stempelMotiv: '<path class="stempel__welle" d="M24 62h52M30 56v12M70 56v12M32 56Q50 26 68 56"/><path class="stempel__kugel" d="M68 56l-8-2l3-7z"/>',
    aufgaben: runde
  });
})();
