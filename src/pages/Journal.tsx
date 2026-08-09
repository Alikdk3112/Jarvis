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

  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const touched = useRef(false)

  /* Den gespeicherten Text übernehmen, solange niemand getippt hat.

     Vorher lief das über ein „genau einmal"-Merkmal. Das ging schief, wenn
     die Abfrage länger brauchte als der erste Tastendruck: Man öffnet das
     Journal auf dem Handy, fängt sofort an zu schreiben, die Antwort aus
     Supabase trifft eine Sekunde später ein — und überschreibt das
     Getippte. `touched` schließt genau das aus. */
  useEffect(() => {
    if (!touched.current && todayEntry && todayEntry.body !== draft) setDraft(todayEntry.body)
  }, [todayEntry, draft])

  /* Entprellt speichern, eine Sekunde nach der letzten Eingabe.

     Die Speicherfunktion liegt in einem Ref, weil `journal` bei jedem
     Rendern ein neues Objekt ist. Stand es in der Abhängigkeitsliste, wurde
     der Zeitgeber bei jedem Rendern verworfen und neu gestellt — und nach
     dem Speichern lief er ein zweites Mal los, weil die frisch geladenen
     Daten erst eine Rundreise später ankamen. */
  const saveRef = useRef<(text: string) => void>(() => {})
  saveRef.current = (text: string) => {
    const stamp = new Date().toISOString()
    void journal
      .put(
        todayEntry
          ? { ...todayEntry, body: text, updatedAt: stamp }
          : { id: newId(), date: todayKey, body: text, createdAt: stamp, updatedAt: stamp },
      )
      .then(() => {
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1600)
      })
  }

  const lastSaved = useRef<string | null>(null)

  useEffect(() => {
    if (!touched.current) return
    // Nichts schreiben, was schon so dasteht — weder in der Datenbank noch
    // im letzten abgeschickten Stand.
    if (draft === (todayEntry?.body ?? '') || draft === lastSaved.current) return
    const id = window.setTimeout(() => {
      lastSaved.current = draft
      saveRef.current(draft)
    }, 1000)
    return () => window.clearTimeout(id)
  }, [draft, todayEntry])

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
            onChange={(e) => {
              touched.current = true
              setDraft(e.target.value)
            }}
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
