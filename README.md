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

**Zurzeit lokal.** Die Daten liegen ausschließlich in dem Browser, in dem du sie erfasst hast.
Lade unter *Einstellungen → Daten* regelmäßig eine Sicherung herunter — dieselbe Datei ist
zugleich der Umzugskoffer nach Supabase.

### Auf Supabase umstellen

1. Supabase-Projekt anlegen
2. `supabase/migrations/0001_schema.sql` im SQL-Editor ausführen
   (legt Tabellen, Row Level Security und die Zugangsbeschränkung an)
3. `.env.local` anlegen:
   ```
   VITE_SUPABASE_URL=…
   VITE_SUPABASE_ANON_KEY=…
   ```
4. Neu starten, anmelden, unter *Einstellungen → Daten* die Sicherung einlesen

Nur Adressen aus der Tabelle `allowed_emails` können ein Konto anlegen — ein Trigger auf
`auth.users` bricht sonst ab. Zusammen mit Row Level Security bleibt die App auch unter
öffentlicher URL dicht; der `anon key` ist dafür ausgelegt, öffentlich zu sein.

## Veröffentlichen

`vercel.json` liegt bereit. Repo einmal mit dem Vercel-Konto verbinden, die beiden
Umgebungsvariablen dort eintragen — fertig. Ohne sie läuft die App im lokalen Modus,
ist also auch ohne Backend sofort deploybar.

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

## Schriften

Jura, DM Mono und Outfit liegen unter `public/fonts/` und stehen unter der
[SIL Open Font License](https://scripts.sil.org/OFL); die Lizenztexte liegen daneben.

## Bedienung

- **Reduzierte Bewegung** im Betriebssystem schaltet alle Animationen ab und zeigt sofort
  die Endwerte — unabhängig vom Ambient-Schalter.
- Ton ist standardmäßig aus und lässt sich in den Einstellungen zuschalten.
