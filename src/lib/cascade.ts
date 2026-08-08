/* ══════════════════════════════════════════════════════════════════════
   Löschen mit Anhang.

   Drei Sammlungen hängen an einer anderen: Habit-Einträge am Habit,
   Trainingssätze an der Einheit, Lerneinheiten am Kurs. Der Datenvertrag
   kennt nur einzelne Sammlungen und weiß von diesen Beziehungen nichts —
   also müssen sie genau einmal irgendwo stehen. Hier.

   Die Datenbank kann das bereits: In 0001_schema.sql hängen habit_entries
   und workout_sets mit `on delete cascade` an ihrem Besitzer, study_sessions
   mit `on delete set null` am Kurs. Nur wusste die App nichts davon. Das
   hatte zwei Folgen — im lokalen Modus fehlen Fremdschlüssel ganz, dort
   blieben die Einträge dauerhaft liegen; und in beiden Modi zeigte die
   Oberfläche sie weiter an, bis die nächste Abfrage durch war.

   Sichtbar wurde das an der Serie: Sie zählt Tage, an denen mindestens die
   Hälfte der Habits erledigt war. Zählen die Einträge eines gelöschten
   Habits weiter mit, ist sie zu lang. Diese Datei sagt der App dasselbe,
   was das Schema der Datenbank sagt — an einer Stelle, für beide Adapter.
   ══════════════════════════════════════════════════════════════════════ */

import { useCallback } from 'react'
import { useCollection } from './store'
import type { ID } from './data/types'

/** Habit samt aller Einträge. */
export function useDeleteHabit(): (id: ID) => Promise<void> {
  const habits = useCollection('habits')
  const entries = useCollection('habitEntries')
  return useCallback(
    async (id) => {
      const mine = entries.items.filter((e) => e.habitId === id).map((e) => e.id)
      // Erst der Anhang: Bricht das ab, steht der Habit noch da und der
      // Versuch lässt sich wiederholen. Andersherum bliebe Datenmüll ohne
      // Besitzer zurück, den niemand mehr sieht.
      await entries.removeMany(mine)
      await habits.remove(id)
    },
    [habits, entries],
  )
}

/** Trainingseinheit samt aller Sätze. */
export function useDeleteWorkout(): (id: ID) => Promise<void> {
  const workouts = useCollection('workouts')
  const sets = useCollection('workoutSets')
  return useCallback(
    async (id) => {
      const mine = sets.items.filter((s) => s.workoutId === id).map((s) => s.id)
      await sets.removeMany(mine)
      await workouts.remove(id)
    },
    [workouts, sets],
  )
}

/** Kurs löschen — die Lerneinheiten bleiben, verlieren aber ihren Kurs.
 *  Gelernte Zeit ist gelernte Zeit; sie zu löschen, weil ein Kurs aus der
 *  Liste fliegt, würde die Wochensumme rückwirkend verfälschen. */
export function useDeleteCourse(): (id: ID) => Promise<void> {
  const courses = useCollection('courses')
  const sessions = useCollection('studySessions')
  return useCallback(
    async (id) => {
      const orphans = sessions.items.filter((s) => s.courseId === id)
      for (const s of orphans) await sessions.put({ ...s, courseId: null })
      await courses.remove(id)
    },
    [courses, sessions],
  )
}
