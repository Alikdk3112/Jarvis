/* Farbklima setzen.

   Zwei vollwertige Themen, dunkel ist Vorbelegung. „system" entfernt das
   Attribut wieder, damit `prefers-color-scheme` greift — deshalb muss
   jede Farbe in tokens.css in beiden Zweigen definiert sein und keine
   nur im Media-Block leben.

   Beim Umschalten wird für genau ein Bild jede Überblendung abgeschaltet.
   Ohne das laufen zwanzig Farbübergänge gleichzeitig über die Seite, und
   die 140 Heatmap-Zellen wären zwanzig davon. */

import type { Theme } from './data/types'

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.add('no-anim')
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  requestAnimationFrame(() => root.classList.remove('no-anim'))
}
