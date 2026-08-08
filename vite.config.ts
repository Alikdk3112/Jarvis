import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const here = import.meta.dirname

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['fonts/*.ttf'],
      manifest: {
        name: 'JARVIS',
        short_name: 'JARVIS',
        description: 'Persönliches Cockpit — Habits, Aufgaben, Lernen, Ziele, Journal',
        lang: 'de',
        start_url: '/',
        display: 'standalone',
        background_color: '#05070A',
        theme_color: '#05070A',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Schriften sind groß, sollen aber offline verfügbar sein
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ttf,png,svg,webmanifest}'],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(here, './src') },
  },
})
