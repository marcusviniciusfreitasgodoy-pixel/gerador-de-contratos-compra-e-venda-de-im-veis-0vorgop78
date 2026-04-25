import { useState, useEffect } from 'react'
import { ContractTypeSelector } from '@/components/ContractTypeSelector'
import { ContractForm } from '@/components/ContractForm'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Bot, Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function Home() {
  const [contractType, setContractType] = useState<'a_vista' | 'financiado' | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contracts, setContracts] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  const loadContracts = async () => {
    try {
      const records = await pb.collection('contracts').getList(1, 50, {
        sort: '-created',
      })
      setContracts(records.items)
    } catch (err) {
      console.error(err)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [])

  useRealtime('contracts', () => {
    loadContracts()
  })

  const handleSelect = (type: 'a_vista' | 'financiado') => {
    setIsLoading(true)
    setTimeout(() => {
      setContractType(type)
      setIsLoading(false)
    }, 600)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in space-y-8">
        <Skeleton className="h-[90px] w-full rounded-xl bg-slate-200" />
        <Skeleton className="h-[450px] w-full rounded-xl bg-slate-200" />
        <Skeleton className="h-[450px] w-full rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (contractType) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in">
        <ContractForm
          type={contractType}
          onBack={() => {
            setContractType(null)
            setIsCreating(true)
          }}
        />
      </div>
    )
  }

  if (isCreating) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setIsCreating(false)} className="mb-4">
            &larr; Voltar para Meus Contratos
          </Button>
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-900 tracking-tight">
              Selecione o Modelo
            </h1>
            <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto">
              Escolha o tipo de contrato que deseja gerar (padrão Godoy Prime Realty).
            </p>
          </div>
          <ContractTypeSelector onSelect={handleSelect} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in">
      <div className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Meus Contratos</h1>
            <p className="text-slate-600 text-lg">
              Histórico de contratos gerados e análises jurídicas.
            </p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" /> Gerar Novo Contrato
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200">
        {fetching ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-700">Nenhum contrato gerado</h3>
            <p className="text-slate-500 mt-1">Os contratos que você gerar aparecerão aqui.</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-in fade-in">
            {contracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">
                        {contract.tipo === 'a_vista'
                          ? 'À Vista'
                          : contract.tipo === 'financiado'
                            ? 'Financiado'
                            : contract.tipo}
                      </Badge>
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(contract.created), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg">
                      {contract.nome_vendedor || 'Vendedor Não Informado'} &rarr;{' '}
                      {contract.nome_comprador || 'Comprador Não Informado'}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 line-clamp-1">
                      {contract.endereco_imovel || 'Endereço não informado'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full sm:w-auto text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      <Link to={`/analysis?contractId=${contract.id}`}>
                        <Bot className="w-4 h-4 mr-2" /> Analisar com IA
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
