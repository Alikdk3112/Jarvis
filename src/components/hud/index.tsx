/* ══════════════════════════════════════════════════════════════════════
   HUD-Bausteine. Einmal gebaut, danach tragen sie jedes Modul.
   Die Optik steckt vollständig in hud.css — hier nur Struktur und Zustand.
   ══════════════════════════════════════════════════════════════════════ */

import type { ReactNode } from 'react'
import type { ModuleColor } from '../../lib/data/types'
import { Icon } from './Icons'

export { Icon } from './Icons'
export type { IconName } from './Icons'

export const colorClass = (c: ModuleColor | undefined): string => `m-${c ?? 'accent'}`

/* ── Glaskachel ───────────────────────────────────────────────────── */
export function GlassTile({
  title,
  meta,
  color = 'accent',
  className = '',
  onTitleClick,
  children,
}: {
  title?: string
  meta?: ReactNode
  color?: ModuleColor
  className?: string
  onTitleClick?: () => void
  children: ReactNode
}) {
  return (
    <section className={`tile ${colorClass(color)} ${className}`}>
      {title && (
        <header className="tile__h">
          <span className="orb" />
          {onTitleClick ? (
            <button type="button" className="tile__t tile__link" onClick={onTitleClick}>
              {title}
            </button>
          ) : (
            <span className="tile__t">{title}</span>
          )}
          {meta !== undefined && <span className="tile__m">{meta}</span>}
        </header>
      )}
      {children}
    </section>
  )
}

/* ── Pille ────────────────────────────────────────────────────────── */
export function Pill({
  label,
  value,
  color = 'accent',
  flat = false,
}: {
  label: string
  value: ReactNode
  color?: ModuleColor | 'alert'
  flat?: boolean
}) {
  return (
    <span className={`pill ${flat ? 'pill--flat' : ''} m-${color}`}>
      <em>{label}</em>
      <b>{value}</b>
    </span>
  )
}

/* ── Runde Checkbox ───────────────────────────────────────────────── */
export function RoundCheck({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className="chk"
      onClick={() => onChange(!checked)}
    >
      <Icon name="check" />
    </button>
  )
}

/* ── DotRow: Wochenquote als Punkte ───────────────────────────────── */
export function DotRow({ filled, total = 7 }: { filled: number; total?: number }) {
  return (
    <span className="dots">
      {Array.from({ length: total }, (_, i) => (
        <i key={i} className={i < filled ? 'on' : undefined} />
      ))}
    </span>
  )
}

/* ── DotMap: Aktivität als Kreise, sieben Zeilen je Woche ─────────── */
export function DotMap({ values, rows = 7 }: { values: number[]; rows?: number }) {
  return (
    <div className="dmap" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }} aria-hidden="true">
      {values.map((v, i) => (
        <i key={i} data-v={v || undefined} />
      ))}
    </div>
  )
}

/* ── ArcGauge: der kleine Ring ────────────────────────────────────── */
const GAUGE_R = 41
const GAUGE_C = 2 * Math.PI * GAUGE_R

export function ArcGauge({
  value,
  label,
  caption,
  color = 'accent',
  size = 132,
  strokeWidth = 6,
  ticks = false,
}: {
  /** 0–1 */
  value: number
  label: ReactNode
  caption?: string
  color?: ModuleColor
  size?: number
  strokeWidth?: number
  ticks?: boolean
}) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className={`gauge ${colorClass(color)}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="trk" cx="50" cy="50" r={GAUGE_R} strokeWidth={strokeWidth} />
        <circle
          className="val"
          cx="50"
          cy="50"
          r={GAUGE_R}
          strokeWidth={strokeWidth}
          stroke="var(--pc)"
          transform="rotate(-90 50 50)"
          strokeDasharray={GAUGE_C.toFixed(1)}
          strokeDashoffset={(GAUGE_C - GAUGE_C * clamped).toFixed(1)}
          style={{ filter: 'drop-shadow(0 0 6px var(--pc))' }}
        />
        {ticks && (
          <>
            <line x1="50" y1="2" x2="50" y2="8" stroke="var(--dimmer)" strokeWidth="1" />
            <line x1="98" y1="50" x2="92" y2="50" stroke="var(--dimmer)" strokeWidth="1" />
            <line x1="50" y1="98" x2="50" y2="92" stroke="var(--dimmer)" strokeWidth="1" />
            <line x1="2" y1="50" x2="8" y2="50" stroke="var(--dimmer)" strokeWidth="1" />
          </>
        )}
      </svg>
      <div className="gauge__c">
        <div className="gauge__n">{label}</div>
        {caption && <div className="gauge__l">{caption}</div>}
      </div>
    </div>
  )
}

/* ── Sparkline: eigene SVG-Kurve, keine Chart-Library ─────────────── */
export function Sparkline({
  values,
  color = 'study',
  firstLabel,
  lastLabel,
  height = 112,
}: {
  values: number[]
  color?: ModuleColor
  firstLabel?: string
  lastLabel?: string
  height?: number
}) {
  const W = 300
  const H = height
  const top = 14
  const bottom = H - 22

  if (values.length < 2) {
    return <p className="empty">Noch zu wenig Daten für eine Kurve.</p>
  }

  const max = Math.max(...values, 1)
  const stepX = W / (values.length - 1)
  const pts = values.map((v, i) => {
    const x = i * stepX
    const y = bottom - (v / max) * (bottom - top)
    return [x, y] as const
  })
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W},${H} L0,${H} Z`
  const last = pts[pts.length - 1]
  const gid = `spark-${color}`

  return (
    <svg
      className={`chart ${colorClass(color)}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ height }}
      role="img"
      aria-label={`Verlauf, zuletzt ${values[values.length - 1]}`}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g style={{ color: `var(--pc)` }}>
        <line className="gl" x1="0" y1={top + (bottom - top) * 0.25} x2={W} y2={top + (bottom - top) * 0.25} />
        <line className="gl" x1="0" y1={top + (bottom - top) * 0.5} x2={W} y2={top + (bottom - top) * 0.5} />
        <line className="gl" x1="0" y1={top + (bottom - top) * 0.75} x2={W} y2={top + (bottom - top) * 0.75} />
        <path d={area} fill={`url(#${gid})`} />
        <path className="ln" d={line} vectorEffect="non-scaling-stroke" />
        <circle className="pt" cx={last[0]} cy={last[1]} r="3.6" />
      </g>
      {firstLabel && <text className="lb" x="2" y={H - 5}>{firstLabel}</text>}
      {lastLabel && <text className="lb" x={W - 48} y={H - 5}>{lastLabel}</text>}
    </svg>
  )
}

/* ── Auswahlgruppe ────────────────────────────────────────────────── */
export function SelectPills<T extends string>({
  options,
  value,
  onChange,
  color = 'accent',
  ariaLabel,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (v: T) => void
  color?: ModuleColor
  ariaLabel: string
}) {
  return (
    <div className={`sel ${colorClass(color)}`} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ── Leerzustand ──────────────────────────────────────────────────── */
export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}
