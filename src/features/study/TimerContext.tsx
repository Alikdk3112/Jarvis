/* Lernzeit-Timer als Kontext, damit er beim Wechsel zwischen Cockpit und
   Study-Ansicht weiterläuft. Die verstrichene Zeit fließt sofort in den
   Hub — der violette Innenbogen wächst live mit. */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

export function TimerProvider({ children }: { children: ReactNode }) {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [courseId, setCourseId] = useState<string | null>(null)
  const { settings } = useSettings()
  const sessions = useCollection('studySessions')
  const beep = useSound(settings.sound)
  const startedAt = useRef<string | null>(null)
  const alerted = useRef(false)

  const targetSeconds = Math.max(60, settings.focusBlockMinutes * 60)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (running && seconds >= targetSeconds && !alerted.current) {
      alerted.current = true
      beep('done')
    }
  }, [running, seconds, targetSeconds, beep])

  const start = useCallback(() => {
    startedAt.current ??= new Date().toISOString()
    alerted.current = false
    setRunning(true)
    beep('start')
  }, [beep])

  const pause = useCallback(() => {
    setRunning(false)
    beep('stop')
  }, [beep])

  const reset = useCallback(() => {
    setRunning(false)
    setSeconds(0)
    startedAt.current = null
    alerted.current = false
    beep('reset')
  }, [beep])

  const book = useCallback(async () => {
    if (seconds < 30) {
      // Unter einer halben Minute ist keine Lerneinheit — nur zurücksetzen.
      reset()
      return
    }
    await sessions.put({
      id: newId(),
      courseId,
      date: today(),
      startedAt: startedAt.current ?? new Date().toISOString(),
      seconds,
      note: null,
    })
    setRunning(false)
    setSeconds(0)
    startedAt.current = null
    alerted.current = false
    beep('on')
  }, [seconds, courseId, sessions, reset, beep])

  const value = useMemo<TimerValue>(
    () => ({ seconds, running, courseId, setCourseId, targetSeconds, start, pause, reset, book }),
    [seconds, running, courseId, targetSeconds, start, pause, reset, book],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTimer(): TimerValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTimer außerhalb des TimerProvider verwendet.')
  return v
}
