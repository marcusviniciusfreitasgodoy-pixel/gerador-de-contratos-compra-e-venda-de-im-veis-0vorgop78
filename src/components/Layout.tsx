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
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-xl transition-transform hover:scale-105"
          >
            <FileText className="h-6 w-6" />
            <span>Gerador de Contratos GPR</span>
          </Link>
          <div className="flex items-center gap-4">
            <IntegrationPanel />
            <Link
              to="/analysis"
              className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors border border-purple-100"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline-block">Análise IA</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline-block">{user.name || user.email}</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50"
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
