/* Ziele mit Zieldatum, Countdown und Fortschritt. */

import { useRef, useState } from 'react'
import { Page } from '../components/Page'
import { Empty, GlassTile, Icon } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { daysBetween, shortDate, today } from '../lib/date'
import type { DateKey, Goal } from '../lib/data/types'

/* Eine Zielzeile. Zusammengefasst, weil Balken, Prozentzahl und Regler
   denselben Wert zeigen müssen — auch während gezogen wird.

   Der Regler war die teuerste Stelle der ganzen App: `onChange` feuert
   während des Ziehens bei jedem einzelnen Schritt. Ein Zug von 0 auf 100
   löste bis zu hundert Schreibvorgänge aus — mit Supabase hundert Anfragen
   übers Netz, jede davon ein Upsert samt anschließendem Neuladen der
   Sammlung. Jetzt zieht die Anzeige örtlich mit und geschrieben wird
   einmal, wenn der Finger loslässt. */
function GoalRow({
  goal,
  todayKey,
  onSave,
  onRemove,
}: {
  goal: Goal
  todayKey: DateKey
  onSave: (patch: Partial<Goal>) => void
  onRemove: () => void
}) {
  const [value, setValue] = useState(goal.progress)
  const dragging = useRef(false)

  // Änderungen von außen übernehmen, solange gerade niemand zieht.
  const lastSeen = useRef(goal.progress)
  if (lastSeen.current !== goal.progress) {
    lastSeen.current = goal.progress
    if (!dragging.current && value !== goal.progress) setValue(goal.progress)
  }

  const commit = () => {
    dragging.current = false
    if (value !== goal.progress) onSave({ progress: value })
  }

  const days = goal.targetDate ? daysBetween(todayKey, goal.targetDate) : null

  return (
    <div className="goal">
      <div className="goal__h">
        <span className="goal__t">{goal.title}</span>
        <span className={`goal__d ${days !== null && days <= 14 ? 'hot' : ''}`}>
          {days === null
            ? 'LAUFEND'
            : days < 0
              ? `SEIT ${Math.abs(days)} T ÜBERFÄLLIG`
              : `${days} T · ${shortDate(goal.targetDate as string)}`}
        </span>
      </div>
      <div className="pbar">
        <i style={{ width: `${value}%` }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onPointerDown={() => (dragging.current = true)}
          onChange={(e) => {
            dragging.current = true
            setValue(Number(e.target.value))
          }}
          onPointerUp={commit}
          onPointerCancel={commit}
          onKeyUp={commit}
          onBlur={commit}
          aria-label={`Fortschritt für ${goal.title}`}
          style={{ flex: 1, accentColor: 'var(--goals)' }}
        />
        <span className="row__v" style={{ width: 44, textAlign: 'right' }}>
          {value} %
        </span>
        <button
          type="button"
          className="btn btn--sm"
          onClick={() => onSave({ status: 'done', progress: 100 })}
        >
          Erreicht
        </button>
        <button
          type="button"
          className="btn btn--sm"
          style={{ padding: '6px 10px' }}
          onClick={onRemove}
          aria-label={`${goal.title} löschen`}
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  )
}

export function Goals() {
  const goals = useCollection('goals')
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const todayKey = today()

  const active = goals.items.filter((g) => g.status === 'active')
  const finished = goals.items.filter((g) => g.status !== 'active')

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const clean = title.trim()
    if (!clean) return
    await goals.put({
      id: newId(),
      title: clean,
      description: null,
      targetDate: targetDate || null,
      progress: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    setTitle('')
    setTargetDate('')
  }

  return (
    <Page title="GOALS">
      <GlassTile title="Neues Ziel" color="goals">
        <form onSubmit={add} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            className="inp"
            placeholder="z. B. Klausur OR bestehen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Titel des Ziels"
            style={{ flex: '1 1 260px' }}
          />
          <input
            className="inp"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            aria-label="Zieldatum"
            style={{ width: 168 }}
          />
          <button type="submit" className="btn btn--p m-goals" disabled={!title.trim()}>
            <Icon name="plus" /> Anlegen
          </button>
        </form>
      </GlassTile>

      <GlassTile title="Aktiv" color="goals" meta={`${active.length}`}>
        {active.length === 0 ? (
          <Empty>Keine aktiven Ziele.</Empty>
        ) : (
          active.map((g) => (
            <GoalRow
              key={g.id}
              goal={g}
              todayKey={todayKey}
              onSave={(patch) => void goals.put({ ...g, ...patch })}
              onRemove={() => void goals.remove(g.id)}
            />
          ))
        )}
      </GlassTile>

      {finished.length > 0 && (
        <GlassTile title="Abgeschlossen" color="habits" meta={`${finished.length}`}>
          {finished.map((g) => (
            <div className="row" key={g.id}>
              <span className="row__n">{g.title}</span>
              <span className="chipx" style={{ color: g.status === 'done' ? 'var(--habits)' : 'var(--dimmer)' }}>
                {g.status === 'done' ? 'ERREICHT' : 'VERWORFEN'}
              </span>
              <button
                type="button"
                className="btn btn--sm"
                style={{ padding: '6px 10px' }}
                onClick={() => void goals.remove(g.id)}
                aria-label={`${g.title} löschen`}
              >
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </GlassTile>
      )}
    </Page>
  )
}
