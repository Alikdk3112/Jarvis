import { Navigate, Route, Routes } from 'react-router-dom'
import { CockpitLayout } from './layouts/CockpitLayout'
import { AuthGate } from './features/auth/AuthGate'
import { TimerProvider } from './features/study/TimerContext'
import { Cockpit } from './pages/Cockpit'
import { Habits } from './pages/Habits'
import { Tasks } from './pages/Tasks'
import { Journal } from './pages/Journal'
import { Study } from './pages/Study'
import { Uni } from './pages/Uni'
import { Goals } from './pages/Goals'
import { Sport } from './pages/Sport'
import { Settings } from './pages/Settings'
import { IndexPage } from './pages/IndexPage'

export function App() {
  return (
    // AuthGate ganz außen: ohne Anmeldung darf im Supabase-Modus nichts laden.
    // Der Timer liegt über dem Router, damit er beim Wechsel der Ansicht
    // weiterläuft statt neu zu starten.
    <AuthGate>
      <TimerProvider>
        <Routes>
          <Route element={<CockpitLayout />}>
            <Route path="/" element={<Cockpit />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </TimerProvider>
    </AuthGate>
  )
}
