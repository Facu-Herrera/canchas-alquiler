"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Field } from "@/components/field-card"
import { mockFields, mockAllReservations, type Reservation } from "./mock-data"

interface DataStore {
  fields: Field[]
  reservations: Reservation[]
  updateField: (id: string, updates: Partial<Field>) => void
  updateReservation: (id: string, updates: Partial<Reservation>) => void
  addField: (field: Field) => void
  addReservation: (reservation: Reservation) => void
  deleteReservation: (id: string) => void
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      fields: mockFields,
      reservations: mockAllReservations,

      updateField: (id, updates) =>
        set((state) => ({
          fields: state.fields.map((field) => (field.id === id ? { ...field, ...updates } : field)),
        })),

      updateReservation: (id, updates) =>
        set((state) => ({
          reservations: state.reservations.map((reservation) =>
            reservation.id === id ? { ...reservation, ...updates } : reservation,
          ),
        })),

      addField: (field) =>
        set((state) => ({
          fields: [...state.fields, field],
        })),

      addReservation: (reservation) =>
        set((state) => ({
          reservations: [...state.reservations, reservation],
        })),

      deleteReservation: (id) =>
        set((state) => ({
          reservations: state.reservations.filter((reservation) => reservation.id !== id),
        })),
    }),
    {
      name: "cancha-control-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
