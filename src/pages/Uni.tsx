/* Uni: Kurse mit ECTS, Klausurterminen und Noten, plus Semesterfortschritt. */

import { useState } from 'react'
import { Page } from '../components/Page'
import { ArcGauge, Empty, GlassTile, Icon, Pill } from '../components/hud'
import { useCollection } from '../lib/store'
import { useDeleteCourse } from '../lib/cascade'
import { newId } from '../lib/id'
import { daysBetween, shortDate, today } from '../lib/date'

export function Uni() {
  const courses = useCollection('courses')
  const deleteCourse = useDeleteCourse()
  const [name, setName] = useState('')
  const [ects, setEcts] = useState(5)
  const [examDate, setExamDate] = useState('')
  const todayKey = today()

  const done = courses.items.filter((c) => c.passed)
  const open = courses.items.filter((c) => !c.passed)
  const ectsDone = done.reduce((s, c) => s + c.ects, 0)
  const ectsTotal = courses.items.reduce((s, c) => s + c.ects, 0)
  const graded = done.filter((c) => c.grade !== null)
  const avg = graded.length
    ? graded.reduce((s, c) => s + (c.grade as number) * c.ects, 0) / graded.reduce((s, c) => s + c.ects, 0)
    : null

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const clean = name.trim()
    if (!clean) return
    await courses.put({
      id: newId(),
      name: clean,
      ects,
      semester: null,
      examDate: examDate || null,
      grade: null,
      passed: false,
      createdAt: new Date().toISOString(),
    })
    setName('')
    setExamDate('')
  }

  return (
    <Page title="UNI">
      <div className="strip" style={{ justifyContent: 'flex-start' }}>
        <Pill label="ECTS" value={`${ectsDone} / ${ectsTotal}`} color="study" />
        <Pill label="Schnitt" value={avg ? avg.toFixed(2).replace('.', ',') : '—'} color="habits" />
        <Pill label="Laufend" value={open.length} />
      </div>

      <div className="cols">
        <GlassTile title="Laufende Kurse" color="study" meta={`${open.length}`}>
          {open.length === 0 ? (
            <Empty>Keine laufenden Kurse.</Empty>
          ) : (
            open.map((c) => {
              const days = c.examDate ? daysBetween(todayKey, c.examDate) : null
              return (
                <div className="row" key={c.id}>
                  <span className="row__n">{c.name}</span>
                  <span className="row__v">{c.ects} ECTS</span>
                  {days !== null && (
                    <span className="chipx" style={{ color: days <= 14 ? 'var(--alert)' : 'var(--journal)' }}>
                      {days < 0 ? `VORBEI · ${shortDate(c.examDate as string)}` : `KLAUSUR ${days} T`}
                    </span>
                  )}
                  <input
                    className="inp"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="Note"
                    style={{ width: 84 }}
                    aria-label={`Note für ${c.name} eintragen`}
                    onKeyDown={(e) => {
                      if (e.key !== 'Enter') return
                      const grade = Number((e.target as HTMLInputElement).value.replace(',', '.'))
                      if (!grade || grade < 1 || grade > 5) return
                      void courses.put({ ...c, grade, passed: grade <= 4 })
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn--sm"
                    style={{ padding: '6px 10px' }}
                    onClick={() => void deleteCourse(c.id)}
                    aria-label={`${c.name} löschen`}
                  >
                    <Icon name="trash" />
                  </button>
                </div>
              )
            })
          )}
          <p className="row__v" style={{ marginTop: 12 }}>
            NOTE EINTRAGEN UND ENTER — DER KURS GILT DANN ALS ABGESCHLOSSEN
          </p>
        </GlassTile>

        <GlassTile title="Semesterfortschritt" color="study">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center' }}>
            <ArcGauge
              value={ectsTotal ? ectsDone / ectsTotal : 0}
              label={`${ectsDone}`}
              caption={`VON ${ectsTotal} ECTS`}
              color="study"
              size={150}
            />
            <div className="kv">
              <div>
                <span>BESTANDEN</span>
                <b>{done.length}</b>
              </div>
              <div>
                <span>OFFEN</span>
                <b>{open.length}</b>
              </div>
              <div>
                <span>SCHNITT</span>
                <b style={{ color: 'var(--habits)' }}>{avg ? avg.toFixed(2).replace('.', ',') : '—'}</b>
              </div>
            </div>
          </div>

          <form onSubmit={add} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <input
              className="inp"
              placeholder="Neuer Kurs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Name des Kurses"
            />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                className="inp"
                type="number"
                min={1}
                max={30}
                value={ects}
                onChange={(e) => setEcts(Math.max(1, Number(e.target.value)))}
                aria-label="ECTS"
                style={{ width: 90 }}
              />
              <input
                className="inp"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                aria-label="Klausurtermin"
                style={{ width: 168 }}
              />
              <button type="submit" className="btn btn--p m-study" disabled={!name.trim()}>
                <Icon name="plus" /> Anlegen
              </button>
            </div>
          </form>
        </GlassTile>
      </div>

      {done.length > 0 && (
        <GlassTile title="Abgeschlossen" color="habits" meta={`${ectsDone} ECTS`}>
          {done.map((c) => (
            <div className="row" key={c.id}>
              <span className="row__n">{c.name}</span>
              <span className="row__v">{c.ects} ECTS</span>
              <span className="chipx" style={{ color: 'var(--habits)' }}>
                {c.grade?.toFixed(1).replace('.', ',') ?? 'BESTANDEN'}
              </span>
              <button
                type="button"
                className="btn btn--sm"
                style={{ padding: '6px 10px' }}
                onClick={() => void courses.put({ ...c, passed: false, grade: null })}
                aria-label={`${c.name} wieder öffnen`}
              >
                <Icon name="x" />
              </button>
            </div>
          ))}
        </GlassTile>
      )}
    </Page>
  )
}
