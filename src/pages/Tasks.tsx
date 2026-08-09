/* Aufgaben und Notizen. Beides landet hier, weil beides „Dinge, die ich
   festhalten will" sind — Aufgaben mit Fälligkeit, Notizen ohne. */

import { useMemo, useState } from 'react'
import { Page } from '../components/Page'
import { Empty, GlassTile, Icon, RoundCheck, SelectPills } from '../components/hud'
import { useCollection } from '../lib/store'
import { newId } from '../lib/id'
import { shortDate } from '../lib/date'
import { dueLabel } from '../lib/due'
import { TAG_COLOR, type TaskTag } from '../lib/data/types'

const TAGS: Array<{ value: NonNullable<TaskTag> | 'none'; label: string }> = [
  { value: 'none', label: 'OHNE' },
  { value: 'uni', label: 'UNI' },
  { value: 'sport', label: 'SPORT' },
  { value: 'jarvis', label: 'JARVIS' },
  { value: 'privat', label: 'PRIVAT' },
]

export function Tasks() {
  const tasks = useCollection('tasks')
  const notes = useCollection('notes')

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [tag, setTag] = useState<NonNullable<TaskTag> | 'none'>('none')

  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [search, setSearch] = useState('')

  const open = useMemo(
    () =>
      tasks.items
        .filter((t) => !t.done)
        .sort((a, b) => (a.dueAt ?? '9999').localeCompare(b.dueAt ?? '9999')),
    [tasks.items],
  )
  const done = useMemo(
    () => tasks.items.filter((t) => t.done).sort((a, b) => (b.doneAt ?? '').localeCompare(a.doneAt ?? '')),
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
      tag: tag === 'none' ? null : tag,
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
    <Page title="TASKS & NOTES">
      <div className="cols">
        <GlassTile title="Offen" meta={`${open.length}`}>
          <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <input
              className="inp"
              placeholder="Neue Aufgabe"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Titel der Aufgabe"
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="inp"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                aria-label="Fällig am"
                style={{ width: 168 }}
              />
              <SelectPills
                options={TAGS}
                value={tag}
                onChange={setTag}
                ariaLabel="Bereich"
              />
              <button type="submit" className="btn btn--p" disabled={!title.trim()}>
                <Icon name="plus" /> Anlegen
              </button>
            </div>
          </form>

          {open.length === 0 ? (
            <Empty>Nichts offen. Ordentlich.</Empty>
          ) : (
            open.map((t) => {
              const d = dueLabel(t)
              return (
                <div className="tsk" key={t.id}>
                  <RoundCheck
                    checked={false}
                    label={t.title}
                    onChange={() => void tasks.put({ ...t, done: true, doneAt: new Date().toISOString() })}
                  />
                  <div className="tsk__b">
                    <div className="tsk__t">{t.title}</div>
                    <div className="tsk__m">
                      {t.tag && (
                        <span className="chipx" style={{ color: `var(--${TAG_COLOR[t.tag]})` }}>
                          {t.tag.toUpperCase()}
                        </span>
                      )}
                      {d && <span className={d.overdue ? 'due' : undefined}>{d.text}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--sm"
                    style={{ padding: '6px 10px' }}
                    onClick={() => void tasks.remove(t.id)}
                    aria-label={`${t.title} löschen`}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              )
            })
          )}

          {done.length > 0 && (
            <details style={{ marginTop: 16 }}>
              <summary className="row__v" style={{ cursor: 'pointer' }}>
                {done.length} ERLEDIGT
              </summary>
              <div style={{ marginTop: 8 }}>
                {done.slice(0, 20).map((t) => (
                  <div className="tsk" key={t.id} data-done="1">
                    <RoundCheck
                      checked
                      label={t.title}
                      onChange={() => void tasks.put({ ...t, done: false, doneAt: null })}
                    />
                    <div className="tsk__b">
                      <div className="tsk__t">{t.title}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn--sm"
                      style={{ padding: '6px 10px' }}
                      onClick={() => void tasks.remove(t.id)}
                      aria-label={`${t.title} löschen`}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                ))}
              </div>
            </details>
          )}
        </GlassTile>

        <GlassTile title="Notizen" color="journal" meta={`${notes.items.length}`}>
          <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
            <input
              className="inp"
              placeholder="Titel (optional)"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              aria-label="Titel der Notiz"
            />
            <textarea
              className="inp"
              placeholder="Schnellnotiz …"
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              aria-label="Inhalt der Notiz"
            />
            <button type="submit" className="btn btn--p m-journal" disabled={!noteBody.trim()}>
              Speichern
            </button>
          </form>

          <input
            className="inp"
            placeholder="Notizen durchsuchen …"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Notizen durchsuchen"
            style={{ marginBottom: 12 }}
          />

          {foundNotes.length === 0 ? (
            <Empty>{search ? 'Nichts gefunden.' : 'Noch keine Notizen.'}</Empty>
          ) : (
            foundNotes.slice(0, 30).map((n) => (
              <div className="tsk" key={n.id}>
                <div className="tsk__b">
                  <div className="tsk__t" style={{ fontWeight: 700 }}>{n.title}</div>
                  <p style={{ fontSize: 13.5, color: 'var(--dim)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{n.body}</p>
                  <div className="tsk__m">{shortDate(n.updatedAt.slice(0, 10))}</div>
                </div>
                <button
                  type="button"
                  className="btn btn--sm"
                  style={{ padding: '6px 10px' }}
                  onClick={() => void notes.remove(n.id)}
                  aria-label={`Notiz ${n.title} löschen`}
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
