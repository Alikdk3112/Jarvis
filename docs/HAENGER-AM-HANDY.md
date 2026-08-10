# Warum die App am Handy hing

Aufgezeichnet am 10.08.2026. Meldung war ein Satz: „die App hängt am handy."

## Kurz

Vier Fehler, von denen **einer** alles andere überdeckte. Vom Moment der
Anmeldung an feuerte die App rund **1750 Anfragen je Sekunde** gegen Supabase,
endlos, ohne dass der Nutzer etwas tat.

| Handlung | vorher | nachher |
|---|---|---|
| Anmelden bis das Cockpit steht | 21 283 Netzrunden, 62 s | 13 Netzrunden, 1,1 s |
| Ein Habit abhaken | 3 Runden (bei laufender Schleife 2341) | 1 Runde |
| Hintergrund und zurück | 2570 Runden | 0 Runden |
| Ganze Prüfsitzung | > 21 000 Runden | 20 Runden |
| Vorab in den Cache | 4110 KiB | 720 KiB |
| Schrift | 134 KB TTF, lud gar nicht | 39 KB WOFF2, lädt |

Gemessen in Chromium bei iPhone-Maßen (390×844 @3x), CPU 4× gedrosselt, gegen
einen Supabase-Attrappenserver mit 180 ms Latenz je Runde. Der Messstand zählt
Netzrunden, statt sie zu schätzen.

## Warum es niemand vorher gesehen hat

Alle bisherigen Messungen liefen am Rechner gegen die lokale IndexedDB. Der
schwerste Fehler steckte in `AuthGate` — und der kehrt im lokalen Modus in der
ersten Zeile zurück:

```ts
useEffect(() => {
  if (!supabase) return      // ← lokal ist hier Schluss
  …
```

Die Schleife existierte also ausschließlich im Supabase-Modus, und der läuft
nur im ausgelieferten Bau. Genau dort, wo niemand mitliest.

## Die vier Ursachen

### 1. Endlosschleife in der Anmeldeüberwachung (Blocker)

`useRefreshAll()` gab bei jedem Rendern eine **neue** Funktion zurück. Der
Effekt in `AuthGate` führte sie in seiner Abhängigkeitsliste, lief deshalb bei
jedem Rendern neu, hängte sich neu an `onAuthStateChange` — und Supabase
schickt beim Einhängen sofort die laufende Sitzung nach. `setSession` bekam ein
frisches Objekt, das nächste Rendern folgte, und mit ihm die nächste
Einhängung.

In jedem Umlauf feuerte `seedIfEmpty()` seine drei Abfragen. Das Muster im
Mitschnitt war unverkennbar: `habits, tasks, courses` — immer wieder, genau das
Tripel aus `isEmpty()`.

**Behoben durch:** stabile Identität über `useCallback`, leere
Abhängigkeitsliste, die Funktion über eine Referenz gelesen (damit der Riegel
auch hält, wenn an `store.ts` jemand das `useCallback` entfernt), und die
Erstbefüllung nur noch bei `event === 'SIGNED_IN'` mit Riegel auf die Kennung —
`INITIAL_SESSION` und `TOKEN_REFRESHED` sind keine Anmeldung.

### 2. Eine Netzrunde zum Auth-Server vor jedem Schreibvorgang

`currentUserId()` rief `auth.getUser()`. Das liest **nicht** aus dem Speicher,
sondern schickt jedes Mal `GET /auth/v1/user` (nachzulesen in auth-js,
`GoTrueClient._getUser`). Jedes Häkchen kostete damit eine zusätzliche Runde,
bevor überhaupt geschrieben wurde.

**Behoben durch:** `getSession()`. Liest aus dem Speicher, geht nur bei
abgelaufenem Token ans Netz.

### 3. Vollabfrage nach jedem Schreibvorgang

An jeder Mutation hing `onSettled: invalidate` und holte die ganze Sammlung
erneut — bei `habit_entries` über zweihundert Zeilen für ein Häkchen. Der
Gewinn war null: Diese App schreibt vollständige Datensätze, alle Felder
entstehen im Browser, die Datenbank rechnet nichts hinzu. Der optimistische
Stand *ist* die Wahrheit.

**Behoben durch:** Nachladen nur noch im Fehlerfall, wo der Zwischenspeicher
nachweislich falsch ist.

### 4. Startlast

- Der Service Worker legte **4,1 MB** vorab in den Cache, davon 3,2 MB die acht
  iOS-Startbilder. iOS holt sich daraus aber nur das eine, das zum Gerät passt,
  und liest es aus dem HTML — vorab geladen wurde also für sieben fremde
  Bildschirmgrößen gezahlt.
- Alle neun Ansichten lagen in einem Bündel von 652 KB. Jetzt kommt das Cockpit
  fest mit, die acht übrigen werden bei Bedarf geholt.
- **Die Schrift lud überhaupt nicht.** `url('/fonts/…')` ist absolut, und Vite
  schreibt das nicht auf `base` um. Ausgeliefert wird unter `/Jarvis/`, der Pfad
  zeigte also auf den Wurzelbereich der Domain: 404. Jede Zahl in der App lief
  in der Ersatzschrift des Systems. Die Datei liegt jetzt unter `src/`, wandert
  durch den Bau und bekommt die richtige Adresse — und als WOFF2 statt TTF
  nebenbei 39 statt 134 KB.

Dazu zwei kleinere Stellen: `isEmpty()` lud drei ganze Tabellen, um eine Summe
mit Null zu vergleichen (jetzt `hasAny()`, überträgt keine Zeile), und das
Löschen eines Kurses schrieb jede verwaiste Lerneinheit einzeln (jetzt in einem
Zug).

## Was nachgeprüft wurde

Alle neun Ansichten öffnen und rendern, jede nachgeladen ohne Fehler in der
Konsole. Angelegte Habits und Aufgaben überleben das Neuladen — das ist die
eigentliche Probe darauf, dass Punkt 3 keine Daten verliert. Häkchen überlebt
das Neuladen. Der Timer zählt weiter nach der Uhr. Cockpit bei laufendem Timer
und 4× gedrosselter CPU: 59 Bilder/s, schlimmste Bildlücke 100 ms.

LEDGER ist unangetastet: im ausgelieferten CSS genau ein `@keyframes`, kein
Verlauf, kein `backdrop-filter`, kein `text-shadow`, alle `box-shadow` sind
`inset`-Marken, keine Radien über 3px.

## Was offen bleibt

Das Stück `date-*.js` (357 KB roh, 101 KB gezippt) enthält neben dem
Supabase-Client auch **Dexie** und den **Realtime-Client**. Am Handy wird
beides nie benutzt: Dexie nicht, weil dort Supabase läuft, und Realtime nutzt
die App überhaupt nicht. Beides herauszulösen heißt, die Adapterwahl in
`src/lib/data/index.ts` statisch entscheidbar zu machen — `local.ts` legt beim
Laden eine Dexie-Datenbank an, ist also nicht von selbst wegoptimierbar. Das
ist ein eigener Umbau und gehörte nicht in diesen Fix.
