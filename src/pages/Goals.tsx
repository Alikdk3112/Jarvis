/* Ziele mit Zieldatum, Countdown und Fortschritt. */

import { useState } from 'react'
import { Page } from '../components/Page'
import { Empty, GlassTile, Icon } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { daysBetween, shortDate, today } from '../lib/date'

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
          active.map((g) => {
            const days = g.targetDate ? daysBetween(todayKey, g.targetDate) : null
            return (
              <div className="goal" key={g.id}>
                <div className="goal__h">
                  <span className="goal__t">{g.title}</span>
                  <span className={`goal__d ${days !== null && days <= 14 ? 'hot' : ''}`}>
                    {days === null
                      ? 'LAUFEND'
                      : days < 0
                        ? `SEIT ${Math.abs(days)} T ÜBERFÄLLIG`
                        : `${days} T · ${shortDate(g.targetDate as string)}`}
                  </span>
                </div>
                <div className="pbar">
                  <i style={{ width: `${g.progress}%` }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={g.progress}
                    onChange={(e) => void goals.put({ ...g, progress: Number(e.target.value) })}
                    aria-label={`Fortschritt für ${g.title}`}
                    style={{ flex: 1, accentColor: 'var(--goals)' }}
                  />
                  <span className="row__v" style={{ width: 44, textAlign: 'right' }}>
                    {g.progress} %
                  </span>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => void goals.put({ ...g, status: 'done', progress: 100 })}
                  >
                    Erreicht
                  </button>
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
              </div>
            )
          })
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
