/* ══════════════════════════════════════════════════════════════════════
   Goals.

   Wichtigste Information: der Abstand zwischen Fortschritt und
   verbleibender Zeit — pro Ziel, in einer Zeile. „62 % erreicht" ist gut
   bei 90 Tagen Restzeit und schlecht bei 9.

   Die Gestaltungsaufgabe ist deshalb nicht, Fortschritt zu zeigen,
   sondern Fortschritt und Restzeit auf eine Blickachse zu bringen: alle
   Prozentwerte untereinander, alle Restzeiten untereinander. Die alte
   Fassung brauchte 90px je Ziel und machte genau das unmöglich.

   Die Zielmarke im Balken (1px, --ink-450) zeigt, wo man bei linearem
   Verlauf heute stehen müsste. Sie bewertet nicht, sie lässt bewerten —
   und ersetzt jede Ampelfarbe.
   ══════════════════════════════════════════════════════════════════════ */

import { useRef, useState } from 'react'
import { Btn, Empty, Icon, IconBtn, Lead, Nil, PBar, Row, Sec, Seg } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { daysBetween, shortDate, today } from '../lib/date'
import type { DateKey, Goal } from '../lib/data/types'

/** Wo man bei linearem Verlauf heute stehen müsste — nur sinnvoll, wenn
 *  es eine Frist gibt. */
function targetPct(g: Goal, todayKey: DateKey): number | null {
  if (!g.targetDate) return null
  const total = daysBetween(g.createdAt.slice(0, 10), g.targetDate)
  if (total <= 0) return null
  const passed = daysBetween(g.createdAt.slice(0, 10), todayKey)
  return Math.max(0, Math.min(100, (passed / total) * 100))
}

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
  const [editing, setEditing] = useState(false)
  const dragging = useRef(false)

  const lastSeen = useRef(goal.progress)
  if (lastSeen.current !== goal.progress) {
    lastSeen.current = goal.progress
    if (!dragging.current && value !== goal.progress) setValue(goal.progress)
  }

  /* Geschrieben wird beim Loslassen, nicht bei jedem Schritt. Ein Zug von
     0 auf 100 löste vorher 41 Schreibvorgänge aus — gemessen. */
  const commit = () => {
    dragging.current = false
    setEditing(false)
    if (value !== goal.progress) onSave({ progress: value })
  }

  const days = goal.targetDate ? daysBetween(todayKey, goal.targetDate) : null
  const over = days !== null && days < 0

  return (
    <Row warn={over}>
      <span className="row__n" style={{ maxWidth: '32ch' }}>
        {goal.title}
      </span>

      {/* Der Regler ersetzt den Balken an derselben Stelle, statt als
          zweites Bedienelement daneben zu stehen. */}
      {editing ? (
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          autoFocus
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
          style={{ flex: 1, minWidth: 60, accentColor: 'var(--m-goals)' }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Fortschritt für ${goal.title} ändern`}
          style={{ flex: 1, minWidth: 60, border: 0, background: 'transparent', padding: 0, cursor: 'pointer' }}
        >
          <PBar value={value} target={targetPct(goal, todayKey)} color="goals" />
        </button>
      )}

      <span className="row__v" style={{ width: '5ch' }}>
        {value} %
      </span>
      <span className={`row__m ${over ? 'row__v--warn' : ''}`} style={{ width: '6ch', textAlign: 'right' }}>
        {days === null ? <Nil /> : `${days} T`}
      </span>
      <span className="row__a">
        <IconBtn icon="check" label={`${goal.title} erreicht`} onClick={() => onSave({ status: 'done', progress: 100 })} />
      </span>
      <span className="row__a">
        <IconBtn icon="x" label={`${goal.title} löschen`} danger onClick={onRemove} />
      </span>
    </Row>
  )
}

const FILTERS = [
  { value: 'active', label: 'Aktiv' },
  { value: 'done', label: 'Erreicht' },
  { value: 'dropped', label: 'Verworfen' },
]

export function Goals() {
  const goals = useCollection('goals')
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [filter, setFilter] = useState('active')
  const todayKey = today()

  const active = goals.items.filter((g) => g.status === 'active')
  const shown = goals.items.filter((g) => g.status === filter)
  const next = active
    .filter((g) => g.targetDate)
    .map((g) => ({ g, days: daysBetween(todayKey, g.targetDate as string) }))
    .sort((a, b) => a.days - b.days)[0]

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
    <>
      <Sec
        title="Goals"
        color="goals"
        metaLabel="Aktiv"
        metaValue={active.length}
        right={<Seg options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filter" />}
      >
        {next && (
          <div
            style={
              next.days <= 14
                ? { boxShadow: 'inset 2px 0 0 var(--alert)', padding: '4px 0 12px 10px' }
                : { padding: '4px 0 12px 10px' }
            }
          >
            <Lead
              value={next.days}
              unit="T"
              label={`${next.g.title} · ${shortDate(next.g.targetDate as string)}`}
              warn={next.days <= 14}
            />
          </div>
        )}

        {/* Volle Inhaltsbreite, keine 7/5-Teilung: der Balken braucht
            Länge. Bei 120px zeigt 1 % nur 1,2px und damit gar nichts. */}
        {shown.length === 0 ? (
          <Empty>
            {filter === 'active' ? 'Keine aktiven Ziele — unten anlegen' : 'Nichts in dieser Gruppe'}
          </Empty>
        ) : filter === 'active' ? (
          shown.map((g) => (
            <GoalRow
              key={g.id}
              goal={g}
              todayKey={todayKey}
              onSave={(patch) => void goals.put({ ...g, ...patch })}
              onRemove={() => void goals.remove(g.id)}
            />
          ))
        ) : (
          shown.map((g) => (
            <Row key={g.id} done>
              <span className="row__n">{g.title}</span>
              <span className="row__m">{g.targetDate ? shortDate(g.targetDate) : <Nil />}</span>
              <span className="row__v">{g.progress} %</span>
              <span className="row__a">
                <IconBtn
                  icon="minus"
                  label={`${g.title} wieder aktivieren`}
                  onClick={() => void goals.put({ ...g, status: 'active' })}
                />
              </span>
              <span className="row__a">
                <IconBtn icon="x" label={`${g.title} löschen`} danger onClick={() => void goals.remove(g.id)} />
              </span>
            </Row>
          ))
        )}
      </Sec>

      <Sec title="Neues Ziel" color="goals" grouped>
        <form className="form" onSubmit={add}>
          <div className="form__r">
            <label style={{ flex: '1 1 260px' }}>
              <span className="lbl">Ziel</span>
              <input
                className="inp"
                placeholder="z. B. Klausur OR bestehen"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Titel des Ziels"
                style={{ width: '100%' }}
              />
            </label>
            <label>
              <span className="lbl">Zieldatum</span>
              <input
                className="inp"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                aria-label="Zieldatum"
                style={{ width: 150 }}
              />
            </label>
            <Btn kind="pri" type="submit" disabled={!title.trim()}>
              <Icon name="plus" /> Anlegen
            </Btn>
          </div>
        </form>
      </Sec>
    </>
  )
}
