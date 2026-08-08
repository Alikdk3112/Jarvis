/* Das Cockpit — Startbildschirm.

   Ring-Hub, umgeben von Pillen, darunter das Bento aus Glaskacheln in
   ungleichen Anteilen. Alles reagiert live: Haken setzen bewegt Bögen,
   Zahl, Legende und die leuchtenden Knoten auf dem Globus. */

import { useNavigate } from 'react-router-dom'
import { ArcHub } from '../components/hud/ArcHub'
import { ArcGauge, DotMap, DotRow, Empty, GlassTile, Pill, RoundCheck, Sparkline } from '../components/hud'
import { Briefing } from '../features/briefing/Briefing'
import { useTimer } from '../features/study/TimerContext'
import { useHabitToggle } from '../features/habits/useHabitToggle'
import { useCockpit } from '../lib/cockpit'
import { useCollection, useSettings } from '../lib/store'
import {
  addDays, clockFromSeconds, daysBetween, humanDuration, shortDate, today, weekDays, weekdayShort,
} from '../lib/date'
import { TAG_COLOR, type Task } from '../lib/data/types'

function weekCount(entries: { habitId: string; date: string }[], habitId: string): number {
  const week = new Set(weekDays())
  return entries.filter((e) => e.habitId === habitId && week.has(e.date)).length
}

function dueLabel(task: Task): { text: string; overdue: boolean } | null {
  if (!task.dueAt) return null
  const key = task.dueAt.slice(0, 10)
  const diff = daysBetween(today(), key)
  const time = task.dueAt.length > 10 ? task.dueAt.slice(11, 16) : ''
  if (diff < 0) return { text: `ÜBERFÄLLIG · ${shortDate(key)}`, overdue: true }
  if (diff === 0) return { text: time ? `HEUTE ${time}` : 'HEUTE', overdue: true }
  if (diff === 1) return { text: 'MORGEN', overdue: false }
  if (diff <= 6) return { text: weekdayShort(key), overdue: false }
  return { text: shortDate(key), overdue: false }
}

export function Cockpit() {
  const nav = useNavigate()
  const c = useCockpit()
  const { settings } = useSettings()
  const { toggle } = useHabitToggle()
  const timer = useTimer()
  const tasks = useCollection('tasks')
  const journal = useCollection('journal')
  const workouts = useCollection('workouts')
  const notes = useCollection('notes')
  const { entries } = useHabitToggle()

  // Laufender Timer zählt sofort mit, auch bevor er gebucht ist
  const liveStudySeconds = c.studySecondsToday + timer.seconds
  const stuFrac = Math.min(1, liveStudySeconds / c.studyGoalSeconds)
  const dayFrac = 0.4 * c.fractions.hab + 0.3 * c.fractions.tsk + 0.3 * stuFrac

  // Nach Fälligkeit sortiert — was heute dran ist, gehört nach oben
  const openTasks = c.tasks
    .filter((t) => !t.done)
    .sort((x, y) => (x.dueAt ?? '9999').localeCompare(y.dueAt ?? '9999'))
    .slice(0, 5)
  const doneToday = c.tasks.filter((t) => t.done).slice(0, 1)
  const shownTasks = [...openTasks, ...doneToday]

  const latestJournal = [...journal.items].sort((a, b) => b.date.localeCompare(a.date))
  const recentWorkouts = [...workouts.items].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const ectsDone = c.courses.filter((x) => x.passed).reduce((s, x) => s + x.ects, 0)
  const ectsTotal = c.courses.reduce((s, x) => s + x.ects, 0)

  return (
    <>
      <Briefing cockpit={c} name={settings.displayName} />

      <div className="hub">
        <div className="hub__side hub__side--l">
          <Pill label="Serie" value={`${c.streak} ${c.streak === 1 ? 'Tag' : 'Tage'}`} color="habits" />
          <Pill label="Woche" value={humanDuration(c.studySecondsWeek)} color="study" />
          <Pill label="Beste Serie" value={`${c.bestStreak} T`} />
        </div>

        <ArcHub
          fractions={{ day: dayFrac, hab: c.fractions.hab, stu: stuFrac }}
          value={dayFrac}
        />

        <div className="hub__side hub__side--r">
          {c.nextExam ? (
            <Pill
              label="Klausur"
              value={`${c.nextExam.days} T`}
              color={c.nextExam.days <= 14 ? 'alert' : 'journal'}
            />
          ) : (
            <Pill label="Klausur" value="keine" />
          )}
          <Pill label="Offen" value={c.tasksOpen ? `${c.tasksOpen} Tasks` : 'Alles klar'} />
          <Pill label="Training" value={`${recentWorkouts.length} / Woche`} color="sport" />
        </div>
      </div>

      <div className="hub__leg">
        <Pill flat label="Tag" value={`${Math.round(dayFrac * 100)} %`} />
        <Pill flat label="Habits" value={`${c.habitsDone} / ${c.habitsTotal}`} color="habits" />
        <Pill
          flat
          label="Lernziel"
          value={`${Math.round(liveStudySeconds / 60)} / ${Math.round(c.studyGoalSeconds / 60)} min`}
          color="study"
        />
      </div>

      {/* ── Band 1 ── */}
      <div className="band">
        <GlassTile
          title="Habits · Heute"
          color="habits"
          className="f5"
          meta={`${c.habitsDone} / ${c.habitsTotal}`}
          onTitleClick={() => nav('/habits')}
        >
          {c.habits.length === 0 ? (
            <Empty>Noch keine Habits. Lege den ersten unter „Habits" an.</Empty>
          ) : (
            <div className="fill">
              {c.habits.map((h) => (
                <div className="row" key={h.id}>
                  <RoundCheck
                    checked={c.habitDoneToday.has(h.id)}
                    onChange={(next) => void toggle(h.id, c.todayKey, next)}
                    label={h.name}
                  />
                  <span className="row__n">{h.name}</span>
                  <DotRow filled={weekCount(entries, h.id)} />
                  <span className="row__v">
                    {weekCount(entries, h.id)}/{h.targetPerWeek}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassTile>

        <GlassTile
          title="Study Timer"
          color="study"
          className="f4"
          meta={`HEUTE ${Math.round(liveStudySeconds / 60)} MIN`}
          onTitleClick={() => nav('/study')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <ArcGauge
              value={timer.seconds / timer.targetSeconds}
              label={clockFromSeconds(timer.seconds)}
              caption={`VON ${Math.round(timer.targetSeconds / 60)} MIN`}
              color="study"
            />
            <div className="kv">
              <div>
                <span>WOCHE</span>
                <b>{humanDuration(c.studySecondsWeek)}</b>
              </div>
              <div>
                <span>Ø / TAG</span>
                <b>{Math.round(c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length))} MIN</b>
              </div>
              <div>
                <span>SERIE</span>
                <b style={{ color: 'var(--habits)' }}>{c.streak} T</b>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button
              type="button"
              className="btn btn--p m-study"
              onClick={() => (timer.running ? timer.pause() : timer.start())}
            >
              {timer.running ? 'Pause' : timer.seconds ? 'Weiter' : 'Start'}
            </button>
            <button type="button" className="btn" onClick={() => void timer.book()}>
              Buchen
            </button>
          </div>
        </GlassTile>

        <GlassTile
          title="Tasks"
          className="f3"
          meta={c.tasksOpen ? `${c.tasksOpen} OFFEN` : 'ALLES KLAR'}
          onTitleClick={() => nav('/tasks')}
        >
          {shownTasks.length === 0 ? (
            <Empty>Keine Aufgaben.</Empty>
          ) : (
            <div className="fill">
              {shownTasks.map((t) => {
                const due = dueLabel(t)
                return (
                  <div className="tsk" key={t.id} data-done={t.done ? '1' : '0'}>
                    <RoundCheck
                      checked={t.done}
                      label={t.title}
                      onChange={(next) =>
                        void tasks.put({
                          ...t,
                          done: next,
                          doneAt: next ? new Date().toISOString() : null,
                        })
                      }
                    />
                    <div className="tsk__b">
                      <div className="tsk__t">{t.title}</div>
                      <div className="tsk__m">
                        {t.tag && (
                          <span className="chipx" style={{ color: `var(--${TAG_COLOR[t.tag]})` }}>
                            {t.tag.toUpperCase()}
                          </span>
                        )}
                        {t.done ? (
                          <span>ERLEDIGT</span>
                        ) : (
                          due && <span className={due.overdue ? 'due' : undefined}>{due.text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </GlassTile>
      </div>

      {/* ── Band 2 ── */}
      <div className="band">
        <GlassTile
          title="Journal"
          color="journal"
          className="f5"
          meta={`${journal.items.length} EINTRÄGE`}
          onTitleClick={() => nav('/journal')}
        >
          {latestJournal.length === 0 ? (
            <Empty>Noch kein Eintrag. Schreib auf, wie der Tag war.</Empty>
          ) : (
            <>
              <div className="jn__d" style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.16em', color: 'var(--journal)', marginBottom: 7 }}>
                {latestJournal[0].date === c.todayKey ? 'HEUTE' : weekdayShort(latestJournal[0].date)} · {shortDate(latestJournal[0].date)}
              </div>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: '#c6d5e1' }}>{latestJournal[0].body}</p>
              {latestJournal.length > 1 && (
                <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {latestJournal.slice(1, 4).map((j) => (
                    <div key={j.id} style={{ display: 'flex', gap: 13, alignItems: 'baseline', fontSize: 13, color: 'var(--dim)' }}>
                      <time style={{ fontFamily: 'var(--mono)', fontSize: 9.5, letterSpacing: '.1em', color: 'var(--dimmer)', flex: 'none', width: 50 }}>
                        {shortDate(j.date)}
                      </time>
                      <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </GlassTile>

        <GlassTile title="Aktivität · 20 Wochen" color="habits" className="f4" meta={`${c.heatmap.filter(Boolean).length} TAGE`}>
          <DotMap values={c.heatmap} />
          <div className="dleg">
            <span>{shortDate(c.todayKey)}</span>
            <span className="sp" />
            <span>WENIG</span>
            <i style={{ background: 'rgba(255,255,255,.055)' }} />
            <i style={{ background: 'color-mix(in srgb, var(--habits) 24%, transparent)' }} />
            <i style={{ background: 'color-mix(in srgb, var(--habits) 48%, transparent)' }} />
            <i style={{ background: 'color-mix(in srgb, var(--habits) 74%, transparent)' }} />
            <i style={{ background: 'var(--habits)' }} />
            <span>VIEL</span>
          </div>
        </GlassTile>

        <GlassTile title="Goals" color="goals" className="f3" meta={`${c.goals.length} AKTIV`} onTitleClick={() => nav('/goals')}>
          {c.goals.length === 0 ? (
            <Empty>Keine aktiven Ziele.</Empty>
          ) : (
            c.goals.slice(0, 4).map((g) => {
              const days = g.targetDate ? daysBetween(c.todayKey, g.targetDate) : null
              return (
                <div className="goal" key={g.id}>
                  <div className="goal__h">
                    <span className="goal__t">{g.title}</span>
                    <span className={`goal__d ${days !== null && days <= 14 ? 'hot' : ''}`}>
                      {days === null ? 'LAUFEND' : `${days} T`}
                    </span>
                  </div>
                  <div className="pbar">
                    <i style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              )
            })
          )}
        </GlassTile>
      </div>

      <div className="strip">
        <Pill flat label="Semester" value={`${ectsDone} / ${ectsTotal} ECTS`} color="study" />
        <Pill flat label="Notizen" value={notes.items.length} color="journal" />
        <Pill flat label="Training" value={`${recentWorkouts.length} × 7 T`} color="sport" />
        <Pill flat label="Ø Lernen" value={`${Math.round(c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length))} min`} color="study" />
      </div>

      {/* ── Band 3 ── */}
      <div className="band">
        <GlassTile title="Semester" color="study" className="f4" meta={`${ectsDone} / ${ectsTotal} ECTS`} onTitleClick={() => nav('/uni')}>
          {c.courses.length === 0 ? (
            <Empty>Noch keine Kurse eingetragen.</Empty>
          ) : (
            c.courses.slice(0, 5).map((course) => {
              const days = course.examDate ? daysBetween(c.todayKey, course.examDate) : null
              return (
                <div className="row" key={course.id}>
                  <span className="row__n">{course.name}</span>
                  <span className="row__v">{course.ects} ECTS</span>
                  {course.passed ? (
                    <span className="chipx" style={{ color: 'var(--habits)' }}>
                      {course.grade?.toFixed(1).replace('.', ',') ?? 'BESTANDEN'}
                    </span>
                  ) : days !== null ? (
                    <span className="chipx" style={{ color: days <= 14 ? 'var(--alert)' : 'var(--journal)' }}>
                      KLAUSUR {days} T
                    </span>
                  ) : (
                    <span className="chipx" style={{ color: 'var(--dimmer)' }}>LAUFEND</span>
                  )}
                </div>
              )
            })
          )}
        </GlassTile>

        <GlassTile title="Lernminuten · 14 T" color="study" className="f3" meta={`Ø ${Math.round(c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length))}`}>
          <Sparkline
            values={c.studyTrend}
            color="study"
            firstLabel={shortDate(addDays(c.todayKey, -(c.studyTrend.length - 1)))}
            lastLabel={shortDate(c.todayKey)}
          />
        </GlassTile>

        <GlassTile title="Training · 7 Tage" color="sport" className="f5" meta={`${recentWorkouts.length} EINHEITEN`} onTitleClick={() => nav('/sport')}>
          {recentWorkouts.length === 0 ? (
            <Empty>Keine Einheiten in den letzten Tagen.</Empty>
          ) : (
            recentWorkouts.map((w) => (
              <div className="row" key={w.id}>
                <span className="row__v" style={{ width: 34 }}>{weekdayShort(w.date)}</span>
                <span className="row__n">{w.type}</span>
                <span className="row__v">
                  <b>{w.minutes}</b> MIN
                </span>
              </div>
            ))
          )}
        </GlassTile>
      </div>
    </>
  )
}
