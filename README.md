# JARVIS

Persönliches Cockpit — Habits, Aufgaben, Notizen, Lernzeit, Uni, Ziele, Sport und Journal
in einer Ansicht. Web-App, auf dem Handy als eigenständige App installierbar.

![Ring-Hub](public/icon-192.png)

## Was die App kann

Im Zentrum steht der **Ring-Hub**: drei ineinanderliegende Bögen über einem rotierenden
Gitterglobus zeigen, wie der Tag steht.

| Bogen | Bedeutung |
|---|---|
| außen, cyan | Tagesziel gesamt |
| Mitte, grün | Habits heute erledigt |
| innen, violett | Lernzeit gegen das Tagesziel |

Das Tagesziel wird in `src/lib/cockpit.ts` berechnet und nirgends sonst:

```
Tag = 0,4 · Habits + 0,3 · Aufgaben + 0,3 · Lernzeit
```

Habits abhaken oder den Timer starten bewegt Bögen, Zahl, Legende und die leuchtenden Knoten
auf dem Globus — der Hub ist keine Dekoration.

**Module:** Habits · Tasks & Notes · Journal · Study-Timer · Uni · Goals · Sport · Auswertung.
Dazu ein **Daily Briefing** in einem Satz, aktuell aus festen Regeln erzeugt
(`src/features/briefing/Briefing.tsx`) — später übernimmt dort ein KI-Modell.

## Starten

```bash
npm install
npm run dev
```

Beim ersten Start wird die Datenbank mit Beispieldaten gefüllt, damit das Cockpit nicht
leer dasteht. Alles davon lässt sich in den Modulen ändern oder löschen.

```bash
npm run build       # Produktionsbau
npm run typecheck   # nur Typen prüfen
```

## Wo die Daten liegen

Die Datenschicht ist ein Vertrag mit zwei Austauschbaren Umsetzungen:

```
src/lib/data/types.ts      der Vertrag — nur den kennen die Module
src/lib/data/local.ts      IndexedDB über Dexie  (aktiv, solange kein Supabase konfiguriert)
src/lib/data/supabase.ts   dieselbe Schnittstelle gegen Supabase
src/lib/data/index.ts      wählt anhand der Umgebungsvariablen aus
```

Ohne `.env.local` läuft alles lokal — praktisch zum Ausprobieren, aber Handy und Laptop
haben dann getrennte Daten. Lade unter *Einstellungen → Daten* regelmäßig eine Sicherung
herunter; dieselbe Datei ist zugleich der Umzugskoffer.

### Supabase einschalten

Das Schema ist bereits eingespielt (Projekt `PrivateApp`, Region `eu-west-1`).
Es liegt dort neben einer fremden Tabelle `dashboard_state`, die unberührt bleibt —
ein eigenes Projekt ging nicht, weil der kostenlose Tarif zwei aktive Projekte erlaubt
und beide belegt waren.

1. `.env.local` anlegen (Werte stehen im Supabase-Dashboard unter *Project Settings → API*):
   ```
   VITE_SUPABASE_URL=…
   VITE_SUPABASE_ANON_KEY=…
   ```
2. Neu starten → es erscheint der Anmeldebildschirm: E-Mail und Passwort.
   Beim ersten Mal *Noch kein Konto?* → Konto anlegen (mindestens 8 Zeichen).
3. Unter *Einstellungen → Daten* die lokale Sicherung einlesen.

Für ein frisches Projekt stattdessen `supabase/migrations/0001_schema.sql` im SQL-Editor
ausführen — die Datei ist auf dem eingespielten Stand.

Angemeldet wird mit E-Mail und Passwort (`signInWithPassword`). Kein Magic Link: der Umweg
übers Postfach bei jeder Anmeldung war lästiger als ein Passwort. Supabase speichert nur den
Hash, nie das Passwort selbst.

Nur Adressen aus der Tabelle `allowed_emails` können ein Konto anlegen — ein Trigger auf
`auth.users` bricht sonst ab. Geprüft: eine fremde Adresse wird abgewiesen, die
freigeschaltete kommt durch und bekommt ihr Profil. Zusammen mit Row Level Security
(13 von 13 Tabellen) bleibt die App auch unter öffentlicher URL dicht; der `anon key`
ist dafür ausgelegt, öffentlich zu sein.

Eine weitere Adresse freischalten:

```sql
insert into public.allowed_emails (email) values ('…') on conflict do nothing;
```

## Veröffentlichen

### GitHub Pages (eingerichtet)

`.github/workflows/pages.yml` baut bei jedem Push auf `main` oder den Arbeitsbranch
und veröffentlicht nach GitHub Pages. Einmalig nötig:

1. Repo auf **öffentlich** stellen (Pages ist bei privaten Repos kostenpflichtig)
2. *Settings → Pages → Source:* **GitHub Actions**
3. *Settings → Secrets and variables → Actions* → zwei Secrets anlegen:
   `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`
4. In Supabase unter *Authentication → URL Configuration* die Pages-Adresse als
   Site-URL und Redirect-URL eintragen — sonst führt der Magic Link ins Leere

Die Seite liegt danach unter `https://<konto>.github.io/Jarvis/`.

Der Unterpfad ist der Grund für `BASE_PATH` in `vite.config.ts`: GitHub Pages liefert
Projektseiten nicht unter `/` aus. Lokal bleibt es `/`, `npm run dev` ändert sich nicht.
`404.html` ist eine Kopie von `index.html` — ohne sie ergibt ein direkter Aufruf von
`/Jarvis/habits` einen 404, weil Pages keine Umleitungen kennt.

### Vercel (Alternative)

`vercel.json` liegt ebenfalls bereit. Repo mit dem Vercel-Konto verbinden, dieselben zwei
Variablen eintragen — dort entfällt der Unterpfad, die App liegt direkt auf `/`.

Ohne die Variablen läuft die App im lokalen Modus, ist also auch ohne Backend deploybar.

## Aufbau

```
src/styles/         tokens.css (Farben, Schrift, Radien) · hud.css · app.css
src/components/hud/ GlassTile, ArcHub, ArcGauge, Pill, DotRow, DotMap, Sparkline …
src/features/       briefing · habits · study (Timer als Kontext, läuft beim Wechsel weiter)
src/pages/          eine Datei je Modulansicht
src/lib/            data (Adapter) · cockpit (abgeleitete Werte) · date · store
supabase/migrations/
```

Alle Diagramme sind eigene SVG- und Canvas-Komponenten — bewusst keine Chart-Library.

## Warum kein `backdrop-filter`

Die Glasoptik kam ursprünglich von `backdrop-filter: blur()` auf jeder Kachel, Pille,
der Kopfzeile und der Navigation. Gemessen mit vierfach gedrosselter CPU kostete das
mehr als die Hälfte der Bildrate:

| | fps |
|---|---|
| mit `backdrop-filter` | 24,8 |
| ohne Ambient-Ebene | 34,5 |
| ohne Globus-Canvas | 27,7 |
| **ohne `backdrop-filter`** | **59,3** |

Sichtbar war er praktisch nicht — hinter den Kacheln liegt fast schwarzer Grund, da gibt
es nichts zu verwischen. Die Glasoptik trägt der Verlauf plus der Lichtschimmer an der
Oberkante. Falls jemand ihn wieder einbauen möchte: erst messen.

Der Globus zeichnet aus demselben Grund gebündelt (fünf Pfade nach Tiefenstufen statt
660 Einzelstriche), nutzt Halo-Kreise statt `shadowBlur` und malt nur etwa 30×/s —
die Drehung ist zu langsam, als dass man den Unterschied sähe.

## Schriften

Jura, DM Mono und Outfit liegen unter `public/fonts/` und stehen unter der
[SIL Open Font License](https://scripts.sil.org/OFL); die Lizenztexte liegen daneben.

## Bedienung

- **Reduzierte Bewegung** im Betriebssystem schaltet alle Animationen ab und zeigt sofort
  die Endwerte — unabhängig vom Ambient-Schalter.
- Ton ist standardmäßig aus und lässt sich in den Einstellungen zuschalten.
