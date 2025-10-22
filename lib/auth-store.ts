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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error("❌ Error cargando perfil:", error)
        return
      }

      console.log("✅ Perfil cargado:", data?.full_name)
      set({ profile: data as UserProfile })

      // Actualizar last_login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
    } catch (err) {
      console.error("❌ Error inesperado al cargar perfil:", err)
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
    try {
      set({ loading: true })
      await supabase.auth.signOut()
      console.log("✅ Logout exitoso")
      set({ user: null, profile: null, loading: false })
    } catch (err) {
      console.error("❌ Error en logout:", err)
      set({ loading: false })
    }
  },

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log("✅ Sesión activa:", session.user.email)
        set({ user: session.user, initialized: true })
        
        // Cargar perfil
        await get().fetchProfile(session.user.id)
      } else {
        console.log("ℹ️ No hay sesión activa")
        set({ user: null, profile: null, initialized: true })
      }
    } catch (err) {
      console.error("❌ Error verificando sesión:", err)
      set({ user: null, profile: null, initialized: true })
    }
  },
}))
