/* Leuchtturmuhr: Leuchtfeuerbuch (Etappe 5) mit Stempel-Tafel, „Das kann ich schon“ und Urkunde.
   Aufbau wie das Logbuch der Chancenbucht (js/logbuch.js). Klassisches Skript, legt window.LU.buch an.
   Gelesen wird nur stempel. Keine Zahlen, keine Zeit, keine Rangliste.
   Urkunde ab leicht und mittel in allen fünf Stationen (wie Chancenbucht; Frage an Ingo in Ausgaben/Fragen-fuer-Ingo.md).
   Sätze: Entwurf, noch nicht freigegeben. Der Vorname kommt nur über textContent und nur in die Urkunde auf dem Gerät. */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const C = () => LU.config;
  const ST = () => LU.stand;
  const T = () => LU.teile;
  const URKUNDE_STUFEN = ['leicht', 'mittel'];
  const ohneTrenn = s => String(s).replace(/­/g, '');

  const SAETZE = {
    uhr: { leicht: 'Ich lese volle und halbe Stunden ab und stelle sie an der Uhr ein.', mittel: 'Ich lese Uhrzeiten auf 5 Minuten genau und schreibe beide Möglichkeiten auf, zum Beispiel 03:45 Uhr und 15:45 Uhr.', knifflig: 'Ich lese die Uhr auf die Minute genau, auch ohne Zahlen. Ich erkenne die Zeit schon am kurzen Zeiger.' },
    spannen: { leicht: 'Ich weiß: Eine Viertelstunde hat 15 Minuten, eine Stunde 60.', mittel: 'Ich rechne Stunden in Minuten um und Minuten in Stunden und Minuten.', knifflig: 'Ich vergleiche Zeitspannen und finde heraus, wie viel Zeit zwischen zwei Uhren vergangen ist.' },
    dauer: { leicht: 'Ich finde heraus, wie lange etwas dauert, mit Sprüngen am Zeitstrahl.', mittel: 'Ich berechne das Ende, wenn ich Beginn und Dauer kenne.', knifflig: 'Ich berechne auch den Beginn und rechne über Mitternacht.' },
    fahrplan: { leicht: 'Ich lese in einem Fahrplan Abfahrt und Ankunft.', mittel: 'Ich berechne Fahrzeit und Wartezeit.', knifflig: 'Ich plane eine Fahrt mit Umsteigen.' },
    stimmt: { leicht: 'Ich prüfe, ob eine Uhr und ein Satz zusammenpassen.', mittel: 'Ich erkenne Uhrzeiten, die es nicht gibt.', knifflig: 'Ich finde Fehler an einer Uhr und begründe sie.' }
  };

  const anzahlStempel = () => ST().SCHLUESSEL.filter(k => { const [s, st] = k.split(':'); return ST().hatStempel(s, st); }).length;
  const fehlend = () => C().stationen.flatMap(s => URKUNDE_STUFEN.filter(st => !ST().hatStempel(s.id, st)).map(st => `${ohneTrenn(s.name)} (${st})`));
  const urkundeBereit = () => fehlend().length === 0;
  const verdienteSaetze = () => C().stationen.flatMap(s => C().stufen.filter(st => ST().hatStempel(s.id, st)).map(st => ({ station: s.id, stufe: st, satz: SAETZE[s.id][st] })));
  const motiv = id => (LU.stationen && LU.stationen[id] && LU.stationen[id].stempelSvg) ? LU.stationen[id].stempelSvg() : T().stempel('');

  let ctx = null, urkundeUrl = null, urkundeDatei = null;
  function zeigen(c) {
    ctx = c;
    const esc = ctx.esc;
    const stationen = C().stationen;
    const saetze = verdienteSaetze();
    const fehlt = fehlend();
    const urkundeHtml = `
      <section class="papier logbuch" aria-labelledby="lb-urkunde">
        <h2 id="lb-urkunde">Urkunde</h2>
        ${fehlt.length ? `<p>Die Urkunde gibt es, wenn du in jeder Station leicht und mittel geschafft hast.</p><p>Dir fehlen noch: ${esc(fehlt.join(', '))}.</p>`
          : `<p>Du hast in jeder Station leicht und mittel geschafft. Du kannst dir eine Urkunde machen.</p>
             <p class="knopfreihe"><button type="button" class="knopf haupt" data-lb="urkunde">Urkunde erstellen</button></p>
             <p id="lb-status" role="status"></p>
             <p class="knopfreihe" id="lb-fertig" hidden>
               <a class="knopf haupt" id="lb-ansehen" href="#" target="_blank" rel="noopener">Urkunde ansehen</a>
               <button type="button" class="knopf" data-lb="teilen" id="lb-teilen" hidden>Teilen</button>
             </p>
             <p class="leise">Die Urkunde macht das Gerät selbst. Sie wird nicht gespeichert und nicht verschickt.</p>`}
      </section>`;
    ctx.zeigen(`
      <header class="kopf kopf--station">
        <div class="kopf__reihe">
          ${T().PFEIL}
          <div class="kopf__mitte">
            <h1>Mein ${esc(C().sammelbuch)}</h1>
            <p class="unterzeile">Hier steht, was du schon kannst.</p>
          </div>
          <div class="kopf__werkzeug"></div>
        </div>
      </header>
      ${fehlt.length ? '' : urkundeHtml}
      <section class="papier logbuch" aria-labelledby="lb-stempel">
        <h2 id="lb-stempel">Meine Stempel</h2>
        <ul class="logbuch__tafel">
          ${stationen.map(s => `
            <li class="logbuch__zeile">
              <h3 class="logbuch__station">${esc(s.name)}</h3>
              <ul class="logbuch__stempel" aria-label="${esc(ohneTrenn(s.name))}: ${C().stufen.map(st => `${st} ${ST().hatStempel(s.id, st) ? 'geschafft' : 'noch offen'}`).join(', ')}">
                ${C().stufen.map(st => `<li class="logbuch__stufe${ST().hatStempel(s.id, st) ? ' logbuch__stufe--voll' : ''}" aria-hidden="true">
                  <span class="logbuch__bild">${ST().hatStempel(s.id, st) ? motiv(s.id) : ''}</span>
                  <span class="logbuch__wort">${esc(st)}</span>
                  ${ST().hatStempel(s.id, st) ? '' : '<span class="logbuch__offen">noch offen</span>'}
                </li>`).join('')}
              </ul>
              <button type="button" class="knopf logbuch__hin" data-aktion="station" data-id="${esc(s.id)}">Zur Station</button>
            </li>`).join('')}
        </ul>
      </section>
      <section class="papier logbuch" aria-labelledby="lb-kann">
        <h2 id="lb-kann">Das kann ich schon</h2>
        ${saetze.length ? `<ul class="logbuch__kann">${stationen.filter(s => saetze.some(x => x.station === s.id)).map(s => `
          <li><h3>${esc(s.name)}</h3><ul>${saetze.filter(x => x.station === s.id).map(x => `<li>${esc(x.satz)}</li>`).join('')}</ul></li>`).join('')}</ul>`
          : '<p>Hier stehen bald deine ersten Sätze. Such dir eine Station aus.</p>'}
      </section>
      ${fehlt.length ? urkundeHtml : ''}`, `Mein ${C().sammelbuch}`);
  }

  async function urkundeErstellen(knopf) {
    if (!urkundeBereit()) return;
    const status = ctx.app.querySelector('#lb-status'), fertig = ctx.app.querySelector('#lb-fertig');
    const ansehen = ctx.app.querySelector('#lb-ansehen'), teilen = ctx.app.querySelector('#lb-teilen');
    knopf.disabled = true;
    status.textContent = 'Deine Urkunde wird gemacht …';
    try {
      const k = ST().aktiv();
      const r = await LU.urkunde.erstellen({
        name: (k && k.name) || 'Uhrenprofi', datum: new Date(),
        stationen: C().stationen.map(s => ({ id: s.id, name: ohneTrenn(s.name) })), stufen: C().stufen.slice(),
        hat: (id, st) => ST().hatStempel(id, st), saetze: verdienteSaetze(),
        lumiSrc: `bilder/lumi-512.jpg?b=${C().bildStand}`,
        motiv: id => (LU.stationen && LU.stationen[id] && LU.stationen[id].stempelSvg) ? LU.stationen[id].stempelSvg() : null
      });
      if (urkundeUrl) URL.revokeObjectURL(urkundeUrl);
      urkundeUrl = URL.createObjectURL(r.blob);
      ansehen.href = urkundeUrl;
      ansehen.setAttribute('download', r.dateiname);
      urkundeDatei = typeof File === 'function' ? new File([r.blob], r.dateiname, { type: 'application/pdf' }) : null;
      teilen.hidden = !(urkundeDatei && navigator.canShare && navigator.canShare({ files: [urkundeDatei] }));
      fertig.hidden = false;
      status.textContent = 'Deine Urkunde ist fertig.';
      LU.urkunde.letzte = r;   /* nur für den Rauchtest */
      ansehen.focus();
    } catch (e) {
      status.textContent = 'Die Urkunde konnte gerade nicht gemacht werden. Versuch es noch einmal.';
    }
    knopf.disabled = false;
  }
  async function urkundeTeilen() {
    const status = ctx.app.querySelector('#lb-status');
    if (!urkundeDatei || !navigator.share) return;
    try { await navigator.share({ files: [urkundeDatei], title: 'Meine Urkunde' }); status.textContent = 'Geteilt.'; }
    catch (e) { if (!e || e.name !== 'AbortError') status.textContent = 'Teilen klappt hier gerade nicht. Tippe auf „Urkunde ansehen“.'; }
  }

  function bedienen(e) {
    const b = e.target.closest('[data-lb]');
    if (!b || b.disabled) return false;
    if (b.dataset.lb === 'urkunde') urkundeErstellen(b);
    else if (b.dataset.lb === 'teilen') urkundeTeilen();
    else return false;
    return true;
  }

  LU.buch = { SAETZE, URKUNDE_STUFEN, zeigen, bedienen, anzahlStempel, fehlend, urkundeBereit, verdienteSaetze };
})();
