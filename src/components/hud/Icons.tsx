/* Geometrische Icons aus dem Entwurf — runde Formen, 16×16, currentColor. */

export type IconName =
  | 'grid' | 'check' | 'list' | 'clock' | 'book'
  | 'target' | 'pulse' | 'pen' | 'gear' | 'plus' | 'trash' | 'x'

const PATHS: Record<IconName, React.ReactNode> = {
  grid: (
    <>
      <circle cx="5" cy="5" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11" cy="5" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="5" cy="11" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="11" cy="11" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </>
  ),
  check: (
    <path d="M3.2 8.4l3.4 3.4L12.9 4.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  ),
  list: (
    <path d="M2.6 4.5h10.8M2.6 8h10.8M2.6 11.5h7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  ),
  clock: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.6V8l2.4 1.7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  book: (
    <path d="M8 4.4C7 3.3 5.4 3 2.9 3v9.3c2.5 0 4.1.3 5.1 1.4 1-1.1 2.6-1.4 5.1-1.4V3c-2.5 0-4.1.3-5.1 1.4zM8 4.4v9.3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  ),
  target: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2.3" fill="currentColor" />
    </>
  ),
  pulse: (
    <path d="M1.6 8h2.8l1.9-4 2.6 8 2-4h3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  pen: (
    <path d="M10.9 2.5l2.6 2.6L5.3 13H2.7v-2.6z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  ),
  gear: (
    <>
      <circle cx="8" cy="8" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.7v2.2M8 12.1v2.2M14.3 8h-2.2M3.9 8H1.7M12.5 3.5l-1.6 1.6M5.1 10.9l-1.6 1.6M12.5 12.5l-1.6-1.6M5.1 5.1L3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  plus: (
    <path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  ),
  trash: (
    <path d="M3.4 4.6h9.2M6.4 4.6V3.2h3.2v1.4M4.7 4.6l.6 8.2h5.4l.6-8.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  x: (
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  ),
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  )
}
