import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/config";

let client: SupabaseClient | null = null;

/**
 * Service-role client, server-only. RLS is deny-all so every read/write
 * goes through this and the app-level auth gate, never the anon key.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(supabaseUrl(), supabaseServiceRoleKey(), {
      auth: { persistSession: false },
    });
  }
  return client;
}
