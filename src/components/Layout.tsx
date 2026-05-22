import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { GodoyLogo } from '@/components/GodoyLogo'
import pb from '@/lib/pocketbase/client'

export default function Layout() {
  const { user, signOut, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const customLogoUrl = user?.imobiliaria_logo ? pb.files.getURL(user, user.imobiliaria_logo) : null
  const brandName = user?.imobiliaria_nome || 'Godoy Prime Realty'

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col min-h-screen bg-slate-50 font-sans w-full">
        <header className="bg-primary border-b-4 border-secondary sticky top-0 z-10 shadow-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="text-primary-foreground hover:bg-primary-foreground/20 md:hidden" />
              <Link to="/" className="flex items-center transition-opacity hover:opacity-80">
                {customLogoUrl ? (
                  <img
                    src={customLogoUrl}
                    alt={brandName}
                    className="h-8 md:h-10 w-auto object-contain max-w-[150px] md:max-w-[200px]"
                  />
                ) : (
                  <GodoyLogo className="h-8 md:h-10 w-auto text-primary-foreground" />
                )}
              </Link>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="text-primary-foreground hover:text-red-400 hover:bg-white/10 font-semibold"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline-block">Sair</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
