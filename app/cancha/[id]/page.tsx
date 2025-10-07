"use client"

import { Navbar } from "@/components/navbar"
import { FieldDetailView } from "@/components/field-detail-view"
import { notFound } from "next/navigation"
import { useDataStore } from "@/lib/data-store"
import { useHydrated } from "@/hooks/use-hydrated"

export default function CanchaDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const fields = useDataStore((state) => state.fields)
  const allReservations = useDataStore((state) => state.reservations)
  const hydrated = useHydrated()
  
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  const field = fields.find((f) => f.id === params.id)

  if (!field) {
    notFound()
  }

  const fieldReservations = allReservations.filter((r) => r.fieldId === params.id)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <FieldDetailView
          fieldName={field.name}
          fieldType={field.type}
          date="Viernes, 10 de Febrero 2025"
          reservations={fieldReservations}
        />
      </main>
    </div>
  )
}
