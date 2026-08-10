/* ══════════════════════════════════════════════════════════════════════
   Cockpit.

   Wichtigste Information: wie weit der heutige Tag ist — eine Prozentzahl
   in der Ringmitte, daneben der eine Satz, der sagt, was noch fehlt.

   Das Cockpit besitzt nichts Eigenes; jede Zahl darauf gehört einem
   anderen Modul und ist dort vollständiger zu sehen. Der einzige Wert,
   der ausschließlich hier existiert, ist die gewichtete Tageszahl. Sie
   bekommt deshalb die einzige t-44 der Ansicht, der Satz die einzige
   Fließtextfläche, und beide stehen in einer Sichtlinie — nicht
   untereinander.

   Aufteilung 7/5, niemals 6/6: eine Halbierung liest sich als
   Kachelpaar. Die Spalten enden nicht auf gleicher Höhe, und das wird
   nicht ausgeglichen.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bars, Check, Chip, Empty, Heatmap, Kv, Nil, PBar, Ring, RingLegend, Row, Sec, Status,
} from '../components/hud'
import { Briefing } from '../features/briefing/Briefing'
import { useTimer } from '../features/study/TimerContext'
import { useHabitToggle } from '../features/habits/useHabitToggle'
import { useCockpit, WEIGHTS } from '../lib/cockpit'
import { useCollection, useSettings } from '../lib/store'
import { dueLabel } from '../lib/due'
import { addDays, daysBetween, humanDuration, shortDate, weekdayShort } from '../lib/date'
import { TAG_COLOR } from '../lib/data/types'

export function Cockpit() {
  const nav = useNavigate()
  const c = useCockpit()
  const { settings } = useSettings()
  const { toggle, weekCount } = useHabitToggle()
  const timer = useTimer()
  const tasks = useCollection('tasks')
  const journal = useCollection('journal')
  const workouts = useCollection('workouts')

  // Laufender Timer zählt sofort mit, auch bevor er gebucht ist.
  const liveStudySeconds = c.studySecondsToday + timer.seconds
  const stuFrac = Math.min(1, liveStudySeconds / c.studyGoalSeconds)
  // Gewichte aus cockpit.ts, nicht hier nachgebaut.
  const dayFrac =
    WEIGHTS.habits * c.fractions.hab + WEIGHTS.tasks * c.fractions.tsk + WEIGHTS.study * stuFrac

  const openTasks = c.tasks
    .filter((t) => !t.done)
    .sort((x, y) => (x.dueAt ?? '9999').localeCompare(y.dueAt ?? '9999'))
    .slice(0, 5)

  // Echte sieben Tage, nicht „die letzten drei Einträge".
  const sinceKey = addDays(c.todayKey, -6)
  const recentWorkouts = workouts.items
    .filter((w) => w.date >= sinceKey && w.date <= c.todayKey)
    .sort((a, b) => b.date.localeCompare(a.date))
  const weekMinutes = recentWorkouts.reduce((s, w) => s + w.minutes, 0)

  const ectsDone = c.courses.filter((x) => x.passed).reduce((s, x) => s + x.ects, 0)
  const ectsTotal = c.courses.reduce((s, x) => s + x.ects, 0)
  const exams = c.courses
    .filter((x) => !x.passed && x.examDate)
    .map((x) => ({ course: x, days: daysBetween(c.todayKey, x.examDate as string) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)

  /* 140 Titel bedeuten 140 Datumsberechnungen und 140 Zeichenketten.
     Ohne useMemo lief das bei jedem Rendern neu — und das Cockpit rendert
     im Sekundentakt, solange der Timer läuft. */
  const heatTitles = useMemo(
    () =>
      c.heatmap.map(
        (v, i) => `${shortDate(addDays(c.todayKey, i - c.heatmap.length + 1))} · ${v}/4`,
      ),
    [c.heatmap, c.todayKey],
  )

  return (
    <div className="g12">
      {/* ── Linke Kette: Ring → Briefing → Serie/Heatmap → Verlauf ── */}
      <div className="c7">
        <div className="head2">
          <Ring
            arcs={[
              { value: dayFrac, color: 'tasks' },
              { value: c.fractions.hab, color: 'habits' },
              { value: stuFrac, color: 'study' },
            ]}
            center={
              <div className="big">
                {Math.round(dayFrac * 100)}
                <sup>%</sup>
              </div>
            }
          />
          <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Briefing cockpit={c} name={settings.displayName} />
            <RingLegend
              items={[
                { label: 'Tag', value: `${Math.round(dayFrac * 100)} %`, color: 'tasks' },
                { label: 'Habits', value: `${c.habitsDone} / ${c.habitsTotal}`, color: 'habits' },
                {
                  label: 'Lernziel',
                  value: `${Math.round(liveStudySeconds / 60)} / ${Math.round(c.studyGoalSeconds / 60)}`,
                  color: 'study',
                },
              ]}
            />
          </div>
        </div>

        <Sec
          title="Aktivität · 140 Tage"
          color="habits"
          metaLabel="Serie"
          metaValue={
            <>
              {c.streak}
              <span className="unit">T</span>
            </>
          }
        >
          <Heatmap values={c.heatmap} titles={heatTitles} />
          <Kv label="Beste Serie" value={c.bestStreak} unit="T" />
        </Sec>

        <Sec
          title="Lernminuten · 14 Tage"
          color="study"
          grouped
          metaLabel="Woche"
          metaValue={humanDuration(c.studySecondsWeek)}
        >
          <Bars
            values={c.studyTrend}
            color="study"
            firstLabel={shortDate(addDays(c.todayKey, -(c.studyTrend.length - 1)))}
            lastLabel="Heute"
          />
        </Sec>

        <Sec title="Training · 7 Tage" color="sport" grouped metaValue={recentWorkouts.length}>
          {recentWorkouts.length === 0 ? (
            <Empty>Keine Einheit in den letzten sieben Tagen</Empty>
          ) : (
            <>
              {recentWorkouts.slice(0, 3).map((w) => (
                <Row key={w.id} onClick={() => nav('/sport')}>
                  <span className="row__m" style={{ width: 26 }}>
                    {weekdayShort(w.date)}
                  </span>
                  <span className="row__n">{w.type}</span>
                  <span className="row__v">
                    {w.minutes}
                    <span className="unit">min</span>
                  </span>
                </Row>
              ))}
              <Kv label="Woche" value={weekMinutes} unit="min" />
            </>
          )}
        </Sec>

        <Sec title="Journal · Lernzeit" color="journal" grouped metaValue={journal.items.length}>
          <Kv
            label="Heute geschrieben"
            value={journal.items.some((j) => j.date === c.todayKey) ? 'Ja' : <Nil />}
          />
          <div className="row">
            <Status on={timer.running} label={timer.running ? 'Timer läuft' : 'Timer aus'} color="study" />
            <span style={{ flex: 1 }} />
            <span className="row__v">
              {Math.round(liveStudySeconds / 60)}
              <span className="unit">min</span>
            </span>
          </div>
        </Sec>
      </div>

      {/* ── Rechte Spalte: Handlungslisten und Horizont, als Panelgruppe ── */}
      <div className="c5">
        <Sec
          title="Habits heute"
          color="habits"
          metaValue={`${c.habitsDone} / ${c.habitsTotal}`}
        >
          {c.habits.length === 0 ? (
            <Empty>Noch keine Habits — unter Habits anlegen</Empty>
          ) : (
            c.habits.map((h) => (
              <Row key={h.id}>
                <Check
                  checked={c.habitDoneToday.has(h.id)}
                  onChange={(next) => void toggle(h.id, c.todayKey, next)}
                  label={h.name}
                />
                <span className="row__n">{h.name}</span>
                <span className="row__v">
                  {weekCount(h.id)}/{h.targetPerWeek}
                </span>
              </Row>
            ))
          )}
        </Sec>

        <Sec title="Tasks offen" color="tasks" grouped metaValue={c.tasksOpen}>
          {openTasks.length === 0 ? (
            <Empty>Nichts offen</Empty>
          ) : (
            openTasks.map((t) => {
              const d = dueLabel(t, c.todayKey)
              return (
                <Row key={t.id} warn={d?.overdue}>
                  <Check
                    checked={false}
                    label={t.title}
                    onChange={() =>
                      void tasks.put({ ...t, done: true, doneAt: new Date().toISOString() })
                    }
                  />
                  <span className="row__n">{t.title}</span>
                  {t.tag && <Chip color={TAG_COLOR[t.tag]}>{t.tag}</Chip>}
                  <span className={`row__m ${d?.overdue ? 'row__v--warn' : ''}`}>
                    {d ? d.text : <Nil />}
                  </span>
                </Row>
              )
            })
          )}
        </Sec>

        <Sec
          title="Klausuren"
          color="study"
          grouped
          metaLabel="Ects"
          metaValue={`${ectsDone}/${ectsTotal}`}
        >
          {exams.length === 0 ? (
            <Empty>Kein Termin eingetragen</Empty>
          ) : (
            exams.map((e) => (
              <Row key={e.course.id} warn={e.days <= 14} onClick={() => nav('/uni')}>
                <span className="row__n">{e.course.name}</span>
                <span className="row__m">{shortDate(e.course.examDate as string)}</span>
                <span className={`row__v ${e.days <= 14 ? 'row__v--warn' : ''}`}>
                  {e.days}
                  <span className="unit">T</span>
                </span>
              </Row>
            ))
          )}
        </Sec>

        <Sec title="Goals" color="goals" grouped metaValue={c.goals.length}>
          {c.goals.length === 0 ? (
            <Empty>Keine aktiven Ziele</Empty>
          ) : (
            c.goals.slice(0, 4).map((g) => {
              const days = g.targetDate ? daysBetween(c.todayKey, g.targetDate) : null
              return (
                <Row key={g.id} onClick={() => nav('/goals')} warn={days !== null && days < 0}>
                  <span className="row__n">{g.title}</span>
                  <PBar value={g.progress} color="goals" />
                  <span className="row__v">{g.progress} %</span>
                  <span className="row__m">{days === null ? <Nil /> : `${days} T`}</span>
                </Row>
              )
            })
          )}
        </Sec>

      </div>
    </div>
  )
}
