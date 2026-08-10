/* ══════════════════════════════════════════════════════════════════════
   Journal.

   Wichtigste Information: das Textfeld für heute. Journal ist die einzige
   Ansicht, deren Zweck ein Eingabefeld ist — man kommt her, um zu
   schreiben, nicht um zu lesen. Also ist das Feld nicht ein Widget im
   Layout, sondern das Layout: Zeile 2, volle Lesebreite von 68ch.

   Die Zeitleiste ist Archiv und zeigt nur Datum, Länge und Anriss. Der
   Entwurf sah dort eine Spalte „Stimmung" vor — die gibt es im
   Datenmodell nicht, und ein Halbsatz sagt über einen Tag mehr als eine
   Fünf-Stufen-Skala.
   ══════════════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Btn, Empty, IconBtn, Nil, Sec, Status } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { shortDate, today, weekdayLong } from '../lib/date'

export function Journal() {
  const journal = useCollection('journal')
  const todayKey = today()
  const entries = useMemo(
    () => [...journal.items].sort((a, b) => b.date.localeCompare(a.date)),
    [journal.items],
  )
  const todayEntry = entries.find((e) => e.date === todayKey)
  const past = entries.filter((e) => e.date !== todayKey)

  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(60)
  const touched = useRef(false)

  /* Den gespeicherten Text übernehmen, solange niemand getippt hat.
     Ab dem ersten Tastendruck gehört das Feld dem Nutzer — sonst
     überschreibt eine langsame Antwort das Getippte. */
  useEffect(() => {
    if (!touched.current && todayEntry && todayEntry.body !== draft) setDraft(todayEntry.body)
  }, [todayEntry, draft])

  const saveRef = useRef<(text: string) => void>(() => {})
  saveRef.current = (text: string) => {
    const stamp = new Date().toISOString()
    setSaving(true)
    void journal
      .put(
        todayEntry
          ? { ...todayEntry, body: text, updatedAt: stamp }
          : { id: newId(), date: todayKey, body: text, createdAt: stamp, updatedAt: stamp },
      )
      .then(() => {
        setSaving(false)
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1600)
      })
      .catch(() => setSaving(false))
  }

  const lastSaved = useRef<string | null>(null)

  /* `journal` ist bei jedem Rendern ein neues Objekt — stünde es in der
     Abhängigkeitsliste, würde der Zeitgeber bei jedem Rendern neu
     gestellt und nie feuern. Deshalb liegt die Schreibfunktion im Ref. */
  useEffect(() => {
    if (!touched.current) return
    if (draft === (todayEntry?.body ?? '') || draft === lastSaved.current) return
    const id = window.setTimeout(() => {
      lastSaved.current = draft
      saveRef.current(draft)
    }, 1000)
    return () => window.clearTimeout(id)
  }, [draft, todayEntry])

  const found = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return past
    return past.filter((e) => e.body.toLowerCase().includes(q))
  }, [past, search])

  return (
    <div className="g12">
      {/* ── Die Schreibfläche nutzt von sieben Spalten nur 68ch. Der leere
             Rest markiert, dass hier Text steht und keine Daten. ── */}
      <div className="c7">
        <Sec
          title={`Heute · ${weekdayLong(todayKey)}`}
          color="journal"
          right={
            saving ? (
              <Status on={false} label="Speichert" color="journal" />
            ) : saved ? (
              <Status on label="Gespeichert" color="habits" />
            ) : undefined
          }
        >
          <textarea
            className="inp"
            style={{ width: '100%', minHeight: 160, maxHeight: 320 }}
            placeholder={journal.isLoading ? 'LADEN' : 'Wie war der Tag?'}
            disabled={journal.isLoading}
            value={draft}
            onChange={(e) => {
              touched.current = true
              setDraft(e.target.value)
            }}
            aria-label="Journaleintrag für heute"
          />
          {draft.length >= 500 && (
            <div className="axis">
              <span />
              <span>{draft.length} Zeichen</span>
            </div>
          )}
        </Sec>
      </div>

      {/* ── Zeitleiste: eine Tabelle zeigt zwanzig Tage auf einmal, wo
             Karten drei zeigten ── */}
      <div className="c5">
        <Sec title="Zeitleiste" color="journal" metaLabel="Einträge" metaValue={entries.length}>
          <div style={{ marginBottom: 8 }}>
            <input
              className="inp"
              placeholder="Durchsuchen"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Einträge durchsuchen"
              style={{ width: '100%' }}
            />
          </div>

          {found.length === 0 ? (
            <Empty>{search ? `Nichts gefunden für „${search}"` : 'Noch keine früheren Einträge'}</Empty>
          ) : (
            <>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: '11ch' }}>Datum</th>
                    <th className="num" style={{ width: '8ch' }} data-col="opt">
                      Länge
                    </th>
                    <th>Anriss</th>
                    <th className="act" />
                  </tr>
                </thead>
                <tbody>
                  {found.slice(0, limit).map((e) => (
                    <tr key={e.id}>
                      <td className="met">{shortDate(e.date)}</td>
                      <td className="num" data-col="opt">
                        {e.body.length || <Nil />}
                      </td>
                      <td>{e.body.split('\n')[0] || <Nil />}</td>
                      <td className="act">
                        <IconBtn
                          icon="x"
                          label={`Eintrag vom ${shortDate(e.date)} löschen`}
                          danger
                          onClick={() => void journal.remove(e.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {found.length > limit && (
                <div className="row">
                  <Btn onClick={() => setLimit(limit + 60)}>+ {found.length - limit} ältere anzeigen</Btn>
                </div>
              )}
            </>
          )}
        </Sec>
      </div>
    </div>
  )
}
