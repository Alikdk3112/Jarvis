/* ══════════════════════════════════════════════════════════════════════
   Habits.

   Wichtigste Information: das Wochenraster Habit × Mo–So, und darin die
   Spalte HEUTE. Habits ist keine Lese-, sondern eine Abhak-Ansicht — man
   kommt einmal am Tag, um Häkchen zu setzen, und will im selben Blick
   sehen, ob die Woche hält. Beides steckt in einer Matrix: Zeile ist der
   Habit, Spalte der Tag, Zelle ist Anzeige und Klickziel zugleich.

   Deshalb ist das Raster nicht ein Widget neben anderen, sondern das
   Layout selbst. Die Serie ist die zweite Stimme: Folge des Rasters,
   nicht sein Ersatz. Die Heatmap ist Archiv und sitzt in der schmalen
   Spalte.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react'
import { Btn, Empty, Heatmap, Icon, IconBtn, Kv, Lead, Row, Sec, Seg } from '../components/hud'
import { useHabitToggle } from '../features/habits/useHabitToggle'
import { useCockpit } from '../lib/cockpit'
import { useDeleteHabit } from '../lib/cascade'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { addDays, shortDate, today, weekDays, weekdayShort } from '../lib/date'

const RANGES = [
  { value: '7', label: '7 T' },
  { value: '30', label: '30 T' },
  { value: '140', label: '140 T' },
]

export function Habits() {
  const c = useCockpit()
  const habits = useCollection('habits')
  const deleteHabit = useDeleteHabit()
  const { toggle, isDone, weekCount, entries } = useHabitToggle()
  const [name, setName] = useState('')
  const [target, setTarget] = useState(5)
  const [range, setRange] = useState('140')
  const week = weekDays()
  const todayKey = today()

  const { heat, heatTitles, filled } = useMemo(() => {
    const h = c.heatmap.slice(-Number(range))
    return {
      heat: h,
      heatTitles: h.map((v, i) => `${shortDate(addDays(todayKey, i - h.length + 1))} · ${v}/4`),
      filled: h.filter(Boolean).length,
    }
  }, [c.heatmap, range, todayKey])

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

  async function removeHabit(id: string, habitName: string) {
    const history = entries.filter((e) => e.habitId === id).length
    if (window.confirm(`„${habitName}" löschen — ${history} abgehakte Tage werden mitgelöscht.`)) {
      await deleteHabit(id)
    }
  }

  return (
    <div className="g12">
      {/* ── Die Matrix ist das Layout ── */}
      <div className="c7">
        <Sec title="Woche" color="habits" metaLabel="Heute" metaValue={`${c.habitsDone}/${c.habitsTotal}`}>
          {c.habits.length === 0 ? (
            <Empty>Noch keine Habits — unten anlegen</Empty>
          ) : (
            <div className="wgrid">
              <div className="wgrid__h">
                <span />
                {week.map((d) => (
                  <span key={d} data-today={d === todayKey ? '1' : undefined}>
                    {weekdayShort(d)}
                  </span>
                ))}
                <span />
              </div>
              {c.habits.map((h) => {
                const done = weekCount(h.id)
                return (
                  <div className="wgrid__r" key={h.id}>
                    <span className="wgrid__n">{h.name}</span>
                    {week.map((d) => (
                      <button
                        key={d}
                        type="button"
                        role="checkbox"
                        aria-checked={isDone(h.id, d)}
                        aria-label={`${h.name} am ${shortDate(d)}`}
                        className="wcell"
                        data-today={d === todayKey ? '1' : undefined}
                        disabled={d > todayKey}
                        onClick={() => void toggle(h.id, d, !isDone(h.id, d))}
                      >
                        <Icon name="check" />
                      </button>
                    ))}
                    <span className="row__v" style={done >= h.targetPerWeek ? { color: 'var(--m-habits)' } : undefined}>
                      {done}/{h.targetPerWeek}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Sec>

        {/* Verwaltung getrennt, damit die Abhak-Matrix keine Aktionsspalte
            tragen muss. */}
        <Sec title="Bestand" color="habits" grouped metaValue={c.habits.length}>
          {c.habits.length === 0 ? (
            <Empty>Nichts angelegt</Empty>
          ) : (
            c.habits.map((h) => (
              <Row key={h.id}>
                <span className="row__n">{h.name}</span>
                <span className="row__m">Ziel {h.targetPerWeek} / Woche</span>
                <span className="row__v">{weekCount(h.id)}</span>
                <span className="row__a">
                  <IconBtn
                    icon="x"
                    label={`${h.name} löschen`}
                    danger
                    onClick={() => void removeHabit(h.id, h.name)}
                  />
                </span>
              </Row>
            ))
          )}
        </Sec>
      </div>

      {/* ── Serie, Archiv, Anlegen ── */}
      <div className="c5">
        <Sec title="Serie" color="habits">
          <div style={{ padding: '4px 8px 12px' }}>
            <Lead value={c.streak} unit="T" label="Tage in Folge" />
          </div>
          <Kv label="Beste" value={c.bestStreak} unit="T" />
        </Sec>

        <Sec
          title="Aktivität"
          color="habits"
          grouped
          right={<Seg options={RANGES} value={range} onChange={setRange} ariaLabel="Zeitraum" />}
        >
          <Heatmap values={heat} titles={heatTitles} />
          <Kv label="Erfasst" value={`${filled} / ${heat.length}`} unit="T" />
        </Sec>

        <Sec title="Neuer Habit" color="habits" grouped>
          <form className="form" onSubmit={add}>
            <label>
              <span className="lbl">Name</span>
              <input
                className="inp"
                placeholder="z. B. Sport"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Name des Habits"
                style={{ width: '100%' }}
              />
            </label>
            <div className="form__r">
              <div>
                <span className="lbl">Ziel / Woche</span>
                <Seg
                  options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: String(n) }))}
                  value={String(target)}
                  onChange={(v) => setTarget(Number(v))}
                  ariaLabel="Wochenziel"
                />
              </div>
              <span style={{ flex: 1 }} />
              <Btn kind="pri" type="submit" disabled={!name.trim()}>
                Anlegen
              </Btn>
            </div>
          </form>
        </Sec>
      </div>
    </div>
  )
}
