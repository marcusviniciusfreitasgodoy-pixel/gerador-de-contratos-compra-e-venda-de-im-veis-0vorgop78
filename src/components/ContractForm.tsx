import { useState, useEffect } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import { ArrowLeft, Loader2, CheckCircle2, Bot, Save } from 'lucide-react'
import { createContract } from '@/services/contracts'
import { FormInput, FormCurrencyInput, FormMaskedInput, FormSelect } from './FormInput'
import { toast } from 'sonner'
import { generateDraftText } from '@/lib/draft-template'
import { useAuth } from '@/hooks/use-auth'
import { parseCurrency, formatCurrency } from '@/lib/formatters'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AnalysisReportView, type AnalysisReport } from './AnalysisReportView'
import pb from '@/lib/pocketbase/client'

const ESTADO_CIVIL_OPTIONS = [
  { label: 'Solteiro(a)', value: 'Solteiro' },
  { label: 'Casado(a)', value: 'Casado' },
  { label: 'Divorciado(a)', value: 'Divorciado' },
  { label: 'Viúvo(a)', value: 'Viúvo' },
]

const BANCO_OPTIONS = [
  { label: 'Caixa Econômica Federal', value: 'Caixa Econômica Federal' },
  { label: 'Itaú', value: 'Itaú' },
  { label: 'Bradesco', value: 'Bradesco' },
  { label: 'Santander', value: 'Santander' },
  { label: 'Banco do Brasil', value: 'Banco do Brasil' },
  { label: 'Outro', value: 'Outro' },
]

function PersonTab({ prefix }: { prefix: 'vendedor' | 'comprador' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
      <FormInput name={`nome_${prefix}`} label="Nome Completo" placeholder="Nome completo" />
      <FormMaskedInput
        name={`cpf_${prefix}`}
        label="CPF"
        placeholder="000.000.000-00"
        maskType="cpf"
      />
      <FormInput name={`rg_${prefix}`} label="RG" placeholder="Número do RG" />
      <FormInput name={`orgao_emissor_${prefix}`} label="Órgão Emissor" placeholder="Ex: SSP/SP" />
      <FormInput
        name={`nacionalidade_${prefix}`}
        label="Nacionalidade"
        placeholder="Ex: Brasileiro(a)"
      />
      <FormSelect
        name={`estado_civil_${prefix}`}
        label="Estado Civil"
        options={ESTADO_CIVIL_OPTIONS}
      />
      <FormInput name={`profissao_${prefix}`} label="Profissão" placeholder="Sua profissão" />
      <FormInput
        name={`endereco_${prefix}`}
        label="Endereço Completo"
        placeholder="Rua, número, bairro, cidade"
      />
      <FormInput name={`email_${prefix}`} label="Email" placeholder="email@exemplo.com" />
      <FormMaskedInput
        name={`telefone_${prefix}`}
        label="Telefone"
        placeholder="(00) 00000-0000"
        maskType="phone"
      />

      {prefix === 'vendedor' && (
        <>
          <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
            <h3 className="font-semibold text-lg text-slate-800 mb-2">
              Dados Bancários para Pagamento
            </h3>
          </div>
          <FormInput name="vendedor_banco" label="Banco" placeholder="Ex: Itaú, Nubank" />
          <FormInput name="vendedor_agencia" label="Agência" placeholder="Ex: 0000" />
          <FormInput name="vendedor_conta" label="Conta" placeholder="Ex: 00000-0" />
          <FormInput name="vendedor_pix" label="Chave PIX" placeholder="CPF, Email, Telefone..." />
        </>
      )}
    </div>
  )
}

function PropertyTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
      <FormInput name="endereco_imovel" label="Endereço Completo do Imóvel" />
      <FormInput name="matricula_imovel" label="Matrícula" />
      <FormInput name="rgi_imovel" label="RGI (Registro de Imóveis)" />
      <FormInput name="inscricao_municipal" label="Inscrição Municipal (IPTU)" />
      <FormInput name="area_total" label="Área Total (m²)" type="number" />
      <FormInput name="vagas_garagem" label="Vagas de Garagem" type="number" />
    </div>
  )
}

function ValuesTab({ type }: { type: 'a_vista' | 'financiado' }) {
  const { watch } = useFormContext()
  const total = watch('valor_total')

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_sinal" label="Sinal" />
        {type === 'a_vista' && (
          <>
            <FormCurrencyInput name="valor_saldo" label="Saldo" />
            <FormInput name="data_pagamento_saldo" label="Data de Pagamento do Saldo" type="date" />
          </>
        )}
        {type === 'financiado' && (
          <>
            <FormCurrencyInput name="valor_reforco" label="Reforço" />
            <FormCurrencyInput name="valor_complemento" label="Complemento" />
            <FormCurrencyInput name="valor_financiado" label="Valor Financiado" />
            <FormSelect name="instituicao_financeira" label="Banco" options={BANCO_OPTIONS} />
            <FormInput name="taxa_juros" label="Taxa de Juros (%)" type="number" />
            <FormInput name="prazo_meses" label="Prazo em Meses" type="number" />
            <FormInput name="data_liberacao_credito" label="Previsão de Liberação" type="date" />
          </>
        )}
        <FormCurrencyInput name="comissao" label="Comissão Imobiliária" />
      </div>

      <div className="p-4 bg-slate-50 border rounded-lg flex justify-between items-center mt-6">
        <span className="font-semibold text-slate-700">Valor Total Calculado:</span>
        <span className="text-2xl font-bold text-blue-600">{total || 'R$ 0,00'}</span>
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
  const [activeTab, setActiveTab] = useState('vendedor')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const { user } = useAuth()

  const handleAnalyzeAI = async () => {
    setIsAnalyzing(true)
    try {
      const encodedText = btoa(unescape(encodeURIComponent(draftText)))
      const res = await pb.send('/backend/v1/analisar-contrato', {
        method: 'POST',
        body: JSON.stringify({
          arquivo: encodedText,
          tipo: 'txt',
          tipoContrato: type,
          contractId: generatedContractId,
        }),
      })

      if (res.error) {
        toast.error(res.error)
      } else {
        setAnalysisReport(res)
        setShowAnalysisModal(true)
      }
    } catch (err: any) {
      toast.error('Erro ao analisar contrato.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo: type,
      status: 'em_elaboracao',
    } as any,
    mode: 'onChange',
  })

  const {
    watch,
    setValue,
    formState: { isValid, errors },
  } = form

  const sinal = watch('valor_sinal')
  const saldo = watch('valor_saldo')
  const reforco = watch('valor_reforco')
  const complemento = watch('valor_complemento')
  const financiado = watch('valor_financiado')
  const comissao = watch('comissao')

  useEffect(() => {
    let total = 0
    total += parseCurrency(sinal) || 0
    if (type === 'a_vista') {
      total += parseCurrency(saldo) || 0
    } else {
      total += parseCurrency(reforco) || 0
      total += parseCurrency(complemento) || 0
      total += parseCurrency(financiado) || 0
    }
    setValue('valor_total', formatCurrency(total), { shouldValidate: true })

    // Auto-calculate comissao if user has a default percentage and comissao is empty
    if (user?.comissao_padrao_percentual && total > 0 && !comissao) {
      const perc = Number(user.comissao_padrao_percentual) / 100
      setValue('comissao', formatCurrency(total * perc), { shouldValidate: true })
    }
  }, [sinal, saldo, reforco, complemento, financiado, type, setValue, user, comissao])

  const onSubmit = async (data: ContractFormValues) => {
    setIsGenerating(true)
    try {
      const txt = generateDraftText(data, user)
      setDraftText(txt)
      const saved = await createContract(data, txt)
      setGeneratedContractId(saved.id)
      toast.success('Contrato gerado com sucesso!')
      setIsSuccess(true)
    } catch (err: any) {
      toast.error('Erro ao gerar contrato.', { description: 'Tente novamente mais tarde.' })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-20 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto p-8">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Contrato gerado com sucesso!</h2>
        <p className="text-slate-600 text-lg">O contrato foi salvo no sistema.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button variant="outline" size="lg" onClick={onBack}>
            Novo Contrato
          </Button>
          <Button
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
            onClick={handleAnalyzeAI}
            disabled={isAnalyzing}
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
        </div>

        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bot className="w-7 h-7 text-purple-600" />
                Relatório de Análise Jurídica
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Análise baseada em jurisprudência e legislação aplicável ao contrato elaborado.
              </DialogDescription>
            </div>
            <div className="p-6">
              {analysisReport && <AnalysisReportView report={analysisReport} />}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-4 text-slate-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full h-auto p-1 mb-6 bg-slate-100 overflow-x-auto justify-start sm:justify-center">
                  <TabsTrigger value="vendedor" className="py-2.5 text-sm md:text-base">
                    Vendedor
                  </TabsTrigger>
                  <TabsTrigger value="comprador" className="py-2.5 text-sm md:text-base">
                    Comprador
                  </TabsTrigger>
                  <TabsTrigger value="imovel" className="py-2.5 text-sm md:text-base">
                    Imóvel
                  </TabsTrigger>
                  <TabsTrigger value="valores" className="py-2.5 text-sm md:text-base">
                    Valores
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vendedor" className="mt-0 outline-none">
                  <PersonTab prefix="vendedor" />
                </TabsContent>
                <TabsContent value="comprador" className="mt-0 outline-none">
                  <PersonTab prefix="comprador" />
                </TabsContent>
                <TabsContent value="imovel" className="mt-0 outline-none">
                  <PropertyTab />
                </TabsContent>
                <TabsContent value="valores" className="mt-0 outline-none">
                  <ValuesTab type={type} />
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
                {Object.keys(errors).length > 0 ? (
                  <p className="text-red-500 text-sm font-medium">
                    Preencha todos os campos obrigatórios nas abas.
                  </p>
                ) : (
                  <div className="text-sm text-slate-500">
                    Formulário pronto para gerar contrato.
                  </div>
                )}
                <Button
                  type="submit"
                  size="lg"
                  disabled={!isValid || isGenerating}
                  className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando minuta...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Gerar Contrato
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
