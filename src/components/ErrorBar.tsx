/* Meldet, wenn eine Änderung nicht gespeichert werden konnte.

   Ohne diesen Streifen wirkt ein fehlgeschlagener Schreibvorgang wie ein
   Hänger: Der Haken springt zurück und niemand sagt, warum. */

import { useEffect, useState } from 'react'
import { clearError, subscribeError } from '../lib/errors'
import { Icon } from './hud'

export function ErrorBar() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => subscribeError(setMessage), [])

  // Von selbst verschwinden, aber lange genug stehen bleiben zum Lesen.
  useEffect(() => {
    if (!message) return
    const id = window.setTimeout(clearError, 7000)
    return () => window.clearTimeout(id)
  }, [message])

  if (!message) return null

  return (
    <div
      role="alert"
      className="errbar"
      onClick={clearError}
      style={{ cursor: 'pointer' }}
      title="Ausblenden"
    >
      <span className="errbar__dot" aria-hidden="true" />
      <span>{message}</span>
      <Icon name="x" />
    </div>
  )
}
