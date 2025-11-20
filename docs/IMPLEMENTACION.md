# 🚀 Guía de Implementación del Sistema de Reservas

## ✅ Archivos Creados

### Código TypeScript/React
- ✅ `lib/types/reservation.ts` - Tipos e interfaces
- ✅ `lib/reservations.ts` - Funciones CRUD de reservas
- ✅ `lib/fields.ts` - Funciones para gestionar canchas
- ✅ `app/reservas/page.tsx` - Página de reservas actualizada
- ✅ `app/layout.tsx` - Layout con notificaciones

### Documentación y SQL
- ✅ `RESERVAS_README.md` - Documentación completa del sistema
- ✅ `supabase-reservations-security.sql` - Políticas de seguridad RLS
- ✅ `supabase-test-data.sql` - Datos de prueba
- ✅ `IMPLEMENTACION.md` - Este archivo

## 📋 Pasos para Implementar

### 1. Verificar la Estructura de tu Base de Datos

Tu base de datos debe tener estas tablas con estos campos exactos:

#### Tabla `reservations`:
```sql
- id (int8, PRIMARY KEY)
- user_id (int8, nullable)
- field_id (int8, FOREIGN KEY)
- client_name (text)
- client_phone (text)
- reservation_date (date)
- start_time (time)
- end_time (time)
- total_price (numeric)
- notes (text, nullable)
- payment_status (text) -- 'pending', 'completed', 'cancelled'
- created_at (timestamptz)
- created_by (timestamptz)
```

#### Tabla `available_fields`:
```sql
- id (int8, PRIMARY KEY)
- city_of_court (text)
- court_floor (text)
- send_form (boolean)
- price (numeric, nullable)
- created_at (timestamptz)
```

**IMPORTANTE**: Si tus nombres de campos son diferentes, tendrás que ajustar los archivos TypeScript.

### 2. Ejecutar Scripts SQL en Supabase

#### A. Configurar Seguridad (RLS)

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Abre el archivo `supabase-reservations-security.sql`
4. Copia todo el contenido
5. Pégalo en el SQL Editor
6. Click en **Run**

Esto configurará:
- ✅ Row Level Security (RLS)
- ✅ Políticas de acceso
- ✅ Índices para rendimiento
- ✅ Función para validar conflictos
- ✅ Triggers automáticos

#### B. Insertar Datos de Prueba (Opcional)

1. En el SQL Editor de Supabase
2. Abre el archivo `supabase-test-data.sql`
3. Copia y pega el contenido
4. Click en **Run**

Esto creará:
- ✅ 6 canchas de ejemplo
- ✅ 15 reservas de ejemplo
- ✅ Reservas para hoy, mañana y días pasados

### 3. Verificar Variables de Entorno

Tu archivo `.env.local` debe tener:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon
```

**Nota**: Ya las tienes configuradas en `lib/supabase.ts`, así que esto está listo.

### 4. Instalar Dependencias (Ya están instaladas ✅)

Las siguientes dependencias ya están en tu `package.json`:
- ✅ `@supabase/supabase-js`
- ✅ `sonner` (notificaciones)
- ✅ Todos los componentes de UI

Si por alguna razón necesitas reinstalar:
```bash
pnpm install
```

### 5. Verificar que el Código Compila

Ejecuta en la terminal:

```bash
pnpm run dev
```

El proyecto debe iniciarse sin errores en `http://localhost:3000`

### 6. Probar el Sistema

#### A. Navegar a la Página de Reservas
- Abre tu navegador en `http://localhost:3000/reservas`
- Deberías ver las reservas del día actual (si insertaste datos de prueba)

#### B. Crear una Nueva Reserva
1. Click en el botón "Nueva Reserva"
2. Completa el formulario:
   - Selecciona una cancha
   - Elige fecha: hoy o mañana
   - Horario de inicio: 12:00
   - Horario de fin: 13:00
   - Nombre del cliente: "Prueba Sistema"
   - Teléfono: "+54 11 0000-0000"
   - Notas (opcional): "Reserva de prueba"
3. Click en "Crear Reserva"
4. Deberías ver un mensaje de éxito
5. La reserva aparecerá en la tabla

#### C. Marcar Pago como Completado
1. En la tabla de reservas, encuentra una reserva pendiente
2. Click en el checkbox junto a "Pendiente"
3. Debería cambiar a "Pagado"
4. Las ganancias del día se actualizan automáticamente

#### D. Cambiar de Fecha
1. Usa el selector de fecha en la parte superior
2. Selecciona mañana o ayer
3. La tabla debe actualizarse con las reservas de esa fecha

### 7. Verificar en Supabase

1. Ve a Supabase Dashboard
2. Navega a **Table Editor**
3. Selecciona la tabla `reservations`
4. Deberías ver tus reservas creadas
5. Verifica que los datos son correctos

## 🔧 Solución de Problemas

### Error: "Error al obtener reservas"

**Causa**: Problema de conexión con Supabase o RLS mal configurado

**Solución**:
1. Verifica que las URLs en `lib/supabase.ts` son correctas
2. Ejecuta el script `supabase-reservations-security.sql`
3. Revisa la consola del navegador (F12) para más detalles
4. Ve a Supabase Dashboard → Authentication → Policies y verifica que las políticas existan

### Error: "Ya existe una reserva en ese horario"

**Causa**: Intentas crear una reserva que se solapa con otra existente

**Solución**:
1. Elige un horario diferente
2. O verifica en la base de datos si hay una reserva conflictiva:
```sql
SELECT * FROM reservations 
WHERE field_id = X 
  AND reservation_date = 'YYYY-MM-DD'
  AND payment_status != 'cancelled';
```

### Las canchas no aparecen en el selector

**Causa**: La tabla `available_fields` está vacía o no tiene permisos

**Solución**:
1. Ejecuta el script `supabase-test-data.sql` para insertar canchas
2. O inserta manualmente:
```sql
INSERT INTO available_fields (city_of_court, court_floor, send_form, price) 
VALUES ('Tu Ciudad', 'Césped Sintético', true, 15000);
```
3. Verifica las políticas RLS de la tabla

### Las notificaciones no aparecen

**Causa**: El componente `<Toaster />` no está en el layout

**Solución**:
1. Verifica que `app/layout.tsx` tenga:
```tsx
import { Toaster } from "@/components/ui/sonner"
// ...
<Toaster />
```
2. Ya debe estar configurado, pero si no, revisa el archivo

### Error de TypeScript en nombres de campos

**Causa**: Los nombres de campos en tu base de datos son diferentes

**Solución**:
1. Verifica los nombres exactos en Supabase
2. Actualiza los tipos en `lib/types/reservation.ts`
3. Actualiza las referencias en `app/reservas/page.tsx`

## 📊 Verificar que Todo Funciona

### Checklist Final

- [ ] El servidor Next.js inicia sin errores (`pnpm run dev`)
- [ ] La página `/reservas` carga correctamente
- [ ] Se ven las reservas existentes (si hay)
- [ ] El botón "Nueva Reserva" abre el formulario
- [ ] El selector de canchas muestra opciones
- [ ] Se puede crear una reserva nueva
- [ ] Aparece notificación de éxito
- [ ] La nueva reserva aparece en la tabla
- [ ] Se puede marcar un pago como completado
- [ ] Las ganancias se actualizan correctamente
- [ ] Se pueden filtrar reservas por fecha
- [ ] La consola del navegador no tiene errores

## 🎯 Próximos Pasos

Una vez que todo funcione, puedes:

1. **Personalizar el diseño** según tu marca
2. **Agregar más campos** a las reservas si lo necesitas
3. **Implementar edición** de reservas existentes
4. **Agregar filtros avanzados** (por cancha, estado, cliente)
5. **Crear vista de calendario** para mejor visualización
6. **Enviar notificaciones** por WhatsApp o Email
7. **Generar reportes** en PDF

## 📚 Recursos

- **Documentación del Sistema**: `RESERVAS_README.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Shadcn/ui**: https://ui.shadcn.com

## 🆘 Necesitas Ayuda?

Si encuentras algún problema:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Revisa los logs de Supabase** (Dashboard → Logs)
3. **Lee la documentación** en `RESERVAS_README.md`
4. **Verifica los scripts SQL** que ejecutaste
5. **Compara tu código** con los archivos originales

## ✨ ¡Listo!

Si seguiste todos los pasos, tu sistema de reservas debería estar funcionando perfectamente. 

¡Felicidades! 🎉
