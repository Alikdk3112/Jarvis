import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { seedIfEmpty } from './lib/seed'
import { isLocalMode } from './lib/data'
import { registerServiceWorker } from './lib/sw'

import './styles/tokens.css'
import './styles/hud.css'
import './styles/app.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /* Nachladen, wenn die App wieder in den Vordergrund kommt — das ist
         der Moment, in dem sich etwas geändert haben kann, etwa weil am Mac
         abgehakt wurde. Beim Blättern zwischen den Seiten dagegen nicht:
         dort kostet es nur Rundreisen (siehe staleTime in store.ts). */
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

// Lokal vor dem ersten Rendern befüllen, sonst blitzt ein leeres Cockpit auf.
// Im Supabase-Modus geht das erst nach der Anmeldung — das erledigt AuthGate.
const ready = isLocalMode
  ? seedIfEmpty().catch((err) => console.error('Erstbefüllung fehlgeschlagen:', err))
  : Promise.resolve()

/* Erst die App zeigen, dann den Service Worker anmelden. Andersherum kann das
   Anmelden das erste Bild verzögern, und das ist genau der Moment, in dem
   niemand warten will. */
ready.finally(() => {
    registerServiceWorker()
    createRoot(document.getElementById('root') as HTMLElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>,
    )
  })
