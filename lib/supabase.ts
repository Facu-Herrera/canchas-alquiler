import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knybyvdgvllygcipjahw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueWJ5dmRndmxseWdjaXBqYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODgxNzcsImV4cCI6MjA3NTU2NDE3N30.c_wFkprUj1Sfa6sC-Fj9vDBH-KaXmThtIwcKz-73Igc'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})