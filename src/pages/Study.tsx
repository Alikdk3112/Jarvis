/* Study: Vollbild-Timer mit Fachzuordnung, Tages- und Wochensummen,
   Verlauf der letzten zwei Wochen. */

import { Page } from '../components/Page'
import { ArcGauge, Empty, GlassTile, Icon, SelectPills, Sparkline } from '../components/hud'
import { useTimer } from '../features/study/TimerContext'
import { useCockpit } from '../lib/cockpit'
import { useCollection } from '../lib/store'
import { addDays, clockFromSeconds, humanDuration, shortDate, today, weekDays } from '../lib/date'

export function Study() {
  const timer = useTimer()
  const c = useCockpit()
  const sessions = useCollection('studySessions')
  const courses = useCollection('courses')
  const todayKey = today()

  const active = courses.items.filter((x) => !x.passed)
  const options = [
    { value: 'none', label: 'OHNE FACH' },
    ...active.map((x) => ({ value: x.id, label: x.name.toUpperCase() })),
  ]

  const todaySessions = sessions.items
    .filter((s) => s.date === todayKey)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))

  const week = new Set(weekDays())
  const perCourse = active
    .map((course) => ({
      course,
      seconds: sessions.items
        .filter((s) => week.has(s.date) && s.courseId === course.id)
        .reduce((sum, s) => sum + s.seconds, 0),
    }))
    .filter((x) => x.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds)

  const nameOf = (id: string | null) =>
    id ? (courses.items.find((x) => x.id === id)?.name ?? 'Unbekannt') : 'Ohne Fach'

  return (
    <Page title="STUDY">
      <div className="cols">
        <GlassTile title="Timer" color="study" meta={`HEUTE ${Math.round((c.studySecondsToday + timer.seconds) / 60)} MIN`}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <ArcGauge
              value={timer.seconds / timer.targetSeconds}
              label={clockFromSeconds(timer.seconds)}
              caption={nameOf(timer.courseId).toUpperCase()}
              color="study"
              size={214}
              strokeWidth={4.5}
              ticks
            />
            <SelectPills
              options={options}
              value={timer.courseId ?? 'none'}
              onChange={(v) => timer.setCourseId(v === 'none' ? null : v)}
              color="study"
              ariaLabel="Fach wählen"
            />
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn--p m-study"
                onClick={() => (timer.running ? timer.pause() : timer.start())}
              >
                {timer.running ? 'Pause' : timer.seconds ? 'Weiter' : 'Start'}
              </button>
              <button type="button" className="btn" onClick={() => void timer.book()} disabled={timer.seconds < 30}>
                Stop &amp; Buchen
              </button>
              <button type="button" className="btn" onClick={timer.reset}>
                Reset
              </button>
            </div>
          </div>
        </GlassTile>

        <GlassTile title="Heute" color="study" meta={humanDuration(c.studySecondsToday)}>
          {todaySessions.length === 0 ? (
            <Empty>Heute noch nichts gebucht.</Empty>
          ) : (
            todaySessions.map((s) => (
              <div className="row" key={s.id}>
                <span className="row__n">{nameOf(s.courseId)}</span>
                <span className="row__v">
                  <b>{Math.round(s.seconds / 60)}</b> MIN
                </span>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{ padding: '6px 10px' }}
                  onClick={() => void sessions.remove(s.id)}
                  aria-label="Lerneinheit löschen"
                >
                  <Icon name="trash" />
                </button>
              </div>
            ))
          )}

          <div className="row__v" style={{ marginTop: 18, marginBottom: 8 }}>
            DIESE WOCHE · {humanDuration(c.studySecondsWeek)}
          </div>
          {perCourse.length === 0 ? (
            <Empty>Diese Woche noch nichts gelernt.</Empty>
          ) : (
            perCourse.map(({ course, seconds }) => (
              <div className="row" key={course.id}>
                <span className="row__n">{course.name}</span>
                <span className="row__v">
                  <b>{humanDuration(seconds)}</b>
                </span>
              </div>
            ))
          )}
        </GlassTile>
      </div>

      <GlassTile
        title="Lernminuten · 14 Tage"
        color="study"
        meta={`Ø ${Math.round(c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length))} MIN`}
      >
        <Sparkline
          values={c.studyTrend}
          color="study"
          firstLabel={shortDate(addDays(c.todayKey, -(c.studyTrend.length - 1)))}
          lastLabel={shortDate(c.todayKey)}
          height={150}
        />
      </GlassTile>
    </Page>
  )
}
