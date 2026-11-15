/* Leuchtturmuhr: der gemeinsame Ablauf aller Stationen (Stufenwahl, Runde mit 6 Aufgaben, Rückmeldung, Hilfe, Stempel).
   Klassisches Skript, legt window.LU.motor an. Braucht LU.config, LU.zeit, LU.uhr, LU.zeitstrahl, LU.teile, LU.stand.

   Eine Station meldet sich mit LU.motor.station({ id, titel, unterzeile, einleitung, soGehts, amTisch, woerter,
   stufenText, stempelMotiv, tippsStandard, aufgaben(stufe, zufall) }) an. aufgaben() liefert eine Liste von Aufgaben:
     { art, auftrag, lumi?, buehne: [Teile], schritte: [Antwort], tipps?, hilfe? }
   Teile der Bühne:
     { typ: 'uhr', zeit, zahlen, striche, raster, nurStunde, falscheStunde, titel, stellbar? }   stellbar: diese Uhr stellt das Kind
     { typ: 'zeitstrahl', beginn, ende, ueberMitternacht, ab? }    ab: erst ab Schritt n sichtbar (Vermuten, dann prüfen)
     { typ: 'tageszeit', wann: 'vormittags' | 'nachmittags' | 'nachts' }
     { typ: 'tabelle', titel, kopf: [..], zeilen: [[..]], hervor? }  Fahrplan
     { typ: 'satz', text }                                          kurzer Satz auf der Bühne
   Antworten (ein Schritt):
     { typ: 'karten', frage, karten: [{ text, richtig }], vermutung? }
     { typ: 'stellen', frage, pruefe(m), hinweis(m), ziel }
     { typ: 'ziffern', frage, zeilen: [{ titel?, teile: [{ feld, stellen, label } | { text }] }], pruefe(werte), hinweis(werte), loesung: { feld: Zahl } }
   Jeder Schritt hat dazu richtigText (nach richtiger Antwort) und loesungText (nach zwei Fehlversuchen).
   Ein Schritt mit vermutung: true wird nicht gewertet: Das Kind legt sich fest, danach zeigt die Bühne das Ergebnis.

   Regeln: Lösungen rechnen die Stationen mit LU.zeit, hier wird nur verglichen. Zwei Versuche je Schritt, dann die Lösung.
   Eine Aufgabe ist geschafft, wenn keine Lösung gezeigt werden musste. Gespeichert werden nur runden und stempel.
   Kein Zeitdruck. Fremde Texte gibt es nicht; alle Texte laufen durch esc(). */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  LU.stationen = LU.stationen || {};
  const C = () => LU.config;
  const T = () => LU.teile;
  const ST = () => LU.stand;
  const STUFENNAME = { leicht: 'leicht', mittel: 'mittel', knifflig: 'knifflig' };

  /* Tageszeit: drei verschiedene Zeichen, immer mit dem Wort (Mini-Spec Etappe 2, Frage 4) */
  const TAGESZEIT = {
    vormittags: '<path class="tz-meer" d="M8 44h64"/><path class="tz-sonne" d="M24 44a16 16 0 0 1 32 0z"/><path class="tz-strahl" d="M40 18v-8M22 26l-6-6M58 26l6-6M14 40H6M66 40h8"/>',
    nachmittags: '<circle class="tz-sonne" cx="40" cy="26" r="13"/><path class="tz-strahl" d="M40 6v-4M40 50v-4M20 26h-4M64 26h-4M26 12l-3-3M54 12l3-3M26 40l-3 3M54 40l3 3"/><path class="tz-meer" d="M8 54h64"/>',
    nachts: '<path class="tz-mond" d="M46 10a18 18 0 1 0 14 30a15 15 0 0 1-14-30z"/><circle class="tz-stern" cx="18" cy="16" r="2"/><circle class="tz-stern" cx="66" cy="12" r="1.6"/><path class="tz-meer" d="M8 54h64"/>'
  };

  function station(def) {
    const ID = def.id, P = 'm-' + ID;
    let ctx = null, z = null, hilfeStufe = 0;
    const esc = s => ctx.esc(s);
    const kopf = unterzeile => T().kopf(ctx, { titel: def.titel, unterzeile, praefix: 'mo' });
    const SO_GEHTS = offen => T().aufklapper(ctx, { klasse: 'so-gehts', titel: "So geht's", offen, schritte: def.soGehts });
    const AM_TISCH = offen => T().aufklapper(ctx, { klasse: 'am-tisch', titel: def.amTisch.titel, offen, schritte: def.amTisch.schritte, notiz: def.amTisch.notiz });
    const stempelSvg = () => T().stempel(def.stempelMotiv);

    /* ---------- Stufenwahl ---------- */
    function ansichtStufen() {
      z = null;
      const erstes = T().erstesMal(ID);
      ctx.zeigen(`
        ${kopf(def.unterzeile)}
        ${erstes ? `<div class="lumi-satz">${ctx.lumiKlein}<p>${esc(def.einleitung)}</p></div>` : ''}
        ${SO_GEHTS(erstes)}
        ${T().stufenListe(ctx, ID, 'mo', def.stufenText || {})}
        ${AM_TISCH(false)}`, def.titel);
    }

    /* ---------- Runde ---------- */
    function rundeStarten(stufe) {
      z = { stufe, aufgaben: def.aufgaben(stufe, LU.zufall), i: 0, geschafft: [], gespeichertFehler: false };
      aufgabeZeigen();
    }
    const aufgabe = () => z && z.aufgaben[z.i];
    const schritt = () => { const a = aufgabe(); return a && a.schritte[a.zustand.schritt]; };

    function aufgabeZeigen() {
      const a = aufgabe();
      hilfeStufe = 0;
      a.zustand = { schritt: 0, versuche: 0, fertig: false, geschafft: false, loesungGezeigt: false, rueck: '', erkl: '', verlauf: [],
        gewaehlt: [], werte: {}, aktiv: 0, uhren: [], richtigGezeigt: false };
      ctx.zeigen(`
        ${kopf(`Stufe ${STUFENNAME[z.stufe]} · Aufgabe ${z.i + 1} von ${z.aufgaben.length}`)}
        <div class="station-flaeche station-flaeche--${ID}">
          <div class="buehne" id="mo-buehne"></div>
          <section class="papier aufgabe" id="mo-aufgabe" aria-labelledby="mo-frage"></section>
        </div>`, `Aufgabe ${z.i + 1} – ${def.titel}`);
      buehne();
      panel();
    }

    /* ---------- Bühne ---------- */
    function buehne() {
      const a = aufgabe(), s = a.zustand;
      const b = ctx.app.querySelector('#mo-buehne');
      b.textContent = '';
      s.uhren = [];
      const st = schritt();
      const uhrTeile = a.buehne.filter(t => t.typ === 'uhr');
      const reihe = uhrTeile.length > 1 ? document.createElement('div') : null;
      if (reihe) { reihe.className = 'uhren-reihe'; }
      for (const t of a.buehne) {
        if (t.ab !== undefined && s.schritt < t.ab && !s.fertig) continue;
        const fig = document.createElement('figure');
        fig.className = 'buehne-teil buehne-teil--' + t.typ;
        if (t.typ === 'uhr') {
          const stellbar = !!t.stellbar && st && st.typ === 'stellen' && !s.fertig;
          const u = LU.uhr.erstellen(fig, {
            zeit: t.zeit, zahlen: t.zahlen !== false, striche: t.striche !== false, raster: t.raster || 1,
            bedienbar: !!t.stellbar, nurStunde: !!t.nurStunde, falscheStunde: !!t.falscheStunde, klein: uhrTeile.length > 1,
            platzAussen: true, minutenzahlen: !!s.minutenzahlen, sprechweise: C().sprechweise,
            ansagen: t => ctx.ansagen(t)
          });
          if (t.stellbar && !stellbar) u.sperren(true);
          s.uhren.push({ teil: t, u });
          if (t.titel) { const c = document.createElement('figcaption'); c.textContent = t.titel; fig.appendChild(c); }
          (reihe || b).appendChild(fig);
          if (reihe && !reihe.parentNode) b.appendChild(reihe);
          continue;
        }
        if (t.typ === 'zeitstrahl') {
          fig.appendChild(LU.zeitstrahl.zeichnen({ beginn: t.beginn, ende: t.ende, ueberMitternacht: t.ueberMitternacht, spruenge: t.spruenge !== false, summe: s.fertig }));
        } else if (t.typ === 'tageszeit') {
          fig.innerHTML = `<svg class="tageszeit" viewBox="0 0 80 60" aria-hidden="true" focusable="false">${TAGESZEIT[t.wann]}</svg>`;
          const c = document.createElement('figcaption'); c.className = 'tageszeit__wort'; c.textContent = t.wann; fig.appendChild(c);
        } else if (t.typ === 'tabelle') {
          const tab = document.createElement('table'); tab.className = 'fahrplan';
          const cap = document.createElement('caption'); cap.textContent = t.titel; tab.appendChild(cap);
          const kopfZ = document.createElement('tr');
          t.kopf.forEach(k => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = k; kopfZ.appendChild(th); });
          const thead = document.createElement('thead'); thead.appendChild(kopfZ); tab.appendChild(thead);
          const tb = document.createElement('tbody');
          t.zeilen.forEach((zeile, i) => {
            const tr = document.createElement('tr');
            if (t.hervor === i && s.fertig) tr.className = 'fahrplan__hervor';
            zeile.forEach((w, j) => { const td = document.createElement(j === 0 ? 'th' : 'td'); if (j === 0) td.scope = 'row'; td.textContent = w; tr.appendChild(td); });
            tb.appendChild(tr);
          });
          tab.appendChild(tb);
          fig.appendChild(tab);
        } else if (t.typ === 'satz') {
          const p = document.createElement('p'); p.className = 'buehne-satz'; p.textContent = t.text; fig.appendChild(p);
        }
        b.appendChild(fig);
      }
    }
    const stellUhr = () => { const a = aufgabe(); const x = a.zustand.uhren.find(v => v.teil.stellbar); return x && x.u; };

    /* ---------- Aufgabe (Papier) ---------- */
    function karteHtml(st, k, i, s) {
      const gewaehlt = s.gewaehlt.includes(i);
      const zeigeRichtig = (s.fertig || s.schrittFertig) && k.richtig;
      return `<button type="button" class="knopf antwort-knopf${zeigeRichtig ? ' ist-richtig' : ''}${gewaehlt && !k.richtig ? ' ist-gewaehlt' : ''}" data-mo="karte" data-i="${i}"${s.schrittFertig || s.fertig || (gewaehlt && !st.vermutung) ? ' disabled' : ''}${gewaehlt ? ' aria-pressed="true"' : ''}>${esc(k.text)}</button>`;
    }
    function ziffernHtml(st, s) {
      let n = 0;
      const zeilen = st.zeilen.map(zl => `
        <div class="ziffern-zeile">${zl.titel ? `<span class="ziffern-zeile__titel">${esc(zl.titel)}</span>` : ''}
          ${zl.teile.map(t => {
            if (t.text) return `<span class="ziffern-text">${esc(t.text)}</span>`;
            const idx = n++, w = s.werte[t.feld] || '';
            return `<button type="button" class="ziffern-feld${idx === s.aktiv && !s.schrittFertig ? ' ziffern-feld--aktiv' : ''}" data-mo="feld" data-i="${idx}" aria-label="${esc((zl.titel ? zl.titel + ', ' : '') + t.label)}: ${w ? esc(w) : 'leer'}"${s.schrittFertig ? ' disabled' : ''}>${w ? esc(w) : '<span class="ziffern-feld__leer" aria-hidden="true">' + '_'.repeat(t.stellen) + '</span>'}</button>`;
          }).join('')}
        </div>`).join('');
      const voll = st.leerIstNull ? felder(st).some(f => (s.werte[f.feld] || '').length > 0) : felder(st).every(f => (s.werte[f.feld] || '').length > 0);
      const block = s.schrittFertig ? '' : `
        <div class="ziffernblock" role="group" aria-label="Ziffern">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button type="button" class="knopf ziffer" data-mo="ziffer" data-d="${d}">${d}</button>`).join('')}
          <button type="button" class="knopf ziffer ziffer--weg" data-mo="weg" aria-label="Letzte Ziffer löschen">⌫</button>
          <button type="button" class="knopf ziffer" data-mo="ziffer" data-d="0">0</button>
          <button type="button" class="knopf ziffer ziffer--weiter" data-mo="naechstes" aria-label="Nächstes Feld">→</button>
        </div>
        <p class="knopfreihe"><button type="button" class="knopf haupt" data-mo="pruefen"${voll ? '' : ' disabled'}>Prüfen</button></p>`;
      return `<div class="ziffern">${zeilen}</div>${block}`;
    }
    const felder = st => st.zeilen.flatMap(zl => zl.teile.filter(t => t.feld));

    function panel() {
      const a = aufgabe(), s = a.zustand, st = schritt();
      const ziel = ctx.app.querySelector('#mo-aufgabe');
      const weiterKnopf = `<button type="button" class="knopf haupt" data-mo="weiter">${z.i + 1 < z.aufgaben.length ? 'Weiter' : 'Zum Rundenende'}</button>`;
      let antwort = '';
      if (!s.fertig && st) {
        if (st.typ === 'karten') antwort = `<div class="antworten${st.karten.length > 4 ? '' : ' antworten--zwei'}">${st.karten.map((k, i) => karteHtml(st, k, i, s)).join('')}</div>`;
        else if (st.typ === 'stellen') antwort = `<p class="knopfreihe"><button type="button" class="knopf haupt" data-mo="pruefen">Prüfen</button></p>`;
        else if (st.typ === 'ziffern') antwort = ziffernHtml(st, s);
      } else if (s.fertig && st && st.typ === 'karten') {
        antwort = `<div class="antworten${st.karten.length > 4 ? '' : ' antworten--zwei'}">${st.karten.map((k, i) => karteHtml(st, k, i, s)).join('')}</div>`;
      } else if (s.fertig && st && st.typ === 'ziffern') {
        antwort = ziffernHtml(st, s);
      }
      ziel.innerHTML = `
        ${a.lumi ? `<div class="lumi-aussage">${ctx.lumiKlein}<p class="aussage">${esc(a.lumi)}</p></div>` : ''}
        <p class="auftrag" id="mo-frage">${esc(a.auftrag)}</p>
        ${s.verlauf.map(v => `<p class="verlauf">${esc(v)}</p>`).join('')}
        ${st && st.frage && !s.fertig ? `<h2 class="frage-klein">${esc(st.frage)}</h2>` : ''}
        ${antwort}
        <p class="rueckmeldung" id="mo-rueck" role="status">${s.rueck ? esc(s.rueck) : ''}</p>
        ${s.erkl ? `<p class="erklaerung">${esc(s.erkl)}</p>` : ''}
        ${s.fertig ? `<p class="knopfreihe">${weiterKnopf}</p>` : ''}`;
      ziel.classList.toggle('loesung-gezeigt', !!s.loesungGezeigt && s.fertig);
      if (s.leuchte) { T().leuchten(ziel.querySelector('.ist-richtig') || ziel.querySelector('.rueckmeldung')); s.leuchte = false; }
    }

    /* ---------- Bewerten ---------- */
    function melden(a) { const s = a.zustand; ctx.ansagen([s.rueck, s.erkl].filter(Boolean).join(' ')); }
    function schrittErledigt(richtig) {
      const a = aufgabe(), s = a.zustand, st = schritt();
      s.schrittFertig = true;
      if (!richtig && !st.vermutung) s.loesungGezeigt = true;
      if (s.schritt + 1 < a.schritte.length) {
        /* Nächster Schritt: Die Rückmeldung bleibt als Verlauf stehen */
        s.verlauf.push([s.rueck, s.erkl].filter(Boolean).join(' '));
        s.schritt++; s.versuche = 0; s.gewaehlt = []; s.werte = {}; s.aktiv = 0; s.schrittFertig = false; s.rueck = ''; s.erkl = '';
        buehne(); panel();
        const neu = schritt();
        T().fokus(ctx, neu.typ === 'karten' ? '.antwort-knopf' : neu.typ === 'ziffern' ? '.ziffern-feld' : '[data-mo="pruefen"]');
        return;
      }
      s.fertig = true;
      s.geschafft = !s.loesungGezeigt;
      if (s.geschafft) {
        z.geschafft[z.i] = true;
        if (!ST().istVorschau && ST().rundeGeschafft(ID, z.stufe) === false) z.gespeichertFehler = true;
      }
      const u = stellUhr(); if (u) u.sperren(true);
      buehne(); panel();
      T().fokus(ctx, '[data-mo="weiter"]');
    }
    function richtig(st, s) {
      s.rueck = st.vermutung ? (st.richtigText || 'Gut vermutet.') : (st.richtigText || 'Das stimmt.');
      s.erkl = st.erklaerung || '';
      s.leuchte = true;
    }
    function falschZweitesMal(st, s) {
      s.rueck = st.loesungText || 'Schau dir die Lösung an.';
      s.erkl = st.erklaerung || '';
    }

    function karteGewaehlt(i) {
      const a = aufgabe(), s = a.zustand, st = schritt();
      if (st.typ !== 'karten' || s.schrittFertig) return;
      const k = st.karten[i];
      s.gewaehlt.push(i);
      if (st.vermutung) {
        /* Vermutung wird nicht gewertet: festlegen, Ergebnis zeigen */
        s.rueck = k.richtig ? (st.richtigText || 'Deine Vermutung passt.') : (st.andersText || 'Der Zeitstrahl zeigt es genau.');
        s.erkl = st.erklaerung || '';
        melden(a); schrittErledigt(true); return;
      }
      s.versuche++;
      if (k.richtig) { richtig(st, s); melden(a); schrittErledigt(true); return; }
      if (s.versuche < 2) { s.rueck = (st.hinweisKarte && st.hinweisKarte(k)) || 'Noch nicht ganz. Schau noch einmal genau hin.'; s.erkl = ''; panel(); melden(a); T().fokus(ctx, '.antwort-knopf:not([disabled])'); return; }
      falschZweitesMal(st, s); melden(a); schrittErledigt(false);
    }
    function pruefen() {
      const a = aufgabe(), s = a.zustand, st = schritt();
      if (!st || s.schrittFertig) return;
      let ok, hinweis;
      if (st.typ === 'stellen') {
        const u = stellUhr(); const w = u.wert();
        ok = st.pruefe(w); hinweis = st.hinweis ? st.hinweis(w) : '';
        if (!ok && s.versuche >= 1) { u.setze(st.ziel); }
      } else if (st.typ === 'ziffern') {
        const werte = {};
        for (const f of felder(st)) werte[f.feld] = s.werte[f.feld] === undefined || s.werte[f.feld] === '' ? (st.leerIstNull ? 0 : null) : Number(s.werte[f.feld]);
        ok = st.pruefe(werte); hinweis = st.hinweis ? st.hinweis(werte) : '';
        if (!ok && s.versuche >= 1 && st.loesung) { s.werte = {}; for (const [k, v] of Object.entries(st.loesung)) s.werte[k] = String(v); }
      } else return;
      s.versuche++;
      if (ok) { richtig(st, s); melden(a); schrittErledigt(true); return; }
      if (s.versuche < 2) {
        s.rueck = hinweis || 'Noch nicht ganz. Probier es noch einmal.'; s.erkl = '';
        panel(); melden(a);
        T().fokus(ctx, st.typ === 'ziffern' ? '.ziffern-feld' : '.uhr__zeiger--minute, .uhr__zeiger--stunde');
        return;
      }
      falschZweitesMal(st, s); melden(a); schrittErledigt(false);
    }

    /* ---------- Ziffernblock ---------- */
    function ziffer(d) {
      const s = aufgabe().zustand, st = schritt();
      const f = felder(st)[s.aktiv]; if (!f) return;
      const alt = s.werte[f.feld] || '';
      if (alt.length >= f.stellen) { s.werte[f.feld] = String(d); }
      else s.werte[f.feld] = alt + d;
      if (s.werte[f.feld].length >= f.stellen && s.aktiv < felder(st).length - 1) s.aktiv++;
      panel();
      T().fokus(ctx, `[data-mo="ziffer"][data-d="${d}"]`);
    }
    function weg() {
      const s = aufgabe().zustand, st = schritt();
      let f = felder(st)[s.aktiv];
      if (f && !(s.werte[f.feld] || '').length && s.aktiv > 0) { s.aktiv--; f = felder(st)[s.aktiv]; }
      if (f) s.werte[f.feld] = (s.werte[f.feld] || '').slice(0, -1);
      panel(); T().fokus(ctx, '[data-mo="weg"]');
    }
    function feldWaehlen(i) { const s = aufgabe().zustand; s.aktiv = i; panel(); T().fokus(ctx, `[data-mo="feld"][data-i="${i}"]`); }
    function naechstes() { const s = aufgabe().zustand, st = schritt(); s.aktiv = (s.aktiv + 1) % felder(st).length; panel(); T().fokus(ctx, '[data-mo="naechstes"]'); }

    function weiter() {
      if (z.i + 1 < z.aufgaben.length) { z.i++; aufgabeZeigen(); return; }
      const r = T().rundenende(ctx, { id: ID, praefix: 'mo', stufe: z.stufe, geschafft: z.geschafft.filter(Boolean).length, anzahl: z.aufgaben.length, stempelSvg: stempelSvg(), gespeichertFehler: z.gespeichertFehler });
      ctx.zeigen(`${kopf(`Stufe ${STUFENNAME[z.stufe]} · Rundenende`)}${r.html}${AM_TISCH(false)}`, `Rundenende – ${def.titel}`);
      ctx.ansagen(r.text);
      if (r.fehler) ctx.melden(ctx.speicherFehlt);
    }

    /* ---------- Hilfe von Lumi ---------- */
    function hilfeZeigen() {
      const a = aufgabe();
      if (!a) {
        T().dialog(ctx, { titel: 'Tipp von Lumi', inhalt: `<div class="tipp">${ctx.lumiKlein}<p>Wähle eine Stufe. Ich empfehle dir die Stufe mit dem Wort „empfohlen“.</p></div>`, knoepfe: '<button type="button" class="knopf haupt" data-dialog="zu">Ich probiere es</button>' });
        return;
      }
      const s = a.zustand;
      const liste = a.tipps || def.tippsStandard;
      const erlaubt = liste.length >= 3 && !s.versuche && !s.schritt ? liste.length - 1 : liste.length;
      const bis = Math.min(hilfeStufe, erlaubt - 1);
      /* Letzte Hilfe: Minutenzahlen an der Uhr einblenden (für langsamere Kinder) */
      if (bis >= 2 && a.hilfe === 'minutenzahlen' && !s.minutenzahlen && !s.fertig) { s.minutenzahlen = true; s.uhren.forEach(x => x.u.minutenzahlen(true)); }
      T().tippDialog(ctx, { liste, bis, erlaubt, fertig: s.fertig, weiter: () => { hilfeStufe++; hilfeZeigen(); } });
    }

    /* ---------- Bedienung ---------- */
    function bedienen(e) {
      const b = e.target.closest('[data-mo]');
      if (!b || b.disabled) return false;
      const w = b.dataset.mo;
      if (w === 'stufe') rundeStarten(b.dataset.stufe);
      else if (w === 'stufen') ansichtStufen();
      else if (w === 'hilfe') hilfeZeigen();
      else if (w === 'woerter') T().woerter(ctx, `Wörter: ${def.titel}`, def.woerter);
      else if (w === 'karte') karteGewaehlt(Number(b.dataset.i));
      else if (w === 'pruefen') pruefen();
      else if (w === 'ziffer') ziffer(Number(b.dataset.d));
      else if (w === 'weg') weg();
      else if (w === 'feld') feldWaehlen(Number(b.dataset.i));
      else if (w === 'naechstes') naechstes();
      else if (w === 'weiter') weiter();
      else return false;
      return true;
    }
    /* Ziffern auch über die Tastatur (nicht über die Bildschirmtastatur des iPads) */
    function taste(e) {
      const a = aufgabe(); if (!a || !a.zustand || a.zustand.schrittFertig || a.zustand.fertig) return false;
      const st = schritt(); if (!st || st.typ !== 'ziffern') return false;
      if (document.querySelector('dialog[open]')) return false;
      if (/^[0-9]$/.test(e.key)) { ziffer(Number(e.key)); return true; }
      if (e.key === 'Backspace') { weg(); return true; }
      if (e.key === 'Enter' && (st.leerIstNull ? felder(st).some(f => (a.zustand.werte[f.feld] || '').length) : felder(st).every(f => (a.zustand.werte[f.feld] || '').length))) { pruefen(); return true; }
      return false;
    }

    LU.stationen[ID] = {
      id: ID, def, stempelSvg,
      oeffnen(c) { ctx = c; ansichtStufen(); },
      bedienen, taste, aufgabe, zustand: () => z,
      /* für den Rauchtest */
      _runde: stufe => rundeStarten(stufe)
    };
  }

  LU.motor = { station, TAGESZEIT };
})();
