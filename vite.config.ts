import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const here = import.meta.dirname

// GitHub Pages liefert Projektseiten unter /<Repo>/ aus. Der Workflow setzt
// BASE_PATH; lokal bleibt es '/', damit npm run dev unverändert läuft.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
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
