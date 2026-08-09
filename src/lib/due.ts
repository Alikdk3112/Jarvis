/* Wie eine Fälligkeit beschriftet wird.

   Stand wortgleich in Cockpit.tsx als `dueLabel` und in Tasks.tsx als `due`.
   Zwei Kopien derselben Regeln heißt: Ändert man „ÜBERFÄLLIG" an einer
   Stelle, zeigt die andere weiter das Alte. */

import { daysBetween, shortDate, today, weekdayShort } from './date'
import type { Task } from './data/types'

export interface DueLabel {
  text: string
  /** Heute oder schon vorbei — wird rot hervorgehoben. */
  overdue: boolean
}

export function dueLabel(task: Task, todayKey = today()): DueLabel | null {
  if (!task.dueAt) return null
  const key = task.dueAt.slice(0, 10)
  const diff = daysBetween(todayKey, key)
  const time = task.dueAt.length > 10 ? task.dueAt.slice(11, 16) : ''
  if (diff < 0) return { text: `ÜBERFÄLLIG · ${shortDate(key)}`, overdue: true }
  if (diff === 0) return { text: time ? `HEUTE ${time}` : 'HEUTE', overdue: true }
  if (diff === 1) return { text: 'MORGEN', overdue: false }
  if (diff <= 6) return { text: weekdayShort(key), overdue: false }
  return { text: shortDate(key), overdue: false }
}
