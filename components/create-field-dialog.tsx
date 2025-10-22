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
import { useDataStore } from "@/lib/data-store"

interface CreateFieldDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateFieldDialog({ open, onOpenChange }: CreateFieldDialogProps) {
  const addField = useDataStore((state) => state.addField)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    image: "",
    price: 15000,
  })
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirm(true)
  }

  const handleConfirmedCreate = async () => {
    try {
      // **CAMBIO 10: NO creamos el ID aquí - Supabase lo genera automáticamente**
      // Antes: Generabas un ID manualmente que podía causar conflictos
      // Ahora: Dejamos que Supabase genere el UUID automáticamente
      const newField = {
        name: formData.name,
        type: formData.type,
        image: formData.image,
        price_per_hour: formData.price,
        status: "available" as const,
        description: '', // Campo requerido por la base de datos
        capacity: 10,    // Valor por defecto
        is_indoor: false // Valor por defecto
      }
      
      console.log('🆕 Creando cancha:', newField)
      await addField(newField)
      console.log('✅ Cancha creada exitosamente')
      
      // Cerrar diálogos y resetear formulario
      setShowConfirm(false)
      setFormData({
        name: "",
        type: "",
        image: "",
        price: 15000,
      })
      onOpenChange(false)
      
    } catch (error) {
      console.error("❌ Error creando cancha:", error)
      // Aquí podrías mostrar un toast/notification al usuario
      alert('Error al crear la cancha. Por favor intenta de nuevo.')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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
        onOpenChange={setShowConfirm}
        onConfirm={handleConfirmedCreate}
        title="¿Confirmar nueva cancha?"
        description="¿Estás seguro de que deseas crear esta cancha? Se agregará al sistema y estará disponible para reservas."
      />
    </>
  )
}
