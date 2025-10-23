"use client"

import { Bell, Menu, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth-store"
import type { UserProfile } from "@/lib/types/user"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // Usar el store de auth que ya tiene el perfil cargado
  const profile = useAuthStore(state => state.profile)
  const signOut = useAuthStore(state => state.signOut)

  const handleLogout = async () => {
    console.log("🔵 [NAVBAR] Iniciando logout...")
    setIsLoggingOut(true)
    
    try {
      await signOut()
      console.log("✅ [NAVBAR] Logout exitoso, redirigiendo...")
      
      // Redirigir al login
      window.location.href = "/login"
    } catch (error) {
      console.error("❌ [NAVBAR] Error en logout:", error)
      // Incluso si hay error, redirigir al login
      window.location.href = "/login"
    }
  }

  const userName = profile?.full_name || "Admin"
  const userEmail = profile?.email || "admin@canchas.com"
  const userRole = profile?.role === 'admin' ? 'Administrador' : 'Usuario'
  const userInitials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : userEmail
        .split("@")[0]
        .substring(0, 2)
        .toUpperCase()

  const navItems = [
    { name: "Canchas", href: "/" },
    { name: "Reservas", href: "/reservas" },
    { name: "Reportes", href: "/reportes" },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-mono text-sm font-bold text-primary-foreground">C</span>
            </div>
            <span className="hidden font-sans text-lg font-semibold text-primary sm:inline">CanchaControl</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium transition-colors hover:text-foreground ${
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex h-8 w-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all focus:outline-none focus:ring-primary/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-guKm4FRzQCUZFou9akWhxceZYcTVjQ.png" />
                  <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userEmail}
                  </p>
                  {profile?.role && (
                    <p className="text-xs leading-none text-primary">
                      {userRole}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={isLoggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Cerrando sesión...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 pt-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-guKm4FRzQCUZFou9akWhxceZYcTVjQ.png" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userRole}</p>
                  </div>
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent ${
                        pathname === item.href ? "bg-accent text-accent-foreground" : "text-foreground"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <Button
                  variant="ghost"
                  className="mt-auto justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cerrando sesión...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </>
                  )}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
