import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, FileText, Calendar, Edit, ArrowRight } from 'lucide-react'
import { getMyContracts } from '@/services/contracts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function MyContracts() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const data = await getMyContracts(1, 50)
      setContracts(data.items || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meus Contratos</h1>
          <p className="text-slate-600 mt-2">Gerencie e visualize seus contratos gerados.</p>
        </div>
        <Button onClick={() => navigate('/contratos/novo')} className="gap-2 shadow-sm">
          <Plus className="w-4 h-4" />
          Novo Contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-dashed shadow-none bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">Nenhum contrato encontrado</h3>
            <p className="text-slate-500 mb-8 max-w-md">
              Você ainda não gerou nenhum contrato. Comece criando o seu primeiro documento
              personalizado com IA.
            </p>
            <Button onClick={() => navigate('/contratos/novo')} size="lg" className="shadow-sm">
              Criar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-all border-slate-200">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-800 capitalize">
                      {contract.tipo_documento
                        ? contract.tipo_documento.replace(/_/g, ' ')
                        : 'Contrato Sem Tipo'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(contract.created), "dd 'de' MMM, yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="hidden sm:inline text-slate-300">•</span>
                      <span>
                        Comprador:{' '}
                        <span className="font-medium text-slate-700">
                          {contract.nome_comprador || 'Não informado'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/contratos/${contract.id}`)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4" />
                  Editar / Visualizar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
