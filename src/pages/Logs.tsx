import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function Logs() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
        <p className="text-muted-foreground mt-1">
          Monitore eventos, erros e console.logs das suas edge functions.
        </p>
      </div>

      <Card className="border-dashed border-2 shadow-none bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl">Visualizador de Logs</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            A visualização em tempo real de logs está sendo aprimorada para suportar grandes volumes
            de dados. Verifique a aba de feed no Dashboard por enquanto.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
