/* ══════════════════════════════════════════════════════════════════════
   Lernzeit-Timer als Kontext, damit er beim Wechsel zwischen Cockpit und
   Study-Ansicht weiterläuft. Die verstrichene Zeit fließt sofort in den
   Hub — der violette Innenbogen wächst live mit.

   Gerechnet wird nach der Uhr, nicht nach Takten. Vorher zählte ein
   Intervall jede Sekunde eins hoch; sobald das Handy aber gesperrt oder die
   App in den Hintergrund geschoben wird, drosselt oder pausiert iOS genau
   dieses Intervall. Wer fünfundvierzig Minuten mit gesperrtem Bildschirm
   lernt, buchte am Ende ein paar Minuten. Für einen Lernzeit-Tracker ist
   das kein Schönheitsfehler, sondern die eine Zahl, um die es geht.

   Deshalb: Startzeitpunkt merken, Differenz zur Uhr bilden, der Takt dient
   nur noch dazu, die Anzeige aufzufrischen. Und weil iOS eine im
   Hintergrund liegende App auch ganz aus dem Speicher werfen darf, liegt
   der Stand zusätzlich im localStorage.
   ══════════════════════════════════════════════════════════════════════ */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useCollection, useSettings } from '../../lib/store'
import { newId } from '../../lib/id'
import { today } from '../../lib/date'
import { useSound } from '../../hooks/useSound'

interface TimerValue {
  seconds: number
  running: boolean
  courseId: string | null
  setCourseId: (id: string | null) => void
  targetSeconds: number
  start: () => void
  pause: () => void
  reset: () => void
  /** Laufende Zeit als Lerneinheit buchen und den Timer zurücksetzen. */
  book: () => Promise<void>
}

const Ctx = createContext<TimerValue | null>(null)

const STORE_KEY = 'jarvis.timer'

/** Was der Timer überdauern muss: die bereits gesammelte Zeit und, falls er
 *  gerade läuft, der Zeitpunkt seit dem gezählt wird. */
interface Persisted {
  /** Sekunden aus abgeschlossenen Abschnitten. */
  banked: number
  /** ms-Zeitstempel, seit dem weitergezählt wird — null, wenn pausiert. */
  since: number | null
  startedAt: string | null
  courseId: string | null
}

const EMPTY: Persisted = { banked: 0, since: null, startedAt: null, courseId: null }

function load(): Persisted {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return EMPTY
    const p = JSON.parse(raw) as Partial<Persisted>
    const banked = Number(p.banked)
    const since = p.since == null ? null : Number(p.since)
    // Ein Zeitstempel aus der Zukunft oder ein kaputter Wert würde eine
    // absurde Dauer ergeben — dann lieber bei null anfangen.
    if (!Number.isFinite(banked) || banked < 0) return EMPTY
    if (since != null && (!Number.isFinite(since) || since > Date.now())) return EMPTY
    return {
      banked,
      since,
      startedAt: typeof p.startedAt === 'string' ? p.startedAt : null,
      courseId: typeof p.courseId === 'string' ? p.courseId : null,
    }
  } catch {
    return EMPTY
  }
}

function save(state: Persisted): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state))
  } catch {
    // Privater Modus oder voller Speicher: Der Timer läuft trotzdem, er
    // überlebt dann nur keinen Neustart. Kein Grund, hier abzubrechen.
  }
}

const elapsed = (s: Persisted): number =>
  Math.max(0, Math.floor(s.banked + (s.since == null ? 0 : (Date.now() - s.since) / 1000)))

export function TimerProvider({ children }: { children: ReactNode }) {
  const state = useRef<Persisted>(load())
  const [seconds, setSeconds] = useState(() => elapsed(state.current))
  const [running, setRunning] = useState(() => state.current.since != null)
  const [courseId, setCourseIdState] = useState<string | null>(() => state.current.courseId)
  const { settings } = useSettings()
  const sessions = useCollection('studySessions')
  const beep = useSound(settings.sound)
  const alerted = useRef(false)

  const targetSeconds = Math.max(60, settings.focusBlockMinutes * 60)

  const commit = useCallback((next: Partial<Persisted>) => {
    state.current = { ...state.current, ...next }
    save(state.current)
    setRunning(state.current.since != null)
    setSeconds(elapsed(state.current))
  }, [])

  /* Der Takt treibt nur die Anzeige. Bleibt er im Hintergrund stehen, geht
     keine Zeit verloren — beim nächsten Bild steht wieder die Uhr da. */
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setSeconds(elapsed(state.current)), 1000)
    return () => window.clearInterval(id)
  }, [running])

  /* Zurück aus dem Hintergrund: sofort nachziehen, statt bis zum nächsten
     Takt eine veraltete Zahl zu zeigen. */
  useEffect(() => {
    const sync = () => {
      if (document.visibilityState === 'visible') setSeconds(elapsed(state.current))
    }
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('focus', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  useEffect(() => {
    if (running && seconds >= targetSeconds && !alerted.current) {
      alerted.current = true
      beep('done')
    }
  }, [running, seconds, targetSeconds, beep])

  const setCourseId = useCallback(
    (id: string | null) => {
      setCourseIdState(id)
      commit({ courseId: id })
    },
    [commit],
  )

  const start = useCallback(() => {
    if (state.current.since != null) return
    alerted.current = false
    commit({
      since: Date.now(),
      startedAt: state.current.startedAt ?? new Date().toISOString(),
    })
    beep('start')
  }, [commit, beep])

  const pause = useCallback(() => {
    if (state.current.since == null) return
    // Das Gelaufene festschreiben, sonst ginge es beim nächsten Start verloren.
    commit({ banked: elapsed(state.current), since: null })
    beep('stop')
  }, [commit, beep])

  const reset = useCallback(() => {
    alerted.current = false
    commit({ banked: 0, since: null, startedAt: null })
    beep('reset')
  }, [commit, beep])

  const book = useCallback(async () => {
    const total = elapsed(state.current)
    if (total < 30) {
      // Unter einer halben Minute ist keine Lerneinheit — nur zurücksetzen.
      reset()
      return
    }
    const startedAt = state.current.startedAt ?? new Date().toISOString()
    // Erst zurücksetzen, dann buchen: Sonst könnte ein zweiter Tipp auf
    // „Buchen" dieselbe Zeit ein zweites Mal schreiben, solange die erste
    // Anfrage noch läuft.
    alerted.current = false
    commit({ banked: 0, since: null, startedAt: null })
    await sessions.put({
      id: newId(),
      courseId,
      date: today(),
      startedAt,
      seconds: total,
      note: null,
    })
    beep('on')
  }, [courseId, sessions, reset, commit, beep])

  const value = useMemo<TimerValue>(
    () => ({ seconds, running, courseId, setCourseId, targetSeconds, start, pause, reset, book }),
    [seconds, running, courseId, setCourseId, targetSeconds, start, pause, reset, book],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTimer(): TimerValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTimer außerhalb des TimerProvider verwendet.')
  return v
}
