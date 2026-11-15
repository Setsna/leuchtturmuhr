/* Leuchtturmuhr: Station „Zeitspannen“ (Etappe 3). Stunden und Minuten, Umrechnen, wie viel Zeit vergangen ist.
   Nach Art und Stufe von Denken und Rechnen 3, gedruckt S. 124 (Wortspeicher, zwei Uhren, Umrechnen). Nichts abgeschrieben.
   Brüche nur als Wortbild (¼ h, ½ h, ¾ h), kein Rechnen mit Brüchen (Ingo, 15.11.2026). Keine Sekunden.
   Zeitspannen stehen immer als Dauer da („1 h 5 min“), nie als Uhrzeit. Texte: Entwurf, noch nicht freigegeben. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit, H = LU.ah;
  const WS = () => Z.WORTSPEICHER;
  const sprech = () => LU.config.sprechweise;

  /* Wortspeicher: „Wie viele Minuten hat eine Dreiviertelstunde?“ */
  function wortspeicher(stufe, zf) {
    const w = zf.waehle(WS());
    const mitBild = zf.zahl(2) === 0;
    const name = mitBild ? w.bild : (w.wort === 'Stunde' ? 'eine Stunde' : w.wort === 'halbe Stunde' ? 'eine halbe Stunde' : 'eine ' + w.wort);
    return {
      art: 'wortspeicher', auftrag: `Wie viele Minuten sind ${name}?`,
      buehne: [{ typ: 'satz', text: name }],
      tipps: ['Eine Stunde hat 60 Minuten.', 'Eine halbe Stunde ist die Hälfte davon. Eine Viertelstunde ist ein Viertel.', 'Viertelstunde 15, halbe Stunde 30, Dreiviertelstunde 45, Stunde 60.'],
      schritte: [{ typ: 'karten', karten: H.karten(zf, [`${w.minuten} min`], zf.mische([15, 30, 45, 60, 25, 50, 100].filter(x => x !== w.minuten)).map(x => `${x} min`)),
        richtigText: `Das stimmt: ${name} sind ${w.minuten} Minuten.`, erklaerung: 'Viertelstunde 15 min, halbe Stunde 30 min, Dreiviertelstunde 45 min, Stunde 60 min.',
        loesungText: `${name} sind ${w.minuten} Minuten.` }],
      schluessel: 'w' + w.minuten
    };
  }

  /* Umrechnen in Minuten: „1 h 20 min = ? min“ */
  function inMinuten(stufe, zf) {
    const h = stufe === 'leicht' ? zf.zwischen(1, 4) : zf.zwischen(1, stufe === 'mittel' ? 2 : 4);
    const m = stufe === 'leicht' ? 0 : (stufe === 'mittel' ? zf.zwischen(1, 11) * 5 : zf.zwischen(1, 59));
    const d = h * 60 + m, text = Z.alsDauer(d);
    return {
      art: 'inMinuten', auftrag: `Wie viele Minuten sind ${text}?`,
      buehne: [{ typ: 'satz', text }],
      tipps: ['1 h sind 60 min.', `${h} h sind ${h}-mal 60 min.`, m ? `Rechne ${h * 60} min und ${m} min zusammen.` : `Rechne ${h} mal 60.`],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileMinuten()], pruefe: w => w.min === d,
        hinweis: w => w.min === h * 60 ? `Die ${h} h hast du. Denk noch an die ${m} min.` : `Noch nicht ganz. 1 h sind 60 min.`,
        loesung: { min: String(d) }, richtigText: `Das stimmt: ${text} sind ${d} min.`, erklaerung: `${h} mal 60 min sind ${h * 60} min${m ? `, dazu ${m} min` : ''}.`,
        loesungText: `${text} sind ${d} min.` }],
      schluessel: 'i' + d
    };
  }

  /* Minuten in Stunden und Minuten: „135 min = ? h ? min“ */
  function inStunden(stufe, zf) {
    const d = stufe === 'mittel' ? zf.zwischen(13, 36) * 5 : zf.zwischen(61, 300);
    const h = Math.floor(d / 60), m = d % 60;
    return {
      art: 'inStunden', auftrag: `Wie viele Stunden und Minuten sind ${d} min?`,
      buehne: [{ typ: 'satz', text: `${d} min` }],
      tipps: ['60 min sind 1 h.', 'Wie oft passen 60 Minuten hinein?', `${h} mal 60 sind ${h * 60}. Was bleibt übrig?`],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileDauer()], leerIstNull: true, pruefe: w => H.alsDauer(w.h, w.m) === d,
        hinweis: w => (w.m || 0) > 59 ? '60 min sind schon 1 h. Pack sie zu den Stunden.' : 'Noch nicht ganz. Wie oft passen 60 Minuten hinein?',
        loesung: H.loesungDauer(d), richtigText: `Das stimmt: ${d} min sind ${Z.alsDauer(d)}.`, erklaerung: `${h} mal 60 min sind ${h * 60} min. Es bleiben ${m} min.`,
        loesungText: `${d} min sind ${Z.alsDauer(d)}.` }],
      schluessel: 's' + d
    };
  }

  /* Wie viel Zeit ist vergangen? Zwei Uhren, gleiche Tageshälfte */
  function vergangen(stufe, zf) {
    let b, d;
    if (stufe === 'leicht') { b = zf.zwischen(1, 9) * 60 + zf.waehle([0, 30]); d = zf.waehle([30, 60, 90, 120, 150, 180]); }
    else if (stufe === 'mittel') { b = zf.zwischen(12, 120) * 5; d = zf.zwischen(2, 30) * 5; }
    else { b = zf.zwischen(60, 600); d = zf.zwischen(25, 170); }
    if (b + d >= 720) b = 720 - d - zf.zwischen(1, 60);
    const e = b + d;
    return {
      art: 'vergangen', auftrag: 'Wie viel Zeit ist vergangen? Erst die linke Uhr, dann die rechte.', hilfe: 'minutenzahlen',
      buehne: [{ typ: 'uhr', zeit: b, zahlen: stufe !== 'knifflig', titel: 'vorher' }, { typ: 'uhr', zeit: e, zahlen: stufe !== 'knifflig', titel: 'nachher' }],
      tipps: ['Lies beide Uhren ab.', 'Spring erst bis zur nächsten vollen Stunde, dann in ganzen Stunden, dann den Rest.', `Die Uhren zeigen ${Z.alsUhrzeit(b)} und ${Z.alsUhrzeit(e)}.`],
      schritte: [{ typ: 'ziffern', zeilen: [H.zeileDauer()], leerIstNull: true, pruefe: w => H.alsDauer(w.h, w.m) === d,
        hinweis: w => { const x = H.alsDauer(w.h, w.m); return x === null ? '60 min sind 1 h.' : x < d ? 'Es ist mehr Zeit vergangen.' : 'Es ist weniger Zeit vergangen.'; },
        loesung: H.loesungDauer(d), richtigText: `Das stimmt: ${Z.alsDauer(d)}.`,
        erklaerung: `Von ${Z.alsUhrzeit(b)} bis ${Z.alsUhrzeit(e)}: ${Z.spruenge(b, e).map(s => Z.alsDauer(s.dauer)).join(' + ')}${Z.spruenge(b, e).length > 1 ? ` = ${Z.alsDauer(d)}` : ''}.`,
        loesungText: `Es sind ${Z.alsDauer(d)} vergangen.` }],
      schluessel: 'v' + b + '-' + e
    };
  }

  /* Was dauert länger? Drei Zeitspannen in verschiedenen Schreibweisen */
  function vergleichen(stufe, zf) {
    for (let n = 0; n < 50; n++) {
      const pool = stufe === 'mittel'
        ? [15, 30, 45, 60, 75, 90, 100, 120]
        : [45, 50, 60, 65, 70, 75, 80, 90, 100, 105, 110, 120, 130, 150];
      const d = zf.mische(pool).slice(0, 3);
      const max = Math.max(...d);
      if (d.filter(x => x === max).length !== 1) continue;
      const schreib = x => {
        const w = WS().find(v => v.minuten === x && v.minuten !== 60);
        const art = zf.zahl(3);
        if (art === 0 && w && stufe === 'mittel') return 'eine ' + w.wort.replace('halbe Stunde', 'halbe Stunde');
        if (art === 1 || x < 60) return `${x} min`;
        return Z.alsDauer(x);
      };
      const texte = d.map(schreib);
      if (new Set(texte).size !== 3) continue;
      return {
        art: 'vergleichen', auftrag: 'Was dauert am längsten?',
        buehne: [{ typ: 'satz', text: texte.join('  ·  ') }],
        tipps: ['Schreib alles in Minuten.', '1 h sind 60 min.', `In Minuten: ${d.map(x => x + ' min').join(', ')}.`],
        schritte: [{ typ: 'karten', karten: texte.map((t, i) => ({ text: t, richtig: d[i] === max })), richtigText: `Das stimmt: ${texte[d.indexOf(max)]} dauert am längsten.`,
          erklaerung: `In Minuten: ${texte.map((t, i) => `${t} = ${d[i]} min`).join(', ')}.`, loesungText: `${texte[d.indexOf(max)]} dauert am längsten.` }],
        schluessel: 'c' + d.join('-')
      };
    }
    return wortspeicher(stufe, zf);
  }

  const ARTEN = { wortspeicher, inMinuten, inStunden, vergangen, vergleichen };
  const PLAN = {
    leicht: ['wortspeicher', 'inMinuten', 'vergangen', 'wortspeicher', 'inMinuten', 'vergangen'],
    mittel: ['inMinuten', 'inStunden', 'vergangen', 'vergleichen', 'vergangen', 'inStunden'],
    knifflig: ['inStunden', 'vergangen', 'vergleichen', 'inMinuten', 'vergangen', 'inStunden']
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
  LU.aufgaben.spannen = { runde, ARTEN, PLAN };

  LU.motor.station({
    id: 'spannen', titel: 'Zeitspannen', unterzeile: 'Stunden und Minuten',
    einleitung: 'Eine Zeitspanne sagt, wie lange etwas dauert. Hier rechnest du mit Stunden und Minuten.',
    soGehts: ['Lies die Aufgabe.', 'Tippe die Zahl mit den Ziffernknöpfen ein oder wähle ein Kärtchen.', 'Tippe auf Prüfen.'],
    stufenText: { leicht: 'Viertelstunde, halbe Stunde, ganze Stunden', mittel: 'Stunden und Minuten umrechnen, vergleichen', knifflig: 'genaue Minuten, längere Zeitspannen' },
    amTisch: { titel: 'Am Tisch: Zeitspannen mit der Lernuhr', schritte: [
      'Stellt die Lernuhr auf eine volle Stunde.',
      'Dreht den langen Zeiger einmal ganz herum. Wie viel Zeit ist vergangen? Was macht der kurze Zeiger?',
      'Dreht nur eine Viertelstunde weiter, dann eine halbe Stunde. Sprecht dabei: „Eine Viertelstunde sind 15 Minuten.“',
      'Kind A dreht weiter, Kind B sagt, wie viel Zeit vergangen ist. Dann tauschen.'],
      notiz: 'Material: Lernuhr oder gebastelte Uhr.' },
    woerter: [
      ['Zeitspanne, Dauer', 'wie lange etwas dauert, zum Beispiel 1 h 5 min.'],
      ['Stunde (h)', '1 h = 60 min.'],
      ['Minute (min)', '60 min = 1 h.'],
      ['Viertelstunde (¼ h)', '15 min.'],
      ['halbe Stunde (½ h)', '30 min.'],
      ['Dreiviertelstunde (¾ h)', '45 min.'],
      ['dauert länger als', 'braucht mehr Zeit.'],
      ['dauert kürzer als', 'braucht weniger Zeit.']
    ],
    tippsStandard: ['Eine Stunde hat 60 Minuten.', 'Rechne alles in Minuten um.', 'Schau in die Wörter. Dort steht, wie viele Minuten eine Viertelstunde hat.'],
    stempelMotiv: '<path class="stempel__welle" d="M38 28h24M38 72h24M40 28c0 12 20 16 20 22s-20 10-20 22M60 28c0 12-20 16-20 22s20 10 20 22"/><path class="stempel__kugel" d="M44 66h12l-6-7z"/>',
    aufgaben: runde
  });
})();
