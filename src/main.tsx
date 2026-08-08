import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { seedIfEmpty } from './lib/seed'
import { isLocalMode } from './lib/data'

import './styles/tokens.css'
import './styles/hud.css'
import './styles/app.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

// Lokal vor dem ersten Rendern befüllen, sonst blitzt ein leeres Cockpit auf.
// Im Supabase-Modus geht das erst nach der Anmeldung — das erledigt AuthGate.
const ready = isLocalMode
  ? seedIfEmpty().catch((err) => console.error('Erstbefüllung fehlgeschlagen:', err))
  : Promise.resolve()

ready.finally(() => {
    createRoot(document.getElementById('root') as HTMLElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>,
    )
  })
