/* ══════════════════════════════════════════════════════════════════════
   Die Umschaltstelle.

   Sobald ein Supabase-Projekt existiert und die beiden Umgebungsvariablen
   gesetzt sind, läuft alles gegen Supabase — sonst lokal. Kein Modul muss
   dafür angefasst werden; das ist der ganze Zweck des Adapter-Vertrags.
   ══════════════════════════════════════════════════════════════════════ */

import { hasSupabase } from '../supabaseClient'
import { localAdapter } from './local'
import { supabaseAdapter } from './supabase'
import type { DataAdapter } from './types'

export const data: DataAdapter = hasSupabase ? supabaseAdapter : localAdapter

export const isLocalMode = data.kind === 'local'

export * from './types'
