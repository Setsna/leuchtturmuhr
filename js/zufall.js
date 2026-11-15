/* Leuchtturmuhr: Zufall für das Erzeugen von Aufgaben.
   Klassisches Skript, legt window.LU.zufall an.
   - Quelle: crypto.getRandomValues, ganze Zahlen ohne Schieflage (Verwerfen statt Rest), wie in der Chancenbucht.
   - Fester Startwert (mulberry32) nur für Tests (mitStartwert(n)) und auf localhost über ?startwert=N.
   - Der Zufall bestimmt nur, WELCHE Aufgabe kommt. Die Lösung wird immer mit LU.zeit berechnet. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const ZWEI32 = 4294967296;

  function cryptoQuelle() {
    const puffer = new Uint32Array(256); let i = puffer.length;
    return () => { if (i >= puffer.length) { crypto.getRandomValues(puffer); i = 0; } return puffer[i++]; };
  }
  function startwertQuelle(startwert) {
    let a = startwert >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return (t ^ (t >>> 14)) >>> 0; };
  }
  function baue(quelle, name) {
    /* ganze Zahl in [0, n) ohne Schieflage */
    function zahl(n) {
      if (!Number.isInteger(n) || n < 1 || n > ZWEI32) throw new Error('zahl(n): n muss eine ganze Zahl von 1 bis 2^32 sein');
      const grenze = ZWEI32 - (ZWEI32 % n);
      let x; do { x = quelle(); } while (x >= grenze);
      return x % n;
    }
    const zwischen = (a, b) => a + zahl(b - a + 1);           /* ganze Zahl in [a, b] */
    const waehle = liste => liste[zahl(liste.length)];
    function mische(liste) {
      const l = liste.slice();
      for (let i = l.length - 1; i > 0; i--) { const j = zahl(i + 1); [l[i], l[j]] = [l[j], l[i]]; }
      return l;
    }
    return { quelle: name, zahl, zwischen, waehle, mische };
  }

  const LOKAL = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const sw = LOKAL ? new URLSearchParams(location.search).get('startwert') : null;
  const standard = sw !== null && /^\d{1,9}$/.test(sw)
    ? baue(startwertQuelle(Number(sw)), 'startwert')
    : (window.crypto && crypto.getRandomValues ? baue(cryptoQuelle(), 'crypto') : baue(() => Math.floor(Math.random() * ZWEI32) >>> 0, 'Math.random'));

  LU.zufall = Object.assign({}, standard, { mitStartwert: n => baue(startwertQuelle(n), 'startwert') });
})();
