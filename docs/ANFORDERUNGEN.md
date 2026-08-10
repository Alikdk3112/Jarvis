# JARVIS — Anforderungen

Framework-unabhängig. Beschreibt, was die App tun muss, nicht wie die
aktuelle Fassung (React/Vite/Supabase) es tut. Die aktuelle Fassung dient
im Anhang als Referenz, falls Details in dieser Zusammenfassung fehlen.

---

## 1. Zweck

Ein privater Tracker/Dashboard für einen einzelnen Nutzer ("Jarvis"),
später um KI erweiterbar. Acht Module plus ein Startbildschirm ("Cockpit"),
der die wichtigsten Werte aus allen Modulen zusammenzieht.

Sprache: **HUD-Beschriftungen englisch, Inhalte deutsch.** Gemeint sind
Modulnamen, Statuszeilen, Knöpfe ("HABITS", "SYSTEM ONLINE") — Fließtext,
Fehlermeldungen und das Briefing bleiben deutsch.

---

## 2. Plattform

- Web-App, als PWA installierbar (Handy + Desktop)
- Muss ohne Backend funktionieren können (lokaler Modus) — Umstieg auf ein
  Backend darf keine Daten verlieren (siehe §7 Export/Import)
- iOS-Anforderungen: eigenes App-Icon, Startbildschirm-Bilder, Safe-Area
  (Notch/Home-Indikator), `standalone`-Darstellung ohne Safari-Chrome,
  kein Zoom bei Eingabefeldern (Schriftgröße ≥16px)
- `prefers-reduced-motion` muss respektiert werden: alle Animationen
  entfallen, Endwerte werden direkt angezeigt

---

## 3. Datenmodell

Jede Sammlung hat eine `id` (client-generierte UUID, damit lokale und
Server-Daten austauschbar bleiben) und — im Mehrbenutzerbetrieb — eine
`user_id`.

### Habit
| Feld | Typ | Bedeutung |
|---|---|---|
| name | string | |
| color | Modulfarbe | Standard: „habits" |
| targetPerWeek | int 1–7 | Wochenziel |
| sortOrder | int | Reihenfolge in Listen |
| archived | bool | |
| createdAt | Zeitstempel | |

### HabitEntry
| Feld | Typ | Bedeutung |
|---|---|---|
| habitId | Referenz → Habit | |
| date | Kalendertag (YYYY-MM-DD) | **lokaler** Tag, nie UTC |
| done | bool | |

Eindeutig pro `(habitId, date)`. **Ein zurückgenommenes Häkchen löscht den
Eintrag**, statt `done=false` zu setzen — sonst wächst die Tabelle mit
Nullwerten voll. Löschen eines Habits muss alle seine Einträge mitnehmen
(Kaskade).

### Task
| Feld | Typ |
|---|---|
| title | string |
| notes | string, optional |
| dueAt | Zeitstempel, optional (Datum + optional Uhrzeit) |
| tag | Enum: `uni` / `sport` / `jarvis` / `privat` / keiner |
| done | bool |
| doneAt | Zeitstempel, gesetzt wenn done |
| createdAt | Zeitstempel |

### Note
| Feld | Typ |
|---|---|
| title | string (leer erlaubt, dann erste 40 Zeichen des Inhalts) |
| body | string |
| tags | string[] (derzeit ungenutzt in der UI, aber im Modell) |
| createdAt, updatedAt | Zeitstempel |

### JournalEntry
| Feld | Typ |
|---|---|
| date | Kalendertag |
| body | string |
| createdAt, updatedAt | Zeitstempel |

**Genau ein Eintrag pro Tag** (eindeutig auf `date`).

### Course (Uni)
| Feld | Typ |
|---|---|
| name | string |
| ects | int |
| semester | string, optional |
| examDate | Kalendertag, optional |
| grade | Dezimalzahl 1,0–5,0, optional |
| passed | bool |
| createdAt | Zeitstempel |

### StudySession
| Feld | Typ |
|---|---|
| courseId | Referenz → Course, optional (**nicht** kaskadierend löschen — siehe §4) |
| date | Kalendertag |
| startedAt | Zeitstempel |
| seconds | int ≥0 |
| note | string, optional |

### Goal
| Feld | Typ |
|---|---|
| title | string |
| description | string, optional |
| targetDate | Kalendertag, optional |
| progress | int 0–100 |
| status | Enum: `active` / `done` / `dropped` |
| createdAt | Zeitstempel |

### Workout
| Feld | Typ |
|---|---|
| date | Kalendertag |
| type | string (freier Text, z. B. "Push", "Laufen") |
| minutes | int ≥0 |
| note | string, optional |
| createdAt | Zeitstempel |

### WorkoutSet
| Feld | Typ |
|---|---|
| workoutId | Referenz → Workout |
| exercise | string |
| reps | int |
| weight | Dezimalzahl (kg) |
| sortOrder | int |

### Settings (Singleton, kein Array)
| Feld | Typ | Vorgabe |
|---|---|---|
| ambient | bool | an — steuert Hintergrundeffekte **und** Globus-Drehung |
| sound | bool | aus |
| displayName | string | für das Briefing |
| studyGoalMinutes | int | Tagesziel Lernzeit |
| focusBlockMinutes | int | Timer-Blocklänge, bei der akustisch Bescheid gegeben wird |

### Löschregeln (Kaskaden)

Das ist eine der Stellen, an der die erste Fassung Fehler hatte —
unbedingt von Anfang an einplanen, nicht nachträglich:

- **Habit löschen** → alle seine `HabitEntry` mitlöschen
- **Workout löschen** → alle seine `WorkoutSet` mitlöschen
- **Course löschen** → zugehörige `StudySession` **bleiben erhalten**,
  ihr `courseId` wird auf „keiner" gesetzt. Gelernte Zeit ist gelernte
  Zeit; sie beim Löschen eines Kurses zu vernichten würde die Wochensumme
  rückwirkend verfälschen.
- Löschen eines Habits mit Verlauf muss vorher bestätigt werden
  (Rückfrage mit Anzahl der betroffenen Einträge)

---

## 4. Module — funktionale Anforderungen

### 4.1 Cockpit (Startbildschirm)

Zeigt gebündelt, was in allen Modulen heute wichtig ist:

- **Ring-Hub**: drei Fortschrittsbögen (Tag gesamt, Habits, Lernziel),
  eine große Prozentzahl in der Mitte
- **Serie** (Streak): Tage in Folge, an denen **mindestens die Hälfte**
  der aktiven Habits erledigt wurde — nicht „mindestens einer", das wäre
  bei mehreren Habits fast immer wahr und aussagelos
- **Tagesziel-Formel**: `0,4 · Habit-Anteil + 0,3 · Aufgaben-Anteil +
  0,3 · Lernziel-Anteil` (Gewichte an einer Stelle definieren, nicht
  mehrfach)
- **Daily Briefing**: ein Satz, regelbasiert aus den aktuellen Werten
  erzeugt (Begrüßung nach Uhrzeit, offene Habits/Aufgaben, nächste
  Klausur falls ≤14 Tage rot hervorgehoben, Lernzeit heute/diese Woche,
  Serie). Bewusst als austauschbare Funktion gekapselt — später soll hier
  ein Sprachmodell andocken, ohne die Darstellung anzufassen
- **Heatmap**: 140 Tage Rückblick, Wert 0–4 nach Anteil erledigter Habits
  am jeweiligen Tag
- **Lernminuten-Verlauf**: letzte 14 Tage
- Kacheln mit Live-Ausschnitten aus Habits, Study, Tasks, Journal, Goals,
  Uni, Sport — Klick auf den Titel navigiert zum vollen Modul
- **Trainingswoche muss echt nach Datum filtern** (letzte 7 Tage), nicht
  einfach „die letzten drei Einträge" — sonst zeigt ein seit Monaten
  ruhendes Modul weiter alte Zahlen als aktuell an

### 4.2 Habits

- Wochenraster (Mo–So) mit Häkchen pro Tag, aktueller Tag hervorgehoben
- Wochenzähler je Habit (`x / Zielwert`) plus Punktreihe als visuelle
  Zusammenfassung
- Neuen Habit anlegen: Name + Wochenziel (1–7)
- Löschen mit Bestätigung (siehe Kaskadenregel oben)
- Häkchen-Zustand muss **sofort** sichtbar reagieren, unabhängig davon,
  wie lange das Speichern dauert (siehe §6 Optimistische Updates)

### 4.3 Tasks & Notes

Zwei Bereiche auf einer Seite:

**Aufgaben:**
- Anlegen mit Titel, optionalem Fälligkeitsdatum (+ optional Uhrzeit),
  Bereich (Uni/Sport/Jarvis/Privat/ohne)
- Fälligkeits-Anzeige: „ÜBERFÄLLIG · Datum" (vergangen), „HEUTE [Zeit]",
  „MORGEN", Wochentag (≤6 Tage), sonst Datum — **diese Regel wird auch im
  Cockpit gebraucht, an einer Stelle definieren**
- Häkchen setzt `done` + `doneAt`; abgehakte Aufgaben in einklappbarem
  Bereich, neueste zuerst
- Löschen einzeln, ohne Rückfrage (kein Verlauf, der verloren geht)

**Notizen:**
- Titel optional (Vorgabe: erste 40 Zeichen des Texts), mehrzeiliger Text
- Volltextsuche über Titel + Inhalt, live beim Tippen
- Sortiert nach letzter Änderung

### 4.4 Journal

- **Genau ein Eintrag pro Kalendertag**
- Heutiger Eintrag ist immer offen zum Bearbeiten, **kein Speichern-Knopf**
  — automatisches Speichern ca. 1 Sekunde nach der letzten Eingabe
  (entprellt)
- Sichtbare Rückmeldung „GESPEICHERT" für ~1,6 Sekunden nach jedem
  erfolgreichen Speichern
- Zeitleiste aller früheren Einträge, neueste zuerst
- **Kritisch**: Trifft die Antwort der ersten Ladeanfrage später ein als
  der erste Tastendruck des Nutzers, darf sie das Getippte nicht
  überschreiben. Sobald der Nutzer tippt, „gehört" das Feld ihm.

### 4.5 Study (Lernzeit-Timer)

- Timer mit Start/Pause/Weiter/Buchen/Zurücksetzen, optionale
  Fach-Zuordnung (Kurs oder „ohne Fach")
- **Der Timer muss über die Uhr laufen, nicht über Taktzählung.** Ein
  naiver `setInterval`, der jede Sekunde einen Zähler erhöht, verliert
  Zeit, sobald das Gerät den Takt drosselt oder pausiert (Bildschirm
  gesperrt, Tab im Hintergrund — auf iOS Safari besonders ausgeprägt).
  Richtig: Startzeitpunkt merken, laufend gegen `Date.now()` / die
  Systemuhr rechnen; der Takt aktualisiert nur die Anzeige
- Timer-Zustand muss einen Neuladen/Absturz der Seite überleben
  (persistieren, z. B. `localStorage`) — inklusive „läuft gerade" und
  seit wann
- „Buchen" unter 30 Sekunden ist gesperrt/verwirft ohne zu speichern (zu
  kurz für eine sinnvolle Lerneinheit) — diese Regel muss überall gelten,
  wo gebucht werden kann, nicht nur an einer Stelle
- Fortschrittsring zeigt Anteil am eingestellten Blockziel; bei Erreichen
  akustisches Signal (falls Ton aktiviert)
- Tagesansicht: alle heutigen Einheiten mit Fach und Dauer, einzeln
  löschbar
- Verlaufskurve der letzten 14 Tage (Minuten je Tag)

### 4.6 Uni

- Kursliste mit ECTS, optionalem Klausurtermin, Note, Status
  (laufend/bestanden)
- Note eintragen (1,0–5,0) markiert den Kurs automatisch als
  abgeschlossen (≤4,0 bestanden)
- Abgeschlossene Kurse können wieder geöffnet werden (Note löschen)
- Semesterfortschritt: ECTS bestanden / gesamt als Ring, gewichteter
  Notendurchschnitt (nach ECTS gewichtet, nicht arithmetisch)
- Klausur-Countdown, rot hervorgehoben bei ≤14 Tagen
- Kurslöschung siehe Kaskadenregel — Lernzeit bleibt erhalten

### 4.7 Goals

- Ziel mit Titel, optionalem Zieldatum, Fortschritt (Schieberegler 0–100 %)
- Countdown zum Zieldatum, „ÜBERFÄLLIG" wenn überschritten, hervorgehoben
  bei ≤14 Tagen
- „Erreicht"-Knopf setzt Status `done` + Fortschritt 100 in einem Schritt
- Abgeschlossene/verworfene Ziele in eigenem Bereich, weiter löschbar
- **Der Fortschrittsregler darf nicht bei jedem Pixel schreiben.** Er
  muss lokal sofort mitziehen (Anzeige + Balken), aber erst beim Loslassen
  einmal speichern. Das ist keine Kleinigkeit — ein einzelner Zug von 0
  auf 100 kann sonst vierzig oder mehr Schreibvorgänge auslösen.

### 4.8 Sport

- Trainingseinheit anlegen: Datum, Art (freier Text), Dauer in Minuten
- Je Einheit beliebig viele Sätze (Übung, Wiederholungen, Gewicht),
  eigene Reihenfolge
- Wochenvolumen (Minuten diese Woche), Verlaufskurve der letzten 14 Tage
- Löschung einer Einheit nimmt ihre Sätze mit (Kaskade)

### 4.9 Auswertung / Einstellungen

- **Export**: gesamten Datenbestand als JSON-Datei herunterladen
  (versioniert, damit ein späteres Schemaupdate erkennbar ist)
- **Import**: JSON-Datei einlesen, **ersetzt den gesamten Bestand**.
  Das ist die einzige zerstörerische Aktion der App — Anforderungen:
  1. Vorher anzeigen, was in der Datei steht (Anzahl Datensätze, Datum)
     und was ersetzt wird (aktueller Bestand)
  2. Ausdrückliche Bestätigung verlangen
  3. Aktuellen Stand automatisch vorher als Datei sichern, bevor
     überschrieben wird
- Schalter: bewegte Effekte an/aus, Ton an/aus, Name fürs Briefing
- Lernziel/Tag, Blocklänge einstellbar
- Abmelden (nur im Backend-Modus relevant)

---

## 5. Design-System

- **Farben**: Basis Cyan `#00E5FF`; je Modul eine Signalfarbe — Habits
  Grün `#00FF9D`, Study Violett `#A855F7`, Journal Amber `#FFB000`, Sport
  Orange `#FF6B35`, Goals Pink `#FF2D95`, Alarm Rot `#FF3B30`
- Glaskacheln, durchgehend stark abgerundet, dezenter Lichtschimmer an
  der Oberkante
- Radiale Kommandozentrale als zentrales Motiv: Ring-Hub mit
  Teilstrich-Ring, zwei gegenläufig rotierenden Ringen, darüber ein
  rotierender Gitter-Globus mit umkreisenden Trabanten (einer je
  Kernmetrik) und einer Wellenform in der Bogenlücke
- **Der Hub ist datengetrieben, keine Deko**: Bogenlängen, die
  Prozentzahl, leuchtende Knoten auf dem Globus (Anzahl = Tagesfortschritt)
  und Trabanten-Helligkeit hängen an echten Werten und gleiten weich auf
  den Zielwert zu (kein Sprung)
- Desktop: feste Icon-Leiste links. Handy: schwebende Kapsel-Navigation
  unten (nur die fünf häufigsten Ziele), Zugang zu den übrigen Modulen
  und den Einstellungen über eine sichtbare Stelle in der Kopfzeile —
  **diese Anforderung wurde in der ersten Fassung übersehen**: die
  Einstellungen waren auf dem Handy schlicht nicht erreichbar
- Ambient-Hintergrund (Punktraster, Radar-Sweep, Scanlines, Vignette) als
  eigener, abschaltbarer Layer

---

## 6. Nicht-funktionale Anforderungen — aus Messungen gelernt

Diese Punkte sind keine Geschmacksfragen, sondern maßgeschneidert aus
Fehlern, die in der ersten Fassung tatsächlich auftraten und gemessen
wurden. Sie gelten unabhängig vom gewählten Framework.

**Schreibvorgänge:**
- Kontinuierliche Eingaben (Schieberegler, Textfelder mit Autospeichern)
  dürfen **nicht bei jedem Zwischenwert** ins Backend schreiben. Lokal
  sofort anzeigen, entprellt oder beim Loslassen einmal committen.
- Jede Schreib-Mutation sollte **optimistisch** sein: Oberfläche
  aktualisiert sich sofort, das eigentliche Speichern läuft im
  Hintergrund; schlägt es fehl, wird zurückgerollt und der Fehler
  sichtbar gemacht (nicht verschluckt) — sonst wirkt eine langsame
  Verbindung wie ein Hänger.
- Datenabfragen sollten lange als „frisch" gelten (Minuten, nicht
  Sekunden) und nur beim Zurückkehren in den Vordergrund neu geladen
  werden — nicht bei jedem Seitenwechsel innerhalb der App.

**Listen und Nachschlagen:**
- Wird ein Wert für mehrere Elemente wiederholt gebraucht (z. B. „ist
  Habit X an Tag Y erledigt", für jede Kombination aus Habit und
  Wochentag), muss einmal eine Nachschlagestruktur (Map/Set) gebaut
  werden — kein Vollscan der gesamten Sammlung je Frage. Bei einem Jahr
  Verlauf ist der Unterschied drei bis vier Größenordnungen.

**Animierte/gezeichnete Elemente (Canvas/SVG):**
- Werte, die sich einem Ziel weich annähern, sollten aufhören zu rechnen
  und ins DOM zu schreiben, sobald der Unterschied unter der
  Wahrnehmungsschwelle liegt — nicht endlos mit der letzten
  Nachkommastelle weiterrechnen
- Nur schreiben, wenn sich das Ergebnis seit dem letzten Bild wirklich
  unterscheidet
- Rechenaufwand, der pro Bild konstant ist (z. B. eine Rotation, die
  innerhalb eines Bildes nicht wechselt), einmal pro Bild berechnen, nicht
  pro gezeichnetem Punkt
- Animation anhalten, wenn das Element aus dem Sichtbereich gescrollt ist
  (IntersectionObserver oder gleichwertig) und wenn der Tab im
  Hintergrund ist
- Ein sichtbarer Schalter für „bewegte Effekte" sollte **wirklich alle**
  laufenden Animationen abschalten, nicht nur einen Teil davon
- `backdrop-filter` ist in eigenen Messungen der teuerste einzelne
  CSS-Effekt gewesen — sparsam einsetzen oder vermeiden
- Bewegungseffekte (Übergänge zwischen Seiten o. ä.) sollten möglichst
  nur Deckkraft ändern, kein `transform` auf große Baumausschnitte legen
  — Letzteres zwingt den Browser, eine eigene Compositing-Ebene
  samt aller enthaltenen Canvas-/SVG-Elemente anzulegen

**Navigation:**
- Scrollposition beim Wechsel zwischen Ansichten zurücksetzen (nach
  oben), sonst wirkt ein Wechsel wie „nichts passiert"
- Sichtbare Rückmeldung auf Berührung/Klick (besonders auf iOS, wo der
  native graue Tipp-Effekt oft bewusst abgeschaltet wird) — sonst fühlt
  sich jede Verzögerung wie ein Hänger an, obwohl nur keine Rückmeldung
  da ist
- `touch-action: manipulation` auf klickbaren Elementen, damit mobile
  Browser nicht auf einen möglichen Doppeltipp warten

**Ressourcenlimits, die man kennen sollte:**
- Manche Browser (v. a. Safari) begrenzen die Anzahl gleichzeitig
  offener `AudioContext`-Instanzen streng — einen einzigen für die ganze
  App anlegen, nicht einen je Komponente
- Bulk-Operationen (Erstbefüllung, Export/Import, große Löschungen) über
  Sammel-Schreibvorgänge abwickeln, nicht Zeile für Zeile

---

## 7. Backend / Sync (falls gewünscht)

Nicht zwingend Teil einer Neufassung, aber falls ein Server-Backend
gewünscht ist:

- **Single-User-Betrieb**: Registrierung nur für vorab freigeschaltete
  E-Mail-Adresse(n), sonst lehnt das Backend die Registrierung ab
- Zeilenweise Zugriffsbeschränkung auf den eigenen Nutzer (jede Zeile
  trägt eine Nutzer-Kennung, serverseitig erzwungen — nicht nur im
  Client geprüft)
- E-Mail + Passwort als Anmeldeverfahren (bewusst gegen Magic-Link
  entschieden — zu umständlich im Alltag), Mindestlänge Passwort 8
  Zeichen, „Passwort vergessen"-Fluss
- Client-generierte IDs (UUID), damit lokal erfasste Daten unverändert
  auf ein Backend übertragen werden können
- Ein austauschbarer lokaler Speicher (z. B. IndexedDB) sollte auch ohne
  Backend voll funktionsfähig sein — die App ist von Anfang an ohne
  Server nutzbar, das Backend ist ein optionaler Umzug, kein
  Voraussetzung

---

## 8. Explizit nicht gefordert (Non-Goals)

Bewusst ausgeschlossen, um den Umfang nicht unnötig zu vergrößern:

- Kommando-Palette
- Boot-/Ladesequenz beim Start
- XP-/Level-System, Gamification über reine Serien hinaus
- Kalender-Integration
- Finanzverfolgung
- Anki-Import/-Statistiken

---

## Anhang: Referenz-Implementierung

Die bestehende Fassung (nicht Teil der Anforderung, nur als Nachschlage-
quelle, falls ein Detail oben unklar bleibt):

- Vite + React 19 + TypeScript, react-router-dom, TanStack Query,
  Tailwind (Layout) + eigenes CSS (HUD-Optik)
- Datenschicht als Vertrag mit zwei Adaptern: Dexie/IndexedDB lokal,
  Supabase remote, Umschaltung über das Vorhandensein von
  Umgebungsvariablen
- `supabase/migrations/0001_schema.sql` enthält das vollständige
  SQL-Schema mit Row-Level-Security und der Freischaltungs-Logik
- vite-plugin-pwa für Manifest/Service-Worker
- Repo: `Alikdk3112/Jarvis`, gehostet über GitHub Pages
