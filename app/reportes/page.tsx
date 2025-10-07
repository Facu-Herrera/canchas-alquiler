"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Calendar, Users, BarChart3, PieChart } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { mockAllReservations, mockFields } from "@/lib/mock-data"

export default function ReportesPage() {
  const [period, setPeriod] = useState("today")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const filteredReservations = mockAllReservations.filter((r) => r.date === selectedDate)

  const totalReservations = filteredReservations.length
  const completedReservations = filteredReservations.filter((r) => r.completed).length
  const totalEarnings = filteredReservations.filter((r) => r.completed).reduce((sum, r) => sum + r.price, 0)
  const pendingEarnings = filteredReservations.filter((r) => !r.completed).reduce((sum, r) => sum + r.price, 0)

  const fieldStats = mockFields
    .map((field) => {
      const fieldReservations = filteredReservations.filter((r) => r.fieldId === field.id)
      const fieldEarnings = fieldReservations.filter((r) => r.completed).reduce((sum, r) => sum + r.price, 0)
      return {
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

          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-date" className="text-sm text-muted-foreground">
                Fecha
              </Label>
              <Input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[180px]"
              />
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
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Totales</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">${totalEarnings.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-[var(--status-available)]/10 p-3">
                <DollarSign className="h-6 w-6 text-[var(--status-available)]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-[var(--status-available)]" />
              <span className="text-[var(--status-available)]">+12.5%</span>
              <span className="text-muted-foreground">vs período anterior</span>
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ganancias Pendientes</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">${pendingEarnings.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-[var(--status-reserved)]/10 p-3">
                <Calendar className="h-6 w-6 text-[var(--status-reserved)]" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredReservations.filter((r) => !r.completed).length} reservas pendientes
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reservas</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">{totalReservations}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {completedReservations} completadas ({((completedReservations / totalReservations) * 100).toFixed(0)}%)
            </div>
          </Card>

          <Card className="border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Únicos</p>
                <p className="mt-2 font-sans text-3xl font-bold text-foreground">
                  {new Set(filteredReservations.map((r) => r.clientName)).size}
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

          <div className="space-y-4">
            {fieldStats.map((stat, index) => (
              <div key={stat.name} className="flex items-center gap-4">
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
            ))}
          </div>
        </Card>

        <Card className="mt-8 border-border bg-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-sans text-xl font-semibold text-foreground">Reservas del Día</h2>
              <p className="text-sm text-muted-foreground">
                {selectedDate} • {filteredReservations.length} reservas
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Cancha</th>
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Horario</th>
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Cliente</th>
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Teléfono</th>
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Precio</th>
                  <th className="p-3 font-sans text-sm font-semibold text-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No hay reservas para esta fecha
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-border/50 transition-colors hover:bg-muted/50">
                      <td className="p-3 font-medium text-foreground">{reservation.fieldName}</td>
                      <td className="p-3 text-sm text-foreground">
                        {reservation.startTime} - {reservation.endTime}
                      </td>
                      <td className="p-3 text-sm text-foreground">{reservation.clientName}</td>
                      <td className="p-3 text-sm text-foreground">{reservation.clientPhone}</td>
                      <td className="p-3 font-medium text-foreground">${reservation.price.toLocaleString()}</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            reservation.completed
                              ? "bg-[var(--status-available)]/10 text-[var(--status-available)]"
                              : "bg-[var(--status-reserved)]/10 text-[var(--status-reserved)]"
                          }`}
                        >
                          {reservation.completed ? "Pagado" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
