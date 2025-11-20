import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// **Configuración del cliente de Supabase**
// - realtime habilitado: Para recibir actualizaciones en tiempo real
// - autoRefreshToken: Refresca automáticamente el token de autenticación
// - persistSession: Mantiene la sesión entre recargas de página
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'cancha-control'
    }
  }
})