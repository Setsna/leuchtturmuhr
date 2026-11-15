/* Leuchtturmuhr: Station „Kann das stimmen?“ (Etappe 5). Lumi behauptet etwas, das Kind prüft.
   Nach Art von Denken und Rechnen 3, gedruckt S. 123 und 126 („Kann das stimmen?“). Eigene Sätze, nichts abgeschrieben.
   Keine Sekunden (Ingo, 15.11.2026), keine Behauptung über die Länge einer Schulstunde.
   Zwei Schritte: stimmt oder stimmt nicht, dann die passende Begründung. Richtig/falsch wird bei erzeugten
   Behauptungen mit LU.zeit berechnet. Feste Sätze: nur sachlich sichere Aussagen, zur Prüfung durch Ingo markiert.
   Texte: Entwurf, noch nicht freigegeben. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit, H = LU.ah;
  const u = m => Z.alsUhrzeit(m);
  const sprech = () => LU.config.sprechweise;
  const JA = 'Das stimmt.', NEIN = 'Das stimmt nicht.';

  function aufgabe(art, lumi, stimmt, begruendungen, richtigeBegr, buehne, schluessel, tipps) {
    return {
      art, lumi, auftrag: 'Kann das stimmen?', buehne: buehne || [],
      tipps: tipps || ['Lies Lumis Satz noch einmal genau.', 'Rechne nach oder schau auf die Uhr.', 'Eine Stunde hat 60 Minuten, ein Tag 24 Stunden.'],
      schritte: [
        { typ: 'karten', karten: [{ text: JA, richtig: stimmt }, { text: NEIN, richtig: !stimmt }], richtigText: stimmt ? 'Genau, das stimmt.' : 'Genau, das stimmt nicht.', loesungText: stimmt ? 'Es stimmt.' : 'Es stimmt nicht.' },
        { typ: 'karten', frage: 'Warum?', karten: begruendungen.map((t, i) => ({ text: t, richtig: i === richtigeBegr })), richtigText: 'Gut geprüft.', loesungText: 'Diese Begründung passt.' }
      ],
      schluessel
    };
  }
  const misch = (zf, liste, richtig) => { const ord = zf.mische(liste.map((t, i) => i)); return { liste: ord.map(i => liste[i]), richtig: ord.indexOf(richtig) }; };

  /* Uhr und Satz passen (nicht) zusammen */
  function uhrSatz(stufe, zf) {
    const z = stufe === 'leicht' ? zf.zahl(12) * 60 + zf.waehle([0, 15, 30, 45]) : zf.zahl(144) * 5;
    const stimmt = zf.zahl(2) === 0;
    const andere = Z.ablenker(z, 1, zf, { system: sprech() })[0];
    const satz = stimmt ? Z.lumiSagt(z, sprech()) : andere;
    const b = misch(zf, [`Die Uhr zeigt ${Z.lumiSagt(z, sprech())}.`, 'Der kurze Zeiger zeigt immer die Minuten.', 'Die Uhr zeigt keine Uhrzeit.'], 0);
    return aufgabe('uhrSatz', `Auf meiner Uhr ist es ${satz}.`, stimmt, b.liste, b.richtig,
      [{ typ: 'uhr', zeit: z, zahlen: true, striche: true }], `u${z}${stimmt}`,
      ['Lies die Uhr selbst ab.', 'Der kurze Zeiger zeigt die Stunde, der lange die Minuten.', 'Vergleiche mit Lumis Satz.']);
  }
  /* Gibt es diese Uhrzeit? (14:63 Uhr, 25:10 Uhr …) */
  function gibtEs(stufe, zf) {
    const art = zf.zahl(3);
    let h = zf.zwischen(0, 23), m = zf.zwischen(0, 59), stimmt = true, grund = 0;
    if (art === 0) { m = zf.zwischen(60, 79); stimmt = false; grund = 1; }
    else if (art === 1) { h = zf.zwischen(24, 29); stimmt = false; grund = 2; }
    const text = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} Uhr`;
    const b = misch(zf, ['Diese Uhrzeit gibt es.', 'Eine Stunde hat nur 60 Minuten. Nach :59 kommt die nächste Stunde.', 'Ein Tag hat 24 Stunden. Nach 23:59 Uhr kommt 00:00 Uhr.'], grund);
    return aufgabe('gibtEs', `Auf meiner Digitaluhr steht ${text}.`, stimmt, b.liste, b.richtig, [{ typ: 'satz', text }], `g${text}`);
  }
  /* Dauer-Behauptung: „Von 8:45 Uhr bis 9:15 Uhr ist eine Stunde.“ */
  function dauerSatz(stufe, zf) {
    const b0 = stufe === 'knifflig' ? zf.zwischen(420, 1200) : zf.zwischen(84, 228) * 5;
    const d = stufe === 'knifflig' ? zf.zwischen(20, 150) : zf.zwischen(3, 24) * 5;
    const stimmt = zf.zahl(2) === 0;
    const falsch = d + zf.waehle([-30, -15, -10, 10, 15, 30, 60]);
    const behauptet = stimmt || falsch <= 0 ? d : falsch;
    const wahr = behauptet === d;
    const b = misch(zf, [`Von ${u(b0)} bis ${u(b0 + d)} sind es ${Z.alsDauer(d)}.`, 'Man muss nur die Minuten abziehen.', 'Zeitspannen kann man nicht ausrechnen.'], 0);
    return aufgabe('dauerSatz', `Von ${u(b0)} bis ${u(b0 + d)} dauert es ${Z.alsDauerWorte(behauptet)}.`, wahr, b.liste, b.richtig,
      [{ typ: 'zeitstrahl', beginn: b0, ende: b0 + d, spruenge: false }], `d${b0}-${d}-${behauptet}`,
      ['Spring vom Beginn zur nächsten vollen Stunde.', 'Dann ganze Stunden, dann den Rest.', 'Vergleiche mit Lumis Zahl.']);
  }
  /* Später/früher: „10 Minuten nach 9:55 Uhr ist es 10:05 Uhr.“ */
  function spaeter(stufe, zf) {
    const t = zf.zwischen(84, 250) * 5 - (stufe === 'knifflig' ? zf.zwischen(1, 4) : 0);   /* bis 20:50 Uhr: auch mit 60 min daneben bleibt es am selben Tag */
    const d = zf.waehle([5, 10, 15, 20, 30, 45]);
    const richtigZeit = t + d;
    const stimmt = zf.zahl(2) === 0;
    const behauptet = stimmt ? richtigZeit : richtigZeit + zf.waehle([-60, 40, 60, -40]);
    const wahr = behauptet === richtigZeit;
    const b = misch(zf, [`${Z.alsDauerWorte(d)} nach ${u(t)} ist es ${u(richtigZeit)}.`, 'Man zählt einfach die Minuten dazu, die Stunde bleibt immer gleich.', 'Später heißt früher.'], 0);
    return aufgabe('spaeter', `${Z.alsDauerWorte(d)} nach ${u(t)} ist es ${u(behauptet)}.`, wahr, b.liste, b.richtig, [], `s${t}-${d}-${behauptet}`,
      ['Rechne die Minuten dazu.', 'Über 60 Minuten? Dann beginnt die nächste Stunde.', 'Vergleiche mit Lumis Uhrzeit.']);
  }
  /* Fehler an der Uhr: Der Stundenzeiger steht genau auf der Zahl, obwohl schon viele Minuten vorbei sind (knifflig) */
  function zeigerFehler(stufe, zf) {
    const z = zf.zahl(12) * 60 + zf.waehle([15, 30, 40, 45, 50]);
    const falsch = zf.zahl(2) === 0;
    const b = misch(zf, ['Der kurze Zeiger wandert mit den Minuten weiter. Bei so vielen Minuten steht er nicht mehr genau auf der Zahl.',
      'Der kurze Zeiger steht richtig: Er wandert mit den Minuten ein Stück weiter.', 'Eine Uhr hat nur einen Zeiger.'], falsch ? 0 : 1);
    return aufgabe('zeigerFehler', `Meine Uhr zeigt ${Z.lumiSagt(z, sprech())}. Kann die Uhr so aussehen?`, !falsch, b.liste, b.richtig,
      [{ typ: 'uhr', zeit: z, zahlen: true, striche: true, falscheStunde: falsch }], `z${z}${falsch}`,
      ['Schau genau auf den kurzen Zeiger.', 'Bei halb steht der kurze Zeiger in der Mitte zwischen zwei Zahlen.', 'Genau auf der Zahl steht er nur zur vollen Stunde.']);
  }
  /* Feste Sätze (sachlich sicher, von Ingo zu prüfen): [Satz, stimmt, Begründungen, Index der richtigen, Stufen] */
  const FEST = [
    ['Ein Tag hat 24 Stunden.', true, ['Von Mitternacht bis Mitternacht vergehen 24 Stunden.', 'Ein Tag hat 12 Stunden, so viele Zahlen hat die Uhr.', 'Ein Tag hat 100 Stunden.'], 0, ['leicht', 'mittel']],
    ['Eine Stunde hat 100 Minuten.', false, ['Eine Stunde hat 60 Minuten.', 'Eine Stunde hat 100 Minuten, wie ein Meter 100 Zentimeter.', 'Eine Stunde hat 12 Minuten.'], 0, ['leicht', 'mittel']],
    ['Eine Viertelstunde dauert länger als eine halbe Stunde.', false, ['Eine Viertelstunde hat 15 Minuten, eine halbe Stunde 30.', 'Ein Viertel ist mehr als eine Hälfte.', 'Beide dauern gleich lang.'], 0, ['leicht', 'mittel']],
    ['00:00 Uhr ist Mitternacht.', true, ['Um 00:00 Uhr beginnt ein neuer Tag. Das ist Mitternacht.', '00:00 Uhr ist mittags.', '00:00 Uhr gibt es nicht.'], 0, ['mittel', 'knifflig']],
    ['12:00 Uhr ist Mitternacht.', false, ['12:00 Uhr ist Mittag. Mitternacht ist 00:00 Uhr.', 'Mittag und Mitternacht sind dasselbe.', '12:00 Uhr gibt es nur abends.'], 0, ['mittel', 'knifflig']],
    ['00:00 Uhr und 12:00 Uhr ist dasselbe.', false, ['Auf der Uhr sieht es gleich aus, aber 00:00 Uhr ist Mitternacht und 12:00 Uhr ist Mittag.', 'Es ist dasselbe, weil die Zeiger gleich stehen.', '12 und 0 sind gleich viel.'], 0, ['mittel', 'knifflig']],
    ['Zähneputzen dauert etwa 3 Stunden.', false, ['Zähneputzen dauert nur ein paar Minuten.', 'Zähneputzen dauert einen ganzen Tag.', 'Zähneputzen dauert genau 3 Stunden.'], 0, ['leicht', 'mittel']],
    ['Ein Kinderfilm im Kino dauert oft etwa 1 Stunde 30 Minuten.', true, ['Viele Kinderfilme dauern ungefähr eineinhalb Stunden. Das passt.', 'Ein Film dauert nur 5 Minuten.', 'Ein Film dauert immer 3 Tage.'], 0, ['mittel', 'knifflig']],
    ['Ich halte eine ganze Stunde lang die Luft an.', false, ['So lange kann niemand die Luft anhalten.', 'Das schafft jeder.', 'Eine Stunde ist ganz kurz.'], 0, ['leicht', 'mittel', 'knifflig']],
    ['Um 07:30 Uhr am Morgen ist es halb acht.', true, ['07:30 Uhr spricht man „halb acht“.', 'Halb acht ist 08:30 Uhr.', 'Halb acht ist 07:08 Uhr.'], 0, ['leicht', 'mittel']],
    ['13:00 Uhr ist eine Uhrzeit am Nachmittag.', true, ['13:00 Uhr ist 1 Uhr nachmittags.', '13:00 Uhr gibt es nicht, die Uhr hat nur 12 Zahlen.', '13:00 Uhr ist mitten in der Nacht.'], 0, ['mittel', 'knifflig']]
  ];
  function fest(stufe, zf) {
    const passend = FEST.filter(f => f[4].includes(stufe));
    const f = zf.waehle(passend);
    const b = misch(zf, f[2], f[3]);
    return aufgabe('fest', f[0], f[1], b.liste, b.richtig, [], 'f' + f[0]);
  }

  const ARTEN = { uhrSatz, gibtEs, dauerSatz, spaeter, zeigerFehler, fest };
  const PLAN = {
    leicht: ['uhrSatz', 'fest', 'uhrSatz', 'fest', 'dauerSatz', 'fest'],
    mittel: ['gibtEs', 'uhrSatz', 'dauerSatz', 'fest', 'spaeter', 'fest'],
    knifflig: ['zeigerFehler', 'dauerSatz', 'gibtEs', 'spaeter', 'zeigerFehler', 'fest']
  };
  function runde(stufe, zf) {
    const liste = [], schl = new Set();
    for (const art of PLAN[stufe]) {
      let a, n = 0;
      do { a = ARTEN[art](stufe, zf); } while (schl.has(a.schluessel) && n++ < 30);
      schl.add(a.schluessel); liste.push(a);
    }
    return zf.mische(liste);
  }

  LU.aufgaben = LU.aufgaben || {};
  LU.aufgaben.stimmt = { runde, ARTEN, PLAN, FEST, JA, NEIN };

  LU.motor.station({
    id: 'stimmt', titel: 'Kann das stimmen?', unterzeile: 'Lumi prüfen',
    einleitung: 'Ich behaupte manchmal Dinge über die Zeit. Nicht alles stimmt. Prüfst du mich?',
    soGehts: ['Lies, was Lumi sagt.', 'Tippe: Das stimmt oder Das stimmt nicht.', 'Dann tippe die passende Begründung an.'],
    stufenText: { leicht: 'Uhren und einfache Sätze', mittel: 'Uhrzeiten, die es nicht gibt, Zeitspannen', knifflig: 'Fehler an der Uhr finden' },
    amTisch: { titel: 'Am Tisch: Stimmt das?', schritte: [
      'Schreibt zu zweit drei Sätze über Uhrzeiten oder Zeitspannen. Einer davon stimmt nicht.',
      'Tauscht mit einem anderen Paar. Findet den falschen Satz.',
      'Begründet: Warum stimmt er nicht? Prüft mit der Lernuhr.'],
      notiz: 'Material: Zettel, Stift, Lernuhr.' },
    woerter: [
      ['Mitternacht', '00:00 Uhr. Ein neuer Tag beginnt.'],
      ['Mittag', '12:00 Uhr.'],
      ['Stunde', 'hat 60 Minuten.'],
      ['Tag', 'hat 24 Stunden.'],
      ['später als, früher als', 'nach oder vor einer Uhrzeit.']
    ],
    tippsStandard: ['Lies Lumis Satz noch einmal genau.', 'Rechne nach oder schau auf die Uhr.', 'Eine Stunde hat 60 Minuten, ein Tag 24 Stunden.'],
    stempelMotiv: '<circle class="stempel__welle" cx="45" cy="45" r="16"/><path class="stempel__welle" d="M57 57l14 14M38 45l5 5 9-10"/>',
    aufgaben: runde
  });
})();
