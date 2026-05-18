import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Files, FileText, Loader2, Eye, Plus, RefreshCw, AlertCircle } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getMyContracts } from '@/services/contracts'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const titleMap: Record<string, string> = {
  ficha_cadastral: 'Ficha Cadastral',
  checklist_documental: 'Checklist Documental',
  recibo_sinal: 'Recibo de Sinal',
  promessa_compra_venda: 'Promessa de Compra e Venda',
  contrato_particular: 'Contrato Particular',
  termo_entrega_chaves: 'Termo de Entrega de Chaves',
  termo_posse: 'Termo de Posse',
  declaracoes_complementares: 'Declarações Complementares',
  autorizacao_intermediacao: 'Autorização de Intermediação',
  distrato: 'Distrato de Contrato',
}

export default function MyContracts() {
  const { user, loading: authLoading } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedContract, setSelectedContract] = useState<any | null>(null)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const loadContracts = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    try {
      const records = await getMyContracts()
      setContracts(records.items)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar contratos')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRegenerate = async () => {
    if (!selectedContract) return
    setIsRegenerating(true)
    try {
      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(selectedContract),
      })

      const updatedContract = await pb.collection('contracts').update(selectedContract.id, {
        minuta_texto: res.minuta_texto,
        used_clauses: res.used_clauses,
        status: 'concluido',
      })

      toast.success('Minuta regerada com sucesso!')
      setSelectedContract(updatedContract)
      loadContracts()
    } catch (err) {
      toast.error('Erro ao regerar minuta', { description: getErrorMessage(err) })
    } finally {
      setIsRegenerating(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [])

  useRealtime('contracts', () => {
    loadContracts()
  })

  if (authLoading) return null
  if (!user) return <Navigate to="/login" />

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Files className="w-8 h-8 text-indigo-600" />
            Meus Contratos
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Consulte e gerencie todos os contratos que você gerou.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadContracts(true)}
          disabled={isLoading || isRefreshing}
          className="w-fit"
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
          Atualizar Lista
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-700">
            Você ainda não gerou nenhum contrato.
          </h3>
          <p className="text-slate-500 mt-2 mb-6">
            Inicie agora mesmo a criação do seu primeiro documento.
          </p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Link to="/contratos/novo" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Contrato
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 animate-in fade-in">
          {contracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge className="uppercase bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200">
                      {titleMap[contract.tipo_documento] || contract.tipo_documento || 'Documento'}
                    </Badge>
                    <Badge variant="outline" className="uppercase bg-slate-100 text-slate-600">
                      {contract.status || 'Rascunho'}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {format(new Date(contract.created), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
                    {contract.nome_vendedor && (
                      <div>
                        <span className="text-slate-500 mr-1">Vendedor:</span>
                        <span className="font-medium text-slate-800">{contract.nome_vendedor}</span>
                      </div>
                    )}
                    {contract.nome_comprador && (
                      <div>
                        <span className="text-slate-500 mr-1">Comprador:</span>
                        <span className="font-medium text-slate-800">
                          {contract.nome_comprador}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto flex items-center gap-2"
                    onClick={() => setSelectedContract(contract)}
                  >
                    <Eye className="w-4 h-4" />
                    Visualizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b shrink-0 flex flex-row items-start justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                {selectedContract &&
                  (titleMap[selectedContract.tipo_documento] ||
                    selectedContract.tipo_documento ||
                    'Documento')}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {selectedContract &&
                  format(new Date(selectedContract.created), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", {
                    locale: ptBR,
                  })}
              </DialogDescription>
            </div>
            {selectedContract?.minuta_texto?.includes('Erro no provedor de IA') && (
              <Button
                variant="destructive"
                className="mr-8"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regerando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regerar Minuta
                  </>
                )}
              </Button>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 p-6 relative">
            {isRegenerating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-indigo-800 font-medium">Reconstruindo minuta com a IA...</p>
              </div>
            )}

            {selectedContract?.minuta_texto &&
            !selectedContract.minuta_texto.includes('Erro no provedor de IA') ? (
              <div
                className="prose prose-sm md:prose-base max-w-none text-slate-800 pb-12"
                dangerouslySetInnerHTML={{ __html: selectedContract.minuta_texto }}
              />
            ) : selectedContract?.minuta_texto?.includes('Erro no provedor de IA') ? (
              <div className="flex flex-col items-center justify-center py-12 text-red-500">
                <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                <p className="text-lg font-medium text-red-600">
                  A geração da minuta falhou anteriormente.
                </p>
                <p className="text-red-500/80">
                  Ocorreu um erro ao comunicar com o provedor de IA.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mb-4 text-slate-300" />
                <p>Nenhuma minuta de texto disponível para este contrato.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
