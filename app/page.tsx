"use client"

import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { FieldCard } from "@/components/field-card"
import { Button } from "@/components/ui/button"
import { CreateFieldDialog } from "@/components/create-field-dialog"
import { useDataStore } from "@/lib/data-store"
import { useHydrated } from "@/hooks/use-hydrated"

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const hydrated = useHydrated()
  const fields = useDataStore((state) => state.fields)
  const loading = useDataStore((state) => state.loading)
  const error = useDataStore((state) => state.error)
  const fetchFields = useDataStore((state) => state.fetchFields)

  // **CAMBIO 9: useEffect SIMPLE - Solo carga cuando hydrated es true, una sola vez**
  // Antes: Tenías dos useEffect que se llamaban entre sí causando loops infinitos
  // Ahora: Un solo useEffect que se ejecuta una vez cuando el componente se monta
  useEffect(() => {
    if (hydrated) {
      console.log('🔄 Cargando canchas desde Supabase...')
      fetchFields()
    }
  }, [hydrated, fetchFields])

  // **CAMBIO 12: Auto-refresh cuando vuelves a la pestaña**
  // Esto detecta cuando vuelves a la pestaña del navegador y refresca los datos
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && hydrated) {
        console.log('👀 Pestaña visible - Refrescando datos...')
        fetchFields()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Limpieza: removemos el listener cuando el componente se desmonta
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hydrated, fetchFields])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-6">
          <p>Inicializando aplicación...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-6">
          <p>Cargando canchas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-sans text-2xl font-bold text-balance text-foreground md:text-4xl">
                Panel de Control de Canchas
              </h1>
              <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
                Cargando...
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {/* Loading skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-balance text-foreground md:text-4xl">
              Panel de Control de Canchas
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
              Visualiza y gestiona el estado de todas las canchas
            </p>
          </div>

          <Button
            className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 md:w-auto"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Crear Nueva Cancha
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {fields.map((field) => (
            <FieldCard key={field.id} field={field} />
          ))}
        </div>
      </main>

      <CreateFieldDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  )
}
