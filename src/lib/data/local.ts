/* ══════════════════════════════════════════════════════════════════════
   Lokaler Adapter — IndexedDB über Dexie.

   Speichert echt und überlebt das Neuladen, braucht aber kein Konto.
   Gegen diesen Adapter wird gebaut, solange kein Supabase-Projekt steht.
   ══════════════════════════════════════════════════════════════════════ */

import Dexie, { type Table } from 'dexie'
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

interface SettingsRow extends Settings {
  id: 'singleton'
}

class JarvisDB extends Dexie {
  habits!: Table<Habit, ID>
  habitEntries!: Table<HabitEntry, ID>
  tasks!: Table<Task, ID>
  notes!: Table<Note, ID>
  journal!: Table<JournalEntry, ID>
  courses!: Table<Course, ID>
  studySessions!: Table<StudySession, ID>
  goals!: Table<Goal, ID>
  workouts!: Table<Workout, ID>
  workoutSets!: Table<WorkoutSet, ID>
  settings!: Table<SettingsRow, string>

  constructor() {
    super('jarvis')
    this.version(1).stores({
      habits: 'id, sortOrder, archived',
      habitEntries: 'id, habitId, date, [habitId+date]',
      tasks: 'id, done, dueAt',
      notes: 'id, updatedAt',
      journal: 'id, &date',
      courses: 'id, examDate',
      studySessions: 'id, courseId, date',
      goals: 'id, status, targetDate',
      workouts: 'id, date',
      workoutSets: 'id, workoutId',
      settings: 'id',
    })
  }
}

const db = new JarvisDB()

function repo<T extends { id: ID }>(table: Table<T, ID>): Repo<T> {
  return {
    list: () => table.toArray(),
    async put(item) {
      await table.put(item)
      return item
    },
    async putMany(items) {
      if (items.length) await table.bulkPut(items)
    },
    async remove(id) {
      await table.delete(id)
    },
    async removeMany(ids) {
      if (ids.length) await table.bulkDelete(ids)
    },
  }
}

export const localAdapter: DataAdapter = {
  kind: 'local',
  habits: repo(db.habits),
  habitEntries: repo(db.habitEntries),
  tasks: repo(db.tasks),
  notes: repo(db.notes),
  journal: repo(db.journal),
  courses: repo(db.courses),
  studySessions: repo(db.studySessions),
  goals: repo(db.goals),
  workouts: repo(db.workouts),
  workoutSets: repo(db.workoutSets),

  async getSettings() {
    const row = await db.settings.get('singleton')
    // Fehlende Felder aus den Vorgaben ergänzen, damit spätere Zusätze
    // bestehende Installationen nicht mit undefined zurücklassen.
    return { ...DEFAULT_SETTINGS, ...(row ?? {}) }
  },

  async saveSettings(patch) {
    const current = await this.getSettings()
    const next = { ...current, ...patch }
    await db.settings.put({ ...next, id: 'singleton' })
    return next
  },

  async exportAll(): Promise<Backup> {
    const [
      habits,
      habitEntries,
      tasks,
      notes,
      journal,
      courses,
      studySessions,
      goals,
      workouts,
      workoutSets,
      settings,
    ] = await Promise.all([
      db.habits.toArray(),
      db.habitEntries.toArray(),
      db.tasks.toArray(),
      db.notes.toArray(),
      db.journal.toArray(),
      db.courses.toArray(),
      db.studySessions.toArray(),
      db.goals.toArray(),
      db.workouts.toArray(),
      db.workoutSets.toArray(),
      this.getSettings(),
    ])
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      habits,
      habitEntries,
      tasks,
      notes,
      journal,
      courses,
      studySessions,
      goals,
      workouts,
      workoutSets,
      settings,
    }
  },

  async importAll(backup) {
    await db.transaction(
      'rw',
      [
        db.habits,
        db.habitEntries,
        db.tasks,
        db.notes,
        db.journal,
        db.courses,
        db.studySessions,
        db.goals,
        db.workouts,
        db.workoutSets,
        db.settings,
      ],
      async () => {
        await Promise.all([
          db.habits.clear(),
          db.habitEntries.clear(),
          db.tasks.clear(),
          db.notes.clear(),
          db.journal.clear(),
          db.courses.clear(),
          db.studySessions.clear(),
          db.goals.clear(),
          db.workouts.clear(),
          db.workoutSets.clear(),
        ])
        await Promise.all([
          db.habits.bulkPut(backup.habits ?? []),
          db.habitEntries.bulkPut(backup.habitEntries ?? []),
          db.tasks.bulkPut(backup.tasks ?? []),
          db.notes.bulkPut(backup.notes ?? []),
          db.journal.bulkPut(backup.journal ?? []),
          db.courses.bulkPut(backup.courses ?? []),
          db.studySessions.bulkPut(backup.studySessions ?? []),
          db.goals.bulkPut(backup.goals ?? []),
          db.workouts.bulkPut(backup.workouts ?? []),
          db.workoutSets.bulkPut(backup.workoutSets ?? []),
        ])
        if (backup.settings) {
          await db.settings.put({ ...DEFAULT_SETTINGS, ...backup.settings, id: 'singleton' })
        }
      },
    )
  },
}

/** Ist die Datenbank noch komplett leer? Steuert die Erstbefüllung. */
export async function isEmpty(): Promise<boolean> {
  const [habits, tasks, courses] = await Promise.all([
    db.habits.count(),
    db.tasks.count(),
    db.courses.count(),
  ])
  return habits + tasks + courses === 0
}
