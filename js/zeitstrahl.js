/* Leuchtturmuhr: Zeitstrahl mit Sprüngen (wie Denken und Rechnen 3, gedruckt S. 124: bis zur vollen Stunde, volle Stunden, Rest).
   Klassisches Skript, legt window.LU.zeitstrahl an. Braucht LU.zeit. Getestet in tools/zeitstrahl-test.html.
   - Unten stehen Zeitpunkte (Uhrzeiten), oben über den Bögen Zeitspannen (Dauern). Nie vertauscht.
   - Die Sprünge kommen aus LU.zeit.spruenge, die Summe ist immer die Dauer.
   - Zusätzlich eine Liste in Worten (für Screenreader und zum Mitlesen). Die Summe steht nur mit summe: true da,
     damit sie die Lösung nicht verrät (erst nach dem Lösen).
   - Kein style-Attribut; Lage über SVG-Attribute. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const Z = LU.zeit;
  const NS = 'http://www.w3.org/2000/svg';
  const B = 640, LINKS = 50, RECHTS = 590, Y = 96, MIN_BREITE = 96;
  const el = (name, attr = {}) => { const e = document.createElementNS(NS, name); for (const [k, v] of Object.entries(attr)) e.setAttribute(k, String(v)); return e; };
  const kurz = m => Z.alsUhrzeit(m).replace(' Uhr', '');

  /* x-Positionen: jeder Sprung mindestens MIN_BREITE breit, sonst nach Dauer */
  function lagen(spruenge) {
    const ges = spruenge.reduce((s, x) => s + x.dauer, 0) || 1;
    const roh = spruenge.map(x => Math.max(MIN_BREITE, x.dauer / ges * (RECHTS - LINKS)));
    const f = (RECHTS - LINKS) / roh.reduce((s, x) => s + x, 0);
    const xs = [LINKS];
    roh.forEach(w => xs.push(xs[xs.length - 1] + w * f));
    return xs;
  }

  function zeichnen({ beginn, ende, ueberMitternacht = false, spruenge = true, summe = false }) {
    const liste = Z.spruenge(beginn, ende, { ueberMitternacht });
    if (!liste) throw new Error('Zeitstrahl: Ende vor Beginn');
    const box = document.createElement('div');
    box.className = 'zeitstrahl';
    const svg = el('svg', { class: 'zeitstrahl__svg', viewBox: `0 0 ${B} 150`, 'aria-hidden': 'true', focusable: 'false' });
    const xs = liste.length ? lagen(liste) : [LINKS, RECHTS];
    const punkte = liste.length ? [beginn, ...liste.map(x => x.bis)] : [beginn, ende];
    svg.appendChild(el('line', { class: 'zeitstrahl__linie', x1: LINKS - 24, y1: Y, x2: RECHTS + 24, y2: Y }));
    svg.appendChild(el('path', { class: 'zeitstrahl__pfeil', d: `M${RECHTS + 24} ${Y}l-10 -6v12z` }));
    punkte.forEach((m, i) => {
      const x = xs[i];
      svg.appendChild(el('line', { class: 'zeitstrahl__strich', x1: x, y1: Y - 10, x2: x, y2: Y + 10 }));
      const t = el('text', { class: 'zeitstrahl__zeit' + (i === 0 || i === punkte.length - 1 ? ' zeitstrahl__zeit--rand' : ''), x, y: Y + 36, 'text-anchor': 'middle' });
      t.textContent = `${kurz(m)} Uhr`;
      svg.appendChild(t);
    });
    if (spruenge && liste.length) {
      liste.forEach((sp, i) => {
        const x0 = xs[i] + 4, x1 = xs[i + 1] - 4, mx = (x0 + x1) / 2, h = Math.min(46, (x1 - x0) / 2 + 10);
        svg.appendChild(el('path', { class: 'zeitstrahl__bogen', d: `M${x0} ${Y - 6}Q${mx} ${Y - 6 - h * 1.6} ${x1} ${Y - 6}` }));
        svg.appendChild(el('path', { class: 'zeitstrahl__spitze', d: `M${x1} ${Y - 6}l-9 -3l3 -8z` }));
        const t = el('text', { class: 'zeitstrahl__dauer', x: mx, y: Y - 14 - h * 0.8, 'text-anchor': 'middle' });
        t.textContent = Z.alsDauer(sp.dauer);
        svg.appendChild(t);
      });
    }
    box.appendChild(svg);
    const text = document.createElement('p');
    text.className = 'zeitstrahl__text';
    const ges = Z.dauer(beginn, ende, { ueberMitternacht });
    text.textContent = spruenge && liste.length
      ? `Von ${Z.alsUhrzeit(beginn)} bis ${Z.alsUhrzeit(ende)}: ${liste.map(sp => `${Z.alsDauer(sp.dauer)} bis ${Z.alsUhrzeit(sp.bis)}`).join(', dann ')}.${summe ? ` Zusammen ${Z.alsDauerWorte(ges)}.` : ''}`
      : `Von ${Z.alsUhrzeit(beginn)} bis ${Z.alsUhrzeit(ende)}.`;
    box.appendChild(text);
    return box;
  }

  LU.zeitstrahl = { zeichnen, lagen };
})();
