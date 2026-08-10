/* ══════════════════════════════════════════════════════════════════════
   Der Router.

   Das Cockpit kommt fest ins Startbündel — es ist die Seite, auf der die
   App aufgeht, und ein Nachladen wäre dort eine Wartezeit an der
   ungünstigsten Stelle. Die acht übrigen Ansichten werden erst geholt,
   wenn sie gebraucht werden.

   Vorher lagen alle neun in einer Datei: 652 KB, die das Telefon vor dem
   ersten Bild vollständig herunterladen, auspacken und übersetzen musste,
   obwohl acht davon in dieser Sitzung womöglich nie zu sehen sind.
   ══════════════════════════════════════════════════════════════════════ */

import { lazy, Suspense } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { CockpitLayout } from './layouts/CockpitLayout'
import { AuthGate } from './features/auth/AuthGate'
import { TimerProvider } from './features/study/TimerContext'
import { Cockpit } from './pages/Cockpit'

const Habits = lazy(() => import('./pages/Habits').then((m) => ({ default: m.Habits })))
const Tasks = lazy(() => import('./pages/Tasks').then((m) => ({ default: m.Tasks })))
const Journal = lazy(() => import('./pages/Journal').then((m) => ({ default: m.Journal })))
const Study = lazy(() => import('./pages/Study').then((m) => ({ default: m.Study })))
const Uni = lazy(() => import('./pages/Uni').then((m) => ({ default: m.Uni })))
const Goals = lazy(() => import('./pages/Goals').then((m) => ({ default: m.Goals })))
const Sport = lazy(() => import('./pages/Sport').then((m) => ({ default: m.Sport })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const IndexPage = lazy(() => import('./pages/IndexPage').then((m) => ({ default: m.IndexPage })))

/* Was während des Nachladens steht. Bewusst nur eine Zeile in derselben
   Versalschrift wie jede andere Leermeldung — kein Skelett, kein Kreisel.
   Ein Kreisel wäre eine Animation, und die kennt LEDGER nicht; ein Skelett
   würde eine Anordnung vortäuschen, die gleich von einer anderen ersetzt
   wird. Nach dem ersten Besuch einer Seite liegt ihr Stück im Cache und
   diese Zeile erscheint nicht mehr. */
function Laden() {
  return <p className="empty">LADEN …</p>
}

export function App() {
  return (
    // AuthGate ganz außen: ohne Anmeldung darf im Supabase-Modus nichts laden.
    // Der Timer liegt über dem Router, damit er beim Wechsel der Ansicht
    // weiterläuft statt neu zu starten.
    <AuthGate>
      <TimerProvider>
        <Routes>
          <Route element={<CockpitLayout />}>
            <Route
              element={
                <Suspense fallback={<Laden />}>
                  <Outlet />
                </Suspense>
              }
            >
              <Route path="/habits" element={<Habits />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/study" element={<Study />} />
              <Route path="/uni" element={<Uni />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/sport" element={<Sport />} />
              <Route path="/settings" element={<Settings />} />
              {/* Am Handy der Zugang zu allen neun Ansichten. */}
              <Route path="/index" element={<IndexPage />} />
            </Route>
            <Route path="/" element={<Cockpit />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TimerProvider>
    </AuthGate>
  )
}
