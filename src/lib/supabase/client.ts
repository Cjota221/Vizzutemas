import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase reutilizável
 * Usa variáveis de ambiente NEXT_PUBLIC_* para funcionar no client-side
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export default supabase
