/* Leuchtturmuhr: Texte für den Erwachsenenbereich (zwei Aufklapper unter der Startseite).
   Aufbau wie in der Chancenbucht (js/erwachsene.js): Abschnitte mit titel, absaetze [Text], liste [[fett, Text]],
   tabelle { kopf: [..], zeilen: [[..]] }, datenschutzLink. Alles läuft in js/app.js durch esc(), kein HTML in den Texten.
   ENTWURF (15.11.2026), noch nicht von Ingo freigegeben. Gleicher Text in Dateien/Beispiele-Entwuerfe/erwachsene.md.
   Seitenzahlen: gedruckte Seiten von Denken und Rechnen 3 und 4 (gedruckt = PDF-Seite minus 2). */
(() => {
  'use strict';
  const LU = window.LU = window.LU || {};
  const DATEN = 'Die Kinder melden sich mit ihrem Zugangscode an. Es ist derselbe wie beim Perlentaucher. Gespeichert werden unter diesem Code nur die Stempel und die Zahl der geschafften Aufgaben je Station und Stufe. Gestellte Uhrzeiten, Antworten und Vermutungen werden nicht gespeichert. So ist der Stand auf jedem Gerät da, in der Schule und zu Hause. Der Stand liegt zusätzlich im Browser des Geräts, damit auch ohne Internet gearbeitet werden kann. Andere Kinder sehen ihn nicht, eine Auswertung für die Lehrkraft gibt es nicht. Löschen lassen können Sie den Stand über die Lehrkraft.';
  const DATEN_URKUNDE = 'Die Urkunde entsteht auf dem Gerät und wird weder gespeichert noch verschickt.';

  LU.erwachsene = {
    eltern: {
      titel: 'Für Eltern',
      abschnitte: [
        { titel: 'Worum es geht', absaetze: [
          'An der Leuchtturmuhr üben Kinder der Klasse 3 die Uhr: Uhrzeiten ablesen und einstellen, beide Schreibweisen (07:15 Uhr und 19:15 Uhr), Zeitspannen umrechnen, die Dauer zwischen Beginn und Ende berechnen und Fahrpläne lesen.',
          'Dabei lernen sie den Unterschied zwischen einem Zeitpunkt (wann?) und einer Zeitspanne (wie lange?).',
          'Lumi, ein kleiner Laternenfisch, gibt Tipps, ohne die Lösung zu verraten.'
        ] },
        { titel: 'Die Stationen', liste: [
          ['Uhrzeit', 'Uhren ablesen und die Zeiger selbst stellen. Sprechweisen wie „Viertel nach drei“ und „viertel vier“ zählen beide.'],
          ['Zeitspannen', 'Stunden und Minuten umrechnen, Viertelstunde, halbe Stunde, Dreiviertelstunde.'],
          ['Wie lange?', 'Erst vermuten, dann mit Sprüngen am Zeitstrahl die Dauer berechnen.'],
          ['Hafen', 'Erfundene Fahrpläne lesen: Abfahrt, Ankunft, Wartezeit, Umsteigen.'],
          ['Kann das stimmen?', 'Lumi behauptet etwas über die Zeit, Ihr Kind prüft es und begründet.']
        ] },
        { titel: 'Gut zu wissen', absaetze: [
          'Es gibt keinen Zeitdruck, keine Stoppuhr als Wettkampf und keine Rangliste.',
          'Nach zwei Versuchen zeigt die Seite die Lösung mit einer Erklärung. Für eine geschaffte Runde gibt es einen Stempel im Leuchtfeuerbuch.',
          'Regionale Sprechweisen werden alle anerkannt. Ihr Kind bekommt nie eine „falsch“-Rückmeldung, weil es „viertel vier“ statt „Viertel nach drei“ sagt.'
        ] },
        { titel: 'Tipp für zu Hause', absaetze: [
          'Fragen Sie im Alltag: „Wie spät ist es?“ und „Wie lange dauert das noch?“. Lassen Sie Ihr Kind auf einer Zeigeruhr nachsehen.',
          'Beim Backen, beim Fernsehen oder vor dem Schlafengehen: Ihr Kind sagt, wann etwas beginnt und endet, und rechnet die Dauer aus.',
          'Ein Fahrplan von Bus, Bahn oder Fähre ist ein gutes Übungsblatt: Wann kommen wir an? Wie lange warten wir?'
        ] },
        { titel: 'Daten', absaetze: [DATEN, DATEN_URKUNDE], datenschutzLink: true },
        { titel: 'Der Code', absaetze: [
          'Der Code gehört Ihrem Kind. Wer ihn kennt, kann sich damit anmelden. Auf einem fremden Gerät am Ende bitte auf „Abmelden“ tippen.'
        ] }
      ]
    },
    lehrkraefte: {
      titel: 'Für Lehrkräfte',
      abschnitte: [
        { titel: 'Konzept', absaetze: [
          'Leitidee Größen und Messen, Größenbereich Zeit: Zeitpunkt und Zeitspanne unterscheiden, mit der Uhr arbeiten, Uhrzeiten in Sprech- und Schreibweise angeben, mit Zeitspannen rechnen.',
          'Alle Aufgaben werden erzeugt. Jede Lösung wird gerechnet, nicht aus einer Liste gelesen. Antworten werden per Rechnung geprüft: 7:15 und 07:15 Uhr zählen gleich, beide regionalen Sprechweisen ebenso.'
        ] },
        { titel: 'Prinzip und Umsetzung', tabelle: { kopf: ['Prinzip', 'Umsetzung'], zeilen: [
          ['Zeitpunkt und Zeitspanne trennen', 'Uhrzeiten stehen immer als „09:05 Uhr“, Dauern immer als „1 h 5 min“. Die beiden Schreibweisen werden nie vermischt.'],
          ['Tun statt lesen', 'Zeiger ziehen oder mit Knöpfen stellen, Kärtchen tippen, Ziffern über einen eigenen Ziffernblock.'],
          ['Geometrisch richtige Uhr', 'Der Stundenzeiger wandert mit den Minuten. Im „knifflig“ zeigt nur der Stundenzeiger die Zeit.'],
          ['Vermuten, dann prüfen', 'Bei der Dauer legt sich das Kind erst fest (kürzer, genau oder länger als eine Stunde), dann erscheint der Zeitstrahl mit Sprüngen.'],
          ['Regionale Sprechweisen', '„Viertel nach drei“ und „viertel vier“, „Viertel vor vier“ und „dreiviertel vier“ zählen gleich.'],
          ['Differenzierung', 'Drei Stufen je Station. Die Seite empfiehlt eine, das Kind wählt. Lumi gibt gestufte Tipps, zuletzt Minutenzahlen an der Uhr.'],
          ['Kein Zeitdruck', 'Kein Countdown, keine Rangliste, keine Punkte. Stempel für geschaffte Runden.'],
          ['Am Tisch', 'Zu jeder Station eine Idee mit Lernuhr, Klassenuhr oder Fahrplan.']
        ] } },
        { titel: 'Die Stationen und das Heft', absaetze: ['Denken und Rechnen 3 und 4, gedruckte Seiten. Aufgaben nach Art und Stufe, nichts abgeschrieben.'], liste: [
          ['Uhrzeit', 'Uhrzeiten lesen, beide Möglichkeiten, Uhren ohne Zahlen. Knüpft an Denken und Rechnen 3, S. 123 an.'],
          ['Zeitspannen', 'Viertelstunde, halbe Stunde, Dreiviertelstunde; Stunden und Minuten umrechnen; vergangene Zeit zwischen zwei Uhren. Knüpft an Denken und Rechnen 3, S. 124 an.'],
          ['Wie lange?', 'Beginn, Ende, Dauer in Tabellen, Verspätung. Knüpft an Denken und Rechnen 3, S. 125 und 126 an.'],
          ['Hafen', 'Fahrpläne mit Abfahrt, Ankunft, Wartezeit und Umsteigen. Knüpft an Denken und Rechnen 4, S. 86 und 87 an; „knifflig“ ist Klasse-4-Niveau.'],
          ['Kann das stimmen?', 'Behauptungen prüfen und begründen. Knüpft an die Kästen „Kann das stimmen?“ in Denken und Rechnen 3, S. 123 und 126 an.']
        ] },
        { titel: 'Lehrplanbezug', absaetze: [
          'LP Thüringen Mathematik (Erprobungsfassung 2026), Leitidee Größen und Messen, S. 18 und 19: im Größenbereich Zeit zwischen Zeitpunkt und Zeitspanne unterscheiden, mit Uhr und Kalender arbeiten, Uhrzeiten in Sprech- und Schreibweise angeben; Fachwortschatz viertel, halb, dreiviertel, um, dauert kürzer/länger als, ist früher/später als. Klasse 3 legt das Schulcurriculum fest. Der LP nennt nur Schuleingangsphase und Klassenstufe 4.',
          'Nicht enthalten: Sekunden (im LP erst Klassenstufe 4), Kalender, Zeitzonen.'
        ] },
        { titel: 'Einsatz', absaetze: [
          'Gut als Station im Wochenplan oder zum Üben nach der Einführung an der Lernuhr.',
          'Erst am Tisch mit der Lernuhr, dann am Gerät üben. Beides zusammen wirkt besser als jedes allein.'
        ] },
        { titel: 'Daten', absaetze: [DATEN, DATEN_URKUNDE], datenschutzLink: true }
      ]
    }
  };
})();
