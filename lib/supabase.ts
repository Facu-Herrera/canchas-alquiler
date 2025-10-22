import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knybyvdgvllygcipjahw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueWJ5dmRndmxseWdjaXBqYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODgxNzcsImV4cCI6MjA3NTU2NDE3N30.c_wFkprUj1Sfa6sC-Fj9vDBH-KaXmThtIwcKz-73Igc'

// **CAMBIO 13: Configuración mejorada del cliente de Supabase**
// - realtime habilitado: Para recibir actualizaciones en tiempo real (si lo habilitas en Supabase)
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