/* ══════════════════════════════════════════════════════════════════════
   Ring-Hub — das Herzstück des Cockpits.

   Drei konzentrische Bögen von 138° bis 402° (264° Sweep, Lücke unten)
   über einem rotierenden Gitterglobus, um den drei Trabanten in den
   Modulfarben kreisen. Darunter eine Wellenform in der Bogenlücke.

   Der Hub ist keine Deko: Bögen, Zahl, leuchtende Knoten und die
   Wellenamplitude hängen an echten Werten und gleiten weich nach.

   Animiert wird per requestAnimationFrame direkt am DOM — React rendert
   pro Sekunde höchstens einmal neu, nicht sechzig Mal.
   ══════════════════════════════════════════════════════════════════════ */

import { useEffect, useRef } from 'react'

export interface HubFractions {
  /** Tagesfortschritt gesamt, 0–1 — der äußere cyanfarbene Bogen. */
  day: number
  /** Habits erledigt, 0–1 — der mittlere grüne Bogen. */
  hab: number
  /** Lernziel, 0–1 — der innere violette Bogen. */
  stu: number
}

const A0 = 138
const SWEEP = 264
const CX = 200
const CY = 200
const C_ACC = '#00E5FF'
const C_HAB = '#00FF9D'
const C_STU = '#A855F7'

const TRACKS = [
  { r: 158, w: 7, color: C_ACC, key: 'day' as const },
  { r: 134, w: 7, color: C_HAB, key: 'hab' as const },
  { r: 110, w: 7, color: C_STU, key: 'stu' as const },
]

function pt(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function arcPath(r: number, frac: number): string {
  const f = Math.max(0.0001, Math.min(1, frac))
  const [x0, y0] = pt(r, A0)
  const [x1, y1] = pt(r, A0 + SWEEP * f)
  const large = SWEEP * f > 180 ? 1 : 0
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`
}

/* Fester Zufall — der Hub sieht bei jedem Laden gleich aus. */
function makeRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

interface Node { la: number; lo: number; ph: number }
interface Sat { a: number; sp: number; tilt: number; rad: number; ph: number; col: string; key: keyof HubFractions }

const TILT = 0.44

export function ArcHub({
  fractions,
  value,
  label = 'TAGESZIEL',
  small = false,
}: {
  fractions: HubFractions
  /** Die große Zahl in der Mitte, 0–1 — meist identisch mit `fractions.day`. */
  value: number
  label?: string
  small?: boolean
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const waveRef = useRef<HTMLCanvasElement>(null)
  const numRef = useRef<HTMLDivElement>(null)

  // Zielwerte liegen in einem Ref, damit die Animationsschleife sie lesen
  // kann, ohne bei jedem Wert neu aufgesetzt zu werden.
  const target = useRef<HubFractions & { num: number }>({ ...fractions, num: value })
  target.current = { ...fractions, num: value }

  useEffect(() => {
    const svg = svgRef.current
    const cv = cvRef.current
    const wave = waveRef.current
    const num = numRef.current
    if (!svg || !cv || !wave || !num) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gx = cv.getContext('2d')
    const wx = wave.getContext('2d')
    if (!gx || !wx) return

    /* ── Statisches SVG einmal aufbauen ── */
    const ns = 'http://www.w3.org/2000/svg'
    svg.replaceChildren()

    if (!small) {
      // Zwei gegenläufige Ringe, gezeichnet im SVG statt als gedrehte
      // <span>-Quadrate — sonst wächst deren Rahmen beim Drehen über den
      // Bildschirmrand hinaus und die Seite lässt sich seitlich schieben.
      const ringA = document.createElementNS(ns, 'circle')
      ringA.setAttribute('class', 'hub__ring hub__ring--a')
      ringA.setAttribute('cx', String(CX))
      ringA.setAttribute('cy', String(CY))
      ringA.setAttribute('r', '194')
      ringA.setAttribute('fill', 'none')
      ringA.setAttribute('stroke', 'rgba(0,229,255,.17)')
      ringA.setAttribute('stroke-dasharray', '4 8')
      svg.appendChild(ringA)

      const ringB = document.createElementNS(ns, 'g')
      ringB.setAttribute('class', 'hub__ring hub__ring--b')
      const ringBase = document.createElementNS(ns, 'circle')
      ringBase.setAttribute('cx', String(CX))
      ringBase.setAttribute('cy', String(CY))
      ringBase.setAttribute('r', '166')
      ringBase.setAttribute('fill', 'none')
      ringBase.setAttribute('stroke', 'rgba(0,229,255,.06)')
      ringB.appendChild(ringBase)
      const ringLit = document.createElementNS(ns, 'circle')
      ringLit.setAttribute('cx', String(CX))
      ringLit.setAttribute('cy', String(CY))
      ringLit.setAttribute('r', '166')
      ringLit.setAttribute('fill', 'none')
      ringLit.setAttribute('stroke', 'rgba(0,229,255,.36)')
      // zwei helle Segmente gegenüber, Umfang 2·π·166 ≈ 1043
      ringLit.setAttribute('stroke-dasharray', '150 371')
      ringLit.setAttribute('stroke-linecap', 'round')
      ringB.appendChild(ringLit)
      svg.appendChild(ringB)

      const ticks = document.createElementNS(ns, 'g')
      ticks.setAttribute('class', 'hub__ticks')
      for (let i = 0; i < 72; i++) {
        const deg = i * 5
        const long = i % 6 === 0
        const [ax, ay] = pt(184, deg)
        const [bx, by] = pt(long ? 174 : 179, deg)
        const l = document.createElementNS(ns, 'line')
        l.setAttribute('x1', ax.toFixed(1))
        l.setAttribute('y1', ay.toFixed(1))
        l.setAttribute('x2', bx.toFixed(1))
        l.setAttribute('y2', by.toFixed(1))
        l.setAttribute('stroke', `rgba(255,255,255,${long ? 0.22 : 0.09})`)
        l.setAttribute('stroke-width', long ? '1.4' : '1')
        l.setAttribute('stroke-linecap', 'round')
        ticks.appendChild(l)
      }
      svg.appendChild(ticks)
    }

    const valuePaths: SVGPathElement[] = []
    const endCaps: SVGCircleElement[] = []
    for (const t of TRACKS) {
      const trk = document.createElementNS(ns, 'path')
      trk.setAttribute('class', 'trk')
      trk.setAttribute('d', arcPath(t.r, 1))
      trk.setAttribute('stroke-width', String(t.w))
      svg.appendChild(trk)

      const val = document.createElementNS(ns, 'path')
      val.setAttribute('class', 'val')
      val.setAttribute('stroke', t.color)
      val.setAttribute('stroke-width', String(t.w))
      val.style.filter = `drop-shadow(0 0 7px ${t.color})`
      svg.appendChild(val)
      valuePaths.push(val)

      const cap = document.createElementNS(ns, 'circle')
      cap.setAttribute('r', String(t.w / 2 + 1.6))
      cap.setAttribute('fill', t.color)
      cap.style.filter = `drop-shadow(0 0 9px ${t.color})`
      svg.appendChild(cap)
      endCaps.push(cap)
    }

    /* ── Globus aufbauen ── */
    const rnd = makeRandom(12345)
    const latLines: Array<Array<[number, number, number]>> = []
    const lonLines: Array<Array<[number, number, number]>> = []
    for (let i = -2; i <= 2; i++) {
      const a = (i * Math.PI) / 7
      const arr: Array<[number, number, number]> = []
      for (let j = 0; j <= 44; j++) {
        const lo = (j / 44) * 6.283
        arr.push([Math.cos(a) * Math.cos(lo), Math.sin(a), Math.cos(a) * Math.sin(lo)])
      }
      latLines.push(arr)
    }
    for (let i = 0; i < 10; i++) {
      const lo = (i / 10) * 6.283
      const arr: Array<[number, number, number]> = []
      for (let j = 0; j <= 44; j++) {
        const la = -1.5708 + (j / 44) * 3.1416
        arr.push([Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)])
      }
      lonLines.push(arr)
    }
    const nodes: Node[] = Array.from({ length: 22 }, () => ({
      la: (rnd() - 0.5) * 2.5,
      lo: rnd() * 6.283,
      ph: rnd() * 6.283,
    }))
    const sats: Sat[] = [
      { a: 0.4, sp: 0.009, tilt: -0.55, rad: 1.2, ph: 0, col: C_HAB, key: 'hab' },
      { a: 2.1, sp: 0.0068, tilt: 0.62, rad: 1.36, ph: 2.1, col: C_STU, key: 'stu' },
      { a: 4.3, sp: 0.0051, tilt: 0.12, rad: 1.52, ph: 4.4, col: C_ACC, key: 'day' },
    ]

    let rot = 0
    let ph = 0
    const geo = { cx: 0, cy: 0, R: 0, w: 0, h: 0 }

    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv!.clientWidth) {
        geo.w = cv!.clientWidth
        geo.h = cv!.clientHeight
        cv!.width = geo.w * dpr
        cv!.height = geo.h * dpr
        gx!.setTransform(dpr, 0, 0, dpr, 0, 0)
        geo.cx = geo.w / 2
        geo.cy = geo.h * (200 / 352)
        geo.R = geo.w * (78 / 400)
      }
      if (wave!.clientWidth) {
        wave!.width = wave!.clientWidth * dpr
        wave!.height = wave!.clientHeight * dpr
        wx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }

    function project(x: number, y: number, z: number, extra = 0) {
      const r = rot + extra
      const cr = Math.cos(r)
      const sr = Math.sin(r)
      const x1 = x * cr + z * sr
      const z1 = -x * sr + z * cr
      const y1 = y * Math.cos(TILT) - z1 * Math.sin(TILT)
      const z2 = y * Math.sin(TILT) + z1 * Math.cos(TILT)
      return { x: geo.cx + x1 * geo.R, y: geo.cy - y1 * geo.R, z: z2 }
    }

    function orbit(s: Sat, a: number) {
      const x = s.rad * Math.cos(a)
      const z = s.rad * Math.sin(a)
      return project(x, -z * Math.sin(s.tilt), z * Math.cos(s.tilt), s.ph)
    }

    const shown: HubFractions & { num: number } = reduce
      ? { ...target.current }
      : { day: 0, hab: 0, stu: 0, num: 0 }

    function drawGlobe(now: number) {
      if (!geo.w) return
      gx!.clearRect(0, 0, geo.w, geo.h)
      gx!.lineWidth = 1

      for (const set of [latLines, lonLines]) {
        for (const arr of set) {
          for (let i = 1; i < arr.length; i++) {
            const a = project(...arr[i - 1])
            const b = project(...arr[i])
            const t = ((a.z + b.z) / 2 + 1) / 2 // hinten dunkler als vorn
            gx!.strokeStyle = `rgba(120,205,235,${(0.05 + 0.24 * t).toFixed(3)})`
            gx!.beginPath()
            gx!.moveTo(a.x, a.y)
            gx!.lineTo(b.x, b.y)
            gx!.stroke()
          }
        }
      }

      // So viele Knoten leuchten, wie der Tag fortgeschritten ist
      const lit = Math.round(shown.day * nodes.length)
      nodes.forEach((n, i) => {
        const p = project(Math.cos(n.la) * Math.cos(n.lo), Math.sin(n.la), Math.cos(n.la) * Math.sin(n.lo))
        if (p.z <= 0) return
        const on = i < lit
        const pulse = 0.55 + 0.45 * Math.sin(now / 620 + n.ph)
        const depth = 0.5 + 0.5 * p.z
        gx!.fillStyle = on
          ? `rgba(0,255,157,${depth.toFixed(3)})`
          : `rgba(120,200,235,${(depth * 0.4).toFixed(3)})`
        gx!.shadowColor = on ? C_HAB : 'rgba(0,229,255,.5)'
        gx!.shadowBlur = (on ? 9 : 3) * pulse
        gx!.beginPath()
        gx!.arc(p.x, p.y, (on ? 2.0 : 1.1) + (on ? 1.5 : 0.5) * pulse, 0, 6.283)
        gx!.fill()
        gx!.shadowBlur = 0
      })

      // Trabanten — Helligkeit folgt dem jeweiligen Modulwert
      for (const s of sats) {
        gx!.strokeStyle = 'rgba(120,205,235,.10)'
        gx!.beginPath()
        for (let k = 0; k <= 44; k++) {
          const op = orbit(s, (k / 44) * 6.283)
          if (k) gx!.lineTo(op.x, op.y)
          else gx!.moveTo(op.x, op.y)
        }
        gx!.stroke()
        const sp = orbit(s, s.a)
        const lvl = 0.45 + 0.55 * shown[s.key]
        gx!.fillStyle = s.col
        gx!.shadowColor = s.col
        gx!.shadowBlur = 11 * lvl
        gx!.beginPath()
        gx!.arc(sp.x, sp.y, (sp.z > 0 ? 2.5 : 1.4) * lvl + 0.7, 0, 6.283)
        gx!.fill()
        gx!.shadowBlur = 0
      }
    }

    function drawWave() {
      const W = wave!.clientWidth
      const H = wave!.clientHeight
      if (!W) return
      wx!.clearRect(0, 0, W, H)
      wx!.strokeStyle = 'rgba(0,229,255,.13)'
      wx!.lineWidth = 1
      wx!.beginPath()
      wx!.moveTo(0, H / 2)
      wx!.lineTo(W, H / 2)
      wx!.stroke()

      wx!.strokeStyle = 'rgba(0,229,255,.9)'
      wx!.lineWidth = 1.6
      wx!.shadowColor = C_ACC
      wx!.shadowBlur = 7
      wx!.beginPath()
      const amp = 0.12 + shown.day * 0.3
      for (let x = 0; x <= W; x += 2) {
        const t = (x / W) * Math.PI * 5 + ph
        const env = Math.sin((x / W) * Math.PI)
        const y = H / 2 + Math.sin(t) * H * amp * env + Math.sin(t * 2.7 + ph) * H * amp * 0.26 * env
        if (x) wx!.lineTo(x, y)
        else wx!.moveTo(x, y)
      }
      wx!.stroke()
      wx!.shadowBlur = 0
    }

    function paintArcs() {
      TRACKS.forEach((t, i) => {
        const f = shown[t.key]
        valuePaths[i].setAttribute('d', arcPath(t.r, f))
        const [ex, ey] = pt(t.r, A0 + SWEEP * Math.max(0.0001, Math.min(1, f)))
        endCaps[i].setAttribute('cx', ex.toFixed(2))
        endCaps[i].setAttribute('cy', ey.toFixed(2))
      })
      num!.innerHTML = `${Math.round(shown.num * 100)}<sup>%</sup>`
    }

    let raf = 0
    function frame(now: number) {
      if (!document.hidden) {
        if (!reduce) for (const s of sats) s.a += s.sp
        const k = reduce ? 1 : 0.07
        const tgt = target.current
        shown.day += (tgt.day - shown.day) * k
        shown.hab += (tgt.hab - shown.hab) * k
        shown.stu += (tgt.stu - shown.stu) * k
        shown.num += (tgt.num - shown.num) * k
        paintArcs()
        if (!reduce) {
          rot += 0.0042
          ph += 0.055
        }
        drawGlobe(now)
        drawWave()
      }
      raf = requestAnimationFrame(frame)
    }

    size()
    paintArcs()
    raf = requestAnimationFrame(frame)

    let resizeTimer: number | undefined
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(size, 160)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [small])

  return (
    <div className={`hub__c ${small ? 'hub__c--sm' : ''}`} ref={wrapRef}>
      <span className="hub__glow" aria-hidden="true" />
      <canvas className="hub__cv" ref={cvRef} aria-hidden="true" />
      <svg viewBox="0 0 400 352" ref={svgRef} aria-hidden="true" />
      <div className="hub__mid">
        <div
          className="hub__num"
          ref={numRef}
          role="status"
          aria-live="polite"
          aria-label={`${label}: ${Math.round(value * 100)} Prozent`}
        />
        <div className="hub__lab">{label}</div>
      </div>
      <canvas className="hub__wave" ref={waveRef} aria-hidden="true" />
    </div>
  )
}
