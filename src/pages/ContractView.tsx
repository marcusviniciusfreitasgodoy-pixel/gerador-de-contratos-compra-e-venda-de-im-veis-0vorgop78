import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  RefreshCw,
  Save,
  ArrowLeft,
  FileText,
  Download,
  FileDown,
  Wand2,
  AlertCircle,
  Mail,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  getContract,
  regenerateContract,
  updateContractData,
  generateContractDocx,
} from '@/services/contracts'
import { RichTextEditor } from '@/components/RichTextEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { generateMinutaPDF } from '@/lib/pdf-generator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'

export default function ContractView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [contract, setContract] = useState<any>(null)
  const [minuta, setMinuta] = useState('')
  const [status, setStatus] = useState('rascunho')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailData, setEmailData] = useState({ destinatario: '', assunto: '', mensagem: '' })

  const [hasKeys, setHasKeys] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    const checkKeys = async () => {
      if (user?.id) {
        try {
          const u = await pb.collection('users').getOne(user.id)
          setHasKeys(!!(u.gemini_api_key || u.openai_api_key || u.anthropic_api_key))
        } catch (err) {
          console.error('Failed to check API keys', err)
        }
      }
    }
    checkKeys()
  }, [user?.id])

  useEffect(() => {
    if (id) {
      loadContract()
    }
  }, [id])

  useRealtime<any>('contracts', (e) => {
    if (e.action === 'update' && e.record.id === id) {
      const newText = e.record.minuta_texto || ''

      if (newText.includes('Erro no provedor') || newText.includes('Minuta não gerada')) {
        setApiError(true)
        setMinuta('')
        setGenerating(false)
        return
      }

      if (newText && newText !== minuta) {
        let text = newText
        if (e.record.tipo_documento === 'autorizacao_intermediacao') {
          text = text.replace(/<p[^>]*>\s*Assessoria Jurídica Imobiliária\s*<\/p>/gi, '')
          text = text.replace(/<p[^>]*>\s*MINUTA DE CONTRATO\s*<\/p>/gi, '')
          text = text.replace(/Assessoria Jurídica Imobiliária/gi, '')
          text = text.replace(/MINUTA DE CONTRATO/gi, '')
        }
        setMinuta(text)
        setContract(e.record)
        setApiError(false)
        setGenerating(false)

        let st = e.record.status || 'rascunho'
        if (st === 'em_elaboracao') st = 'rascunho'
        if (st === 'concluido') st = 'finalizado'
        setStatus(st)
      }
    }
  })

  const loadContract = async () => {
    try {
      setLoading(true)
      const data = await getContract(id!)
      setContract(data)

      let text = data.minuta_texto || ''
      if (text.includes('Erro no provedor') || text.includes('Minuta não gerada')) {
        setApiError(true)
        text = ''
      } else {
        setApiError(false)
        if (data.tipo_documento === 'autorizacao_intermediacao') {
          text = text.replace(/<p[^>]*>\s*Assessoria Jurídica Imobiliária\s*<\/p>/gi, '')
          text = text.replace(/<p[^>]*>\s*MINUTA DE CONTRATO\s*<\/p>/gi, '')
          text = text.replace(/Assessoria Jurídica Imobiliária/gi, '')
          text = text.replace(/MINUTA DE CONTRATO/gi, '')
        }
      }
      setMinuta(text)

      let st = data.status || 'rascunho'
      if (st === 'em_elaboracao') st = 'rascunho'
      if (st === 'concluido') st = 'finalizado'
      setStatus(st)
    } catch (error) {
      toast.error('Erro ao carregar contrato')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateContractData(id!, { minuta_texto: minuta, status })
      toast.success('Contrato atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar as alterações')
    } finally {
      setSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!hasKeys) {
      toast.error('Configure suas chaves de API no seu perfil antes de gerar.')
      return
    }

    try {
      setGenerating(true)
      setApiError(false)

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
      let newMinuta = res?.minuta_texto || ''

      if (newMinuta) {
        if (newMinuta.includes('Erro no provedor') || newMinuta.includes('Minuta não gerada')) {
          setApiError(true)
          setMinuta('')
          toast.error('Falha na geração com a IA.')
        } else {
          if (contract.tipo_documento === 'autorizacao_intermediacao') {
            newMinuta = newMinuta.replace(
              /<p[^>]*>\s*Assessoria Jurídica Imobiliária\s*<\/p>/gi,
              '',
            )
            newMinuta = newMinuta.replace(/<p[^>]*>\s*MINUTA DE CONTRATO\s*<\/p>/gi, '')
            newMinuta = newMinuta.replace(/Assessoria Jurídica Imobiliária/gi, '')
            newMinuta = newMinuta.replace(/MINUTA DE CONTRATO/gi, '')
          }
          setMinuta(newMinuta)
          setStatus('finalizado')
          await updateContractData(id!, {
            minuta_texto: newMinuta,
            used_clauses: res?.used_clauses,
            status: 'finalizado',
          })
          toast.success('Contrato gerado novamente com sucesso!')
        }
        setGenerating(false)
      } else if (res?.id) {
        // A geração pode estar ocorrendo em background
        // Deixamos generating = true até que o hook realtime atualize a página
      } else {
        setGenerating(false)
      }
    } catch (error) {
      setApiError(true)
      setGenerating(false)
      setMinuta('')
      toast.error('Erro na requisição para o provedor de IA.')
    }
  }

  const replaceBrandingPlaceholders = (text?: string) => {
    if (!text || !user) return ''
    return text
      .replace(/{{imobiliaria_nome}}/g, user.imobiliaria_nome || '')
      .replace(/{{creci}}/g, user.creci || '')
      .replace(/{{imobiliaria_documento}}/g, user.imobiliaria_documento || '')
  }

  const handleExportWord = async () => {
    try {
      setDownloading(true)
      toast.info('Gerando arquivo Word...')

      const headerContent = replaceBrandingPlaceholders(user?.header_content)
      const footerContent = replaceBrandingPlaceholders(user?.footer_content)

      const res = await generateContractDocx({
        minuta_html: minuta,
        minuta_texto: minuta,
        contract_id: contract.id,
        header_content: headerContent,
        footer_content: footerContent,
        user_details: user,
        tipo_documento: contract.tipo_documento,
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
      toast.error('Erro ao gerar DOCX')
    } finally {
      setDownloading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!minuta) {
      toast.error('Não há texto para exportar.')
      return
    }
    try {
      const headerContent = replaceBrandingPlaceholders(user?.header_content)
      const footerContent = replaceBrandingPlaceholders(user?.footer_content)

      await generateMinutaPDF(minuta, `Contrato_${contract.id}`, {
        ...user,
        header_content: headerContent,
        footer_content: footerContent,
        tipo_documento: contract.tipo_documento,
      })
      toast.success('PDF gerado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar PDF.')
    }
  }

  const handleOpenEmailModal = () => {
    let destinatario = contract.email_comprador || contract.email_vendedor || ''
    let assunto = `${user?.imobiliaria_nome || 'Imobiliária'} - Documento: ${contract.tipo_documento ? contract.tipo_documento.replace(/_/g, ' ') : 'Contrato'}`

    setEmailData({
      destinatario,
      assunto,
      mensagem: `Olá,\n\nSegue em anexo o documento referente à negociação.\n\nAtenciosamente,\n${user?.imobiliaria_nome || user?.name || 'Equipe'}`,
    })
    setEmailModalOpen(true)
  }

  const handleSendEmail = async () => {
    if (!emailData.destinatario || !emailData.assunto) {
      toast.error('Destinatário e assunto são obrigatórios.')
      return
    }
    setSendingEmail(true)
    try {
      await pb.send('/backend/v1/enviar_documento_email', {
        method: 'POST',
        body: JSON.stringify({
          ...emailData,
          contract_id: contract.id,
        }),
      })
      toast.success('E-mail enviado com sucesso!')
      setEmailModalOpen(false)
    } catch (err) {
      toast.error('Erro ao enviar e-mail.')
    } finally {
      setSendingEmail(false)
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
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] bg-white h-10 shadow-sm border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rascunho">Em rascunho</SelectItem>
              <SelectItem value="finalizado">Finalizado</SelectItem>
              <SelectItem value="assinado">Assinado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRegenerate}
            variant="outline"
            disabled={generating || saving || !hasKeys}
            className="text-amber-600 border-amber-200 hover:bg-amber-50 shadow-sm"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            Gerar Novamente
          </Button>
          <Button
            onClick={handleSave}
            disabled={generating || saving}
            className="shadow-sm bg-primary hover:bg-primary/90 text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {!hasKeys && !apiError && (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração necessária</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>
              Você precisa configurar ao menos uma chave de API de Inteligência Artificial (OpenAI,
              Gemini ou Anthropic) no seu Perfil para gerar minutas.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
            >
              Configurar Chaves
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {apiError && (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na Geração</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <span>
              Não foi possível gerar a minuta. Verifique se suas chaves de API estão configuradas
              corretamente no seu Perfil.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
              className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
            >
              Configurar Chaves
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-md border-slate-200 overflow-hidden relative">
        {generating && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-slate-800">
              Processando inteligência artificial e gerando minuta...
            </p>
            <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns segundos.</p>
          </div>
        )}

        <CardHeader className="bg-slate-50 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 pt-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-primary" />
              Editor de Minuta
            </CardTitle>
            <CardDescription className="mt-1">
              Faça ajustes finos no contrato antes de exportar. Lembre-se de salvar suas alterações.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEmailModal}
              disabled={downloading || !minuta}
              className="bg-white text-slate-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar E-mail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={downloading || !minuta}
              className="bg-white"
            >
              <FileDown className="w-4 h-4 mr-2 text-red-600" />
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportWord}
              disabled={downloading || !minuta}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2 text-blue-600" />
              )}
              Word
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-slate-100/50">
          {!minuta && !generating ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white min-h-[500px]">
              <Wand2 className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma minuta gerada</h3>
              <p className="text-slate-500 mb-6 max-w-md">
                Este contrato ainda não possui um texto de minuta. Clique no botão abaixo para gerar
                a primeira versão usando Inteligência Artificial.
              </p>
              <Button onClick={handleRegenerate} disabled={!hasKeys || generating}>
                <Wand2 className="w-4 h-4 mr-2" />
                Gerar Minuta
              </Button>
            </div>
          ) : (
            <RichTextEditor value={minuta} onChange={setMinuta} />
          )}
        </CardContent>
      </Card>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Documento por E-mail</DialogTitle>
            <DialogDescription>
              O documento gerado será anexado em formato PDF ao e-mail.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destinatario">Destinatário</Label>
              <Input
                id="destinatario"
                value={emailData.destinatario}
                onChange={(e) => setEmailData({ ...emailData, destinatario: e.target.value })}
                placeholder="email@cliente.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assunto">Assunto</Label>
              <Input
                id="assunto"
                value={emailData.assunto}
                onChange={(e) => setEmailData({ ...emailData, assunto: e.target.value })}
                placeholder="Assunto do e-mail"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem</Label>
              <Textarea
                id="mensagem"
                value={emailData.mensagem}
                onChange={(e) => setEmailData({ ...emailData, mensagem: e.target.value })}
                placeholder="Escreva sua mensagem aqui..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail}>
              {sendingEmail ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
