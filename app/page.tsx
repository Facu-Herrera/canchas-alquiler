"use client"

import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { FieldCard } from "@/components/field-card"
import { Button } from "@/components/ui/button"
import { CreateFieldDialog } from "@/components/create-field-dialog"
import { supabase } from "@/lib/supabase"
import type { Field } from "@/lib/data-store"

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)

  // Función para cargar campos
  const loadFields = async () => {
    try {
      console.log('🔄 Cargando canchas desde Supabase...')
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setFields(data || [])
      console.log('✅ Canchas cargadas:', data?.length)
    } catch (error) {
      console.error('❌ Error al cargar canchas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadFields()
  }, [])

  // Función para actualizar un field específico
  const handleFieldUpdate = (updatedField: Field) => {
    console.log('🔄 Actualizando field en UI:', updatedField.id)
    setFields(prevFields => 
      prevFields.map(field => 
        field.id === updatedField.id ? updatedField : field
      )
    )
  }

  // Función para agregar una nueva cancha sin recargar todo
  const handleFieldCreated = (newField: Field) => {
    console.log('➕ Agregando nueva cancha a UI:', newField.id)
    setFields(prevFields => [newField, ...prevFields])
    console.log('✅ Cancha agregada al estado')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-6">
          <p>Cargando canchas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-balance text-foreground md:text-4xl">
              Panel de Control de Canchas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
              Visualiza y gestiona el estado de todas las canchas
            </p>
          </div>

          <Button
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 md:w-auto"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Crear Nueva Cancha
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {fields.map((field) => (
            <FieldCard 
              key={field.id} 
              field={field}
              onFieldUpdate={handleFieldUpdate}
            />
          ))}
        </div>
      </main>

      <CreateFieldDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen}
        onFieldCreated={handleFieldCreated}
      />
    </div>
  )
}
