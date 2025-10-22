"use client"

import { Settings, Calendar, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EditFieldDialog } from "@/components/edit-field-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { supabase } from "@/lib/supabase"

export type FieldStatus = "available" | "occupied" | "reserved" | "maintenance"

import type { Field as DBField } from "@/lib/data-store"

export interface Field extends Omit<DBField, 'price_per_hour'> {
  price: number
  nextReservation?: {
    time: string
    client: string
  }
}

interface FieldCardProps {
  field: DBField
  onFieldUpdate?: (updatedField: DBField) => void
  onFieldDelete?: (fieldId: string) => void
}

const statusConfig = {
  available: {
    label: "Disponible",
    className: "bg-[var(--status-available)] text-white hover:bg-[var(--status-available)]/90",
  },
  occupied: {
    label: "Ocupada",
    className: "bg-[var(--status-occupied)] text-white hover:bg-[var(--status-occupied)]/90",
  },
  reserved: {
    label: "Reservada",
    className: "bg-[var(--status-reserved)] text-white hover:bg-[var(--status-reserved)]/90",
  },
}

function FieldCardComponent({ field, onFieldUpdate, onFieldDelete }: FieldCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleConfirmedDelete = async () => {
    console.log("🗑️ Eliminando cancha:", field.id)
    
    try {
      const { error } = await supabase
        .from('fields')
        .delete()
        .eq('id', field.id)
      
      if (error) throw error
      
      console.log("✅ Cancha eliminada de Supabase")
      
      // Cerrar diálogo
      setShowDeleteConfirm(false)
      
      // Notificar al padre para que quite la cancha del estado
      if (onFieldDelete) {
        onFieldDelete(field.id)
      }
      
    } catch (error: any) {
      console.error("❌ Error al eliminar cancha:", error)
      setShowDeleteConfirm(false)
      alert('Error al eliminar la cancha. Por favor intenta de nuevo.')
    }
  }

  return (
    <>
      <Card className="group overflow-hidden border-border bg-card transition-all hover:border-primary/50">
        <Link href={`/cancha/${field.id}`}>
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[16/10]">
            <Image
              src={field.image || "/placeholder.svg"}
              alt={field.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        </Link>

        <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-sans text-base font-semibold text-foreground sm:text-lg">{field.name}</h3>
              <p className="text-xs text-muted-foreground sm:text-sm">{field.type}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Precio: ${field.price_per_hour}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault()
                  setIsEditOpen(true)
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault()
                  setShowDeleteConfirm(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Link href={`/cancha/${field.id}`}>
            <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Ver Disponibilidad</span>
              <span className="sm:hidden">Disponibilidad</span>
            </Button>
          </Link>
        </div>
      </Card>

      <EditFieldDialog 
        field={field} 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen}
        onFieldUpdate={onFieldUpdate}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmedDelete}
        title="¿Eliminar cancha?"
        description={`¿Estás seguro de que deseas eliminar "${field.name}"? Esta acción no se puede deshacer y se eliminarán también todas las reservas asociadas.`}
      />
    </>
  )
}

// Memoizamos el componente para evitar re-renders innecesarios
// Solo se re-renderiza si alguna propiedad del field cambia
export const FieldCard = React.memo(FieldCardComponent)
