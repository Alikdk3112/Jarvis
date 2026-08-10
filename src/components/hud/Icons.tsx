/* ══════════════════════════════════════════════════════════════════════
   Ein Satz Strichzeichnungen, genau eine Anzeigegröße: 16×16.

   Konstruktion nach LEDGER: stroke-width 1.5, Kappen stumpf, Ecken
   spitz, keine Füllfläche, alle Waagrechten und Senkrechten auf halben
   Pixeln, Diagonalen ausschließlich in 45 Grad.

   Die Vorgänger hatten runde Kappen, Füllungen und Strichstärken von 1,2
   bis 1,7 — bei 16px ergibt das einen weichen, uneinheitlichen Eindruck,
   der zu einer Konsumenten-App gehört, nicht zu einem Messgerät.

   Wo ein Zeichen nicht in 45 Grad und auf halbe Pixel zu bringen war,
   steht ein anderes Motiv: „Sport" ist eine Hantel statt einer
   Pulslinie (eine Pulslinie braucht ungleiche Steigungen), „System" sind
   Schieberegler statt eines Zahnrads (ein Zahnrad braucht viele Winkel).
   Beide sagen dasselbe und passen besser zum Rest.
   ══════════════════════════════════════════════════════════════════════ */

export type IconName =
  | 'cockpit' | 'habits' | 'tasks' | 'journal' | 'study'
  | 'uni' | 'goals' | 'sport' | 'settings'
  | 'check' | 'plus' | 'minus' | 'chevron' | 'chevronLeft' | 'chevronDown'
  | 'search' | 'x'

const D: Record<IconName, string> = {
  // Vier Felder — das Cockpit als Übersicht
  cockpit: 'M2.5 2.5H7.5V7.5H2.5ZM8.5 2.5H13.5V7.5H8.5ZM2.5 8.5H7.5V13.5H2.5ZM8.5 8.5H13.5V13.5H8.5Z',
  // Haken — das einzige Zeichen mit zwei Diagonalen
  habits: 'M3.5 8.5L6.5 11.5L12.5 5.5',
  // Drei Zeilen, die letzte kürzer
  tasks: 'M2.5 4.5H13.5M2.5 8.5H13.5M2.5 12.5H9.5',
  // Federkiel, alle Kanten in 45 Grad
  journal: 'M10.5 2.5L13.5 5.5L5.5 13.5H2.5V10.5Z',
  // Uhr: Ring plus Zeiger auf 12 und 3
  study: 'M8.5 3.5V8.5H12.5',
  // Aufgeschlagenes Buch: Rahmen mit Mittelfalz
  uni: 'M2.5 3.5H13.5V12.5H2.5ZM8 3.5V12.5',
  // Fadenkreuz mit innerem Feld
  goals: 'M8.5 2.5V5.5M8.5 11.5V13.5M2.5 8.5H5.5M11.5 8.5H13.5M5.5 5.5H11.5V11.5H5.5Z',
  // Hantel
  sport: 'M2.5 5.5V10.5M4.5 3.5V12.5M4.5 8H11.5M11.5 3.5V12.5M13.5 5.5V10.5',
  // Schieberegler
  settings: 'M2.5 4.5H13.5M2.5 8.5H13.5M2.5 12.5H13.5M5.5 2.5V6.5M10.5 6.5V10.5M6.5 10.5V14.5',

  check: 'M3.5 8.5L6.5 11.5L12.5 5.5',
  plus: 'M8.5 3.5V13.5M3.5 8.5H13.5',
  minus: 'M3.5 8.5H13.5',
  chevron: 'M6.5 3.5L11.5 8.5L6.5 13.5',
  chevronLeft: 'M9.5 3.5L4.5 8.5L9.5 13.5',
  chevronDown: 'M3.5 6.5L8.5 11.5L13.5 6.5',
  search: 'M10.5 10.5L13.5 13.5',
  x: 'M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5',
}

/** Zeichen, die zusätzlich einen Kreis brauchen. Ein Kreis hat keine
 *  Diagonale und ist damit unkritisch. */
const CIRCLE: Partial<Record<IconName, { cx: number; cy: number; r: number }>> = {
  study: { cx: 8.5, cy: 8.5, r: 5 },
  search: { cx: 7, cy: 7, r: 4.5 },
}

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const c = CIRCLE[name]
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      {c && <circle cx={c.cx} cy={c.cy} r={c.r} />}
      <path d={D[name]} />
    </svg>
  )
}
