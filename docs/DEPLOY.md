# Ausliefern

## Warum weg von GitHub Pages

GitHub Pages ist nicht langsam. Es hat aber drei Fallen, und in alle drei sind
wir getreten:

**1. Veröffentlichen darf nur der Standardbranch.** Die Umgebung
`github-pages` ist auf `main` beschränkt. Jeder Push auf einen Arbeitsbranch
baute brav durch und scheiterte dann im `deploy`-Schritt nach zwei Sekunden.
Sechs Wochen rote Läufe — und der Eindruck, es sei ausgeliefert. Ein Fix gegen
eine Endlosschleife lag so gebaut und unveröffentlicht herum, während am
Telefon der alte Stand lief.

**2. Unterpfad.** Ausgeliefert wurde unter `/Jarvis/`. Jede absolute Adresse im
Quelltext zeigt damit ins Leere, und Vite schreibt nicht alles um: `@font-face`
mit `url('/fonts/…')` ergab 404, Plex Mono lud nie, jede Zahl in der App lief
in der Ersatzschrift des Systems. Das fällt am Rechner nicht auf, weil dort
`base` gleich `/` ist.

**3. Keine Kontrolle über Cache-Header.** Pages schickt auf alles zehn Minuten
Cache, auch auf `index.html` und `sw.js`. Zusammen mit einem Service Worker
kann das ein Gerät auf einem alten Stand festnageln, ohne dass jemand
nachvollziehen kann, warum.

Cloudflare Pages nimmt allen drei Punkten die Grundlage: Wurzelpfad statt
Unterpfad, `_headers` und `_redirects` im Repo, und jeder Branch bekommt eine
eigene Vorschau-URL statt eines roten Kreuzes.

## Einrichten (einmalig, etwa fünf Minuten)

1. **dash.cloudflare.com** → *Workers & Pages* → *Create* → *Pages* →
   *Connect to Git* → Repository `Alikdk3112/Jarvis`.

2. **Bauen:**

   | Feld | Wert |
   |---|---|
   | Framework preset | `None` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Production branch | `main` |

   `BASE_PATH` wird **nicht** gesetzt. Genau das ist der Punkt: ohne die
   Variable baut Vite auf `/`, und die ganze Fehlerklasse aus Punkt 2 fällt weg.

3. **Umgebungsvariablen** (unter *Settings → Environment variables*, für
   *Production* **und** *Preview*):

   ```
   VITE_SUPABASE_URL       = https://otjaihkbxfinkpaghbvx.supabase.co  ← deine URL
   VITE_SUPABASE_ANON_KEY  = eyJ…                                     ← dein anon key
   ```

   Beide landen im gebauten JavaScript und sind damit öffentlich. Das ist beim
   anon key vorgesehen — was er darf, entscheidet Row Level Security in der
   Datenbank, nicht seine Geheimhaltung. Der `service_role`-Schlüssel gehört
   **nie** hierher.

4. **Supabase muss die neue Adresse kennen.** Supabase-Dashboard →
   *Authentication* → *URL Configuration*:
   - *Site URL* auf `https://<projekt>.pages.dev` setzen
   - unter *Redirect URLs* zusätzlich `https://<projekt>.pages.dev/**` und
     `https://*.<projekt>.pages.dev/**` eintragen (das zweite für die
     Branch-Vorschauen)

   Ohne das läuft „Passwort vergessen" und die Bestätigung nach der
   Registrierung ins Leere.

5. **Alte Adresse stilllegen.** Das ist kein Schönheitsschritt, sondern
   verhindert die nächste Verwechslung: Unter `/Jarvis/` liegt ein
   registrierter Service Worker, der die alte Fassung offline weiter ausliefert.
   Wer die alte Adresse öffnet, bekommt weiter die alte App — samt Endlosschleife.

   Sobald Cloudflare läuft: in `.github/workflows/pages.yml` den `deploy`-Job
   entfernen und statt `dist` ein Verzeichnis mit dieser einen Datei als
   `index.html` veröffentlichen:

   ```html
   <!doctype html>
   <meta charset="utf-8">
   <title>JARVIS ist umgezogen</title>
   <meta name="robots" content="noindex">
   <script>
     // Erst den alten Service Worker und seine Caches loswerden, dann
     // weiterleiten. Ohne das liefert er hier weiter die alte Fassung aus.
     (async () => {
       try {
         const regs = await navigator.serviceWorker?.getRegistrations() ?? []
         await Promise.all(regs.map((r) => r.unregister()))
         const keys = await caches?.keys() ?? []
         await Promise.all(keys.map((k) => caches.delete(k)))
       } catch {}
       location.replace('https://<projekt>.pages.dev/')
     })()
   </script>
   <p>JARVIS liegt jetzt unter
     <a href="https://<projekt>.pages.dev/"><projekt>.pages.dev</a>.</p>
   ```

6. **Symbol auf dem Startbildschirm neu anlegen.** Eine installierte PWA hängt
   an `scope` und `start_url`. Die wechseln von `/Jarvis/` auf `/`, das ist für
   iOS eine *andere* App. Das alte Symbol löschen, die neue Adresse in Safari
   öffnen, *Zum Home-Bildschirm*. Deine Daten liegen in Supabase und sind davon
   nicht betroffen.

## Was im Repo dafür liegt

| Datei | Zweck |
|---|---|
| `public/_redirects` | `/* /index.html 200` — echte SPA-Umleitung. Ersetzt die Krücke, `index.html` nach `404.html` zu kopieren. Status 200, nicht 301: die Adresse bleibt `/habits` stehen, statt auf `/` zu springen. |
| `public/_headers` | Gehashte Dateien ein Jahr unveränderlich, `index.html` und `sw.js` gar nicht. Das schließt die Stale-Build-Falle. |
| `.github/workflows/pages.yml` | Baut und prüft Typen auf **jedem** Branch, liefert nur von `main` aus. Der Bau bleibt als Nachweis, auch wenn Cloudflare das Ausliefern übernimmt. |

Beide Cloudflare-Dateien stören auf GitHub Pages nicht — sie werden dort
schlicht ignoriert. Solange beides parallel läuft, ist das unproblematisch;
Schritt 5 räumt es auf.

## Woran man erkennt, welcher Bau läuft

*Einstellungen → Profil* zeigt **Fassung** (kurze Commit-Kennung) und
**Gebaut** (Zeitpunkt). Dasselbe steht oben im Diagnosebericht unter
*Einstellungen → Diagnose → Kopieren*.

Das gab es nicht, und sein Fehlen hat die längste Fehlersuche dieses Projekts
verursacht: Am Telefon lief wochenlang ein alter Stand, und nichts in der App
sagte das. Wenn sich etwas seltsam verhält, ist das ab jetzt die erste Frage —
stimmt die Kennung mit dem letzten Commit auf `main` überein?

## Wenn die neue Fassung nicht ankommt

In dieser Reihenfolge:

1. *Einstellungen → Profil → Fassung* mit dem letzten Commit auf `main`
   vergleichen. Stimmt sie, ist das Problem nicht der Bau.
2. App vollständig schließen (nicht nur wegschieben) und neu öffnen. Der
   Service Worker übernimmt beim nächsten Start.
3. Hilft das nicht: Symbol vom Startbildschirm löschen, die Adresse in Safari
   öffnen, neu hinzufügen. Damit ist der Service Worker sicher weg.
4. In Safari zusätzlich *Einstellungen → Safari → Website-Daten* für die
   Adresse löschen.

## Was noch offen ist

Im Startbündel stecken **Dexie** und der **Realtime-Client**, zusammen gut
100 KB gezippt. Am Telefon wird beides nie benutzt: Dexie nicht, weil dort
Supabase läuft, und Realtime nutzt die App überhaupt nicht. Das herauszulösen
heißt, die Adapterwahl in `src/lib/data/index.ts` statisch entscheidbar zu
machen — `local.ts` legt beim Laden eine Dexie-Datenbank an und ist deshalb
nicht von selbst wegoptimierbar.

Ausserdem holt die App `habit_entries` bei jedem Start vollständig. Heute sind
das rund 220 Zeilen, es wachsen etwa 3,3 pro Tag. In einem Jahr sind es 1200,
und dann lohnt es, den Zeitraum einzugrenzen oder die Heatmap serverseitig
zusammenfassen zu lassen.
