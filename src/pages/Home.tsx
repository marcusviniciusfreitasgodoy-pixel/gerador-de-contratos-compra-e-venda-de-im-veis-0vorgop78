import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/formatters'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contracts, setContracts] = useState<any[]>([])
  const [showTypeDialog, setShowTypeDialog] = useState(false)

  const loadContracts = async () => {
    try {
      const records = await pb.collection('contracts').getFullList({
        sort: '-created',
      })
      setContracts(records)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (user) {
      loadContracts()
    }
  }, [user])

  const handleCreateNew = (type: 'a_vista' | 'financiado') => {
    setShowTypeDialog(false)
    navigate('/contratos/novo', { state: { type } })
  }

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Meus Contratos</h1>
          <p className="text-slate-600 mt-1">Gerencie seus contratos de compra e venda.</p>
        </div>
        <Button
          onClick={() => setShowTypeDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card className="border-dashed border-2 bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Nenhum contrato encontrado
            </h2>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              Você ainda não gerou nenhum contrato. Clique no botão abaixo para começar a criar seu
              primeiro contrato.
            </p>
            <Button onClick={() => setShowTypeDialog(true)} variant="outline" className="bg-white">
              Criar meu primeiro contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-all hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-3">
                  <Badge
                    variant="outline"
                    className={
                      contract.status === 'pendente'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : contract.status === 'em_elaboracao'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                    }
                  >
                    {contract.status === 'pendente'
                      ? 'Pendente'
                      : contract.status === 'em_elaboracao'
                        ? 'Em Elaboração'
                        : contract.status}
                  </Badge>
                  <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3 mr-1.5" />
                    {format(new Date(contract.created), 'dd MMM yyyy', { locale: ptBR })}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-1">
                  {contract.endereco_imovel || 'Imóvel sem endereço'}
                </CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Badge variant="secondary" className="mr-2 rounded-sm font-normal">
                    {contract.tipo === 'a_vista' ? 'À Vista' : 'Financiado'}
                  </Badge>
                  <span className="ml-auto text-blue-700 font-bold">
                    {formatCurrency(contract.valor_total || 0)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex items-start">
                    <span className="font-semibold text-slate-700 w-24 shrink-0">Vendedor:</span>
                    <span className="truncate" title={contract.nome_vendedor}>
                      {contract.nome_vendedor || '-'}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-slate-700 w-24 shrink-0">Comprador:</span>
                    <span className="truncate" title={contract.nome_comprador}>
                      {contract.nome_comprador || '-'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showTypeDialog} onOpenChange={setShowTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Tipo de Contrato</DialogTitle>
            <DialogDescription>
              Selecione a modalidade de pagamento para o novo contrato de compra e venda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-6">
            <Button
              variant="outline"
              className="h-28 flex flex-col items-center justify-center gap-3 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
              onClick={() => handleCreateNew('a_vista')}
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-lg">1x</span>
              </div>
              <span className="text-base font-semibold">À Vista</span>
            </Button>
            <Button
              variant="outline"
              className="h-28 flex flex-col items-center justify-center gap-3 border-2 hover:border-blue-500 hover:bg-blue-50 transition-all"
              onClick={() => handleCreateNew('financiado')}
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <span className="font-bold text-lg">%</span>
              </div>
              <span className="text-base font-semibold">Financiado</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
