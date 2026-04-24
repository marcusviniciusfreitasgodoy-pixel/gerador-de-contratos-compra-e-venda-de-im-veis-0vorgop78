import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import { PersonBlock, PropertyBlock, FinancialBlock, FinancingBlock } from './ContractBlocks'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Wand2,
  FileText,
  Edit3,
  AlertCircle,
  Bot,
} from 'lucide-react'
import { createContract, generateContractDocx } from '@/services/contracts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AnalysisReportView, type AnalysisReport } from './AnalysisReportView'
import pb from '@/lib/pocketbase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { addDays } from 'date-fns'
import { toast } from 'sonner'
import { generateDraftText } from '@/lib/draft-template'
import { useAuth } from '@/hooks/use-auth'
import { useEffect } from 'react'
import { parseCurrency, formatCurrency } from '@/lib/formatters'
import { FormInput } from './FormInput'

function SellerBankBlock() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Dados Bancários do Vendedor</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormInput name="vendedor_banco" label="Banco" placeholder="Ex: Itaú" />
        <FormInput name="vendedor_agencia" label="Agência" placeholder="Ex: 0001" />
        <FormInput name="vendedor_conta" label="Conta" placeholder="Ex: 12345-6" />
        <FormInput name="vendedor_pix" label="Chave Pix" placeholder="CPF/Email/Celular" />
      </div>
    </div>
  )
}

export function ContractForm({
  type,
  onBack,
}: {
  type: 'a_vista' | 'financiado'
  onBack: () => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
  const { user } = useAuth()

  const handleAnalyzeAI = async () => {
    setIsAnalyzing(true)
    try {
      const res = await pb.send('/backend/v1/ai/analyze-contract', {
        method: 'POST',
        body: JSON.stringify({ text: draftText }),
      })
      setAnalysisReport(res.analysis)
      setShowAnalysisModal(true)
    } catch (err: any) {
      toast.error('Erro ao analisar contrato.', {
        description: err.message || 'Verifique se a chave OPENAI_API_KEY está configurada.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo: type,
      status: 'gerado',
    } as any,
    mode: 'onChange',
  })

  const valorTotalStr = form.watch('valor_total')

  useEffect(() => {
    if (!user?.comissao_padrao_percentual) return
    const total = parseCurrency(valorTotalStr)
    if (total && total > 0) {
      const comissaoCalc = total * (user.comissao_padrao_percentual / 100)
      const formatted = formatCurrency((comissaoCalc * 100).toFixed(0))
      form.setValue('comissao', formatted, { shouldValidate: true })
    }
  }, [valorTotalStr, user?.comissao_padrao_percentual, form])

  const onSubmit = (data: ContractFormValues) => {
    setDraftText(generateDraftText(data, user))
    setIsPreviewMode(true)
  }

  const handleGenerateFinal = async () => {
    setIsGenerating(true)
    try {
      const data = form.getValues()
      const savedContract = await createContract(data, draftText)

      try {
        const docxResponse = await generateContractDocx({
          ...savedContract,
          user_details: user,
        })

        if (docxResponse.html && docxResponse.filename) {
          const blob = new Blob([docxResponse.html], { type: 'application/msword' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = docxResponse.filename
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        } else if (docxResponse.base64 && docxResponse.filename) {
          const byteCharacters = atob(docxResponse.base64)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          })

          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = docxResponse.filename
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        }

        toast.success('Contrato gerado com sucesso!')
        setIsSuccess(true)
      } catch (err: any) {
        toast.error('Erro ao gerar contrato. Tente novamente.', {
          action: {
            label: 'Tentar Novamente',
            onClick: handleGenerateFinal,
          },
        })
      }
    } catch (error) {
      toast.error('Erro ao salvar contrato no sistema. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFillDummyData = () => {
    const commonData = {
      nome_vendedor: 'Marcos da Silva Sauro',
      cpf_vendedor: '123.456.789-00',
      rg_vendedor: 'MG-12.345.678',
      orgao_emissor_vendedor: 'SSP/MG',
      nacionalidade_vendedor: 'Brasileiro',
      estado_civil_vendedor: 'Casado',
      profissao_vendedor: 'Engenheiro',
      endereco_vendedor: 'Rua das Flores, 123, Bairro Jardim, Belo Horizonte/MG',
      email_vendedor: 'vendedor.teste@exemplo.com',
      telefone_vendedor: '(31) 98888-7777',

      nome_comprador: 'Ana Beatriz de Souza',
      cpf_comprador: '987.654.321-11',
      rg_comprador: '12.345.678-9',
      orgao_emissor_comprador: 'DETRAN/RJ',
      nacionalidade_comprador: 'Brasileira',
      estado_civil_comprador: 'Solteira',
      profissao_comprador: 'Advogada',
      endereco_comprador: 'Av. Atlântica, 456, Copacabana, Rio de Janeiro/RJ',
      email_comprador: 'comprador.teste@exemplo.com',
      telefone_comprador: '(21) 99999-8888',

      endereco_imovel: 'Rua Alameda dos Anjos, nº 10, Condomínio Solar, Curitiba/PR',
      matricula_imovel: '123.456-A',
      rgi_imovel: '2º Ofício de Registro de Imóveis',
      inscricao_municipal: '01.02.003.0045.001',
      area_total: '150.5',
      vagas_garagem: '2',

      vendedor_banco: 'Banco do Brasil',
      vendedor_agencia: '1234',
      vendedor_conta: '56789-0',
      vendedor_pix: '123.456.789-00',

      valor_total: 'R$ 500.000,00',
      valor_sinal: 'R$ 50.000,00',
      comissao: 'R$ 25.000,00',
    }

    if (type === 'a_vista') {
      const data = {
        ...commonData,
        valor_saldo: 'R$ 450.000,00',
        data_pagamento_saldo: addDays(new Date(), 30).toISOString().split('T')[0],
        valor_reforco: '',
        valor_complemento: '',
        valor_financiado: '',
        instituicao_financeira: '',
        taxa_juros: '',
        prazo_meses: '',
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
        }
      })
    } else {
      const data = {
        ...commonData,
        valor_reforco: 'R$ 25.000,00',
        valor_complemento: 'R$ 25.000,00',
        valor_financiado: 'R$ 400.000,00',
        instituicao_financeira: 'Caixa Econômica Federal',
        taxa_juros: '8.5',
        prazo_meses: '360',
        valor_saldo: '',
        data_pagamento_saldo: undefined,
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
        }
      })
    }
  }

  if (isPreviewMode && !isSuccess) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white"
              onClick={() => setIsPreviewMode(false)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                Visualizar Minuta
              </h2>
              <p className="text-slate-600">
                Edite o texto do contrato antes de gerar o documento final.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 text-sm text-slate-500 font-medium">
            Editor de Texto (As alterações serão salvas na versão final)
          </div>
          <Textarea
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="min-h-[60vh] w-full p-6 text-[15px] font-sans leading-relaxed border-0 focus-visible:ring-0 rounded-none resize-y"
            placeholder="O texto do contrato aparecerá aqui..."
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 pb-12">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(false)}
            disabled={isGenerating || isAnalyzing}
            className="h-14 px-8 text-lg"
          >
            Voltar
          </Button>
          <Button
            variant="secondary"
            onClick={handleAnalyzeAI}
            disabled={isGenerating || isAnalyzing}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 h-14 px-6 text-lg border border-purple-200 shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Bot className="w-5 h-5 mr-2" /> Analisar com IA Jurídica
              </>
            )}
          </Button>
          <Button
            onClick={handleGenerateFinal}
            disabled={isGenerating || isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg shadow-lg shadow-blue-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Gerando...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" /> Gerar Versão Final
              </>
            )}
          </Button>
        </div>

        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bot className="w-7 h-7 text-purple-600" />
                Relatório de Análise Jurídica
              </DialogTitle>
              <DialogDescription className="text-base">
                Análise baseada em jurisprudência e legislação aplicável ao contrato elaborado.
              </DialogDescription>
            </DialogHeader>
            {analysisReport && <AnalysisReportView report={analysisReport} />}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-20 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800">Contrato gerado com sucesso!</h2>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          O contrato foi salvo no sistema de forma segura.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-base bg-white"
            onClick={() => {
              setIsSuccess(false)
              onBack()
            }}
          >
            Novo Contrato
          </Button>
        </div>
      </div>
    )
  }

  const isValid = form.formState.isValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-5xl mx-auto animate-in fade-in space-y-8"
      >
        <input type="hidden" {...form.register('tipo')} value={type} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                Tipo Selecionado
              </p>
              <p className="font-bold text-slate-800 text-xl">
                {type === 'a_vista' ? 'À Vista (Sinal + Saldo)' : 'Financiado'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleFillDummyData}
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            <Wand2 className="w-4 h-4 text-blue-600" />
            Preencher Dados de Teste
          </Button>
        </div>

        <div className="space-y-8">
          <PersonBlock suffix="_vendedor" title="Dados do Vendedor" />
          <SellerBankBlock />
          <PersonBlock suffix="_comprador" title="Dados do Comprador" />
          <PropertyBlock />
          <FinancialBlock type={type} />

          {(form.formState.errors.valor_saldo?.message?.includes('Sinal + Reforço') ||
            form.formState.errors.valor_financiado?.message?.includes('Sinal + Reforço')) && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro nos Valores</AlertTitle>
              <AlertDescription>
                A soma do Sinal, Reforço, Complemento e{' '}
                {type === 'a_vista' ? 'Saldo' : 'Financiado'} deve ser exatamente igual ao Valor
                Total. Por favor, revise os valores.
              </AlertDescription>
            </Alert>
          )}

          <FinancingBlock type={type} />
        </div>
        <div className="flex justify-end pt-4 pb-12">
          <Button
            type="submit"
            disabled={!isValid}
            size="lg"
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-lg h-14 px-10 shadow-lg shadow-blue-200"
          >
            Visualizar Minuta
          </Button>
        </div>
      </form>
    </Form>
  )
}
