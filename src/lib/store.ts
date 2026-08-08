/* ══════════════════════════════════════════════════════════════════════
   Zustandsschicht über dem Datenadapter.

   Eine Abfrage je Sammlung, Mutationen entwerten gezielt. Die Module
   sehen nur diese Hooks — nie den Adapter und schon gar keine Datenbank.
   ══════════════════════════════════════════════════════════════════════ */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { data } from './data'
import { reportError } from './errors'
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

  /* Änderungen greifen sofort im Zwischenspeicher und werden erst danach
     geschrieben. Vorher wartete die Oberfläche auf zwei Rundreisen — Schreiben
     und Neuladen — und stand bis dahin still; über Mobilfunk fühlt sich das
     wie ein Hänger an. Schlägt das Schreiben fehl, wird der alte Stand
     zurückgesetzt und der Fehler sichtbar gemacht, statt still zu verpuffen. */
  const put = useMutation({
    mutationFn: (item: Collections[K]) => repo.put(item),
    onMutate: async (item) => {
      await qc.cancelQueries({ queryKey: [key] })
      const prev = qc.getQueryData<Collections[K][]>([key]) ?? []
      const exists = prev.some((x) => x.id === item.id)
      qc.setQueryData<Collections[K][]>(
        [key],
        exists ? prev.map((x) => (x.id === item.id ? item : x)) : [...prev, item],
      )
      return { prev }
    },
    onError: (err, _item, ctx) => {
      if (ctx?.prev) qc.setQueryData([key], ctx.prev)
      reportError(err)
    },
    onSettled: invalidate,
  })

  const remove = useMutation({
    mutationFn: (id: ID) => repo.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [key] })
      const prev = qc.getQueryData<Collections[K][]>([key]) ?? []
      qc.setQueryData<Collections[K][]>([key], prev.filter((x) => x.id !== id))
      return { prev }
    },
    onError: (err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData([key], ctx.prev)
      reportError(err)
    },
    onSettled: invalidate,
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
    onMutate: async (patch) => {
      const prev = qc.getQueryData<Settings>(['settings'])
      if (prev) qc.setQueryData(['settings'], { ...prev, ...patch })
      return { prev }
    },
    onError: (err, _patch, ctx) => {
      if (ctx?.prev) qc.setQueryData(['settings'], ctx.prev)
      reportError(err)
    },
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
