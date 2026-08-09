/* Kurze Töne direkt per WebAudio erzeugt — keine Audiodateien im Repo.
   Standardmäßig aus, umschaltbar in den Einstellungen. */

import { useCallback } from 'react'

export type Cue = 'on' | 'off' | 'start' | 'stop' | 'reset' | 'done' | 'nav'

const CUES: Record<Cue, { freq: number; dur: number; vol?: number }> = {
  on: { freq: 980, dur: 0.06 },
  off: { freq: 520, dur: 0.06 },
  start: { freq: 780, dur: 0.07 },
  stop: { freq: 430, dur: 0.09 },
  reset: { freq: 340, dur: 0.08 },
  done: { freq: 1140, dur: 0.16, vol: 0.06 },
  nav: { freq: 700, dur: 0.05 },
}

/* Ein Kontext für die ganze App, nicht einer je Komponente.

   Vorher lag er in einem Ref — und `useSound` steckt in fünf Bausteinen
   gleichzeitig, vom Timer bis zu jeder Kachel mit Häkchen. Safari erlaubt
   nur eine Handvoll AudioContexts pro Seite und gibt sie erst frei, wenn
   sie geschlossen werden; geschlossen wurde hier keiner. Ab dem Limit
   warfen alle weiteren Anläufe, wurden verschluckt, und der Ton blieb
   dauerhaft weg. */
let shared: AudioContext | null = null

function context(): AudioContext | null {
  if (shared) return shared
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  // Erst beim ersten Ton anlegen: vorher blockiert ihn der Browser ohnehin.
  shared = Ctor ? new Ctor() : null
  return shared
}

export function useSound(enabled: boolean) {
  return useCallback(
    (cue: Cue) => {
      if (!enabled) return
      const { freq, dur, vol = 0.05 } = CUES[cue]
      try {
        const ac = context()
        if (!ac) return
        if (ac.state === 'suspended') void ac.resume()

        const osc = ac.createOscillator()
        const gain = ac.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, ac.currentTime)
        gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur)
        osc.connect(gain)
        gain.connect(ac.destination)
        osc.start()
        osc.stop(ac.currentTime + dur + 0.02)

        if (cue === 'done') {
          window.setTimeout(() => {
            const o2 = ac.createOscillator()
            const g2 = ac.createGain()
            o2.type = 'sine'
            o2.frequency.value = 1520
            g2.gain.setValueAtTime(0.0001, ac.currentTime)
            g2.gain.exponentialRampToValueAtTime(0.06, ac.currentTime + 0.01)
            g2.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.24)
            o2.connect(g2)
            g2.connect(ac.destination)
            o2.start()
            o2.stop(ac.currentTime + 0.26)
          }, 180)
        }
      } catch {
        // Audio ist Beiwerk — wenn der Browser blockt, passiert eben nichts.
      }
    },
    [enabled],
  )
}
