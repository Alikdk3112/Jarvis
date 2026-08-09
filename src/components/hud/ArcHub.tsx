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
const COS_TILT = Math.cos(TILT)
const SIN_TILT = Math.sin(TILT)

/* ── Einmal je Sitzung, nicht je Besuch ──────────────────────────────
   Gitter und Knoten des Globus sind bei jedem Aufbau identisch — sie hängen
   an nichts, was sich ändert. Früher entstanden bei jedem Wechsel zurück
   aufs Cockpit 15 Linienzüge à 45 Punkten neu; jetzt liegen sie hier. */

/* Stützpunkte je Linie. Der Globus misst rund 150 Bildpunkte; bei 24
   Punkten je Linie liegt jeder Abschnitt unter zehn Punkten, gebogen wirkt
   das identisch. Vorher waren es 45 — also fast doppelt so viel Rechnerei
   für einen Unterschied, den man nicht sehen kann. */
const STEPS = 24

const LAT_LINES: Array<Array<[number, number, number]>> = []
for (let i = -2; i <= 2; i++) {
  const a = (i * Math.PI) / 7
  const arr: Array<[number, number, number]> = []
  for (let j = 0; j <= STEPS; j++) {
    const lo = (j / STEPS) * 6.283
    arr.push([Math.cos(a) * Math.cos(lo), Math.sin(a), Math.cos(a) * Math.sin(lo)])
  }
  LAT_LINES.push(arr)
}

const LON_LINES: Array<Array<[number, number, number]>> = []
for (let i = 0; i < 10; i++) {
  const lo = (i / 10) * 6.283
  const arr: Array<[number, number, number]> = []
  for (let j = 0; j <= STEPS; j++) {
    const la = -1.5708 + (j / STEPS) * 3.1416
    arr.push([Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)])
  }
  LON_LINES.push(arr)
}

const NODES: Node[] = (() => {
  const rnd = makeRandom(12345)
  return Array.from({ length: 22 }, () => ({
    la: (rnd() - 0.5) * 2.5,
    lo: rnd() * 6.283,
    ph: rnd() * 6.283,
  }))
})()

const NS = 'http://www.w3.org/2000/svg'

/* Ringe und Teilstriche sind ebenfalls immer gleich: 75 Elemente mit rund
   300 Attributen. Einmal bauen, danach nur noch kopieren. */
let chromeTemplate: SVGGElement | null = null

function hubChrome(): SVGGElement {
  if (chromeTemplate) return chromeTemplate.cloneNode(true) as SVGGElement

  const g = document.createElementNS(NS, 'g')

  // Zwei gegenläufige Ringe, gezeichnet im SVG statt als gedrehte
  // <span>-Quadrate — sonst wächst deren Rahmen beim Drehen über den
  // Bildschirmrand hinaus und die Seite lässt sich seitlich schieben.
  const ringA = document.createElementNS(NS, 'circle')
  ringA.setAttribute('class', 'hub__ring hub__ring--a')
  ringA.setAttribute('cx', String(CX))
  ringA.setAttribute('cy', String(CY))
  ringA.setAttribute('r', '194')
  ringA.setAttribute('fill', 'none')
  ringA.setAttribute('stroke', 'rgba(0,229,255,.17)')
  ringA.setAttribute('stroke-dasharray', '4 8')
  g.appendChild(ringA)

  const ringB = document.createElementNS(NS, 'g')
  ringB.setAttribute('class', 'hub__ring hub__ring--b')
  const ringBase = document.createElementNS(NS, 'circle')
  ringBase.setAttribute('cx', String(CX))
  ringBase.setAttribute('cy', String(CY))
  ringBase.setAttribute('r', '166')
  ringBase.setAttribute('fill', 'none')
  ringBase.setAttribute('stroke', 'rgba(0,229,255,.06)')
  ringB.appendChild(ringBase)
  const ringLit = document.createElementNS(NS, 'circle')
  ringLit.setAttribute('cx', String(CX))
  ringLit.setAttribute('cy', String(CY))
  ringLit.setAttribute('r', '166')
  ringLit.setAttribute('fill', 'none')
  ringLit.setAttribute('stroke', 'rgba(0,229,255,.36)')
  // zwei helle Segmente gegenüber, Umfang 2·π·166 ≈ 1043
  ringLit.setAttribute('stroke-dasharray', '150 371')
  ringLit.setAttribute('stroke-linecap', 'round')
  ringB.appendChild(ringLit)
  g.appendChild(ringB)

  const ticks = document.createElementNS(NS, 'g')
  ticks.setAttribute('class', 'hub__ticks')
  for (let i = 0; i < 72; i++) {
    const deg = i * 5
    const long = i % 6 === 0
    const [ax, ay] = pt(184, deg)
    const [bx, by] = pt(long ? 174 : 179, deg)
    const l = document.createElementNS(NS, 'line')
    l.setAttribute('x1', ax.toFixed(1))
    l.setAttribute('y1', ay.toFixed(1))
    l.setAttribute('x2', bx.toFixed(1))
    l.setAttribute('y2', by.toFixed(1))
    l.setAttribute('stroke', `rgba(255,255,255,${long ? 0.22 : 0.09})`)
    l.setAttribute('stroke-width', long ? '1.4' : '1')
    l.setAttribute('stroke-linecap', 'round')
    ticks.appendChild(l)
  }
  g.appendChild(ticks)

  chromeTemplate = g
  return g.cloneNode(true) as SVGGElement
}

export function ArcHub({
  fractions,
  value,
  label = 'TAGESZIEL',
  small = false,
  animate = true,
}: {
  fractions: HubFractions
  /** Die große Zahl in der Mitte, 0–1 — meist identisch mit `fractions.day`. */
  value: number
  label?: string
  small?: boolean
  /** Dreht sich der Globus? Aus den Einstellungen. Steht er still, wird er
   *  einmal gezeichnet und die Schleife hält an — gemessen acht Bilder pro
   *  Sekunde Unterschied auf einem langsamen Gerät. */
  animate?: boolean
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

    const reduce = !animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gx = cv.getContext('2d')
    const wx = wave.getContext('2d')
    if (!gx || !wx) return

    /* Zahl und Prozentzeichen einmal aufbauen; danach wird nur noch der
       Text im linken Knoten ausgetauscht. */
    const numValue = document.createElement('span')
    const numSup = document.createElement('sup')
    numSup.textContent = '%'
    num.replaceChildren(numValue, numSup)

    /* ── Statisches SVG einmal aufbauen ── */
    svg.replaceChildren()
    if (!small) svg.appendChild(hubChrome())

    const valuePaths: SVGPathElement[] = []
    const endCaps: SVGCircleElement[] = []
    for (const t of TRACKS) {
      const trk = document.createElementNS(NS, 'path')
      trk.setAttribute('class', 'trk')
      trk.setAttribute('d', arcPath(t.r, 1))
      trk.setAttribute('stroke-width', String(t.w))
      svg.appendChild(trk)

      const val = document.createElementNS(NS, 'path')
      val.setAttribute('class', 'val')
      val.setAttribute('stroke', t.color)
      val.setAttribute('stroke-width', String(t.w))
      val.style.filter = `drop-shadow(0 0 7px ${t.color})`
      svg.appendChild(val)
      valuePaths.push(val)

      const cap = document.createElementNS(NS, 'circle')
      cap.setAttribute('r', String(t.w / 2 + 1.6))
      cap.setAttribute('fill', t.color)
      cap.style.filter = `drop-shadow(0 0 9px ${t.color})`
      svg.appendChild(cap)
      endCaps.push(cap)
    }

    /* Die Trabanten wandern beim Laufen (`s.a` wächst), deshalb bekommt jede
       Instanz eigene — anders als Gitter und Knoten, die sich nie ändern. */
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

    /* Sinus und Kosinus der Drehung galten je Punkt neu berechnet.

       `project` läuft rund achthundertmal je Bild; jeder Aufruf rief
       viermal eine trigonometrische Funktion auf — zweimal für die
       Drehung, die innerhalb eines Bildes konstant ist, und zweimal für
       die Neigung, die überhaupt nie wechselt. Das waren dreitausend
       Aufrufe je Bild für zwei tatsächlich verschiedene Werte.

       Jetzt wird je Bild einmal vorgerechnet; die Neigung steht als
       Konstante ganz oben. Für die Trabanten, die einen festen Versatz
       mitbringen, gibt es eine eigene kleine Ablage — drei Werte, die
       sich nur mit der Drehung ändern. */
    let cosRot = 1
    let sinRot = 0
    const satTrig = new Map<number, { c: number; s: number }>()

    function updateTrig() {
      cosRot = Math.cos(rot)
      sinRot = Math.sin(rot)
      for (const s of sats) satTrig.set(s.ph, { c: Math.cos(rot + s.ph), s: Math.sin(rot + s.ph) })
    }

    function projectWith(x: number, y: number, z: number, cr: number, sr: number) {
      const x1 = x * cr + z * sr
      const z1 = -x * sr + z * cr
      const y1 = y * COS_TILT - z1 * SIN_TILT
      const z2 = y * SIN_TILT + z1 * COS_TILT
      return { x: geo.cx + x1 * geo.R, y: geo.cy - y1 * geo.R, z: z2 }
    }

    function project(x: number, y: number, z: number) {
      return projectWith(x, y, z, cosRot, sinRot)
    }

    // Neigung und Radius eines Trabanten stehen fest — einmal vorrechnen.
    const satGeo = sats.map((s) => ({ sinTilt: Math.sin(s.tilt), cosTilt: Math.cos(s.tilt) }))

    function orbit(s: Sat, a: number, i: number) {
      const x = s.rad * Math.cos(a)
      const z = s.rad * Math.sin(a)
      const g = satGeo[i]
      const t = satTrig.get(s.ph) ?? { c: cosRot, s: sinRot }
      return projectWith(x, -z * g.sinTilt, z * g.cosTilt, t.c, t.s)
    }

    const shown: HubFractions & { num: number } = reduce
      ? { ...target.current }
      : { day: 0, hab: 0, stu: 0, num: 0 }

    function drawGlobe(now: number) {
      if (!geo.w) return
      gx!.clearRect(0, 0, geo.w, geo.h)
      gx!.lineWidth = 1

      // Jeder Strich einzeln wären rund 660 stroke()-Aufrufe pro Bild.
      // Stattdessen nach Tiefe in fünf Helligkeitsstufen einsortieren und je
      // Stufe einen einzigen Pfad zeichnen — gleiche Optik, fünf Aufrufe.
      const bands = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()]
      for (const set of [LAT_LINES, LON_LINES]) {
        for (const arr of set) {
          let prev = project(arr[0][0], arr[0][1], arr[0][2])
          for (let i = 1; i < arr.length; i++) {
            const cur = project(arr[i][0], arr[i][1], arr[i][2])
            const t = ((prev.z + cur.z) / 2 + 1) / 2 // hinten dunkler als vorn
            const band = bands[Math.min(4, (t * 5) | 0)]
            band.moveTo(prev.x, prev.y)
            band.lineTo(cur.x, cur.y)
            prev = cur
          }
        }
      }
      for (let i = 0; i < 5; i++) {
        gx!.strokeStyle = `rgba(120,205,235,${(0.05 + 0.24 * ((i + 0.5) / 5)).toFixed(3)})`
        gx!.stroke(bands[i])
      }

      // So viele Knoten leuchten, wie der Tag fortgeschritten ist
      const lit = Math.round(shown.day * NODES.length)
      NODES.forEach((n, i) => {
        const p = project(Math.cos(n.la) * Math.cos(n.lo), Math.sin(n.la), Math.cos(n.la) * Math.sin(n.lo))
        if (p.z <= 0) return
        const on = i < lit
        const pulse = 0.55 + 0.45 * Math.sin(now / 620 + n.ph)
        const depth = 0.5 + 0.5 * p.z
        const r = (on ? 2.0 : 1.1) + (on ? 1.5 : 0.5) * pulse
        // Halo statt shadowBlur: derselbe Eindruck, ein Bruchteil der Kosten.
        gx!.fillStyle = on
          ? `rgba(0,255,157,${(0.16 * pulse).toFixed(3)})`
          : `rgba(0,229,255,${(0.08 * pulse).toFixed(3)})`
        gx!.beginPath()
        gx!.arc(p.x, p.y, r * 2.6, 0, 6.283)
        gx!.fill()
        gx!.fillStyle = on
          ? `rgba(0,255,157,${depth.toFixed(3)})`
          : `rgba(120,200,235,${(depth * 0.4).toFixed(3)})`
        gx!.beginPath()
        gx!.arc(p.x, p.y, r, 0, 6.283)
        gx!.fill()
      })

      // Trabanten — Helligkeit folgt dem jeweiligen Modulwert
      sats.forEach((s, si) => {
        gx!.strokeStyle = 'rgba(120,205,235,.10)'
        gx!.beginPath()
        for (let k = 0; k <= STEPS; k++) {
          const op = orbit(s, (k / STEPS) * 6.283, si)
          if (k) gx!.lineTo(op.x, op.y)
          else gx!.moveTo(op.x, op.y)
        }
        gx!.stroke()
        const sp = orbit(s, s.a, si)
        const lvl = 0.45 + 0.55 * shown[s.key]
        const sr = (sp.z > 0 ? 2.5 : 1.4) * lvl + 0.7
        gx!.fillStyle = s.col + '33'
        gx!.beginPath()
        gx!.arc(sp.x, sp.y, sr * 2.8, 0, 6.283)
        gx!.fill()
        gx!.fillStyle = s.col
        gx!.beginPath()
        gx!.arc(sp.x, sp.y, sr, 0, 6.283)
        gx!.fill()
      })
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

      // Kurve einmal berechnen, zweimal zeichnen: breit und blass als
      // Schimmer, darüber dünn und hell. Ersetzt das teure shadowBlur.
      const wavePath = new Path2D()
      const amp = 0.12 + shown.day * 0.3
      for (let x = 0; x <= W; x += 2) {
        const t = (x / W) * Math.PI * 5 + ph
        const env = Math.sin((x / W) * Math.PI)
        const y = H / 2 + Math.sin(t) * H * amp * env + Math.sin(t * 2.7 + ph) * H * amp * 0.26 * env
        if (x) wavePath.lineTo(x, y)
        else wavePath.moveTo(x, y)
      }
      wx!.strokeStyle = 'rgba(0,229,255,.18)'
      wx!.lineWidth = 5
      wx!.stroke(wavePath)
      wx!.strokeStyle = 'rgba(0,229,255,.9)'
      wx!.lineWidth = 1.6
      wx!.stroke(wavePath)
    }

    /* Nur schreiben, wenn sich das Ergebnis wirklich unterscheidet.

       Der Angleich an den Zielwert nähert sich exponentiell — er kommt nie
       exakt an. Deshalb wurden hier bisher dauerhaft, sechzigmal je
       Sekunde, drei Pfade und sechs Attribute neu gesetzt, obwohl das Bild
       längst stand. Jede Änderung an `d` zwingt WebKit, den daran
       hängenden Weichzeichner neu zu rastern; auf dem Handy ist das die
       teuerste Einzelheit im Hub. */
    const drawn = [-1, -1, -1]
    let drawnNum = -1

    function paintArcs() {
      TRACKS.forEach((t, i) => {
        const f = Math.max(0, Math.min(1, shown[t.key]))
        // Auf ein Tausendstel gerundet — feiner als ein Bildpunkt.
        const q = Math.round(f * 1000)
        if (q === drawn[i]) return
        drawn[i] = q
        valuePaths[i].setAttribute('d', arcPath(t.r, f))
        const [ex, ey] = pt(t.r, A0 + SWEEP * Math.max(0.0001, f))
        endCaps[i].setAttribute('cx', ex.toFixed(2))
        endCaps[i].setAttribute('cy', ey.toFixed(2))
      })
      const pct = Math.round(shown.num * 100)
      if (pct !== drawnNum) {
        drawnNum = pct
        // textContent statt innerHTML: Letzteres liest bei jedem Bild einen
        // HTML-Schnipsel neu ein. Das <sup> steht fest daneben.
        numValue.textContent = String(pct)
      }
    }

    let raf = 0
    let lastPaint = 0
    let visible = true

    /* Läuft der Hub aus dem Bild — etwa weil weiter unten gelesen wird —,
       braucht ihn niemand zu zeichnen. Ohne das lief die Schleife auch
       dann weiter, wenn vom Hub kein Pixel mehr zu sehen war. */
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    io.observe(cv)

    /* Steht alles still — keine Bewegung gewünscht, Zielwerte erreicht —,
       hält die Schleife ganz an, statt sechzigmal je Sekunde festzustellen,
       dass es nichts zu tun gibt. Ein neuer Wert startet sie wieder. */
    let settled = false
    function atTarget(): boolean {
      const t = target.current
      return (
        Math.abs(t.day - shown.day) < 0.0005 &&
        Math.abs(t.hab - shown.hab) < 0.0005 &&
        Math.abs(t.stu - shown.stu) < 0.0005 &&
        Math.abs(t.num - shown.num) < 0.0005
      )
    }

    function frame(now: number) {
      if (reduce && settled) {
        if (atTarget()) {
          // Weiter im Leerlauf beobachten, ob sich ein Zielwert ändert —
          // das kostet einen Vergleich je Bild, nicht ein ganzes Bild.
          raf = requestAnimationFrame(frame)
          return
        }
        settled = false
      }
      if (!document.hidden && visible) {
        if (!reduce) for (const s of sats) s.a += s.sp
        const k = reduce ? 1 : 0.07
        const tgt = target.current
        // Unter einem Zehntausendstel ist der Rest nicht mehr darstellbar —
        // dann aufsetzen statt sich ewig weiter anzunähern.
        const ease = (from: number, to: number) =>
          Math.abs(to - from) < 0.0001 ? to : from + (to - from) * k
        shown.day = ease(shown.day, tgt.day)
        shown.hab = ease(shown.hab, tgt.hab)
        shown.stu = ease(shown.stu, tgt.stu)
        shown.num = ease(shown.num, tgt.num)
        paintArcs()
        // Bögen und Zahl jedes Bild — das sind billige Attributschreibungen.
        // Die Leinwand nur etwa 30×/s: die Drehung ist zu langsam, als dass
        // man den Unterschied sähe, halbiert aber die Zeichenlast.
        if (now - lastPaint >= 32) {
          const dt = lastPaint ? Math.min(4, (now - lastPaint) / 16.7) : 1
          lastPaint = now
          if (!reduce) {
            rot += 0.0042 * dt
            ph += 0.055 * dt
          }
          updateTrig()
          drawGlobe(now)
          drawWave()
        }
        if (reduce && atTarget()) settled = true
      }
      raf = requestAnimationFrame(frame)
    }

    size()
    updateTrig()
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
      io.disconnect()
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
    }
  }, [small, animate])

  return (
    <div className={`hub__c ${small ? 'hub__c--sm' : ''}`} ref={wrapRef}>
      <span className="hub__glow" aria-hidden="true" />
      <canvas className="hub__cv" ref={cvRef} aria-hidden="true" />
      <svg viewBox="0 0 400 352" ref={svgRef} aria-hidden="true" />
      <div className="hub__mid">
        {/* Kein aria-live: Die Zahl gleitet nach und änderte sich dabei
            sechzigmal je Sekunde — eine Sprachausgabe hätte ununterbrochen
            gezählt. Den Wert trägt jetzt das Label, einmal und ruhig. */}
        <div
          className="hub__num"
          ref={numRef}
          aria-hidden="true"
        />
        <span className="sr-only">{`${label}: ${Math.round(value * 100)} Prozent`}</span>
        <div className="hub__lab">{label}</div>
      </div>
      <canvas className="hub__wave" ref={waveRef} aria-hidden="true" />
    </div>
  )
}
