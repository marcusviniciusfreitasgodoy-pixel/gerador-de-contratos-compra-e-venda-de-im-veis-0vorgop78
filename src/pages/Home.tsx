import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, Link, Navigate } from 'react-router-dom'
import { format, isValid, parseISO } from 'date-fns'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { generateContractDocx } from '@/services/contracts'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bot,
  Download,
  Trash2,
  FileText,
  AlertCircle,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

function DatePicker({
  date,
  setDate,
  placeholder,
}: {
  date: string
  setDate: (d: string) => void
  placeholder: string
}) {
  const parsedDate = date ? parseISO(date) : undefined
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[150px] justify-start text-left font-normal bg-white',
            !date && 'text-slate-500',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date && isValid(parsedDate) ? (
            format(parsedDate, 'dd/MM/yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={(d) => {
            setDate(d ? format(d, 'yyyy-MM-dd') : '')
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlTipo = searchParams.get('tipo') || 'todos'
  const urlStatus = searchParams.get('status') || 'todos'
  const urlDataInicio = searchParams.get('data_inicio') || ''
  const urlDataFim = searchParams.get('data_fim') || ''
  const urlPage = parseInt(searchParams.get('page') || '1', 10)

  const [localFilters, setLocalFilters] = useState({
    tipo: urlTipo,
    status: urlStatus,
    dataInicio: urlDataInicio,
    dataFim: urlDataFim,
  })

  useEffect(() => {
    setLocalFilters({
      tipo: urlTipo,
      status: urlStatus,
      dataInicio: urlDataInicio,
      dataFim: urlDataFim,
    })
  }, [urlTipo, urlStatus, urlDataInicio, urlDataFim])

  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams()

      if (localFilters.tipo !== 'todos') newParams.set('tipo', localFilters.tipo)
      if (localFilters.status !== 'todos') newParams.set('status', localFilters.status)
      if (localFilters.dataInicio) newParams.set('data_inicio', localFilters.dataInicio)
      if (localFilters.dataFim) newParams.set('data_fim', localFilters.dataFim)

      const filtersChanged =
        localFilters.tipo !== urlTipo ||
        localFilters.status !== urlStatus ||
        localFilters.dataInicio !== urlDataInicio ||
        localFilters.dataFim !== urlDataFim

      if (filtersChanged) {
        newParams.set('page', '1')
      } else {
        newParams.set('page', urlPage.toString())
      }

      if (newParams.toString() !== searchParams.toString()) {
        setSearchParams(newParams, { replace: true })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [
    localFilters,
    urlTipo,
    urlStatus,
    urlDataInicio,
    urlDataFim,
    urlPage,
    searchParams,
    setSearchParams,
  ])

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [viewingContract, setViewingContract] = useState<any>(null)

  const cacheRef = useRef<Record<string, any>>({})
  const tableRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(false)
    try {
      const filters: string[] = []
      if (urlTipo !== 'todos') filters.push(`tipo = '${urlTipo}'`)
      if (urlStatus !== 'todos') filters.push(`status = '${urlStatus}'`)
      if (urlDataInicio) filters.push(`created >= '${urlDataInicio} 00:00:00'`)
      if (urlDataFim) filters.push(`created <= '${urlDataFim} 23:59:59'`)

      const filterString = filters.join(' && ')
      const cacheKey = `${urlPage}-${filterString}`

      if (cacheRef.current[cacheKey]) {
        setData(cacheRef.current[cacheKey])
        setLoading(false)
        return
      }

      const result = await pb.collection('contracts').getList(urlPage, 10, {
        filter: filterString,
        sort: '-created',
      })

      cacheRef.current[cacheKey] = result
      setData(result)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [urlTipo, urlStatus, urlDataInicio, urlDataFim, urlPage, user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', newPage.toString())
    setSearchParams(newParams)

    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDownload = (contract: any) => {
    toast.promise(generateContractDocx(contract), {
      loading: 'Gerando documento...',
      success: (res) => {
        if (res?.url) window.open(res.url, '_blank')
        return 'Documento gerado com sucesso!'
      },
      error: 'Erro ao gerar documento',
    })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return
    try {
      await pb.collection('contracts').delete(id)
      toast.success('Contrato excluído')
      cacheRef.current = {}
      fetchData()
    } catch (err) {
      toast.error('Erro ao excluir contrato')
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
  }

  if (authLoading) return null
  if (!user) return <Navigate to="/login" />

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-blue-600" />
          Dashboard de Contratos
        </h1>
        <p className="text-slate-600 mt-2">
          Gerencie, analise e acompanhe o histórico dos seus contratos.
        </p>
      </div>

      <div className="space-y-6" ref={tableRef}>
        <div className="flex flex-wrap items-end gap-4 p-5 bg-slate-50/50 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Tipo de Contrato
            </label>
            <Select
              value={localFilters.tipo}
              onValueChange={(v) => setLocalFilters((p) => ({ ...p, tipo: v }))}
            >
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="a_vista">À Vista</SelectItem>
                <SelectItem value="financiado">Financiamento</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Status
            </label>
            <Select
              value={localFilters.status}
              onValueChange={(v) => setLocalFilters((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="gerado">Gerado</SelectItem>
                <SelectItem value="analisado">Analisado</SelectItem>
                <SelectItem value="assinado">Assinado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              De
            </label>
            <DatePicker
              date={localFilters.dataInicio}
              setDate={(d) => setLocalFilters((p) => ({ ...p, dataInicio: d }))}
              placeholder="Data inicial"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Até
            </label>
            <DatePicker
              date={localFilters.dataFim}
              setDate={(d) => setLocalFilters((p) => ({ ...p, dataFim: d }))}
              placeholder="Data final"
            />
          </div>
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
            onClick={() =>
              setLocalFilters({ tipo: 'todos', status: 'todos', dataInicio: '', dataFim: '' })
            }
          >
            <X className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        {error ? (
          <div className="p-12 text-center bg-white rounded-xl border border-red-200 flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-800 font-medium mb-6">
              Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
            </p>
            <Button
              variant="outline"
              onClick={fetchData}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="py-20 px-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Nenhum contrato encontrado
            </h3>
            <p className="text-slate-500 max-w-md">
              Nenhum contrato encontrado com esses filtros. Tente alterar os critérios de busca.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="py-4 text-slate-600 font-semibold">Tipo</TableHead>
                    <TableHead className="py-4 text-slate-600 font-semibold">Vendedor</TableHead>
                    <TableHead className="py-4 text-slate-600 font-semibold">Comprador</TableHead>
                    <TableHead className="py-4 text-slate-600 font-semibold">Data</TableHead>
                    <TableHead className="py-4 text-slate-600 font-semibold">Status</TableHead>
                    <TableHead className="py-4 text-right text-slate-600 font-semibold">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {data.items.map((contract: any) => (
                    <TableRow key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-800">
                        {contract.tipo === 'a_vista'
                          ? 'À Vista'
                          : contract.tipo === 'financiado'
                            ? 'Financiamento'
                            : contract.tipo || 'Padrão'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contract.nome_vendedor || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {contract.nome_comprador || '-'}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {format(new Date(contract.created), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize px-2.5 py-0.5 rounded-full font-medium tracking-wide',
                            (!contract.status || contract.status === 'rascunho') &&
                              'bg-slate-100 text-slate-700 border-slate-200',
                            contract.status === 'gerado' &&
                              'bg-blue-50 text-blue-700 border-blue-200',
                            contract.status === 'analisado' &&
                              'bg-purple-50 text-purple-700 border-purple-200',
                            contract.status === 'assinado' &&
                              'bg-emerald-50 text-emerald-700 border-emerald-200',
                          )}
                        >
                          {contract.status || 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Visualizar"
                            onClick={() => setViewingContract(contract)}
                            className="hover:bg-slate-100 text-slate-500"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Analisar"
                            asChild
                            className="hover:bg-purple-50 hover:text-purple-600 text-slate-500"
                          >
                            <Link to={`/analysis?contractId=${contract.id}`}>
                              <Bot className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Baixar DOCX"
                            onClick={() => handleDownload(contract)}
                            className="hover:bg-blue-50 hover:text-blue-600 text-slate-500"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Deletar"
                            onClick={() => handleDelete(contract.id)}
                            className="hover:bg-red-50 hover:text-red-600 text-slate-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 gap-4">
              <span className="text-sm font-medium text-slate-500">
                Página <span className="text-slate-800">{data.page}</span> de{' '}
                <span className="text-slate-800">{data.totalPages || 1}</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => handlePageChange(data.page - 1)}
                  className="bg-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => handlePageChange(data.page + 1)}
                  className="bg-white"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!viewingContract} onOpenChange={(open) => !open && setViewingContract(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-600" />
              Resumo do Contrato
            </DialogTitle>
          </DialogHeader>
          {viewingContract && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Tipo</p>
                  <p className="text-sm font-medium text-slate-800 mt-1 capitalize">
                    {viewingContract.tipo === 'a_vista'
                      ? 'À Vista'
                      : viewingContract.tipo === 'financiado'
                        ? 'Financiamento'
                        : viewingContract.tipo || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Status</p>
                  <p className="text-sm font-medium text-slate-800 mt-1 capitalize">
                    {viewingContract.status || 'Rascunho'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Data de Criação</p>
                  <p className="text-sm font-medium text-slate-800 mt-1">
                    {format(new Date(viewingContract.created), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Valor Total</p>
                  <p className="text-sm font-medium text-emerald-600 mt-1">
                    {formatCurrency(viewingContract.valor_total)}
                  </p>
                </div>
                {viewingContract.valor_sinal > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Sinal</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {formatCurrency(viewingContract.valor_sinal)}
                    </p>
                  </div>
                )}
                {viewingContract.valor_financiado > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Financiado</p>
                    <p className="text-sm font-medium text-slate-800 mt-1">
                      {formatCurrency(viewingContract.valor_financiado)}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Vendedor</h4>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Nome:</span>{' '}
                    {viewingContract.nome_vendedor || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">CPF:</span>{' '}
                    {viewingContract.cpf_vendedor || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Email:</span>{' '}
                    {viewingContract.email_vendedor || 'N/A'}
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Comprador</h4>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Nome:</span>{' '}
                    {viewingContract.nome_comprador || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">CPF:</span>{' '}
                    {viewingContract.cpf_comprador || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">Email:</span>{' '}
                    {viewingContract.email_comprador || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
