# 🔐 Sistema de Autenticación - Admin Login (Con Tabla Users Customizada)

## ✅ Lo que se implementó:

1. **Store de Autenticación** (`lib/auth-store.ts`)
   - Login con email/password usando Supabase Auth
   - **Carga automática del perfil desde tu tabla `users`**
   - Logout
   - Verificación de sesión
   - Estado global del usuario + perfil (full_name, role, phone, etc.)

2. **Tipos TypeScript** (`lib/types/user.ts`)
   - Interface `UserProfile` con todos los campos de tu tabla users
   - Totalmente tipado para evitar errores

3. **Página de Login** (`app/login/page.tsx`)
   - Formulario limpio y moderno
   - Validación de campos
   - Manejo de errores
   - Loading states

4. **Middleware de Protección** (`middleware.ts`)
   - Protege todas las rutas automáticamente
   - Redirige a `/login` si no hay sesión
   - Redirige a `/` si ya estás logueado

5. **Navbar Actualizado** (`components/navbar.tsx`)
   - **Muestra el `full_name` del usuario** 🎯
   - **Muestra el `role` (Administrador/Usuario)** 🎯
   - Dropdown con info completa del perfil
   - Botón de cerrar sesión
   - Responsive (mobile y desktop)

6. **Auth Provider** (`components/auth-provider.tsx`)
   - Verifica sesión al iniciar la app
   - Escucha cambios de autenticación en tiempo real
   - Carga el perfil automáticamente

7. **SQL Setup** (`supabase-auth-setup.sql`)
   - Trigger para sincronizar `auth.users` → `public.users`
   - Políticas RLS para seguridad
   - Script listo para ejecutar

---

## 🚀 Cómo configurar (PASO A PASO):

### 1️⃣ Ejecutar el SQL en Supabase

1. Ve a tu proyecto en [https://supabase.com](https://supabase.com)
2. En el menú lateral, click en **"SQL Editor"**
3. Abre el archivo `supabase-auth-setup.sql` que está en tu proyecto
4. **Copia TODO el contenido** y pégalo en el SQL Editor
5. Click en **"Run"** (botón verde)
6. Verifica que no haya errores

Esto va a:
- ✅ Crear el trigger de sincronización automática
- ✅ Configurar las políticas de seguridad (RLS)
- ✅ Preparar todo para que funcione

### 2️⃣ Crear el usuario Admin

**Ya tenés el usuario en tu CSV, así que hay 2 opciones:**

#### Opción A: Crear en Supabase Dashboard (MÁS FÁCIL)

1. Ve a **Authentication** → **Users**
2. Click en **"Add user"** → **"Create new user"**
3. Ingresa:
   - **Email**: `admin@example.com`
   - **Password**: `adminpassword123` (o la que quieras)
   - **Auto Confirm User**: ✓ (activado)
   - **User UID**: `d7bed83f-0213-4f14-8633-4159b6e0c439` (el del CSV)
4. Click en **"Create user"**

5. **Ahora actualiza la tabla `users`:**
   - Ve a **Table Editor** → tabla `users`
   - Busca el registro con ese ID
   - Si no existe, créalo manualmente o ejecuta en SQL Editor:

\`\`\`sql
INSERT INTO public.users (id, email, full_name, role, phone, is_active, created_at)
VALUES (
  'd7bed83f-0213-4f14-8633-4159b6e0c439',
  'admin@example.com',
  'Administrador Principal',
  'admin',
  '1234567890',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;
\`\`\`

#### Opción B: Ya tenés el user en auth.users

Si YA creaste el usuario en auth.users, solo ejecuta esto en SQL Editor:

\`\`\`sql
UPDATE public.users
SET
  email = 'admin@example.com',
  full_name = 'Administrador Principal',
  role = 'admin',
  phone = '1234567890',
  is_active = true
WHERE id = 'd7bed83f-0213-4f14-8633-4159b6e0c439';
\`\`\`

### 3️⃣ Verificar que todo esté conectado

Ejecuta en SQL Editor:

\`\`\`sql
-- Ver usuarios en auth.users
SELECT id, email, created_at FROM auth.users;

-- Ver usuarios en public.users  
SELECT id, email, full_name, role, is_active FROM public.users;
\`\`\`

Los IDs deben coincidir entre ambas tablas.

---

## 🔥 Cómo usar el sistema:

### 1. Iniciar sesión
- Ve a `http://localhost:3000/login`
- Ingresa el email y password del admin
- Click en "Iniciar Sesión"
- Serás redirigido al dashboard

### 2. Cerrar sesión
- **Desktop**: Click en tu avatar en la esquina superior derecha → "Cerrar Sesión"
- **Mobile**: Click en el menú hamburguesa → "Cerrar Sesión"

### 3. Protección automática
- Si intentas acceder a cualquier página sin login → Te redirige a `/login`
- Si intentas ir a `/login` ya logueado → Te redirige a `/`
- La sesión persiste en cookies (no se pierde al refrescar)

---

## 🛠️ Archivos creados/modificados:

### Nuevos archivos:
- ✅ `lib/auth-store.ts` - Store de autenticación
- ✅ `app/login/page.tsx` - Página de login
- ✅ `middleware.ts` - Protección de rutas
- ✅ `components/auth-provider.tsx` - Provider de auth

### Archivos modificados:
- ✅ `components/navbar.tsx` - Agregado logout y user info
- ✅ `app/layout.tsx` - Agregado AuthProvider
- ✅ `package.json` - Agregado @supabase/ssr

---

## 🎨 Features implementados:

- ✅ Login con email/password
- ✅ Logout funcional
- ✅ Protección de rutas automática
- ✅ Persistencia de sesión
- ✅ UI moderna y responsive
- ✅ Loading states
- ✅ Manejo de errores
- ✅ Dropdown con info del usuario
- ✅ Auto-redirect según estado de sesión

---

## 🔮 Próximos pasos (opcional):

Si querés seguir mejorando el sistema de auth:

1. **Forgot Password**: Agregar reset de contraseña
2. **Roles**: Implementar sistema de roles (admin, usuario, etc)
3. **Permisos**: Diferentes permisos según rol
4. **2FA**: Autenticación de dos factores
5. **Session Timeout**: Cerrar sesión automática por inactividad

---

## 🐛 Troubleshooting:

### Error: "Invalid login credentials"
- Verifica que el email/password sean correctos
- Verifica que el usuario esté creado en Supabase
- Verifica que el usuario tenga "email_confirmed_at" poblado

### Error: "No se puede conectar a Supabase"
- Verifica que las variables de entorno estén configuradas:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### La sesión no persiste al refrescar
- El middleware maneja esto automáticamente con cookies
- Si el problema persiste, limpia las cookies del navegador

---

¡Listo pa! 🚀 Ya tenés todo el sistema de autenticación funcionando como un campeón! 💪
