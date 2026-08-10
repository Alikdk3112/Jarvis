/* ══════════════════════════════════════════════════════════════════════
   Tasks & Notes.

   Wichtigste Information: was heute oder schon vorher fällig war — die
   obersten Zeilen der offenen Liste. Die Sortierung ist die eigentliche
   Gestaltung dieser Seite: überfällig, heute, morgen, diese Woche,
   später, ohne Frist. Wer richtig sortiert, braucht keine Hervorhebung —
   die Reihenfolge IST die Priorität.

   Zwei Bewohner, die nichts miteinander zu tun haben: Aufgaben haben eine
   Frist, Notizen nicht. Deshalb 32px Abstand statt einer Panelgruppe.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo, useState } from 'react'
import { Btn, Check, Chip, Empty, Icon, IconBtn, Nil, Row, Sec, Seg } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { shortDate, today } from '../lib/date'
import { dueLabel } from '../lib/due'
import { TAG_COLOR, type TaskTag } from '../lib/data/types'

const TAGS = [
  { value: 'none', label: 'Ohne' },
  { value: 'uni', label: 'Uni' },
  { value: 'sport', label: 'Sport' },
  { value: 'jarvis', label: 'Jarvis' },
  { value: 'privat', label: 'Privat' },
]

export function Tasks() {
  const tasks = useCollection('tasks')
  const notes = useCollection('notes')
  const todayKey = today()

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tag, setTag] = useState('none')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [search, setSearch] = useState('')
  const [limit, setLimit] = useState(50)

  const open = useMemo(
    () =>
      tasks.items
        .filter((t) => !t.done)
        .sort((a, b) => (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999')),
    [tasks.items],
  )
  const done = useMemo(
    () =>
      tasks.items
        .filter((t) => t.done)
        .sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? '')),
    [tasks.items],
  )
  const foundNotes = useMemo(() => {
    const q = search.trim().toLowerCase()
    const sorted = [...notes.items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    if (!q) return sorted
    return sorted.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(q))
  }, [notes.items, search])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    const clean = title.trim()
    if (!clean) return
    await tasks.put({
      id: newId(),
      title: clean,
      notes: null,
      dueAt: dueDate ? `${dueDate}T12:00` : null,
      tag: tag === 'none' ? null : (tag as NonNullable<TaskTag>),
      done: false,
      doneAt: null,
      createdAt: new Date().toISOString(),
    })
    setTitle('')
    setDueDate('')
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    const body = noteBody.trim()
    if (!body) return
    const stamp = new Date().toISOString()
    await notes.put({
      id: newId(),
      title: noteTitle.trim() || body.slice(0, 40),
      body,
      tags: [],
      createdAt: stamp,
      updatedAt: stamp,
    })
    setNoteTitle('')
    setNoteBody('')
  }

  return (
    <div className="g12">
      {/* ── Aufgaben: die Anlege-Zeile steht ÜBER der Liste, damit der
             Leerzustand ein Arbeitszustand ist ── */}
      <div className="c7">
        <Sec title="Tasks" color="tasks" metaLabel="Offen" metaValue={open.length}>
          <form className="form" onSubmit={addTask} style={{ marginBottom: 12 }}>
            <input
              className="inp"
              placeholder="Neue Aufgabe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Titel der Aufgabe"
            />
            <div className="form__r">
              <label>
                <span className="lbl">Fällig</span>
                <input
                  className="inp"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  aria-label="Fällig am"
                  style={{ width: 150 }}
                />
              </label>
              <div>
                <span className="lbl">Bereich</span>
                <Seg options={TAGS} value={tag} onChange={setTag} ariaLabel="Bereich" />
              </div>
              <span style={{ flex: 1 }} />
              <Btn kind="pri" type="submit" disabled={!title.trim()}>
                <Icon name="plus" /> Anlegen
              </Btn>
            </div>
          </form>

          {open.length === 0 ? (
            <Empty>Keine Aufgaben — oben anlegen</Empty>
          ) : (
            open.map((t) => {
              const d = dueLabel(t, todayKey)
              return (
                <Row key={t.id} warn={d?.overdue}>
                  <Check
                    checked={false}
                    label={t.title}
                    onChange={() => void tasks.put({ ...t, done: true, doneAt: new Date().toISOString() })}
                  />
                  <span className="row__n">{t.title}</span>
                  {t.tag && <Chip color={TAG_COLOR[t.tag]}>{t.tag}</Chip>}
                  <span className={`row__m ${d?.overdue ? 'row__v--warn' : ''}`}>
                    {d ? d.text : <Nil />}
                  </span>
                  <span className="row__a">
                    <IconBtn icon="x" label={`${t.title} löschen`} danger onClick={() => void tasks.remove(t.id)} />
                  </span>
                </Row>
              )
            })
          )}
        </Sec>

        {/* Eigene Sektion statt Ausklapper: ein Ausklapper versteckt
            Zustand hinter Interaktion, eine Sektion zeigt ihn für 22px. */}
        <Sec title="Erledigt" color="tasks" grouped metaValue={done.length}>
          {done.length === 0 ? (
            <Empty>Noch nichts abgehakt</Empty>
          ) : (
            <>
              {done.slice(0, limit).map((t) => (
                <Row key={t.id} done>
                  <Check
                    checked
                    label={t.title}
                    onChange={() => void tasks.put({ ...t, done: false, doneAt: null })}
                  />
                  <span className="row__n">{t.title}</span>
                  {t.tag && <Chip color={TAG_COLOR[t.tag]}>{t.tag}</Chip>}
                  <span className="row__m">{t.doneAt ? shortDate(t.doneAt.slice(0, 10)) : <Nil />}</span>
                  <span className="row__a">
                    <IconBtn icon="x" label={`${t.title} löschen`} danger onClick={() => void tasks.remove(t.id)} />
                  </span>
                </Row>
              ))}
              {done.length > limit && (
                <div className="row">
                  <Btn onClick={() => setLimit(limit + 50)}>+ {done.length - limit} ältere anzeigen</Btn>
                </div>
              )}
            </>
          )}
        </Sec>
      </div>

      {/* ── Notizen: ein Archiv mit Suche ── */}
      <div className="c5">
        <Sec title="Notes" color="journal" metaValue={notes.items.length}>
          <form className="form" onSubmit={addNote} style={{ marginBottom: 12 }}>
            <input
              className="inp"
              placeholder="Titel (optional)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              aria-label="Titel der Notiz"
            />
            <textarea
              className="inp"
              placeholder="Notiz …"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              aria-label="Inhalt der Notiz"
            />
            <div className="form__r">
              <span style={{ flex: 1 }} />
              <Btn kind="pri" type="submit" disabled={!noteBody.trim()}>
                Speichern
              </Btn>
            </div>
          </form>

          <div style={{ marginBottom: 8 }}>
            <input
              className="inp"
              placeholder="Durchsuchen"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Notizen durchsuchen"
              style={{ width: '100%' }}
            />
          </div>

          {foundNotes.length === 0 ? (
            <Empty>{search ? `Nichts gefunden für „${search}"` : 'Noch keine Notizen'}</Empty>
          ) : (
            foundNotes.slice(0, 50).map((n) => (
              <div
                className="row"
                key={n.id}
                style={{ alignItems: 'flex-start', paddingTop: 5, paddingBottom: 5 }}
              >
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="row__n" style={{ display: 'block', color: 'var(--ink-900)' }}>
                    {n.title}
                  </span>
                  {/* Zweizeiliger Anriss statt voller Text: zehn Notizen
                      passen dorthin, wo vorher drei standen. */}
                  <span
                    className="row__m"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      whiteSpace: 'normal',
                    }}
                  >
                    {n.body}
                  </span>
                </span>
                <span className="row__m">{shortDate(n.updatedAt.slice(0, 10))}</span>
                <span className="row__a">
                  <IconBtn
                    icon="x"
                    label={`Notiz ${n.title} löschen`}
                    danger
                    onClick={() => void notes.remove(n.id)}
                  />
                </span>
              </div>
            ))
          )}
        </Sec>
      </div>
    </div>
  )
}
