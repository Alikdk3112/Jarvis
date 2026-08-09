/* Habit für einen Tag umschalten und nachsehen, ob er steht. Wird von der
   Cockpit-Kachel und von der Habits-Ansicht genutzt — die Logik gehört
   genau einmal hierher. */

import { useCallback, useMemo } from 'react'
import { useCollection, useSettings } from '../../lib/store'
import { useSound } from '../../hooks/useSound'
import { newId } from '../../lib/id'
import { today, weekDays } from '../../lib/date'
import type { DateKey, ID } from '../../lib/data/types'

const key = (habitId: ID, date: DateKey): string => `${habitId}|${date}`

export function useHabitToggle() {
  const entries = useCollection('habitEntries')
  const { settings } = useSettings()
  const beep = useSound(settings.sound)
  const items = entries.items
  const todayKey = today()

  /* Einmal nachschlagbar machen statt bei jeder Frage die ganze Liste zu
     durchsuchen. Die Habits-Ansicht fragt fünf Habits × sieben Tage ab —
     das waren bei einem Jahr Verlauf über fünfzigtausend Vergleiche pro
     Bild, für eine Tabelle mit fünfunddreißig Häkchen. */
  const doneSet = useMemo(() => {
    const s = new Set<string>()
    for (const e of items) if (e.done) s.add(key(e.habitId, e.date))
    return s
  }, [items])

  /* Wie oft ein Habit diese Woche stand. `e.done` wird ausdrücklich
     geprüft: Das Zurücknehmen löscht den Eintrag zwar, aber das ist eine
     Absprache, die nur ein paar Zeilen weiter unten steht — eine
     eingelesene Sicherung muss sich nicht daran halten. */
  const weekCounts = useMemo(() => {
    const days = new Set(weekDays(todayKey))
    const counts = new Map<ID, number>()
    for (const e of items) {
      if (!e.done || !days.has(e.date)) continue
      counts.set(e.habitId, (counts.get(e.habitId) ?? 0) + 1)
    }
    return counts
  }, [items, todayKey])

  const toggle = useCallback(
    async (habitId: ID, date: DateKey, next: boolean) => {
      const existing = items.find((e) => e.habitId === habitId && e.date === date)
      if (existing) {
        // Abgehakte Tage werden gelöscht statt auf done=false gesetzt —
        // sonst wächst die Tabelle mit Nullwerten voll.
        if (next) await entries.put({ ...existing, done: true })
        else await entries.remove(existing.id)
      } else if (next) {
        await entries.put({ id: newId(), habitId, date, done: true })
      }
      beep(next ? 'on' : 'off')
    },
    [items, entries, beep],
  )

  const isDone = useCallback((habitId: ID, date: DateKey) => doneSet.has(key(habitId, date)), [doneSet])

  const weekCount = useCallback((habitId: ID) => weekCounts.get(habitId) ?? 0, [weekCounts])

  return { toggle, isDone, weekCount, entries: items }
}
