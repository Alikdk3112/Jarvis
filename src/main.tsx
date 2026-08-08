import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { seedIfEmpty } from './lib/seed'

import './styles/tokens.css'
import './styles/hud.css'
import './styles/app.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
})

// Erstbefüllung vor dem ersten Rendern: sonst blitzt ein leeres Cockpit auf.
seedIfEmpty()
  .catch((err) => console.error('Erstbefüllung fehlgeschlagen:', err))
  .finally(() => {
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
