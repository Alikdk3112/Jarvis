/* ══════════════════════════════════════════════════════════════════════
   Uni.

   Wichtigste Information: die Tage bis zur nächsten Klausur.

   Uni enthält zwei Zeitskalen — ECTS bewegen sich über Jahre,
   Klausurtermine über Tage. Nur eine kann handlungsleitend sein, und es
   ist nicht die, die sich zweimal im Semester ändert. Deshalb trägt der
   Countdown die einzige Leitzahl der Ansicht und der Semesterstand liegt
   im Ring.

   Damit weiche ich bewusst von der Bausteinzuordnung ab, die „t-28 ECTS
   bestanden" vorsah: der Ring trägt den Stand schon vollständig, und ihn
   zusätzlich als größte Zahl zu setzen, verdoppelt eine Aussage und lässt
   die einzige zeitkritische Zahl in Zellengröße untergehen.
   ══════════════════════════════════════════════════════════════════════ */

import { useState } from 'react'
import { Btn, Empty, Icon, IconBtn, Kv, Lead, Nil, Ring, Sec } from '../components/hud'
import { useCollection } from '../lib/store'
import { useDeleteCourse } from '../lib/cascade'
import { newId } from '../lib/id'
import { daysBetween, shortDate, today } from '../lib/date'

export function Uni() {
  const courses = useCollection('courses')
  const deleteCourse = useDeleteCourse()
  const [name, setName] = useState('')
  const [ects, setEcts] = useState(5)
  const [examDate, setExamDate] = useState('')
  const todayKey = today()

  const done = courses.items.filter((c) => c.passed)
  const open = courses.items.filter((c) => !c.passed)
  const ectsDone = done.reduce((s, c) => s + c.ects, 0)
  const ectsTotal = courses.items.reduce((s, c) => s + c.ects, 0)
  const graded = done.filter((c) => c.grade !== null)
  // Nach ECTS gewichtet, nicht arithmetisch.
  const avg = graded.length
    ? graded.reduce((s, c) => s + (c.grade as number) * c.ects, 0) / graded.reduce((s, c) => s + c.ects, 0)
    : null

  const exams = open
    .filter((c) => c.examDate)
    .map((c) => ({ course: c, days: daysBetween(todayKey, c.examDate as string) }))
    .filter((x) => x.days >= 0)
    .sort((a, b) => a.days - b.days)
  const next = exams[0] ?? null

  const grade = (g: number | null) => (g === null ? <Nil /> : g.toFixed(1).replace('.', ','))

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return
    await courses.put({
      id: newId(),
      name: clean,
      ects,
      semester: null,
      examDate: examDate || null,
      grade: null,
      passed: false,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setExamDate('')
  }

  return (
    <>
      {/* ── Messwertkopf: Countdown links, Ring direkt daneben, Rest der
             Zeile bewusst leer. Keine Kachelpaarung, keine Zentrierung. ── */}
      <Sec
        title="Uni"
        color="study"
        metaLabel="Schnitt"
        metaValue={avg ? avg.toFixed(2).replace('.', ',') : '–'}
      >
        <div className="head2" style={{ alignItems: 'center', padding: '8px 8px 4px' }}>
          {next && (
            <div
              style={
                next.days <= 14
                  ? { boxShadow: 'inset 2px 0 0 var(--alert)', paddingLeft: 10 }
                  : { paddingLeft: 10 }
              }
            >
              <Lead
                value={next.days}
                unit="T"
                label={`${next.course.name} · ${shortDate(next.course.examDate as string)}`}
                warn={next.days <= 14}
              />
            </div>
          )}
          <Ring
            arcs={[{ value: ectsTotal ? ectsDone / ectsTotal : 0, color: 'study' }]}
            center={
              <div>
                <div className="sec__k">
                  <b>{ectsDone}</b>
                </div>
                <div className="lead__l" style={{ textAlign: 'center' }}>
                  von {ectsTotal}
                </div>
              </div>
            }
          />
        </div>
      </Sec>

      <div className="g12 blk">
        <div className="c12">
          <Sec title="Laufende Kurse" color="study" metaValue={open.length}>
            {open.length === 0 ? (
              <Empty>Keine laufenden Kurse — unten anlegen</Empty>
            ) : (
              <div className="scrollx">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Kurs</th>
                      <th className="num" style={{ width: '7ch' }} data-col="opt">
                        Ects
                      </th>
                      <th className="num" style={{ width: '10ch' }}>
                        Klausur
                      </th>
                      <th className="num" style={{ width: '6ch' }}>
                        Note
                      </th>
                      <th className="act" />
                    </tr>
                  </thead>
                  <tbody>
                    {open.map((c) => {
                      const days = c.examDate ? daysBetween(todayKey, c.examDate) : null
                      const hot = days !== null && days >= 0 && days <= 14
                      return (
                        <tr key={c.id} className={hot ? 'warn' : undefined}>
                          <td>{c.name}</td>
                          <td className="num" data-col="opt">
                            {c.ects}
                          </td>
                          <td className={`num ${hot ? 'warn' : ''}`}>
                            {days === null ? <Nil /> : days < 0 ? 'vorbei' : `${days} T`}
                          </td>
                          <td className="num">
                            <input
                              className="inp inp--num"
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              placeholder="–"
                              inputMode="decimal"
                              aria-label={`Note für ${c.name} eintragen`}
                              style={{ width: '5ch' }}
                              onKeyDown={(e) => {
                                if (e.key !== 'Enter') return
                                const g = Number((e.target as HTMLInputElement).value)
                                if (!g || g < 1 || g > 5) return
                                void courses.put({ ...c, grade: g, passed: g <= 4 })
                              }}
                            />
                          </td>
                          <td className="act">
                            <IconBtn
                              icon="x"
                              label={`${c.name} löschen`}
                              danger
                              onClick={() => void deleteCourse(c.id)}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <Kv label="Note eintragen und Enter" value="gilt als abgeschlossen" />
          </Sec>

          {done.length > 0 && (
            <Sec title="Abgeschlossen" color="habits" grouped metaLabel="Ects" metaValue={ectsDone}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Kurs</th>
                    <th className="num" style={{ width: '7ch' }} data-col="opt">
                      Ects
                    </th>
                    <th className="num" style={{ width: '6ch' }}>
                      Note
                    </th>
                    <th className="act" />
                  </tr>
                </thead>
                <tbody>
                  {done.map((c) => (
                    <tr key={c.id} className={c.grade !== null && c.grade > 4 ? 'warn' : undefined}>
                      <td>{c.name}</td>
                      <td className="num" data-col="opt">
                        {c.ects}
                      </td>
                      <td className="num">{grade(c.grade)}</td>
                      <td className="act">
                        <IconBtn
                          icon="minus"
                          label={`${c.name} wieder öffnen`}
                          onClick={() => void courses.put({ ...c, passed: false, grade: null })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Sec>
          )}

          <Sec title="Neuer Kurs" color="study" grouped>
            <form className="form" onSubmit={add}>
              <label>
                <span className="lbl">Kurs</span>
                <input
                  className="inp"
                  placeholder="z. B. Operations Research"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-label="Name des Kurses"
                  style={{ width: '100%', maxWidth: 380 }}
                />
              </label>
              <div className="form__r">
                <label>
                  <span className="lbl">Ects</span>
                  <input
                    className="inp inp--num"
                    type="number"
                    min={1}
                    max={30}
                    inputMode="numeric"
                    value={ects}
                    onChange={(e) => setEcts(Math.max(1, Number(e.target.value)))}
                    aria-label="ECTS"
                  />
                </label>
                <label>
                  <span className="lbl">Klausur</span>
                  <input
                    className="inp"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    aria-label="Klausurtermin"
                    style={{ width: 150 }}
                  />
                </label>
                <span style={{ flex: 1 }} />
                <Btn kind="pri" type="submit" disabled={!name.trim()}>
                  <Icon name="plus" /> Anlegen
                </Btn>
              </div>
            </form>
          </Sec>
        </div>
      </div>
    </>
  )
}
