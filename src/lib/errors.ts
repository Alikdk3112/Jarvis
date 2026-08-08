/* Ein Ort, an dem Fehler landen, die sonst niemand sähe.

   Schreibvorgänge liefen bisher über `void repo.put(...)` — schlug einer fehl,
   verschluckte das die Zusage und die Oberfläche blieb einfach stehen. Genau
   das fühlt sich wie ein Hänger an. */

type Listener = (message: string | null) => void

const listeners = new Set<Listener>()
let current: string | null = null

export function reportError(err: unknown): void {
  const raw = err instanceof Error ? err.message : String(err)
  const m = raw.toLowerCase()

  let message = raw
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed'))
    message = 'Keine Verbindung — die Änderung wurde nicht gespeichert.'
  else if (m.includes('jwt') || m.includes('not authenticated') || m.includes('nicht angemeldet'))
    message = 'Sitzung abgelaufen. Bitte neu anmelden.'
  else if (m.includes('row-level security') || m.includes('permission denied'))
    message = 'Keine Berechtigung für diese Änderung.'

  current = message
  for (const l of listeners) l(current)
}

export function clearError(): void {
  current = null
  for (const l of listeners) l(null)
}

export function subscribeError(l: Listener): () => void {
  listeners.add(l)
  l(current)
  return () => listeners.delete(l)
}
