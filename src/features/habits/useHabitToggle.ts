/* Habit für einen Tag umschalten. Wird von der Cockpit-Kachel und von der
   Habits-Ansicht genutzt — die Logik gehört genau einmal hierher. */

import { useCallback } from 'react'
import { useCollection, useSettings } from '../../lib/store'
import { useSound } from '../../hooks/useSound'
import { newId } from '../../lib/id'
import type { DateKey, ID } from '../../lib/data/types'

export function useHabitToggle() {
  const entries = useCollection('habitEntries')
  const { settings } = useSettings()
  const beep = useSound(settings.sound)

  const toggle = useCallback(
    async (habitId: ID, date: DateKey, next: boolean) => {
      const existing = entries.items.find((e) => e.habitId === habitId && e.date === date)
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
    [entries, beep],
  )

  const isDone = useCallback(
    (habitId: ID, date: DateKey) =>
      entries.items.some((e) => e.habitId === habitId && e.date === date && e.done),
    [entries.items],
  )

  return { toggle, isDone, entries: entries.items }
}
