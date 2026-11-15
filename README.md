# Leuchtturmuhr

Lernplattform zu Uhrzeiten und Zeitspannen für die Klasse 3 (8 bis 9 Jahre), mit einer kniffligen Stufe in Richtung Klasse 4.
Die Kinder lesen Uhren ab und stellen die Zeiger selbst, schreiben Uhrzeiten in beiden Möglichkeiten, rechnen mit Stunden und Minuten, finden die Dauer zwischen Beginn und Ende und lesen Fahrpläne.
Begleiter ist Lumi, ein Laternenfisch. Es gibt keine Punkte, keinen Zeitdruck, keinen Countdown und keine Ranglisten.

**Adresse:** https://setsna.github.io/leuchtturmuhr/ (noch nicht veröffentlicht)

Schwesterseite der [Lernlagune](https://lernlagune.de).

## Stationen

Jede Station hat drei Stufen (leicht, mittel, knifflig). Eine Runde hat sechs Aufgaben, ab fünf geschafften gibt es einen Stempel.

| Station | Was geübt wird |
|---|---|
| Uhrzeit | Uhrzeiten ablesen (Schreib- und Sprechweise), Zeiger stellen, beide Möglichkeiten, Tageszeit, Stundenzeiger-Detektiv |
| Zeitspannen | Viertelstunde, halbe Stunde, Dreiviertelstunde, Stunden und Minuten umrechnen, vergangene Zeit zwischen zwei Uhren, vergleichen |
| Wie lange? | Beginn, Ende, Dauer; erst vermuten, dann Zeitstrahl mit Sprüngen; Verspätung; über Mitternacht in „knifflig“ |
| Hafen | erfundene Fahrpläne: Ankunft, Fahrzeit, Wartezeit, rechtzeitig ankommen, Umsteigen |
| Kann das stimmen? | Lumi behauptet etwas über die Zeit, das Kind prüft und begründet |

Dazu ein Leuchtfeuerbuch mit allen Stempeln und „Das kann ich schon“ und eine Urkunde als PDF, die auf dem Gerät entsteht.

Grundlage ist der Lehrplan Thüringen Mathematik Grundschule (Leitidee Größen und Messen, Größenbereich Zeit). Inhaltliche Vorlage für Art und Stufe der Aufgaben ist das Lehrwerk Denken und Rechnen 3 und 4. Alle Texte, Aufgaben und Fahrpläne sind selbst geschrieben bzw. erfunden.

## Fachliche Grundsätze

- Zeitpunkt und Zeitspanne werden streng getrennt: Uhrzeiten als „09:05 Uhr“, Dauern als „1 h 5 min“.
- Zeit wird intern in ganzen Minuten gerechnet. Jede Lösung wird berechnet, nie aus einer Liste gelesen. Antworten werden per Rechnung geprüft.
- Die Analoguhr ist geometrisch richtig: Der Stundenzeiger wandert mit den Minuten (0,5° je Minute).
- Regionale Sprechweisen zählen beide („Viertel nach drei“ und „viertel vier“).
- Keine Sekunden, keine Zeitzonen, kein Kalender.

## Was liegt wo?

| Datei | Inhalt |
|---|---|
| `index.html` | Grundgerüst der Seite (eine Seite für Anmeldung, Startseite, Stationen, Leuchtfeuerbuch) |
| `js/config.js` | Alle Einstellungen: Stationen, Stufen, Sprechweise, Runde |
| `js/zeit.js` | Zeitbaustein: Uhrzeiten, Dauern, Sprünge, Zeigerwinkel, Sprechweisen |
| `js/uhr.js`, `js/zeitstrahl.js` | Code-Grafiken (SVG): Analoguhr mit ziehbaren Zeigern, Zeitstrahl |
| `js/motor.js`, `js/station-teile.js`, `js/aufgaben-hilfen.js` | gemeinsamer Ablauf und Teile aller Stationen |
| `js/stationen/` | je Station die Aufgaben |
| `js/leuchtfeuerbuch.js`, `js/urkunde.js` | Leuchtfeuerbuch und Urkunde (PDF ohne Bibliothek) |
| `js/lu-stand.js`, `js/konto-*.js` | Stand des Kindes und gemeinsames Konto der Lernlagune |
| `js/app.js`, `js/erwachsene.js` | Ansichten, Bedienung, Erwachsenenbereich |
| `css/` | Farben und Maße (`tokens.css`), Seite, Stationen |
| `bilder/`, `schriften/` | Lumi, Leuchtturm-Hintergrund, App-Symbole; Andika und Libre Caslon Text (OFL, Lizenztexte liegen bei) |

## Anmeldung und Daten

Die Kinder melden sich mit demselben Zugangscode an wie im Perlentaucher. Gespeichert werden in Firebase (`lu_stand/<code>`) nur Stempel und die Zahl der geschafften Aufgaben je Station und Stufe, kein Vorname, keine Antworten, keine gestellten Uhrzeiten. Die Datenbankregeln erlauben genau die 15 festen Schlüssel. Zurücksetzen und Löschen gehen über den Lehrerbereich des Perlentauchers. Einzelheiten stehen in `datenschutz.html`.

## Veröffentlichen

- Hinter jeder lokalen `js`- und `css`-Datei steht `?v=N`. Bei jeder Änderung wird die Zahl in allen HTML-Dateien hochgezählt, sonst laden Geräte alte Fassungen.
- Die `.gitignore` sperrt alles und gibt nur die fertige Seite frei. Neue Dateien oder Ordner auf oberster Ebene dort eintragen.
- Werkzeuge und Tests liegen außerhalb dieses Repositorys und gehen nicht ins Netz.
