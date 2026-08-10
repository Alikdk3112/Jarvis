/* ══════════════════════════════════════════════════════════════════════
   Hülle: Kopfzeile, Navigation, Ansichtsbereich.

   Am Schreibtisch stehen alle neun Ziele in der 52px-Leiste — kein
   Überlaufmenü, nichts versteckt. Am Handy fünf Tabs plus ein
   beschrifteter INDEX-Knopf in der Kopfzeile; er führt auf eine
   vollflächige Liste aller neun Ansichten.

   Damit ist der Fehler der Vorgängerfassung strukturell behoben: dort
   waren Einstellungen, Uni, Goals und Sport am Telefon unerreichbar,
   weil die Leiste ausgeblendet war und in der Tab-Kapsel kein Platz.
   ══════════════════════════════════════════════════════════════════════ */

import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect, useState } from 'react'
import { ErrorBar } from '../components/ErrorBar'
import { Icon, type IconName } from '../components/hud'
import { useSettings } from '../lib/store'
import { applyTheme } from '../lib/theme'
import { markNavEnd, markNavStart } from '../lib/diag'
import { pad2 } from '../lib/date'
import { isLocalMode } from '../lib/data'
import type { ModuleColor } from '../lib/data/types'

interface NavItem {
  to: string
  icon: IconName
  /** Drei Buchstaben — ein Werkzeug versteckt seine Ziele nicht hinter
   *  Piktogrammen. */
  code: string
  label: string
  color: ModuleColor
  onTabbar?: boolean
}

export const NAV: NavItem[] = [
  { to: '/', icon: 'cockpit', code: 'COK', label: 'Cockpit', color: 'tasks', onTabbar: true },
  { to: '/habits', icon: 'habits', code: 'HAB', label: 'Habits', color: 'habits', onTabbar: true },
  { to: '/tasks', icon: 'tasks', code: 'TSK', label: 'Tasks & Notes', color: 'tasks', onTabbar: true },
  { to: '/study', icon: 'study', code: 'STU', label: 'Study', color: 'study', onTabbar: true },
  { to: '/journal', icon: 'journal', code: 'JRN', label: 'Journal', color: 'journal', onTabbar: true },
  { to: '/uni', icon: 'uni', code: 'UNI', label: 'Uni', color: 'study' },
  { to: '/goals', icon: 'goals', code: 'GOL', label: 'Goals', color: 'goals' },
  { to: '/sport', icon: 'sport', code: 'SPT', label: 'Sport', color: 'sport' },
  { to: '/settings', icon: 'settings', code: 'SET', label: 'Einstellungen', color: 'tasks' },
]

const TITLES: Record<string, string> = {
  '/': 'Cockpit',
  '/habits': 'Habits',
  '/tasks': 'Tasks & Notes',
  '/study': 'Study',
  '/journal': 'Journal',
  '/uni': 'Uni',
  '/goals': 'Goals',
  '/sport': 'Sport',
  '/settings': 'Einstellungen',
  '/index': 'Index',
}

/* Die Uhr bewegt sich nicht, sie zählt: eigener Zustand, damit nur diese
   Zeile neu rendert und nicht die ganze Hülle. */
function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="hdr__clock">
      {pad2(now.getHours())}:{pad2(now.getMinutes())}
    </span>
  )
}

export function CockpitLayout() {
  const { settings } = useSettings()
  const { pathname } = useLocation()

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  /* Vor dem Malen nach oben. Ohne das behält der Browser die alte
     Position und ein Wechsel sieht aus, als wäre nichts passiert. */
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => markNavEnd(pathname)))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <>
      <header className="hdr">
        <span className="hdr__brand">JARVIS</span>
        <span className="hdr__view">{TITLES[pathname] ?? ''}</span>
        <span className="hdr__sp" />
        <span className="status">
          <i className="lamp lamp--off" aria-hidden="true" />
          {isLocalMode ? 'LOKAL' : 'ONLINE'}
        </span>
        <Clock />
        <NavLink to="/index" className="hdr__idx" onPointerDown={() => markNavStart('/index')}>
          Index
        </NavLink>
      </header>

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
              <span>{n.code}</span>
            </NavLink>
          ))}
        </nav>

        <main className="main">
          <div className="wrap view" key={pathname}>
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
            <span>{n.code}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
