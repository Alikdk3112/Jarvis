/* ══════════════════════════════════════════════════════════════════════
   Sport.

   Wichtigste Information: die Minuten dieser Woche gegen die Vorwoche.
   Sport wird nicht pro Einheit bewertet, sondern pro Woche — eine
   einzelne Einheit ist bedeutungslos, die Frage ist immer „bin ich diese
   Woche dran geblieben". Die Differenz ist die Information, nicht der
   Absolutwert.

   Die Satztabelle beantwortet eine andere Frage („was habe ich letztes
   Mal gehoben") und steht deshalb eingerückt unter ihrer Einheit — ohne
   Rahmen, damit sie sich als Fortsetzung liest und nicht als Kasten in
   einer Liste. Die Spalte VOLUMEN (kg × Wdh) ist die eigentliche
   Kennzahl und existierte vorher gar nicht.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react'
import { Bars, Btn, Empty, Icon, IconBtn, Kv, Lead, Nil, Row, Sec } from '../components/hud'
import { useCollection } from '../lib/store'
import { useDeleteWorkout } from '../lib/cascade'
import { newId } from '../lib/id'
import { addDays, lastDays, shortDate, today, weekDays, weekdayShort } from '../lib/date'

export function Sport() {
  const workouts = useCollection('workouts')
  const sets = useCollection('workoutSets')
  const deleteWorkout = useDeleteWorkout()
  const [type, setType] = useState('')
  const [minutes, setMinutes] = useState(45)
  const [date, setDate] = useState(today())
  const [openId, setOpenId] = useState<string | null>(null)
  const [exercise, setExercise] = useState('')
  const [reps, setReps] = useState(8)
  const [weight, setWeight] = useState(60)
  const [limit, setLimit] = useState(40)
  const todayKey = today()

  const sorted = useMemo(
    () => [...workouts.items].sort((a, b) => b.date.localeCompare(a.date)),
    [workouts.items],
  )

  const week = new Set(weekDays())
  const weekMinutes = sorted.filter((w) => week.has(w.date)).reduce((s, w) => s + w.minutes, 0)
  // Vorwoche: dieselben sieben Wochentage, sieben Tage früher.
  const prevWeek = new Set(weekDays(addDays(todayKey, -7)))
  const prevMinutes = sorted.filter((w) => prevWeek.has(w.date)).reduce((s, w) => s + w.minutes, 0)

  const trend = lastDays(14, todayKey).map((d) =>
    workouts.items.filter((w) => w.date === d).reduce((s, w) => s + w.minutes, 0),
  )

  async function addWorkout(e: React.FormEvent) {
    e.preventDefault()
    const clean = type.trim()
    if (!clean) return
    await workouts.put({
      id: newId(),
      date,
      type: clean,
      minutes,
      note: null,
      createdAt: new Date().toISOString(),
    })
    setType('')
  }

  async function addSet(workoutId: string) {
    const clean = exercise.trim()
    if (!clean) return
    const existing = sets.items.filter((s) => s.workoutId === workoutId)
    await sets.put({
      id: newId(),
      workoutId,
      exercise: clean,
      reps,
      weight,
      sortOrder: existing.length,
    })
    setExercise('')
  }

  return (
    <>
      {/* ── Zahl und Kurve auf einer Blickachse, der Rest der Zeile bleibt
             leer. Stärkste Asymmetrie der App, und Absicht. ── */}
      <Sec title="Sport" color="sport" metaLabel="Einheiten" metaValue={sorted.length}>
        <div className="head2" style={{ alignItems: 'flex-end', padding: '8px 8px 4px' }}>
          <div style={{ minWidth: 160 }}>
            <Lead value={weekMinutes} unit="min" label="Diese Woche" />
            <div className="kv" style={{ border: 0, padding: '8px 0 0' }}>
              <em>Vorwoche</em>
              <b>
                {prevMinutes}
                <span className="unit">min</span>
              </b>
            </div>
          </div>
          <div style={{ width: 304, maxWidth: '100%' }}>
            <Bars
              values={trend}
              color="sport"
              firstLabel={shortDate(addDays(todayKey, -13))}
              lastLabel="Heute"
            />
          </div>
        </div>
      </Sec>

      <Sec title="Einheiten" color="sport" grouped>
        {sorted.length === 0 ? (
          <Empty>Keine Einheiten — unten anlegen</Empty>
        ) : (
          <>
            {sorted.slice(0, limit).map((w) => {
              const mySets = sets.items
                .filter((s) => s.workoutId === w.id)
                .sort((a, b) => a.sortOrder - b.sortOrder)
              const isOpen = openId === w.id
              return (
                <div key={w.id}>
                  <Row>
                    <span className="row__m" style={{ width: '9ch' }}>
                      {weekdayShort(w.date)} {shortDate(w.date)}
                    </span>
                    <span className="row__n">{w.type}</span>
                    <span className="row__v">
                      {w.minutes}
                      <span className="unit">min</span>
                    </span>
                    <span className="row__v" style={{ width: '4ch' }}>
                      {mySets.length || <Nil />}
                    </span>
                    <span className="row__a">
                      <IconBtn
                        icon={isOpen ? 'chevronDown' : 'chevron'}
                        label={`Sätze von ${w.type} ${isOpen ? 'schließen' : 'öffnen'}`}
                        onClick={() => setOpenId(isOpen ? null : w.id)}
                      />
                    </span>
                    <span className="row__a">
                      <IconBtn
                        icon="x"
                        label={`${w.type} löschen`}
                        danger
                        onClick={() => void deleteWorkout(w.id)}
                      />
                    </span>
                  </Row>

                  {isOpen && (
                    <div style={{ paddingLeft: 28 }}>
                      <div className="scrollx">
                        <table className="tbl">
                          <thead>
                            <tr>
                              <th>Übung</th>
                              <th className="num" style={{ width: '6ch' }}>
                                Satz
                              </th>
                              <th className="num" style={{ width: '7ch' }}>
                                Kg
                              </th>
                              <th className="num" style={{ width: '6ch' }}>
                                Wdh
                              </th>
                              <th className="num" style={{ width: '9ch' }}>
                                Volumen
                              </th>
                              <th className="act" />
                            </tr>
                          </thead>
                          <tbody>
                            {mySets.map((s, i) => (
                              <tr key={s.id}>
                                <td>{s.exercise}</td>
                                <td className="num">{i + 1}</td>
                                <td className="num">{s.weight}</td>
                                <td className="num">{s.reps}</td>
                                <td className="num">{Math.round(s.weight * s.reps)}</td>
                                <td className="act">
                                  <IconBtn
                                    icon="x"
                                    label={`${s.exercise} löschen`}
                                    danger
                                    onClick={() => void sets.remove(s.id)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="form__r" style={{ padding: '8px 0 12px' }}>
                        <label>
                          <span className="lbl">Übung</span>
                          <input
                            className="inp"
                            placeholder="z. B. Bankdrücken"
                            value={exercise}
                            onChange={(e) => setExercise(e.target.value)}
                            aria-label="Übung"
                          />
                        </label>
                        <label>
                          <span className="lbl">Kg</span>
                          <input
                            className="inp inp--num"
                            type="number"
                            min={0}
                            inputMode="decimal"
                            value={weight}
                            onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                            aria-label="Gewicht"
                          />
                        </label>
                        <label>
                          <span className="lbl">Wdh</span>
                          <input
                            className="inp inp--num"
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={reps}
                            onChange={(e) => setReps(Math.max(0, Number(e.target.value)))}
                            aria-label="Wiederholungen"
                          />
                        </label>
                        <Btn onClick={() => void addSet(w.id)} disabled={!exercise.trim()}>
                          <Icon name="plus" /> Satz
                        </Btn>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            {sorted.length > limit && (
              <div className="row">
                <Btn onClick={() => setLimit(limit + 40)}>+ {sorted.length - limit} ältere anzeigen</Btn>
              </div>
            )}
          </>
        )}
      </Sec>

      <Sec title="Neue Einheit" color="sport" grouped>
        <form className="form" onSubmit={addWorkout}>
          <div className="form__r">
            <label style={{ flex: '1 1 240px' }}>
              <span className="lbl">Art</span>
              <input
                className="inp"
                placeholder="z. B. Push · Bank, Schulter, Trizeps"
                value={type}
                onChange={(e) => setType(e.target.value)}
                aria-label="Art des Trainings"
                style={{ width: '100%' }}
              />
            </label>
            <label>
              <span className="lbl">Minuten</span>
              <input
                className="inp inp--num"
                type="number"
                min={0}
                max={600}
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))}
                aria-label="Dauer in Minuten"
              />
            </label>
            <label>
              <span className="lbl">Datum</span>
              <input
                className="inp"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Datum"
                style={{ width: 150 }}
              />
            </label>
            <Btn kind="pri" type="submit" disabled={!type.trim()}>
              <Icon name="plus" /> Anlegen
            </Btn>
          </div>
        </form>
        <Kv label="Gesamt erfasst" value={workouts.items.length} unit="Einheiten" />
      </Sec>
    </>
  )
}
