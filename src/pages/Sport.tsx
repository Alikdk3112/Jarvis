/* Sport: Trainingseinheiten mit Sätzen, Wochenvolumen und Verlauf. */

import { useMemo, useState } from 'react'
import { Page } from '../components/Page'
import { Empty, GlassTile, Icon, Pill, Sparkline } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { addDays, lastDays, shortDate, today, weekDays, weekdayShort } from '../lib/date'

export function Sport() {
  const workouts = useCollection('workouts')
  const sets = useCollection('workoutSets')
  const [type, setType] = useState('')
  const [minutes, setMinutes] = useState(45)
  const [date, setDate] = useState(today())
  const [openId, setOpenId] = useState<string | null>(null)
  const [exercise, setExercise] = useState('')
  const [reps, setReps] = useState(8)
  const [weight, setWeight] = useState(60)

  const sorted = useMemo(
    () => [...workouts.items].sort((a, b) => b.date.localeCompare(a.date)),
    [workouts.items],
  )
  const week = new Set(weekDays())
  const thisWeek = sorted.filter((w) => week.has(w.date))
  const weekMinutes = thisWeek.reduce((s, w) => s + w.minutes, 0)

  const trend = lastDays(14).map((d) =>
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
    <Page title="SPORT">
      <div className="strip" style={{ justifyContent: 'flex-start' }}>
        <Pill label="Diese Woche" value={`${thisWeek.length} Einheiten`} color="sport" />
        <Pill label="Volumen" value={`${weekMinutes} min`} color="sport" />
        <Pill label="Gesamt" value={workouts.items.length} />
      </div>

      <div className="cols">
        <GlassTile title="Neue Einheit" color="sport">
          <form onSubmit={addWorkout} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              className="inp"
              placeholder="z. B. Push · Bank, Schulter, Trizeps"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Art des Trainings"
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="inp"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Datum"
                style={{ width: 168 }}
              />
              <input
                className="inp"
                type="number"
                min={1}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(1, Number(e.target.value)))}
                aria-label="Minuten"
                style={{ width: 100 }}
              />
              <button type="submit" className="btn btn--p m-sport" disabled={!type.trim()}>
                <Icon name="plus" /> Anlegen
              </button>
            </div>
          </form>
        </GlassTile>

        <GlassTile title="Volumen · 14 Tage" color="sport" meta={`${weekMinutes} MIN / WOCHE`}>
          <Sparkline
            values={trend}
            color="sport"
            firstLabel={shortDate(addDays(today(), -13))}
            lastLabel={shortDate(today())}
          />
        </GlassTile>
      </div>

      <GlassTile title="Einheiten" color="sport" meta={`${sorted.length}`}>
        {sorted.length === 0 ? (
          <Empty>Noch keine Einheiten erfasst.</Empty>
        ) : (
          sorted.slice(0, 40).map((w) => {
            const mySets = sets.items
              .filter((s) => s.workoutId === w.id)
              .sort((a, b) => a.sortOrder - b.sortOrder)
            const isOpen = openId === w.id
            return (
              <div key={w.id} style={{ borderTop: '1px solid var(--hairline)', paddingTop: 8, marginTop: 8 }}>
                <div className="row" style={{ borderTop: 0, paddingTop: 0 }}>
                  <span className="row__v" style={{ width: 34 }}>{weekdayShort(w.date)}</span>
                  <span className="row__n">{w.type}</span>
                  <span className="row__v">
                    <b>{w.minutes}</b> MIN
                  </span>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => setOpenId(isOpen ? null : w.id)}
                    aria-expanded={isOpen}
                  >
                    {mySets.length ? `${mySets.length} Sätze` : 'Sätze'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--sm"
                    style={{ padding: '6px 10px' }}
                    onClick={() => void workouts.remove(w.id)}
                    aria-label={`${w.type} löschen`}
                  >
                    <Icon name="trash" />
                  </button>
                </div>

                {isOpen && (
                  <div style={{ paddingLeft: 44, paddingBottom: 8 }}>
                    {mySets.map((s) => (
                      <div className="row" key={s.id}>
                        <span className="row__n">{s.exercise}</span>
                        <span className="row__v">
                          {s.reps} × <b>{s.weight}</b> KG
                        </span>
                        <button
                          type="button"
                          className="btn btn--sm"
                          style={{ padding: '6px 10px' }}
                          onClick={() => void sets.remove(s.id)}
                          aria-label={`${s.exercise} löschen`}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      <input
                        className="inp"
                        placeholder="Übung"
                        value={exercise}
                        onChange={(e) => setExercise(e.target.value)}
                        aria-label="Übung"
                        style={{ flex: '1 1 160px' }}
                      />
                      <input
                        className="inp"
                        type="number"
                        min={1}
                        value={reps}
                        onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
                        aria-label="Wiederholungen"
                        style={{ width: 84 }}
                      />
                      <input
                        className="inp"
                        type="number"
                        min={0}
                        value={weight}
                        onChange={(e) => setWeight(Math.max(0, Number(e.target.value)))}
                        aria-label="Gewicht in Kilogramm"
                        style={{ width: 92 }}
                      />
                      <button
                        type="button"
                        className="btn btn--p m-sport"
                        onClick={() => void addSet(w.id)}
                        disabled={!exercise.trim()}
                      >
                        Satz
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </GlassTile>
    </Page>
  )
}
