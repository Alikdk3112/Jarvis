/* ══════════════════════════════════════════════════════════════════════
   Messung auf dem Gerät, auf dem es hakt.

   Alles, was bisher gemessen wurde, lief in Chromium auf einem Rechner mit
   lokaler Datenbank. Das Problem tritt aber auf einem iPhone auf, in Safari,
   mit Supabase über Mobilfunk. Solange dort nichts gemessen wird, ist jede
   Erklärung geraten.

   Aufgezeichnet wird nur, wenn es in den Einstellungen eingeschaltet ist:

   · Zeit vom Antippen bis das Bild der Zielseite steht
   · das längste Loch zwischen zwei Bildern in diesem Zeitraum
     (`longtask` gibt es in Safari nicht — Bildabstände schon)
   · was das Gerät über sich verrät

   Die Aufzeichnung überlebt einen Neustart, weil ein abgestürzter Tab genau
   der Fall ist, den man sehen will.
   ══════════════════════════════════════════════════════════════════════ */

const KEY = 'jarvis.diag'
const FLAG = 'jarvis.diag.on'
const KEEP = 40

export interface NavSample {
  /** Zielseite. */
  path: string
  /** Millisekunden vom Antippen bis zum ersten Bild der neuen Seite. */
  ms: number
  /** Längste Pause zwischen zwei Bildern in diesem Zeitraum. */
  gap: number
  /** Bilder pro Sekunde in den zwei Sekunden danach. */
  fps: number
  at: string
}

let samples: NavSample[] = load()

function load(): NavSample[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as NavSample[]) : []
  } catch {
    return []
  }
}

function persist(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(samples))
  } catch {
    // Voller Speicher: Die Messung ist es nicht wert, dass etwas kaputtgeht.
  }
}

export function diagEnabled(): boolean {
  try {
    return localStorage.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

export function setDiagEnabled(on: boolean): void {
  try {
    localStorage.setItem(FLAG, on ? '1' : '0')
  } catch {
    /* egal */
  }
  if (!on) clearSamples()
}

export function getSamples(): NavSample[] {
  return samples
}

export function clearSamples(): void {
  samples = []
  persist()
}

/* ── Laufende Messung ─────────────────────────────────────────────── */

let pending: { path: string; t0: number } | null = null
let sampling = false

/** Größte Lücke zwischen zwei Bildern messen, bis `stop()` gerufen wird. */
function watchFrames(): { stop: () => { gap: number; fps: number } } {
  let last = performance.now()
  const start = last
  let gap = 0
  let frames = 0
  let raf = 0
  const tick = (t: number) => {
    const d = t - last
    if (d > gap) gap = d
    last = t
    frames++
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return {
    stop: () => {
      cancelAnimationFrame(raf)
      const seconds = Math.max(0.001, (performance.now() - start) / 1000)
      return { gap: Math.round(gap), fps: Math.round(frames / seconds) }
    },
  }
}

/** Beim Antippen eines Navigationsziels aufrufen. */
export function markNavStart(path: string): void {
  if (!diagEnabled() || sampling) return
  pending = { path, t0: performance.now() }
}

/** Nach dem ersten Bild der neuen Seite aufrufen. */
export function markNavEnd(path: string): void {
  if (!diagEnabled()) return
  // Ohne vorheriges Antippen (Zurück-Geste, erster Aufruf) nichts messen.
  const p = pending
  pending = null
  if (!p || sampling) return

  const ms = Math.round(performance.now() - p.t0)
  sampling = true
  const watch = watchFrames()
  // Zwei Sekunden weiterschauen: Ein Wechsel, der sofort steht und danach
  // ruckelt, ist genauso ein Hänger wie einer, der lange braucht.
  window.setTimeout(() => {
    const { gap, fps } = watch.stop()
    sampling = false
    samples = [
      { path, ms, gap, fps, at: new Date().toISOString().slice(11, 19) },
      ...samples,
    ].slice(0, KEEP)
    persist()
  }, 2000)
}

/* ── Bericht ──────────────────────────────────────────────────────── */

interface Nav { deviceMemory?: number; hardwareConcurrency?: number; connection?: { effectiveType?: string } }

export function report(): string {
  const n = navigator as Navigator & Nav
  const lines: string[] = []
  lines.push('JARVIS Diagnose')
  lines.push(`Fassung: ${__BUILD_SHA__} · gebaut ${__BUILD_AT__}`)
  lines.push(`Gerät: ${n.userAgent}`)
  lines.push(
    `Kerne: ${n.hardwareConcurrency ?? '?'} · Speicher: ${n.deviceMemory ?? '?'} GB · Netz: ${n.connection?.effectiveType ?? '?'}`,
  )
  lines.push(
    `Bildschirm: ${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}` +
      ` · installiert: ${window.matchMedia('(display-mode: standalone)').matches ? 'ja' : 'nein'}`,
  )
  lines.push('')
  if (samples.length === 0) {
    lines.push('Noch keine Wechsel aufgezeichnet.')
    return lines.join('\n')
  }
  const ms = [...samples].map((s) => s.ms).sort((a, b) => a - b)
  const gaps = [...samples].map((s) => s.gap).sort((a, b) => a - b)
  lines.push(
    `${samples.length} Wechsel · Median ${ms[Math.floor(ms.length / 2)]} ms · schlechtester ${ms[ms.length - 1]} ms`,
  )
  lines.push(`Größte Bildlücke: Median ${gaps[Math.floor(gaps.length / 2)]} ms · schlechteste ${gaps[gaps.length - 1]} ms`)
  lines.push('')
  lines.push('Zeit  Ziel        sichtbar  Lücke   B/s')
  for (const s of samples) {
    lines.push(
      `${s.at}  ${s.path.padEnd(10)}  ${String(s.ms).padStart(6)}ms  ${String(s.gap).padStart(4)}ms  ${String(s.fps).padStart(3)}`,
    )
  }
  return lines.join('\n')
}
