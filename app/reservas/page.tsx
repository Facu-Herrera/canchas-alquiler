"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Plus, CheckCircle2, DollarSign, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import type { ReservationWithField, Field } from "@/lib/types/reservation"
import { 
  getReservationsByDate, 
  createReservation, 
  updatePaymentStatus 
} from "@/lib/reservations"
import { getAllFields } from "@/lib/fields"

export default function ReservasPage() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0])
  const [reservations, setReservations] = useState<ReservationWithField[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    fieldId: "",
    date: "",
    startTime: "",
    endTime: "",
    clientName: "",
    clientPhone: "",
    notes: "",
  })

  // Cargar canchas al montar el componente
  useEffect(() => {
    loadFields()
  }, [])

  // Cargar reservas cuando cambia la fecha
  useEffect(() => {
    loadReservations()
  }, [currentDate])

  async function loadFields() {
    try {
      const data = await getAllFields()
      setFields(data)
    } catch (error) {
      console.error('Error loading fields:', error)
      toast.error('Error al cargar las canchas')
    }
  }

  async function loadReservations() {
    try {
      setLoading(true)
      const data = await getReservationsByDate(currentDate)
      setReservations(data)
    } catch (error) {
      console.error('Error loading reservations:', error)
      toast.error('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  const todayReservations = reservations

  async function updateReservationPaymentStatus(id: string, newStatus: string) {
    try {
      await updatePaymentStatus(id, newStatus)
      
      // Actualizar el estado local
      setReservations(reservations.map((res) => 
        res.id === id ? { ...res, payment_status: newStatus } : res
      ))
      
      const statusMessages: Record<string, string> = {
        'completed': 'Pago marcado como completado',
        'partial': 'Pago marcado como parcial',
        'pending': 'Pago marcado como pendiente'
      }
      
      toast.success(statusMessages[newStatus] || 'Estado actualizado')
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('Error al actualizar el estado del pago')
    }
  }

  const totalEarnings = todayReservations
    .filter((res) => res.payment_status === 'completed')
    .reduce((sum, res) => sum + Number(res.total_price), 0)

  const partialEarnings = todayReservations
    .filter((res) => res.payment_status === 'partial')
    .reduce((sum, res) => sum + Number(res.total_price) * 0.1, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.fieldId || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    try {
      setSubmitting(true)

      // Calcular el precio
      const field = fields.find(f => f.id === formData.fieldId)
      if (!field) {
        toast.error('Cancha no encontrada')
        return
      }

      // Calcular duración en horas
      const start = new Date(`2000-01-01T${formData.startTime}:00`)
      const end = new Date(`2000-01-01T${formData.endTime}:00`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      
      // Calcular precio usando price_per_hour
      const totalPrice = hours * Number(field.price_per_hour)

      await createReservation({
        field_id: formData.fieldId,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        reservation_date: formData.date,
        start_time: formData.startTime + ':00',
        end_time: formData.endTime + ':00',
        total_price: totalPrice,
        notes: formData.notes || null,
        payment_status: 'pending'
      })

      toast.success('Reserva creada exitosamente!')
      
      // Limpiar formulario
      setFormData({
        fieldId: "",
        date: "",
        startTime: "",
        endTime: "",
        clientName: "",
        clientPhone: "",
        notes: "",
      })
      
      setShowCreateForm(false)
      
      // Recargar reservas si la fecha coincide
      if (formData.date === currentDate) {
        await loadReservations()
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error)
      toast.error(error.message || 'Error al crear la reserva')
    } finally {
      setSubmitting(false)
    }
  }

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-4xl font-bold text-balance text-foreground">Gestión de Reservas</h1>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-muted-foreground">Visualiza las reservas del día</p>
              <Input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>

          <Button
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <Plus className="h-4 w-4" />
            {showCreateForm ? "Ver Reservas" : "Nueva Reserva"}
          </Button>
        </div>

        {showCreateForm ? (
          <Card className="border-border bg-card p-8">
            <h2 className="mb-6 font-sans text-2xl font-semibold text-foreground">Crear Nueva Reserva</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="field" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Cancha
                  </Label>
                  <Select
                    value={formData.fieldId}
                    onValueChange={(value) => setFormData({ ...formData, fieldId: value })}
                    required
                  >
                    <SelectTrigger id="field">
                      <SelectValue placeholder="Selecciona una cancha" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name} - {field.type} (${Number(field.price_per_hour).toLocaleString()}/hora)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Hora de Inicio
                  </Label>
                  <Select
                    value={formData.startTime}
                    onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                    required
                  >
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Hora de Fin
                  </Label>
                  <Select
                    value={formData.endTime}
                    onValueChange={(value) => setFormData({ ...formData, endTime: value })}
                    required
                  >
                    <SelectTrigger id="endTime">
                      <SelectValue placeholder="Selecciona hora" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="mb-4 font-sans text-lg font-semibold text-foreground">Información del Cliente</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Nombre Completo
                    </Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientPhone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      Teléfono
                    </Label>
                    <Input
                      id="clientPhone"
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Comentarios (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Información adicional sobre la reserva..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Crear Reserva
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <>
            <Card className="mb-6 border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ganancias del Día</p>
                  <p className="mt-1 font-sans text-3xl font-bold text-foreground">${totalEarnings.toLocaleString()}</p>
                  {partialEarnings > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">+ ${partialEarnings.toLocaleString()} parcial</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--status-available)]" />
                    <span>{todayReservations.filter((r) => r.payment_status === 'completed').length} Completas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    <span>{todayReservations.filter((r) => r.payment_status === 'partial').length} Parciales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--status-reserved)]" />
                    <span>{todayReservations.filter((r) => r.payment_status === 'pending').length} Pendientes</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 border-b border-border bg-card">
                      <tr className="text-left">
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Estado</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Cancha</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Horario</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Cliente</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Teléfono</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Precio</th>
                        <th className="p-4 font-sans text-sm font-semibold text-foreground">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayReservations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No hay reservas para esta fecha
                          </td>
                        </tr>
                      ) : (
                        todayReservations.map((reservation) => (
                          <tr
                            key={reservation.id}
                            className="border-b border-border/50 transition-colors hover:bg-muted/50"
                          >
                            <td className="p-4">
                              <Select
                                value={reservation.payment_status || 'pending'}
                                onValueChange={(value) => updateReservationPaymentStatus(reservation.id, value)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-[var(--status-reserved)]" />
                                      Pendiente
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="partial">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-3 w-3 text-amber-500" />
                                      Parcial
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-3 w-3 text-[var(--status-available)]" />
                                      Completado
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-foreground">
                                {reservation.field?.name || 'N/A'} - {reservation.field?.type || ''}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-foreground">
                                {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-foreground">{reservation.client_name}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-foreground">{reservation.client_phone}</div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 font-medium text-foreground">
                                <DollarSign className="h-3 w-3" />
                                {Number(reservation.total_price).toLocaleString()}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                                {reservation.notes || "-"}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
