/* ══════════════════════════════════════════════════════════════════════
   Der Datenvertrag.

   Die Module kennen ausschließlich diese Typen und das Adapter-Interface,
   niemals eine Datenbank. Dadurch ist der Umstieg von lokaler Speicherung
   auf Supabase eine einzige ausgetauschte Datei.
   ══════════════════════════════════════════════════════════════════════ */

export type ID = string
/** Kalendertag als `YYYY-MM-DD` in lokaler Zeit — nie ein UTC-Zeitstempel. */
export type DateKey = string
/** ISO-8601-Zeitstempel. */
export type Timestamp = string

export type ModuleColor = 'accent' | 'habits' | 'study' | 'journal' | 'sport' | 'goals'

export interface Habit {
  id: ID
  name: string
  color: ModuleColor
  /** Wie oft pro Woche angestrebt — Grundlage der Wochenquote. */
  targetPerWeek: number
  sortOrder: number
  archived: boolean
  createdAt: Timestamp
}

export interface HabitEntry {
  id: ID
  habitId: ID
  date: DateKey
  done: boolean
}

export type TaskTag = 'uni' | 'sport' | 'jarvis' | 'privat' | null

/** Jeder Bereich bekommt seine Signalfarbe — sonst sagt der Chip nichts aus. */
export const TAG_COLOR: Record<NonNullable<TaskTag>, ModuleColor> = {
  uni: 'study',
  sport: 'sport',
  jarvis: 'accent',
  privat: 'journal',
}

export interface Task {
  id: ID
  title: string
  notes: string | null
  dueAt: Timestamp | null
  tag: TaskTag
  done: boolean
  doneAt: Timestamp | null
  createdAt: Timestamp
}

export interface Note {
  id: ID
  title: string
  body: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface JournalEntry {
  id: ID
  /** Genau ein Eintrag pro Tag. */
  date: DateKey
  body: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Course {
  id: ID
  name: string
  ects: number
  semester: string | null
  examDate: DateKey | null
  /** Deutsche Notenskala 1,0–5,0. `null`, solange nicht abgeschlossen. */
  grade: number | null
  passed: boolean
  createdAt: Timestamp
}

export interface StudySession {
  id: ID
  courseId: ID | null
  date: DateKey
  startedAt: Timestamp
  seconds: number
  note: string | null
}

export type GoalStatus = 'active' | 'done' | 'dropped'

export interface Goal {
  id: ID
  title: string
  description: string | null
  targetDate: DateKey | null
  /** 0–100. */
  progress: number
  status: GoalStatus
  createdAt: Timestamp
}

export interface Workout {
  id: ID
  date: DateKey
  type: string
  minutes: number
  note: string | null
  createdAt: Timestamp
}

export interface WorkoutSet {
  id: ID
  workoutId: ID
  exercise: string
  reps: number
  weight: number
  sortOrder: number
}

export interface Settings {
  ambient: boolean
  sound: boolean
  /** Tagesziel Lernzeit in Minuten — speist den violetten Bogen im Hub. */
  studyGoalMinutes: number
  /** Länge eines Timer-Blocks in Minuten. */
  focusBlockMinutes: number
  displayName: string
}

export const DEFAULT_SETTINGS: Settings = {
  ambient: true,
  sound: false,
  studyGoalMinutes: 90,
  focusBlockMinutes: 25,
  displayName: 'Ali',
}

/** Einheitliche Sammlung — `put` legt an oder aktualisiert. */
export interface Repo<T extends { id: ID }> {
  list(): Promise<T[]>
  put(item: T): Promise<T>
  /** Viele Zeilen auf einmal. Einzeln geschrieben wären das ebenso viele
   *  Netzanfragen — die Erstbefüllung allein bräuchte so Minuten. */
  putMany(items: T[]): Promise<void>
  remove(id: ID): Promise<void>
  /** Viele Zeilen auf einmal löschen. Nötig für abhängige Datensätze: Wer
   *  einen Habit mit einem Jahr Verlauf löscht, würde sonst dreihundert
   *  einzelne Anfragen auslösen. */
  removeMany(ids: ID[]): Promise<void>
}

export interface Backup {
  version: 1
  exportedAt: Timestamp
  habits: Habit[]
  habitEntries: HabitEntry[]
  tasks: Task[]
  notes: Note[]
  journal: JournalEntry[]
  courses: Course[]
  studySessions: StudySession[]
  goals: Goal[]
  workouts: Workout[]
  workoutSets: WorkoutSet[]
  settings: Settings
}

export interface DataAdapter {
  /** Wie gespeichert wird — die Einstellungsseite zeigt das an. */
  readonly kind: 'local' | 'supabase'
  habits: Repo<Habit>
  habitEntries: Repo<HabitEntry>
  tasks: Repo<Task>
  notes: Repo<Note>
  journal: Repo<JournalEntry>
  courses: Repo<Course>
  studySessions: Repo<StudySession>
  goals: Repo<Goal>
  workouts: Repo<Workout>
  workoutSets: Repo<WorkoutSet>
  getSettings(): Promise<Settings>
  saveSettings(patch: Partial<Settings>): Promise<Settings>
  exportAll(): Promise<Backup>
  importAll(backup: Backup): Promise<void>
}
