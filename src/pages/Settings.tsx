/* ══════════════════════════════════════════════════════════════════════
   Einstellungen.

   Wichtigste Information: der Zustand der Datenhaltung — wo die Daten
   liegen, wie viele es sind, wann zuletzt gesichert wurde. Nicht der
   Ton-Schalter. Deshalb steht die Datenübersicht oben.

   Diese Ansicht hat bewusst keine Leitzahl: nichts hier verdient die
   größte Zahl der Seite. Und jeder Schalter ist ein Zwei-Segment-
   Umschalter AN | AUS — es gibt keinen Kippschalter, weil ein
   Kippschalter eine Pille mit rundem Griff ist.
   ══════════════════════════════════════════════════════════════════════ */

import { useMemo, useRef, useState } from 'react'
import { Btn, Empty, Kv, Nil, Row, Sec, Seg, Toggle } from '../components/hud'
import { useRefreshAll, useSettings } from '../lib/store'
import { data, isLocalMode } from '../lib/data'
import type { Backup, Theme } from '../lib/data/types'
import { useSound } from '../hooks/useSound'
import { SignOutButton } from '../features/auth/AuthGate'
import { clearSamples, diagEnabled, report, setDiagEnabled } from '../lib/diag'
import { shortDate } from '../lib/date'

/** Alles zählen, was in einer Sicherung steckt — eine Zahl, die die
 *  Hälfte unterschlägt, wiegt vor dem Überschreiben in falscher
 *  Sicherheit. */
function countRecords(b: Partial<Backup>): number {
  let n = 0
  for (const value of Object.values(b)) if (Array.isArray(value)) n += value.length
  return n
}

const THEMES = [
  { value: 'dark', label: 'Dunkel' },
  { value: 'light', label: 'Hell' },
  { value: 'system', label: 'System' },
]

const LABELS: Record<string, string> = {
  habits: 'Habits',
  habitEntries: 'Habit-Einträge',
  tasks: 'Aufgaben',
  notes: 'Notizen',
  journal: 'Journal',
  courses: 'Kurse',
  studySessions: 'Lernzeiten',
  goals: 'Ziele',
  workouts: 'Training',
  workoutSets: 'Sätze',
}

export function Settings() {
  const { settings, save } = useSettings()
  const refreshAll = useRefreshAll()
  const beep = useSound(settings.sound)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [name, setName] = useState(settings.displayName)
  const [diagOn, setDiagOn] = useState(diagEnabled)
  const [diagText, setDiagText] = useState(report)
  const [counts, setCounts] = useState<Array<[string, number]> | null>(null)
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    try {
      return localStorage.getItem('jarvis.lastBackup')
    } catch {
      return null
    }
  })

  const lastLoaded = useRef(settings.displayName)
  if (lastLoaded.current !== settings.displayName) {
    lastLoaded.current = settings.displayName
    if (name !== settings.displayName) setName(settings.displayName)
  }

  // Einmal beim Öffnen zählen — die Übersicht ist der Grund, hier zu sein.
  useMemo(() => {
    void data.exportAll().then((b) => {
      setCounts(
        Object.entries(b)
          .filter(([, v]) => Array.isArray(v))
          .map(([k, v]) => [k, (v as unknown[]).length]),
      )
    })
  }, [])

  const total = counts?.reduce((s, [, n]) => s + n, 0) ?? 0
  const backupStale =
    lastBackup !== null && Date.now() - new Date(lastBackup).getTime() > 30 * 864e5

  async function download(backup: Backup, filename: string) {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    // In den Baum hängen (Firefox ignoriert sonst den Klick) und die
    // Adresse erst später freigeben (Safari bricht den Download sonst ab).
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  async function doExport() {
    const backup = await data.exportAll()
    await download(backup, `jarvis-${backup.exportedAt.slice(0, 10)}.json`)
    try {
      localStorage.setItem('jarvis.lastBackup', backup.exportedAt)
    } catch {
      /* voller Speicher — die Sicherung selbst ist trotzdem heruntergeladen */
    }
    setLastBackup(backup.exportedAt)
    setStatus('Sicherung heruntergeladen.')
  }

  /* Einlesen ersetzt den gesamten Bestand. Das ist der einzige Knopf, der
     alles auf einmal vernichten kann — deshalb erst zeigen, was in der
     Datei steht, dann fragen, und vorher den aktuellen Stand ausgeben. */
  async function doImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Backup
      if (parsed.version !== 1) throw new Error('Unbekannte Dateiversion.')

      const current = await data.exportAll()
      const ok = window.confirm(
        'Sicherung einlesen?\n\n' +
          `Datei vom ${parsed.exportedAt?.slice(0, 10) ?? 'unbekannt'} mit ${countRecords(parsed)} Datensätzen.\n` +
          `Dein jetziger Stand (${countRecords(current)} Datensätze) wird vollständig ersetzt.\n\n` +
          'Zur Sicherheit wird er vorher heruntergeladen.',
      )
      if (!ok) {
        setStatus('Abgebrochen — nichts verändert.')
        return
      }
      await download(current, `jarvis-vor-import-${current.exportedAt.slice(0, 10)}.json`)
      await data.importAll(parsed)
      refreshAll()
      setStatus('Sicherung eingelesen.')
    } catch (err) {
      setStatus(`Import fehlgeschlagen: ${err instanceof Error ? err.message : 'unbekannt'}`)
    }
  }

  return (
    <div className="g12">
      {/* ── Daten zuerst: das ist die Frage, die hierher treibt ── */}
      <div className="c7">
        <Sec
          title="Daten"
          color="tasks"
          right={
            <span className="status">
              <i className={`lamp ${isLocalMode ? 'lamp--off' : ''}`} aria-hidden="true" />
              {isLocalMode ? 'Lokal' : 'Supabase'}
            </span>
          }
        >
          {counts === null ? (
            <Empty>LADEN</Empty>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Modul</th>
                  <th className="num" style={{ width: '12ch' }}>
                    Anzahl
                  </th>
                </tr>
              </thead>
              <tbody>
                {counts.map(([k, n]) => (
                  <tr key={k}>
                    <td>{LABELS[k] ?? k}</td>
                    <td className="num">{n || <Nil />}</td>
                  </tr>
                ))}
                <tr className="sum">
                  <td>Summe</td>
                  <td className="num">{total}</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="kv">
            <em>Letzte Sicherung</em>
            <b className={backupStale ? 'row__v--warn' : ''}>
              {lastBackup ? shortDate(lastBackup.slice(0, 10)) : <Nil />}
            </b>
          </div>

          <div className="btns" style={{ padding: '12px 8px 0' }}>
            <Btn kind="pri" onClick={() => void doExport()}>
              Sicherung laden
            </Btn>
            <Btn onClick={() => fileRef.current?.click()}>Sicherung einlesen</Btn>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void doImport(f)
                e.target.value = ''
              }}
            />
          </div>
          {status && (
            <p className="empty" role="status">
              {status}
            </p>
          )}
        </Sec>

        <Sec title="Diagnose" color="sport" grouped>
          <Row>
            <span className="row__n">
              Wechsel aufzeichnen
              <span className="row__m" style={{ display: 'block', whiteSpace: 'normal' }}>
                Misst auf diesem Gerät, wie lange ein Seitenwechsel dauert.
              </span>
            </span>
            <Toggle
              checked={diagOn}
              ariaLabel="Wechsel aufzeichnen"
              onChange={(v) => {
                setDiagEnabled(v)
                setDiagOn(v)
                setDiagText(report())
              }}
            />
          </Row>
          {diagOn && (
            <>
              <pre
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  lineHeight: 1.6,
                  color: 'var(--ink-600)',
                  overflowX: 'auto',
                  maxHeight: 300,
                  margin: '8px 0 0',
                }}
              >
                {diagText}
              </pre>
              <div className="btns" style={{ padding: '12px 8px 0' }}>
                <Btn onClick={() => setDiagText(report())}>Aktualisieren</Btn>
                <Btn
                  onClick={() => {
                    const text = report()
                    setDiagText(text)
                    void navigator.clipboard
                      ?.writeText(text)
                      .then(() => setStatus('Bericht kopiert.'))
                      .catch(() => setStatus('Kopieren ging nicht — Text markieren.'))
                  }}
                >
                  Kopieren
                </Btn>
                <Btn
                  onClick={() => {
                    clearSamples()
                    setDiagText(report())
                  }}
                >
                  Zurücksetzen
                </Btn>
              </div>
            </>
          )}
        </Sec>
      </div>

      {/* ── Schalter als Panelgruppe an einer gemeinsamen rechten Kante ── */}
      <div className="c5">
        <Sec title="Darstellung" color="tasks">
          <Row>
            <span className="row__n">Thema</span>
            <Seg
              options={THEMES}
              value={settings.theme}
              onChange={(v) => void save({ theme: v as Theme })}
              ariaLabel="Thema"
            />
          </Row>
          <Row>
            <span className="row__n">
              Bewegte Effekte
              <span className="row__m" style={{ display: 'block', whiteSpace: 'normal' }}>
                Nur noch die Zahlenannäherung im Ring.
              </span>
            </span>
            <Toggle
              checked={settings.ambient}
              ariaLabel="Bewegte Effekte"
              onChange={(v) => void save({ ambient: v })}
            />
          </Row>
          <Row>
            <span className="row__n">Ton</span>
            <Toggle
              checked={settings.sound}
              ariaLabel="Ton"
              onChange={(v) => {
                void save({ sound: v })
                if (v) beep('on')
              }}
            />
          </Row>
        </Sec>

        <Sec title="Ziele" color="study" grouped>
          <Row>
            <span className="row__n">Lernziel pro Tag</span>
            <input
              className="inp inp--num"
              type="number"
              min={15}
              max={600}
              step={15}
              inputMode="numeric"
              value={settings.studyGoalMinutes}
              onChange={(e) => void save({ studyGoalMinutes: Math.max(15, Number(e.target.value)) })}
              aria-label="Lernziel pro Tag in Minuten"
            />
            <span className="unit">min</span>
          </Row>
          <Row>
            <span className="row__n">Länge eines Blocks</span>
            <input
              className="inp inp--num"
              type="number"
              min={5}
              max={180}
              step={5}
              inputMode="numeric"
              value={settings.focusBlockMinutes}
              onChange={(e) => void save({ focusBlockMinutes: Math.max(5, Number(e.target.value)) })}
              aria-label="Länge eines Blocks in Minuten"
            />
            <span className="unit">min</span>
          </Row>
        </Sec>

        <Sec title="Profil" color="journal" grouped>
          <Row>
            <span className="row__n">Name im Briefing</span>
            {/* Beim Verlassen des Feldes speichern, nicht bei jedem
                Buchstaben — mit Supabase wäre das eine Anfrage pro Zeichen. */}
            <input
              className="inp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                const clean = name.trim()
                if (clean && clean !== settings.displayName) void save({ displayName: clean })
                else setName(settings.displayName)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur()
              }}
              aria-label="Name im Briefing"
              style={{ width: 150 }}
            />
          </Row>
          <Kv label="Speicherung" value={isLocalMode ? 'Nur dieser Browser' : 'Supabase'} />
          {/* Welcher Bau hier läuft. Klingt nach Kleinigkeit, ist aber die
              Antwort auf „habe ich die neue Fassung überhaupt?" — und die war
              einmal nicht zu beantworten, während am Telefon wochenlang ein
              alter Stand lief, weil das Ausliefern still gescheitert war. */}
          <Kv label="Fassung" value={__BUILD_SHA__} />
          <Kv label="Gebaut" value={__BUILD_AT__} />
          {!isLocalMode && (
            <div className="btns" style={{ padding: '12px 8px 0' }}>
              <SignOutButton />
            </div>
          )}
        </Sec>
      </div>
    </div>
  )
}
