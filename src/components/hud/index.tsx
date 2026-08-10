/* ══════════════════════════════════════════════════════════════════════
   LEDGER — Bausteine als Komponenten.

   Die Optik steckt vollständig in hud.css; hier nur Struktur und
   Zustand. Es gibt keine Kachel-Komponente, weil es keine Kachel gibt —
   `Sec` ist an ihre Stelle getreten: eine 22px-Kopfzeile mit
   Signalstrich, Label und optionaler Kennzahl, darunter eine 1px-Regel.
   ══════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react'
import type { ModuleColor } from '../../lib/data/types'
import { Icon } from './Icons'

export { Icon } from './Icons'
export type { IconName } from './Icons'

export const mod = (c: ModuleColor | undefined): string => `m-${c ?? 'tasks'}`

/* ── Sektion ─────────────────────────────────────────────────────────── */
export function Sec({
  title,
  color = 'tasks',
  metaLabel,
  metaValue,
  right,
  grouped = false,
  children,
}: {
  title: string
  color?: ModuleColor
  /** Legende der Kennzahl im Kopf, links vom Wert. */
  metaLabel?: string
  metaValue?: ReactNode
  /** Freier Platz rechts im Kopf, etwa ein Segment-Umschalter. */
  right?: ReactNode
  /** Teil einer Panelgruppe: stößt ohne Abstand an die Sektion darüber. */
  grouped?: boolean
  children: ReactNode
}) {
  return (
    <section className={`sec ${grouped ? 'sec--grouped' : ''} ${mod(color)}`}>
      <header className="sec__h">
        <span className="sec__bar" aria-hidden="true" />
        <h2 className="sec__t">{title}</h2>
        <span className="sec__sp" />
        {metaValue !== undefined && (
          <span className="sec__k">
            {metaLabel && <em>{metaLabel}</em>}
            <b>{metaValue}</b>
          </span>
        )}
        {right}
      </header>
      <div className="sec__b">{children}</div>
    </section>
  )
}

/* ── Zeile ───────────────────────────────────────────────────────────── */
export function Row({
  warn = false,
  done = false,
  onClick,
  children,
}: {
  warn?: boolean
  done?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  const cls = `row ${onClick ? 'row--act' : ''} ${warn ? 'row--warn' : ''} ${done ? 'row__done' : ''}`
  if (!onClick) return <div className={cls}>{children}</div>
  return (
    <div className={cls} role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}>
      {children}
    </div>
  )
}

/* ── Kennzahlpaar in einer Zeile ─────────────────────────────────────── */
export function Kv({ label, value, unit }: { label: string; value: ReactNode; unit?: string }) {
  return (
    <div className="kv">
      <em>{label}</em>
      <b>
        {value}
        {unit && <span className="unit">{unit}</span>}
      </b>
    </div>
  )
}

/* ── Leitzahl — höchstens eine pro Ansicht ───────────────────────────── */
export function Lead({
  value,
  unit,
  label,
  warn = false,
}: {
  value: ReactNode
  unit?: string
  label: string
  warn?: boolean
}) {
  return (
    <div className={`lead ${warn ? 'lead--warn' : ''}`}>
      <div className="lead__v">
        {value}
        {unit && <sup>{unit}</sup>}
      </div>
      <div className="lead__l">{label}</div>
    </div>
  )
}

/* ── Leerwert ────────────────────────────────────────────────────────── */
export const Nil = () => <span className="nil">–</span>

/* ── Knopf ───────────────────────────────────────────────────────────── */
export function Btn({
  kind = 'sec',
  onClick,
  disabled,
  type = 'button',
  children,
}: {
  kind?: 'sec' | 'pri' | 'del'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  children: ReactNode
}) {
  const k = kind === 'pri' ? 'btn--p' : kind === 'del' ? 'btn--x' : ''
  return (
    <button type={type} className={`btn ${k}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

/** Löschen und Schließen: das Kreuz ist im System das einzige Zeichen
 *  dafür — ein Mülleimer wäre ein sechzehntes Icon für dieselbe Sache. */
export function IconBtn({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: 'x' | 'chevron' | 'chevronDown' | 'chevronLeft' | 'plus' | 'minus' | 'check'
  label: string
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`ibtn ${danger ? 'ibtn--x' : ''}`}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
    >
      <Icon name={icon} />
    </button>
  )
}

/* ── Segment-Umschalter ──────────────────────────────────────────────
   Ersetzt Pille, Kippschalter und Auswahlgruppe. Auch jedes AN | AUS. */
export function Seg<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
  ariaLabel: string
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Ein/Aus als Zwei-Segment-Umschalter — es gibt keinen Kippschalter. */
export function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  ariaLabel: string
}) {
  return (
    <Seg
      options={[
        { value: 'on', label: 'An' },
        { value: 'off', label: 'Aus' },
      ]}
      value={checked ? 'on' : 'off'}
      onChange={(v) => onChange(v === 'on')}
      ariaLabel={ariaLabel}
    />
  )
}

/* ── Checkbox ────────────────────────────────────────────────────────── */
export function Check({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="chk"
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <Icon name="check" />
    </button>
  )
}

/* ── Chip — ein Wort, kein Objekt ─────────────────────────────────────── */
export function Chip({ children, color }: { children: ReactNode; color?: ModuleColor }) {
  return <span className={`chip ${color ? mod(color) : ''}`}>{children}</span>
}

/* ── Lampe und Statuszeile ───────────────────────────────────────────── */
export function Status({
  on,
  label,
  color = 'tasks',
}: {
  on: boolean
  label: string
  color?: ModuleColor
}) {
  return (
    <span className={`status ${mod(color)}`}>
      <i className={`lamp ${on ? '' : 'lamp--off'}`} aria-hidden="true" />
      {label}
    </span>
  )
}

/* ── Ring — drei Bögen, kein Globus, keine Rotation ──────────────────── */
const R = [58, 48, 38]

export function Ring({
  arcs,
  center,
  small = false,
}: {
  /** Bis zu drei Werte 0–1, außen nach innen, je mit eigener Farbe. */
  arcs: Array<{ value: number; color: ModuleColor }>
  center?: ReactNode
  small?: boolean
}) {
  const radii = small ? [53, 44, 35] : R
  return (
    <div className="ring">
      <svg viewBox="0 0 132 132" aria-hidden="true">
        {arcs.map((a, i) => {
          const r = radii[i]
          const c = 2 * Math.PI * r
          const v = Math.max(0, Math.min(1, a.value))
          return (
            <g key={i} className={mod(a.color)}>
              <circle className="ring__trk" cx="66" cy="66" r={r} />
              <circle
                className="ring__val"
                cx="66"
                cy="66"
                r={r}
                stroke="var(--pc)"
                strokeDasharray={c.toFixed(1)}
                strokeDashoffset={(c - c * v).toFixed(1)}
                transform="rotate(-90 66 66)"
              />
            </g>
          )
        })}
      </svg>
      {center && <div className="ring__c">{center}</div>}
    </div>
  )
}

export function RingLegend({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; color: ModuleColor }>
}) {
  return (
    <div className="ring__leg">
      {items.map((it) => (
        <div key={it.label} className={mod(it.color)}>
          <i style={{ color: 'var(--pc)' }} aria-hidden="true" />
          {it.label}
          <b>{it.value}</b>
        </div>
      ))}
    </div>
  )
}

/* ── Balkendiagramm ──────────────────────────────────────────────────── */
export function Bars({
  values,
  color = 'tasks',
  firstLabel,
  lastLabel,
}: {
  values: number[]
  color?: ModuleColor
  firstLabel?: string
  lastLabel?: string
}) {
  const max = Math.max(...values, 1)
  return (
    <div className={mod(color)}>
      <div className="bars" role="img" aria-label={`Verlauf, zuletzt ${values[values.length - 1] ?? 0}`}>
        {values.map((v, i) => (
          <i
            key={i}
            style={{ height: `${Math.max(v > 0 ? 2 : 0, (v / max) * 100)}%` }}
            data-today={i === values.length - 1 ? '1' : undefined}
          />
        ))}
      </div>
      {(firstLabel || lastLabel) && (
        <div className="axis">
          <span>{firstLabel}</span>
          <span>{lastLabel}</span>
        </div>
      )}
    </div>
  )
}

/* ── Sparkline — nur Linie, keine Fläche, kein Punkt ─────────────────── */
export function Spark({ values, color = 'tasks' }: { values: number[]; color?: ModuleColor }) {
  if (values.length < 2) return <p className="empty">Zu wenig Daten für eine Kurve.</p>
  const max = Math.max(...values, 1)
  const step = 300 / (values.length - 1)
  const d = values
    .map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(38 - (v / max) * 34).toFixed(1)}`)
    .join(' ')
  return (
    <svg className={`spark ${mod(color)}`} viewBox="0 0 300 40" preserveAspectRatio="none" role="img"
      aria-label={`Verlauf, zuletzt ${values[values.length - 1]}`}>
      <path d={d} />
    </svg>
  )
}

/* ── Fortschrittsbalken ──────────────────────────────────────────────── */
export function PBar({
  value,
  target,
  color = 'goals',
}: {
  /** 0–100 */
  value: number
  /** Optionale Zielmarke in Prozent — wo man heute stehen müsste. */
  target?: number | null
  color?: ModuleColor
}) {
  return (
    <div className={`pbar ${mod(color)}`} role="img" aria-label={`${value} Prozent`}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      {target != null && <u style={{ left: `${Math.max(0, Math.min(100, target))}%` }} />}
    </div>
  )
}

/* ── Heatmap — 140 Tage, fünf feste Stufen ───────────────────────────── */
export function Heatmap({ values, titles }: { values: number[]; titles?: string[] }) {
  return (
    <>
      <div className="hmap" role="img" aria-label={`Aktivität der letzten ${values.length} Tage`}>
        {values.map((v, i) => (
          <i key={i} data-v={v || undefined} title={titles?.[i]} />
        ))}
      </div>
      <div className="hleg" aria-hidden="true">
        <span>0</span>
        <i style={{ background: 'var(--hm-0)' }} />
        <i style={{ background: 'var(--hm-1)' }} />
        <i style={{ background: 'var(--hm-2)' }} />
        <i style={{ background: 'var(--hm-3)' }} />
        <i style={{ background: 'var(--hm-4)' }} />
        <span>4</span>
      </div>
    </>
  )
}

/* ── Leerzeile, Ladezeile, Fehlerzeile ───────────────────────────────── */
export const Empty = ({ children }: { children: ReactNode }) => <p className="empty">{children}</p>
export const Loading = () => <p className="empty">LADEN</p>

export function ErrLine({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div className="errline" role="alert">
      <span style={{ flex: 1 }}>{children}</span>
      {onRetry && <Btn onClick={onRetry}>Erneut</Btn>}
    </div>
  )
}

/* ── Rückgängig-Zeile — ersetzt jede Toast-Blase ─────────────────────── */
export function UndoRow({ label, onUndo }: { label: string; onUndo: () => void }) {
  return (
    <div className="undo">
      <span>{label}</span>
      <Btn onClick={onUndo}>Rückgängig</Btn>
      <span className="kbd">U</span>
    </div>
  )
}

/* ── Formularbereich — die einzige Fläche mit Rahmen ─────────────────── */
export function Form({ onSubmit, children }: { onSubmit?: (e: React.FormEvent) => void; children: ReactNode }) {
  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
    </form>
  )
}
