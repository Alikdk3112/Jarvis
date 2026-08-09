/* Hülle für alle Ansichten: Ambient, Navigation, Kopfzeile.
   Desktop bekommt die Icon-Leiste links, das Handy die schwebende
   Kapsel-Navigation unten — gleiche Ziele, andere Anordnung. */

import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState } from 'react'
import { AmbientLayer } from '../components/AmbientLayer'
import { ErrorBar } from '../components/ErrorBar'
import { Icon, type IconName } from '../components/hud'
import { useSettings } from '../lib/store'
import { markNavEnd, markNavStart } from '../lib/diag'
import { longDate, pad2, today } from '../lib/date'
import type { ModuleColor } from '../lib/data/types'

interface NavItem {
  to: string
  icon: IconName
  label: string
  color: ModuleColor
  onTabbar?: boolean
}

const NAV: NavItem[] = [
  { to: '/', icon: 'grid', label: 'Home', color: 'accent', onTabbar: true },
  { to: '/habits', icon: 'check', label: 'Habits', color: 'habits', onTabbar: true },
  { to: '/study', icon: 'clock', label: 'Study', color: 'study', onTabbar: true },
  { to: '/tasks', icon: 'list', label: 'Tasks', color: 'accent', onTabbar: true },
  { to: '/journal', icon: 'pen', label: 'Log', color: 'journal', onTabbar: true },
  { to: '/uni', icon: 'book', label: 'Uni', color: 'study' },
  { to: '/goals', icon: 'target', label: 'Goals', color: 'goals' },
  { to: '/sport', icon: 'pulse', label: 'Sport', color: 'sport' },
]

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="clock">
      {pad2(now.getHours())}:{pad2(now.getMinutes())}
      <small>:{pad2(now.getSeconds())}</small>
    </span>
  )
}

export function CockpitLayout() {
  const { settings } = useSettings()
  const { pathname } = useLocation()

  /* Beim Wechsel nach oben springen — vor dem Malen, damit es nicht ruckt.
     Ohne das behält der Browser die alte Scrollposition: Man tippt auf
     „Habits", landet mitten in der Seite und denkt, es sei nichts passiert. */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  /* Nach dem ersten Bild der neuen Seite die Messung abschließen — zwei
     Bilder warten, weil das erste nur der Zeitpunkt ist, an dem React fertig
     ist, nicht der, an dem etwas auf dem Schirm steht. */
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => markNavEnd(pathname)))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <>
      <AmbientLayer enabled={settings.ambient} />
      <ErrorBar />

      <div className="shell">
        <nav className="rail" aria-label="Module">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              title={n.label}
              className={`m-${n.color}`}
              onPointerDown={() => markNavStart(n.to)}
            >
              <Icon name={n.icon} />
              <span className="sr-only">{n.label}</span>
            </NavLink>
          ))}
          <span className="rail__gap" />
          <NavLink to="/settings" title="Einstellungen">
            <Icon name="gear" />
            <span className="sr-only">Einstellungen</span>
          </NavLink>
        </nav>

        <main className="shell__main">
          <header className="hdr">
            <span className="hdr__st">
              <span className="orb" />
              SYSTEM ONLINE
            </span>
            <span className="hdr__d">{longDate(today())}</span>
            <span className="hdr__sp" />
            <Clock />
            {/* Auf dem Handy der einzige Weg in die Einstellungen: Die
                Icon-Leiste ist dort ausgeblendet, und in die Tab-Leiste
                passt kein sechstes Ziel mehr. Am Schreibtisch überflüssig,
                deshalb per CSS nur schmal sichtbar. */}
            <NavLink to="/settings" className="hdr__set" aria-label="Einstellungen">
              <Icon name="gear" />
            </NavLink>
          </header>

          {/* Der Schlüssel wechselt mit der Adresse — dadurch läuft die
              Einblendung bei jedem Wechsel neu und der Wechsel wird sichtbar. */}
          <div className="view" key={pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="tabbar" aria-label="Module">
        {NAV.filter((n) => n.onTabbar).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={`m-${n.color}`}
            onPointerDown={() => markNavStart(n.to)}
          >
            <Icon name={n.icon} />
            <span>{n.label.toUpperCase()}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
