/* ══════════════════════════════════════════════════════════════════════
   Den Service Worker anmelden — und dafür sorgen, dass eine neue Fassung
   auch ankommt.

   Das Standard-Schnipsel, das vite-plugin-pwa einhängt, macht nur eines:
   `navigator.serviceWorker.register('/sw.js')`. Das reicht nicht, und der
   Fehler ist gemessen, nicht vermutet.

   Gemessen wurde: alte Fassung öffnen, Dateien am Server gegen die neue
   tauschen, dann zählen, welches Bündel die Seite wirklich ausführt.

     1. Öffnen  → alt   (Service Worker richtet sich ein)
     2. Öffnen  → ALT   ← hier liegt das Problem
     3. Öffnen  → neu

   Warum das zweite Öffnen noch die alte Fassung zeigt: Der aktive Service
   Worker beantwortet den Aufruf aus seinem Vorrat, also mit der alten
   index.html und damit dem alten Bündel. Parallel holt der Browser die neue
   sw.js, installiert sie, und weil sie `skipWaiting` und `clientsClaim`
   enthält, übernimmt sie sofort die Kontrolle. Nur: die Seite läuft längst.
   Niemand lädt sie neu. Erst beim nächsten Öffnen liefert der neue Worker
   seinen neuen Vorrat aus.

   Auf einem Telefon, das man morgens einmal aufmacht, heißt das: die neue
   Fassung ist übermorgen da. Und wer zwischendurch nicht lange genug wartet,
   sieht sie nie — GitHub Pages schickt auf sw.js zehn Minuten Cache, dann
   wird nicht einmal nach einer neuen gefragt.

   Deshalb hier: wenn ein neuer Worker die Kontrolle übernimmt, wird genau
   einmal neu geladen. Aus drei Öffnungen wird eine plus ein Neuladen, das
   niemand bemerkt.
   ══════════════════════════════════════════════════════════════════════ */

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return

  /* Ob die Seite beim Start schon von einem Worker bedient wurde. Das
     entscheidet über Neuladen oder nicht:

     · Erstbesuch (kein Controller) — der Worker übernimmt kurz darauf zum
       ersten Mal. Neu laden wäre falsch: der Inhalt ist ja frisch vom Server.
     · Späterer Besuch (Controller vorhanden) — ein Wechsel bedeutet, dass ein
       NEUER Worker den alten ersetzt hat, während die Seite noch mit dem alten
       Bündel läuft. Genau dann muss neu geladen werden.

     Ohne diese Unterscheidung lädt der Erstbesuch grundlos neu, und bei einer
     kaputten Abfolge dreht sich das endlos. */
  const hatteController = Boolean(navigator.serviceWorker.controller)
  let neugeladen = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hatteController || neugeladen) return
    neugeladen = true
    window.location.reload()
  })

  const base = import.meta.env.BASE_URL
  void navigator.serviceWorker
    .register(`${base}sw.js`, { scope: base })
    .then((reg) => {
      /* Von selbst nachfragen. Der Browser prüft beim Aufruf, aber nicht
         zuverlässig, wenn eine installierte App tagelang offen im Speicher
         liegt und nur zwischen Vordergrund und Hintergrund wechselt — was am
         Telefon der Normalfall ist. */
      const nachsehen = () => void reg.update().catch(() => {})

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') nachsehen()
      })
      // Stündlich, falls die App tagelang im Vordergrund bleibt.
      window.setInterval(nachsehen, 60 * 60 * 1000)
    })
    .catch(() => {
      /* Kein Service Worker möglich — privater Modus, abgeschaltet, oder die
         Datei fehlt. Die App läuft dann ohne Offline-Vorrat weiter, und das
         ist kein Grund, hier etwas abzubrechen. */
    })
}
