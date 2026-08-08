/* Journal: genau ein Eintrag pro Tag, chronologisch. Der heutige Eintrag
   ist immer offen und speichert beim Tippen — kein „Speichern"-Knopf, den
   man abends vergisst. */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Page } from '../components/Page'
import { Empty, GlassTile, Icon } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { longDate, shortDate, today, weekdayLong } from '../lib/date'

export function Journal() {
  const journal = useCollection('journal')
  const todayKey = today()
  const entries = useMemo(
    () => [...journal.items].sort((a, b) => b.date.localeCompare(a.date)),
    [journal.items],
  )
  const todayEntry = entries.find((e) => e.date === todayKey)

  const [draft, setDraft] = useState(todayEntry?.body ?? '')
  const [saved, setSaved] = useState(false)
  const loaded = useRef(false)

  // Vorhandenen Text genau einmal übernehmen, danach gehört das Feld dem Nutzer
  useEffect(() => {
    if (!loaded.current && todayEntry) {
      setDraft(todayEntry.body)
      loaded.current = true
    }
  }, [todayEntry])

  // Entprellt speichern — eine Sekunde nach der letzten Eingabe
  useEffect(() => {
    if (draft === (todayEntry?.body ?? '')) return
    const id = window.setTimeout(() => {
      const stamp = new Date().toISOString()
      void journal
        .put(
          todayEntry
            ? { ...todayEntry, body: draft, updatedAt: stamp }
            : { id: newId(), date: todayKey, body: draft, createdAt: stamp, updatedAt: stamp },
        )
        .then(() => {
          setSaved(true)
          window.setTimeout(() => setSaved(false), 1600)
        })
    }, 1000)
    return () => window.clearTimeout(id)
  }, [draft, todayEntry, journal, todayKey])

  return (
    <Page title="JOURNAL">
      <div className="cols">
        <GlassTile
          title={`Heute · ${weekdayLong(todayKey)}`}
          color="journal"
          meta={saved ? 'GESPEICHERT' : longDate(todayKey)}
        >
          <textarea
            className="inp"
            style={{ minHeight: 220 }}
            placeholder="Wie war der Tag?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Journaleintrag für heute"
          />
          <p className="row__v" style={{ marginTop: 10 }}>
            SPEICHERT AUTOMATISCH
          </p>
        </GlassTile>

        <GlassTile title="Zeitleiste" color="journal" meta={`${entries.length} EINTRÄGE`}>
          {entries.filter((e) => e.date !== todayKey).length === 0 ? (
            <Empty>Noch keine früheren Einträge.</Empty>
          ) : (
            entries
              .filter((e) => e.date !== todayKey)
              .slice(0, 40)
              .map((e) => (
                <div className="tsk" key={e.id}>
                  <div className="tsk__b">
                    <div
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 9.5,
                        letterSpacing: '.16em',
                        color: 'var(--journal)',
                        marginBottom: 5,
                      }}
                    >
                      {shortDate(e.date)} · {weekdayLong(e.date)}
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{e.body}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm"
                    style={{ padding: '6px 10px' }}
                    onClick={() => void journal.remove(e.id)}
                    aria-label={`Eintrag vom ${shortDate(e.date)} löschen`}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              ))
          )}
        </GlassTile>
      </div>
    </Page>
  )
}
