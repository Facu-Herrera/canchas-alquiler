"use client"

import { create } from "zustand"
import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "./types/user"

interface AuthStore {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  fetchProfile: async (userId: string) => {
    console.log("🔵 [AUTH-STORE] Intentando cargar perfil para user ID:", userId)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error("❌ [AUTH-STORE] Error cargando perfil:", error)
        console.error("❌ [AUTH-STORE] Error detalles:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return
      }

      console.log("✅ [AUTH-STORE] Perfil cargado exitosamente!")
      console.log("✅ [AUTH-STORE] Datos del perfil:", data)
      set({ profile: data as UserProfile })

      // Actualizar last_login
      console.log("🔵 [AUTH-STORE] Actualizando last_login...")
      const { error: updateError } = await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
      
      if (updateError) {
        console.error("⚠️ [AUTH-STORE] Error actualizando last_login:", updateError)
      } else {
        console.log("✅ [AUTH-STORE] last_login actualizado")
      }
    } catch (err) {
      console.error("❌ [AUTH-STORE] Error inesperado al cargar perfil:", err)
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("❌ Error en login:", error)
        set({ loading: false })
        return { error: error.message }
      }

      console.log("✅ Login exitoso:", data.user?.email)
      set({ user: data.user })

      // Cargar el perfil del usuario desde la tabla users
      if (data.user?.id) {
        await get().fetchProfile(data.user.id)
      }

      // Ahora sí, terminar el loading después de cargar el perfil
      set({ loading: false })
      return {}
    } catch (err: any) {
      console.error("❌ Error inesperado:", err)
      set({ loading: false })
      return { error: "Error al iniciar sesión" }
    }
  },

  signOut: async () => {
    console.log("🔵 [AUTH-STORE] Iniciando signOut...")
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("❌ [AUTH-STORE] Error en signOut:", error)
        throw error
      }
      
      console.log("✅ [AUTH-STORE] Sesión cerrada exitosamente")
      console.log("🔵 [AUTH-STORE] Limpiando estado...")
      set({ user: null, profile: null, loading: false, initialized: true })
    } catch (err) {
      console.error("❌ [AUTH-STORE] Error inesperado en logout:", err)
      // Limpiar el estado de todas formas
      set({ user: null, profile: null, loading: false, initialized: true })
      throw err
    }
  },

  checkSession: async () => {
    console.log("🔵 [AUTH-STORE] Verificando sesión...")
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("❌ [AUTH-STORE] Error obteniendo sesión:", error)
      }
      
      if (session?.user) {
        console.log("✅ [AUTH-STORE] Sesión activa encontrada!")
        console.log("✅ [AUTH-STORE] User ID:", session.user.id)
        console.log("✅ [AUTH-STORE] Email:", session.user.email)
        set({ user: session.user, initialized: true })
        
        // Cargar perfil
        await get().fetchProfile(session.user.id)
      } else {
        console.log("ℹ️ [AUTH-STORE] No hay sesión activa")
        set({ user: null, profile: null, initialized: true })
      }
    } catch (err) {
      console.error("❌ [AUTH-STORE] Error inesperado verificando sesión:", err)
      set({ user: null, profile: null, initialized: true })
    }
  },
}))
