"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { FieldDetailView } from "@/components/field-detail-view"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { Field, Reservation } from "@/lib/data-store"

export default function CanchaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [field, setField] = useState<Field | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Cargando cancha:', params.id)
        
        // Cargar cancha
        const { data: fieldData, error: fieldError } = await supabase
          .from('fields')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (fieldError) {
          console.error('❌ Error cargando cancha:', fieldError)
          setField(null)
        } else {
          setField(fieldData)
          console.log('✅ Cancha cargada:', fieldData)
        }
        
        // Cargar reservas de esta cancha
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select('*')
          .eq('field_id', params.id)
        
        if (reservationsError) {
          console.error('❌ Error cargando reservas:', reservationsError)
        } else {
          setReservations(reservationsData || [])
          console.log('✅ Reservas cargadas:', reservationsData?.length)
        }
        
      } catch (error) {
        console.error('❌ Error general:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params.id])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!field) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <FieldDetailView
          fieldName={field.name}
          fieldType={field.type}
          date="Viernes, 10 de Febrero 2025"
          reservations={[]}
        />
      </main>
    </div>
  )
}
