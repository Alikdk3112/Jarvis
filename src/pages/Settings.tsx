/* Einstellungen: Effekte, Ton, Ziele — und Export/Import.

   Der Export ist wichtiger, als er aussieht: solange die Daten nur lokal im
   Browser liegen, ist die JSON-Datei die einzige Sicherung. Beim späteren
   Umzug auf Supabase wird genau diese Datei wieder eingelesen. */

import { useRef, useState } from 'react'
import { Page } from '../components/Page'
import { GlassTile, Pill } from '../components/hud'
import { useRefreshAll, useSettings } from '../lib/store'
import { data, isLocalMode } from '../lib/data'
import type { Backup } from '../lib/data/types'
import { useSound } from '../hooks/useSound'
import { SignOutButton } from '../features/auth/AuthGate'

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <div className="row">
      <span className="row__n">
        {label}
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--dim)', whiteSpace: 'normal' }}>{hint}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`btn ${checked ? 'btn--p' : ''}`}
        onClick={() => onChange(!checked)}
      >
        {checked ? 'An' : 'Aus'}
      </button>
    </div>
  )
}

export function Settings() {
  const { settings, save } = useSettings()
  const refreshAll = useRefreshAll()
  const beep = useSound(settings.sound)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  async function doExport() {
    const backup = await data.exportAll()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jarvis-${backup.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Sicherung heruntergeladen.')
  }

  async function doImport(file: File) {
    try {
      const parsed = JSON.parse(await file.text()) as Backup
      if (parsed.version !== 1) throw new Error('Unbekannte Dateiversion.')
      await data.importAll(parsed)
      refreshAll()
      setStatus('Sicherung eingelesen.')
    } catch (err) {
      setStatus(`Import fehlgeschlagen: ${err instanceof Error ? err.message : 'unbekannt'}`)
    }
  }

  return (
    <Page title="EINSTELLUNGEN">
      <div className="strip" style={{ justifyContent: 'flex-start' }}>
        <Pill
          label="Speicherung"
          value={isLocalMode ? 'Lokal' : 'Supabase'}
          color={isLocalMode ? 'journal' : 'habits'}
        />
      </div>

      <div className="cols">
        <GlassTile title="Darstellung">
          <Toggle
            label="Ambient-Effekte"
            hint="Punktraster, Radar-Sweep und Scanlines im Hintergrund."
            checked={settings.ambient}
            onChange={(v) => void save({ ambient: v })}
          />
          <Toggle
            label="Ton"
            hint="Kurze Rückmeldung beim Abhaken und wenn der Timer abläuft."
            checked={settings.sound}
            onChange={(v) => {
              void save({ sound: v })
              if (v) beep('on')
            }}
          />
          <div className="row">
            <span className="row__n">Name im Briefing</span>
            <input
              className="inp"
              value={settings.displayName}
              onChange={(e) => void save({ displayName: e.target.value })}
              aria-label="Name im Briefing"
              style={{ width: 160 }}
            />
          </div>
          <p className="row__v" style={{ marginTop: 12, whiteSpace: 'normal', lineHeight: 1.7 }}>
            IST IM SYSTEM „REDUZIERTE BEWEGUNG" AKTIV, STEHEN ALLE ANIMATIONEN
            OHNEHIN STILL — UNABHÄNGIG VON DIESEM SCHALTER.
          </p>
        </GlassTile>

        <GlassTile title="Ziele" color="study">
          <div className="row">
            <span className="row__n">
              Lernziel pro Tag
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--dim)' }}>
                Speist den violetten Bogen im Hub.
              </span>
            </span>
            <input
              className="inp"
              type="number"
              min={15}
              max={600}
              step={15}
              value={settings.studyGoalMinutes}
              onChange={(e) => void save({ studyGoalMinutes: Math.max(15, Number(e.target.value)) })}
              aria-label="Lernziel pro Tag in Minuten"
              style={{ width: 100 }}
            />
          </div>
          <div className="row">
            <span className="row__n">
              Länge eines Blocks
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--dim)' }}>
                Wann der Timer Bescheid gibt.
              </span>
            </span>
            <input
              className="inp"
              type="number"
              min={5}
              max={180}
              step={5}
              value={settings.focusBlockMinutes}
              onChange={(e) => void save({ focusBlockMinutes: Math.max(5, Number(e.target.value)) })}
              aria-label="Länge eines Blocks in Minuten"
              style={{ width: 100 }}
            />
          </div>
        </GlassTile>
      </div>

      <GlassTile title="Daten" color="journal">
        <p style={{ fontSize: 14, color: 'var(--dim)', marginBottom: 14 }}>
          {isLocalMode
            ? 'Deine Daten liegen ausschließlich in diesem Browser. Lade regelmäßig eine Sicherung herunter — sie ist zugleich der Umzugskoffer, wenn wir später auf Supabase umstellen.'
            : 'Deine Daten liegen in deinem Supabase-Projekt. Die Sicherung bleibt trotzdem sinnvoll.'}
        </p>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--p m-journal" onClick={() => void doExport()}>
            Sicherung herunterladen
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Sicherung einlesen
          </button>
          <SignOutButton />
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
          <p className="row__v" style={{ marginTop: 12 }} role="status">
            {status.toUpperCase()}
          </p>
        )}
      </GlassTile>
    </Page>
  )
}
