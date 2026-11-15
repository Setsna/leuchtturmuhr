/* Leuchtturmuhr: die Analoguhr als SVG (Etappe 1c). Getestet in tools/uhr-test.html.
   Klassisches Skript, legt window.LU.uhr an. Braucht LU.zeit (js/zeit.js).

   LU.uhr.erstellen(behaelter, optionen) → { wert(), setze(m), element, zerstoeren() }
     optionen.zeit          Zeitpunkt in Minuten (0–1439), Start
     optionen.zahlen        Zahlen 1–12 zeigen (Standard: ja; „knifflig“ ohne Zahlen wie Buch K3 S. 123, Aufg. 3)
     optionen.striche       Minutenstriche zeigen (Standard: ja; Stundenstriche sind immer da)
     optionen.raster        Einrasten des Minutenzeigers in Minuten (1, 5, 15, 30), auch Schrittweite der Tasten
     optionen.bedienbar     Zeiger ziehen und Tasten (Standard: nein, dann nur Anzeige)
     optionen.beiAenderung  function(m) nach jeder Änderung
     optionen.ansagen       function(text) für den aria-live-Bereich (z. B. LU.ansagen), nach Loslassen oder Taste
     optionen.sprechweise   'nach' oder 'ost' (wie Lumi die Zeit ansagt)
     optionen.platzAussen   Rand für Minutenzahlen freihalten (Stationen: ja, damit die Hilfe sie später einblenden kann)
     optionen.minutenzahlen Minutenzahlen 0, 5 … 55 außen zeigen (Hilfe für langsamere Kinder)
     optionen.nurStunde     nur der Stundenzeiger (Stundenzeiger-Detektiv)
     optionen.falscheStunde Stundenzeiger absichtlich genau auf der Zahl (nur „Kann das stimmen?“: Fehler finden)
     optionen.klein         kleinere Darstellung (zwei Uhren nebeneinander)

   Regeln (Projekt-CLAUDE.md):
   - Winkel kommen nur aus LU.zeit.zeigerWinkel (Stundenzeiger wandert mit den Minuten).
   - Ziehen ist nie die einzige Bedienung: Jeder Zeiger ist ein Schieberegler (role="slider", Pfeiltasten),
     dazu vier echte Knöpfe. Ziehen nur über Pointer-Events, touch-action: none nur auf dem Zifferblatt.
   - Zeiger unterscheiden sich in Länge und Form, nicht nur in der Farbe.
   - Kein style-Attribut (strenge CSP): Lage über das SVG-Attribut transform, Aussehen über CSS-Klassen.
     Die Zeiger springen ohne Animation, das passt auch zu prefers-reduced-motion. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit;
  const NS = 'http://www.w3.org/2000/svg';
  const M = 100;                 /* Mittelpunkt im viewBox 0 0 200 200 */
  const R_ZAHL = 72;

  const el = (name, attr = {}, kinder = []) => {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attr)) e.setAttribute(k, String(v));
    for (const k of kinder) e.appendChild(k);
    return e;
  };
  const punkt = (winkel, r) => {
    const b = winkel * Math.PI / 180;
    return { x: M + r * Math.sin(b), y: M - r * Math.cos(b) };
  };
  const r2 = x => Math.round(x * 100) / 100;

  /* ---------- Beschreibung in Worten (für aria-valuetext und aria-live) ---------- */
  const zahlAmBlatt = n => (n % 12) || 12;
  function stundenzeigerText(m) {
    const z = Z.zifferblatt(m), h = Math.floor(z / 60), min = z % 60;
    if (min === 0) return `Stundenzeiger auf der ${zahlAmBlatt(h)}`;
    return `Stundenzeiger zwischen der ${zahlAmBlatt(h)} und der ${zahlAmBlatt(h + 1)}`;
  }
  function minutenzeigerText(m) {
    const min = Z.minute(m);
    if (min % 5 === 0) return `Minutenzeiger auf der ${zahlAmBlatt(min / 5)}`;
    return `Minutenzeiger zwischen der ${zahlAmBlatt(Math.floor(min / 5))} und der ${zahlAmBlatt(Math.floor(min / 5) + 1)}`;
  }
  function beschreibung(m, sprechweise = 'nach') {
    return `Es ist ${Z.lumiSagt(m, sprechweise)}. Der ${minutenzeigerText(m).replace('Minutenzeiger', 'Minutenzeiger steht')}, der ${stundenzeigerText(m)}.`;
  }

  /* ---------- Zifferblatt ---------- */
  function zifferblatt({ zahlen, striche }) {
    const g = el('g', { class: 'uhr__blatt' });
    g.appendChild(el('circle', { class: 'uhr__rand', cx: M, cy: M, r: 96 }));
    for (let i = 0; i < 60; i++) {
      const voll = i % 5 === 0;
      if (!voll && !striche) continue;
      const a = punkt(i * 6, voll ? 82 : 87), b = punkt(i * 6, 92);
      g.appendChild(el('line', { class: voll ? 'uhr__strich uhr__strich--stunde' : 'uhr__strich', x1: r2(a.x), y1: r2(a.y), x2: r2(b.x), y2: r2(b.y) }));
    }
    if (zahlen) {
      for (let n = 1; n <= 12; n++) {
        const p = punkt(n * 30, R_ZAHL);
        const t = el('text', { class: 'uhr__zahl', x: r2(p.x), y: r2(p.y), 'text-anchor': 'middle', 'dominant-baseline': 'central', 'data-zahl': n });
        t.textContent = String(n);
        g.appendChild(t);
      }
    }
    return g;
  }

  /* Zeiger zeigen beim Zeichnen auf die 12 und werden dann um den Mittelpunkt gedreht.
     Stundenzeiger: kurz (Spitze bei r 48), breit, stumpf. Minutenzeiger: lang (Spitze bei r 82), schmal, spitz. */
  const ZEIGER = {
    stunde: { laenge: 48, d: `M${M - 4.5} ${M + 10} L${M - 4.5} ${M - 40} Q${M} ${M - 50} ${M + 4.5} ${M - 40} L${M + 4.5} ${M + 10} Z` },
    minute: { laenge: 82, d: `M${M - 2.5} ${M + 14} L${M - 2.5} ${M - 68} L${M} ${M - 82} L${M + 2.5} ${M - 68} L${M + 2.5} ${M + 14} Z` }
  };

  function erstellen(behaelter, o = {}) {
    const opt = {
      zeit: 0, zahlen: true, striche: true, raster: 1, bedienbar: false,
      beiAenderung: null, ansagen: null, sprechweise: 'nach', ...o
    };
    let m = Z.istZeitpunkt(opt.zeit) ? opt.zeit : 0;
    const RAND = opt.platzAussen || opt.minutenzahlen ? 20 : 0;
    const VB = 200 + 2 * RAND;

    const wurzel = document.createElement('div');
    wurzel.className = 'uhr' + (opt.bedienbar ? ' uhr--bedienbar' : '') + (opt.klein ? ' uhr--klein' : '');
    const svg = el('svg', { class: 'uhr__svg', viewBox: `${-RAND} ${-RAND} ${VB} ${VB}`, role: 'group', 'aria-label': opt.nurStunde ? 'Uhr, nur der Stundenzeiger ist zu sehen' : 'Uhr mit Zeigern' });
    svg.appendChild(zifferblatt(opt));
    const minZahlen = el('g', { class: 'uhr__minutenzahlen' });
    for (let i = 0; i < 12; i++) {
      const p = punkt(i * 30, 108);
      const t = el('text', { class: 'uhr__minutenzahl', x: r2(p.x), y: r2(p.y), 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      t.textContent = String(i * 5);
      minZahlen.appendChild(t);
    }
    svg.appendChild(minZahlen);
    const minutenzahlen = an => { minZahlen.setAttribute('visibility', an && RAND ? 'visible' : 'hidden'); };
    minutenzahlen(opt.minutenzahlen);

    const zeiger = {};
    for (const art of ['stunde', 'minute']) {
      const g = el('g', { class: `uhr__zeiger uhr__zeiger--${art}`, 'data-zeiger': art });
      /* breiter, unsichtbarer Griff, damit der Finger den Zeiger trifft */
      g.appendChild(el('line', { class: 'uhr__griff', x1: M, y1: M, x2: M, y2: M - ZEIGER[art].laenge }));
      g.appendChild(el('path', { class: 'uhr__form', d: ZEIGER[art].d }));
      if (opt.bedienbar) {
        g.setAttribute('role', 'slider');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-label', art === 'stunde' ? 'Stundenzeiger, kurz' : 'Minutenzeiger, lang');
        g.setAttribute('aria-valuemin', '0');
        g.setAttribute('aria-valuemax', art === 'stunde' ? '11' : '59');
      }
      zeiger[art] = g;
    }
    /* Minutenzeiger unter dem Stundenzeiger, damit der kurze Zeiger greifbar bleibt */
    if (!opt.nurStunde) svg.appendChild(zeiger.minute);
    svg.appendChild(zeiger.stunde);
    svg.appendChild(el('circle', { class: 'uhr__mitte', cx: M, cy: M, r: 5 }));
    wurzel.appendChild(svg);

    /* Vier echte Knöpfe als zweite Bedienung */
    let tasten = null;
    if (opt.bedienbar) {
      tasten = document.createElement('div');
      tasten.className = 'uhr__tasten';
      const knopf = (aktion, sichtbar, label) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'knopf uhr__taste';
        b.dataset.uhr = aktion;
        b.setAttribute('aria-label', label);
        b.textContent = sichtbar;
        return b;
      };
      const schritt = opt.raster === 1 ? '1 Minute' : `${opt.raster} Minuten`;
      tasten.append(
        knopf('stunde-', 'Stunde −', 'Stunde zurück'), knopf('stunde+', 'Stunde +', 'Stunde vor'),
        knopf('minute-', 'Minute −', `${schritt} zurück`), knopf('minute+', 'Minute +', `${schritt} vor`)
      );
      wurzel.appendChild(tasten);
    }
    behaelter.appendChild(wurzel);

    function zeichnen() {
      const w = Z.zeigerWinkel(m);
      const ws = opt.falscheStunde ? Math.floor(w.stunde / 30) * 30 : w.stunde;
      zeiger.stunde.setAttribute('transform', `rotate(${ws} ${M} ${M})`);
      zeiger.minute.setAttribute('transform', `rotate(${w.minute} ${M} ${M})`);
      zeiger.stunde.dataset.winkel = String(ws);
      zeiger.minute.dataset.winkel = String(w.minute);
      svg.setAttribute('data-zeit', String(m));
      if (opt.bedienbar) {
        zeiger.stunde.setAttribute('aria-valuenow', String(Math.floor(Z.zifferblatt(m) / 60)));
        zeiger.stunde.setAttribute('aria-valuetext', stundenzeigerText(m));
        zeiger.minute.setAttribute('aria-valuenow', String(Z.minute(m)));
        zeiger.minute.setAttribute('aria-valuetext', minutenzeigerText(m));
      }
    }
    function aendern(neu, ansage) {
      if (!Z.istZeitpunkt(neu)) return;
      const anders = neu !== m;
      m = neu;
      zeichnen();
      if (anders && opt.beiAenderung) opt.beiAenderung(m);
      if (ansage && opt.ansagen) opt.ansagen(beschreibung(m, opt.sprechweise));
    }

    /* ---------- Tasten ---------- */
    const minSchritt = Math.max(1, opt.raster);
    /* Mit Raster: zum nächsten Rasterpunkt in die Richtung (aus 3:07 wird mit Raster 5 3:10 bzw. 3:05) */
    function minuteSchritt(richtung) {
      const r = Z.minute(m) % minSchritt;
      const d = richtung > 0 ? minSchritt - r : -(r || minSchritt);
      return Z.schritt(m, d);
    }
    function tastenKlick(e) {
      const b = e.target.closest('[data-uhr]');
      if (!b) return;
      const a = b.dataset.uhr;
      if (a === 'stunde+') aendern(Z.schritt(m, 60), true);
      else if (a === 'stunde-') aendern(Z.schritt(m, -60), true);
      else if (a === 'minute+') aendern(minuteSchritt(1), true);
      else if (a === 'minute-') aendern(minuteSchritt(-1), true);
    }
    function taste(e) {
      if (gesperrt) return;
      const art = e.currentTarget.dataset.zeiger;
      const vor = ['ArrowUp', 'ArrowRight'].includes(e.key), zurueck = ['ArrowDown', 'ArrowLeft'].includes(e.key);
      if (!vor && !zurueck) return;
      e.preventDefault();
      if (art === 'stunde') aendern(Z.schritt(m, vor ? 60 : -60), true);
      else aendern(minuteSchritt(vor ? 1 : -1), true);
    }

    /* ---------- Ziehen ---------- */
    let gezogen = null, gesperrt = false;
    function winkelVon(e) {
      const r = svg.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * VB - RAND - M, y = (e.clientY - r.top) / r.height * VB - RAND - M;
      return { winkel: (Math.atan2(x, -y) * 180 / Math.PI + 360) % 360, abstand: Math.hypot(x, y) };
    }
    function runter(e) {
      if (gesperrt) return;
      if (e.button !== undefined && e.button !== 0) return;
      const { winkel, abstand } = winkelVon(e);
      if (abstand > 100) return;
      /* Getroffener Zeiger, sonst der Zeiger, dessen Richtung näher liegt (bei Gleichstand der Minutenzeiger) */
      const ziel = e.target.closest && e.target.closest('[data-zeiger]');
      let art = ziel ? ziel.dataset.zeiger : null;
      if (!art) {
        const w = Z.zeigerWinkel(m), nah = a => Math.min(Math.abs(a - winkel), 360 - Math.abs(a - winkel));
        art = nah(w.stunde) < nah(w.minute) ? 'stunde' : 'minute';
      }
      gezogen = { art, id: e.pointerId };
      wurzel.classList.add('uhr--zieht');
      zeiger[art].classList.add('uhr__zeiger--aktiv');
      try { svg.setPointerCapture(e.pointerId); } catch (x) { /* Testereignisse haben keinen echten Zeiger */ }
      e.preventDefault();
      bewegen(e);
    }
    function bewegen(e) {
      if (!gezogen || e.pointerId !== gezogen.id) return;
      const { winkel } = winkelVon(e);
      aendern(gezogen.art === 'minute' ? Z.minutenzeigerGezogen(m, winkel, opt.raster) : Z.stundenzeigerGezogen(m, winkel, opt.raster), false);
    }
    function hoch(e) {
      if (!gezogen || e.pointerId !== gezogen.id) return;
      zeiger[gezogen.art].classList.remove('uhr__zeiger--aktiv');
      gezogen = null;
      wurzel.classList.remove('uhr--zieht');
      try { svg.releasePointerCapture(e.pointerId); } catch (x) { /* egal */ }
      if (opt.ansagen) opt.ansagen(beschreibung(m, opt.sprechweise));
    }

    if (opt.bedienbar) {
      svg.addEventListener('pointerdown', runter);
      svg.addEventListener('pointermove', bewegen);
      svg.addEventListener('pointerup', hoch);
      svg.addEventListener('pointercancel', hoch);
      zeiger.stunde.addEventListener('keydown', taste);
      zeiger.minute.addEventListener('keydown', taste);
      tasten.addEventListener('click', tastenKlick);
    }
    zeichnen();

    return {
      element: wurzel,
      wert: () => m,
      setze: neu => aendern(neu, false),
      beschreibung: () => beschreibung(m, opt.sprechweise),
      minutenzahlen,
      sperren: an => { wurzel.classList.toggle('uhr--gesperrt', !!an); tasten && tasten.querySelectorAll('button').forEach(b => { b.disabled = !!an; }); for (const z of Object.values(zeiger)) { if (an) z.removeAttribute('tabindex'); else if (opt.bedienbar) z.setAttribute('tabindex', '0'); } gesperrt = !!an; },
      zerstoeren: () => wurzel.remove()
    };
  }

  LU.uhr = { erstellen, beschreibung, stundenzeigerText, minutenzeigerText, ZEIGER };
})();
