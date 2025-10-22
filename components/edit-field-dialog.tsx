"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "./confirm-dialog"
import type { Field } from "@/lib/data-store"

interface EditFieldDialogProps {
  field: Field
  open: boolean
  onOpenChange: (open: boolean) => void
  onFieldUpdate?: (updatedField: Field) => void
}

export function EditFieldDialog({ field, open, onOpenChange, onFieldUpdate }: EditFieldDialogProps) {
  const [formData, setFormData] = useState({
    name: field.name,
    type: field.type,
    image: field.image,
    price_per_hour: field.price_per_hour,
    description: field.description || '',
    capacity: field.capacity || 0,
    is_indoor: field.is_indoor
  })
  const [showConfirm, setShowConfirm] = useState(false)

  // Resetear el formulario cuando el field cambie
  useEffect(() => {
    setFormData({
      name: field.name,
      type: field.type,
      image: field.image,
      price_per_hour: field.price_per_hour,
      description: field.description || '',
      capacity: field.capacity || 0,
      is_indoor: field.is_indoor
    })
  }, [field])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Opening confirmation dialog")
    setShowConfirm(true)
  }

  const handleConfirmedSave = async () => {
    console.log("💾 Guardando cambios para cancha:", field.id)
    
    try {
      // Actualizar en Supabase
      const { error } = await supabase
        .from('fields')
        .update({
          ...formData,
          last_modified_at: new Date().toISOString()
        })
        .eq('id', field.id)
      
      if (error) throw error
      
      console.log("✅ Cancha actualizada en Supabase")
      
      // Cerrar diálogos
      setShowConfirm(false)
      onOpenChange(false)
      
      // Notificar al componente padre para que actualice SOLO este field
      if (onFieldUpdate) {
        const updatedField = { ...field, ...formData }
        onFieldUpdate(updatedField)
      }
      
    } catch (error: any) {
      console.error("❌ Error al actualizar cancha:", error)
      setShowConfirm(false)
      alert('Error al actualizar la cancha. Por favor intenta de nuevo.')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("[v0] Edit dialog open state changing to:", newOpen)
    if (!newOpen) {
      setShowConfirm(false)
      setFormData({
        name: field.name,
        type: field.type,
        image: field.image,
        price_per_hour: field.price_per_hour,
        description: field.description || '',
        capacity: field.capacity || 0,
        is_indoor: field.is_indoor
      })
    }
    onOpenChange(newOpen)
  }

  const handleConfirmOpenChange = (newOpen: boolean) => {
    console.log("[v0] Confirm dialog open state changing to:", newOpen)
    setShowConfirm(newOpen)
  }

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Cancha</DialogTitle>
            <DialogDescription>
              Modifica la información de la cancha. Los cambios se guardarán después de confirmar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Cancha</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cancha A"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Cancha</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fútbol 5 - Césped Sintético">Fútbol 5 - Césped Sintético</SelectItem>
                    <SelectItem value="Fútbol 7 - Césped Sintético">Fútbol 7 - Césped Sintético</SelectItem>
                    <SelectItem value="Fútbol 11 - Césped Sintético">Fútbol 11 - Césped Sintético</SelectItem>
                    <SelectItem value="Fútbol 5 - Césped Natural">Fútbol 5 - Césped Natural</SelectItem>
                    <SelectItem value="Fútbol 7 - Césped Natural">Fútbol 7 - Césped Natural</SelectItem>
                    <SelectItem value="Fútbol 11 - Césped Natural">Fútbol 11 - Césped Natural</SelectItem>
                    <SelectItem value="Fútbol 5 - Techada">Fútbol 5 - Techada</SelectItem>
                    <SelectItem value="Fútbol 7 - Techada">Fútbol 7 - Techada</SelectItem>
                    <SelectItem value="Fútbol 11 - Profesional">Fútbol 11 - Profesional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price_per_hour">Precio por Hora ($)</Label>
                <Input
                  id="price_per_hour"
                  type="number"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: Number(e.target.value) })}
                  placeholder="15000"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={handleConfirmOpenChange}
        onConfirm={handleConfirmedSave}
        title="¿Confirmar cambios?"
        description="¿Estás seguro de que deseas guardar los cambios en esta cancha? Esta acción actualizará la información en todo el sistema."
      />
    </>
  )
}
