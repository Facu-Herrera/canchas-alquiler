// Tipos para la tabla users customizada
export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user'
  phone: string | null
  is_active: boolean
  created_at: string
  last_login: string | null
}
