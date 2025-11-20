import { supabase } from './supabase'
import type { Field } from './types/reservation'

/**
 * Obtiene todas las canchas disponibles
 */
export async function getAllFields(): Promise<Field[]> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching fields:', error)
    throw new Error(`Error al obtener canchas: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene una cancha por su ID
 */
export async function getFieldById(id: string): Promise<Field | null> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching field:', error)
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    throw new Error(`Error al obtener cancha: ${error.message}`)
  }

  return data
}

/**
 * Obtiene canchas por tipo
 */
export async function getFieldsByType(type: string): Promise<Field[]> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('type', type)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching fields by type:', error)
    throw new Error(`Error al obtener canchas: ${error.message}`)
  }

  return data || []
}

/**
 * Obtiene canchas por estado
 */
export async function getFieldsByStatus(status: string): Promise<Field[]> {
  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('status', status)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching fields by floor type:', error)
    throw new Error(`Error al obtener canchas: ${error.message}`)
  }

  return data || []
}

/**
 * Verifica si una cancha está disponible en un horario específico
 */
export async function isFieldAvailable(
  fieldId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reservations')
    .select('id')
    .eq('field_id', fieldId)
    .eq('reservation_date', date)
    .neq('payment_status', 'cancelled')
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`)

  if (error) {
    console.error('Error checking field availability:', error)
    throw new Error(`Error al verificar disponibilidad: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Obtiene los horarios ocupados de una cancha para una fecha
 */
export async function getFieldOccupiedSlots(
  fieldId: string,
  date: string
): Promise<Array<{ start_time: string; end_time: string }>> {
  const { data, error } = await supabase
    .from('reservations')
    .select('start_time, end_time')
    .eq('field_id', fieldId)
    .eq('reservation_date', date)
    .neq('payment_status', 'cancelled')
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching occupied slots:', error)
    throw new Error(`Error al obtener horarios ocupados: ${error.message}`)
  }

  return data || []
}
