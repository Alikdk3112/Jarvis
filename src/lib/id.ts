/** Neue ID. `crypto.randomUUID` ist überall verfügbar, wo diese App läuft;
 *  der Rückfall greift nur in unsicheren Kontexten (http auf fremdem Host). */
export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
