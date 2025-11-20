"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Calendar, Users, BarChart3, PieChart, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getReservationsByDateRange } from "@/lib/reservations"
import { getAllFields } from "@/lib/fields"
import type { ReservationWithField, Field } from "@/lib/types/reservation"

export default function ReportesPage() {
  const [period, setPeriod] = useState("today")
  const [reservations, setReservations] = useState<ReservationWithField[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])

  // Cargar canchas al montar
  useEffect(() => {
    loadFields()
  }, [])

  // Cargar reservas cuando cambia el período o fecha
  useEffect(() => {
    loadReservations()
  }, [startDate, endDate])

  // Actualizar rango de fechas cuando cambia el período
  useEffect(() => {
    updateDateRange()
  }, [period])

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
      const data = await getReservationsByDateRange(startDate, endDate)
      setReservations(data)
    } catch (error) {
      console.error('Error loading reservations:', error)
      toast.error('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  function updateDateRange() {
    const today = new Date()
    let start = new Date()
    let end = new Date()

    switch (period) {
      case 'today':
        // Ya está configurado
        break
      case 'week':
        // Inicio de la semana (lunes)
        const dayOfWeek = today.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        start.setDate(today.getDate() + diff)
        end.setDate(start.getDate() + 6)
        break
      case 'month':
        start.setDate(1) // Primer día del mes
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0) // Último día del mes
        break
      case 'year':
        start = new Date(today.getFullYear(), 0, 1) // 1 de enero
        end = new Date(today.getFullYear(), 11, 31) // 31 de diciembre
        break
    }

    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }

  const totalReservations = reservations.length
  const completedReservations = reservations.filter((r) => r.payment_status === 'completed').length
  const totalEarnings = reservations
    .filter((r) => r.payment_status === 'completed')
    .reduce((sum, r) => sum + Number(r.total_price), 0)
  const partialEarnings = reservations
    .filter((r) => r.payment_status === 'partial')
    .reduce((sum, r) => sum + Number(r.total_price) * 0.1, 0)
  const pendingEarnings = reservations
    .filter((r) => r.payment_status === 'pending')
    .reduce((sum, r) => sum + Number(r.total_price), 0)

  const fieldStats = fields
    .map((field) => {
      const fieldReservations = reservations.filter((r) => r.field_id === field.id)
      const fieldEarnings = fieldReservations
        .filter((r) => r.payment_status === 'completed')
        .reduce((sum, r) => sum + Number(r.total_price), 0)
      return {
        id: field.id,
        name: field.name,
        reservations: fieldReservations.length,
        earnings: fieldEarnings,
        utilization: totalReservations > 0 ? ((fieldReservations.length / totalReservations) * 100).toFixed(1) : "0.0",
      }
    })
    .sort((a, b) => b.earnings - a.earnings)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-sans text-4xl font-bold text-balance text-foreground">Reportes y Estadísticas</h1>
            <p className="mt-2 text-muted-foreground">Analiza el rendimiento y las ganancias de tus canchas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-sm text-muted-foreground">
              Período
            </Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period" className="w-[180px]">
                <SelectValue placeholder="Selecciona período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mes</SelectItem>
                <SelectItem value="year">Este Año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `$${totalEarnings.toLocaleString()}`}
                </p>
                {!loading && partialEarnings > 0 && (
                  <p className="mt-1 text-sm text-amber-500 font-medium">
                    + ${partialEarnings.toLocaleString()} parcial (10%)
                  </p>
                )}
              </div>
              <div className="rounded-full bg-[var(--status-available)]/10 p-3">
                <DollarSign className="h-6 w-6 text-[var(--status-available)]" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Ingresos del período seleccionado
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Pendientes</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : `$${pendingEarnings.toLocaleString()}`}
                </p>
              </div>
              <div className="rounded-full bg-[var(--status-reserved)]/10 p-3">
                <Calendar className="h-6 w-6 text-[var(--status-reserved)]" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {reservations.filter((r) => r.payment_status === 'pending').length} pendientes • {reservations.filter((r) => r.payment_status === 'partial').length} parciales
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">
                  {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : totalReservations}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {completedReservations} completadas
              {totalReservations > 0 && ` (${((completedReservations / totalReservations) * 100).toFixed(0)}%)`}
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Únicos</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    new Set(reservations.map((r) => r.client_name)).size
                  )}
                </p>
              </div>
              <div className="rounded-full bg-accent/10 p-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">Clientes activos en el período</div>
          </Card>
        </div>

        <Card className="border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-semibold text-foreground">Rendimiento por Cancha</h2>
              <p className="text-sm text-muted-foreground">Análisis de uso y ganancias por cancha</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {fieldStats.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">No hay datos para mostrar</p>
              ) : (
                fieldStats.map((stat, index) => (
                  <div key={stat.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-sans text-sm font-semibold text-primary">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{stat.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {stat.reservations} reservas • {stat.utilization}% utilización
                          </p>
                        </div>
                        <p className="font-sans text-lg font-semibold text-foreground">${stat.earnings.toLocaleString()}</p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-primary transition-all" style={{ width: `${stat.utilization}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        <Card className="mt-8 border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-semibold text-foreground">Reservas del Período</h2>
              <p className="text-sm text-muted-foreground">
                {startDate} {startDate !== endDate && `- ${endDate}`} • {reservations.length} reservas
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left">
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Cancha</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Fecha</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Horario</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Cliente</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Teléfono</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Precio</th>
                    <th className="p-3 font-sans text-sm font-semibold text-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No hay reservas para este período
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                        <td className="p-3 font-medium text-foreground">
                          {reservation.field?.name || 'N/A'}
                        </td>
                        <td className="p-3 text-sm text-foreground">{reservation.reservation_date}</td>
                        <td className="p-3 text-sm text-foreground">
                          {reservation.start_time.substring(0, 5)} - {reservation.end_time.substring(0, 5)}
                        </td>
                        <td className="p-3 text-sm text-foreground">{reservation.client_name}</td>
                        <td className="p-3 text-sm text-foreground">{reservation.client_phone}</td>
                        <td className="p-3 font-medium text-foreground">${Number(reservation.total_price).toLocaleString()}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              reservation.payment_status === 'completed'
                                ? "bg-[var(--status-available)]/10 text-[var(--status-available)]"
                                : "bg-[var(--status-reserved)]/10 text-[var(--status-reserved)]"
                            }`}
                          >
                            {reservation.payment_status === 'completed' ? "Pagado" : "Pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}
