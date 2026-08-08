/* Hülle für alle Ansichten: Ambient, Navigation, Kopfzeile.
   Desktop bekommt die Icon-Leiste links, das Handy die schwebende
   Kapsel-Navigation unten — gleiche Ziele, andere Anordnung. */

import { NavLink, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AmbientLayer } from '../components/AmbientLayer'
import { Icon, type IconName } from '../components/hud'
import { useSettings } from '../lib/store'
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

  return (
    <>
      <AmbientLayer enabled={settings.ambient} />

      <div className="shell">
        <nav className="rail" aria-label="Module">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} title={n.label} className={`m-${n.color}`}>
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
          </header>

          <Outlet />
        </main>
      </div>

      <nav className="tabbar" aria-label="Module">
        {NAV.filter((n) => n.onTabbar).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className={`m-${n.color}`}>
            <Icon name={n.icon} />
            <span>{n.label.toUpperCase()}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
