/* ══════════════════════════════════════════════════════════════════════
   Zustandsschicht über dem Datenadapter.

   Eine Abfrage je Sammlung, Mutationen entwerten gezielt. Die Module
   sehen nur diese Hooks — nie den Adapter und schon gar keine Datenbank.
   ══════════════════════════════════════════════════════════════════════ */

import { useCallback } from 'react'
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

  /* Fünf Minuten statt dreißig Sekunden: Geändert wird nur in dieser App,
     und jede Änderung entwertet ihre Sammlung ohnehin gezielt. Mit dem
     kurzen Wert stieß jeder Seitenwechsel nach kurzer Pause bis zu sechs
     vollständige Abfragen an — gemessen — ohne dass sich je etwas
     unterschied. Frisch wird stattdessen beim Zurückkehren zur App
     geladen, siehe main.tsx. */
  const query = useQuery({
    queryKey: [key],
    queryFn: () => repo.list(),
    staleTime: 5 * 60_000,
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: [key] })

  /* Änderungen greifen sofort im Zwischenspeicher und werden erst danach
     geschrieben. Vorher wartete die Oberfläche auf zwei Rundreisen — Schreiben
     und Neuladen — und stand bis dahin still; über Mobilfunk fühlt sich das
     wie ein Hänger an. Schlägt das Schreiben fehl, wird der alte Stand
     zurückgesetzt und der Fehler sichtbar gemacht, statt still zu verpuffen.

     Nach GELUNGENEM Schreiben wird nicht mehr nachgeladen. Vorher hing an
     jeder Mutation ein `onSettled: invalidate`, das die ganze Sammlung erneut
     holte — bei habit_entries über zweihundert Zeilen für ein einziges
     Häkchen, und das über Mobilfunk. Der Gewinn war null: Diese App schreibt
     vollständige Datensätze, die Kennung, die Zeitstempel und alle Felder
     entstehen im Browser. Die Datenbank rechnet nichts hinzu, es gibt keine
     Standardwerte und keine Trigger auf diesen Tabellen. Was optimistisch im
     Zwischenspeicher steht, ist deshalb genau das, was auch zurückkäme.

     Im Fehlerfall bleibt es beim Nachladen: dort ist der Zwischenspeicher
     nachweislich falsch, und der Server hat das letzte Wort. */
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
      invalidate()
    },
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
      invalidate()
    },
  })

  const removeMany = useMutation({
    mutationFn: (ids: ID[]) => repo.removeMany(ids),
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: [key] })
      const prev = qc.getQueryData<Collections[K][]>([key]) ?? []
      const gone = new Set(ids)
      qc.setQueryData<Collections[K][]>([key], prev.filter((x) => !gone.has(x.id)))
      return { prev }
    },
    onError: (err, _ids, ctx) => {
      if (ctx?.prev) qc.setQueryData([key], ctx.prev)
      reportError(err)
      invalidate()
    },
  })

  /* Viele Zeilen in einem Zug. Ohne das blieb nur eine Schleife über `put`,
     und die kostet eine Netzrunde je Datensatz: Ein Kurs mit neunzig
     Lerneinheiten hieß neunzig Anfragen hintereinander, bevor der Kurs
     überhaupt verschwand. */
  const putMany = useMutation({
    mutationFn: (items: Collections[K][]) => repo.putMany(items),
    onMutate: async (items) => {
      await qc.cancelQueries({ queryKey: [key] })
      const prev = qc.getQueryData<Collections[K][]>([key]) ?? []
      const next = new Map(items.map((x) => [x.id, x]))
      qc.setQueryData<Collections[K][]>([key], [
        ...prev.map((x) => next.get(x.id) ?? x),
        ...items.filter((x) => !prev.some((p) => p.id === x.id)),
      ])
      return { prev }
    },
    onError: (err, _items, ctx) => {
      if (ctx?.prev) qc.setQueryData([key], ctx.prev)
      reportError(err)
      invalidate()
    },
  })

  return {
    items: (query.data ?? EMPTY) as Collections[K][],
    isLoading: query.isLoading,
    put: put.mutateAsync,
    putMany: putMany.mutateAsync,
    remove: remove.mutateAsync,
    removeMany: removeMany.mutateAsync,
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

/** Alles neu laden — nach Import oder Erstbefüllung.
 *
 *  useCallback ist hier nicht Kosmetik, sondern die Absicherung gegen einen
 *  Rückfall: Ohne stabile Identität war das eine neue Funktion bei jedem
 *  Rendern. AuthGate führte sie in der Abhängigkeitsliste seines Effekts, der
 *  sich damit bei jedem Rendern neu an onAuthStateChange hängte — und weil
 *  Supabase beim Einhängen sofort die laufende Sitzung nachschickt, löste das
 *  das nächste Rendern aus. Gemessen wurden rund 1750 Anfragen je Sekunde,
 *  endlos, ohne Zutun des Nutzers. Im lokalen Modus war davon nichts zu
 *  sehen, weil der Effekt dort in der ersten Zeile zurückkehrt — deshalb fiel
 *  es in der Entwicklung nie auf und erst am Telefon. */
export function useRefreshAll(): () => void {
  const qc = useQueryClient()
  return useCallback(() => {
    void qc.invalidateQueries()
  }, [qc])
}
