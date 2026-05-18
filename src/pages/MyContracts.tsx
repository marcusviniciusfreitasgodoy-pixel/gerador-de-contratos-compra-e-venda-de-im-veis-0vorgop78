import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Plus,
  FileText,
  Calendar,
  Edit,
  MoreVertical,
  Download,
  Trash2,
  FileDown,
} from 'lucide-react'
import { getMyContracts, deleteContract, generateContractDocx } from '@/services/contracts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { generateMinutaPDF } from '@/lib/pdf-generator'
import { toast } from 'sonner'

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este contrato?')) return
    try {
      await deleteContract(id)
      setContracts((prev) => prev.filter((c) => c.id !== id))
      toast.success('Contrato excluído com sucesso.')
    } catch (error) {
      toast.error('Erro ao excluir contrato.')
    }
  }

  const handleExportPDF = async (contract: any) => {
    if (!contract.minuta_texto) {
      toast.error('O contrato não possui texto para exportar.')
      return
    }
    try {
      await generateMinutaPDF(contract.minuta_texto, `Contrato_${contract.id}`)
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar PDF.')
    }
  }

  const handleExportWord = async (contract: any) => {
    try {
      toast.info('Gerando arquivo Word...')
      const res = await generateContractDocx({
        minuta_html: contract.minuta_texto || '',
        contract_id: contract.id,
      })

      if (res?.url) {
        window.open(res.url, '_blank')
      } else if (res?.download_url) {
        window.open(res.download_url, '_blank')
      } else if (res?.base64) {
        const link = document.createElement('a')
        link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.base64}`
        link.download = `Contrato_${contract.id}.docx`
        link.click()
      } else {
        toast.success('Documento preparado para download.')
      }
    } catch (error) {
      toast.error('Erro ao exportar Word')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
      case 'em_elaboracao':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
            Em rascunho
          </Badge>
        )
      case 'finalizado':
      case 'concluido':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Finalizado</Badge>
      case 'assinado':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Assinado</Badge>
      default:
        return (
          <Badge variant="outline" className="capitalize">
            {status || 'Sem status'}
          </Badge>
        )
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
                  <div className="p-3 bg-primary/10 rounded-xl hidden sm:block">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-lg text-slate-800 capitalize">
                        {contract.tipo_documento
                          ? contract.tipo_documento.replace(/_/g, ' ')
                          : 'Contrato Sem Tipo'}
                      </h3>
                      {getStatusBadge(contract.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
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
                <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/contratos/${contract.id}`)}
                    className="gap-2 flex-1 sm:flex-none"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar / Visualizar</span>
                    <span className="sm:hidden">Editar</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0 bg-white">
                        <MoreVertical className="w-5 h-5 text-slate-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() => handleExportPDF(contract)}
                        className="cursor-pointer"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Baixar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportWord(contract)}
                        className="cursor-pointer"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar Word
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(contract.id)}
                        className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
