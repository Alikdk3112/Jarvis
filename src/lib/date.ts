/* Datums-Helfer. Alle Tagesschlüssel sind lokale Kalendertage (`YYYY-MM-DD`),
   niemals UTC — sonst kippt ein Habit-Haken abends über die Datumsgrenze. */

import type { DateKey } from './data/types'

const WEEKDAYS = ['SONNTAG', 'MONTAG', 'DIENSTAG', 'MITTWOCH', 'DONNERSTAG', 'FREITAG', 'SAMSTAG']
const WEEKDAYS_SHORT = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA']
const MONTHS = [
  'JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI',
  'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER',
]

export const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n))

export function toKey(d: Date = new Date()): DateKey {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export const today = (): DateKey => toKey()

export function addDays(key: DateKey, days: number): DateKey {
  const d = fromKey(key)
  d.setDate(d.getDate() + days)
  return toKey(d)
}

/** Tage zwischen zwei Kalendertagen, Vorzeichen behaftet (b − a). */
export function daysBetween(a: DateKey, b: DateKey): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime()
  return Math.round(ms / 86_400_000)
}

/** Montag der Woche, in der `key` liegt. */
export function startOfWeek(key: DateKey = today()): DateKey {
  const d = fromKey(key)
  const shift = (d.getDay() + 6) % 7 // Montag = 0
  d.setDate(d.getDate() - shift)
  return toKey(d)
}

/** Die sieben Tage der Woche von Montag bis Sonntag. */
export function weekDays(key: DateKey = today()): DateKey[] {
  const monday = startOfWeek(key)
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/** Die letzten `n` Tage, ältester zuerst, `key` als letzter. */
export function lastDays(n: number, key: DateKey = today()): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(key, i - n + 1))
}

export const weekdayLong = (key: DateKey): string => WEEKDAYS[fromKey(key).getDay()]
export const weekdayShort = (key: DateKey): string => WEEKDAYS_SHORT[fromKey(key).getDay()]

/** `08. AUGUST 2026` */
export function longDate(key: DateKey): string {
  const d = fromKey(key)
  return `${pad2(d.getDate())}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/** `08.08.` */
export function shortDate(key: DateKey): string {
  const d = fromKey(key)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.`
}

/** Sekunden als `MM:SS`, ab einer Stunde als `H:MM:SS`. */
export function clockFromSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h > 0 ? `${h}:${pad2(m)}:${pad2(sec)}` : `${pad2(m)}:${pad2(sec)}`
}

/** Sekunden als `4 h 10` bzw. `36 min` — für Kennzahlen, nicht für Timer. */
export function humanDuration(totalSeconds: number): string {
  const min = Math.round(totalSeconds / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${pad2(min % 60)}`
}

/** Deutsches Datumsformat für `<input type="date">` und zurück. */
export const toInputDate = (key: DateKey | null): string => key ?? ''
export const fromInputDate = (value: string): DateKey | null => (value ? value : null)
