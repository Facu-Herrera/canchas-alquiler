"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    // Verificar sesión inicial
    checkSession()

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔐 Auth state changed:", event, session?.user?.email)
      
      if (event === "SIGNED_IN") {
        useAuthStore.setState({ user: session?.user ?? null })
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [checkSession])

  return <>{children}</>
}
