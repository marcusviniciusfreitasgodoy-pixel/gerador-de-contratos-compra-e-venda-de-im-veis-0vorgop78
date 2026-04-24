import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function Auth() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autenticação</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie usuários, provedores e políticas de acesso.
        </p>
      </div>

      <Card className="border-dashed border-2 shadow-none bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Módulo em Desenvolvimento</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            A interface detalhada de gestão de usuários estará disponível em breve. Por enquanto, a
            autenticação está funcionando com as configurações padrão do Skip Cloud.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
