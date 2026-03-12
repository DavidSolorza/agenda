import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)

let _client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (_client) return _client
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY en tu entorno')
  }
  _client = createClient(supabaseUrl, supabaseKey)
  return _client
}

