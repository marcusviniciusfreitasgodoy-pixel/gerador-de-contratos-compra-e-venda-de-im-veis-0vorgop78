import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { contractSchema, type ContractFormValues, parseCurrencySafe } from '@/lib/schemas'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  FileText,
  Beaker,
} from 'lucide-react'
import { saveContractDraft } from '@/services/contracts'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import { PreviewPDFModal } from './PreviewPDFModal'
import { getMinutaPDFBlobUrl, generateMinutaPDF } from '@/lib/pdf-generator'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  getContractTemplates,
  createContractTemplate,
  type ContractTemplate,
} from '@/services/contract_templates'

import { ChecklistDocumental } from './contract/ChecklistDocumental'
import { EnvolvidosTab } from './contract/EnvolvidosTab'
import { ImovelTab } from './contract/ImovelTab'
import { FinanceiroTab } from './contract/FinanceiroTab'
import { JuridicoTab } from './contract/JuridicoTab'
import { RevisaoTab } from './contract/RevisaoTab'

const WIZARD_STEPS_ALL = [
  { id: 'envolvidos', title: 'Envolvidos' },
  { id: 'imovel', title: 'Imóvel' },
  { id: 'financeiro', title: 'Financeiro' },
  { id: 'juridico', title: 'Jurídico' },
  { id: 'checklist', title: 'Checklist' },
  { id: 'revisao', title: 'Revisão' },
]

export function ContractForm({
  tipoDocumento,
  onBack,
  documentName = 'Contrato',
  documentGender = 'o',
}: {
  tipoDocumento: string
  onBack: () => void
  documentName?: string
  documentGender?: string
}) {
  const activeSteps = WIZARD_STEPS_ALL.filter((s) => {
    if (tipoDocumento === 'checklist_documental') {
      return ['envolvidos', 'imovel', 'checklist', 'revisao'].includes(s.id)
    }
    if (tipoDocumento === 'ficha_cadastral') {
      return ['envolvidos', 'imovel', 'revisao'].includes(s.id)
    }
    if (tipoDocumento === 'autorizacao_intermediacao') {
      return s.id !== 'checklist'
    }
    return true
  })

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStepData = activeSteps[currentStepIndex]
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [draftId, setDraftId] = useState<string | undefined>()

  const navigate = useNavigate()
  const { user } = useAuth()

  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [currentMinuta, setCurrentMinuta] = useState<string>('')

  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)
  const [templateName, setTemplateName] = useState('')

  useEffect(() => {
    if (user?.is_admin) {
      getContractTemplates().then(setTemplates).catch(console.error)
    }
  }, [user])

  const handleSaveTemplate = async () => {
    if (!templateName) return toast.error('Nome do template é obrigatório')
    if (!user?.id) return
    try {
      const data = form.getValues()
      const newTemplate = await createContractTemplate({
        name: templateName,
        template_data: data,
        user: user.id,
      })
      setTemplates([newTemplate, ...templates])
      setIsSaveTemplateOpen(false)
      setTemplateName('')
      toast.success('Template salvo com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar template')
    }
  }

  const handleLoadTemplate = (templateData: any) => {
    Object.entries(templateData).forEach(([key, value]) => {
      form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
    })
    toast.success('Template carregado com sucesso!')
  }

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo_comprador: 'pf',
      vendedor_pj: false,
      tipo_documento: tipoDocumento,
      status: 'rascunho',
      financiamento_comprador: false,
      havera_parcelas: false,
      clausula_lgpd: false,
    } as any,
    mode: 'onChange',
  })

  const handleFillTestData = (profile: 'pf' | 'pj') => {
    const d = new Date()
    const today = d.toISOString().split('T')[0]
    d.setDate(d.getDate() + 30)
    const nextMonth = d.toISOString().split('T')[0]

    const baseData = {
      tipo_negociacao: 'financiamento',
      tipo_imovel: 'Apartamento',
      endereco_imovel: 'Rua do Teste, 456',
      numero_imovel: '456',
      complemento_imovel: 'Apto 12',
      cidade_imovel: 'São Paulo',
      bairro_imovel: 'Centro',
      estado_imovel: 'SP',
      cep_imovel: '01000-000',
      matricula_imovel: '123.456',
      cartorio_imovel: '1º CRI',
      inscricao_municipal: '123.456.7890-1',
      area_total: '120',
      area_privativa: '100',
      vagas_garagem: '2',
      quartos: '3',
      suites: '1',

      valor_total: '550.000,00',
      valor_sinal: '50.000,00',
      valor_financiamento: '500.000,00',
      comissao: '33.000,00',
      percentual_comissao: '6',
      financiamento_comprador: true,

      data_assinatura: today,
      data_posse: nextMonth,
      entrega_chaves: nextMonth,

      clausula_lgpd: true,
      tipo_documento: tipoDocumento,
    }

    let profileData = {}
    if (profile === 'pf') {
      profileData = {
        tipo_comprador: 'pf',
        nome_comprador: 'João da Silva Comprador',
        cpf_comprador: '123.456.789-00',
        rg_comprador: '12.345.678-9',
        nacionalidade_comprador: 'Brasileiro',
        estado_civil_comprador: 'Casado',
        regime_bens_comprador: 'Comunhão Parcial',
        nome_conjuge_comprador: 'Maria da Silva Compradora',
        cpf_conjuge_comprador: '111.222.333-44',
        profissao_comprador: 'Engenheiro de Software',
        endereco_comprador: 'Rua das Flores, 123',
        cep_comprador: '03000-000',
        email_comprador: 'joao.comprador@teste.com',
        telefone_comprador: '(11) 98765-4321',

        vendedor_pj: false,
        nome_vendedor: 'Maria Oliveira Vendedora',
        cpf_vendedor: '987.654.321-11',
        rg_vendedor: '98.765.432-1',
        nacionalidade_vendedor: 'Brasileira',
        estado_civil_vendedor: 'Casada',
        regime_bens_vendedor: 'Comunhão Parcial',
        conjuge_vendedor: 'José Oliveira Vendedor',
        cpf_conjuge_vendedor: '444.555.666-77',
        profissao_vendedor: 'Médica',
        endereco_vendedor: 'Avenida Paulista, 1000',
        cep_vendedor: '04000-000',
        email_vendedor: 'maria.vendedora@teste.com',
        telefone_vendedor: '(11) 91234-5678',
      }
    } else {
      profileData = {
        tipo_comprador: 'pj',
        nome_comprador: 'Empresa Compradora LTDA',
        cnpj_comprador: '12.345.678/0001-90',
        representante_comprador: 'Carlos Diretor',
        email_comprador: 'contato@empresacompradora.com.br',
        telefone_comprador: '(11) 99999-9999',
        endereco_comprador: 'Rua Fictícia, 100',
        cep_comprador: '01000-000',

        vendedor_pj: true,
        nome_vendedor: 'Construtora Vendedora S.A.',
        cnpj_vendedor: '98.765.432/0001-10',
        representante_vendedor: 'Ana Gerente',
        email_vendedor: 'vendas@construtora.com.br',
        telefone_vendedor: '(11) 98888-8888',
        endereco_vendedor: 'Av. Construtora, 500',
        cep_vendedor: '02000-000',
      }
    }

    const testData = { ...baseData, ...profileData }

    Object.entries(testData).forEach(([key, value]) => {
      form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
    })

    toast.success(`Dados de teste (${profile.toUpperCase()}) preenchidos!`)
  }

  const handleNext = async () => {
    let isValid = true
    const stepId = currentStepData.id

    if (stepId === 'envolvidos') {
      const baseEnvolvidos = [
        'vendedor_pj',
        'nome_vendedor',
        'cpf_vendedor',
        'cnpj_vendedor',
        'representante_vendedor',
        'email_vendedor',
        'telefone_vendedor',
        'estado_civil_vendedor',
        'regime_bens_vendedor',
        'conjuge_vendedor',
        'cpf_conjuge_vendedor',
        'rg_conjuge_vendedor',
        'cep_vendedor',
        'endereco_vendedor',
      ]

      if (tipoDocumento === 'autorizacao_intermediacao') {
        isValid = await form.trigger(baseEnvolvidos as any)
      } else {
        isValid = await form.trigger([
          ...baseEnvolvidos,
          'tipo_comprador',
          'nome_comprador',
          'cpf_comprador',
          'cnpj_comprador',
          'representante_comprador',
          'email_comprador',
          'telefone_comprador',
          'estado_civil_comprador',
          'regime_bens_comprador',
          'nome_conjuge_comprador',
          'cpf_conjuge_comprador',
          'rg_conjuge_comprador',
          'cep_comprador',
          'endereco_comprador',
        ] as any)
      }
    } else if (stepId === 'imovel') {
      isValid = await form.trigger([
        'matricula_imovel',
        'endereco_imovel',
        'cep_imovel',
        'numero_imovel',
        'bairro_imovel',
        'cidade_imovel',
        'estado_imovel',
      ])
    } else if (stepId === 'financeiro') {
      if (tipoDocumento === 'autorizacao_intermediacao') {
        isValid = await form.trigger(['valor_total', 'valor_avaliacao'] as any)
      } else {
        isValid = await form.trigger(['valor_total', 'valor_sinal', 'valor_financiamento'])
        const fin = parseCurrencySafe(form.getValues('valor_financiamento'))
        if (form.getValues('financiamento_comprador') && fin <= 0) {
          toast.error('Valor do financiamento é obrigatório.')
          isValid = false
        }
      }
    } else if (stepId === 'checklist') {
      isValid = true
    } else if (stepId === 'juridico') {
      if (tipoDocumento === 'autorizacao_intermediacao') {
        isValid = await form.trigger(['clausula_lgpd', 'gestao_exclusiva'])
      } else {
        isValid = await form.trigger(['clausula_lgpd'])
      }
      if (!form.getValues('clausula_lgpd')) {
        toast.error('O consentimento da LGPD é obrigatório.')
        isValid = false
      }
    }

    if (!isValid) {
      toast.error('Existem campos obrigatórios inválidos ou vazios.')
      return
    }

    try {
      const record = await saveContractDraft(form.getValues(), draftId)
      setDraftId(record.id)
    } catch (err) {
      console.error('Failed to autosave draft:', err)
    }
    setCurrentStepIndex((s) => s + 1)
  }

  const getPayload = () => {
    const values = form.getValues()
    return {
      ...values,
      json_mestre: {
        comprador: { nome: values.nome_comprador, cpf: values.cpf_comprador },
        negociacao: { valor_total: parseCurrencySafe(values.valor_total) },
      },
    }
  }

  const generateChecklistPlainText = (data: any) => {
    const CATEGORIES = [
      {
        title: 'Vendedor',
        items: [
          'Documento de Identidade (RG/CNH)',
          'CPF',
          'Comprovante de Residência Atualizado',
          'Certidão de Estado Civil (Nascimento atualizada ou Casamento)',
          'Documento de Identidade do Cônjuge/Companheiro(a)',
          'CPF do Cônjuge/Companheiro(a)',
          'Pacto Antenupcial (se houver)',
          'Certidões de Protesto de Títulos (domicílio e local do imóvel)',
          'Certidão de Distribuição Cível e Criminal Estadual',
          'Certidão Conjunta de Débitos Relativos a Tributos Federais e à Dívida Ativa da União (RFB)',
          'Certidão do 2º Ofício de Distribuidor',
          'Certidão de Interdições e Tutelas',
          'Certidão da Justiça Federal',
          'Certidão da Justiça do Trabalho',
        ],
      },
      {
        title: 'Comprador',
        items: [
          'Documento de Identidade (RG/CNH)',
          'CPF',
          'Comprovante de Residência Atualizado',
          'Comprovante de Estado Civil (Casado)',
          'Documento de Identidade do Cônjuge/Companheiro(a)',
          'CPF do Cônjuge/Companheiro(a)',
          'Certidão de Casamento/União Estável',
        ],
      },
      {
        title: 'Imóvel',
        items: [
          'Matrícula Atualizada (com ônus e ações)',
          'Capa do carnê de IPTU',
          'Certidão de Quitação Fiscal e Enfitêutica',
          'Declaração de Quitação Condominial (assinada pelo síndico)',
          'Cópia da Ata de Eleição do Síndico',
          'Certidão do Funesbom (Corpo de Bombeiros)',
          'Laudo de Vistoria com fotos',
          'Comprovantes de quitação de contas de consumo (Luz, Água, Gás)',
          'Termo de declaração de desocupação pelo vendedor',
        ],
      },
      {
        title: 'Dados Bancários',
        items: [
          'Dados do Banco (Nome/Código)',
          'Agência e Conta (com dígito)',
          'Titularidade e CPF/CNPJ vinculado',
          'Chave PIX vinculada (se aplicável)',
        ],
      },
    ]
    let text = '\n\nCHECKLIST DE DUE DILIGENCE\n\n'
    CATEGORIES.forEach((cat) => {
      text += `${cat.title.toUpperCase()}\n`
      cat.items.forEach((item) => {
        const key = `${cat.title} - ${item}`
        const isChecked = data.compliance_checklist && data.compliance_checklist[key] === true
        const prefix = isChecked ? '✓ COLETADO' : '⚠️ PENDENTE'
        text += `${prefix} - ${item}\n`
      })
      text += '\n'
    })
    return text
  }

  const handlePreview = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Existem campos obrigatórios inválidos ou vazios antes de visualizar.')
      return
    }
    setIsPreviewing(true)
    setPreviewModalOpen(true)
    try {
      let text = ''

      if (tipoDocumento === 'checklist_documental') {
        const { generateChecklistHTML } = await import('@/lib/checklist-generator')
        text = generateChecklistHTML(form.getValues())
      } else {
        const res = await pb.send('/backend/v1/assemble-contract', {
          method: 'POST',
          body: JSON.stringify(getPayload()),
        })
        text = (res?.minuta_texto || '').replace(/Assessoria Jurídica Imobiliária/gi, '')

        if (tipoDocumento !== 'autorizacao_intermediacao' && tipoDocumento !== 'ficha_cadastral') {
          text += generateChecklistPlainText(form.getValues())
        }
      }

      setCurrentMinuta(text)

      const record = await saveContractDraft(
        { ...form.getValues(), status: 'rascunho' },
        draftId,
        text,
      )
      setDraftId(record.id)

      const url = await getMinutaPDFBlobUrl(text, { ...user, tipoDocumento: tipoDocumento })
      if (url) setPreviewPdfUrl(url)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsPreviewing(false)
    }
  }

  const initiateGeneration = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error('Existem campos obrigatórios inválidos ou vazios antes de gerar.')
      return
    }
    if (
      !['ficha_cadastral', 'checklist_documental'].includes(tipoDocumento) &&
      !form.getValues('clausula_lgpd')
    ) {
      return toast.error('Aceite a LGPD.')
    }
    setIsGenerating(true)
    try {
      let text = ''

      if (tipoDocumento === 'checklist_documental') {
        const { generateChecklistHTML } = await import('@/lib/checklist-generator')
        text = generateChecklistHTML(form.getValues())
      } else {
        const res = await pb.send('/backend/v1/assemble-contract', {
          method: 'POST',
          body: JSON.stringify(getPayload()),
        })
        text = (res?.minuta_texto || '').replace(/Assessoria Jurídica Imobiliária/gi, '')

        if (tipoDocumento !== 'autorizacao_intermediacao' && tipoDocumento !== 'ficha_cadastral') {
          text += generateChecklistPlainText(form.getValues())
        }
      }

      await saveContractDraft({ ...form.getValues(), status: 'finalizado' }, draftId, text)
      setIsSuccess(true)
    } catch (err) {
      toast.error('Erro', { description: getErrorMessage(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    const gerado =
      documentGender === 'as' ? 'Geradas' : documentGender === 'a' ? 'Gerada' : 'Gerado'
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border p-8 animate-in fade-in">
        <CheckCircle2 size={40} className="mx-auto text-[#D4AF37] mb-4" />
        <h2 className="text-3xl font-bold text-[#0C2340]">
          {documentName} {gerado}!
        </h2>
        <div className="flex justify-center gap-3 mt-8">
          <Button variant="outline" onClick={onBack}>
            Novo Documento
          </Button>
          <Button
            onClick={() => navigate('/contratos')}
            className="bg-[#0C2340] text-[#D4AF37] hover:bg-[#0C2340]/90"
          >
            Meus Documentos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 sm:pb-0 relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
          <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-[#0C2340]">Gerando minuta...</h2>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="-ml-4 text-[#0C2340] hover:text-[#0C2340]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div className="flex flex-wrap gap-2 items-center">
          {user?.is_admin && (
            <>
              {templates.length > 0 && (
                <Select
                  onValueChange={(val) => {
                    const t = templates.find((x) => x.id === val)
                    if (t) handleLoadTemplate(t.template_data)
                  }}
                >
                  <SelectTrigger className="w-auto min-w-[180px] h-9 border-[#0C2340]/20">
                    <SelectValue placeholder="Carregar Template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="outline"
                onClick={() => setIsSaveTemplateOpen(true)}
                className="text-[#0C2340] border-[#0C2340]/20 h-9"
                type="button"
              >
                Salvar Template
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37]/10 h-9"
                type="button"
              >
                <Beaker className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Preencher Teste</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleFillTestData('pf')} className="cursor-pointer">
                Pessoa Física (PF)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFillTestData('pj')} className="cursor-pointer">
                Pessoa Jurídica (PJ)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex justify-between mb-8 px-2 sm:px-12 relative w-full">
        <div className="absolute top-4 sm:top-5 left-4 right-4 sm:left-16 sm:right-16 h-[2px] bg-slate-200 -z-10" />
        {activeSteps.map((s, idx) => (
          <div
            key={s.id}
            className={cn(
              'flex flex-col items-center z-10',
              idx <= currentStepIndex ? 'text-[#0C2340]' : 'text-slate-400',
            )}
          >
            <div
              className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 border-2 text-xs sm:text-sm',
                idx === currentStepIndex
                  ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-md ring-4 ring-[#D4AF37]/20'
                  : idx < currentStepIndex
                    ? 'bg-[#0C2340] text-[#D4AF37] border-[#0C2340]'
                    : 'bg-white border-slate-200',
              )}
            >
              {idx < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                idx + 1
              )}
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-bold text-center w-16 hidden sm:block',
                idx === currentStepIndex && 'text-[#D4AF37]',
              )}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-4 sm:p-8">
          <Form {...form}>
            <form className="space-y-6">
              {currentStepData.id === 'envolvidos' && <EnvolvidosTab />}
              {currentStepData.id === 'imovel' && <ImovelTab />}
              {currentStepData.id === 'financeiro' && (
                <FinanceiroTab tipoDocumento={tipoDocumento} />
              )}
              {currentStepData.id === 'juridico' && <JuridicoTab tipoDocumento={tipoDocumento} />}
              {currentStepData.id === 'checklist' && <ChecklistDocumental />}
              {currentStepData.id === 'revisao' && <RevisaoTab />}
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t sm:relative sm:border-t-0 sm:p-0 sm:bg-transparent z-40 sm:z-auto flex justify-between gap-4 mt-0 sm:mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:shadow-none">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStepIndex((s) => s - 1)}
          disabled={currentStepIndex === 0 || isGenerating}
          className={cn(
            'min-h-[48px] text-[#0C2340] border-[#0C2340]/20 w-1/3 sm:w-auto',
            currentStepIndex === 0 && 'invisible',
          )}
        >
          <ChevronLeft className="mr-1 sm:mr-2 w-4 h-4" />{' '}
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {currentStepIndex < activeSteps.length - 1 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isGenerating}
            className="bg-[#0C2340] hover:bg-[#0C2340]/90 text-[#D4AF37] font-semibold min-h-[48px] w-2/3 sm:w-auto px-8"
          >
            Próximo <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <div className="flex gap-2 w-2/3 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={isGenerating || isPreviewing}
              className="border-[#0C2340] text-[#0C2340] min-h-[48px] flex-1"
            >
              {isPreviewing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Gerar Ficha&nbsp;&nbsp;</span>
            </Button>
            <Button
              type="button"
              onClick={initiateGeneration}
              disabled={isGenerating || isPreviewing}
              className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#0C2340] font-bold min-h-[48px] flex-[2]"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Gerar {documentName}</span>
              <span className="inline sm:hidden">Gerar</span>
            </Button>
          </div>
        )}
      </div>

      <PreviewPDFModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        pdfUrl={previewPdfUrl}
        content={currentMinuta}
        loading={isPreviewing}
        onDownload={async () => {
          if (!currentMinuta) return
          const safeName = documentName.replace(/\s+/g, '_')
          await generateMinutaPDF(currentMinuta, `${safeName}_Previa`, {
            ...user,
            tipo_documento: tipoDocumento,
          })
        }}
      />

      <Dialog open={isSaveTemplateOpen} onOpenChange={setIsSaveTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar como Template</DialogTitle>
            <DialogDescription>
              Dê um nome para este template para utilizá-lo facilmente no futuro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Contrato Comercial Padrão"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveTemplateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTemplate}
              className="bg-[#0C2340] text-white hover:bg-[#0C2340]/90"
            >
              Salvar Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
