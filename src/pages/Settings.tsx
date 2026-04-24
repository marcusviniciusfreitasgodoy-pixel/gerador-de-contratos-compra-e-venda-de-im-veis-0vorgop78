import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Variáveis de ambiente, chaves de API e domínios.
        </p>
      </div>

      <Card className="border-dashed border-2 shadow-none bg-muted/20">
        <CardContent className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="h-8 w-8 text-primary animate-[spin_4s_linear_infinite]" />
          </div>
          <CardTitle className="text-xl">Área de Configurações</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Em breve você poderá gerenciar todas as variáveis de ambiente e configurações de
            infraestrutura diretamente por esta tela.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
