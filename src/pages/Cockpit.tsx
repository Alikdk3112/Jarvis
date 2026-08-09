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
import { useCockpit, WEIGHTS } from '../lib/cockpit'
import { useCollection, useSettings } from '../lib/store'
import { dueLabel } from '../lib/due'
import {
  addDays, clockFromSeconds, daysBetween, humanDuration, shortDate, weekdayShort,
} from '../lib/date'
import { TAG_COLOR } from '../lib/data/types'

export function Cockpit() {
  const nav = useNavigate()
  const c = useCockpit()
  const { settings } = useSettings()
  // Ein Aufruf, nicht zwei: Jeder legt eine eigene Abfrage samt Mutationen
  // an und rechnet dieselben Nachschlagetabellen ein zweites Mal aus.
  const { toggle, weekCount } = useHabitToggle()
  const timer = useTimer()
  const tasks = useCollection('tasks')
  const journal = useCollection('journal')
  const workouts = useCollection('workouts')
  const notes = useCollection('notes')

  // Laufender Timer zählt sofort mit, auch bevor er gebucht ist
  const liveStudySeconds = c.studySecondsToday + timer.seconds
  const stuFrac = Math.min(1, liveStudySeconds / c.studyGoalSeconds)
  // Gewichte aus cockpit.ts statt hier nachgebaut — sonst driften die
  // Zahl im Hub und der Bogen auseinander, sobald eine davon sich ändert.
  const dayFrac = WEIGHTS.habits * c.fractions.hab + WEIGHTS.tasks * c.fractions.tsk + WEIGHTS.study * stuFrac

  // Nach Fälligkeit sortiert — was heute dran ist, gehört nach oben
  const openTasks = c.tasks
    .filter((t) => !t.done)
    .sort((x, y) => (x.dueAt ?? '9999').localeCompare(y.dueAt ?? '9999'))
    .slice(0, 5)
  const doneToday = c.tasks.filter((t) => t.done).slice(0, 1)
  const shownTasks = [...openTasks, ...doneToday]

  const latestJournal = [...journal.items].sort((a, b) => b.date.localeCompare(a.date))
  /* Vorher: die drei jüngsten Einheiten, ganz gleich wie alt. Wer zuletzt
     im März trainiert hat, las im August immer noch „3 / Woche". Jetzt
     zählt, was in den letzten sieben Tagen tatsächlich stattfand. */
  const sinceKey = addDays(c.todayKey, -6)
  const recentWorkouts = workouts.items
    .filter((w) => w.date >= sinceKey && w.date <= c.todayKey)
    .sort((a, b) => b.date.localeCompare(a.date))
  const ectsDone = c.courses.filter((x) => x.passed).reduce((s, x) => s + x.ects, 0)
  const ectsTotal = c.courses.reduce((s, x) => s + x.ects, 0)
  const avgStudy = Math.round(
    c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length),
  )

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
          animate={settings.ambient}
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
                  <DotRow filled={weekCount(h.id)} />
                  <span className="row__v">
                    {weekCount(h.id)}/{h.targetPerWeek}
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
                <b>{avgStudy} MIN</b>
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
            {/* Unter einer halben Minute verwirft `book()` die Zeit. In der
                Study-Ansicht ist der Knopf dafür gesperrt — hier war er es
                nicht, und ein Tipp löschte den Timer kommentarlos. */}
            <button
              type="button"
              className="btn"
              onClick={() => void timer.book()}
              disabled={timer.seconds < 30}
            >
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
        <Pill flat label="Ø Lernen" value={`${avgStudy} min`} color="study" />
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

        <GlassTile title="Lernminuten · 14 T" color="study" className="f3" meta={`Ø ${avgStudy}`}>
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
