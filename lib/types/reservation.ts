// Tipos basados en el esquema de la base de datos

export interface Reservation {
  id: string // uuid
  user_id: string | null // uuid
  field_id: string | null // uuid
  client_name: string
  client_phone: string | null
  client_email: string | null
  reservation_date: string // formato: YYYY-MM-DD
  start_time: string // formato: HH:MM:SS
  end_time: string // formato: HH:MM:SS
  total_price: number
  status: string | null
  payment_status: string | null // 'pending' | 'completed' | 'cancelled'
  notes: string | null
  created_at?: string
  created_by?: string // uuid
}

export interface Field {
  id: string // uuid
  name: string
  type: string
  status: string | null
  image: string
  description: string | null
  price_per_hour: number
  capacity: number | null
  is_indoor: boolean | null
  created_at: string | null
  created_by: string | null
  last_modified_at: string | null
  last_modified_by: string | null
}

export interface Payment {
  id: number
  reservation_id: number
  amount: number
  payment_method: string
  transaction_id: string | null
  payment_date: string
  created_at?: string
  created_by?: string
}

// Tipo para crear una nueva reserva (sin id)
export interface CreateReservationInput {
  user_id?: string | null // uuid
  field_id: string // uuid
  client_name: string
  client_phone?: string | null
  client_email?: string | null
  reservation_date: string
  start_time: string
  end_time: string
  total_price: number
  status?: string | null
  payment_status?: string | null
  notes?: string | null
}

// Tipo para actualizar una reserva
export interface UpdateReservationInput {
  client_name?: string
  client_phone?: string | null
  client_email?: string | null
  reservation_date?: string
  start_time?: string
  end_time?: string
  total_price?: number
  status?: string | null
  payment_status?: string | null
  notes?: string | null
}

// Tipo extendido para la UI (con información de la cancha)
export interface ReservationWithField extends Reservation {
  field?: Field
  field_name?: string
}
