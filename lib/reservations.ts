import { supabase } from './supabase'
import type { 
  Reservation, 
  CreateReservationInput, 
  UpdateReservationInput,
  ReservationWithField 
} from './types/reservation'

/**
 * Obtiene todas las reservas con información de la cancha
 */
export async function getAllReservations(): Promise<ReservationWithField[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      field:fields(*)
    `)
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching reservations:', error)
    throw new Error(`Error al obtener reservas: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene reservas de una fecha específica
 */
export async function getReservationsByDate(date: string): Promise<ReservationWithField[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      field:fields(*)
    `)
    .eq('reservation_date', date)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching reservations by date:', error)
    throw new Error(`Error al obtener reservas: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene reservas de una cancha específica
 */
export async function getReservationsByField(fieldId: string): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('field_id', fieldId)
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching reservations by field:', error)
    throw new Error(`Error al obtener reservas de la cancha: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene una reserva por su ID
 */
export async function getReservationById(id: string): Promise<ReservationWithField | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      field:fields(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching reservation:', error)
    throw new Error(`Error al obtener reserva: ${error.message}`)
  }

  return data
}

/**
 * Crea una nueva reserva
 */
export async function createReservation(
  reservation: CreateReservationInput
): Promise<Reservation> {
  // Validar que no haya conflictos de horario
  if (reservation.field_id) {
    const conflicts = await checkReservationConflict(
      reservation.field_id,
      reservation.reservation_date,
      reservation.start_time,
      reservation.end_time
    )

    if (conflicts.length > 0) {
      throw new Error('Ya existe una reserva en ese horario para esta cancha')
    }
  }

  const { data, error } = await supabase
    .from('reservations')
    .insert([{
      ...reservation,
      payment_status: reservation.payment_status || 'pending'
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating reservation:', error)
    throw new Error(`Error al crear reserva: ${error.message}`)
  }

  return data
}

/**
 * Actualiza una reserva existente
 */
export async function updateReservation(
  id: string,
  updates: UpdateReservationInput
): Promise<Reservation> {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating reservation:', error)
    throw new Error(`Error al actualizar reserva: ${error.message}`)
  }

  return data
}

/**
 * Elimina una reserva
 */
export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting reservation:', error)
    throw new Error(`Error al eliminar reserva: ${error.message}`)
  }
}

/**
 * Actualiza el estado de pago de una reserva
 */
export async function updatePaymentStatus(
  id: string,
  status: string
): Promise<Reservation> {
  return updateReservation(id, { payment_status: status })
}

/**
 * Verifica si hay conflictos de horario para una reserva
 */
export async function checkReservationConflict(
  fieldId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string
): Promise<Reservation[]> {
  let query = supabase
    .from('reservations')
    .select('*')
    .eq('field_id', fieldId)
    .eq('reservation_date', date)
    .neq('payment_status', 'cancelled')
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

  if (excludeReservationId) {
    query = query.neq('id', excludeReservationId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking conflicts:', error)
    throw new Error(`Error al verificar conflictos: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene reservas por rango de fechas
 */
export async function getReservationsByDateRange(
  startDate: string,
  endDate: string
): Promise<ReservationWithField[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(`
      *,
      field:fields(*)
    `)
    .gte('reservation_date', startDate)
    .lte('reservation_date', endDate)
    .order('reservation_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching reservations by date range:', error)
    throw new Error(`Error al obtener reservas: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene estadísticas de reservas para un periodo
 */
export async function getReservationStats(startDate: string, endDate: string) {
  const reservations = await getReservationsByDateRange(startDate, endDate)

  const total = reservations.length
  const completed = reservations.filter(r => r.payment_status === 'completed').length
  const pending = reservations.filter(r => r.payment_status === 'pending').length
  const cancelled = reservations.filter(r => r.payment_status === 'cancelled').length
  
  const totalRevenue = reservations
    .filter(r => r.payment_status === 'completed')
    .reduce((sum, r) => sum + Number(r.total_price), 0)
  
  const pendingRevenue = reservations
    .filter(r => r.payment_status === 'pending')
    .reduce((sum, r) => sum + Number(r.total_price), 0)

  return {
    total,
    completed,
    pending,
    cancelled,
    totalRevenue,
    pendingRevenue,
    reservations
  }
}
