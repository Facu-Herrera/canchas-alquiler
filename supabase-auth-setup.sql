-- 🚀 Script de configuración para autenticación
-- Copiá TODO este archivo y pegalo en el SQL Editor de Supabase

-- ============================================
-- 1. FUNCIÓN PARA SINCRONIZAR auth.users → public.users
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, password, full_name, role, is_active, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'NOT_USED', -- La contraseña real está en auth.users
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'admin'::user_role), -- 👈 CAST al tipo correcto
    true,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', users.full_name);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. TRIGGER AUTOMÁTICO
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver su propio perfil
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.users;
CREATE POLICY "Admins can see all profiles"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. INSERTAR/ACTUALIZAR TU USUARIO ADMIN
-- ============================================
-- Esto asegura que tu admin del CSV esté listo

INSERT INTO public.users (id, email, password, full_name, role, phone, is_active, created_at)
VALUES (
  'd7bed83f-0213-4f14-8633-4159b6e0c439',
  'admin@example.com',
  'NOT_USED', -- La contraseña real está en auth.users, esto es solo un placeholder
  'Administrador Principal',
  'admin'::user_role, -- 👈 CAST al tipo correcto
  '1234567890',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;

-- ============================================
-- ✅ LISTO! Ahora:
-- 1. Ve a Authentication → Users en Supabase
-- 2. Click en "Add user" → "Create new user"
-- 3. Email: admin@example.com
-- 4. Password: adminpassword123 (o la que quieras)
-- 5. User UID: d7bed83f-0213-4f14-8633-4159b6e0c439
-- 6. Auto Confirm User: ✓
-- 7. Click en "Create user"
-- ============================================

