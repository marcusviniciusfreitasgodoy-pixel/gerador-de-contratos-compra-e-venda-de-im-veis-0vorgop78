import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard } from 'lucide-react'

export default function Layout() {
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 md:px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="size-5" />
          </div>
          <span className="font-semibold text-lg">My App</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            {user.name || user.email}
          </span>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 size-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  )
}
