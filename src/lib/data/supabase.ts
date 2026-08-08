/* ══════════════════════════════════════════════════════════════════════
   Supabase-Adapter — dieselbe Schnittstelle wie der lokale Adapter.

   Noch nicht aktiv: greift erst, wenn VITE_SUPABASE_URL gesetzt ist.
   Das Schema dazu liegt fertig unter supabase/migrations/.

   Row Level Security filtert serverseitig auf auth.uid(); `user_id` wird
   beim Schreiben trotzdem mitgeschickt, weil die Spalte NOT NULL ist.
   ══════════════════════════════════════════════════════════════════════ */

import {
  DEFAULT_SETTINGS,
  type Backup,
  type Course,
  type DataAdapter,
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
} from './types'
import { requireSupabase } from '../supabaseClient'

type Row = Record<string, unknown>

async function currentUserId(): Promise<string> {
  const { data, error } = await requireSupabase().auth.getUser()
  if (error || !data.user) throw new Error('Nicht angemeldet.')
  return data.user.id
}

/** camelCase → snake_case und zurück. Die Spaltennamen folgen exakt dieser
 *  Regel, deshalb reicht eine mechanische Umwandlung ohne Mapping-Tabelle. */
const toSnake = (s: string): string => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
const toCamel = (s: string): string => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())

function rowToModel<T>(row: Row): T {
  const out: Row = {}
  for (const [k, v] of Object.entries(row)) {
    if (k === 'user_id') continue
    out[toCamel(k)] = v
  }
  return out as T
}

function modelToRow<T extends object>(item: T, userId: string): Row {
  const out: Row = { user_id: userId }
  for (const [k, v] of Object.entries(item)) out[toSnake(k)] = v
  return out
}

function repo<T extends { id: ID }>(table: string, orderBy?: string): Repo<T> {
  return {
    async list() {
      const q = requireSupabase().from(table).select('*')
      const { data, error } = orderBy ? await q.order(orderBy) : await q
      if (error) throw error
      return (data ?? []).map((r) => rowToModel<T>(r as Row))
    },
    async put(item) {
      const userId = await currentUserId()
      const { error } = await requireSupabase()
        .from(table)
        .upsert(modelToRow(item, userId), { onConflict: 'id' })
      if (error) throw error
      return item
    },
    async putMany(items) {
      if (!items.length) return
      const userId = await currentUserId()
      // In Blöcken, damit eine einzelne Anfrage nicht zu groß wird.
      for (let i = 0; i < items.length; i += 500) {
        const { error } = await requireSupabase()
          .from(table)
          .upsert(items.slice(i, i + 500).map((x) => modelToRow(x, userId)), { onConflict: 'id' })
        if (error) throw error
      }
    },
    async remove(id) {
      const { error } = await requireSupabase().from(table).delete().eq('id', id)
      if (error) throw error
    },
  }
}

export const supabaseAdapter: DataAdapter = {
  kind: 'supabase',
  habits: repo<Habit>('habits', 'sort_order'),
  habitEntries: repo<HabitEntry>('habit_entries', 'date'),
  tasks: repo<Task>('tasks', 'created_at'),
  notes: repo<Note>('notes', 'updated_at'),
  journal: repo<JournalEntry>('journal_entries', 'date'),
  courses: repo<Course>('courses', 'created_at'),
  studySessions: repo<StudySession>('study_sessions', 'date'),
  goals: repo<Goal>('goals', 'created_at'),
  workouts: repo<Workout>('workouts', 'date'),
  workoutSets: repo<WorkoutSet>('workout_sets', 'sort_order'),

  async getSettings() {
    const userId = await currentUserId()
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('settings, display_name')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    const stored = (data?.settings ?? {}) as Partial<Settings>
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      displayName: (data?.display_name as string) || DEFAULT_SETTINGS.displayName,
    }
  },

  async saveSettings(patch) {
    const userId = await currentUserId()
    const next = { ...(await this.getSettings()), ...patch }
    const { error } = await requireSupabase()
      .from('profiles')
      .upsert({ id: userId, display_name: next.displayName, settings: next }, { onConflict: 'id' })
    if (error) throw error
    return next
  },

  async exportAll(): Promise<Backup> {
    const [
      habits, habitEntries, tasks, notes, journal,
      courses, studySessions, goals, workouts, workoutSets, settings,
    ] = await Promise.all([
      this.habits.list(), this.habitEntries.list(), this.tasks.list(),
      this.notes.list(), this.journal.list(), this.courses.list(),
      this.studySessions.list(), this.goals.list(), this.workouts.list(),
      this.workoutSets.list(), this.getSettings(),
    ])
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits, habitEntries, tasks, notes, journal,
      courses, studySessions, goals, workouts, workoutSets, settings,
    }
  },

  async importAll(backup) {
    const userId = await currentUserId()
    const sb = requireSupabase()
    // Reihenfolge beachten: abhängige Tabellen zuerst, sonst greifen die
    // Fremdschlüssel ins Leere.
    const plan: Array<[string, Array<{ id: ID }>]> = [
      ['habits', backup.habits ?? []],
      ['habit_entries', backup.habitEntries ?? []],
      ['tasks', backup.tasks ?? []],
      ['notes', backup.notes ?? []],
      ['journal_entries', backup.journal ?? []],
      ['courses', backup.courses ?? []],
      ['study_sessions', backup.studySessions ?? []],
      ['goals', backup.goals ?? []],
      ['workouts', backup.workouts ?? []],
      ['workout_sets', backup.workoutSets ?? []],
    ]
    for (const [table, items] of plan) {
      if (!items.length) continue
      const { error } = await sb
        .from(table)
        .upsert(items.map((i) => modelToRow(i, userId)), { onConflict: 'id' })
      if (error) throw error
    }
    if (backup.settings) await this.saveSettings(backup.settings)
  },
}
