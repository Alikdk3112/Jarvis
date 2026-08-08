/* Habits: Wochenraster zum Abhaken, Serien, Anlegen und Löschen. */

import { useState } from 'react'
import { Page } from '../components/Page'
import { DotRow, Empty, GlassTile, Icon, RoundCheck } from '../components/hud'
import { useHabitToggle } from '../features/habits/useHabitToggle'
import { useCockpit } from '../lib/cockpit'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { shortDate, today, weekDays, weekdayShort } from '../lib/date'

export function Habits() {
  const c = useCockpit()
  const habits = useCollection('habits')
  const { toggle, isDone, entries } = useHabitToggle()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(5)
  const week = weekDays()
  const todayKey = today()

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return
    await habits.put({
      id: newId(),
      name: clean,
      color: 'habits',
      targetPerWeek: target,
      sortOrder: c.habits.length,
      archived: false,
      createdAt: new Date().toISOString(),
    })
    setName('')
  }

  const weekCount = (habitId: string) => {
    const set = new Set(week)
    return entries.filter((e) => e.habitId === habitId && set.has(e.date)).length
  }

  return (
    <Page title="HABITS">
      <div className="cols">
        <GlassTile title="Diese Woche" color="habits" meta={`${c.habitsDone} / ${c.habitsTotal} HEUTE`}>
          {c.habits.length === 0 ? (
            <Empty>Noch keine Habits angelegt.</Empty>
          ) : (
            <>
              <div className="row" style={{ borderTop: 0 }}>
                <span className="row__n" />
                {week.map((d) => (
                  <span
                    key={d}
                    className="row__v"
                    style={{ width: 26, textAlign: 'center', color: d === todayKey ? 'var(--habits)' : undefined }}
                  >
                    {weekdayShort(d)}
                  </span>
                ))}
              </div>
              {c.habits.map((h) => (
                <div className="row" key={h.id}>
                  <span className="row__n">{h.name}</span>
                  {week.map((d) => (
                    <span key={d} style={{ width: 26, display: 'grid', placeItems: 'center' }}>
                      <RoundCheck
                        checked={isDone(h.id, d)}
                        onChange={(next) => void toggle(h.id, d, next)}
                        label={`${h.name} am ${shortDate(d)}`}
                      />
                    </span>
                  ))}
                  <span className="row__v">
                    {weekCount(h.id)}/{h.targetPerWeek}
                  </span>
                </div>
              ))}
            </>
          )}
        </GlassTile>

        <GlassTile title="Neuer Habit" color="habits">
          <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <input
              className="inp"
              placeholder="z. B. Sport"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name des Habits"
            />
            <label className="row__v" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              ZIEL / WOCHE
              <input
                className="inp"
                type="number"
                min={1}
                max={7}
                value={target}
                onChange={(e) => setTarget(Math.min(7, Math.max(1, Number(e.target.value))))}
                style={{ width: 80 }}
              />
            </label>
            <button type="submit" className="btn btn--p m-habits" disabled={!name.trim()}>
              Anlegen
            </button>
          </form>

          {c.habits.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div className="row__v" style={{ marginBottom: 8 }}>BESTEHENDE</div>
              {c.habits.map((h) => (
                <div className="row" key={h.id}>
                  <span className="row__n">{h.name}</span>
                  <DotRow filled={weekCount(h.id)} />
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => void habits.remove(h.id)}
                    aria-label={`${h.name} löschen`}
                    style={{ padding: '6px 10px' }}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </GlassTile>
      </div>
    </Page>
  )
}
