import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import {
  Rocket,
  Database,
  Users,
  GitMerge,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const chartData = [
  { date: '18 Abr', requests: 1200 },
  { date: '19 Abr', requests: 2100 },
  { date: '20 Abr', requests: 1800 },
  { date: '21 Abr', requests: 2400 },
  { date: '22 Abr', requests: 3100 },
  { date: '23 Abr', requests: 2800 },
  { date: '24 Abr', requests: 3900 },
]

const chartConfig = {
  requests: {
    label: 'Requisições API',
    color: 'hsl(var(--primary))',
  },
}

export default function Index() {
  const { toast } = useToast()
  const [isPublishing, setIsPublishing] = useState(false)

  const handlePublish = () => {
    setIsPublishing(true)
    setTimeout(() => {
      setIsPublishing(false)
      toast({
        title: 'Sucesso!',
        description: 'Seu projeto foi publicado com sucesso no Skip Cloud.',
      })
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-fade-in-up">
      {/* Hero Card */}
      <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white relative">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <CardContent className="p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Projeto Skip-a3fe3</h1>
            <p className="text-indigo-100 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              skip-cloud-a3fe3.goskip.app
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="w-full sm:w-auto shadow-lg hover:scale-105 transition-transform active:scale-95"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <Clock className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Rocket className="mr-2 h-4 w-4" />
            )}
            {isPublishing ? 'Publicando...' : 'Publicar Alterações'}
          </Button>
        </CardContent>
      </Card>

      {/* Grid Overview */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow animate-fade-in-up stagger-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Coleções Ativas
            </CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 na última semana</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in-up stagger-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
            <Users className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Integração de Auth OK
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in-up stagger-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Migrations</CardTitle>
            <GitMerge className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.4.2</div>
            <p className="text-xs text-muted-foreground mt-1">Última há 2 horas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow animate-fade-in-up stagger-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Edge Hooks</CardTitle>
            <Key className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Ativos</div>
            <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> 1 log de aviso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-sm animate-fade-in-up">
          <CardHeader>
            <CardTitle>Requisições da API</CardTitle>
            <CardDescription>Volume de tráfego nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                  />
                  <Bar
                    dataKey="requests"
                    fill="var(--color-requests)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="shadow-sm animate-fade-in-up">
          <CardHeader>
            <CardTitle>Feed de Atividade</CardTitle>
            <CardDescription>Últimas ações no ambiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  title: 'Migration Executada',
                  desc: 'Tabela "products" atualizada',
                  time: 'Há 2 horas',
                  icon: GitMerge,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-50',
                },
                {
                  title: 'Novo Secret Adicionado',
                  desc: 'STRIPE_API_KEY',
                  time: 'Há 5 horas',
                  icon: Key,
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-50',
                },
                {
                  title: 'Deploy Concluído',
                  desc: 'Produção v1.4.1',
                  time: 'Ontem',
                  icon: Rocket,
                  color: 'text-cyan-500',
                  bg: 'bg-cyan-50',
                },
                {
                  title: 'Nova Coleção',
                  desc: 'Criada coleção "reviews"',
                  time: 'Ontem',
                  icon: Database,
                  color: 'text-amber-500',
                  bg: 'bg-amber-50',
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  {i !== 3 && (
                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-border" />
                  )}
                  <div className={`mt-0.5 rounded-full p-2 ${item.bg} ${item.color} shrink-0 z-10`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    <span className="text-[10px] text-muted-foreground/80 font-medium">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
