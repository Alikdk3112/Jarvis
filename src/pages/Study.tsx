/* ══════════════════════════════════════════════════════════════════════
   Study.

   Wichtigste Information: die laufende Zeit als `01:23:45` — die zweite
   und letzte t-44 der App. Study ist die einzige Ansicht, die man
   öffnet, um etwas zu starten, nicht um etwas zu lesen.

   Die Ziffer steht NEBEN dem Ring, nicht darin: acht Zeichen in Mono 44px
   sind rund 211px, der Ring ist 132px breit. Im Cockpit passt die t-44 in
   die Mitte, weil dort nur zwei Ziffern plus Prozentzeichen stehen.
   ══════════════════════════════════════════════════════════════════════ */

import { Bars, Btn, Empty, IconBtn, Kv, Nil, Ring, Row, Sec, Status } from '../components/hud'
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
  const nameOf = (id: string | null) =>
    id ? (courses.items.find((x) => x.id === id)?.name ?? 'Unbekannt') : 'Ohne Fach'

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

  const avg = Math.round(c.studyTrend.reduce((a, b) => a + b, 0) / Math.max(1, c.studyTrend.length))
  const bookable = timer.seconds >= 30

  return (
    <>
      {/* ── Der Timer ist eine Zeile, keine Kachel ── */}
      <Sec title="Study" color="study" metaLabel="Woche" metaValue={humanDuration(c.studySecondsWeek)}>
        <div className="head2" style={{ alignItems: 'center', padding: '8px 8px 16px' }}>
          <Ring arcs={[{ value: timer.seconds / timer.targetSeconds, color: 'study' }]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="big big--timer">{clockFromSeconds(timer.seconds)}</span>
            <Status
              on={timer.running}
              color="study"
              label={timer.running ? 'Läuft' : timer.seconds ? 'Pause' : 'Bereit'}
            />
          </div>
          {/* Aktionen, keine Auswahl — deshalb Knöpfe und kein
              Segment-Umschalter. Ein Umschalter, bei dem nichts gewählt
              ist, lügt über seine Rolle. */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="btns">
              <Btn kind="pri" onClick={() => (timer.running ? timer.pause() : timer.start())}>
                {timer.running ? 'Pause' : timer.seconds ? 'Weiter' : 'Start'}
              </Btn>
              <Btn onClick={() => void timer.book()} disabled={!bookable}>
                Buchen
              </Btn>
              <Btn onClick={timer.reset} disabled={!timer.seconds}>
                Reset
              </Btn>
            </div>
            {!bookable && <span className="lead__l">Buchen ab 0:30</span>}
          </div>
        </div>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            <span className="lbl">Fach</span>
            <select
              className="inp"
              value={timer.courseId ?? 'none'}
              onChange={(e) => timer.setCourseId(e.target.value === 'none' ? null : e.target.value)}
              aria-label="Fach wählen"
            >
              <option value="none">Ohne Fach</option>
              {active.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        </form>
      </Sec>

      <div className="g12 blk">
        <div className="c7">
          <Sec title="Heute" color="study" metaLabel="Summe" metaValue={humanDuration(c.studySecondsToday)}>
            {todaySessions.length === 0 ? (
              <Empty>Nichts gebucht — Timer starten</Empty>
            ) : (
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Fach</th>
                    <th style={{ width: '9ch' }} data-col="opt">
                      Beginn
                    </th>
                    <th className="num" style={{ width: '9ch' }}>
                      Dauer
                    </th>
                    <th className="act" />
                  </tr>
                </thead>
                <tbody>
                  {todaySessions.map((s) => (
                    <tr key={s.id}>
                      <td>{nameOf(s.courseId)}</td>
                      <td className="met" data-col="opt">
                        {s.startedAt.slice(11, 16)}
                      </td>
                      <td className="num">
                        {Math.round(s.seconds / 60)}
                        <span className="unit">min</span>
                      </td>
                      <td className="act">
                        <IconBtn icon="x" label="Lerneinheit löschen" danger onClick={() => void sessions.remove(s.id)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Sec>

          <Sec title="Verlauf · 14 Tage" color="study" grouped metaLabel="Ø" metaValue={`${avg} min`}>
            <Bars
              values={c.studyTrend}
              color="study"
              firstLabel={shortDate(addDays(todayKey, -(c.studyTrend.length - 1)))}
              lastLabel="Heute"
            />
          </Sec>
        </div>

        <div className="c5">
          <Sec title="Fächer · Woche" color="study" metaValue={perCourse.length}>
            {perCourse.length === 0 ? (
              <Empty>Diese Woche noch nichts gebucht</Empty>
            ) : (
              perCourse.map(({ course, seconds }) => (
                <Row key={course.id}>
                  <span className="row__n">{course.name}</span>
                  <span className="row__v">{humanDuration(seconds)}</span>
                </Row>
              ))
            )}
            <Kv label="Ziel / Tag" value={Math.round(c.studyGoalSeconds / 60)} unit="min" />
            <Kv
              label="Heute davon"
              value={c.studySecondsToday ? `${Math.round((c.studySecondsToday / c.studyGoalSeconds) * 100)} %` : <Nil />}
            />
          </Sec>
        </div>
      </div>
    </>
  )
}
