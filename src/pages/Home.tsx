import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, FileText, Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function Home() {
  const { user } = useAuth()
  const [recentContracts, setRecentContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchDashboardData() {
      if (!user?.id) return

      try {
        setLoading(true)
        const contracts = await pb.collection('contracts').getList(1, 5, {
          sort: '-created',
          filter: `user = "${user.id}"`,
        })

        if (isMounted) {
          setRecentContracts(contracts.items)
          setError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching dashboard data:', err)
          setError('Não foi possível carregar os dados recentes.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()
    return () => {
      isMounted = false
    }
  }, [user?.id])

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-fade-in-up">
      {/* Hero Section */}
      <div className="mb-10 text-center max-w-3xl mx-auto pt-4">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Bem-vindo à Godoy Prime Realty
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Gere e acompanhe os instrumentos legais de suas transações imobiliárias para garantir
          segurança jurídica e uma experiência profissional.
        </p>
      </div>

      {/* Regra de Ouro */}
      <div className="mb-10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-6 rounded-r-xl shadow-sm dark:from-amber-900/30">
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-full dark:bg-amber-900/50 shadow-sm shrink-0">
            <ShieldCheck className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-amber-800 dark:text-amber-400">
              Dica de Segurança
            </h3>
            <p className="text-amber-700 dark:text-amber-300 mt-2 text-base md:text-lg leading-relaxed">
              Mantenha seus modelos de contrato sempre atualizados com a base jurídica mais recente
              e revise as minutas geradas pela IA antes de enviar aos clientes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Contratos Recentes
            </CardTitle>
            <CardDescription>Seus últimos documentos gerados</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
            ) : recentContracts.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                <p>Nenhum contrato gerado ainda.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/contratos/novo">Criar Novo Contrato</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentContracts.map((contract) => (
                  <Link
                    key={contract.id}
                    to={`/contratos/${contract.id}`}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="overflow-hidden">
                        <p className="font-medium text-sm truncate">
                          {contract.tipo || 'Documento'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {contract.nome_comprador
                            ? `Comprador: ${contract.nome_comprador}`
                            : 'Sem comprador definido'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                  </Link>
                ))}
                <Button variant="ghost" className="w-full mt-2" asChild>
                  <Link to="/contratos">Ver Todos</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>O que você deseja fazer hoje?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start h-12 text-md" asChild>
              <Link to="/contratos/novo">
                <FileText className="mr-2 h-5 w-5" />
                Novo Documento
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12 text-md" asChild>
              <Link to="/analysis">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Analisar Contrato com IA
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
