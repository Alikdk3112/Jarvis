/* ══════════════════════════════════════════════════════════════════════
   Zustandsschicht über dem Datenadapter.

   Eine Abfrage je Sammlung, Mutationen entwerten gezielt. Die Module
   sehen nur diese Hooks — nie den Adapter und schon gar keine Datenbank.
   ══════════════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { data } from './data'
import {
  DEFAULT_SETTINGS,
  type Course,
  type Goal,
  type Habit,
  type HabitEntry,
  type ID,
  type JournalEntry,
  type Note,
  type Repo,
  type Settings,
  type StudySession,
  type Task,
  type Workout,
  type WorkoutSet,
} from './data/types'

interface Collections {
  habits: Habit
  habitEntries: HabitEntry
  tasks: Task
  notes: Note
  journal: JournalEntry
  courses: Course
  studySessions: StudySession
  goals: Goal
  workouts: Workout
  workoutSets: WorkoutSet
}

export type CollectionKey = keyof Collections

const EMPTY: never[] = []

export function useCollection<K extends CollectionKey>(key: K) {
  const qc = useQueryClient()
  const repo = data[key] as unknown as Repo<Collections[K]>

  const query = useQuery({
    queryKey: [key],
    queryFn: () => repo.list(),
    staleTime: 30_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: [key] })

  const put = useMutation({
    mutationFn: (item: Collections[K]) => repo.put(item),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: ID) => repo.remove(id),
    onSuccess: invalidate,
  })

  return {
    items: (query.data ?? EMPTY) as Collections[K][],
    isLoading: query.isLoading,
    put: put.mutateAsync,
    remove: remove.mutateAsync,
  }
}

export function useSettings() {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['settings'],
    queryFn: () => data.getSettings(),
    staleTime: Infinity,
  })
  const save = useMutation({
    mutationFn: (patch: Partial<Settings>) => data.saveSettings(patch),
    onSuccess: (next) => qc.setQueryData(['settings'], next),
  })
  return {
    settings: query.data ?? DEFAULT_SETTINGS,
    isLoading: query.isLoading,
    save: save.mutateAsync,
  }
}

/** Alles neu laden — nach Import oder Anmeldung. */
export function useRefreshAll() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries()
}
