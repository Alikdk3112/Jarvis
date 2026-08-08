/* Erstbefüllung.

   Läuft genau einmal, wenn die Datenbank noch leer ist. Ohne sie stünde beim
   ersten Öffnen ein leeres Cockpit da — mit Nullen in allen Bögen. Die Inhalte
   entsprechen dem freigegebenen Entwurf, damit die App direkt so aussieht wie
   die Vorschau. Alles davon lässt sich in den Modulen ändern oder löschen. */

import { data } from './data'
import type { Habit, Task, Course, Goal, Workout, JournalEntry, StudySession } from './data/types'
import { addDays, today, toKey } from './date'
import { newId } from './id'

const now = () => new Date().toISOString()

/** Ist noch gar nichts da? Fragt den aktiven Adapter, nicht die Datenbank —
 *  damit dieselbe Prüfung lokal wie in Supabase funktioniert. */
async function isEmpty(): Promise<boolean> {
  const [habits, tasks, courses] = await Promise.all([
    data.habits.list(),
    data.tasks.list(),
    data.courses.list(),
  ])
  return habits.length + tasks.length + courses.length === 0
}

export async function seedIfEmpty(): Promise<void> {
  if (!(await isEmpty())) return

  const t = today()

  const habits: Habit[] = [
    { id: newId(), name: 'Sport', color: 'habits', targetPerWeek: 4, sortOrder: 0, archived: false, createdAt: now() },
    { id: newId(), name: 'Wasser 2 L', color: 'habits', targetPerWeek: 7, sortOrder: 1, archived: false, createdAt: now() },
    { id: newId(), name: 'Lesen 20 min', color: 'habits', targetPerWeek: 5, sortOrder: 2, archived: false, createdAt: now() },
    { id: newId(), name: 'Kein Handy vor 9', color: 'habits', targetPerWeek: 5, sortOrder: 3, archived: false, createdAt: now() },
    { id: newId(), name: 'Karten wiederholen', color: 'habits', targetPerWeek: 6, sortOrder: 4, archived: false, createdAt: now() },
  ]
  for (const h of habits) await data.habits.put(h)

  // Ein paar Wochen Verlauf, damit Heatmap und Serien nicht bei null starten.
  // Fester Zufall: dieselbe Vorgeschichte bei jeder Installation.
  let seed = 7
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return seed / 2147483648
  }
  for (let back = 90; back >= 1; back--) {
    const date = addDays(t, -back)
    // Jeder fünfte Tag fällt ganz aus — sonst entstünden Serien über Monate
    // und die Zahl im Cockpit wäre nichts mehr wert.
    if (rnd() < 0.2) continue
    for (const h of habits) {
      if (rnd() < (h.targetPerWeek / 7) * 0.85) {
        await data.habitEntries.put({ id: newId(), habitId: h.id, date, done: true })
      }
    }
  }
  // Heute: zwei erledigt, drei offen — wie in der Vorschau
  await data.habitEntries.put({ id: newId(), habitId: habits[0].id, date: t, done: true })
  await data.habitEntries.put({ id: newId(), habitId: habits[1].id, date: t, done: true })

  const courses: Course[] = [
    { id: newId(), name: 'Operations Research', ects: 6, semester: 'SoSe 26', examDate: addDays(t, 12), grade: null, passed: false, createdAt: now() },
    { id: newId(), name: 'Statistik II', ects: 5, semester: 'SoSe 26', examDate: addDays(t, 26), grade: null, passed: false, createdAt: now() },
    { id: newId(), name: 'Mikroökonomie', ects: 6, semester: 'WiSe 25', examDate: null, grade: 1.7, passed: true, createdAt: now() },
    { id: newId(), name: 'Wirtschaftsinformatik', ects: 5, semester: 'WiSe 25', examDate: null, grade: 2.0, passed: true, createdAt: now() },
  ]
  for (const c of courses) await data.courses.put(c)

  const tasks: Task[] = [
    { id: newId(), title: 'Übungsblatt 3 rechnen', notes: null, dueAt: `${t}T18:00`, tag: 'uni', done: false, doneAt: null, createdAt: now() },
    { id: newId(), title: 'Mail an Prof. wegen Klausureinsicht', notes: null, dueAt: `${addDays(t, 1)}T12:00`, tag: 'uni', done: false, doneAt: null, createdAt: now() },
    { id: newId(), title: 'Trainingsplan für die Woche schreiben', notes: null, dueAt: `${addDays(t, 3)}T12:00`, tag: 'sport', done: false, doneAt: null, createdAt: now() },
    { id: newId(), title: 'Supabase-Projekt anlegen', notes: 'Danach URL und anon key in .env.local eintragen.', dueAt: `${addDays(t, 5)}T12:00`, tag: 'jarvis', done: false, doneAt: null, createdAt: now() },
    { id: newId(), title: 'Skript Kapitel 1–3 drucken', notes: null, dueAt: null, tag: 'uni', done: true, doneAt: now(), createdAt: now() },
  ]
  for (const task of tasks) await data.tasks.put(task)

  const goals: Goal[] = [
    { id: newId(), title: 'Klausur OR bestehen', description: null, targetDate: addDays(t, 12), progress: 64, status: 'active', createdAt: now() },
    { id: newId(), title: 'JARVIS v1 fertig', description: null, targetDate: addDays(t, 41), progress: 18, status: 'active', createdAt: now() },
    { id: newId(), title: '3× Sport pro Woche halten', description: null, targetDate: null, progress: 83, status: 'active', createdAt: now() },
  ]
  for (const g of goals) await data.goals.put(g)

  const workouts: Workout[] = [
    { id: newId(), date: addDays(t, -1), type: 'Push · Bank, Schulter, Trizeps', minutes: 52, note: null, createdAt: now() },
    { id: newId(), date: addDays(t, -3), type: 'Laufen · 5,2 km', minutes: 28, note: '27:40', createdAt: now() },
    { id: newId(), date: addDays(t, -5), type: 'Pull · Rudern, Klimmzüge', minutes: 48, note: null, createdAt: now() },
  ]
  for (const w of workouts) await data.workouts.put(w)

  const journal: JournalEntry[] = [
    { id: newId(), date: t, body: 'Vormittag war stark — zwei Timer-Blöcke OR durchgezogen, Simplex sitzt jetzt endlich. Nachmittags war die Luft raus. Fürs Wochenende: Übungsblatt 3 zuerst, dann Statistik.', createdAt: now(), updatedAt: now() },
    { id: newId(), date: addDays(t, -1), body: 'Kurzer Tag, nur Karten wiederholt. Dafür 8 h geschlafen.', createdAt: now(), updatedAt: now() },
    { id: newId(), date: addDays(t, -2), body: 'Dualität verstanden. Push-Training war gut, Bank 3×8 bei 70 kg.', createdAt: now(), updatedAt: now() },
    { id: newId(), date: addDays(t, -3), body: 'Nichts gemacht. Passiert, morgen wieder.', createdAt: now(), updatedAt: now() },
  ]
  for (const j of journal) await data.journal.put(j)

  // Lernzeit der letzten zwei Wochen — speist Kurve und Wochensumme
  const minutesBack = [80, 64, 20, 47, 56, 32, 71, 15, 52, 38, 62, 27, 43, 45]
  const sessions: StudySession[] = minutesBack.map((min, i) => {
    const date = addDays(t, i - minutesBack.length + 1)
    return {
      id: newId(),
      courseId: courses[i % 2].id,
      date,
      startedAt: toKey(new Date()) === date ? now() : `${date}T10:00:00.000Z`,
      seconds: min * 60,
      note: null,
    }
  })
  for (const s of sessions) await data.studySessions.put(s)
}
