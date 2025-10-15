"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { supabase } from "./supabase"
import { PostgrestError } from '@supabase/supabase-js'

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

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      fields: [],
      reservations: [],
      loading: false,
      error: null,

      fetchFields: async () => {
        try {
          set({ loading: true, error: null })
          
          const { data, error } = await supabase
            .from('fields')
            .select('id, name, type, status, image, description, price_per_hour, capacity, is_indoor')
          
          if (error) throw error
          
          set({ 
            fields: data || [], 
            loading: false, 
            error: null 
          })
          
        } catch (err: any) {
          console.error('Error al cargar canchas:', err)
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
          const { data, error } = await supabase
            .from('reservations')
            .select('*')
          
          if (error) throw error
          set({ reservations: data, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      updateField: async (id, updates) => {
        try {
          set({ loading: true, error: null })
          const { error } = await supabase
            .from('fields')
            .update(updates)
            .eq('id', id)
          
          if (error) throw error
          
          // Actualizar el estado local
          set(state => ({
            fields: state.fields.map(field => 
              field.id === id ? { ...field, ...updates } : field
            ),
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
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
          
          set(state => ({
            reservations: state.reservations.map(reservation =>
              reservation.id === id ? { ...reservation, ...updates } : reservation
            ),
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },

      addField: async (field) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await supabase
            .from('fields')
            .insert([field])
            .select()
          
          if (error) throw error
          
          set(state => ({
            fields: [...state.fields, data[0]],
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
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
          
          set(state => ({
            reservations: [...state.reservations, data[0]],
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
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
          
          set(state => ({
            reservations: state.reservations.filter(reservation => reservation.id !== id),
            loading: false
          }))
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },
    }),
    {
      name: "cancha-control-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
