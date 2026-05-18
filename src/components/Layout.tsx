import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, FileText, UserCircle, Bot } from 'lucide-react'
import { IntegrationPanel } from '@/components/IntegrationPanel'

export default function Layout() {
  const { user, signOut, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-primary border-b-4 border-secondary sticky top-0 z-10 shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-primary-foreground font-bold text-xl transition-transform hover:scale-105 tracking-wide uppercase"
          >
            <div className="w-8 h-8 bg-secondary flex items-center justify-center rounded-sm text-primary">
              <span className="font-bold text-xl leading-none">G</span>
            </div>
            <span>Godoy Prime Realty</span>
          </Link>
          <div className="flex items-center gap-4">
            <IntegrationPanel />
            <Link
              to="/analysis"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground hover:text-white bg-primary-foreground/10 hover:bg-primary-foreground/20 px-4 py-2 rounded-full transition-colors border border-primary-foreground/20"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline-block">Análise IA</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm font-semibold text-primary-foreground hover:text-white bg-primary-foreground/10 hover:bg-primary-foreground/20 px-4 py-2 rounded-full transition-colors border border-primary-foreground/20"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline-block">{user.name || user.email}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-primary-foreground hover:text-red-400 hover:bg-white/10 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
