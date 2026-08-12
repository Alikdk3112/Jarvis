import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const here = import.meta.dirname

// GitHub Pages liefert Projektseiten unter /<Repo>/ aus. Der Workflow setzt
// BASE_PATH; lokal bleibt es '/', damit npm run dev unverändert läuft.
const base = process.env.BASE_PATH || '/'

/* Kennzeichen des Baus, damit am Gerät ablesbar ist, welche Fassung läuft.
   Das fehlte und hat einmal richtig Zeit gekostet: Ein Fix war gebaut,
   gepusht und beim Ausliefern gescheitert — am Telefon lief weiter die alte
   Fassung, und nichts in der App sagte das. Jetzt steht es in den
   Einstellungen und im Diagnosebericht.

   Im Workflow liefern GITHUB_SHA und der Zeitstempel die Werte; lokal steht
   „dev", damit man den Unterschied sieht. */
const build = {
  sha: (process.env.GITHUB_SHA || 'dev').slice(0, 7),
  at: process.env.BUILD_TIME || new Date().toISOString().slice(0, 16).replace('T', ' '),
}

export default defineConfig({
  base,
  define: {
    __BUILD_SHA__: JSON.stringify(build.sha),
    __BUILD_AT__: JSON.stringify(build.at),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      /* Die Anmeldung machen wir selbst, in src/lib/sw.ts.
         Das eingehängte Schnipsel ruft nur `register()` und lädt die Seite
         nicht neu, wenn ein neuer Worker übernimmt — gemessen brauchte eine
         neue Fassung damit DREI Öffnungen, bis sie zu sehen war. Ohne dieses
         `injectRegister: false` liefen beide Anmeldungen parallel. */
      injectRegister: false,
      // Die Schrift liegt unter src/ und wandert damit als gehashtes Asset
      // durch den Bau; globPatterns unten fängt sie. Der Lizenztext bleibt in
      // public/fonts/ liegen und muss mit ausgeliefert, aber nicht
      // zwischengespeichert werden.
      includeAssets: ['fonts/*.txt'],
      manifest: {
        name: 'JARVIS',
        short_name: 'JARVIS',
        description: 'Persönliches Cockpit — Habits, Aufgaben, Lernen, Ziele, Journal',
        id: base,
        lang: 'de',
        start_url: base,
        scope: base,
        display: 'standalone',
        // Der Grund von LEDGER, nicht mehr der der alten Glasfassung. Mit
        // #05070A blitzte beim Start kurz ein anderes Schwarz auf als das,
        // in dem die App danach steht.
        background_color: '#0B0B0C',
        theme_color: '#0B0B0C',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        /* Was vorab in den Cache geht, lädt das Telefon beim Installieren
           vollständig herunter — vor dem ersten Bild. Vorher waren das
           4,1 MB, und 3,2 MB davon waren die acht iOS-Startbilder.

           Die gehören dort nicht hin: iOS liest sie aus den
           `apple-touch-startup-image`-Angaben im HTML und holt jeweils nur
           das eine, das zum Gerät passt. Sie alle vorab zu laden heißt, für
           sieben fremde Bildschirmgrößen zu zahlen. Sie bleiben im Bau
           liegen und werden bei Bedarf geladen, nur eben nicht vorab.

           Ebenso die 512er-Kachel: die braucht das Betriebssystem beim
           Installieren, nicht die laufende App. */
        /* Beides ausdrücklich, nicht als Nebenwirkung.
           Das Plugin leitet diese zwei aus `registerType` UND daraus ab, ob es
           die Anmeldung selbst einhängt. Weil wir sie selbst machen (siehe
           injectRegister oben), stellte es den Worker auf „wartet auf Zuruf"
           um: `skipWaiting()` nur noch auf Nachricht, `clientsClaim()` gar
           nicht. Gemessene Folge — der neue Worker blieb in `waiting` stehen
           und übernahm überhaupt nie mehr.

           skipWaiting: der neue Worker ersetzt den alten sofort, statt bis zum
           Schliessen aller Seiten zu warten.
           clientsClaim: er übernimmt dabei auch die schon offene Seite. Erst
           dadurch feuert `controllerchange`, und erst daran hängt in
           src/lib/sw.ts das einmalige Neuladen. */
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,woff2,svg,webmanifest}'],
        globIgnores: ['**/splash-*.png', '**/icon-512.png'],
        // Größte Einzeldatei ist damit das JS-Bündel; 2 MB reichen mit Rand.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        // Tiefe Links laufen über die kopierte 404.html; ohne diese Angabe
        // beantwortet der Service Worker sie mit der Wurzel.
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(here, './src') },
  },
})
