/* ══════════════════════════════════════════════════════════════════════
   Abgeleitete Werte fürs Cockpit.

   Hier — und nur hier — steht, wie sich der Tagesfortschritt zusammensetzt.
   Der Hub, die Legende und das Briefing lesen alle aus derselben Quelle,
   damit sie sich nie widersprechen können.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo } from 'react'
import { useCollection, useSettings } from './store'
import { addDays, daysBetween, lastDays, today, weekDays } from './date'
import type { Course, DateKey, Goal, Habit, HabitEntry, Task } from './data/types'

/** Gewichtung des Tagesziels. Summe muss 1 ergeben. */
export const WEIGHTS = { habits: 0.4, tasks: 0.3, study: 0.3 } as const

export interface CockpitData {
  todayKey: DateKey
  habits: Habit[]
  habitDoneToday: Set<string>
  habitsDone: number
  habitsTotal: number
  tasks: Task[]
  tasksOpen: number
  tasksTotal: number
  studySecondsToday: number
  studyGoalSeconds: number
  studySecondsWeek: number
  /** Serie: Tage in Folge, an denen mindestens die Hälfte der Habits stand. */
  streak: number
  bestStreak: number
  courses: Course[]
  nextExam: { course: Course; days: number } | null
  goals: Goal[]
  /** 0–1, für die drei Bögen im Hub. */
  fractions: { day: number; hab: number; stu: number; tsk: number }
  /** 20 Wochen à 7 Tage, Werte 0–4. */
  heatmap: number[]
  /** Lernminuten der letzten 14 Tage. */
  studyTrend: number[]
  isLoading: boolean
}

function entryKey(habitId: string, date: DateKey): string {
  return `${habitId}|${date}`
}

function computeStreaks(
  entries: HabitEntry[],
  todayKey: DateKey,
  habitCount: number,
): { streak: number; best: number } {
  // Ein Tag zählt, wenn mindestens die Hälfte der Habits erledigt wurde.
  // "Mindestens einer" wäre bei fünf Habits praktisch immer wahr und die
  // Serie damit keine Aussage mehr.
  const needed = Math.max(1, Math.ceil(habitCount / 2))
  const perDay = new Map<DateKey, number>()
  for (const e of entries) {
    if (e.done) perDay.set(e.date, (perDay.get(e.date) ?? 0) + 1)
  }
  const daysWithWork = new Set([...perDay].filter(([, n]) => n >= needed).map(([d]) => d))
  if (daysWithWork.size === 0) return { streak: 0, best: 0 }

  // Laufende Serie: ab heute rückwärts. Ein noch leerer heutiger Tag bricht
  // sie nicht ab — sonst stünde sie jeden Morgen auf null.
  let streak = 0
  let cursor = daysWithWork.has(todayKey) ? todayKey : addDays(todayKey, -1)
  while (daysWithWork.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }

  const sorted = [...daysWithWork].sort()
  let best = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    run = daysBetween(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return { streak, best: Math.max(best, streak) }
}

export function useCockpit(): CockpitData {
  const todayKey = today()
  const { settings } = useSettings()
  const habitsQ = useCollection('habits')
  const entriesQ = useCollection('habitEntries')
  const tasksQ = useCollection('tasks')
  const sessionsQ = useCollection('studySessions')
  const coursesQ = useCollection('courses')
  const goalsQ = useCollection('goals')

  const isLoading =
    habitsQ.isLoading || entriesQ.isLoading || tasksQ.isLoading || sessionsQ.isLoading

  return useMemo(() => {
    const habits = [...habitsQ.items]
      .filter((h) => !h.archived)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    const doneSet = new Set(
      entriesQ.items.filter((e) => e.done).map((e) => entryKey(e.habitId, e.date)),
    )
    const habitDoneToday = new Set(
      habits.filter((h) => doneSet.has(entryKey(h.id, todayKey))).map((h) => h.id),
    )

    const tasks = tasksQ.items
    const tasksTotal = tasks.length
    const tasksOpen = tasks.filter((t) => !t.done).length
    const tasksDoneFrac = tasksTotal ? (tasksTotal - tasksOpen) / tasksTotal : 0

    const studySecondsToday = sessionsQ.items
      .filter((s) => s.date === todayKey)
      .reduce((sum, s) => sum + s.seconds, 0)
    const week = new Set(weekDays(todayKey))
    const studySecondsWeek = sessionsQ.items
      .filter((s) => week.has(s.date))
      .reduce((sum, s) => sum + s.seconds, 0)
    const studyGoalSeconds = Math.max(1, settings.studyGoalMinutes * 60)

    const habFrac = habits.length ? habitDoneToday.size / habits.length : 0
    const stuFrac = Math.min(1, studySecondsToday / studyGoalSeconds)
    const dayFrac =
      WEIGHTS.habits * habFrac + WEIGHTS.tasks * tasksDoneFrac + WEIGHTS.study * stuFrac

    const { streak, best } = computeStreaks(entriesQ.items, todayKey, habits.length)

    // Heatmap: 20 Wochen, Wert 0–4 nach Anteil erledigter Habits am Tag
    const days = lastDays(140, todayKey)
    const heatmap = days.map((d) => {
      if (!habits.length) return 0
      const doneCount = habits.filter((h) => doneSet.has(entryKey(h.id, d))).length
      const ratio = doneCount / habits.length
      if (ratio === 0) return 0
      if (ratio <= 0.25) return 1
      if (ratio <= 0.5) return 2
      if (ratio <= 0.8) return 3
      return 4
    })

    const trendDays = lastDays(14, todayKey)
    const studyTrend = trendDays.map((d) =>
      Math.round(
        sessionsQ.items.filter((s) => s.date === d).reduce((sum, s) => sum + s.seconds, 0) / 60,
      ),
    )

    const upcoming = coursesQ.items
      .filter((c) => !c.passed && c.examDate)
      .map((c) => ({ course: c, days: daysBetween(todayKey, c.examDate as DateKey) }))
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days)

    return {
      todayKey,
      habits,
      habitDoneToday,
      habitsDone: habitDoneToday.size,
      habitsTotal: habits.length,
      tasks,
      tasksOpen,
      tasksTotal,
      studySecondsToday,
      studyGoalSeconds,
      studySecondsWeek,
      streak,
      bestStreak: best,
      courses: coursesQ.items,
      nextExam: upcoming[0] ?? null,
      goals: goalsQ.items.filter((g) => g.status === 'active'),
      fractions: { day: dayFrac, hab: habFrac, stu: stuFrac, tsk: tasksDoneFrac },
      heatmap,
      studyTrend,
      isLoading,
    }
  }, [
    habitsQ.items,
    entriesQ.items,
    tasksQ.items,
    sessionsQ.items,
    coursesQ.items,
    goalsQ.items,
    settings.studyGoalMinutes,
    todayKey,
    isLoading,
  ])
}
