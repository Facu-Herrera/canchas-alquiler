"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Plus, CheckCircle2, DollarSign } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { mockFields, mockAllReservations, type Reservation } from "@/lib/mock-data"

export default function ReservasPage() {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0])
  const [reservations, setReservations] = useState<Reservation[]>(mockAllReservations)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState({
    fieldId: "",
    date: "",
    startTime: "",
    endTime: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    comments: "",
  })

  const todayReservations = reservations.filter((res) => res.date === currentDate)

  const toggleReservationCompleted = (id: string) => {
    setReservations(reservations.map((res) => (res.id === id ? { ...res, completed: !res.completed } : res)))
  }

  const totalEarnings = todayReservations.filter((res) => res.completed).reduce((sum, res) => sum + res.price, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Creating reservation:", formData)
    // TODO: Integrate with backend API
    alert("Reserva creada exitosamente!")
    setFormData({
      fieldId: "",
      date: "",
      startTime: "",
      endTime: "",
      clientName: "",
      clientPhone: "",
      clientEmail: "",
      comments: "",
    })
    setShowCreateForm(false)
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
                      {mockFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name} - {field.type} (${field.price.toLocaleString()}/hora)
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
                    <Label htmlFor="clientEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email (opcional)
                    </Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      placeholder="juan@ejemplo.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Comentarios (opcional)
                </Label>
                <Textarea
                  id="comments"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  placeholder="Información adicional sobre la reserva..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Reserva
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
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--status-available)]" />
                    <span>{todayReservations.filter((r) => r.completed).length} Completadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[var(--status-reserved)]" />
                    <span>{todayReservations.filter((r) => !r.completed).length} Pendientes</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card">
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
                      <th className="p-4 font-sans text-sm font-semibold text-foreground">Comentarios</th>
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
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={reservation.completed}
                                onCheckedChange={() => toggleReservationCompleted(reservation.id)}
                                className="border-border"
                              />
                              <span className="text-sm text-muted-foreground">
                                {reservation.completed ? "Pagado" : "Pendiente"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-foreground">{reservation.fieldName}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-foreground">
                              {reservation.startTime} - {reservation.endTime}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-foreground">{reservation.clientName}</div>
                            {reservation.clientEmail && (
                              <div className="text-xs text-muted-foreground">{reservation.clientEmail}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-foreground">{reservation.clientPhone}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1 font-medium text-foreground">
                              <DollarSign className="h-3 w-3" />
                              {reservation.price.toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                              {reservation.comments || "-"}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
