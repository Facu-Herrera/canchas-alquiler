# Sistema de Reservas - Documentación

## 📋 Descripción

El sistema de reservas está completamente integrado con Supabase y permite gestionar reservas de canchas de forma eficiente.

## 🗄️ Estructura de Base de Datos

### Tabla: `reservations`
- `id` (int8) - ID único de la reserva
- `user_id` (int8, nullable) - ID del usuario que creó la reserva
- `field_id` (int8) - ID de la cancha reservada (FK a `available_fields`)
- `client_name` (text) - Nombre del cliente
- `client_phone` (text) - Teléfono del cliente
- `reservation_date` (date) - Fecha de la reserva
- `start_time` (time) - Hora de inicio
- `end_time` (time) - Hora de fin
- `total_price` (numeric) - Precio total de la reserva
- `notes` (text, nullable) - Notas adicionales
- `payment_status` (text) - Estado del pago: 'pending', 'completed', 'cancelled'
- `created_at` (timestamptz) - Fecha de creación
- `created_by` (timestamptz) - Creado por

### Tabla: `available_fields`
- `id` (int8) - ID único de la cancha
- `city_of_court` (text) - Ciudad de la cancha
- `court_floor` (text) - Tipo de piso de la cancha
- `send_form` (bool) - Si se envía formulario
- `price` (numeric, opcional) - Precio por hora
- `created_at` (timestamptz) - Fecha de creación

## 🚀 Funcionalidades Implementadas

### ✅ Ver Reservas
- Filtrar reservas por fecha
- Ver información completa de cada reserva
- Indicador visual del estado de pago
- Cálculo automático de ganancias del día

### ✅ Crear Reserva
- Formulario completo con validación
- Selección de cancha desde base de datos
- Verificación automática de conflictos de horario
- Cálculo automático del precio basado en duración
- Notificaciones de éxito/error

### ✅ Actualizar Estado de Pago
- Checkbox para marcar pagos como completados
- Actualización en tiempo real
- Notificaciones visuales

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`lib/types/reservation.ts`**
   - Tipos TypeScript para reservas
   - Interfaces para crear/actualizar reservas
   - Tipos extendidos con información de canchas

2. **`lib/reservations.ts`**
   - Funciones CRUD para reservas
   - `getAllReservations()` - Obtener todas las reservas
   - `getReservationsByDate()` - Filtrar por fecha
   - `getReservationsByField()` - Filtrar por cancha
   - `createReservation()` - Crear nueva reserva
   - `updateReservation()` - Actualizar reserva
   - `deleteReservation()` - Eliminar reserva
   - `updatePaymentStatus()` - Actualizar estado de pago
   - `checkReservationConflict()` - Verificar conflictos
   - `getReservationStats()` - Obtener estadísticas

3. **`lib/fields.ts`**
   - Funciones para gestionar canchas
   - `getAllFields()` - Obtener todas las canchas
   - `getFieldById()` - Obtener cancha por ID
   - `isFieldAvailable()` - Verificar disponibilidad
   - `getFieldOccupiedSlots()` - Obtener horarios ocupados

### Archivos Modificados

1. **`app/reservas/page.tsx`**
   - Integración completa con Supabase
   - Carga de reservas desde base de datos
   - Formulario de creación funcional
   - Sistema de notificaciones con Sonner
   - Estados de carga (loading/submitting)

2. **`app/layout.tsx`**
   - Agregado componente `<Toaster />` para notificaciones

## 🎯 Cómo Usar

### Ver Reservas del Día

1. Navega a `/reservas`
2. Por defecto muestra las reservas del día actual
3. Usa el selector de fecha para ver reservas de otros días
4. Las reservas se muestran en una tabla con toda la información

### Crear Nueva Reserva

1. Click en el botón "Nueva Reserva"
2. Completa el formulario:
   - Selecciona una cancha
   - Elige fecha y horarios
   - Ingresa datos del cliente
   - Agrega notas opcionales
3. Click en "Crear Reserva"
4. El sistema verificará automáticamente:
   - Que no haya conflictos de horario
   - Que todos los campos requeridos estén completos
5. Si todo está bien, la reserva se creará y aparecerá en la lista

### Marcar Pago como Completado

1. En la tabla de reservas, cada fila tiene un checkbox
2. Click en el checkbox para cambiar el estado
3. Verde = Pagado, Gris = Pendiente
4. Las ganancias del día se actualizan automáticamente

## 🔧 Funciones Útiles

### Verificar Disponibilidad

```typescript
import { isFieldAvailable } from '@/lib/fields'

const available = await isFieldAvailable(
  1, // field_id
  '2025-10-30', // date
  '10:00:00', // start_time
  '11:00:00'  // end_time
)
```

### Obtener Estadísticas

```typescript
import { getReservationStats } from '@/lib/reservations'

const stats = await getReservationStats(
  '2025-10-01', // start_date
  '2025-10-31'  // end_date
)

console.log(stats.totalRevenue) // Ingresos totales
console.log(stats.completed) // Cantidad de reservas completadas
```

### Crear Reserva Programáticamente

```typescript
import { createReservation } from '@/lib/reservations'

const newReservation = await createReservation({
  field_id: 1,
  client_name: "Juan Pérez",
  client_phone: "+54 11 1234-5678",
  reservation_date: "2025-10-30",
  start_time: "10:00:00",
  end_time: "11:00:00",
  total_price: 15000,
  notes: "Primera reserva",
  payment_status: "pending"
})
```

## ⚠️ Validaciones Implementadas

- ✅ No se pueden crear reservas con horarios solapados
- ✅ Todos los campos requeridos deben estar completos
- ✅ Los horarios deben tener formato correcto
- ✅ El precio se calcula automáticamente
- ✅ Las fechas deben ser válidas

## 🎨 Características de UI

- 🔄 Indicadores de carga durante operaciones
- 🔔 Notificaciones toast para éxito/error
- 📊 Estadísticas en tiempo real de ganancias
- 🎯 Tabla responsiva con scroll
- ✨ Animaciones suaves
- 🌙 Soporte para tema oscuro/claro

## 🔜 Próximas Mejoras Sugeridas

- [ ] Editar reservas existentes
- [ ] Eliminar/cancelar reservas
- [ ] Filtros avanzados (por cancha, cliente, estado)
- [ ] Vista de calendario
- [ ] Reservas recurrentes
- [ ] Envío de confirmaciones por WhatsApp/Email
- [ ] Reportes de ingresos por periodo
- [ ] Gestión de pagos parciales

## 🐛 Solución de Problemas

### Error: "Ya existe una reserva en ese horario"
- Verifica que no haya otra reserva activa (no cancelada) en el mismo horario
- Revisa la base de datos para confirmar

### Las reservas no se cargan
- Verifica la conexión a Supabase
- Revisa la consola del navegador para errores
- Confirma que la tabla `reservations` exista y tenga datos

### El precio no se calcula
- Asegúrate de que las canchas tengan un campo `price` en la base de datos
- Verifica que los horarios de inicio y fin sean válidos

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda, revisa:
1. La consola del navegador (F12)
2. Los logs de Supabase
3. Este archivo de documentación
