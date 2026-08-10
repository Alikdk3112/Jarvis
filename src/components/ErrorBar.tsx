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

  /* Eine Zeile im Fluss unter der Kopfzeile statt einer schwebenden
     Blase: kein Overlay, kein Schatten, keine Bewegung. */
  return (
    <div role="alert" className="errline" style={{ padding: '0 24px' }}>
      <span style={{ flex: 1 }}>{message}</span>
      <button type="button" className="ibtn ibtn--x" onClick={clearError} aria-label="Ausblenden">
        <Icon name="x" />
      </button>
    </div>
  )
}
