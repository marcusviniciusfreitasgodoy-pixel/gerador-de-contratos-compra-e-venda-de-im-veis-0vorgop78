import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Save, ArrowLeft, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'
import {
  getContract,
  regenerateContract,
  updateContractData,
  generateContractDocx,
} from '@/services/contracts'
import { RichTextEditor } from '@/components/RichTextEditor'

export default function ContractView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [contract, setContract] = useState<any>(null)
  const [minuta, setMinuta] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (id) {
      loadContract()
    }
  }, [id])

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await getContract(id!)
      setContract(data)
      setMinuta(data.minuta_texto || '')
    } catch (error) {
      toast.error('Erro ao carregar contrato')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateContractData(id!, { minuta_texto: minuta })
      toast.success('Contrato atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar as alterações')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    try {
      setGenerating(true)

      const payloadForAi = {
        ...contract,
        json_mestre: {
          comprador: {
            nome: contract.nome_comprador,
            cpf: contract.cpf_comprador,
            estado_civil: contract.estado_civil_comprador,
            regime_bens: contract.regime_bens_comprador,
            financeiro: {
              financiamento: contract.financiamento_comprador,
              fgts: contract.fgts_comprador,
            },
          },
          imovel: {
            situacao_juridica: {
              locado: contract.imovel_locado,
              inventario: contract.imovel_inventario,
            },
          },
          negociacao: {
            valor_total: contract.valor_total,
            posse: {
              imediata: contract.posse_imediata,
              data: contract.data_posse,
            },
          },
        },
      }

      const res = await regenerateContract(id!, payloadForAi)

      const newMinuta = res?.minuta_texto || ''
      setMinuta(newMinuta)
      await updateContractData(id!, {
        minuta_texto: newMinuta,
        used_clauses: res?.used_clauses,
        status: 'concluido',
      })

      toast.success('Contrato atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar novamente. O texto anterior foi mantido.')
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const res = await generateContractDocx({
        minuta_html: minuta,
        contract_id: contract.id,
      })

      toast.success('Download preparado (Mock)')
    } catch (error) {
      toast.error('Erro ao gerar DOCX')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Contrato não encontrado.</p>
        <Button onClick={() => navigate('/contratos')} variant="outline" className="mt-4">
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contratos')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 capitalize">
              {contract.tipo_documento ? contract.tipo_documento.replace(/_/g, ' ') : 'Contrato'}
            </h1>
            <p className="text-slate-500">
              Comprador: {contract.nome_comprador || 'Não informado'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleRegenerate}
            variant="outline"
            disabled={generating || saving}
            className="text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Gerar Novamente
          </Button>
          <Button onClick={handleSave} disabled={generating || saving} className="shadow-sm">
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {generating && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center gap-3 shadow-sm border border-blue-100 animate-in slide-in-from-top-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-medium text-lg">
            Gerando minuta... Isso pode levar alguns segundos
          </span>
        </div>
      )}

      <Card className="shadow-md border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between pb-4 pt-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-primary" />
              Editor de Minuta
            </CardTitle>
            <CardDescription className="mt-1">
              Faça ajustes finos no contrato gerado pela IA antes de exportar. Suas alterações não
              serão perdidas a não ser que você gere novamente.
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar DOCX
          </Button>
        </CardHeader>
        <CardContent className="p-0 bg-slate-100/50">
          <RichTextEditor value={minuta} onChange={setMinuta} />
        </CardContent>
      </Card>
    </div>
  )
}
