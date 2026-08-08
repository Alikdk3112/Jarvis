/* ══════════════════════════════════════════════════════════════════════
   Daily Briefing.

   Bewusst gekapselt: `buildBriefing` erzeugt die Sätze zurzeit aus festen
   Regeln. Wenn später ein KI-Modell übernimmt, wird genau diese eine
   Funktion ersetzt — die Darstellung bleibt unverändert.
   ══════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react'
import type { CockpitData } from '../../lib/cockpit'
import { humanDuration } from '../../lib/date'

type Tone = 'c' | 'g' | 'v' | 'r' | 'o' | undefined

interface Part {
  text: string
  tone?: Tone
}

function greeting(hour: number): string {
  if (hour < 5) return 'Noch wach'
  if (hour < 11) return 'Guten Morgen'
  if (hour < 18) return 'Hallo'
  return 'Guten Abend'
}

export function buildBriefing(c: CockpitData, name: string, now = new Date()): Part[] {
  const parts: Part[] = []
  const open = c.habitsTotal - c.habitsDone

  parts.push({ text: `${greeting(now.getHours())}, ${name}. ` })

  if (c.habitsTotal === 0) {
    parts.push({ text: 'Du hast noch keine Habits angelegt — fang mit einem an, der Rest kommt von selbst. ' })
  } else if (open === 0) {
    parts.push({ text: 'Alle ' })
    parts.push({ text: `${c.habitsTotal} Habits`, tone: 'g' })
    parts.push({ text: ' sind heute abgehakt. ' })
  } else {
    parts.push({ text: 'Du hast heute ' })
    parts.push({ text: `${open} von ${c.habitsTotal} Habits`, tone: 'g' })
    parts.push({ text: ' offen' })
  }

  if (c.tasksOpen > 0) {
    parts.push({ text: c.habitsTotal && open ? ' und ' : '' })
    parts.push({ text: `${c.tasksOpen} ${c.tasksOpen === 1 ? 'Aufgabe' : 'Aufgaben'}`, tone: 'c' })
    parts.push({ text: ' auf dem Tisch' })
  }
  if (open > 0 || c.tasksOpen > 0) parts.push({ text: '. ' })

  if (c.nextExam) {
    const { course, days } = c.nextExam
    parts.push({ text: days <= 14 ? 'Achtung: die Klausur ' : 'Die Klausur ' })
    parts.push({ text: course.name, tone: undefined })
    parts.push({ text: ' ist ' })
    parts.push({
      text: days === 0 ? 'heute' : days === 1 ? 'morgen' : `in ${days} Tagen`,
      tone: days <= 14 ? 'r' : 'o',
    })
    parts.push({ text: '. ' })
  }

  if (c.studySecondsToday > 0) {
    parts.push({ text: 'Heute schon ' })
    parts.push({ text: humanDuration(c.studySecondsToday), tone: 'v' })
    parts.push({ text: ' gelernt' })
  } else if (c.studySecondsWeek > 0) {
    parts.push({ text: 'Diese Woche ' })
    parts.push({ text: humanDuration(c.studySecondsWeek), tone: 'v' })
    parts.push({ text: ' gelernt' })
  } else {
    parts.push({ text: 'Noch keine Lernzeit erfasst' })
  }

  if (c.streak > 1) {
    parts.push({ text: ', ' })
    parts.push({ text: `${c.streak}. Tag in Folge`, tone: 'g' })
  }
  parts.push({ text: '.' })

  return parts
}

export function Briefing({ cockpit, name }: { cockpit: CockpitData; name: string }) {
  const parts = buildBriefing(cockpit, name)
  return (
    <div className="brief">
      <span className="brief__orb" aria-hidden="true">
        <i />
        <u />
      </span>
      <p className="brief__txt">
        {parts.map((p, i): ReactNode =>
          p.tone ? (
            <b key={i} className={p.tone}>
              {p.text}
            </b>
          ) : (
            <span key={i}>{p.text}</span>
          ),
        )}
      </p>
    </div>
  )
}
