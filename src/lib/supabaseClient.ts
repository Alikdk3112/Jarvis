/* Supabase-Client. Existiert nur, wenn beide Umgebungsvariablen gesetzt sind —
   sonst läuft die App im lokalen Modus und rührt Supabase gar nicht erst an. */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const hasSupabase = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = hasSupabase
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null

/** Wirft, statt still `null` weiterzureichen — Aufrufer sind nur im
 *  Supabase-Modus aktiv, ein fehlender Client wäre dort ein Programmfehler. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase ist nicht konfiguriert. VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen.',
    )
  }
  return supabase
}
