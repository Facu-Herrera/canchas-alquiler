# Guía de Deploy en Vercel

## Configuración Actual
✅ Variables de entorno migradas a `.env.local`
✅ `.gitignore` configurado correctamente
✅ Código listo para producción

## Paso a Paso para Deploy

### 1. Preparar el Repositorio Git

```bash
# Si no has inicializado git aún:
git init
git add .
git commit -m "Initial commit - Sistema de alquiler de canchas"

# Crear repositorio en GitHub y conectar:
git remote add origin https://github.com/JuaniSuso/canchas-alquiler-tsx.git
git branch -M main
git push -u origin main
```

### 2. Configurar Vercel

1. Ve a https://vercel.com
2. Haz clic en "Sign Up" o "Log In"
3. Conecta con tu cuenta de GitHub
4. Haz clic en "Add New Project"
5. Importa el repositorio `canchas-alquiler-tsx`

### 3. Configurar Variables de Entorno

En la pantalla de configuración del proyecto en Vercel:

1. Ve a la sección "Environment Variables"
2. Agrega estas variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://knybyvdgvllygcipjahw.supabase.co

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueWJ5dmRndmxseWdjaXBqYWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5ODgxNzcsImV4cCI6MjA3NTU2NDE3N30.c_wFkprUj1Sfa6sC-Fj9vDBH-KaXmThtIwcKz-73Igc
```

3. Selecciona "Production", "Preview" y "Development" para todas

### 4. Deploy

1. Haz clic en "Deploy"
2. Espera 1-2 minutos
3. ¡Tu aplicación estará en vivo!

### 5. URL Final

Recibirás una URL como:
- `https://canchas-alquiler-tsx.vercel.app`

Puedes agregar un dominio personalizado después en Project Settings > Domains

### 6. Configurar Supabase para Producción

En Supabase Dashboard:
1. Ve a Authentication > URL Configuration
2. Agrega tu URL de Vercel a "Site URL"
3. Agrega a "Redirect URLs": `https://tu-app.vercel.app/**`

## Comandos Git Útiles

```bash
# Verificar estado
git status

# Hacer commit de cambios futuros
git add .
git commit -m "Descripción del cambio"
git push

# Vercel hará deploy automático con cada push a main
```

## Troubleshooting

**Error de build:**
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en Vercel Dashboard

**Variables no definidas:**
- Verifica que las variables en Vercel tengan el prefijo `NEXT_PUBLIC_`
- Redeploy después de agregar variables

**Error de conexión a Supabase:**
- Verifica las URLs permitidas en Supabase Dashboard
- Verifica que las variables de entorno sean correctas

## Deploy Automático

Cada vez que hagas `git push` a la rama `main`, Vercel automáticamente:
1. Detecta los cambios
2. Hace build del proyecto
3. Deploya la nueva versión
4. Te notifica cuando está listo

¡Tu app estará siempre actualizada!
