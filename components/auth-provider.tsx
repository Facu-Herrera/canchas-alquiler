"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    console.log("🔵 [AUTH-PROVIDER] Iniciando AuthProvider...")
    // Verificar sesión inicial
    checkSession()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 [AUTH-PROVIDER] Auth state changed!")
      console.log("🔐 [AUTH-PROVIDER] Event:", event)
      console.log("🔐 [AUTH-PROVIDER] User:", session?.user?.email)
      console.log("🔐 [AUTH-PROVIDER] Session:", session ? "exists" : "null")
      
      if (event === "SIGNED_IN") {
        console.log("✅ [AUTH-PROVIDER] Usuario autenticado - actualizando estado")
        useAuthStore.setState({ user: session?.user ?? null })
      } else if (event === "SIGNED_OUT") {
        console.log("🔴 [AUTH-PROVIDER] Usuario cerró sesión - limpiando estado")
        useAuthStore.setState({ user: null })
      }
    })

    return () => {
      console.log("🔵 [AUTH-PROVIDER] Limpiando subscription...")
      subscription.unsubscribe()
    }
  }, [checkSession])

  return <>{children}</>
}
