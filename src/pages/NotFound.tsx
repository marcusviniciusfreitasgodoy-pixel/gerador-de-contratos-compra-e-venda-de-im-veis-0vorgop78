import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('Erro 404: Usuário tentou acessar rota inexistente:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in-up">
      <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold mb-2 tracking-tight">404</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-md">
        Ops! A página que você está procurando não foi encontrada ou foi movida.
      </p>
      <Button asChild size="lg" className="shadow-sm">
        <Link to="/">Voltar para o Dashboard</Link>
      </Button>
    </div>
  )
}

export default NotFound
