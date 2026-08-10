/* Vollflächige Liste aller neun Ansichten — der Handy-Zugang zu den
   vier Zielen, die nicht in die Tab-Leiste passen.

   Ausdrücklich keine Schublade und kein Overlay: eine eigene Seite, die
   normal im Verlauf liegt und mit der Zurück-Geste verlassen wird. */

import { Link } from 'react-router-dom'
import { Icon, Sec } from '../components/hud'
import { NAV } from '../layouts/CockpitLayout'

const MODULES = NAV.filter((n) => n.to !== '/settings')
const SYSTEM = NAV.filter((n) => n.to === '/settings')

export function IndexPage() {
  return (
    <>
      <Sec title="Module">
        <nav className="idx">
          {MODULES.map((n) => (
            <Link key={n.to} to={n.to}>
              <Icon name={n.icon} />
              {n.label}
              <span className="chev">
                <Icon name="chevron" />
              </span>
            </Link>
          ))}
        </nav>
      </Sec>

      <Sec title="System" grouped>
        <nav className="idx">
          {SYSTEM.map((n) => (
            <Link key={n.to} to={n.to}>
              <Icon name={n.icon} />
              {n.label}
              <span className="chev">
                <Icon name="chevron" />
              </span>
            </Link>
          ))}
        </nav>
      </Sec>
    </>
  )
}
