"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Edit, Trash2, CalendarIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ConfirmDialog } from "./confirm-dialog"
import { useDataStore } from "@/lib/data-store"
import type { Reservation } from "@/lib/mock-data"

interface FieldDetailViewProps {
  fieldName: string
  fieldType: string
  date: string
  reservations: Reservation[]
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

export function FieldDetailView({ fieldName, fieldType, date, reservations }: FieldDetailViewProps) {
  const updateReservation = useDataStore((state) => state.updateReservation)
  const addReservation = useDataStore((state) => state.addReservation)
  const deleteReservation = useDataStore((state) => state.deleteReservation)

  const [selectedDate, setSelectedDate] = useState(date)
  const [showCalendar, setShowCalendar] = useState(false)

  const [showNewReservation, setShowNewReservation] = useState(false)
  const [newReservationData, setNewReservationData] = useState({
    startTime: "",
    endTime: "",
    clientName: "",
    clientPhone: "",
    comments: "",
  })

  const [showEditReservation, setShowEditReservation] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingReservationId, setDeletingReservationId] = useState<string | null>(null)

  const [showCreateConfirm, setShowCreateConfirm] = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)

  const handleCreateReservation = () => {
    setShowCreateConfirm(true)
  }

  const handleConfirmedCreate = () => {
    const fieldId = reservations[0]?.fieldId || "cancha-a"
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      fieldId,
      fieldName,
      date: selectedDate,
      startTime: newReservationData.startTime,
      endTime: newReservationData.endTime,
      clientName: newReservationData.clientName,
      clientPhone: newReservationData.clientPhone,
      price: 15000,
      completed: false,
      comments: newReservationData.comments,
    }
    addReservation(newReservation)
    setShowCreateConfirm(false)
    setShowNewReservation(false)
    setNewReservationData({
      startTime: "",
      endTime: "",
      clientName: "",
      clientPhone: "",
      comments: "",
    })
  }

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setShowEditReservation(true)
  }

  const handleSaveEdit = () => {
    setShowEditConfirm(true)
  }

  const handleConfirmedEdit = () => {
    if (editingReservation) {
      updateReservation(editingReservation.id, {
        startTime: editingReservation.startTime,
        endTime: editingReservation.endTime,
        clientName: editingReservation.clientName,
        clientPhone: editingReservation.clientPhone,
        completed: editingReservation.completed,
        comments: editingReservation.comments,
      })
    }
    setShowEditConfirm(false)
    setShowEditReservation(false)
    setEditingReservation(null)
  }

  const handleDeleteClick = (id: string) => {
    setDeletingReservationId(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = () => {
    if (deletingReservationId) {
      deleteReservation(deletingReservationId)
    }
    setShowDeleteConfirm(false)
    setDeletingReservationId(null)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-sans text-xl font-bold text-balance sm:text-2xl md:text-3xl">{fieldName}</h1>
            <p className="text-sm text-muted-foreground md:text-base">{fieldType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowCalendar(true)}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button className="flex-1 gap-2 sm:flex-none" onClick={() => setShowNewReservation(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva Reserva</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card">
        <div className="border-b border-border p-4 md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-sans text-lg font-semibold sm:text-xl">Agenda del Día</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">{selectedDate}</p>
          </div>
        </div>

        <div className="overflow-x-auto p-4 md:p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Hora</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="hidden text-muted-foreground sm:table-cell">Comentarios</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((reservation) => {
                const statusLabel = reservation.completed ? "Completada" : "Reservada"
                const statusClass = reservation.completed ? "bg-primary" : "bg-[var(--status-reserved)]"
                return (
                  <TableRow key={reservation.id} className="border-border">
                    <TableCell className="font-mono text-xs font-medium sm:text-sm">
                      {reservation.startTime} - {reservation.endTime}
                    </TableCell>
                    <TableCell className="text-xs font-medium sm:text-sm">{reservation.clientName}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${statusClass} text-white hover:${statusClass}/90`}>
                        {statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {reservation.comments || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => handleEditReservation(reservation)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive sm:h-8 sm:w-8"
                          onClick={() => handleDeleteClick(reservation.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Seleccionar Fecha</DialogTitle>
            <DialogDescription>Elige una fecha para ver las reservas de ese día</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calendar-date">Fecha</Label>
              <Input
                id="calendar-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCalendar(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowCalendar(false)}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewReservation} onOpenChange={setShowNewReservation}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Reserva - {fieldName}</DialogTitle>
            <DialogDescription>Completa los datos para crear una nueva reserva</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-start-time">Hora de Inicio</Label>
                <Select
                  value={newReservationData.startTime}
                  onValueChange={(value) => setNewReservationData({ ...newReservationData, startTime: value })}
                >
                  <SelectTrigger id="new-start-time">
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
                <Label htmlFor="new-end-time">Hora de Fin</Label>
                <Select
                  value={newReservationData.endTime}
                  onValueChange={(value) => setNewReservationData({ ...newReservationData, endTime: value })}
                >
                  <SelectTrigger id="new-end-time">
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
            <div className="space-y-2">
              <Label htmlFor="new-client-name">Nombre del Cliente</Label>
              <Input
                id="new-client-name"
                value={newReservationData.clientName}
                onChange={(e) => setNewReservationData({ ...newReservationData, clientName: e.target.value })}
                placeholder="Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-client-phone">Teléfono</Label>
              <Input
                id="new-client-phone"
                value={newReservationData.clientPhone}
                onChange={(e) => setNewReservationData({ ...newReservationData, clientPhone: e.target.value })}
                placeholder="+54 11 1234-5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-comments">Comentarios</Label>
              <Textarea
                id="new-comments"
                value={newReservationData.comments}
                onChange={(e) => setNewReservationData({ ...newReservationData, comments: e.target.value })}
                placeholder="Información adicional..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewReservation(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateReservation}>Crear Reserva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditReservation} onOpenChange={setShowEditReservation}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Reserva</DialogTitle>
            <DialogDescription>Modifica los datos de la reserva</DialogDescription>
          </DialogHeader>
          {editingReservation && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-start-time">Hora de Inicio</Label>
                  <Input
                    id="edit-start-time"
                    value={editingReservation.startTime}
                    onChange={(e) => setEditingReservation({ ...editingReservation, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-end-time">Hora de Fin</Label>
                  <Input
                    id="edit-end-time"
                    value={editingReservation.endTime}
                    onChange={(e) => setEditingReservation({ ...editingReservation, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client">Cliente</Label>
                <Input
                  id="edit-client"
                  value={editingReservation.clientName}
                  onChange={(e) => setEditingReservation({ ...editingReservation, clientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  value={editingReservation.clientPhone}
                  onChange={(e) => setEditingReservation({ ...editingReservation, clientPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <Select
                  value={editingReservation.completed ? "completed" : "reserved"}
                  onValueChange={(value) =>
                    setEditingReservation({ ...editingReservation, completed: value === "completed" })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reserved">Reservada</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-comments">Comentarios</Label>
                <Textarea
                  id="edit-comments"
                  value={editingReservation.comments || ""}
                  onChange={(e) => setEditingReservation({ ...editingReservation, comments: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditReservation(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showCreateConfirm}
        onOpenChange={setShowCreateConfirm}
        onConfirm={handleConfirmedCreate}
        title="¿Confirmar nueva reserva?"
        description="¿Estás seguro de que deseas crear esta reserva? Se agregará a la agenda del día."
      />

      <ConfirmDialog
        open={showEditConfirm}
        onOpenChange={setShowEditConfirm}
        onConfirm={handleConfirmedEdit}
        title="¿Confirmar cambios?"
        description="¿Estás seguro de que deseas guardar los cambios en esta reserva? La información se actualizará en el sistema."
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground">
              Eliminar Reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
