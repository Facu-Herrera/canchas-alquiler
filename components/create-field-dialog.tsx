"use client"

import type React from "react"

import { useState } from "react"
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
import { supabase } from "@/lib/supabase"

import type { Field } from "@/lib/data-store"

interface CreateFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFieldCreated?: (newField: Field) => void
}

export function CreateFieldDialog({ open, onOpenChange, onFieldCreated }: CreateFieldDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    image: "",
    price: 15000,
  })
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Opening confirmation dialog")
    setShowConfirm(true)
  }

  const handleConfirmedCreate = async () => {
    console.log("💾 Creando cancha nueva...")
    
    try {
      // Crear en Supabase
      const { data, error } = await supabase
        .from('fields')
        .insert([{
          name: formData.name,
          type: formData.type,
          image: formData.image,
          price_per_hour: formData.price,
          status: "available" as const,
          description: '',
          capacity: 10,
          is_indoor: false
        }])
        .select()
      
      if (error) throw error
      
      console.log("✅ Cancha creada en Supabase")
      
      // Cerrar diálogos
      setShowConfirm(false)
      onOpenChange(false)
      
      // Resetear formulario
      setFormData({
        name: "",
        type: "",
        image: "",
        price: 15000,
      })
      
      // Notificar al componente padre
      if (onFieldCreated && data && data[0]) {
        onFieldCreated(data[0])
      }
      
    } catch (error: any) {
      console.error("❌ Error al crear cancha:", error)
      setShowConfirm(false)
      alert('Error al crear la cancha. Por favor intenta de nuevo.')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    console.log("[v0] Create dialog open state changing to:", newOpen)
    if (!newOpen) {
      setShowConfirm(false)
      setFormData({
        name: "",
        type: "",
        image: "",
        price: 15000,
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
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Cancha</DialogTitle>
            <DialogDescription>Completa la información para agregar una nueva cancha al sistema.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Cancha</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Cancha G"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de Cancha</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  required
                >
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
                <Label htmlFor="price">Precio por Hora ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="15000"
                  min="0"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Cancha</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={handleConfirmOpenChange}
        onConfirm={handleConfirmedCreate}
        title="¿Confirmar nueva cancha?"
        description="¿Estás seguro de que deseas crear esta cancha? Se agregará al sistema y estará disponible para reservas."
      />
    </>
  )
}
