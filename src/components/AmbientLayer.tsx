/* Punktraster, Radar-Sweep, Scanlines und Vignette in einer festen Ebene
   hinter allem. Abschaltbar in den Einstellungen; bei „Reduzierte Bewegung"
   steht der Sweep automatisch still (siehe app.css). */

export function AmbientLayer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return (
    <div className="amb" aria-hidden="true">
      <div className="amb__dots" />
      <div className="amb__sweep" />
      <div className="amb__scan" />
      <div className="amb__vig" />
    </div>
  )
}
