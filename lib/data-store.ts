"use client"

import { create } from "zustand"
import { supabase } from "./supabase"

// Tipos basados en la base de datos
export interface Field {
  id: string
  name: string
  type: string
  status: 'available' | 'occupied' | 'reserved' | 'maintenance'
  image: string
  description: string
  price_per_hour: number
  capacity: number
  is_indoor: boolean
  created_at?: string
  created_by?: string
  last_modified_at?: string
  last_modified_by?: string
}

export interface Reservation {
  id: string
  field_id: string
  user_id: string
  client_name: string
  client_phone: string
  client_email: string
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'refunded'
  notes?: string
  created_at?: string
  created_by?: string
}

interface DataStore {
  fields: Field[]
  reservations: Reservation[]
  loading: boolean
  error: string | null
  fetchFields: () => Promise<void>
  fetchReservations: () => Promise<void>
  updateField: (id: string, updates: Partial<Field>) => Promise<void>
  updateReservation: (id: string, updates: Partial<Reservation>) => Promise<void>
  addField: (field: Omit<Field, 'id' | 'created_at'>) => Promise<void>
  addReservation: (reservation: Omit<Reservation, 'id' | 'created_at'>) => Promise<void>
  deleteReservation: (id: string) => Promise<void>
}

// **CAMBIO 1: Removemos persist() para que SIEMPRE cargue datos frescos de Supabase**
// Antes: persist() guardaba datos en localStorage y no actualizaba cuando cambiabas algo en Supabase
// Ahora: Sin persist, siempre se consulta la base de datos y ves los cambios inmediatamente
export const useDataStore = create<DataStore>()((set) => ({
  fields: [],
  reservations: [],
  loading: false,
  error: null,

  fetchFields: async () => {
    try {
      set({ loading: true, error: null })
      
      // **CAMBIO 2: Agregamos .order() para ordenar por fecha de creación**
      // Esto asegura que las canchas más nuevas aparezcan primero
      const { data, error } = await supabase
        .from('fields')
        .select('id, name, type, status, image, description, price_per_hour, capacity, is_indoor')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('✅ Canchas cargadas desde Supabase:', data?.length || 0)
      
      set({ 
        fields: data || [], 
        loading: false, 
        error: null 
      })
      
    } catch (err: any) {
      console.error('❌ Error al cargar canchas:', err)
      set({ 
        fields: [],
        loading: false,
        error: err?.message || 'Error al cargar las canchas'
      })
    }
  },

  fetchReservations: async () => {
    try {
      set({ loading: true, error: null })
      
      // **CAMBIO 3: También ordenamos reservas por fecha**
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('✅ Reservas cargadas desde Supabase:', data?.length || 0)
      set({ reservations: data || [], loading: false, error: null })
      
    } catch (err: any) {
      console.error('❌ Error al cargar reservas:', err)
      set({ 
        reservations: [],
        loading: false,
        error: err?.message || 'Error al cargar las reservas'
      })
    }
  },

  updateField: async (id, updates) => {
    try {
      set({ error: null })
      
      console.log('💾 Actualizando cancha:', id)
      
      // Actualizar localmente PRIMERO para feedback instantáneo
      set(state => ({
        fields: state.fields.map(field => 
          field.id === id ? { ...field, ...updates } : field
        )
      }))
      
      console.log('⚡ UI actualizada localmente')
      
      // Actualizar en Supabase
      const { error } = await supabase
        .from('fields')
        .update({
          ...updates,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      console.log('✅ Cancha actualizada en Supabase')
      
    } catch (err: any) {
      console.error('❌ Error al actualizar cancha:', err)
      
      // Si falla, revertimos
      const { data } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false })
      
      set({ 
        fields: data || [],
        error: err?.message || 'Error al actualizar la cancha'
      })
      throw err
    }
  },

  updateReservation: async (id, updates) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
      
      if (error) throw error
      
      console.log('✅ Reserva actualizada:', id)
      
      // **CAMBIO 6: También refrescamos las reservas después de actualizar**
      const { data: refreshedData } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      set({ 
        reservations: refreshedData || [],
        loading: false,
        error: null 
      })
      
    } catch (err: any) {
      console.error('❌ Error al actualizar reserva:', err)
      set({ 
        loading: false,
        error: err?.message || 'Error al actualizar la reserva'
      })
      throw err
    }
  },

  addField: async (field) => {
    try {
      set({ error: null })
      
      const newField = {
        name: field.name,
        type: field.type,
        status: field.status || 'available',
        image: field.image,
        description: field.description || '',
        price_per_hour: field.price_per_hour,
        capacity: field.capacity || 10,
        is_indoor: field.is_indoor || false
      }
      
      console.log('🆕 Creando cancha en Supabase...', newField)
      
      const { data, error } = await supabase
        .from('fields')
        .insert([newField])
        .select()
      
      if (error) throw error
      
      console.log('✅ Cancha creada en Supabase:', data?.[0]?.id)
      
      // Agregamos la nueva cancha al principio del array inmediatamente
      if (data && data[0]) {
        set(state => ({
          fields: [data[0], ...state.fields]
        }))
        console.log('⚡ Nueva cancha agregada a la UI')
      }
      
      // Sincronizamos con un pequeño delay
      setTimeout(async () => {
        try {
          const { data: refreshedData } = await supabase
            .from('fields')
            .select('*')
            .order('created_at', { ascending: false })
          
          if (refreshedData) {
            set({ fields: refreshedData })
            console.log('🔄 Lista sincronizada con Supabase')
          }
        } catch (err) {
          console.error('⚠️ Error al sincronizar:', err)
        }
      }, 300)
      
    } catch (err: any) {
      console.error('❌ Error al crear cancha:', err)
      set({ 
        error: err?.message || 'Error al crear la cancha'
      })
      throw err
    }
  },

  addReservation: async (reservation) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
      
      if (error) throw error
      
      console.log('✅ Reserva creada:', data?.[0]?.id)
      
      // Refrescamos las reservas
      const { data: refreshedData } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      set({ 
        reservations: refreshedData || [],
        loading: false,
        error: null 
      })
      
    } catch (err: any) {
      console.error('❌ Error al crear reserva:', err)
      set({ 
        loading: false,
        error: err?.message || 'Error al crear la reserva'
      })
      throw err
    }
  },

  deleteReservation: async (id) => {
    try {
      set({ loading: true, error: null })
      
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      console.log('✅ Reserva eliminada:', id)
      
      // Refrescamos las reservas
      const { data: refreshedData } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false })
      
      set({ 
        reservations: refreshedData || [],
        loading: false,
        error: null 
      })
      
    } catch (err: any) {
      console.error('❌ Error al eliminar reserva:', err)
      set({ 
        loading: false,
        error: err?.message || 'Error al eliminar la reserva'
      })
      throw err
    }
  },
}))
