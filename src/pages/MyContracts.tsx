import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Files, FileText, Loader2, Eye, Plus } from 'lucide-react'
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
  const [selectedContract, setSelectedContract] = useState<any | null>(null)

  const loadContracts = async () => {
    try {
      const records = await getMyContracts()
      setContracts(records.items)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
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
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Files className="w-8 h-8 text-indigo-600" />
          Meus Contratos
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Consulte e gerencie todos os contratos que você gerou.
        </p>
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
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              {selectedContract &&
                (titleMap[selectedContract.tipo_documento] ||
                  selectedContract.tipo_documento ||
                  'Documento')}
            </DialogTitle>
            <DialogDescription>
              {selectedContract &&
                format(new Date(selectedContract.created), "dd 'de' MMMM 'de' yyyy, 'às' HH:mm", {
                  locale: ptBR,
                })}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            {selectedContract?.minuta_texto ? (
              <div
                className="prose prose-sm md:prose-base max-w-none text-slate-800 pb-12"
                dangerouslySetInnerHTML={{ __html: selectedContract.minuta_texto }}
              />
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
