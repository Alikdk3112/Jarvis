# JARVIS — Design-Spezifikation „LEDGER"

> Erarbeitet gegen die vorgegebene Design-Richtung. Drei unabhängige
> Systementwürfe (editorial / Messgerät / dichtes Datenwerkzeug) wurden
> gegeneinander bewertet und zu einem System verdichtet.
>
> **Herkunft der Teile:** System und die Ansichten Cockpit und Habits
> stammen aus dem Entwurfslauf. Die sieben übrigen Ansichten und die
> Schlussprüfung habe ich selbst geschrieben, nachdem das Monats-
> Ausgabenlimit der Organisation den Lauf abgebrochen hat. Beides ist
> markiert, damit du weißt, was wie entstanden ist.


## Bewertung der drei Entwürfe

**Grundlage: Entwurf 3 (Messgerät mit Kontobuch-Charakter).** Er ist der einzige, der die tatsächliche Datenform der App zum Bauprinzip macht: echte `<table>`-Listen, tabellarische Mono-Ziffern, unbunte Chrome-Ebene, vorberechnete Heatmap-Stufen (keine 140 `color-mix`-Läufe), Tastaturbedienung als Erstklassenbürger, ein vollwertiger heller Zwilling, und Dichtezahlen, die nachrechenbar sind. Er ist zugleich der billigste in Paint-Kosten: kein Verlauf, kein Schatten, kein Deko-Layer.

**Was von Entwurf 2 eingepflanzt wird**
1. Der Sektionskopf als technische Zeichnung: 2×12px Signalstrich in Modulfarbe sitzt auf der 1px-Regel, die 10px-Legende unterbricht die Linie. Das ist die beste Einzelidee der drei — sie ersetzt Kachel, Rahmen und Titelbalken mit drei CSS-Zeilen.
2. Panelgruppen: Sektionen derselben Gruppe stoßen ohne Abstand aneinander, getrennt nur durch 1px; zwischen Gruppen 24px. Ergibt ein durchlaufendes Instrumentenfeld statt einer Kachelwolke.
3. Readout/Legend als festes Paar mit Verhältnis ≥ 2:1 (44/10, 28/10, 20/10) plus die drei Helligkeitsstufen Zahl/Label/Einheit.
4. Randloser Durchlauf der Linien auf 390px (`margin-inline: -12px; padding-inline: 12px`).
5. Wertspalten enden an einer gemeinsamen rechten Kante, Notenwerte am Komma.

**Was von Entwurf 1 eingepflanzt wird**
6. Die Zahlenstimmen-Regel, umgemünzt auf zwei Familien: **höchstens eine Leitzahl (t-28/t-44) pro Sektion**, alles Wiederkehrende in t-12 Mono rechtsbündig. Wer die Regel bricht, erzeugt sichtbaren Lärm.
7. Verhältnis-Weißraum als Gruppierer: 24px über dem Sektionskopf, 8px unter der Regel (3:1) — dadurch braucht keine Sektion einen Rahmen.
8. 2px-Signalstrich im **linken** Rand statt Rotfärbung der ganzen Zeile für Ausnahmen (überfällig, Klausur ≤ 14 Tage).
9. Wörter statt Piktogramme, wo Platz ist: Nav-Icons tragen immer ein Kürzel, `INDEX` ist ein beschrifteter Textknopf, Leerzustand ist ein Satz.
10. Nullwert als En-Dash in --ink-450, nie als fette 0.

**Kollisionen — entschieden und verworfen**
- **Schriftrichtung:** Source Serif 4 (E1) vs. Archivo/Archivo Narrow (E2) vs. Plex Mono/Sans (E3). → **Plex Mono + Plex Sans.** Verworfen: Serife und Archivo. Grund: zwei Familien mit geteilter x-Höhe und Metrik lassen Sans-Titel und Mono-Wert in derselben 28px-Zeile auf eine Grundlinie stellen; eine Serife bei 13px in einer 28px-Zeile verliert genau die Kanten, die diese App braucht, und Archivo Narrow wäre eine dritte geladene Datei ohne Mehrwert gegenüber 10px Mono uppercase. Verworfen wird damit auch E1s Papier-Editorial-Identität als Ganzes.
- **Farbklima:** Papier-hell als Standard (E1) vs. „ein Instrument hat keinen Hellmodus" (E2) vs. Zwilling (E3). → **Zwei vollwertige Themen, dunkel ist Standard**, umschaltbar in Einstellungen, `prefers-color-scheme` als Vorbelegung. Verworfen: E2s Dunkel-Dogma und E1s Hell-Standard.
- **Diagramm-Wells** (E2: `--void`-Fläche, 3px Radius): **verworfen.** Ein Well ist ein wieder eingeführter Behälter. Diagramme sitzen auf dem Seitengrund, 1px-Grundlinie in --line, Radius 0.
- **Millimeterpapier-Hintergrund** (E2): **verworfen.** Ganzflächige Paint-Ebene für null Information — genau die Kategorie, die gemessen teuer war.
- **1-Hz-Statuslampe für „Timer läuft"** (E2): **verworfen.** Das ist eine Dauer-Animation. Ersatz: statisches 4×4px-Quadrat in --m-study plus die mitlaufende Timer-Ziffer, die durch tabellarische Ziffern und feste `ch`-Breite ohne Reflow der Nachbarn aktualisiert.
- **Mono-Gewicht 300** (E3 für t-28/t-44): **verworfen.** Geladen werden genau vier Schnitte (Mono 400/500, Sans 400/600); die großen Zahlen laufen in Mono 400 mit -0.02em.
- **Icon-Größen 12/14px** (E3): **verworfen.** 1,5px-Strich bei 12px verwäscht. Icons erscheinen ausschließlich mit 16px; wo 16px nicht passt, steht ein Wort.
- **Nav-Kürzel 8px** (E3): auf **9px** korrigiert, Mindestfarbe --ink-600.
- **Hero-Ziffer 112px** (E1) / 72px (E2) / 44px (E3): **44px**, weil sie in ein 132px-Ringfeld muss und weil zwei Vorkommen pro App reichen.
- **`--panel` als Fläche** (E3, 1,06:1 zum Grund): behalten, aber nur dort, wo zusätzlich eine 1px-Kante steht (Formularbereich, Modal, Popover). Eine Fläche ohne Kante existiert nicht.


---

# LEDGER — Instrumentensatz für Jarvis

## Leitsätze
- Kein Behälter. Struktur entsteht aus 1px-Haarlinien, einem 2px-Signalstrich und Weißraum im Verhältnis 3:1 (24px über dem Sektionskopf, 8px unter der Regel). Prüfung: `border-radius` > 3px, `box-shadow` mit Versatz, `backdrop-filter` und jede Verlaufsfunktion kommen im gebauten CSS null Mal vor.
- Zwei Familien, zwei Rollen. IBM Plex Sans = was der Nutzer geschrieben hat (Titel, Fließtext). IBM Plex Mono = was das System berechnet hat (jede Zahl, jedes Label, jeder Spaltenkopf). Prüfung: kein Fließtext in Mono, keine Zahl in Sans.
- Höchstens eine Leitzahl (t-28 oder t-44) pro Sektion, höchstens zwei t-44 in der ganzen App (Ring-Prozentzahl, Timer). Alles Wiederkehrende ist t-12 Mono, rechtsbündig, tabellarisch, an einer gemeinsamen rechten Kante. Prüfung: zähle t-28/t-44-Vorkommen pro Ansicht.
- Die Chrome-Ebene ist unbunt. Farbe erscheint an genau vier Stellen: Modul-Label im Sektionskopf, 2px-Zustandsmarke, Datenmarke (Heatmap, Balken, Ring, Fortschritt), Alarm. Kein Knopf, kein Rahmen, keine Fläche trägt jemals eine Modulfarbe. Prüfung: `background` mit Modul-Token existiert nicht.
- Dichte ist die Anforderung, nicht die Sparmaßnahme. 28px-Anzeigezeile, 22px-Kopfzeile, 36px nur für Fingerziele bei `pointer: coarse`. Prüfung: 1440×900 zeigt das Cockpit ohne Scrollen; 390px zeigt mindestens 10 Tabellenzeilen.
- Es gibt genau drei Übergänge im System (120ms Zustand, 240ms Zahlenannäherung, 140ms Seiten-Opacity) und keine einzige Dauer-Animation. Prüfung: `@keyframes` kommt im Projekt null Mal vor; `transform` steht nie auf einem Knoten mit Kindern.
- Jede Ansicht beginnt in Zeile 1 mit Titel und ab Zeile 2 mit Daten oder dem Eingabefeld. Kein Onboarding, kein Erklärsatz, kein Tooltip-Rundgang, kein Leerzustands-Kasten. Prüfung: keine Textfläche über 68 Zeichen, die nicht Briefing, Journal, Notiz oder Fehlermeldung ist.

## Typografie
## Familien (vier geladene Schnitte, self-hosted woff2, `font-display: swap`)

| Familie | Schnitte | Rolle | Fallback |
|---|---|---|---|
| IBM Plex Mono | 400, 500 | Spaltenköpfe, Labels, alle Zahlen, Knopfbeschriftung, Timer, kbd, Nav-Kürzel, Statuszeile | `ui-monospace, "SF Mono", Menlo, Consolas, monospace` |
| IBM Plex Sans | 400, 600 | Zeilentitel, Briefing, Journal, Notizinhalt, Fehlermeldung, Modaltext | `system-ui, "Segoe UI", sans-serif` |

Global: `font-variant-numeric: tabular-nums lining-nums` auf allen Mono-Elementen, `font-feature-settings: "zero" 1` (geschlitzte Null). Keine dritte Familie, kein Kursiv, kein Gewicht ≥ 700, keine Versalien im Fließtext, keine Größe zwischen den Stufen.

## Stufen

| Token | Größe | Familie/Gewicht | Laufweite | Zeilenhöhe | Verwendung |
|---|---|---|---|---|---|
| `--t-9` | 9px | Mono 500, uppercase | +0.14em | 12px | Spaltenkopf in Tabellen, Achsenbeschriftung, Heatmap-Legende, Nav-Kürzel. Nur Wörter ≤ 10 Zeichen. Nie heller als --ink-600. |
| `--t-10` | 10px | Mono 500, uppercase | +0.10em | 14px | Modul-Label im Sektionskopf, Knopfbeschriftung, Statuszeile, kbd-Chip, Tag, Einheit (MIN, KG, ECTS), Legende eines Kennzahl-Paares |
| `--t-11` | 11px | Mono 400 | +0.01em | 15px | sekundäre Zelle: Datum, Wochentag, Fach, Dauer, Metazeile unter einer Aufgabe, Leerzustandszeile |
| `--t-12` | 12px | Mono 400, tnum | 0 | 16px | Standard-Zahlenzelle: Minuten, kg, Wiederholungen, ECTS, Note, Prozent in Listen |
| `--t-13` | 13px | Sans 400 | 0 | 18px | Zeilentitel: Habit-, Aufgaben-, Kurs-, Ziel-, Notiztitel. `text-overflow: ellipsis`, nie Umbruch in Rasterzeilen |
| `--t-15` | 15px | Sans 400 | 0 | 23px | Fließtext: Briefing, Journal, Notizinhalt, Fehlermeldung, Modaltext. `max-width: 68ch` |
| `--t-16` | 16px | Sans 400 | 0 | 22px | Zwangsgröße für `input, textarea, select` unter `@media (pointer: coarse)` (iOS zoomt nicht). Bei feinem Zeiger fallen Felder auf `--t-13` zurück. |
| `--t-20` | 20px | Mono 400, tnum | -0.005em | 24px | Kennzahl im Sektionskopf (Wochensumme, Notendurchschnitt, Wochenvolumen, offene Anzahl) |
| `--t-28` | 28px | Mono 400, tnum | -0.01em | 32px | Leitzahl eines Moduls: ECTS bestanden, Serie in Tagen, Minuten heute, Wochenvolumen. Höchstens eine pro Ansicht. |
| `--t-44` | 44px | Mono 400, tnum | -0.02em | 44px | Genau zwei Vorkommen in der App: Prozentzahl im Ring-Hub (Cockpit) und Timer `01:23:45` (Study) |
| `--t-6-sub` | 9px | Mono 500 | +0.06em | 12px | Prozentzeichen und Einheiten direkt an t-28/t-44, als `<span>` mit `vertical-align: 0.55em`, Farbe --ink-600 |

## Hierarchieregeln

1. **Kennzahl-Paar (aus E2 übernommen):** jeder herausgestellte Wert ist ein Paar aus Readout und Legende mit Größenverhältnis ≥ 2:1 — erlaubt sind exakt 44/10, 28/10, 20/10. Legende steht **unter** dem Wert bei t-28/t-44, **links** vom Wert bei t-20 im Sektionskopf. Drei Helligkeitsstufen tragen das Paar: Wert --ink-900, Legende --ink-600, Einheit --ink-450 (Einheit nur, wenn sie kein Bezeichner ist; ist sie Bezeichner, gilt --ink-600).
2. **Familienkontrast statt Größenkontrast in Tabellen:** in einer 28px-Zeile stehen Sans 13px (Nutzerinhalt) und Mono 12px (berechneter Wert) auf gemeinsamer Grundlinie. Kein Größensprung nötig, kein Fettdruck.
3. **Sektionskopf** ist eine 22px-Zeile: links t-10 uppercase in Modulfarbe, rechts t-20 Kennzahl in --ink-900, darunter 1px --line über die volle Spaltenbreite. Das ersetzt Kachel, Rahmen und Titelbalken vollständig.
4. **Seitentitel** ist t-10 uppercase in --ink-900, genau einer pro Ansicht, in der Kopfzeile.
5. **Der Sprung t-12 → t-44 ist absichtlich ohne Zwischenstufe.** Die große Zahl braucht keinen Rahmen, um Zentrum zu sein.
6. **Nullwerte und leere Zellen** sind ein En-Dash `–` in --ink-450, nie eine 0 in Volltonstärke.
7. **Zahlenformat deutsch:** Dezimalkomma, Tausenderpunkt ab fünf Stellen, Note immer mit einer Dezimale (`1,7`), Prozent ohne Dezimale, Zeit `HH:MM`, Datum in Tabellen `SO 03.08.` (t-11), Datum in Prosa `3. August`.

## Raster und Abstände
## Basis

4px. Jedes vertikale Maß und jede Zeilenhöhe ist ein Vielfaches von 4. Zwei benannte Ausnahmen: 1px (Linien) und 2px (Zustandsmarken, Rasterlücken).

| Token | Wert | Verwendung |
|---|---|---|
| `--s-1` | 2px | Lücke zwischen Heatmap-Zellen, zwischen Wochenraster-Zellen, zwischen Balken im 14-Tage-Diagramm |
| `--s-2` | 4px | Icon zu Kürzel, Zahl zu Einheit, Fortschrittsbalken zu Prozentzahl, Innenabstand kbd vertikal |
| `--s-3` | 8px | horizontales Zellenpadding in Tabellen, Sektionsregel zu erster Zeile, Gap in Knopfgruppen, Signalstrich zu Legende |
| `--s-4` | 12px | Seitenrand 390px, Innenpadding Formularbereich vertikal, Abstand zwischen Formularzeilen |
| `--s-5` | 16px | Rinne im Desktop-Raster, Innenpadding Modal/Popover, Sektionskopf zu Diagramm |
| `--s-6` | 24px | Abstand zwischen Sektionsgruppen (Desktop), Seitenrand 1440px, Abstand Kopfzeile zu erster Sektion |
| `--s-7` | 32px | Abstand zwischen zwei thematischen Blöcken einer Seite (z. B. Aufgabenbereich zu Notizbereich) |
| `--s-8` | 48px | Innenbreite der Desktop-Rail (52px inkl. Haarlinie), Höhe der Mobil-Navigationsleiste. Sonst nirgends. |

**Gruppierungsregel (aus E1):** 24px über dem Sektionskopf, 8px unter der Regel = Verhältnis 3:1. Deshalb braucht keine Sektion einen Rahmen. Auf 390px: 20px über, 8px unter (2,5:1).

**Panelgruppen (aus E2):** Sektionen, die inhaltlich eine Gruppe bilden (z. B. „Habits heute" + „Serie" + „Heatmap"), stoßen ohne Abstand aneinander und sind nur durch 1px --line getrennt. Zwischen Gruppen 24px Seitengrund. Innerhalb einer Gruppe existiert kein 24px-Abstand.

## Dichte (alle Werte verbindlich)

| Element | Desktop | `pointer: coarse` |
|---|---|---|
| Anzeigezeile (nicht interaktiv) | 28px (lh 16px + 6px oben/unten, Padding `0 8px`) | 28px — unverändert, das Auge braucht Dichte |
| Interaktive Zeile (Checkbox, Auswahl, Link) | 28px | 36px |
| Tabellenkopf (sticky) | 22px, Grund --head, 1px --line unten | 22px |
| Sektionskopf | 22px | 22px |
| Knopf | 24px hoch, Padding `0 10px` | 32px hoch, Padding `0 12px` |
| Eingabefeld / Select | 28px hoch, Padding `0 8px` | 40px hoch, Padding `0 10px` |
| Textarea | min-height 96px, Padding `8px 10px` | min-height 120px |
| Checkbox | 16×16 sichtbar, Trefferfläche 28×28 via Padding; die ganze Zeile ist zusätzlich Klickziel | 16×16 sichtbar, Trefferfläche 36×36 |
| Segment-Umschalter | Segmenthöhe 24px | 32px |
| kbd-Chip | 16px hoch, Padding `1px 4px` | 16px (nicht angezeigt bei coarse) |
| Mobil-Nav | — | 48px + `env(safe-area-inset-bottom)` |
| Kopfzeile | 40px | 32px |

## Raster-Arithmetik (nachgerechnet)

- **Habit-Wochenraster.** Desktop: Zelle 30×30, Lücke 2px → 7·30 + 6·2 = **222px**, Namensspalte `minmax(0,1fr)`. Coarse/390px: Zelle 34×34, Lücke 2px → 7·34 + 6·2 = **250px**; Namensspalte fest 104px; 104 + 12 + 250 = **366px** = exakt die Inhaltsbreite auf 390px.
- **Heatmap 140 Tage**, 20 Spalten × 7 Reihen. Desktop: Zelle 9×9, Lücke 2px → 20·9 + 19·2 = **218 × 75px**. 390px: Zelle 12×12, Lücke 2px → 20·12 + 19·2 = **278 × 96px** (88px Reserve, kein Scroll).
- **14-Tage-Diagramm.** Balken 18px, Lücke 4px → 14·18 + 13·4 = **304px** Breite, Höhe 72px inkl. 1px-Grundlinie. Identisch auf 390px (62px Reserve).
- **Sparkline in schmalen Sektionen.** 5-Spalten-Breite 549px bzw. 366px mobil, Höhe 40px, 1,5px Linie, keine Fläche.
- **Ring-Hub.** Feld 132×132 Desktop, 120×120 mobil (Radien dann 53/44/35).
- **Cockpit-Budget 1440×900 (ohne Scroll, gerechnet):** Kopfzeile 40 + Regel 1 + 24 Abstand. Linke Spalte (7): Ring 132 + 16 + Briefing 2·23=46 + 24 + Heatmap-Sektion (22 + 8 + 75 + 8 + 12) = 125 + 24 + Verlauf-Sektion (22 + 8 + 72 + 14) = 116 → **483px**. Rechte Spalte (5): 5 Sektionen à (22 Kopf + 1 Regel + 4·28 Zeilen) = 135, dazwischen 4·24 = 96 → **771px**. Seitenhöhe 40 + 1 + 24 + 771 + 48 = **884px < 900px**. ✓
- **390px-Budget:** Kopfzeile 32 + Ring 120 + 16 + Briefing 69 (3 Zeilen) + 20 + Sektion (22 + 1 + 10·28 = 303) = 561; bei 844px Viewporthöhe minus 48px Nav bleiben 235px Reserve → **mindestens 10 Tabellenzeilen sichtbar**. ✓

## Farben
## Philosophie

Zwei getrennte Ebenen. Die **Chrome-Ebene** ist vollständig unbunt (warmes Graphit dunkel / warmes Papiergrau hell): Grund, Flächen, Linien, Text, Knöpfe, Nav. **Farbe ist ausschließlich Daten-Signal** und erscheint an genau vier Stellen: (1) Modul-Label im Sektionskopf, (2) 2px-Zustandsmarke (aktive Nav, aktive Zeile, Segment), (3) Datenmarke in Heatmap, Balken, Ring, Fortschrittsbalken, (4) Alarm. Kein Knopf, kein Rahmen, keine Fläche trägt jemals eine Modulfarbe. Kein Farbverlauf im ganzen System — jede Fläche ist ein flacher Hexwert. Kein Cyan, kein Violett.

Beide Themen sind vollwertig; dunkel ist Standard, `prefers-color-scheme` belegt vor, `[data-theme="light"|"dark"]` übersteuert. Jede Farbe ist in beiden Themen definiert, keine Farbe existiert nur in einem Media-Block.

## Dunkles Thema (Standard)

Kontraste gegen die drei Gründe: `bg` #0B0B0C, `panel` #121315, `head` #191B1D. Maßgeblich ist der schlechteste Fall (`head`).

| Token | Hex | Verwendung | vs bg | vs panel | vs head |
|---|---|---|---|---|---|
| `--bg` | #0B0B0C | Seitengrund (html, body), Rail, Mobil-Nav, Diagrammgrund | – | – | – |
| `--panel` | #121315 | nur Formularbereich, Modal, Popover — immer zusammen mit 1px --line | 1,06:1 | – | – |
| `--head` | #191B1D | Tabellenkopf, gehoverte Zeile, ausgewählte Zeile, aktives Segment, heutige Spalte | 1,14:1 | 1,08:1 | – |
| `--line-hair` | #232629 | 1px Zeilentrenner innerhalb einer Liste, Diagramm-Gitterlinie | 1,29:1 | 1,22:1 | 1,14:1 |
| `--line` | #2E3236 | 1px Strukturkante: Sektionsregel, Feldrahmen, Achse, Rail-Kante, Nav-Oberkante, Modalrahmen, Fortschritts-Spur, Ring-Spur | 1,52:1 | 1,44:1 | 1,34:1 |
| `--ink-450` | #676C70 | **nur Nichtinformation**: En-Dash für Nullwert, Platzhalter, deaktivierte Beschriftung, Achsen-Teilstrich (WCAG-Ausnahme für deaktiviert/inzidentell) | 3,71:1 | 3,50:1 | 3,25:1 |
| `--ink-600` | #8A9095 | Spaltenkopf, Label, Legende, Metadaten, Zeitstempel, Nav im Ruhezustand, Einheit als Bezeichner | 6,09:1 | 5,76:1 | **5,35:1** |
| `--ink-800` | #C6CBCE | Standardtext: Fließtext, Zeilentitel, normale Zellen, Knopfbeschriftung; zugleich `--m-tasks` | 12,02:1 | 11,36:1 | **10,56:1** |
| `--ink-900` | #EEF1F2 | Betonung: Kennzahlen, Leitzahlen, aktive Nav, Fokusring, Timer | 17,33:1 | 16,38:1 | **15,22:1** |
| `--m-habits` | #8AA75E | Moos — Habits, Serie, Heatmap-Spitze, alle Erledigt-/Positivsignale (auch GESPEICHERT) | 7,28:1 | 6,88:1 | **6,39:1** |
| `--m-study` | #BE9B4B | Messing — Study **und** Uni (ein Lebensbereich, ein Ton), Timer-Marke | 7,48:1 | 7,06:1 | **6,56:1** |
| `--m-journal` | #B08A6E | Ton — Journal | 6,28:1 | 5,94:1 | **5,52:1** |
| `--m-sport` | #7E93B0 | Stahl — Sport, Wochenvolumen, Sätze. Einziger blaustichiger Ton, S ≈ 26 % | 6,27:1 | 5,92:1 | **5,50:1** |
| `--m-goals` | #6E9C93 | Grünspan — Goals, Fortschritt | 6,41:1 | 6,05:1 | **5,63:1** |
| `--m-tasks` | = `--ink-800` | Tasks und Notes laufen in Tinte. Der Verzicht auf eine siebte Farbe ist Teil des Systems. | 12,02:1 | 11,36:1 | 10,56:1 |
| `--alert` | #E45B45 | einziger gesättigter Ton. Ausschließlich: ÜBERFÄLLIG, Klausur ≤ 14 Tage, Note > 4,0, Löschbestätigung, Importwarnung, fehlgeschlagene Mutation. Nie dekorativ. | 5,51:1 | 5,21:1 | **4,84:1** |
| `--focus` | = `--ink-900` | Fokusring 1px, Offset 1px | – | – | 15,22:1 |
| `--scrim` | rgba(6,6,7,0.78) | Modal-Abdunklung, flach, kein Weichzeichner | – | – | – |

Heatmap-Rampe dunkel (feste Hexwerte, keine Laufzeitmischung für 140 Zellen), Nachbarkontraste in Klammern:
`--hm-0` #202320 (vs bg 1,24:1) → `--hm-1` #2E3B22 (1,33:1) → `--hm-2` #46592C (1,54:1) → `--hm-3` #637C40 (1,65:1) → `--hm-4` #8AA75E (1,73:1). Jede Stufe ist von ihrer Nachbarstufe ≥ 1,25:1 unterscheidbar, die leere Zelle ist vom Seitengrund unterscheidbar.

## Helles Thema (vollwertiger Zwilling)

Gründe: `bg` #F5F4F1, `panel` #EBEAE6, `head` #E3E1DC.

| Token | Hex | vs bg | vs panel | vs head |
|---|---|---|---|---|
| `--bg` | #F5F4F1 | – | – | – |
| `--panel` | #EBEAE6 | 1,09:1 | – | – |
| `--head` | #E3E1DC | 1,19:1 | 1,09:1 | – |
| `--line-hair` | #DEDDD8 | 1,24:1 | 1,13:1 | 1,04:1 |
| `--line` | #CFCEC9 | 1,43:1 | 1,31:1 | 1,21:1 |
| `--ink-450` | #767A7E | 3,93:1 | 3,59:1 | 3,31:1 |
| `--ink-600` | #5A5E62 | 5,94:1 | 5,43:1 | **5,00:1** |
| `--ink-800` | #3A3D40 | 9,94:1 | 9,08:1 | **8,36:1** |
| `--ink-900` | #17181A | 16,15:1 | 14,76:1 | **13,60:1** |
| `--m-habits` | #4F6B2E | 5,49:1 | 5,02:1 | **4,62:1** |
| `--m-study` | #7A5E13 | 5,55:1 | 5,07:1 | **4,67:1** |
| `--m-journal` | #7A5239 | 6,17:1 | 5,64:1 | **5,19:1** |
| `--m-sport` | #3F5675 | 6,82:1 | 6,23:1 | **5,74:1** |
| `--m-goals` | #2F5F58 | 6,59:1 | 6,02:1 | **5,54:1** |
| `--m-tasks` | = `--ink-800` #3A3D40 | 9,94:1 | 9,08:1 | 8,36:1 |
| `--alert` | #B02A16 | 5,99:1 | 5,47:1 | **5,04:1** |
| `--focus` | = `--ink-900` #17181A | 16,15:1 | – | 13,60:1 |
| `--scrim` | rgba(30,29,26,0.55) | – | – | – |

Heatmap hell: `--hm-0` #E0DFD9 (vs bg 1,21:1) → `--hm-1` #C2D19F (1,22:1) → `--hm-2` #9DB878 (1,35:1) → `--hm-3` #729053 (1,64:1) → `--hm-4` #4F6B2E (1,68:1). Gleiche Hue-Winkel wie dunkel, nur abgedunkelt — Diagramme behalten ihre Zuordnung in beiden Themen.

## WCAG-Nachweis

- **Fließtext und alle Zellen** (t-11 bis t-15) verwenden --ink-800 (dunkel 10,56:1 / hell 8,36:1 im schlechtesten Fall) → AA und AAA erfüllt.
- **Labels, Spaltenköpfe, Legenden, Metadaten, inaktive Nav** verwenden --ink-600 (5,35:1 / 5,00:1) → AA erfüllt, obwohl es kleine Schrift ist.
- **Modul-Labels in 10px** liegen alle bei ≥ 4,62:1 (schlechtester Wert: --m-habits hell auf --head) → AA für kleine Schrift erfüllt. --alert erreicht 4,84:1 / 5,04:1.
- **Große Schrift** (t-20, t-28, t-44) verwendet --ink-900 (≥ 13,60:1) → weit über 3:1.
- **--ink-450 ist kein Textwert.** Es trägt ausschließlich En-Dash für Leerwerte, Platzhalter, deaktivierte Beschriftung und Achsen-Teilstriche. Alle drei Fälle sind nach WCAG 1.4.3 ausgenommen; trotzdem liegen sie bei ≥ 3,25:1.
- **Grafische Objekte** (Balken, Ringbögen, Fortschrittsfüllung, Heatmap-Spitze) erreichen gegen den Seitengrund ≥ 5,49:1 (Minimum: --m-habits hell) → über den 3:1 von WCAG 1.4.11.
- **Zustand nie nur über Farbe:** ÜBERFÄLLIG trägt zusätzlich das Wort in t-10 und den 2px-Signalstrich links; erledigt trägt den Haken; aktive Nav trägt --ink-900 plus 2px-Unterstreichung.

## Rahmen und Linien
## Radien — drei Werte, größter 3px

| Token | Wert | Gilt für |
|---|---|---|
| `--r-0` | 0 | Tabellenzelle, Zeile, Sektionsregel, Heatmap-Zelle, Wochenraster-Zelle, Diagrammbalken, Fortschrittsbalken, Kopfzeile, Rail, Mobil-Nav, Ring-Bogen, Statuslampe, Index-Seite |
| `--r-2` | 2px | Knopf, Eingabefeld, Select, Textarea, Checkbox, Chip/Tag, kbd, Segment-Umschalter |
| `--r-3` | 3px | ausschließlich Modal und Popover |

`border-radius: 999px` und `border-radius: 50%` existieren im System nicht. Es gibt keinen vierten Radius und keinen Wert über 3px. Die Tokens `--r-tile` (26px), `--r-tile-sm` (22px) und `--r-pill` (999px) werden aus `tokens.css` gelöscht.

## Linienstärken — genau drei

1. **1px `--line-hair`** — Zeilentrenner innerhalb einer Liste (`tr + tr { border-top }`), Diagramm-Gitterlinie bei 50 % und 100 %. Die erste Zeile hat keine Linie, weil der Spaltenkopf sie liefert; die letzte Zeile hat keine Linie unten.
2. **1px `--line`** — Strukturkante: Sektionsregel unter dem Sektionskopf, Rahmen von Eingabefeld/Knopf/Checkbox/Select, Diagramm-Grundlinie, rechte Kante der Rail, obere Kante der Mobil-Nav, Rahmen von Modal/Popover/Formularbereich, Spur von Fortschrittsbalken und Ring.
3. **2px in Modulfarbe** — ausschließlich Zustandsmarke und Datenlinie: aktiver Nav-Eintrag (Unterstreichung), aktives Segment (Unterstreichung), ausgewählte Zeile (linke Marke), Signalstrich im Sektionskopf (2×12px), Ausnahmemarke links an einer Zeile (überfällig, Klausur ≤ 14 Tage — in `--alert`), Ring-Bogen, Sparkline (1,5px).

Nichts dazwischen, nichts darüber. Achsen laufen in 1px `--line`.

## Trennlinien statt Karten

- Eine Liste ist ein `<table>` **ohne Außenrahmen**. Zeilen trennen sich über `tr + tr { border-top: 1px solid var(--line-hair) }`.
- Eine Sektion ist: 22px-Kopfzeile + 1px `--line` + Inhalt + 24px Abstand. **Die Regel ist die Kachel.**
- Der Sektionskopf ist eine technische Zeichnung (aus E2): auf der 1px-Regel sitzt links ein **2×12px-Signalstrich in Modulfarbe**, direkt daneben unterbricht die 10px-Legende die Linie (`padding-right: 8px; background: var(--bg)`).
- Auf 390px laufen alle Linien randlos durch: `margin-inline: -12px; padding-inline: 12px`. Eine Sektion liest sich als Streifen, nie als Karte.
- Nur drei Elementtypen haben einen umlaufenden Rahmen: Formularbereich, Modal, Popover. Alles andere hat höchstens Kanten.
- Tiefe entsteht aus drei Flächenwerten (`--bg` < `--panel` < `--head`) plus Haarlinie, nicht aus Licht.

## Null Schatten

`box-shadow` darf im gesamten System nur in zwei Formen vorkommen, beide ohne Versatz und ohne Weichzeichnung: `inset 0 0 0 1px` (Innenkante, wo ein `border` das Layout verschieben würde) und `inset 2px 0 0` (Fokus- und Auswahlmarke an Tabellenzeilen). `filter: drop-shadow`, `text-shadow` und `backdrop-filter` existieren null Mal. Die Tokens `--glass`, `--glass-edge`, `--glass-lift` und `--hairline` werden gelöscht.

## Fokus — laut, weil die App tastaturbedient ist

```css
:focus-visible { outline: 1px solid var(--focus); outline-offset: 1px; }
tr:focus-visible, [role="row"]:focus-visible {
  outline: none; background: var(--head);
  box-shadow: inset 2px 0 0 var(--focus);
}
```
Kein farbiger Ring, kein Halo, kein Glimmen. `outline` folgt dem Radius des Elements (also meist 0).

## Zustände

| Zustand | Umsetzung |
|---|---|
| hover Zeile | `background: var(--head)`, keine Farbe, keine Bewegung |
| ausgewählte Zeile | `background: var(--head)` + `inset 2px 0 0` in Modulfarbe |
| aktive Nav | Icon und Kürzel in --ink-900 + 2px Unterstreichung in Modulfarbe (Desktop: 2px linke Marke) |
| aktives Segment | `background: var(--head)` + 2px Unterstreichung in Modulfarbe |
| Checkbox erledigt | 1,5px Haken in Modulfarbe im 16px-Quadrat, **keine Füllung**, kein Leuchten; Zeilentitel bleibt --ink-800 mit `text-decoration: line-through` in --ink-450 |
| Ausnahme (überfällig / Klausur ≤ 14 Tage) | 2px linke Marke in `--alert` + das Wort ÜBERFÄLLIG bzw. der Countdown in t-10 `--alert`. Die Zeile wird **nicht** eingefärbt. |
| deaktiviert | Beschriftung --ink-450, Rahmen --line, `cursor: default`, keine Opazitätsänderung |

## Eingabe und Knöpfe

- **Eingabefeld / Select:** `background: var(--panel)`, `border: 1px solid var(--line)`, `--r-2`, 28px hoch (40px coarse). Fokus: `border-color: var(--ink-600)` plus 1px Outline in --focus mit 1px Offset.
- **Textarea:** gleich, `--r-2`, min-height 96px, Fließtext t-15.
- **Knopf primär:** `background: var(--ink-900)`, Schrift `var(--bg)`, 1px `--ink-900`, `--r-2`, 24px hoch, t-10.
- **Knopf sekundär:** transparenter Grund, 1px `--line`, Schrift --ink-800, `--r-2`.
- **Knopf destruktiv:** transparenter Grund, 1px `--alert`, Schrift `--alert`.
- **Segment-Umschalter:** aneinanderstoßende Rechtecke mit geteiltem 1px-Rahmen (`margin-left: -1px`), `--r-2` nur an den Außenecken. Auch der Ein/Aus-Schalter in den Einstellungen ist ein Zwei-Segment-Umschalter (AN | AUS) — es gibt keinen Kippschalter und keine Pille.

## Icons
**Ein Satz, 15 Strichzeichnungen, genau eine Anzeigegröße.**

Bestand: neun Navigationszeichen (Cockpit, Habits, Tasks, Journal, Study, Uni, Goals, Sport, Zahnrad) und sechs Aktionszeichen (Haken, Plus, Minus, Chevron, Lupe, Kreuz). Mehr existiert nicht. Kein Emoji, keine Illustration, kein Zierzeichen.

**Konstruktion.** `viewBox="0 0 16 16"`, `stroke-width: 1.5`, `stroke-linecap: butt`, `stroke-linejoin: miter`, `fill: none`, `stroke: currentColor`. Alle senkrechten und waagrechten Koordinaten liegen auf halben Pixeln (`M2.5 8.5 H13.5`), alle Formen sind an ein 2px-Untergitter gebunden, sichere Zeichenfläche 14×14 (1px Rand rundum). Diagonalen ausschließlich in 45 Grad; der Haken ist die einzige Form mit zwei Diagonalen und darf Endpunkte auf ganzen Koordinaten haben. Keine runden Endkappen, keine Füllflächen, keine zwei Farbtöne, keine Ecke mit Radius.

**Anzeigegröße: ausschließlich 16×16 CSS-Pixel.** Die 12px- und 14px-Varianten aus dem Ausgangsentwurf sind verworfen, weil ein 1,5px-Strich dabei verwäscht. Wo 16px nicht passt, steht ein Wort in t-10 oder t-9 — das ist im ganzen System die billigere Lösung.

**Farbe folgt der Schrift.** `--ink-600` im Ruhezustand, `--ink-900` aktiv, `--alert` beim Löschknopf. Eine Modulfarbe bekommt ein Icon nur im aktiven Nav-Eintrag. Kein Icon wird eigenständig gefärbt.

**Beschriftung ist Pflicht in der Navigation.** In der 52px-Rail steht unter jedem Icon ein Kürzel in t-9 (9px Mono 500, +0.14em, --ink-600, aktiv --ink-900): COK, HAB, STU, TSK, JRN, UNI, GOL, SPT, SET. In der Mobil-Nav ebenso. Ein Werkzeug versteckt seine Ziele nicht hinter Piktogrammen.

**Position.** Icon und Wort stehen in einem Flex-Container mit `align-items: center` und 4px Abstand in Zeilen, in der Rail übereinander mit 4px Abstand. In Tabellen sitzt ein Aktionsicon in einer festen 36px-Spalte am rechten Rand.

**Statuslampe ist kein Icon**, sondern ein 4×4px-Quadrat mit Radius 0 in Modulfarbe (Timer läuft: `--m-study`; Systemzeile: `--ink-600`). Ausdrücklich kein Kreis, kein Leuchten und — im Unterschied zu Entwurf 2 — **kein Blinken**: die Lampe steht still, die Bewegung liefert die mitlaufende Timer-Ziffer.

**Die Checkbox ist kein Icon**, sondern Satzmaterial: 16×16-Quadrat, 1px `--line`, `--r-2`; gesetzt = 1,5px-Haken in Modulfarbe ohne Füllung.

## Bausteine
Alle Bausteine sind rahmenlos, sofern nicht ausdrücklich anders vermerkt. **Es gibt keine Karte, keine Kachel, kein Panel mit Fläche und Rand.** Genau drei Bausteine haben einen umlaufenden Rahmen: Formularbereich, Modal, Popover.

## 1. Sektionskopf `.sec-head`
22px hohe Zeile, `display: grid; grid-template-columns: 2px auto 1fr auto; align-items: center; gap: 0 8px`.
Links 2×12px Signalstrich in Modulfarbe. Daneben Modul-Label t-10 uppercase in Modulfarbe. Rechts optional Kennzahl t-20 --ink-900 und/oder kbd-Chips. Darunter `border-bottom: 1px solid var(--line)` über die volle Spaltenbreite; die Legende unterbricht sie (`background: var(--bg); padding-right: 8px`). Abstand darüber 24px (mobil 20px), darunter 8px. Kein Hintergrund, kein Rahmen.

## 2. Trenner
Drei und nur drei: `1px --line-hair` zwischen Listenzeilen; `1px --line` als Sektionsregel und Strukturkante; `2px` Modulfarbe als Zustandsmarke. Sektionen einer Gruppe stoßen ohne Abstand aneinander (nur 1px `--line`), Gruppen trennen 24px.

## 3. Zeile `.row` (28px)
`display: grid; grid-template-columns: [check] 28px [title] minmax(0,1fr) [meta] auto [value] auto [act] 36px`. Höhe 28px (36px bei `pointer: coarse` und Interaktivität), Padding `0 8px`, `border-top: 1px solid var(--line-hair)` ab der zweiten Zeile. Titel t-13 Sans --ink-800 mit `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`. Meta t-11 Mono --ink-600. Wert t-12 Mono --ink-900, rechtsbündig, `font-variant-numeric: tabular-nums`. hover/`:active` `background: var(--head)` ohne Übergang. Die ganze Zeile ist Klickziel, `touch-action: manipulation`. Ausnahmemarke: `box-shadow: inset 2px 0 0 var(--alert)`.

## 4. Tabelle `.tbl`
`<table>` ohne Außenrahmen, `border-collapse: collapse`, `table-layout: fixed`, Spaltenbreiten in `ch` (nicht Prozent), damit Zahlenspalten nicht mit dem Fenster atmen. Kopf: 22px, `position: sticky; top: 0`, `background: var(--head)`, t-9 uppercase --ink-600, `border-bottom: 1px solid var(--line)`. Zellen: Padding `0 8px`, Text links, Zahlen rechts mit tnum, Zustandsspalten (Checkbox, Löschen) fest 36px am Rand. Notenwerte am Komma ausgerichtet (feste 4ch-Spalte, immer eine Dezimale). Sortierbarer Kopf: Chevron 16px rechts in der Zelle, aktiv --ink-900. Optionale Spalten tragen `data-col="opt"` und verschwinden unter 560px. Unvermeidbar breite Tabellen (Trainingssätze, Kursliste) scrollen in einem eigenen `overflow-x: auto`-Container mit `position: sticky` auf der ersten Spalte — die Seite selbst scrollt nie horizontal.

## 5. Zahlenanzeige (drei Formen)
- **Zellenwert:** t-12 Mono, --ink-900, rechtsbündig, tnum. Einheit dahinter 4px Abstand, t-10 --ink-450 (bzw. --ink-600, wenn sie Bezeichner ist). Leerwert: En-Dash `–` in --ink-450.
- **Kennzahl im Sektionskopf:** t-20 --ink-900, links davon Legende t-10 --ink-600, Verhältnis 2:1.
- **Leitzahl:** t-28 --ink-900 (höchstens eine pro Ansicht), darunter 4px, Legende t-10 uppercase --ink-600. Prozentzeichen und Einheit als `<span>` in t-6-sub mit `vertical-align: 0.55em`.
- **t-44** existiert genau zweimal: Ring-Mitte im Cockpit und Timer in Study.

## 6. Eingabefeld `.inp`
28px hoch (40px coarse), `background: var(--panel)`, 1px `--line`, `--r-2`, Padding `0 8px`, Schrift t-13 (t-16 bei coarse). Label darüber: t-9 uppercase --ink-600, 4px Abstand. Platzhalter --ink-450. Fokus: `border-color: var(--ink-600)` + 1px Outline --focus, Offset 1px. Fehlerzustand: `border-color: var(--alert)` plus eine 15px-Zeile Fehlertext in `--alert` darunter (echte Meldung, kein Beschwichtigungssatz).

## 7. Textarea
Gleiche Kante, min-height 96px (120px coarse), Padding `8px 10px`, Fließtext t-15 mit `max-width: 68ch`. Journal und Notizen nutzen dieselbe Komponente.

## 8. Select
Wie `.inp`, plus Chevron 16px rechts (8px Innenabstand), `appearance: none`. Optionsliste ist Systemliste — kein eigenes Dropdown.

## 9. Knopf `.btn`
24px hoch (32px coarse), `--r-2`, Padding `0 10px` (12px coarse), Schrift t-10 uppercase. Drei Varianten: **primär** Grund --ink-900 / Schrift --bg; **sekundär** transparent, 1px --line, Schrift --ink-800; **destruktiv** transparent, 1px --alert, Schrift --alert. Icon-Knopf: 24×24 (32×32 coarse), Icon 16px, kein Rahmen, hover `background: var(--head)`. Knopfgruppen mit 8px Gap. Keine Pille, keine Fläche in Modulfarbe.

## 10. Segment-Umschalter `.seg`
Aneinanderstoßende Rechtecke, geteilter 1px-Rahmen via `margin-left: -1px`, `--r-2` nur an den Außenecken, Segmenthöhe 24px (32px coarse), Schrift t-10 uppercase. Aktiv: `background: var(--head)` + 2px Unterstreichung in Modulfarbe + Schrift --ink-900. Verwendung: Zeitraumwahl (7 | 30 | 140 TAGE), Filter (ALLE | OFFEN | ERLEDIGT), Sortierung, **und jeder Ein/Aus-Schalter in den Einstellungen** (AN | AUS).

## 11. Checkbox
16×16-Quadrat, 1px `--line`, `--r-2`, Trefferfläche 28×28 (36×36 coarse) über Padding. Gesetzt: 1,5px-Haken in Modulfarbe, keine Füllung, kein Leuchten. Erledigter Titel: `line-through` in --ink-450.

## 12. Chip / Tag
Höhe 16px, Padding `1px 5px`, 1px `--line`, `--r-2`, Schrift t-10 uppercase --ink-600. Modul-Tags (UNI, SPORT, JARVIS, PRIVAT) tragen die Schriftfarbe der Modulfarbe, **nie** einen farbigen Grund. Löschbarer Tag: Kreuz-Icon 16px rechts, 4px Abstand.

## 13. kbd-Chip
Höhe 16px, Padding `1px 4px`, 1px `--line`, `--r-2`, Schrift t-10 Mono --ink-600. Steht rechts im Sektionskopf im Arbeitskontext, nie in einem Hilfedialog. Unter `pointer: coarse` ausgeblendet.

## 14. Ring-Hub
SVG-Feld 132×132 (mobil 120×120). Drei konzentrische Bögen, Radien 58/48/38 (mobil 53/44/35), `stroke-width: 2`, `stroke-linecap: butt`, Spur `--line`, Wert in Modulfarbe, Start bei -90 Grad. Mitte: t-44 --ink-900 mit Prozentzeichen in t-6-sub. Unter dem Feld drei Legendenzeilen (jede: 4×4px-Quadrat in Modulfarbe, 4px, Wort t-10 --ink-600, rechtsbündig Wert t-12 --ink-900). Keine Teilstrich-Ringe, kein Gitter-Globus, keine Trabanten, keine Wellenform, keine Rotation. Genau **ein** Instrument pro Ansicht: Cockpit = Tagesring, Study = Timer-Ring, Uni = ECTS-Ring. Sonst keine zweite große Grafik.

## 15. Balkendiagramm (14 Tage)
14 Balken à 18px, Lücke 4px, Radius 0, flache Modulfarbe, Höhe 72px inkl. 1px `--line`-Grundlinie. Gitterlinie bei 50 % und 100 % in `--line-hair`. Beschriftung nur an Maximum und Heute (t-9 --ink-600). Heutiger Balken zusätzlich mit 2px-Oberkante in --ink-900. Kein Verlauf, keine Fläche unter einer Kurve, keine Punkte.

## 16. Sparkline
Nur in schmalen Sektionen: Höhe 40px, Linie 1,5px flache Modulfarbe, kein Punkt, keine Füllung, keine Achse, 1px `--line-hair` als Nulllinie. Kein Hintergrund (die „Well"-Idee aus Entwurf 2 ist verworfen).

## 17. Fortschrittsbalken
4px hoch, Radius 0, Spur `--line`, Füllung flach in Modulfarbe. Rechts daneben immer der Prozentwert in t-12 --ink-900 — die Zahl trägt die Information, der Balken nur die Größenordnung. Zielmarke: 1px senkrechte Linie in --ink-450.

## 18. Heatmap (140 Tage)
`display: grid; grid-template-columns: repeat(20, 9px); gap: 2px` (mobil 12px). Zelle Radius 0, Fläche aus den fünf vorberechneten Stufen `--hm-0` bis `--hm-4`. `transition: none` auf der Zelle (sonst 140 Übergänge beim Themenwechsel). Legende darunter: t-9 --ink-600, fünf 9px-Quadrate mit 2px Lücke, links „0", rechts „4". `title`-Attribut pro Zelle mit Datum und Anzahl; kein Popover beim Hover.

## 19. Wochenraster (Habits)
Zeilen pro Habit: Namensspalte (Desktop `minmax(0,1fr)` t-13, mobil fest 104px) + 7 Zellen 30×30 (mobil/coarse 34×34) mit 2px Lücke. Zelle = Checkbox-Fläche: leer 1px `--line`; gesetzt 1,5px-Haken in `--m-habits`; heutige Spalte `background: var(--head)`; Zukunft `--ink-450`-Rahmen und nicht klickbar. Spaltenköpfe t-9 uppercase (MO DI MI DO FR SA SO).

## 20. Kopfzeile
40px Desktop / 32px mobil, `background: var(--bg)`, `border-bottom: 1px solid var(--line)`, Radius 0, `position: sticky; top: 0`, opak, nicht schwebend. Links Marke JARVIS in t-10 --ink-900. Mitte Ansichtsname in t-10 --ink-600 (mobil --ink-900). Rechts: Systemzeile (4×4px-Quadrat + LOKAL/ONLINE in t-10 --ink-600) und Uhr t-12 Mono --ink-800. Mobil steht rechts stattdessen der Textknopf **INDEX** (t-10, 1px `--line`, `--r-2`, 32×24, Trefferfläche 44×44).

## 21. Desktop-Rail
52px breit (48px Inhalt + 1px `--line` rechte Kante), `position: fixed`, `background: var(--bg)`, Radius 0, kein Schatten. Neun Ziele à 44px Höhe: Icon 16px + 4px + Kürzel t-9. Ruhezustand --ink-600, aktiv --ink-900 plus 2px linke Marke in Modulfarbe. Kein Hintergrundunterschied zur Seite, keine Kapsel, kein Leuchten.

## 22. Mobil-Navigation
48px hoch + `env(safe-area-inset-bottom)`, volle Breite, `background: var(--bg)`, `border-top: 1px solid var(--line)`, Radius 0, nicht schwebend. Fünf Ziele (COK, HAB, TSK, STU, JRN) à 20 % Breite: Icon 16px + 4px + Kürzel t-9, aktiv --ink-900 + 2px Unterstreichung in Modulfarbe an der Leistenoberkante.

## 23. Index-Seite (Erreichbarkeit aller neun Ansichten auf dem Handy)
Vollflächige Seite, kein Sheet, kein Overlay, kein Radius. Kopfzeile mit Chevron-links und Titel INDEX. Danach eine 36px-Zeilenliste aller neun Ansichten (Icon 16px + Name t-13 + Chevron rechts), getrennt durch 1px `--line-hair`, gruppiert mit Sektionsköpfen MODULE / DATEN / SYSTEM. Unter DATEN: Export, Import, Alles löschen (destruktiv).

## 24. Modal
Breite 360px (mobil `calc(100vw - 24px)`), `background: var(--panel)`, 1px `--line`, `--r-3`, Padding 16px, Abdunklung `--scrim` flach. Titel t-10 uppercase --ink-900, Text t-15 --ink-800, Knopfzeile rechts unten mit 8px Gap. Bestätigungstext nennt nur die Konsequenz mit Zahl: „Habit löschen — 214 Einträge werden mitgelöscht." Fokusfalle, Escape schließt.

## 25. Popover
Breite 240px, `background: var(--panel)`, 1px `--line`, `--r-3`, Padding 12px. Nur für Datumswahl und Tag-Auswahl. Keine Erklärtexte, kein Pfeil, kein Schatten.

## 26. Rückgängig-Zeile
Ersetzt jede Toast-Blase: die gelöschte Zeile bleibt 8 Sekunden als 28px-Zeile stehen, Titel `line-through` --ink-450, rechts der sekundäre Knopf RÜCKGÄNGIG (t-10) plus kbd-Chip `U`. Kein Overlay, keine schwebende Fläche, keine Bewegung.

## 27. Leerzeile
28px hoch, t-11 --ink-600, linksbündig, Text plus Kürzel: „Keine Aufgaben — n für neu". Kein gestrichelter Rahmen, keine Illustration, kein Erklärtext. Das Eingabefeld zum Anlegen steht immer schon darüber, damit der Leerzustand ein Arbeitszustand ist.

## 28. Formularbereich
Die einzige Sektion mit Fläche: `background: var(--panel)`, 1px `--line`, `--r-2`, Padding `12px 14px`. Verwendung: neuer Habit, neuer Kurs, neue Trainingseinheit, Import. Innen: Labels t-9, Felder untereinander mit 12px Abstand, Knopfzeile rechts.

## 29. Suchen- und Filterzeile
32px hoch, `display: flex; gap: 8px`: Suchfeld (`.inp` mit Lupe 16px links, Padding-links 28px, `minmax(0,1fr)`), danach Segment-Umschalter für Filter, danach Segment-Umschalter für Sortierung. Auf 390px umbrechend in zwei Zeilen mit 8px Abstand.

## 30. Countdown-Zeile
28px-Zeile: links Titel t-13 (Klausurname), Mitte Datum t-11 --ink-600, rechts Restzahl t-12 mit Einheit `T` in t-10. Bei ≤ 14 Tagen: Restzahl in `--alert` **und** 2px linke Marke in `--alert` **und** das Wort in t-10 — drei Kanäle, nicht nur Farbe.

## 31. Timer-Block (Study)
`display: grid` mit zwei Zeilen: t-44 Mono `01:23:45` in --ink-900 mit fester `8ch`-Breite (verhindert Reflow der Nachbarn), darunter 4×4px-Lampe in `--m-study` + Statuswort LÄUFT/PAUSE in t-10 --ink-600. Rechts Knopfgruppe START | PAUSE | STOP als Segment-Umschalter, 32px hoch. Darunter das Sitzungsformular (Fach-Select, Dauer, Notiz) im Formularbereich.

## 32. Statuslampe
4×4px-Quadrat, Radius 0, Modulfarbe, statisch. Kein Blinken, kein Puls, kein Kreis, kein Leuchten.

## Zuordnung zu den neun Ansichten (jede baut ausschließlich aus dem Obigen)

| Ansicht | Bausteine |
|---|---|
| **Cockpit** | 20, 21/22, 14 (Ring), 5 (Briefing-Leitzahl), 7-Text als 15px-Briefingsatz, 18 (Heatmap), 15 (14-Tage), 1 + 3 + 2 in fünf Sektionen (Habits heute, offene Aufgaben, Trainingswoche, nächste Klausur, aktive Ziele), 30, 27 |
| **Habits** | 1, 19 (Wochenraster), 5 (Serie als t-28), 18 (Heatmap), 10 (Zeitraum), 28 (neuer Habit), 3, 26, 27 |
| **Study** | 1, 31 (Timer), 14 (Timer-Ring), 4 (Sitzungstabelle), 15 (14-Tage-Minuten), 5, 10, 28, 26, 27 |
| **Tasks & Notes** | 1, 29 (Suche/Filter), 3 + 11 (Aufgabenliste), 12 (Tags), 30, 4 (Notizliste), 7 (Notizinhalt), 9, 26, 27 |
| **Journal** | 1, 7 (Textarea 15px), Speicherzustand als 32 + t-10 GESPEICHERT in `--m-habits`, 4 (Datums-Zeitleiste, Spalten Datum/Länge/Stimmung), 18 (Schreib-Heatmap), 29, 27 |
| **Uni** | 1, 14 (ECTS-Ring), 5 (t-28 ECTS bestanden), 4 (Kursliste über alle 12 Spalten: Kurs, Semester, ECTS, Note, Status), 30 (Klausur-Countdowns), 17 (Fortschritt Studium), 28 (neuer Kurs), 26 |
| **Goals** | 1, 3 + 17 (Zielzeilen mit Fortschrittsbalken und Prozentwert), 5, 4 (Meilensteine), 10 (Filter aktiv/erreicht), 28, 26, 27 |
| **Sport** | 1, 5 (t-28 Wochenvolumen), 15 (Wochenbalken), 4 (Satztabelle mit `overflow-x: auto` und sticky erster Spalte: Übung, Satz, kg, Wdh, Volumen), 28 (neue Einheit), 26, 27 |
| **Einstellungen** | 1, 3 (Einstellungszeilen mit rechtsstehendem Segment-Umschalter AN | AUS für Thema, bewegte Effekte, Ton), 10 (Thema hell/dunkel/system), 9 (Export, Import), 28 (Import-Formularbereich), 24 (Löschbestätigung), 4 (Datenübersicht: Modul, Einträge, letzte Änderung) |

## Navigation
## Desktop ab 1024px — alle neun Ansichten sind ein Klick entfernt

Feste linke Rail, 52px breit (48px Inhalt + 1px `--line` als rechte Kante), `position: fixed`, `background: var(--bg)`, Radius 0, kein Schatten, kein Hintergrundunterschied zur Seite. Neun Ziele à 44px Höhe, gestapelt, insgesamt 396px, oben beginnend nach 8px:

`COK` Cockpit · `HAB` Habits · `STU` Study · `TSK` Tasks & Notes · `JRN` Journal · `UNI` Uni · `GOL` Goals · `SPT` Sport · `SET` Einstellungen

Jedes Ziel: Icon 16px, 4px, Kürzel t-9 (9px Mono 500, +0.14em). Ruhezustand --ink-600, hover `background: var(--head)`, aktiv --ink-900 plus 2px linke Marke in der Modulfarbe der Zielansicht. Kein Ziel ist versteckt, es gibt kein Überlaufmenü. `title`-Attribut trägt den vollen Namen.

Inhaltsbereich: 52px Rail + 24px Rand + Inhalt max. 1340px + 24px Rand. Zwölf Spalten aus `minmax(0,1fr)` mit 16px Rinnen → 97px pro Spalte. Cockpit teilt **7/5** (775px / 549px), niemals 6/6 — eine Halbierung liest sich als Kachelpaar. Links die zusammenhängende Lesekette Ring → Briefing → Heatmap → 14-Tage-Verlauf, rechts der Stapel schmaler Sektionen. Die Spalten enden nicht auf gleicher Höhe und das wird nicht ausgeglichen.

Zwischenschritt bei 900px: Rail wandert nach unten (Mobil-Modus), Raster wird zweispaltig (6/6 ist hier erlaubt, weil keine 7/5-Asymmetrie mehr trägt).

## 390px — fünf Tabs plus beschrifteter INDEX

Untere Leiste 48px + `env(safe-area-inset-bottom)`, volle Breite, opak `--bg`, 1px `--line` obere Kante, Radius 0, nicht schwebend, kein Schatten. Fünf Ziele à 20 %: `COK` `HAB` `TSK` `STU` `JRN`. Aktiv: --ink-900 plus 2px Unterstreichung in Modulfarbe an der Leistenoberkante.

Die vier restlichen Ansichten (Uni, Goals, Sport, Einstellungen) sind über den **Textknopf INDEX** rechts in der 32px-Kopfzeile erreichbar — sichtbar beschriftet, 1px `--line`, `--r-2`, Trefferfläche 44×44. Er öffnet die Index-Seite (Baustein 23): eine vollflächige 36px-Zeilenliste **aller neun Ansichten** plus Export, Import und Alles löschen, gruppiert unter MODULE / DATEN / SYSTEM. Damit ist der Fehler der ersten Fassung strukturell behoben: Einstellungen hängen nicht an einer Nav-Kapsel, sondern an einer benannten Schaltfläche, und keine Ansicht ist nur über Umwege erreichbar.

## Tastatur (Desktop, erstklassig)

Jede Liste ist ein `role="grid"` mit wanderndem `tabindex`. `j`/`k` Zeile wechseln, `Leertaste` umschalten, `x` löschen mit Rückgängig-Zeile, `n` neu, `/` in die Suche, `g` + Buchstabe ins Modul (`g h` Habits, `g s` Study, `g t` Tasks, `g j` Journal, `g u` Uni, `g o` Goals, `g p` Sport, `g c` Cockpit, `g ,` Einstellungen), `u` Rückgängig, `Escape` schließt Modal/Popover. Die aktiven Kürzel stehen als kbd-Chips rechts im Sektionskopf. Eine Kommandopalette entsteht daraus ausdrücklich nicht.

## Scroll und Position

Beim Ansichtswechsel wird `scrollTop` auf 0 gesetzt. Kopfzeile und Tabellenköpfe sind `position: sticky` und opak; nichts liegt transluzent über etwas anderem. Der Seitenkörper scrollt nie horizontal — nur die zwei ausgewiesenen Tabellen-Container (Trainingssätze, Kursliste) tun das in sich, mit sticky erster Spalte.

## Bewegung
## Ausgangslage

Gemessen teuer waren: `backdrop-filter`, Dauer-Animationen (rotierende Ringe 52s/19s, Radar-Sweep mit `conic-gradient`, `hud-pulse`, `hud-breathe`, Scanlines) und `transform` auf großen Teilbäumen beim Seitenwechsel. Die Motion-Regeln sind daraufhin so geschnitten, dass **keine dieser Kategorien mehr existiert**.

## Es gibt genau drei Bewegungen im System

| # | Bewegung | Dauer | Kurve | Eigenschaften | Umfang |
|---|---|---|---|---|---|
| 1 | Zustandswechsel | 120ms | `linear` | nur `color`, `background-color`, `border-color` | einzelne Zeile, einzelner Knopf, einzelnes Segment |
| 2 | Zahlenannäherung | 240ms | `cubic-bezier(0.2, 0, 0.2, 1)` | Textinhalt einer Ziffer und `stroke-dashoffset` eines Ringbogens | höchstens 4 Knoten gleichzeitig (Ring: 3 Bögen + 1 Ziffer) |
| 3 | Seitenwechsel | 140ms | `linear` | ausschließlich `opacity` 0.5 → 1 | der Ansichtscontainer |

**`@keyframes` kommt im gesamten Projekt null Mal vor.** Es gibt keine `animation`-Eigenschaft, kein `animation-iteration-count`, kein `infinite`.

## Verbindliche Grenzen

- **Kein `transform`, nirgends** — nicht beim Seitenwechsel, nicht bei `:active`, nicht an Icons, nicht an Modalen. Kein `scale(0.93)`, kein `translate`. Damit entsteht keine Compositing-Ebene über dem Seitenbaum und kein Umkopieren von SVG-Inhalten.
- **Kein `will-change`.** Die 140ms-Opacity braucht keine Vorbereitung; ein permanentes `will-change: opacity` erzeugt genau die Dauerebene, die vermieden werden soll.
- **Kein `backdrop-filter`, kein `filter`, kein `box-shadow` mit Blur** — also keine Eigenschaft, die pro Frame neu komponiert werden muss.
- **Berührungsrückmeldung kostet nichts:** `:active { background: var(--head); transition: none }` plus `touch-action: manipulation` auf allen klickbaren Elementen. Keine Skalierung, kein Aufleuchten.
- **Die Zahlenannäherung bricht ab**, sobald die Restdifferenz kleiner als 0,5 Einheiten (bzw. 0,5 %) ist; danach wird der Endwert gesetzt und die `requestAnimationFrame`-Schleife beendet. Sie läuft nur, wenn der Knoten sichtbar ist (`IntersectionObserver`), und nie für Werte außerhalb des Viewports.
- **Die 140 Heatmap-Zellen tragen `transition: none`.** Sonst löst ein Themenwechsel 140 gleichzeitige Farbübergänge aus. Ebenso alle Wochenraster-Zellen und alle Diagrammbalken.
- **Der Themenwechsel ist übergangslos.** Vor dem Umschalten wird `.no-anim { transition: none !important }` auf `<html>` gesetzt, nach einem Frame (`requestAnimationFrame`) wieder entfernt. Kein 300ms-Farbverlauf über die ganze Seite.
- **Der Timer bewegt sich nicht, er zählt.** Die t-44-Ziffer wird einmal pro Sekunde als einzelner Textknoten ersetzt; wegen `tabular-nums` und fester `8ch`-Breite ändert sich kein Layout und kein Nachbar wird neu vermessen. Keine Übergänge auf dieser Ziffer. Die Statuslampe steht still — das 1-Hz-Blinken aus Entwurf 2 ist ausdrücklich verworfen, weil es eine Dauer-Animation ist.
- **Es gibt keine Deko-Bewegung.** Nichts rotiert, nichts atmet, nichts pulsiert, nichts sweept, nichts scrollt von allein. Kein Skeleton-Schimmer: Ladezustände zeigen die Leerzeile aus Baustein 27 mit dem Text „LADEN" in t-11 --ink-600.

## Abschaltung

```css
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important } }
html[data-motion="off"] *, html[data-motion="off"] *::before { transition: none !important }
```
Der Schalter „Bewegte Effekte" in den Einstellungen setzt `data-motion="off"` und schaltet zusätzlich die JS-Zahlenannäherung ab (Endwerte werden direkt gesetzt). Weil es nur drei Bewegungen gibt, schaltet der Schalter tatsächlich **alles** ab — das war beim alten Stand nicht der Fall.

## Prüfbare Budgets

- Ein Ansichtswechsel darf höchstens **einen** Style-Recalc und **einen** Paint auslösen; gemessen mit dem Performance-Panel bei 4× CPU-Drosselung: Frame-Zeit < 16ms.
- Im Ruhezustand (keine Interaktion) beträgt die Frame-Rate 0 gezeichnete Frames pro Sekunde. Jeder gezeichnete Frame ohne Nutzereingabe ist ein Fehler.
- Die Zahlenannäherung darf höchstens 4 gleichzeitige rAF-Schleifen haben; eine fünfte wird nicht gestartet, sondern setzt den Endwert.


---

# Verbotsliste — Nachweis

| Verbot | Wie das System es vermeidet | Rückfall-Indikator |
|---|---|---|
| **Glaskacheln** (`--glass` als `linear-gradient` über `rgba(11,17,25,0.74)`, `--glass-edge`, `.tile::before`-Lichtschimmer) | Es gibt keine halbtransparente Fläche und keinen Verlauf. Trennung leisten drei opake Grundwerte (`--bg` #0B0B0C, `--panel` #121315, `--head` #191B1D) und 1px-Haarlinien. `.tile` ist gelöscht; eine Sektion besteht aus 22px-Kopfzeile + 1px-Regel + Inhalt. Eine Fläche ohne 1px-Kante existiert nicht (nur Formularbereich, Modal, Popover haben beides). | `grep -E "rgba\(|--glass|linear-gradient|::before *\{[^}]*background"` findet Treffer; oder ein neues Element hat `background` **ohne** `border` |
| **Starke Rundungen** (`--r-tile` 26px, `--r-tile-sm` 22px, Textarea 18px) | Drei Radien: 0 (alles Tabellarische, Diagrammatische, Navigatorische), 2px (Knopf, Feld, Select, Textarea, Checkbox, Chip, kbd, Segment), 3px (nur Modal und Popover). Kein Wert über 3px. | `grep -E "border-radius: *([4-9]|[1-9][0-9])px"` findet Treffer |
| **Pillen-Buttons** (`--r-pill` 999px an `.btn`, `.pill`, `.inp`, `.hdr`, `.rail`, `.tabbar`, `.brief`) | `--r-pill` ist gelöscht. Knopf = 24px-Rechteck, 2px Radius, t-10 Mono uppercase. Kopfzeile, Rail, Mobil-Nav und Briefing sind randlose Zeilen mit 1px-Kante statt Kapseln. Segment-Umschalter stoßen mit geteiltem Rahmen aneinander (`margin-left: -1px`). Der Ein/Aus-Schalter in den Einstellungen ist ein Zwei-Segment-Umschalter, kein Kippschalter. | `grep -E "border-radius: *(999px|50%|9999px)"` findet Treffer; oder eine neue `.switch`-/`.toggle`-Klasse erscheint |
| **Schlagschatten und Glows** (`--glass-lift`, `0 0 9px var(--pc)`, `0 0 13px` an der Checkbox, `drop-shadow` an Diagrammlinie und Punkt, `text-shadow`) | `box-shadow` darf nur in zwei Formen vorkommen: `inset 0 0 0 1px` und `inset 2px 0 0`. Beide ohne Versatz, ohne Blur. `filter: drop-shadow` und `text-shadow` existieren null Mal. Ebene und Wichtigkeit entstehen aus Flächenwert, 1px/2px-Linie und Schriftkontrast. | `grep -E "box-shadow: *(?!inset 0 0 0 1px|inset 2px 0 0)"` findet Treffer; jedes `drop-shadow`, `text-shadow` oder jedes `0 0 Npx` |
| **Cyan/Violett-Palette** (#00E5FF, #A855F7, #00FF9D, #FF2D95, #FFB000, #FF6B35, #FF3B30) | Ersetzt durch sechs entsättigte Technikstift-Töne im gleichen Helligkeitsband (Moos #8AA75E, Messing #BE9B4B, Ton #B08A6E, Stahl #7E93B0, Grünspan #6E9C93, Tinte für Tasks) plus genau einen gesättigten Alarmton #E45B45. Die Chrome-Ebene ist vollständig unbunt. Kein Farbton im Cyan- oder Violettbereich; der einzige blaustichige Ton (Sport, S ≈ 26 %) trägt bewusst nicht die Systemidentität. | jeder Hexwert mit Sättigung > 60 % außer `--alert`; oder ein Modul-Token außerhalb der sieben definierten |
| **`backdrop-filter`** (laut Messung teuerster Einzeleffekt) | Kommt null Mal vor. Die einzige Kandidatenstelle — die Modal-Abdunklung — ist eine flache Farbe (`rgba(6,6,7,0.78)` dunkel, `rgba(30,29,26,0.55)` hell). Kopfzeile, Rail und Mobil-Nav sind opak. | `grep backdrop-filter` findet einen Treffer |
| **Generischer KI-App-Look** (Lila-Blau-Verlauf, Glow-Orb, radial-gradient-Briefing, leuchtendes Sternchen) | Kein `linear-gradient`, kein `radial-gradient`, kein `conic-gradient` im ganzen System — jede Fläche ist ein flacher Hexwert. Der Briefing-Orb wird ein 4×4px-Quadrat in --ink-600 vor einer t-15-Textzeile. Die Schriftwahl (Plex Mono/Sans) steuert gegen das übliche geometrische Grotesk. | `grep -E "gradient\("` findet Treffer; oder ein neues Element heißt `.orb`, `.halo`, `.glow` |
| **Marketing- und Onboarding-Flächen** (Heldenzone, Willkommensblock, Feature-Karte, Illustration, Tooltip-Rundgang) | Jede Ansicht beginnt in Zeile 1 mit dem Titel (t-10) und ab Zeile 2 mit Daten oder dem Eingabefeld. Der Login ist ein 280px-Formular auf `--bg`. Der Leerzustand ist eine 28px-Zeile mit Tastenkürzel, kein Kasten. | ein Textblock über 68 Zeichen, der nicht Briefing, Journal, Notiz, Modaltext oder Fehlermeldung ist; jedes `<img>` oder `<svg>` größer als 16px außer Ring, Heatmap, Diagramm |
| **Erklärbären-Texte** | Labels sind Substantive in t-10 (SERIE, WOCHENZIEL, ECTS), ohne Punkt, ohne Hilfesatz, ohne Tooltip-Prosa. Bestätigungsdialoge nennen nur die Konsequenz mit Zahl („Habit löschen — 214 Einträge werden mitgelöscht"), ohne Beschwichtigung. Fließtext existiert an genau vier Stellen: Briefing, Journal, Notiz, Fehlermeldung. | ein Label mit Verb, ein Satzzeichen in einem t-9/t-10-Label, jedes `title`-Attribut mit mehr als vier Wörtern außer Nav und Heatmap |
| **Deko-Animation** (gegenläufige Ringe `hud-spin` 52s/19s, Radar-Sweep, Gitter-Globus mit Trabanten, Wellenform, `hud-pulse`, `hud-halo`, `hud-breathe`, Scanlines, Vignette) | Komplett gestrichen, ersatzlos. `@keyframes` kommt im Projekt null Mal vor. Es bleiben drei Übergänge (120ms Zustand, 240ms Zahlenannäherung, 140ms Seiten-Opacity). Die Statuslampe blinkt nicht. Ladezustand ist eine Textzeile, kein Skeleton-Schimmer. | `grep -E "@keyframes|animation:|infinite"` findet Treffer; oder das Performance-Panel zeigt gezeichnete Frames ohne Nutzereingabe |
| **`transform` auf großen Teilbäumen** (`scale(0.93)`, `translate` in `viewIn`, Tipp-Skalierung) | Seitenwechsel animiert ausschließlich `opacity` 0.5 → 1 in 140ms auf dem Ansichtscontainer. `:active` setzt `background: var(--head)` mit `transition: none`. Kein `transform`, kein `will-change` im System. | `grep -E "transform:|will-change"` findet Treffer |
| **Farbige Flächenfüllungen als Statusanzeige** (`color-mix(... 12-24%, transparent)` an Checkbox, Rail, Tabbar, Segment, Knopf) | Farbe erscheint nur in 2px-Strichen, 1,5px-Linien, Datenmarken und t-9/t-10-Typo. Aktive Zustände nutzen die neutrale Fläche `--head` plus 2px-Marke in Modulfarbe. Die Checkbox zeigt einen 1,5px-Haken ohne Füllung. Kein Knopf, kein Rahmen, keine Fläche trägt eine Modulfarbe. | `grep -E "color-mix|background: *var\(--m-"` findet Treffer |
| **Zentriertes, luftiges Karten-Bento** (`.band` mit `flex-grow`, 15–18px Lücken, `.strip` mit `justify-content: center`) | 7/5-asymmetrisches Spaltenpaar (775/549px), linksbündige 28px-Zeilen, Sektionsgruppen ohne Zwischenabstand. Auf 390px werden Sektionen randlose Streifen (`margin-inline: -12px`) statt gestapelter Karten. Nie 6/6 im Cockpit. | `justify-content: center` außerhalb der Ring-Mitte; `gap` mit einem Wert, der nicht in `--s-1..--s-8` steht |
| **Runde Punktdarstellungen für Rasterdaten** (`.dots`, `.dmap` mit `border-radius: 50%`) | Heatmap und Wochenraster sind Quadrate mit Radius 0: 9×9 (12×12 mobil) mit 2px Lücke, fünf vorberechnete Hexstufen statt 140 Laufzeitmischungen. Punktreihen werden 4×4px-Quadrate. | `border-radius: 50%`; oder `color-mix` innerhalb einer Heatmap-Zelle |
| **Mono-Versalien als Allzweckstimme** | Mono uppercase existiert nur in t-9 und t-10 und nie länger als drei Wörter. Deutsche Inhalte laufen in Plex Sans gemischt. Fließtext ist nie Mono, Zahlen sind nie Sans. | ein `text-transform: uppercase` auf einer Größe ≥ 11px; Fließtext in Mono |
| **Dunkel-only-Neonwelt** | Zwei vollwertige Themen aus einem Token-Satz, dunkel als Standard, `prefers-color-scheme` als Vorbelegung, `[data-theme]` übersteuert. Jede Farbe ist in beiden Themen definiert; keine Farbe hat ihre einzige Definition in einem Media-Block. Themenwechsel ist übergangslos. | ein Farbwert, der nur innerhalb `@media (prefers-color-scheme)` definiert ist; ein Hexwert direkt im Regelkörper statt als Token |
| **Gestrichelter Leerzustands-Kasten** (`.empty` mit 20px Padding und 18px gestricheltem Rahmen) | Ersetzt durch eine 28px-Zeile in t-11 --ink-600 mit Tastenkürzel („Keine Aufgaben — n für neu"). Keine Fläche, kein Rahmen, keine Illustration. Das Anlegen-Feld steht immer darüber. | `border-style: dashed`; oder eine `.empty`-Regel mit `padding` > 8px |
| **Zu große Schrift und Zeilenhöhen als versteckter Dichtekiller** (body 15px/1.6, faktisch 40px-Zeilen) | Titel 13px Sans, Zahlen 12px Mono, Anzeigezeile 28px (36px nur bei `pointer: coarse` und Interaktivität), Tabellenkopf 22px. 16px behalten nur `input/textarea/select` unter `pointer: coarse`, damit iOS nicht zoomt. | eine Zeilenhöhe, die kein Vielfaches von 4 ist; `font-size` außerhalb der elf definierten Stufen; `line-height` als Faktor > 1.6 außerhalb von t-15 |


---

# Die neun Ansichten


## Cockpit (Startbildschirm)

*(aus dem Entwurfslauf)*


### Wichtigste Information

**Wie weit ist der heutige Tag — als eine Prozentzahl (t-44) in der Mitte des Tagesrings, direkt daneben der eine Briefing-Satz, der sagt, was daran noch fehlt.**

Begründung: Das Cockpit ist die einzige Ansicht, die nichts eigenes besitzt. Jede Zahl darauf gehört einem anderen Modul und ist dort vollständiger zu sehen. Der einzige Wert, der ausschließlich hier existiert, ist die gewichtete Tageszahl `0,4·Habits + 0,3·Tasks + 0,3·Lernziel`. Sie ist die Antwort auf die einzige Frage, mit der man morgens diese Seite öffnet: „Bin ich heute im Plan?" Alles andere auf der Seite ist entweder Zerlegung dieser Zahl (drei Ringbögen), Beweis für sie (140-Tage-Heatmap, Serie), Handlung an ihr (die zwei Heute-Listen) oder Horizont hinter ihr (Klausuren, Ziele, Woche).

Deshalb: eine Zahl bekommt die einzige t-44 der Ansicht, ein Satz bekommt die einzige Fließtextfläche, und beide stehen in einer Sichtlinie — Zahl links, Satz rechts daneben, nicht untereinander. Der Satz ist nicht Dekoration der Zahl, er ist ihre Ableitung: 74 % sagt nicht, ob die zwei fehlenden Habits oder die Klausur in 9 Tagen das Problem sind.

Ausdrücklich **nicht** primär: der Timer. Die zweite und letzte t-44 der App gehört Study. Im Cockpit steht die Lernzeit als t-12-Zeile mit 4×4-Lampe in --m-study — sonst hätte die App drei t-44 und die Regel wäre gebrochen.


### Hierarchie

1. 1. Tagesprozent t-44 --ink-900 in der Ringmitte (gewichtete Tageszahl, einmal in der Ansicht)
2. 2. Briefing-Satz t-15 Sans --ink-800, max 68ch, rechts neben dem Ring — nennt Habits, Aufgaben, Klausur (bei <=14 T in --alert), Lernzeit, Serie
3. 3. Die drei Ringboegen als Zerlegung: HABITS --m-habits (r58), TASKS --ink-800 (r48), LERNZIEL --m-study (r38), darunter drei 20px-Legendenzeilen mit 4x4-Quadrat, Wort t-10 --ink-600, Wert t-12 --ink-900
4. 4. Die zwei Handlungslisten rechts: HABITS HEUTE und TASKS OFFEN als Panelgruppe ohne Abstand — die einzigen Stellen, an denen das Cockpit schreibt statt liest
5. 5. Ausnahmen: 2px --alert-Marke links an der Zeile plus das Wort UEBERFAELLIG bzw. der Countdown in t-10 --alert (drei Kanaele, nie nur Farbe)
6. 6. SERIE t-28 --ink-900 (die einzige t-28 der Ansicht) an der rechten Zahlenkante der Heatmap-Sektion, daneben die 140 Zellen als Beweis derselben Aussage
7. 7. 14-Tage-Lernminuten als 14 Balken 18px in --m-study, heutiger Balken mit 2px --ink-900-Oberkante
8. 8. Horizont-Gruppe rechts: TRAINING 7 T (--m-sport), KLAUSUREN (--m-study), GOALS (--m-goals) mit 4px-Fortschrittsspur
9. 9. Kennzahlstapel unter dem Briefing: LERNEN HEUTE, WOCHE, JOURNAL, ECTS als t-10/t-12-Paare an der Zahlenkante x=843
10. 10. Chrome: 40px-Kopfzeile (JARVIS / COCKPIT / Systemzeile+Uhr), 52px-Rail mit neun Zielen — unbunt, ohne Flaeche, ohne Radius


### Layout

RASTER 1440×900 (kein Scrollen, nachgerechnet)

Rail 0–52 (48 Inhalt + 1px --line bei x=51,5). Seitenrand 24 → Inhalt x=76…1416 (1340px = 12×97 + 11×16).
Spaltenteilung 7/5, nie 6/6: **links x=76…851 (775px)**, Rinne 16, **rechts x=867…1416 (549px)**.
Die Seite hat genau **zwei rechte Zahlenkanten**: x=843 (linke Spalte, 851 − 8px Zellenpadding) und x=1408 (rechte Spalte). Jede wiederkehrende Zahl endet an einer davon.

```
 x76                                              851   867                            1416
  ┌────────────────────────────────────────────────────────────────────────────────────┐ 40px Kopfzeile
  │ JARVIS            COCKPIT                              ▪ LOKAL        14:32        │ t-10/t-10/t-12
  ├────────────────────────────────────────────────────────────────────────────────────┤ 1px --line
     (24px)
  ┌──────────────┐  148                              843
  │ ╭──╮ 132×132 │  Guten Morgen, Ali. Du hast heute 2 von 5 Habits offen und 4        │ t-15 Sans
  │ │74│ t-44 %  │  Aufgaben auf dem Tisch. Achtung: die Klausur Analysis II ist       │ lh 23, 68ch
  │ ╰──╯ r58/48/38│ in 9 Tagen. Heute schon 42 min gelernt, 6. Tag in Folge.           │ (3 Zeilen = 69)
  │  (8px)       │                                                                     │
  │ ▪ HABITS  3/5│                              (8px)              LERNEN HEUTE  42 MIN│ 20px
  │ ▪ TASKS  7/11│                                                        WOCHE   4 H 20│ 20px
  │ ▪ LERNZIEL 42/90│                                                   JOURNAL    HEUTE│ 20px
  └──────────────┘  200px                                                ECTS  84 / 180 │ 20px
                                                                    ↑ Kante x=843
     (24px)                                                                              (rechte Spalte
  ▌ AKTIVITÄT · 140 TAGE ─────────────────────── TAGE AKTIV 96 ─┤ 22px sec-head           beginnt oben
  ┌─ 1px --line ───────────────────────────────────────────────┘                          bei y=65)
  │ ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪  20×9px, gap 2               41      │
  │ ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪  = 218 × 75px            t-28 --ink-900│
  │ ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪                          SERIE (TAGE)  │
  │ ▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪▪                             BESTE 47 T │
  │ 0 ▫▫▫▫▫ 4   t-9 --ink-600                                   │ 126px gesamt
     (24px)
  ▌ LERNMINUTEN · 14 T ──────────────────────────── Ø/TAG 47 ─┤
  ┌─────────────────────────────────────────────────────────────┘
  │ ▁▃▅▂▇▄▁▃▆▂▅▃▄█  14×18px, gap 4 = 304 × 72px    WOCHE 4 H 20 │
  │ 27.07.                          MAX 118    10.08.           │ 123px gesamt
```

RECHTE SPALTE x=867…1416, zwei Panelgruppen (innerhalb 0px Abstand, nur die Sektionsregel; zwischen den Gruppen 24px):

```
 x867                                                          1408 1416
  ▌ HABITS · HEUTE ────────────────────── ERLEDIGT 3/5 ──── ␣ J K ┤ 22 + 1
  ├─────────────────────────────────────────────────────────────┤
  │ ☐  Lesen 20 min                                    2/7      │ 28  ← 6 Zeilen
  │ ✓  Sport                                           4/4      │ 28     = 168
  │ ☐  Kein Zucker                                     5/7      │ 28
  │ ✓  Vokabeln                                        6/7      │ 28
  │ ✓  Journal                                         3/3      │ 28
  │    … 2 WEITERE — g h                                        │ 28  Restzeile t-11
  ▌ TASKS · OFFEN ────────────────────────────── OFFEN 7 ─── n ␣ ┤ 22 + 1   (0px Abstand!)
  ├─────────────────────────────────────────────────────────────┤
  ┃ ☐  Hausarbeit abgeben          ÜBERFÄLLIG · SA 08.08.       │ 28  2px --alert links
  │ ☐  Rückmeldung Uni             HEUTE 16:00                  │ 28
  │ ☐  Steuer sortieren            MORGEN                       │ 28
  │ ☐  Protokoll Physik            DO                           │ 28
  │ ☐  Reifen wechseln             19.08.                       │ 28
  │    … 2 WEITERE — g t                                        │ 28
     (24px  ← einziger Gruppenabstand der Spalte)
  ▌ TRAINING · 7 TAGE ───────────────────────── MIN 245 ────────┤
  ├─────────────────────────────────────────────────────────────┤
  │ SO   Push                                        62 MIN     │ 28  ← 4 Zeilen
  │ FR   Laufen                                      38 MIN     │ 28
  │ MI   Pull                                        71 MIN     │ 28
  │ MO   Beine                                       74 MIN     │ 28
  ▌ KLAUSUREN ──────────────────────────────── NÄCHSTE 9 T ─────┤
  ├─────────────────────────────────────────────────────────────┤
  ┃ Analysis II            19.08.                     9 T       │ 28  2px --alert + t-10 --alert
  │ Datenbanken            04.09.                    25 T       │ 28
  │ Statistik              21.09.                    42 T       │ 28
  ▌ GOALS ─────────────────────────────────────── AKTIV 4 ──────┤
  ├─────────────────────────────────────────────────────────────┤
  │ 10 kg abnehmen      63 T   ████████░░░░  4px        68 %    │ 28  ← 4 Zeilen
  │ Bachelor fertig    214 T   █████░░░░░░░              41 %   │ 28
  │ 1000 Vokabeln       LAUFEND ███████████░             92 %   │ 28
  │ Marathon             28 T   ███░░░░░░░░░             24 %   │ 28
```

MASSE IM EINZELNEN

Kopfzeile: 40px, `position: sticky`, opak --bg, 1px --line unten, Radius 0. Links JARVIS t-10 --ink-900 (x=76). Mitte COCKPIT t-10 --ink-900 (Seitentitel, genau einer). Rechts 4×4-Quadrat --ink-600 + LOKAL t-10 --ink-600 + Uhr t-12 --ink-800, Kante 1416.

Instrumentenzeile (y=65…265, 200px, **ohne Sektionskopf**): Der Ring ist die zweite Zeile der Seite, seinen Titel liefert die Kopfzeile — deshalb kein sec-head und damit keine erfundene Cockpit-Modulfarbe. SVG 132×132 bei x=76. Drei Bögen `stroke-width: 2`, `linecap: butt`, Start −90°, Spur --line: r58 HABITS --m-habits, r48 TASKS --ink-800 (= --m-tasks), r38 LERNZIEL --m-study. Mitte t-44 --ink-900, „%" als span t-6-sub `vertical-align: .55em` --ink-600. 8px darunter drei Legendenzeilen à 20px (4×4-Quadrat, 4px, Wort t-10 --ink-600, Wert t-12 --ink-900 rechts bei x=208). Summe 132+8+60 = 200.
Briefing: x=148, Breite 500px (68ch), t-15 lh 23, --ink-800; Zahlen im Satz erben ihre Modulfarbe, ein Klausur-Countdown ≤14 T steht in --alert. 8px darunter der Kennzahlstapel: 4 Zeilen à 20px, Label t-10 --ink-600 ab x=671, Wert t-12 --ink-900 endend an x=843, Einheit t-10 --ink-450 mit 4px Abstand. Läuft der Timer, sitzt vor LERNEN HEUTE ein statisches 4×4-Quadrat in --m-study.

Sektionskopf (überall gleich): 22px, `grid-template-columns: 2px auto 1fr auto`, gap 8. 2×12px-Signalstrich in Modulfarbe, Label t-10 uppercase in Modulfarbe, rechts Legende t-10 --ink-600 + Kennzahl t-20 --ink-900 (Verhältnis 2:1) und/oder kbd-Chips 16px. `border-bottom: 1px --line` über die volle Spaltenbreite, das Label unterbricht sie (`background: var(--bg); padding-right: 8px`). 24px darüber, 8px darunter (3:1).

Zeile: 28px, Padding `0 8px`, `tr + tr { border-top: 1px --line-hair }`, hover/`:active` `background: var(--head)`, ganze Zeile Klickziel, `touch-action: manipulation`.
Habits/Tasks: `[check 28px] [title minmax(0,1fr)] [meta auto] [value 56px rechts]`. Checkbox 16×16, 1px --line, --r-2, gesetzt 1,5px-Haken in --m-habits ohne Füllung, erledigter Titel `line-through` --ink-450, Trefferfläche 28×28.
Training: `[32px Wochentag t-11] [type 1fr] [value 56px]`. Klausuren (Baustein 30): `[title 1fr] [date 64px t-11] [rest 40px t-12 + T t-10]`. Goals: `[title 1fr] [countdown 56px t-11] [bar 96px] [4px] [value 40px]`, Balken 4px hoch, Radius 0, Spur --line, Füllung flach --m-goals, Zielmarke 1px --ink-450.

Höhenrechnung Seite: 40 Kopf + 1 Regel + 24 = 65.
Links: 200 + 24 + 126 + 24 + 123 = **497** → endet y=562.
Rechts: 5 Köpfe à 23 = 115, Zeilen 6+6+4+3+4 = 23 × 28 = 644, ein Gruppenabstand 24 → **783** → endet y=848 + 24 Seitengrund = **872 < 900 ✓**.
Die Spalten enden auf 562 und 872. Das wird nicht ausgeglichen — Ausgleich würde aus zwei Lesewegen ein Kachelpaar machen.

Zwischenschritt 900–1023px: Rail wandert nach unten, Raster 6/6, Reihenfolge wie mobil.


### Bei 390px

390px, Inhaltsbreite 366 (Seitenrand 12), Kopfzeile 32, Mobil-Nav 48 + `env(safe-area-inset-bottom)`. Alle Linien laufen randlos durch (`margin-inline: -12px; padding-inline: 12px`) — eine Sektion liest sich als Streifen, nie als Karte. Rechts in der Kopfzeile der beschriftete Textknopf INDEX (32×24, Trefferfläche 44×44) für Uni, Goals, Sport, Einstellungen.

**Reihenfolge (bewusst anders als Desktop):** Ring → Briefing → HABITS HEUTE → TASKS OFFEN → Kennzahlstapel → Heatmap → 14-Tage → TRAINING → KLAUSUREN → GOALS.
Grund: Auf dem Handy wird gehandelt, nicht ausgewertet. Der Kennzahlstapel und die zwei Rückblick-Grafiken rutschen hinter die beiden Listen, weil sonst die 10-Zeilen-Regel bricht (Rechnung unten).

Maße mobil:
- Ring 120×120, Radien 53/44/35, t-44 unverändert 44px. Legende 3×20 = 60 → Block 188px, zentriert? **Nein**: linksbündig bei x=12, damit die Legendenwerte an der Zahlenkante x=366−12−8=346 enden.
- Briefing über die volle Breite 366 (ca. 49ch → 4 Zeilen = 92px), t-15 unverändert.
- Sektionsabstand 20px statt 24 (2,5:1), Sektionskopf bleibt 22px, Zeilen bleiben 28px, **interaktive Zeilen 36px** (`pointer: coarse`), Checkbox-Trefferfläche 36×36, kbd-Chips ausgeblendet.
- Heatmap: Zelle 12×12, gap 2 → 278×96, passt in 366 (88px Reserve, kein Scroll). Die t-28-SERIE-Zahl rutscht in dieser Sektion aus der Zeile nach oben in den Kopf-Bereich: Kopf 22 + Zahlblock (32+4+14 = 50) rechtsbündig über der Karte, darunter die Karte.
- 14-Tage-Diagramm: unverändert 304×72, passt (62px Reserve).
- Kennzahlstapel: 4 Zeilen à 20px, Label links x=12, Wert rechts bis x=346.
- Zeilen mit `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` beim Titel; Meta- und Wertspalte behalten ihre Breite, der Titel gibt nach. Nichts scrollt horizontal.

Nachrechnung erster Bildschirm (iPhone 844px, sichtbar 844 − 32 Kopf − 48 Nav = **764px**):
188 Ring + 16 + 92 Briefing = 296 · +20 Abstand + HABITS (22+1+6×36 = 239) = **555** · +0 (Panelgruppe) + TASKS (23 + 5×36 = 203) = **758 ≤ 764**
→ sichtbar ohne Scrollen: 6 Habit-Zeilen + 5 Aufgaben-Zeilen = **11 Tabellenzeilen ✓** (gefordert: ≥10). Der Tagesprozentwert steht dabei in Zeile 2 des Bildschirms, das Briefing daneben — die primäre Information ist nie unter der Falz.


### Statt Karten

**Was statt Karten steht — konkret gegen die alte Fassung gerechnet:**

1. **Statt `GlassTile` (Glaskachel, starker Radius, Lichtschimmer, `backdrop-filter`): der Sektionskopf.** 22px-Zeile, 2×12px-Signalstrich in Modulfarbe, t-10-Label das eine 1px-`--line` unterbricht, 24px Luft darüber und 8px darunter. Die Regel ist die Kachel. Vier Kacheln übereinander erzeugten vier Rahmen, vier Radien, vier Schatten und vier Innenabstände von je 16px — das sind 64px Chrome pro Spalte, in denen keine Information steht. Der Sektionskopf kostet 22px und trägt zusätzlich eine Kennzahl.
2. **Statt der 13 `Pill`-Elemente (`hub__side`, `hub__leg`, `strip`): rechtsbündige Kennzahl-Paare an zwei Zahlenkanten (x=843, x=1408).** Eine Pille macht aus einem Zahlenpaar ein Objekt mit Rand; zehn Pillen machen daraus einen Fleckenteppich, in dem keine Zahl mit einer anderen vergleichbar ist. Untereinander an einer gemeinsamen rechten Kante sind sie in einem Blick lesbar, ohne einen einzigen Pixel Rahmen.
3. **Statt `RoundCheck` (runder Haken): 16×16-Quadrat, 1px --line, --r-2, 1,5px-Haken in --m-habits ohne Füllung.** Kein Radius über 3px existiert im System.
4. **Statt `DotRow` (Punktreihe je Habit als zweiter visueller Kanal): die Zahl `4/7` in t-12 an der Zahlenkante.** Der Punktkanal wiederholte nur, was die Zahl schon sagt, und kostete sieben DOM-Knoten pro Habit-Zeile.
5. **Statt `Empty` (Kasten mit Erklärsatz): die 28px-Leerzeile** mit Text plus Kürzel, ohne Rahmen, ohne Illustration.
6. **Statt Sparkline mit Fläche/Punkten und rotierendem Globus/Trabanten/Radar-Sweep: 14 flache Balken und drei statische Bögen.** `@keyframes` kommt in der Ansicht null Mal vor, `transform` nirgends, im Ruhezustand werden 0 Frames gezeichnet.
7. **Statt Bento-Bänder in ungleichen Anteilen (`f5 f4 f3`, dreimal wiederholt = neun Kacheln): zwei Lesewege.** Links die Kette Ring → Briefing → Heatmap → Verlauf (Erkenntnis), rechts zwei Panelgruppen (Handlung, Horizont). Die 7/5-Teilung ist Absicht: 6/6 liest sich als Kachelpaar.

**Entscheidungen, die das System offen lässt — hier benannt, nicht heimlich erfunden:**

- **Das Cockpit hat keine Modulfarbe.** Ich habe deshalb *keine* erfunden, sondern der Instrumentenzeile den Sektionskopf ganz genommen: Der Ring ist Zeile 2 der Seite, seinen Titel trägt die Kopfzeile (COCKPIT). Der zusammengesetzte Tageswert steht in --ink-900 — dieselbe Rolle, in der --ink-900 schon die 2px-Oberkante des heutigen Balkens und den Timer trägt.
- **Die drei Bögen zeigen die drei Summanden, nicht „Tag/Habits/Lernziel".** Anforderung §4.1 nennt als Bögen Tag/Habits/Lernziel, die Formel hat aber drei Eingänge (Habits 0,4 / Tasks 0,3 / Lernziel 0,3). Läge „Tag gesamt" auf einem Bogen, stünde derselbe Wert zweimal im selben Instrument und der Tasks-Anteil wäre unsichtbar. Also: Mitte = Ergebnis, drei Bögen = die drei Eingänge, Bogen TASKS in --ink-800 (= --m-tasks, die im System bewusst vorgesehene siebte Nicht-Farbe). Keine neue Farbe.
- **Widerspruch im System, den ich zugunsten der Typografie auflöse:** Hierarchieregel 4 verlangt den Seitentitel in t-10 **--ink-900**, Baustein 20 nennt für den Ansichtsnamen in der Kopfzeile am Desktop **--ink-600**. Ich nehme --ink-900 (Regel schlägt Bausteinnotiz) und halte damit „genau ein Seitentitel pro Ansicht" ein.
- **Neu abgeleitet, ohne neues Token: die „Restzeile".** 28px, t-11 --ink-600, `… 2 WEITERE — g t`. Sie ist Baustein 27 (Leerzeile) in ihrer zweiten Rolle: gleiche Höhe, gleiche Stufe, gleiche Farbe, Text plus Kürzel. Ohne sie wäre eine gekappte Liste eine Lüge.
- **Der Timer bekommt hier bewusst keine große Zahl.** Die zwei erlaubten t-44 der App sind Cockpit-Ring und Study-Timer; ein Timer-Readout im Cockpit wäre die dritte. Er steht als t-12-Zeile LERNEN HEUTE mit statischer 4×4-Lampe in --m-study. Der Start/Buchen-Knopf aus der alten Fassung entfällt im Cockpit ganz — er hatte dort einen echten Fehler (Buchen unter 30 s löschte die Zeit kommentarlos); Buchen gehört in die Study-Ansicht, das Cockpit ruft es per `g s` auf.
- **Was mir fehlt:** ein Token für die vertikale Höhe einer Legendenzeile im Ring-Hub. Baustein 14 nennt die Inhalte, nicht die Zeilenhöhe. Ich setze 20px (t-12 lh 16 + 4 = Vielfaches von 4) und keine 28px-Anzeigezeile, weil die drei Zeilen zum Instrument gehören und nicht zu einer Liste.


### Zustände

- **Ladend** — Chrome ist sofort da, nichts springt. Der Ring zeichnet nur seine drei Spuren in --line, ohne Bogen; in der Mitte steht ein En-Dash in t-44 --ink-450 (Nichtinformation, kein 0). Die drei Legendenwerte und der Kennzahlstapel zeigen En-Dash --ink-450. Statt des Briefings eine 28px-Zeile 'LADEN' t-11 --ink-600. Jede Sektion behält ihren Kopf (Label und Regel stehen sofort), ihre Kennzahl ist En-Dash, ihr Inhalt eine einzige 28px-Zeile 'LADEN' t-11 --ink-600. Kein Skeleton-Schimmer, keine Platzhalterblöcke, keine Höhenänderung beim Eintreffen der Daten: die Sektionshöhen sind durch die Kopfzeile plus geplante Zeilenzahl vorbestimmt, die Zahlen laufen in 240ms auf ihren Wert (Baustein-Bewegung 2, höchstens 4 rAF-Schleifen: 3 Bögen + 1 Ziffer), die Heatmap-Zellen tragen `transition: none`.
- **Leer, komplett neue Installation** — der Ring steht bei 0: Spuren in --line, keine Bogenlänge, Mitte '0' plus '%' in t-6-sub in **--ink-900**, nicht --ink-450. Ein gemessenes 0 % ist Information, ein fehlender Wert ist En-Dash — das ist der Unterschied, und er wird eingehalten. Das Briefing bringt seinen dafür vorgesehenen Satz ('Du hast noch keine Habits angelegt — fang mit einem an, der Rest kommt von selbst.'), t-15, keine Sonderbehandlung. Jede Sektion behält Kopf und Regel und zeigt genau eine 28px-Leerzeile, t-11 --ink-600, Text plus Kürzel: 'Keine Habits — g h' · 'Keine Aufgaben — g t' · 'Keine Einheit in 7 Tagen — g p' · 'Keine Klausur eingetragen — g u' · 'Keine aktiven Ziele — g o'. Heatmap: 140 Zellen in --hm-0, Legende bleibt, SERIE zeigt '0' (gemessen). 14-Tage: 14 Balken der Höhe 0, nur die 1px-Grundlinie in --line ist zu sehen. Kein gestrichelter Rahmen, kein Onboarding-Kasten, kein Erklärabsatz — die Seitenhöhe ist identisch zum gefüllten Zustand (872px), es entsteht kein zweites Layout.
- **Leer je Sektion bei sonst vollen Daten** — nur die betroffene Sektion nimmt ihre Leerzeile, die Panelgruppe bleibt zusammen (0px Abstand, nur die Regel). Sonderfall Habits alle erledigt: keine Leerzeile, sondern die fünf Zeilen mit gesetztem Haken und `line-through` --ink-450, Kennzahl im Kopf 5/5, Briefing 'Alle 5 Habits sind heute abgehakt.' — der Zustand 'fertig' ist kein Leerzustand.
- **Fehler einer Mutation (Haken setzen scheitert, optimistisches Update wird zurückgerollt)** — die Zeile springt in ihren alten Zustand zurück, und unmittelbar darunter erscheint eine 36px-Fehlerzeile: 2px --alert-Marke links (`box-shadow: inset 2px 0 0 var(--alert)`), Text t-15 Sans in --alert mit der echten Ursache ('Speichern fehlgeschlagen — offline. Häkchen zurückgenommen.'), rechts der sekundäre Knopf WIEDERHOLEN (24px, 1px --line) plus kbd-Chip R. Keine Toast-Blase, kein Overlay, keine Bewegung — dieselbe Mechanik wie die Rückgängig-Zeile (Baustein 26). Der Fehler wird nicht verschluckt und verschwindet nicht von selbst; er verschwindet, wenn er behoben oder die Zeile verlassen wird.
- **Fehler beim Laden des ganzen Bestands** — Kopfzeile und Rail stehen normal, die Systemzeile rechts wechselt auf 4×4-Quadrat in --alert plus 'FEHLER' t-10 --alert. Unter der Kopfregel eine Meldung t-15 --alert, max 68ch, mit der Ursache, daneben der sekundäre Knopf NEU LADEN. Ring, Kennzahlen und alle Sektionskennzahlen stehen auf En-Dash --ink-450, jede Sektion behält Kopf und Regel — das Gerüst lügt nicht und verschwindet auch nicht. Teilfehler (nur eine Sammlung scheitert) betrifft nur deren Sektion: dort die Fehlerzeile, alle anderen Sektionen zeigen normale Daten. Ein teilweise geladenes Cockpit zeigt niemals eine Prozentzahl, die auf fehlenden Sammlungen beruht — fehlt ein Summand der Tagesformel, steht in der Ringmitte En-Dash und die betroffene Legendenzeile trägt 'FEHLER' t-10 --alert.
- **Sehr viele Einträge (ein Jahr Verlauf, hunderte Zeilen)** — die Cockpit-Höhe ist datenunabhängig konstant, 872px auf 1440×900, und das ist die eigentliche Antwort: die Seite wächst nicht mit dem Bestand, sie kappt. Feste Obergrenzen: Habits 6 Zeilen, Tasks 6, Training 4, Klausuren 3, Goals 4, dahinter jeweils die 28px-Restzeile '… 214 WEITERE — g t'. Die Heatmap bleibt bei genau 140 Zellen (20×7), auch bei drei Jahren Verlauf; ein Jahr wird hier nicht gezeigt, das ist die Aufgabe der Habits-Ansicht. Das Diagramm bleibt bei genau 14 Balken. DOM-Budget also konstant bei rund 140 + 14 + 23 Zeilen ≈ 200 sichtbaren Knoten, unabhängig von 300 oder 30.000 Datensätzen — keine Virtualisierung nötig, weil nichts virtualisiert werden muss.
- **Auswahl beim Kappen ist eine inhaltliche Regel, nicht 'die ersten sechs'** — Habits: unerledigt zuerst, darin nach Wochendefizit (Ziel minus Ist) absteigend; erledigte fallen in die Restzeile ('… 3 ERLEDIGT'). Tasks: nach Fälligkeit aufsteigend, überfällige immer zuerst und immer sichtbar — eine überfällige Aufgabe darf nie in der Restzeile verschwinden; sind es mehr als 6 überfällige, zeigt die Sektion 6 davon und die Restzeile trägt selbst die 2px --alert-Marke und '… 9 WEITERE ÜBERFÄLLIG — g t'. Klausuren: nur die nächsten drei, ≤14 T immer sichtbar. Training: echte Datumsfilterung der letzten 7 Tage (nicht 'die letzten drei Einträge'), sonst leer. Goals: aktive nach nächstem Zieldatum.
- **Rechenlast bei großem Bestand** — jede wiederholte Frage ('ist Habit X an Tag Y erledigt') läuft über eine einmal gebaute Map/Set, nie über einen Vollscan je Zelle; die 140 Heatmap-Werte und die 14 Tagessummen entstehen in einem Durchlauf über die Einträge. Die 240ms-Zahlenannäherung startet nur für sichtbare Knoten (IntersectionObserver) und bricht unter 0,5 Einheiten Restdifferenz ab. Ein Ansichtswechsel kostet einen Style-Recalc und einen Paint (140ms Opacity 0,5 → 1, kein `transform`).
- **Timer läuft im Hintergrund** — die Zeile LERNEN HEUTE zählt gegen die Systemuhr mit (nicht per Taktzählung), ihr Wert ist t-12 mit tabular-nums, davor das statische 4×4-Quadrat in --m-study. Kein Blinken, keine Dauer-Animation, kein Layout-Reflow der Nachbarn. Bei `prefers-reduced-motion` oder data-motion='off' fallen alle drei Übergänge weg und Endwerte werden direkt gesetzt — auch die Bogenlängen.


## Habits

*(aus dem Entwurfslauf)*


### Wichtigste Information

Die wichtigste Information ist das Wochenraster Habit × Mo–So — und darin die Spalte HEUTE. Habits sind keine Lese-, sondern eine Abhak-Ansicht: der Nutzer kommt einmal am Tag, um Häkchen zu setzen, und will im selben Blick sehen, ob die Woche hält. Beides steckt in genau einer Matrix: die Zeile ist der Habit, die Spalte der Tag, die Zelle ist gleichzeitig Anzeige und Klickziel. Deshalb ist das Raster nicht ein Widget neben anderen, sondern das Layout selbst: es steht in Zeile 2 (direkt unter Kopfzeile und Sektionsregel), es bekommt die 7 breiten Spalten des 12er-Rasters, und alles andere (Serie, Heatmap, Anlegen, Löschen) ordnet sich darunter oder rechts daneben ein. Die Serie (t-28) ist bewusst nur die zweite Stimme: sie ist Folge des Rasters, nicht sein Ersatz. Die 140-Tage-Heatmap ist Archiv — sie beantwortet „wie war das Jahr", nicht „was ist heute zu tun", und sitzt darum in der schmalen Spalte.


### Hierarchie

1. 1. Wochenraster: Habit-Zeile × 7 Tageszellen 30×30, Spalte HEUTE dreifach markiert (Grund --head, Kopf-Label --ink-900, 2px --m-habits-Unterstreichung unter dem Tageskopf)
2. 2. Kennzahl HEUTE im Sektionskopf WOCHE: t-20 „3/5" --ink-900, Legende t-10 links
3. 3. SOLL-Spalte je Zeile: 4/5 in t-12 an gemeinsamer rechter Kante, plus 16px-Haken in --m-habits, sobald das Wochenziel erreicht ist
4. 4. Serie: einzige Leitzahl der Ansicht, t-28 mit Einheit T in t-6-sub, Legende SERIE · TAGE darunter
5. 5. Heatmap 140 Tage (20×7) mit Zeitraum-Umschalter 7 | 30 | 140 TAGE
6. 6. Nebenkennzahlen: BESTE, Ø/WOCHE (t-20 in SERIE) sowie ERFASST, SPITZE, LÜCKEN (t-12 neben der Heatmap)
7. 7. Formularbereich NEUER HABIT (Name + Wochenziel als 7-Segment-Umschalter) — einzige Fläche der Seite
8. 8. Tabelle BESTAND: Verwaltung und Löschen, damit die Abhak-Matrix keine Aktionsspalte tragen muss
9. 9. Betriebszeilen: Rückgängig-Zeile, Fehlerzeile, Leerzeile — alle 28px, im Fluss, nie schwebend


### Layout

RASTER UND REGIONEN (1440×900)
Rail 52 (48 + 1px --line) | 24 Rand | Inhalt 1340 | 24 Rand. 12 Spalten minmax(0,1fr), 16px Rinnen = 97px/Spalte.
Aufteilung 7/5 wie im Cockpit: LINKS Spalten 1–7 = 775px (Abhak-Region), RECHTS Spalten 8–12 = 549px (Archiv + Verwaltung). Nie 6/6.
Kopfzeile 40 + 1px --line + 24px Abstand, dann beginnen beide Spalten auf gleicher Höhe und enden auf verschiedener. Das wird nicht ausgeglichen.

LINKS ist EINE Panelgruppe: S1 WOCHE und S2 SERIE stoßen ohne Abstand aneinander, getrennt nur durch die 1px --line von S2. Rechts drei eigenständige Sektionen mit 24px Grund dazwischen.
Gemeinsame rechte Zahlenkante links: x = 767 (775 − 8 Zellpadding). Rechte Spalte: x = 541.

S1 SEKTION „WOCHE" (Hero)
Kopf 22px, grid 2px auto 1fr auto, gap 0 8:
  [2×12px Signalstrich --m-habits][WOCHE t-10 uppercase --m-habits, unterbricht die Regel: background --bg, padding-right 8][1fr][kbd j k ␣ je 16px, gap 8][HEUTE t-10 --ink-600 · 8 · 3/5 t-20 --ink-900, Schrägstrich --ink-600]
  darunter border-bottom 1px --line über 775, darunter 8px.
Tageskopf 22px, sticky top:40, background --head, border-bottom 1px --line:
  Spalten identisch zur Datenzeile. MO DI MI DO FR SA SO als t-9 uppercase --ink-600, zentriert über den 30px-Zellen. Heutiger Kopf --ink-900 + 2px --m-habits auf der Unterkante.
Datenzeile, Raster-Arithmetik verbindlich:
  grid-template-columns: [name] 454px (minmax(0,1fr)) | 8 | [raster] 222px (7×30 + 6×2) | 4 | [flag] 16px | 4 | [soll] 51px (7ch)
  454 + 8 + 222 + 4 + 16 + 4 + 51 = 759 = 775 − 2×8 Padding. ✓
  Zeilenteilung 32px (Zelle 30 + 2px Rasterlücke --s-1). Keine Haarlinie zwischen Rasterzeilen: die 2px-Lücke IST der Trenner. Haarlinien kommen erst in S5 zurück.
  name: t-13 Sans --ink-800, ellipsis, nowrap. soll: t-12 Mono tnum, Ist --ink-900, „/5\" --ink-600, rechte Kante 767. flag: 16px-Haken --m-habits nur bei Ist ≥ Ziel, sonst leer (kein En-Dash, kein Platzhalter).
  Zelle: 30×30, r-0. Leer 1px --line. Gesetzt 1,5px-Haken --m-habits, keine Füllung. Heutige Spalte background --head. Zukunft 1px --ink-450, nicht klickbar, pointer-events none.
  Hover/:active sitzt auf der ZELLE (background --head, transition none), nicht auf der Zeile — die Zeile hat sieben Ziele. Tastatur: role="grid", wandernder tabindex, j/k Zeile, ←/→ Tag, Leertaste umschalten; fokussierte Zeile box-shadow inset 2px 0 0 var(--focus).
  Höhe bei 5 Habits: 5×30 + 4×2 = 158. S1 gesamt 22 + 1 + 8 + 22 + 158 = 211.

S2 SEKTION „SERIE" (stößt an S1 an, kein 24px)
Kopf 22px: [2px --m-habits][SERIE t-10][1fr][WOCHE t-10 --ink-600 · 18/25 t-20 --ink-900] + 1px --line + 8px.
Körper 48px, grid: [auto][1fr][auto], rechte Kante 767:
  links Leitzahl: 12 in t-28 --ink-900 (32px Zeile) + Einheit T als span t-6-sub --ink-600, vertical-align .55em; 4px darunter Legende SERIE · TAGE t-10 uppercase --ink-600 (12px). 32+4+12 = 48.
  rechts zwei 24px-Zeilen, Werte rechtsbündig auf 767: „BESTE t-10 --ink-600 · 8 · 23 t-20 --ink-900\" und „Ø/WOCHE · 4,2 t-20\". 2×24 = 48 — beide Blöcke exakt gleich hoch.
S2 gesamt 22 + 1 + 8 + 48 = 79. Linke Spalte 290px.

S3 SEKTION „VERLAUF" (rechts, 549)
Kopf 22px: [2px][VERLAUF t-10 --m-habits][1fr][ERFÜLLT t-10 --ink-600 · 78 t-20 --ink-900 · 4px · % t-10 --ink-450] + 1px --line + 8px.
Zeitraumzeile 32px (der 24px-Segment-Umschalter passt NICHT in einen 22px-Kopf): Segment-Umschalter 7 | 30 | 140 TAGE, Segmenthöhe 24, t-10 uppercase, geteilter 1px-Rahmen via margin-left −1, --r-2 nur außen; aktiv background --head + 2px --m-habits Unterstreichung + Schrift --ink-900. Links ausgerichtet, danach 8px.
Körper, grid [218px][24][1fr = 291px]:
  links Heatmap: grid-template-columns repeat(20, 9px), gap 2 → 218×75, Zelle r-0, transition none, Stufen --hm-0…--hm-4, title="SO 03.08. · 4/5". 4px darunter Legende 12px: „0\" t-9 --ink-600, fünf 9px-Quadrate mit 2px Lücke, „4\". Block 91px.
  rechts drei 28px-Anzeigezeilen, ab der zweiten border-top 1px --line-hair: ERFASST 138 · SPITZE 5/5 · LÜCKEN 2. Label t-10 --ink-600 links, Wert t-12 --ink-900 rechts auf 541. Oben ausgerichtet, 86px.
S3 gesamt 22 + 1 + 8 + 32 + 8 + 91 = 162.

S4 SEKTION „NEUER HABIT" (24px Abstand über dem Kopf)
Kopf 22px: [2px][NEUER HABIT t-10 --m-habits][1fr][kbd n]. + 1px --line + 8px.
Formularbereich — die EINZIGE Fläche der Ansicht: background --panel, 1px --line, --r-2, Padding 12 14. Innen 521px:
  NAME t-9 uppercase --ink-600, 4px, .inp 28px hoch, --r-2, background --panel, 1px --line, t-13, Platzhalter --ink-450, volle Breite. 12px.
  ZIEL / WOCHE t-9, 4px, Segment-Umschalter 1 2 3 4 5 6 7: 7 Segmente à 48px, Höhe 24, geteilte Rahmen → 7×48 − 6 = 330px. 12px.
  Knopfzeile rechts: ANLEGEN primär (background --ink-900, Schrift --bg, 24px, Padding 0 10, t-10), disabled solange Name leer → Schrift --ink-450, Rahmen --line, keine Opazitätsänderung.
  Innenhöhe 12+4+28+12+12+4+24+12+24 = 132, + 24 Padding = 156. S4 gesamt 22+1+8+156 = 187.

S5 SEKTION „BESTAND" (24px Abstand)
Kopf 22px: [2px][BESTAND t-10 --m-habits][1fr][AKTIV t-10 --ink-600 · 5 t-20] + 1px --line + 8px.
table.tbl, border-collapse collapse, table-layout fixed, kein Außenrahmen, Spalten in ch:
  HABIT 1fr (t-13 Sans) | ZIEL 4ch rechts | TAGE 6ch rechts | SEIT 9ch t-11 --ink-600 (data-col="opt") | 36px Aktion
  Kopf 22px sticky top:40, background --head, t-9 uppercase --ink-600, 1px --line unten; sortierbar mit 16px-Chevron rechts in der Zelle, aktiv --ink-900.
  Zeilen 28px, Padding 0 8, tr + tr border-top 1px --line-hair. Zahlen tnum, rechte Kante 541. Aktionszelle: Icon-Knopf 24×24, 16px-Kreuz, --ink-600, hover background --head; im Löschmodal wird das Icon --alert.
S5 bei 6 Zeilen: 22+1+8+22+168 = 221.

HÖHENBUDGET 1440×900 nachgerechnet
40 Kopfzeile + 1 + 24 = 65. Rechts 162 + 24 + 187 + 24 + 221 = 618. 65 + 618 + 48 Fußgrund = 731 < 900 ✓ (links 290, kürzer — bleibt kürzer). Erst ab 21 Habits (21×30 + 20×2 = 670) wird links die maßgebliche Spalte und die Seite scrollt.

TEXT-SKIZZE 1440
+-----+----------------------------------------------------------------+-------------------------------+
|RAIL | JARVIS        HABITS                    . LOKAL      14:32     |   Kopfzeile 40, 1px --line     |
| 52  +----------------------------------------------------------------+-------------------------------+
|     | <------------------ 775 (7 Spalten) ------------------>        | <---- 549 (5 Spalten) ---->   |
| COK | | WOCHE                       [j][k][ ]   HEUTE  3/5          | | VERLAUF        ERFÜLLT 78%  |
|>HAB | ---------------------------------------------------- 1px line | ------------------------------ |
| STU |   NAME(454)      MO DI MI DO FR SA SO   f  SOLL               | [ 7 | 30 |*140 TAGE ]  32px    |
| TSK | ------------------------------------------------ 22 sticky -- | +---------------+  ERFAST 138  |
| JRN |  Sport            v  v  .  v [.] .  .   v   5/5   32px        | |###.#..##.#### |  SPITZE 5/5  |
| UNI |  Lesen            v  .  v  .  .  .  .   -   2/3               | |.##.#.###..#.# |  LÜCKEN   2  |
| GOL |  Wasser           v  v  v  v  .  .  .   v   4/4               | |#.###..#.####. |              |
| SPT |  Kein Zucker      .  v  .  v  .  .  .   -   2/5               | | 218 x 75, 20x7|              |
| SET |  Meditation       v  v  v  .  .  .  .   -   3/5               | 0 [][][][][] 4              |
|     | | SERIE                        WOCHE  18/25   (stößt an, 1px) | ------------------------------ |
|     | ---------------------------------------------------- 1px line | | NEUER HABIT           [n]   |
|     |  12 T                              BESTE       23            | ------------------------------ |
|     |  SERIE · TAGE                      Ø/WOCHE    4,2            | +-- --panel, 1px --line, r-2 -+|
|     |                                     ^ Kante x=767            | | NAME [__________________] ||
|     |                                                               | | ZIEL/WOCHE [1|2|3|4|5|6|7]||
|     |                                                               | |                 [ANLEGEN] ||
|     |                                                               | +---------------------------+|
|     |                                                               | | BESTAND        AKTIV    5   |
|     |                                                               | ------------------------------ |
|     |                                                               | HABIT      ZIEL TAGE SEIT  x  |
|     |                                                               | Sport         5  214 04.05. x |
|     |                                                               | Lesen         3   96 12.06. x |
+-----+----------------------------------------------------------------+-------------------------------+
(v = 1,5px-Haken --m-habits; . = leere Zelle 1px --line; [.] = heutige Spalte, Grund --head; f = 16px-Flag-Spalte)

ZWISCHENSCHRITT 900px
Rail wandert nach unten (Mobil-Modus), Raster zweispaltig 6/6 (hier erlaubt, weil keine 7/5-Asymmetrie mehr trägt): links S1+S2, rechts S3, S4, S5. Rasterzellen bleiben 30×30 bis `pointer: coarse` greift.


### Bei 390px

390px (Inhaltsbreite 366, Seitenrand 12 = --s-4; alle Sektionslinien laufen randlos durch: margin-inline −12, padding-inline 12 — eine Sektion liest sich als Streifen).

Reihenfolge: Kopfzeile 32 (JARVIS links, HABITS t-10 --ink-900 mitte, Textknopf INDEX rechts 32×24, 1px --line, --r-2, Trefferfläche 44×44) → S1 WOCHE → S2 SERIE (stößt an) → 20 → S3 VERLAUF → 20 → S4 NEUER HABIT → 20 → S5 BESTAND → Mobil-Nav 48 + env(safe-area-inset-bottom), HAB aktiv mit 2px --m-habits an der Leistenoberkante.
Sektionsabstände mobil: 20px über dem Kopf, 8px unter der Regel (2,5:1).

S1 Wochenraster, Arithmetik exakt nach System:
  grid-template-columns: [name] 104px fest | 12 | [raster] 250px (7×34 + 6×2). 104 + 12 + 250 = 366 = Inhaltsbreite ✓, kein horizontaler Seiten-Scroll.
  Zellen 34×34 (coarse), Zeilenteilung 36px (34 + 2 Lücke).
  Die SOLL- und die Flag-Spalte verschwinden nicht, sie wandern in die Namenszelle als Metazeile: Titel t-13 Sans --ink-800 (18px, ellipsis) über Metazeile t-11 Mono (15px) „4/5\" --ink-600 mit dem 16px-Haken --m-habits 4px daneben, wenn das Ziel erreicht ist. 18 + 15 = 33 in 36px Zeilenhöhe, vertikal zentriert.
  Tageskopf 22px bleibt sticky, top: 32 statt 40.
  Sichtbar: (844 − 32 Kopfzeile − 48 Nav − 53 Sektions-/Kopfvorlauf) / 36 = 19 Rasterzeilen ohne Scroll — die Forderung „mindestens 10 Zeilen" ist doppelt erfüllt ✓.
S2 SERIE: t-28 links, darunter Legende; rechts nur EIN t-20-Paar (BESTE 23), Ø/WOCHE fällt weg (es steht als LÜCKEN-Nachbar in S3 nicht doppelt). Werte rechtsbündig auf x = 354.
S3 VERLAUF: Zeitraumzeile 32px über die volle Breite, drei Segmente à 122px, Segmenthöhe 32 (coarse). Heatmap 20×12 + 19×2 = 278×96, linksbündig (88px Reserve, kein Scroll), Legende darunter 12px. Die drei Statistikzeilen stehen NICHT mehr daneben, sondern darunter als drei 28px-Anzeigezeilen über die volle Breite: Label t-10 --ink-600 links, Wert t-12 --ink-900 rechts auf 354, ab der zweiten mit 1px --line-hair.
S4 NEUER HABIT: einziges Element, das die 12px-Ränder NICHT durchbricht (es hat einen umlaufenden Rahmen). .inp 40px hoch, Schrift t-16 (iOS zoomt nicht). Ziel-Segment 7 Segmente à 48px = 330px, Höhe 32. Knopf ANLEGEN 32px, Padding 0 12.
S5 BESTAND: SEIT trägt data-col="opt" und verschwindet unter 560px. Spalten HABIT 1fr | ZIEL 4ch | TAGE 6ch | 36px Aktion. Zeilenhöhe 36 (interaktiv, coarse), Kopf 22 sticky top:32.
kbd-Chips (j, k, ␣, n) sind unter `pointer: coarse` ausgeblendet; ihre Köpfe zeigen dann nur Label und Kennzahl.
Leerzustand mobil: S4 NEUER HABIT rutscht auf Position 2, direkt unter die Kopfzeile, vor das Raster — der Leerzustand ist ein Arbeitszustand.


### Statt Karten

STATT KARTEN — was hier trägt:
1. Die 1px-Sektionsregel ist die Kachel. Fünf Sektionen, jede = 22px-Kopfzeile + 1px --line + Inhalt. Kein Rahmen, kein Radius > 0, kein Schatten, kein --panel-Grund außer im Formularbereich. Die alte Fassung (GlassTile ×2) wird ersatzlos gestrichen.
2. Die Matrix statt zwei Kacheln. Alt: Kachel „Diese Woche" + Kachel „Neuer Habit", beide mit Verwaltungsliste darin. Neu: eine 7-spaltige Abhak-Matrix als Seitengerüst, Verwaltung als eigene Tabelle rechts. Das Raster braucht keinen Behälter, weil es selbst ein Gitter ist.
3. Die 2px-Rasterlücke statt Zeilentrennern im Raster; Haarlinien nur in der BESTAND-Tabelle. 24px über dem Kopf / 8px unter der Regel (3:1) ersetzt jede Umrandung.
4. Der 2×12px-Signalstrich + das 10px-Label, das die Regel unterbricht, ersetzt Titelbalken und farbige Kopfleisten. Farbe erscheint an genau vier Stellen: Modul-Label, 2px-Marken (heutige Spalte, aktives Segment, aktive Nav), Datenmarken (Haken, Heatmap-Stufen), --alert.
5. Panelgruppe statt Kachelpaar: WOCHE und SERIE stoßen ohne Abstand aneinander — die Serie ist Fußnote des Rasters, nicht ein zweites Objekt.
6. window.confirm() wird durch Baustein 24 ersetzt, Toasts durch die Rückgängig-Zeile (Baustein 26), Leerzustands-Kästen durch die 28px-Leerzeile (27).
7. Kein Ring, kein Balkendiagramm: „genau ein Instrument pro Ansicht" — das Instrument der Habits ist das Wochenraster. Kein t-44 in dieser Ansicht (reserviert für Cockpit-Ring und Study-Timer), genau EIN t-28 (Serie).
8. Baustein 17 (Fortschrittsbalken) bleibt bewusst unbenutzt: die 7 Rasterzellen sind schon die Größenordnung, die SOLL-Zahl schon der Wert. Ein Balken daneben wäre die dritte Darstellung derselben Zahl. Damit entfällt auch die „Punktreihe" aus Anforderung 4.2 — sie ist deckungsgleich mit der Rasterzeile, die sie zusammenfassen soll.

WAS MIR IM SYSTEM FEHLT (Entscheidungen, die ich innerhalb der Tokens getroffen habe, ohne neue zu erfinden):
a) Baustein 19 definiert keine Anzeige für „Wochenziel erreicht". Ich nutze das 16px-Haken-Icon aus dem 15er-Satz in --m-habits in einer festen 16px-Spalte links vor der Zahlenkante (--m-habits deckt laut Farbtabelle ausdrücklich „alle Erledigt-/Positivsignale"). Kein Farbwechsel an der Zahl selbst — eine gefärbte Zahl wäre keine der vier erlaubten Farbstellen.
b) Die Zeilenteilung im Raster ist 32px (30 + 2), nicht die 28px-Anzeigezeile. Das folgt zwingend aus der Raster-Arithmetik (Zelle 30×30, Lücke 2) und bleibt ein Vielfaches von 4; ich nenne es hier als benannte Ausnahme, damit es nicht als Regelbruch gelesen wird.
c) Ein 24px-Segment-Umschalter passt nicht in einen 22px-Sektionskopf (bei coarse 32px erst recht nicht). Der Zeitraumwahlschalter bekommt darum eine eigene 32px-Zeile unter der Regel — dieselbe Höhe wie Baustein 29. Der Sektionskopf behält nur Label, kbd und Kennzahl.
d) Für sticky Tabellen-/Rasterköpfe ist kein Offset spezifiziert. Ich setze top: 40 (Desktop) bzw. 32 (mobil), gleich der Kopfzeilenhöhe; beide Ebenen sind opak, nichts liegt transluzent übereinander.
e) Hover: Baustein 3 legt hover auf die Zeile. Im Wochenraster liegt er auf der ZELLE, weil eine Zeile sieben Ziele hat und ein Zeilen-Hover in --head die --head-Markierung der heutigen Spalte auslöschen würde. Deshalb trägt „heute" zusätzlich die 2px --m-habits-Unterstreichung am Tageskopf und das Kopf-Label in --ink-900 — drei Kanäle, nie nur Farbe.


### Zustände

- LEER (keine Habits): Der Tageskopf MO–SO bleibt stehen, damit das Gerüst sichtbar ist; der Rasterkörper enthält genau eine 28px-Leerzeile, t-11 --ink-600, linksbündig: „Keine Habits — n für neu". Kein gestrichelter Rahmen, keine Illustration, kein Erklärsatz. HEUTE-Kennzahl im Kopf = En-Dash --ink-450. S2 SERIE zeigt En-Dash in t-28 --ink-450 mit unveränderter Legende SERIE · TAGE; BESTE und Ø/WOCHE ebenfalls En-Dash. S3 Heatmap rendert 140 Zellen in --hm-0 (das ist die Wahrheit: 140 Tage ohne Eintrag), Statistikzeilen ERFASST 0 → En-Dash. Auf 390px wandert der Formularbereich NEUER HABIT auf Position 2 direkt unter die Kopfzeile, damit der Leerzustand ein Arbeitszustand ist; auf Desktop steht er ohnehin schon sichtbar in der rechten Spalte.
- LADEN: Kein Skeleton, kein Schimmer, keine Bewegung. Jede Sektion behält ihre exakte Höhe, damit beim Eintreffen der Daten nichts springt: S1 hält Kopf + Tageskopf und zeigt eine 28px-Leerzeile „LADEN" t-11 --ink-600 in einem auf 5 Zeilenteilungen (160px) reservierten Block; S2 zeigt En-Dash in t-28 --ink-450; S3 hält den 75px-Heatmap-Kasten (mobil 96px) leer und schreibt „LADEN" t-11 --ink-600 an die Stelle der Legende; die drei Statistikzeilen und die BESTAND-Zeilen stehen mit En-Dash in --ink-450. Der Formularbereich ist sofort bedienbar (ein neuer Habit braucht keine geladenen Daten) — nur ANLEGEN bleibt deaktiviert, bis sortOrder bekannt ist: Beschriftung --ink-450, Rahmen --line, cursor default, keine Opazitätsänderung.
- FEHLER beim Abhaken (optimistisches Update wird zurückgerollt): Die Zelle springt in ihren vorherigen Zustand zurück — der Haken verschwindet, SOLL zählt zurück, die 240ms-Zahlenannäherung setzt direkt den Endwert. Die betroffene Zeile bekommt box-shadow: inset 2px 0 0 var(--alert). Zwischen Sektionsregel und Tageskopf schiebt sich eine Fehlerzeile ein: t-15 Sans --alert, max-width 68ch, echter Wortlaut mit Datum, kein Beschwichtigungssatz: „Häkchen nicht gespeichert — MO 11.08. bei ‚Sport' ist unverändert." Daneben der sekundäre Knopf ERNEUT (24px, 1px --line, t-10). Kein Toast, kein Overlay, keine Bewegung; die Zeile verschwindet beim nächsten Erfolg.
- FEHLER beim Laden: S1 zeigt statt der Zeilen eine Fehlerzeile t-15 --alert („Habits konnten nicht geladen werden — lokaler Speicher nicht erreichbar.") plus sekundären Knopf NEU LADEN in der Kopfzeile der Sektion (rechts, wo sonst die Kennzahl steht; die Kennzahl wird zum En-Dash). S3 und S5 zeigen dieselbe Behandlung mit je einer Zeile — kein wiederholter Erklärtext, jede Sektion nennt nur ihren eigenen Ausfall. FEHLER im Formular: border-color des .inp wird --alert, darunter eine 15px-Zeile in --alert: „Name fehlt." bzw. „‚Sport' gibt es schon." Das Wochenziel-Segment kann nicht fehlerhaft sein (1–7 sind die einzigen Zustände) — der Zahlenspinner mit min/max aus der alten Fassung entfällt damit ganz.
- LÖSCHEN mit Verlauf: 16px-Kreuz in der 36px-Aktionsspalte öffnet Baustein 24 — Modal 360px (mobil calc(100vw − 24px)), --panel, 1px --line, --r-3, Padding 16, Abdunklung --scrim flach ohne Weichzeichner. Titel t-10 uppercase --ink-900 „HABIT LÖSCHEN", Text t-15 --ink-800 mit Zahl: „Sport löschen — 214 abgehakte Tage werden mitgelöscht." Knopfzeile rechts unten, 8px Gap: ABBRECHEN sekundär, LÖSCHEN destruktiv (transparent, 1px --alert, Schrift --alert). Fokusfalle, Escape schließt. Nach Bestätigung bleibt die Zeile 8 Sekunden als 28px-Rückgängig-Zeile stehen: Titel line-through --ink-450, rechts sekundärer Knopf RÜCKGÄNGIG + kbd-Chip U. Ein Habit ohne Einträge wird ohne Modal gelöscht — es gibt keinen Verlauf zu verlieren —, nur die Rückgängig-Zeile erscheint. Gleichzeitig verschwindet die Zeile aus dem Wochenraster; die Höhe von S1 schrumpft um 32px, ohne dass rechts etwas nachrückt (die Spalten werden nicht ausgeglichen).
- SEHR VIELE EINTRÄGE (ein Jahr Verlauf, 300+ HabitEntry pro Habit): Die Anzahl der DOM-Knoten hängt nicht an der Datenmenge. Das Wochenraster rendert immer genau 7 Zellen je Habit; die Frage „ist Habit X an Tag Y erledigt" wird über ein einmal gebautes Set aus `habitId|date` beantwortet, nie über einen Vollscan (§6 der Anforderungen: drei bis vier Größenordnungen). Die Heatmap rendert höchstens 140 Zellen — der Umschalter 7 | 30 | 140 TAGE verändert das Fenster, nie die Zellenzahl darüber; alle 140 Zellen tragen transition: none, damit ein Themenwechsel nicht 140 Farbübergänge auslöst. TAGE in S5 zeigt die Gesamtzahl mit deutschem Tausenderpunkt ab fünf Stellen (1.240 bleibt vierstellig ohne Punkt: 1240). Die 140-Tage-Statistik (ERFASST, SPITZE, LÜCKEN, Ø/WOCHE, Serie) wird in einem Durchlauf über die Einträge berechnet, nicht je Kennzahl neu.
- SEHR VIELE ZEILEN (20+ Habits): Das Raster wächst mit 32px je Zeile und wird ab 21 Habits die höhere Spalte; die Seite scrollt vertikal, der Tageskopf bleibt sticky (22px, Grund --head, 1px --line unten) unter der 40px-Kopfzeile, sodass MO–SO und die Markierung der heutigen Spalte immer sichtbar bleiben. Der Seitenkörper scrollt nie horizontal — die Namensspalte ist minmax(0,1fr) mit ellipsis, auf 390px fest 104px, und die Summe 104 + 12 + 250 = 366 ist exakt die Inhaltsbreite. Die BESTAND-Tabelle behält 28px-Zeilen (36px bei coarse) mit sticky Kopf und sortierbaren Spalten; sie ist die Stelle, an der man bei vielen Habits arbeitet, das Raster bleibt reine Abhak-Fläche. Keine Virtualisierung, kein Überlaufmenü, keine „mehr anzeigen"-Zeile — Habits sind zweistellig, nicht vierstellig.

## Study (Lernzeit-Timer)

*(von mir geschrieben)*

### Wichtigste Information

**Die laufende Zeit als `01:23:45` in t-44 — die zweite und letzte t-44 der App.**

Study ist die einzige Ansicht, die man öffnet, um etwas zu *starten*, nicht um
etwas zu lesen. Alles andere hier — Tagessumme, Wochensumme, Fachverteilung,
Verlauf — ist Rückschau und gehört in Zellenwerte. Der Timer ist die Handlung.

Ausdrücklich **nicht** primär: die Wochensumme. Sie steht als t-20 im
Sektionskopf, weil sie beim Lernen nicht handlungsleitend ist.

### Hierarchie

1. Timer `01:23:45` in t-44 Mono --ink-900, feste `8ch`-Breite
2. Timer-Ring 132×132 links davon: ein Bogen, Anteil am eingestellten Block, `--m-study`
3. Statuszeile unter der Ziffer: 4×4px-Lampe `--m-study` + LÄUFT / PAUSE / BEREIT in t-10 --ink-600
4. Segment-Umschalter START | PAUSE | BUCHEN, 32px, rechts vom Ring-Ziffer-Paar
5. Fach-Select im Formularbereich darunter (der einzige Flächenbereich der Seite)
6. Sektion HEUTE: Tabelle der Sitzungen (Fach, Beginn, Dauer, Löschen)
7. Sektion WOCHE: 14-Tage-Balken in `--m-study`, heutiger Balken mit 2px --ink-900-Oberkante
8. Sektion FÄCHER: Tabelle Fach × Minuten diese Woche, an gemeinsamer rechter Zahlenkante
9. Betriebszeilen: Rückgängig-Zeile nach dem Löschen einer Sitzung, Leerzeile, Fehlerzeile

### Layout

**Korrektur am System (Baustein 14 + 31).** Der Systemtext ordnet Study einen
Timer-Ring zu und die t-44 in die Ringmitte. Das ist geometrisch unmöglich:
`01:23:45` sind 8 Zeichen à ~26,4px in Mono 44px = **211px**, der Ring ist
132px innen. Deshalb steht die Ziffer **neben** dem Ring, nicht darin. Im
Cockpit passt die t-44 in die Ringmitte, weil dort nur zwei Ziffern plus
Prozentzeichen stehen (~53px).

```
┌ 52px Rail ┐ 24px ├──────────── Inhalt 1340px ─────────────────┤ 24px
│           │
│  ─────────────────────────────────────────────────────────  40px Kopfzeile
│
│  ▌STUDY                          WOCHE  4:27      [s] [p]   22px Sektionskopf
│  ───────────────────────────────────────────────────────────  1px --line
│                                                               8px
│   ╭───────╮   01:23:45                    ┌──────┬───────┬──────────┐
│   │  ◜    │   ▪ LÄUFT                     │START │ PAUSE │ BUCHEN   │  32px
│   │   ◝   │                               └──────┴───────┴──────────┘
│   ╰───────╯   ↑ t-44, 8ch fest             Segment-Umschalter
│    132×132     ↑ 4×4-Lampe --m-study
│    ein Bogen
│                                                               16px
│  ┌───────────────────────────────────────────┐  Formularbereich
│  │ FACH                                      │  --panel, 1px --line, --r-2
│  │ [ Operations Research            ▾ ]      │  28px Select
│  └───────────────────────────────────────────┘
│                                                              24px
│  ▌HEUTE                          SUMME  45 MIN              22px
│  ──────────────────────────────────────────────────────────  1px
│  FACH                    BEGINN     DAUER                    22px Kopf, sticky
│  Operations Research     14:02      28 MIN            [×]    28px
│  Statistik II            16:40      17 MIN            [×]    28px
│                                                              24px
│  ▌VERLAUF · 14 TAGE                Ø  38 MIN                22px
│  ──────────────────────────────────────────────────────────  1px
│   ▁▃▅▂▇▄▁▃▆▂▅▇▃█   72px hoch, 14×18px, 4px Lücke, --m-study
│   ───────────────  1px --line Grundlinie
│   27.07.                                      HEUTE  9px t-9
```

Aufteilung im 12er-Raster: der Timer-Block läuft über die volle Inhaltsbreite
(er ist eine Zeile, kein Block), HEUTE über 7 Spalten (775px) links, FÄCHER
über 5 Spalten (549px) rechts daneben als **Panelgruppe** — ohne Abstand,
getrennt nur durch 1px `--line`. VERLAUF steht darunter über die volle Breite.

Die Spalten enden nicht auf gleicher Höhe. Das wird nicht ausgeglichen.

### Bei 390px

- Ring auf 120×120, t-44 rutscht **unter** den Ring statt daneben: 211px passen
  nicht neben 120px in 366px Inhaltsbreite. Reihenfolge dann: Ring, Ziffer,
  Statuszeile, Segment-Umschalter (volle Breite, drei Segmente à 122px).
- Segmenthöhe 32px (`pointer: coarse`).
- Fach-Select 40px hoch, Schrift t-16 (kein iOS-Zoom).
- Tabelle HEUTE verliert die Spalte BEGINN (`data-col="opt"`, verschwindet
  unter 560px). Bleiben FACH und DAUER.
- Sektion FÄCHER stapelt unter HEUTE, kein Abstand, 1px `--line` dazwischen.
- 14-Tage-Diagramm passt unverändert (304px in 366px).

### Statt Karten

Die alte Fassung hatte hier vier `GlassTile` (Timer, Heute, Lernminuten,
Fächer) mit je 26px Radius, `backdrop-filter`, Schlagschatten und 16px
Innenabstand — 64px Chrome, in dem keine Information steht.

1. **Der Timer-Block ist keine Kachel, sondern eine Zeile.** Ring, Ziffer,
   Lampe und Knöpfe liegen auf einer gemeinsamen Grundlinie im Seitengrund.
   Kein Rahmen — die 1px-Sektionsregel darüber genügt als Abgrenzung.
2. **Statt der Kachel „Heute": eine Tabelle mit sticky Kopf.** Sitzungen sind
   Datensätze mit drei Feldern; eine Tabelle zeigt sie vergleichbar
   untereinander an einer Zahlenkante, eine Kachelliste nicht.
3. **Statt des großen `ArcGauge` mit Innenzahl: Ring und Zahl getrennt.**
   Der Ring trägt nur den Anteil (eine Größenordnung), die Ziffer trägt den
   Wert. Das ist auch der Grund, warum der Ring nur *einen* Bogen hat statt
   drei — es gibt hier nur eine Größe.
4. **Der einzige Flächenbereich ist das Fach-Select** (Baustein 28), weil dort
   eingegeben wird. Eingabe darf sich vom Lesebereich abheben; Lesen nicht von
   Lesen.

**Fehlt mir im System:** eine Regel für die *Fachfarbe* in der Tabelle HEUTE.
Study und Uni teilen `--m-study`; zwei verschiedene Fächer in derselben Liste
sind dadurch nicht unterscheidbar. Vorschlag: sie werden auch nicht
unterschieden — der Fachname steht als Wort da, das genügt. Keine Farbcodierung
pro Kurs, sonst entsteht der Fleckenteppich, den das System gerade vermeidet.

### Zustände

- **Leer (keine Sitzung heute):** Leerzeile 28px, t-11 --ink-600: „Nichts gebucht — Timer starten oder Dauer eintragen". Das Fach-Select steht bereits darüber.
- **Laden:** Leerzeile mit „LADEN" in t-11 --ink-600. Kein Skeleton-Schimmer.
- **Fehler beim Buchen:** 28px-Zeile unter der Tabelle, `--alert`, echte Meldung („Keine Verbindung — nicht gespeichert"), 2px linke Marke in `--alert`.
- **Timer unter 30 Sekunden:** Segment BUCHEN ist deaktiviert (Beschriftung --ink-450, Rahmen --line, keine Opazitätsänderung). Tooltip entfällt — die Regel steht als t-9-Zeile unter dem Segment: „AB 0:30".
- **Sehr viele Einträge:** HEUTE ist auf einen Tag begrenzt, wächst also nicht. FÄCHER hat höchstens so viele Zeilen wie laufende Kurse. Kein Fall für Virtualisierung.
- **Timer läuft, Gerät gesperrt:** die Ziffer springt beim Zurückkehren auf den echten Wert (Uhrzeitrechnung, nicht Taktzählung). Kein Übergang auf diesem Sprung — er ist Korrektur, nicht Animation.

---

## Tasks & Notes

*(von mir geschrieben)*

### Wichtigste Information

**Was heute oder schon vorher fällig war — die obersten Zeilen der offenen
Liste, nach Fälligkeit sortiert.**

Diese Ansicht hat zwei Bewohner, die nichts miteinander zu tun haben: Aufgaben
haben eine Frist, Notizen haben keine. Die Frist ist das, was drängt. Deshalb
bekommt die Aufgabenliste die sieben breiten Spalten und steht in Zeile 2;
Notizen sind ein Archiv mit Suche und stehen rechts in fünf Spalten.

Die Sortierung ist die eigentliche Gestaltung dieser Seite: überfällig, heute,
morgen, diese Woche, später, ohne Frist. Wer sie richtig sortiert, braucht keine
Hervorhebung — die Reihenfolge *ist* die Priorität.

### Hierarchie

1. Aufgabenliste: 28px-Zeilen, sortiert nach Fälligkeit, Überfällige mit 2px `--alert`-Marke links und dem Wort ÜBERFÄLLIG in t-10 `--alert`
2. Kennzahl OFFEN als t-20 im Sektionskopf (`--m-tasks` = `--ink-800`)
3. Anlege-Zeile **über** der Liste: Titelfeld + Datumsfeld + Tag-Select + Knopf ANLEGEN — damit der Leerzustand ein Arbeitszustand ist
4. Fälligkeitsspalte t-11 --ink-600 an gemeinsamer rechter Kante: `ÜBERFÄLLIG · 03.08.` / `HEUTE 18:00` / `MORGEN` / `SO` / `12.09.` / En-Dash
5. Tag als Chip (Baustein 12): 16px, 1px `--line`, Schriftfarbe in Modulfarbe, **kein** farbiger Grund
6. Suchen- und Filterzeile über der Notizliste: Suchfeld + Segment ALLE | OFFEN | ERLEDIGT
7. Notizliste: Titel t-13 Sans, Datum t-11, Inhalt als zweizeiliger Anriss t-11 --ink-600
8. Erledigte Aufgaben in eigener Sektion darunter, Titel `line-through` in --ink-450
9. Rückgängig-Zeile nach jedem Löschen, 8 Sekunden, mit kbd-Chip `U`

### Layout

```
│  ▌TASKS                    OFFEN  7        [n] [/] [x]      22px
│  ───────────────────────────────────────────────────────────  1px
│                                                               8px
│  [ Neue Aufgabe ................ ] [ 03.08. ] [ UNI ▾ ] [ANLEGEN]  28px
│                                                               12px
│  ▪ Übungsblatt 3 rechnen        UNI      ÜBERFÄLLIG · 03.08. [×]  28px
│  ▪ Mail an Prof.                UNI      HEUTE 12:00         [×]  28px
│    Trainingsplan schreiben      SPORT    MORGEN              [×]  28px
│    Supabase-Projekt anlegen     JARVIS   SO                  [×]  28px
│    Buch zurückgeben             –        –                   [×]  28px
│      ↑ 2px --alert-Marke nur bei den ersten zwei
│                                                              24px
│  ▌ERLEDIGT                      12                          22px
│  ───────────────────────────────────────────────────────────  1px
│  ~~Klausuranmeldung~~           UNI      02.08.              [×]  28px
```

**Aufteilung 7/5, Panelgruppe.** Aufgaben links über 7 Spalten (775px), Notizen
rechts über 5 (549px). Beide Gruppen stoßen **nicht** aneinander — sie sind
thematisch getrennt, also 32px Abstand (`--s-7`) im Desktop-Raster als
senkrechte Rinne. Innerhalb der linken Spalte bilden OFFEN und ERLEDIGT eine
Panelgruppe: kein Abstand, nur 1px `--line`.

Spaltenraster der Aufgabenzeile:
`[check 28px] [title minmax(0,1fr)] [tag 7ch] [due 18ch] [act 36px]`
Alle Breiten in `ch`, nicht Prozent — sonst atmen die Fälligkeiten mit dem
Fenster und stehen nicht mehr untereinander.

### Bei 390px

- Anlege-Zeile bricht in zwei Zeilen: Titelfeld volle Breite (366px), darunter
  Datum + Tag + Knopf mit 8px Gap.
- Aufgabenzeile wird zweizeilig: Zeile 1 Checkbox + Titel, Zeile 2 (eingerückt
  um 28px) Tag-Chip + Fälligkeit in t-11. Höhe dadurch 44px statt 36px.
  Das ist die einzige Stelle im System, an der eine Zeile zweizeilig wird —
  begründet, weil Titel und Frist beide unverkürzbar sind.
- Notizen stapeln unter die Aufgaben, 32px Abstand.
- Filterzeile bricht in zwei Zeilen (Suchfeld, dann Segmente).
- kbd-Chips ausgeblendet (`pointer: coarse`).

### Statt Karten

1. **Statt zwei `GlassTile` nebeneinander: zwei Sektionsköpfe mit je einer
   1px-Regel.** Aufgaben und Notizen sind verschiedene Dinge — das trennt 32px
   Weißraum deutlicher als zwei Rahmen, weil Rahmen zusätzlich suggerieren,
   dass sie *gleichartig* sind.
2. **Statt einer Karte pro Notiz: eine Zeile mit Anriss.** Die alte Fassung gab
   jeder Notiz eine `.tsk`-Fläche mit Innenabstand. Bei 30 Notizen sind das 30
   Behälter. Jetzt: Titel t-13, darunter zwei Zeilen Anriss in t-11 --ink-600,
   getrennt durch 1px `--line-hair`. Zehn Notizen passen dadurch dort hin, wo
   vorher drei standen.
3. **Statt farbiger Tag-Pillen: Chips mit Schriftfarbe.** Ein gefüllter
   Tag-Chip in Modulfarbe erzeugt bei fünf Aufgaben fünf Farbflecken, die
   lauter sind als die Fälligkeit — und die Fälligkeit ist die Information.
4. **Statt eines `<details>`-Ausklappers für Erledigte: eine eigene Sektion.**
   Ein Ausklapper versteckt Zustand hinter Interaktion; eine Sektion mit
   Sektionskopf und Anzahl zeigt ihn sofort und kostet 22px.

### Zustände

- **Leer:** Leerzeile 28px, t-11 --ink-600: „Keine Aufgaben — n für neu". Die Anlege-Zeile steht bereits darüber, der Leerzustand ist also arbeitsfähig.
- **Suche ohne Treffer:** Leerzeile „Nichts gefunden für „xyz"" plus sekundärer Knopf SUCHE LEEREN.
- **Laden:** Leerzeile „LADEN".
- **Fehler:** 28px-Zeile in `--alert` an der Stelle der betroffenen Aufgabe, plus Rollback der optimistischen Änderung.
- **Sehr viele Einträge:** Offene Aufgaben sind praktisch begrenzt (Dutzende). Erledigte wachsen unbegrenzt → die Sektion ERLEDIGT zeigt 50 Zeilen und darunter eine 28px-Zeile „+ 214 ältere anzeigen" (sekundärer Knopf, kein Paginator, keine Seitenzahlen). Notizen ebenso: 50 Zeilen, dann Nachladen. Ab 200 sichtbaren Zeilen greift Virtualisierung mit fester 28px-Zeilenhöhe — bei fester Höhe ist das trivial, was ein weiterer Grund für die Dichteregel ist.

---

## Journal

*(von mir geschrieben)*

### Wichtigste Information

**Das leere Textfeld für heute.**

Journal ist die einzige Ansicht, deren Zweck ein Eingabefeld ist. Man kommt
her, um zu schreiben, nicht um zu lesen. Also ist das Feld nicht ein Widget in
einem Layout, sondern das Layout: es steht in Zeile 2, es hat die volle
Lesebreite von 68ch, und es ist bereits fokussierbar, ohne dass man etwas
anklicken muss.

Die Zeitleiste früherer Einträge ist Archiv. Sie darf nicht mit dem Schreibfeld
um Aufmerksamkeit konkurrieren, deshalb steht sie rechts in der schmalen Spalte
und zeigt nur Datum, Länge und die erste Zeile.

### Hierarchie

1. Textfeld für heute: min-height 96px, wächst bis 320px, Fließtext t-15 Sans, `max-width: 68ch`
2. Datumszeile über dem Feld als Sektionskopf: `▌HEUTE · MONTAG` links, rechts der Speicherzustand
3. Speicherzustand: 4×4px-Lampe + GESPEICHERT in t-10 `--m-habits` — erscheint 1,6 s nach dem Schreiben, verschwindet ohne Übergang
4. Zeichenzahl t-9 --ink-600 unten rechts am Feld (nur ab 500 Zeichen sichtbar)
5. Zeitleiste rechts: Tabelle Datum / Länge / Anriss, sticky Kopf
6. Schreib-Heatmap 140 Tage in `--m-journal` unter der Zeitleiste — welche Tage beschrieben sind
7. Kennzahl im Sektionskopf der Zeitleiste: t-20 Anzahl Einträge
8. Suchzeile über der Zeitleiste (Volltext über alle Einträge)
9. Leerzeile / Fehlerzeile im Fluss

### Layout

```
│  ▌HEUTE · MONTAG                    ▪ GESPEICHERT           22px
│  ───────────────────────────────────────────────────────────  1px
│                                                               8px
│  ┌─────────────────────────────────────────────┐   ← 68ch = ~578px
│  │ Heute war der Tag, an dem …                 │     --panel
│  │                                             │     1px --line
│  │                                             │     --r-2
│  │                                             │     min-h 96px
│  └─────────────────────────────────────────────┘         1240 Z. ← t-9
│                                                              24px
│  ▌ZEITLEISTE                     EINTRÄGE  84               22px
│  ───────────────────────────────────────────────────────────  1px
│  [ 🔍 Durchsuchen ....................... ]                  28px
│  DATUM        LÄNGE   ANRISS                                 22px sticky
│  SO 03.08.    412 Z.  Klausurvorbereitung lief besser …      28px
│  SA 02.08.    180 Z.  Kurzer Tag, früh ins Bett.             28px
│  DO 31.07.    –       Nur eine Zeile.                        28px
│                                                              24px
│  ▌GESCHRIEBEN · 140 TAGE          ERFASST  84 / 140         22px
│  ───────────────────────────────────────────────────────────  1px
│  ▪▪▫▪▪▪▫  20×7 Zellen, 9px, 2px Lücke, --m-journal-Rampe
│  0 ▫▪▪▪▪ 4
```

**Aufteilung: bewusst asymmetrisch 7/5, aber anders als sonst.** Das Schreibfeld
steht links über 7 Spalten — es nutzt davon aber nur 578px (68ch), die
restlichen 197px bleiben leer. Das ist Absicht: eine Textspalte, die breiter
als 68ch ist, liest sich schlechter, und der leere Rest markiert, dass hier
Text und nicht Daten stehen. Rechts über 5 Spalten die Zeitleiste.

**Korrektur am System.** Die Bausteinzuordnung nennt für die Zeitleiste die
Spalten „Datum / Länge / Stimmung". **Es gibt kein Stimmungsfeld im
Datenmodell.** Entweder wird `JournalEntry` um `mood` erweitert (dann ist es
eine neue Anforderung, keine Gestaltung) oder die Spalte entfällt. Ich habe sie
durch ANRISS ersetzt, weil der erste Halbsatz mehr über einen Tag sagt als eine
Fünf-Stufen-Skala.

### Bei 390px

- Textfeld volle Inhaltsbreite (366px), min-height 120px (`pointer: coarse`),
  Schrift t-16 gegen iOS-Zoom.
- Zeitleiste stapelt darunter, 24px Abstand.
- Spalte LÄNGE fällt weg (`data-col="opt"`). Bleiben Datum und Anriss.
- Anriss auf eine Zeile mit Ellipse.
- Heatmap 12px-Zellen, 278px Breite.
- Zeichenzahl bleibt, sie kostet 12px.

### Statt Karten

1. **Statt der Kachel um das Schreibfeld: nur das Feld.** Ein Textfeld hat
   bereits einen Rahmen — es *ist* ein Behälter. Es in eine Kachel zu setzen,
   erzeugt zwei verschachtelte Rahmen für einen Inhalt. Der Sektionskopf mit
   Datum und Speicherzustand liefert die Zuordnung, die die Kachel liefern
   sollte.
2. **Statt einer Karte pro Tagebucheintrag: eine Tabellenzeile.** Die alte
   Fassung gab jedem Eintrag eine `.tsk`-Fläche mit Datum, Wochentag und
   vollem Text. Bei 84 Einträgen sind das 84 Behälter und ein Scrollweg von
   mehreren Bildschirmen. Eine Tabelle mit Anriss zeigt 20 Tage auf einmal;
   der volle Text steht beim Anklicken der Zeile in derselben Textarea.
3. **Statt eines Toast „Gespeichert": die Lampe im Sektionskopf.** Ein Toast
   ist eine schwebende Fläche mit Schatten und Bewegung. Vier Pixel Quadrat
   plus ein Wort an einer festen Stelle sagen dasselbe und kosten nichts.
4. **Statt „SPEICHERT AUTOMATISCH" als Hinweiszeile:** nichts. Die Lampe zeigt
   es beim ersten Speichern; ein Erklärsatz, der immer da steht, erklärt einmal
   und stört hundert Mal.

### Zustände

- **Leer (noch nie geschrieben):** Textfeld mit Platzhalter „Wie war der Tag?" in --ink-450. Zeitleiste zeigt Leerzeile „Noch keine Einträge". Keine Illustration.
- **Laden:** Textfeld ist **deaktiviert** und trägt „LADEN" als Platzhalter — sonst tippt man in ein Feld, dessen Inhalt eine Sekunde später ersetzt wird. Sobald geladen: Feld aktiv, Cursor am Ende. **Ab dem ersten Tastendruck gehört das Feld dem Nutzer und wird nicht mehr überschrieben.**
- **Speichern läuft:** Lampe in --ink-600 (statt --m-habits), Wort SPEICHERT. Kein Spinner.
- **Speichern fehlgeschlagen:** Lampe `--alert`, Wort NICHT GESPEICHERT, darunter 28px-Zeile mit der echten Meldung und sekundärem Knopf ERNEUT VERSUCHEN. Der Text bleibt im Feld stehen.
- **Sehr viele Einträge:** Zeitleiste zeigt 60 Zeilen, darunter „+ 24 ältere anzeigen". Heatmap ist auf 140 Tage fix und wächst nie.

---

## Uni

*(von mir geschrieben)*

### Wichtigste Information

**Die Tage bis zur nächsten Klausur.**

Uni enthält zwei Zeitskalen: ECTS bewegen sich über Jahre, Klausurtermine über
Tage. Nur eine davon kann handlungsleitend sein, und es ist nicht die, die sich
zweimal im Semester ändert. Deshalb trägt der Countdown die einzige t-28 der
Ansicht, und der Semesterstand liegt im Ring plus einer t-20 im Sektionskopf.

**Abweichung vom System, ausdrücklich.** Die Bausteinzuordnung im Systemtext
sieht „t-28 ECTS bestanden" vor. Ich weiche davon ab: der ECTS-Ring trägt den
Semesterstand schon vollständig — ihn zusätzlich als größte Zahl der Seite zu
setzen, verdoppelt dieselbe Aussage und lässt die einzige zeitkritische Zahl
in einer Zellengröße untergehen. Wenn du die Systemvorgabe vorziehst, tauschst
du t-28 und t-20 zwischen Countdown und ECTS — sonst ändert sich nichts.

### Hierarchie

1. Countdown zur nächsten Klausur: t-28 Zahl + `T` in t-6-sub, darunter Legende `OPERATIONS RESEARCH · 12.08.` in t-10 --ink-600. Bei ≤ 14 Tagen in `--alert` plus 2px linke Marke plus das Wort — drei Kanäle
2. ECTS-Ring 132×132, ein Bogen in `--m-study`, Mitte t-20 `84` mit Legende `VON 180`
3. Kursliste als Tabelle: Kurs / Semester / ECTS / Klausur / Note / Status
4. Notenspalte am Komma ausgerichtet, feste 4ch, immer eine Dezimale (`1,7`)
5. Kennzahl SCHNITT als t-20 im Sektionskopf der Kursliste (ECTS-gewichtet)
6. Weitere Countdown-Zeilen für alle folgenden Klausuren, nach Datum sortiert
7. Formularbereich NEUER KURS: Name, ECTS, Klausurtermin
8. Sektion ABGESCHLOSSEN: Tabelle mit Note, Knopf zum Wiederöffnen
9. Rückgängig-Zeile, Leerzeile, Fehlerzeile

### Layout

```
│  ▌UNI                          SCHNITT  1,85                22px
│  ───────────────────────────────────────────────────────────  1px
│                                                               8px
│  ▌ 12 T           ╭───────╮                                  ← t-28, --alert
│    OPERATIONS     │  ◜◝   │  84                                 2px Marke
│    RESEARCH       │  ◟    │  VON 180                            links
│    · 12.08.       ╰───────╯  ↑ t-20 in Ringmitte
│    ↑ t-10          132×132
│                                                              24px
│  ▌LAUFENDE KURSE                        4                   22px
│  ───────────────────────────────────────────────────────────  1px
│  KURS                  SEM      ECTS   KLAUSUR      NOTE      22px sticky
│  ▌Operations Research  SoSe 26     6   12 T          –   [×]  28px ← --alert
│   Statistik II         SoSe 26     5   26 T          –   [×]  28px
│   Empirische Forschung SoSe 26     5   –             –   [×]  28px
│                                          ↑ rechte Zahlenkante
│                                                              24px
│  ▌ABGESCHLOSSEN               ECTS  84                      22px
│  ───────────────────────────────────────────────────────────  1px
│  Mikroökonomie        WiSe 25      6   –           1,7   [↺]  28px
│  Wirtschaftsinformatik WiSe 25     5   –           2,0   [↺]  28px
```

**Aufteilung: asymmetrisch, aber nicht 7/5.** Der Kopfblock (Countdown + Ring)
läuft über die volle Breite als eine Zeile — Countdown links, Ring
**linksbündig direkt daneben**, nicht zentriert und nicht rechts. Der Rest der
Zeile bleibt leer. Das ist eine bewusst unausgeglichene Zeile: sie liest sich
als Messwertkopf einer technischen Zeichnung, nicht als Kachelpaar.

Kursliste und ABGESCHLOSSEN bilden eine Panelgruppe (kein Abstand, 1px `--line`)
über die volle Inhaltsbreite von 1340px. Sie ist die einzige Tabelle der App,
die alle zwölf Spalten braucht, und sie bekommt sie.

Spaltenbreiten in `ch`:
`Kurs minmax(0,1fr) | Sem 8ch | ECTS 5ch | Klausur 7ch | Note 4ch | Aktion 36px`

### Bei 390px

- Countdown und Ring stapeln: Countdown zuerst (er ist primär), Ring darunter
  auf 120×120.
- Kursliste scrollt **in sich** horizontal (`overflow-x: auto`) mit `position:
  sticky` auf der Kursnamen-Spalte. Die Seite selbst scrollt nie horizontal.
  Das ist eine der zwei ausgewiesenen Ausnahmen im System.
- Spalten SEM und ECTS tragen `data-col="opt"` und verschwinden zuerst;
  KLAUSUR und NOTE bleiben immer sichtbar, weil sie die Information sind.
- Formularbereich NEUER KURS volle Breite, Felder untereinander mit 12px.
- Noteneingabe: Zahlenfeld 40px hoch, t-16, `inputmode="decimal"`.

### Statt Karten

1. **Statt Kachel „Laufende Kurse" + Kachel „Semesterfortschritt" + Kachel
   „Abgeschlossen": eine Tabelle plus ein Messwertkopf.** Kurse sind
   Datensätze mit sechs vergleichbaren Feldern — das ist die Definition einer
   Tabelle. Die alte Fassung zeigte sie als `.row`-Liste in einer Kachel und
   verlor dadurch die Spaltenausrichtung: ECTS und Noten standen nicht
   untereinander und waren nicht vergleichbar.
2. **Statt `chipx`-Badges für den Status („KLAUSUR 12 T", „BESTANDEN"): eine
   Spalte.** Ein Badge pro Zeile erzeugt bei acht Kursen acht Rähmchen in
   wechselnder Breite. Eine Spalte mit rechtsbündigen Werten sagt dasselbe und
   lässt vergleichen, welcher Termin näher ist.
3. **Statt der Note als farbiger Chip: die Note als Zahl am Komma.** `1,7` in
   t-12 an einer 4ch-Spalte. Farbe nur bei > 4,0 (`--alert`) — und dann
   zusätzlich mit dem Wort NICHT BESTANDEN, nie nur farbig.
4. **Der Ring ist das einzige Instrument der Seite.** Die alte Fassung hatte
   `ArcGauge` plus Pillen plus `kv`-Blöcke, die alle denselben ECTS-Stand
   dreimal zeigten. Jetzt: einmal im Ring, einmal als t-20 im Sektionskopf
   ABGESCHLOSSEN. Zweimal ist die Obergrenze.

### Zustände

- **Leer:** Leerzeile „Keine Kurse — unten anlegen". Ring zeigt 0 mit leerem Bogen (Spur in `--line` sichtbar, keine Füllung). Countdown-Block entfällt vollständig, statt „–" zu zeigen.
- **Keine Klausur terminiert:** Countdown-Block entfällt, der Ring rutscht nach links an den Seitenrand. Kein Platzhalter.
- **Laden:** Leerzeile „LADEN", Ring ohne Bogen.
- **Fehler:** 28px-Zeile in `--alert` unter der betroffenen Tabelle, Rollback.
- **Sehr viele Einträge:** ein Studium hat Dutzende Kurse, keine Tausende. Kein Nachladen, kein Virtualisieren. Sortierung nach Semester absteigend ist Vorgabe; Kopfzeilen sind sortierbar (Chevron 16px, aktiv --ink-900).

---

## Goals

*(von mir geschrieben)*

### Wichtigste Information

**Der Abstand zwischen Fortschritt und verbleibender Zeit — pro Ziel, in einer
Zeile.**

Ein Ziel ist nur dann interessant, wenn man beide Zahlen gleichzeitig sieht:
„62 % erreicht" ist gut bei 90 Tagen Restzeit und schlecht bei 9. Deshalb ist
die Gestaltungsaufgabe hier nicht, Fortschritt zu zeigen, sondern **Fortschritt
und Restzeit auf eine Blickachse zu bringen**.

Lösung: eine 28px-Zeile pro Ziel mit dem Balken links und dem Countdown rechts,
an einer gemeinsamen rechten Kante über alle Ziele. Dadurch wird die
Diskrepanz sichtbar, ohne dass sie berechnet oder eingefärbt werden muss.

### Hierarchie

1. Zielzeilen: Titel t-13 Sans, 4px-Fortschrittsbalken in `--m-goals`, Prozentwert t-12, Countdown t-12 mit `T` in t-10
2. Countdown der nächsten Frist als t-28 (einzige Leitzahl der Ansicht), Legende mit Zielnamen in t-10
3. Zielmarke im Balken: 1px senkrechte Linie in --ink-450 dort, wo man bei linearem Fortschritt heute stehen müsste — die stille Bewertung ohne Ampelfarbe
4. Kennzahl AKTIV als t-20 im Sektionskopf
5. Überfällige Ziele: 2px `--alert`-Marke links, Wort ÜBERFÄLLIG in t-10, Restzahl in `--alert`
6. Segment-Umschalter AKTIV | ERREICHT | VERWORFEN im Sektionskopf
7. Formularbereich NEUES ZIEL: Titel + Zieldatum
8. Sektion ABGESCHLOSSEN als Tabelle: Titel / Status / Datum
9. Rückgängig-Zeile, Leerzeile

### Layout

```
│  ▌GOALS                 AKTIV  4      ┌AKTIV┬ERREICHT┬VERW.┐  22px
│  ──────────────────────────────────────┴─────┴────────┴─────  1px
│                                                               8px
│  ▌ 9 T                                                        ← t-28 --alert
│    KLAUSUR OR BESTEHEN · 12.08.                                 2px Marke
│                                                              16px
│  Klausur OR bestehen    ████████▌░│░░░░   62 %      9 T  [×]  28px
│  Bachelorarbeit anmelden ██▌░░░░░░│░░░░   18 %     84 T  [×]  28px
│  10 kg Bankdrücken mehr ██████████│███▌   87 %      –    [×]  28px
│  Wohnung ausräumen      ░░░░░░░░░░│░░░░    0 %     31 T  [×]  28px
│                          ↑ 4px Balken   ↑ Zahl  ↑ Countdown
│                          ↑ 1px Zielmarke --ink-450
│                                        ↑ gemeinsame Zahlenkante
│                                                              24px
│  ▌ABGESCHLOSSEN                  8                          22px
│  ───────────────────────────────────────────────────────────  1px
│  Statistik I bestehen        ERREICHT      14.02.       [×]  28px
│  Marathon laufen             VERWORFEN     03.01.       [×]  28px
```

**Aufteilung: eine Spalte, volle Breite, keine 7/5-Teilung.** Ziele sind
wenige und breit — der Fortschrittsbalken braucht Länge, um Auflösung zu haben.
Ein Balken von 240px zeigt 1 % als 2,4px; ein Balken von 120px zeigt es als
1,2px und damit gar nicht. Deshalb läuft die Zeile über die volle
Inhaltsbreite von 1340px, der Balken bekommt davon `minmax(0,1fr)` ≈ 700px.

Zeilenraster:
`[title 32ch] [bar minmax(0,1fr)] [pct 5ch] [days 5ch] [act 36px]`

Der Slider zum Verstellen des Fortschritts ist **nicht** ständig sichtbar. Er
erscheint auf Klick in die Zeile *an der Stelle des Balkens* — gleiche Höhe,
gleiche Position, nur bedienbar. Damit trägt die Leseansicht keine 4 Regler,
und die Bedienung braucht keinen zweiten Ort.

### Bei 390px

- Zeile wird zweizeilig: Zeile 1 Titel + Prozentwert + Countdown (36px),
  Zeile 2 der Balken über die volle Breite (12px hoch inkl. 4px Balken).
  Zusammen 48px. Der Balken bekommt damit 366px statt 700px — genug für 1 %
  Auflösung bei 3,6px.
- Segment-Umschalter rutscht unter den Sektionskopf, volle Breite, 32px.
- t-28-Countdown bleibt oben, er ist primär.
- Der Regler ersetzt beim Antippen den Balken in Zeile 2, 40px Trefferhöhe.

### Statt Karten

1. **Statt einer `.goal`-Karte pro Ziel: eine Zeile.** Die alte Fassung gab
   jedem Ziel einen Block mit Titelzeile, Balken, Reglerzeile und drei Knöpfen
   — rund 90px pro Ziel. Vier Ziele füllten den Bildschirm, ohne dass sich zwei
   davon vergleichen ließen. Jetzt: 28px pro Ziel, alle Prozentwerte
   untereinander, alle Restzeiten untereinander. **Vergleichbarkeit ist der
   ganze Zweck dieser Ansicht.**
2. **Statt drei Knöpfen pro Ziel: eine Aktionsspalte plus Tastatur.** Löschen
   ist ein 16px-Icon in der 36px-Spalte, „Erreicht" ist `Leertaste` auf der
   Zeile bzw. ein Eintrag im Zeilenkontext. Zwölf Knöpfe für vier Ziele sind
   elf zu viel.
3. **Statt eines dauersichtbaren Reglers: der Regler an der Stelle des
   Balkens.** Ein `input[type=range]` ist ein Bedienelement mit eigener
   Höhe und eigenem Griff; vier davon übereinander sehen aus wie ein
   Mischpult und lesen sich nicht als Fortschritt.
4. **Die Zielmarke ersetzt jede Ampel.** Ein roter oder grüner Balken bewertet;
   eine 1px-Linie an der Soll-Position lässt den Betrachter bewerten. Das ist
   billiger, ehrlicher und braucht keine zusätzliche Farbe.

### Zustände

- **Leer:** Leerzeile „Keine Ziele — unten anlegen". Der t-28-Countdown entfällt.
- **Ziel ohne Zieldatum:** Countdown-Spalte En-Dash in --ink-450, keine Zielmarke im Balken (ohne Frist gibt es kein Soll).
- **Alle Ziele erreicht:** Sektion AKTIV zeigt Leerzeile „Alles erreicht.", Segment springt nicht automatisch um.
- **Laden:** Leerzeile „LADEN".
- **Fehler beim Verstellen:** Balken springt auf den alten Wert zurück, 28px-Zeile in `--alert` unter der Zeile.
- **Sehr viele Einträge:** aktive Ziele sind naturgemäß wenige (< 20). Abgeschlossene wachsen — 40 Zeilen, dann „+ n ältere anzeigen".

---

## Sport

*(von mir geschrieben)*

### Wichtigste Information

**Die Minuten dieser Woche gegen die Vorwoche.**

Sport wird nicht pro Einheit bewertet, sondern pro Woche. Eine einzelne
Trainingseinheit ist bedeutungslos; die Frage ist immer „bin ich diese Woche
dran geblieben". Deshalb trägt das Wochenvolumen die einzige t-28, und
unmittelbar daneben steht die Vorwoche als t-12 — die Differenz ist die
Information, nicht der Absolutwert.

Die Satztabelle (Übung, Gewicht, Wiederholungen) ist wichtig, aber nachgelagert:
sie beantwortet „was habe ich letztes Mal gehoben", also eine Frage *während*
des Trainings, nicht danach.

### Hierarchie

1. Wochenvolumen t-28 `312` + `MIN` in t-6-sub, Legende `DIESE WOCHE` t-10; direkt darunter `VORWOCHE 245 MIN` in t-12 --ink-600
2. 14-Tage-Balken in `--m-sport`, heutiger Balken mit 2px --ink-900-Oberkante — die Woche als Form, nicht als Zahl
3. Einheitenliste: Datum / Art / Dauer / Sätze, 28px-Zeilen, neueste zuerst
4. Aufklappbare Satztabelle je Einheit: Übung / Satz / kg / Wdh / Volumen, in eigenem `overflow-x: auto`-Container mit sticky erster Spalte
5. Kennzahl EINHEITEN als t-20 im Sektionskopf
6. Formularbereich NEUE EINHEIT: Datum, Art, Minuten
7. Satz-Anlegezeile innerhalb einer aufgeklappten Einheit
8. Rückgängig-Zeile, Leerzeile

### Layout

```
│  ▌SPORT                    EINHEITEN  3                     22px
│  ───────────────────────────────────────────────────────────  1px
│                                                               8px
│    312 MIN                  ▁▃▅▂▇▄▁▃▆▂▅▇▃█    72px, --m-sport
│    DIESE WOCHE              ────────────────   1px Grundlinie
│    VORWOCHE  245 MIN        27.07.     HEUTE
│    ↑ t-28 / t-10 / t-12
│                                                              24px
│  ▌EINHEITEN                                                 22px
│  ───────────────────────────────────────────────────────────  1px
│  DATUM       ART            DAUER   SÄTZE                    22px sticky
│  SO 03.08.   Push           62 MIN      14   [▾]  [×]        28px
│  ┌─ aufgeklappt ────────────────────────────────────────┐
│  │ ÜBUNG          SATZ    KG    WDH   VOLUMEN           │    22px sticky
│  │ Bankdrücken       1    80      8       640           │    28px
│  │ Bankdrücken       2    85      6       510           │    28px
│  │ [ Übung ...... ] [ kg ] [ Wdh ]  [+]                 │    28px
│  └──────────────────────────────────────────────────────┘
│  FR 01.08.   Pull           55 MIN      12   [▾]  [×]        28px
│  MI 30.07.   Laufen         38 MIN       –   [▾]  [×]        28px
```

**Aufteilung: der Kopfblock ist asymmetrisch, die Liste ist einspaltig.** Links
der Zahlenblock (t-28 + zwei Legendenzeilen, zusammen ~180px breit), rechts
daneben direkt das 14-Tage-Diagramm (304px). Der Rest der Zeile bleibt leer —
zusammen 484px von 1340px. Das ist die stärkste Asymmetrie der ganzen App und
sie ist Absicht: Zahl und Kurve sagen dasselbe auf zwei Weisen und gehören auf
eine Blickachse; der leere Rest sagt, dass hier nichts weiter kommt.

Die Satztabelle ist **eingerückt um 28px** unter ihrer Einheit und trägt einen
eigenen sticky Kopf. Sie ist die zweite der zwei ausgewiesenen Stellen, an
denen horizontal gescrollt werden darf — fünf Zahlenspalten passen auf 390px
nicht.

### Bei 390px

- Zahlenblock und Diagramm stapeln: Zahl zuerst, Diagramm darunter (304px
  passen in 366px).
- Einheitenzeile verliert die Spalte SÄTZE (`data-col="opt"`); die Anzahl
  wandert hinter die Dauer als `62 MIN · 14`.
- Aufgeklappte Satztabelle scrollt horizontal, erste Spalte (Übung) sticky.
  Die Seite selbst scrollt nicht.
- Satz-Anlegezeile bricht in zwei Zeilen: Übung volle Breite, darunter kg /
  Wdh / Plus.
- Alle Felder 40px hoch, t-16.

### Statt Karten

1. **Statt einer Kachel pro Trainingseinheit mit den Sätzen darin: eine Zeile
   mit aufklappbarer Tabelle.** Die alte Fassung verschachtelte `.row` in
   `GlassTile` und die Sätze wieder in `.row` — drei Ebenen für zwei Daten.
   Jetzt: Zeile, darunter eingerückt eine Tabelle. Zwei Ebenen, keine Fläche.
2. **Statt der Sätze als Textzeilen („8 × 80 KG"): eine Tabelle mit
   Zahlenspalten.** Wer wissen will, ob er sich steigert, muss 80 und 85
   untereinander sehen. In Prosa geschrieben stehen sie nicht untereinander.
   Die Spalte VOLUMEN (kg × Wdh) ist die eigentliche Kennzahl und existierte
   vorher gar nicht.
3. **Statt Sparkline in einer Kachel: Balken auf dem Seitengrund.** Die
   „Well"-Idee (Diagramm in einer abgesetzten Fläche mit Radius) ist im System
   ausdrücklich verworfen — ein Well ist ein wieder eingeführter Behälter.
   Grundlinie 1px, sonst nichts.
4. **Statt Pillen für Wochenvolumen: t-28 mit zwei Legendenzeilen.** Eine
   Pille macht aus einer Zahl ein Objekt; hier soll die Zahl die Seite
   anführen.

### Zustände

- **Leer:** Leerzeile „Keine Einheiten — unten anlegen". t-28 zeigt `0 MIN`, Diagramm zeigt die Grundlinie ohne Balken (nicht „keine Daten").
- **Einheit ohne Sätze (z. B. Laufen):** Spalte SÄTZE En-Dash, Aufklapp-Chevron deaktiviert (--ink-450, kein Klick).
- **Laden:** Leerzeile „LADEN".
- **Fehler:** 28px-Zeile in `--alert` unter der betroffenen Zeile, optimistische Änderung zurückgerollt.
- **Sehr viele Einträge:** nach einem Jahr rund 150 Einheiten mit je bis zu 20 Sätzen. Einheitenliste zeigt 40 Zeilen, dann „+ n ältere anzeigen". Aufgeklappte Satztabellen werden beim Aufklappen einer anderen geschlossen — höchstens eine offen, sonst wächst die Seite unkontrolliert.

---

## Einstellungen

*(von mir geschrieben)*

### Wichtigste Information

**Der Zustand der Datenhaltung — wo liegen die Daten, wie viele sind es, wann
wurde zuletzt gesichert.**

Einstellungen sind eine Werkzeugseite, kein Dashboard: hier gibt es keine
Kennzahl, auf die man hinschaut. Aber es gibt eine Frage, die einen wirklich
hierher treibt, und das ist nicht der Ton-Schalter — es ist „sind meine Daten
sicher". Deshalb steht die Datenübersicht oben und nicht unten, und die
Schalter darunter.

Diese Ansicht hat **keine t-28 und keine t-44.** Das ist erlaubt („höchstens
eine") und richtig: nichts hier verdient die größte Zahl der Seite.

### Hierarchie

1. Sektion DATEN: Tabelle Modul / Einträge / Letzte Änderung, plus die Zeile mit dem Speicherort (LOKAL / SUPABASE) als t-12 mit 4×4-Lampe
2. Knopfzeile SICHERUNG LADEN (primär) | SICHERUNG EINLESEN (sekundär) | ALLES LÖSCHEN (destruktiv, ganz rechts, abgesetzt)
3. Letzte Sicherung als t-12 --ink-600: `03.08. · 261 DATENSÄTZE` — oder in `--alert`, wenn älter als 30 Tage
4. Sektion DARSTELLUNG: Zeilen mit Segment-Umschalter rechts — THEMA (DUNKEL | HELL | SYSTEM), BEWEGTE EFFEKTE (AN | AUS), TON (AN | AUS)
5. Sektion ZIELE: Lernziel/Tag und Blocklänge als Zahlenfelder mit Einheit
6. Sektion PROFIL: Name fürs Briefing, Abmelden
7. Sektion DIAGNOSE: Aufzeichnung an/aus, Messwerttabelle, Knöpfe
8. Fehlerzeile, Bestätigungsmodal für ALLES LÖSCHEN und für Import

### Layout

```
│  ▌DATEN                    ▪ SUPABASE                       22px
│  ───────────────────────────────────────────────────────────  1px
│  MODUL              EINTRÄGE    LETZTE ÄNDERUNG              22px sticky
│  Habits                    5    heute 08:12                  28px
│  Habit-Einträge        1.598    heute 08:12                  28px
│  Aufgaben                 17    gestern 19:40                28px
│  Notizen                   4    28.07.                       28px
│  Journal                  84    heute 07:55                  28px
│  Kurse                     6    12.07.                       28px
│  Lernzeiten              214    heute 16:40                  28px
│  Ziele                    12    01.08.                       28px
│  Training                 48    gestern 18:10                28px
│  Sätze                   312    gestern 18:10                28px
│  ───────────────────────────────────────────────────────────  1px --line
│  SUMME                 2.300                                 28px t-12 ink-900
│
│  LETZTE SICHERUNG  03.08. · 261 DATENSÄTZE                   28px
│  [SICHERUNG LADEN] [SICHERUNG EINLESEN]        [ALLES LÖSCHEN]  24px
│                                                    ↑ 1px --alert
│                                                              24px
│  ▌DARSTELLUNG                                               22px
│  ───────────────────────────────────────────────────────────  1px
│  Thema                          ┌DUNKEL┬HELL┬SYSTEM┐         28px
│  Bewegte Effekte                        ┌AN┬AUS┐             28px
│   Hintergrund, drehender Globus                              (t-11 Hinweis)
│  Ton                                    ┌AN┬AUS┐             28px
│                                                              24px
│  ▌ZIELE                                                     22px
│  ───────────────────────────────────────────────────────────  1px
│  Lernziel pro Tag                    [ 120 ] MIN             28px
│  Länge eines Blocks                  [  25 ] MIN             28px
```

**Aufteilung: 7/5.** Links über 7 Spalten die Datenübersicht (sie ist eine
Tabelle und braucht Breite), rechts über 5 Spalten der Stapel DARSTELLUNG /
ZIELE / PROFIL als **Panelgruppe** — kein Abstand, nur 1px `--line` zwischen
ihnen. DIAGNOSE steht darunter über die volle Breite, weil ihre Messwerttabelle
sechs Spalten braucht.

Die Segment-Umschalter stehen alle an einer gemeinsamen rechten Kante, damit
man sie als Gruppe erfasst. Der Hinweistext unter „Bewegte Effekte" ist die
einzige Erklärzeile der ganzen App und steht dort, weil der Schalter messbare
Folgen hat (rund 15 Bilder/s) — das gehört gesagt.

### Bei 390px

- Datenübersicht zuerst, Spalte LETZTE ÄNDERUNG fällt weg (`data-col="opt"`).
  Bleiben Modul und Einträge.
- Alle drei Knöpfe untereinander, volle Breite, 32px hoch. ALLES LÖSCHEN mit
  24px Abstand abgesetzt, damit es nicht neben dem Sichern steht.
- Segment-Umschalter rutschen unter ihre Beschriftung (volle Breite, 32px),
  weil `AN | AUS` neben einem Label auf 366px zu eng wird.
- Zahlenfelder 40px, t-16, `inputmode="numeric"`.
- Diagnose-Tabelle scrollt nicht — sie wird auf drei Spalten reduziert
  (Ziel, Zeit, Lücke).

### Statt Karten

1. **Statt vier `GlassTile` (Darstellung, Ziele, Daten, Diagnose): vier
   Sektionsköpfe.** Einstellungen sind die Ansicht, in der Kachelwände am
   sinnlosesten sind — jede Kachel enthält zwei bis drei Zeilen und kostet
   mehr Chrome als Inhalt.
2. **Statt Kippschalter oder Pille: ein Zwei-Segment-Umschalter AN | AUS.**
   Ein Kippschalter ist eine Pille mit rundem Griff — genau das, was die
   Richtung ausschließt. Ein Segment-Umschalter zeigt außerdem *beide*
   Zustände als Wort, was bei „Bewegte Effekte" mehrdeutig weniger ist als
   ein Schieber, dessen Richtung man raten muss.
3. **Statt einer Textwand über Export/Import: eine Tabelle und eine Zeile.**
   Die alte Fassung erklärte in drei Sätzen, warum Sicherungen wichtig sind.
   Jetzt steht da, wie viele Datensätze existieren und wann zuletzt gesichert
   wurde — und wenn das über 30 Tage her ist, steht das Datum in `--alert`.
   Eine Zahl, die alt aussieht, überzeugt besser als ein Absatz.
4. **Statt eines Toasts nach dem Sichern: die Zeile LETZTE SICHERUNG
   aktualisiert sich.** Der Beweis, dass es geklappt hat, ist der neue Wert an
   der Stelle, an der man ihn ohnehin liest.
5. **`ALLES LÖSCHEN` ist der einzige destruktive Knopf der App** (1px
   `--alert`, transparenter Grund) und öffnet ein Modal, dessen Text nur die
   Konsequenz mit Zahl nennt: „Alles löschen — 2.300 Datensätze. Vorher wird
   eine Sicherung heruntergeladen." Kein „Sind Sie sicher?".

### Zustände

- **Leer:** kommt nicht vor — Einstellungen haben immer Inhalt. Die Datentabelle zeigt bei einer frischen Installation überall `–` in --ink-450, nicht `0`.
- **Laden:** die Datentabelle zeigt in der Spalte EINTRÄGE „LADEN" in t-11 --ink-600, die Schalter sind bereits bedienbar (sie hängen an lokalen Einstellungen, nicht an der Datenbank).
- **Fehler beim Speichern einer Einstellung:** Segment springt zurück, 28px-Zeile in `--alert` unter der Zeile.
- **Import läuft:** Knopfzeile deaktiviert (--ink-450), Zeile „IMPORT LÄUFT · 261 DATENSÄTZE" in t-11. Kein Fortschrittsbalken — der Vorgang ist zu kurz und die Zahl sagt mehr.
- **Lokaler Modus:** die Lampe im Sektionskopf steht in --ink-600 und das Wort ist LOKAL. Die Zeile „Abmelden" in PROFIL entfällt vollständig, statt deaktiviert zu erscheinen.
- **Sehr viele Einträge:** die Datentabelle hat immer genau zehn Zeilen plus Summe. Die Diagnose-Tabelle ist auf 40 Messungen begrenzt (Ringpuffer).

---

# Schlussprüfung

*(von mir geschrieben — der adversariale Prüflauf des Workflows ist am
Ausgabenlimit gescheitert, also habe ich selbst geprüft. Ich prüfe hier auch
meine eigenen sieben Ansichten, was schwächer ist als eine unabhängige
Prüfung. Das solltest du wissen, wenn du dem Ergebnis vertraust.)*

## Widersprüche im System — mit Rechnung

**1. Das Habit-Wochenraster passt auf 390px nicht.** Das System rechnet vor:
Namensspalte 104px + 12px + Raster 250px = 366px = „exakt die Inhaltsbreite".
Die Rechnung übersieht das Zeilenpadding. Baustein 3 schreibt `padding: 0 8px`
für jede Zeile, also 16px. Verfügbar sind damit 366 − 16 = **350px**, gebraucht
werden 366px. **Überlauf 16px.**
→ *Behebung:* Namensspalte auf **88px**. Dann 88 + 12 + 250 = 350px, exakt
passend. Alternativ Zellen auf 32px (7·32 + 6·2 = 236) und Namensspalte 102px.

**2. Der Timer passt nicht in den Ring.** Baustein 14 setzt die t-44 „in die
Ringmitte" und ordnet Study einen Timer-Ring zu. `01:23:45` sind 8 Zeichen in
Mono 44px ≈ **211px**; der Ring hat 132px Außenmaß. Im Cockpit funktioniert es
(2 Ziffern ≈ 53px), in Study nicht.
→ *Behebung:* in der Study-Ansicht oben eingearbeitet — Ziffer neben dem Ring,
auf 390px darunter.

**3. Die Wochenraster-Zelle hat zwei widersprüchliche Radien.** Die Radien-
Tabelle nennt „Wochenraster-Zelle" unter `--r-0`, die Checkbox unter `--r-2`.
Baustein 19 sagt aber, die Rasterzelle *ist* die Checkbox-Fläche.
→ *Behebung:* Rasterzelle `--r-0` (sie ist Teil eines Gitters), freistehende
Checkbox in Listen `--r-2`. Das ist eine Entscheidung, keine Ableitung — sie
muss im System stehen, sonst entscheidet sie jeder Entwickler neu.

**4. `--m-tasks = --ink-800` bricht die eigene Farbregel.** Leitsatz 4 sagt:
„Die Chrome-Ebene ist unbunt, Farbe erscheint an genau vier Stellen", darunter
„Modul-Label im Sektionskopf" und „2px-Zustandsmarke". Für Tasks sind beide
dann in Textfarbe — der Signalstrich ist von einer Haarlinie kaum, das Label
von einer Überschrift gar nicht zu unterscheiden.
→ *Bewertung:* Ich halte das für **richtig, aber unvollständig dokumentiert**.
Tasks ist das Modul ohne eigenen Lebensbereich; keine Farbe zu haben ist eine
Aussage. Das System sollte es aber ausdrücklich als Ausnahme benennen: „Der
Signalstrich der Tasks-Sektion entfällt; das Label steht in --ink-900 statt in
einer Modulfarbe." Sonst sieht es nach Fehler aus.

**5. Die Index-Seite führt eine Funktion ein, die es nicht gibt.** Baustein 23
listet „Alles löschen" unter DATEN. Die bestehende App hat das nicht, und die
Anforderungen nennen es nicht.
→ *Entscheidung nötig:* Neue Anforderung (dann in die Anforderungsliste
aufnehmen) oder aus der Index-Seite streichen. Ich habe es in der
Einstellungen-Ansicht **behalten** und mit Modal plus Zwangssicherung versehen
— aber das ist eine Erweiterung des Funktionsumfangs, keine Gestaltung, und
gehört als solche entschieden.

**6. Die Journal-Zeitleiste bekommt eine Spalte, die im Datenmodell fehlt.**
Die Bausteinzuordnung nennt „Stimmung". `JournalEntry` hat `date`, `body`,
`createdAt`, `updatedAt` — kein Stimmungsfeld.
→ *Behebung:* in der Journal-Ansicht oben durch ANRISS ersetzt.

**7. Die Behauptung „Cockpit ohne Scrollen bei 1440×900" gilt fürs Viewport,
nicht fürs Fenster.** Gerechnet werden 884px Seitenhöhe gegen 900px. Ein
Browserfenster von 900px Höhe hat je nach Chrome 780–820px Viewport. Auf einem
MacBook Air (1470×956 skaliert) reicht es; auf 1440×900 mit sichtbarer
Lesezeichenleiste nicht.
→ *Behebung:* die Prüfung im Leitsatz präzisieren auf „1440×900 **Viewport**"
und im Zweifel die rechte Spalte auf vier Sektionen kürzen (dann 771 − 135 −
24 = 612px, Gesamthöhe 725px).

## Rückfälle in verbotene Muster

Ich habe die Verbotsliste Punkt für Punkt gegen alle neun Ansichten geprüft.
Drei Stellen sind grenzwertig:

**a) Der Formularbereich (Baustein 28) ist faktisch eine Karte.** Fläche
(`--panel`), umlaufender Rahmen (1px `--line`), Radius (2px), Innenabstand
(12/14px). Das erfüllt jede Definition einer Karte.
→ *Verteidigung:* Er markiert Eingabe gegen Anzeige, nicht Inhalt gegen
Inhalt — und er kommt pro Ansicht **höchstens einmal** vor. Der verbotene
Effekt ist „excessive cards" und „cards nested inside cards"; ein einzelner,
funktional begründeter Eingabebereich ist keine Kachelwand. Aber es ist eine
Karte, und das System sollte es so nennen statt „Formularbereich".

**b) Der Chip/Tag (Baustein 12) mit 2px Radius ist ein Badge.** Die
Verbotsliste nennt „unnecessary badges".
→ *Verteidigung:* Der Tag ist nicht dekorativ, er ist ein filterbares
Datenfeld. Notwendig, also nicht „unnecessary". Grenzwertig bleibt es
trotzdem — eine Alternative wäre, den Tag als reines Wort in t-10 --ink-600
ohne Rahmen zu setzen. **Ich würde das vorziehen** und den Rahmen streichen:
er trägt keine Information, und vier Rähmchen in einer Liste sind vier
Objekte, die keine sein müssten.

**c) Die aufgeklappte Satztabelle in Sport (meine Ansicht) ist eine
verschachtelte Fläche.** Ich habe sie in der Skizze mit Rahmen gezeichnet.
→ *Behebung:* Sie bekommt **keinen** Rahmen, nur 28px Einrückung und ihren
eigenen sticky Kopf mit 1px `--line`. Damit liest sie sich als eingerückte
Fortsetzung, nicht als Kasten in einer Liste. Die Skizze oben ist an dieser
Stelle irreführend.

Kein Rückfall gefunden bei: Verläufen (null), Glasmorphismus (null),
Schlagschatten (null — nur die zwei zugelassenen `inset`-Formen), Emoji-Icons
(null), farbigen Icon-Kreisen (null), Hero-Headlines (größte Schrift ist eine
Zahl, keine Überschrift), Pillen (`999px` existiert nicht), lila/blauer
KI-Palette (kein Cyan, kein Violett; einziger blaustichiger Ton ist Stahl
`#7E93B0` bei ~26 % Sättigung), übermäßigem Weißraum (Dichte ist als Prüfwert
festgeschrieben), generischem Dashboard-Layout (jede Ansicht hat eine eigene
Informationshierarchie und drei verschiedene Spaltenaufteilungen: 7/5,
einspaltig, asymmetrischer Kopf).

## Lücken — was ein Entwickler noch fragen muss

1. **Schriftlizenz und Ladeweg.** IBM Plex ist OFL, das ist geklärt. Offen:
   vier `woff2`-Dateien selbst hosten (~120 KB) oder Systemschriften als
   Erstwahl? Auf iOS wäre `ui-monospace` (SF Mono) kostenlos und sofort da.
   **Empfehlung:** Plex Mono selbst hosten (die Ziffern sind das Gesicht der
   App), Plex Sans durch `system-ui` ersetzen — spart die Hälfte.
2. **Ist der Ring überhaupt noch gewollt?** Das System reduziert ihn auf drei
   Bögen ohne Globus, Trabanten, Teilstriche und Wellenform. Das war die
   Identität der bisherigen App. Die neue Richtung schließt sie aus — das ist
   konsequent, aber es ist ein Bruch, der ausgesprochen werden muss.
3. **Sortier- und Filterzustand:** überlebt er den Ansichtswechsel? Steht er
   in der URL? Das System sagt nichts dazu, und es ändert die Umsetzung.
4. **Tastaturkürzel auf dem Mac:** `g h` als Sequenz kollidiert mit
   Safari-Schnellsuche in manchen Konfigurationen. Braucht einen Test, keine
   Annahme.
5. **Zwei Themen bedeutet doppelte Kontrollarbeit.** Jede der 20 Farben ist in
   beiden Themen definiert und nachgerechnet — gut. Aber jede *neue* Farbe
   muss es künftig auch sein, und es gibt keinen automatischen Test dafür.
   **Empfehlung:** ein kleines Skript, das die Kontrastwerte aus den Tokens
   nachrechnet und bei < 4,5:1 den Build bricht.
6. **Virtualisierung:** ich habe sie in Tasks und Notes ab 200 Zeilen
   vorgesehen. Das System sagt nichts dazu. Bei fester 28px-Zeilenhöhe ist es
   einfach — aber es muss entschieden werden, nicht entdeckt.

## Urteil

**Baubar.** Das System ist ungewöhnlich vollständig: jede Größe ist eine Zahl,
jede Farbe hat einen nachgerechneten Kontrastwert in zwei Themen, jede Regel
hat einen Prüfsatz, und die Rasterarithmetik ist offengelegt statt behauptet —
weshalb ich zwei Rechenfehler überhaupt finden konnte. Das ist ein gutes
Zeichen, nicht ein schlechtes.

Vor dem ersten Commit zu erledigen: die sechs Widersprüche oben (drei davon
sind Einzeiler), die Entscheidung über „Alles löschen" und über die
Journal-Spalte, und die Antwort auf Punkt 2 der Lücken — ob der Ring in dieser
reduzierten Form die Identität der App noch tragen soll.
