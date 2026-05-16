import { useState, useEffect } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Bot,
  Save,
  Wand2,
  ShieldCheck,
  Download,
} from 'lucide-react'
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
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { generateContractPDF } from '@/lib/pdf-contract'

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

function ValuesTab() {
  const { watch } = useFormContext()
  const total = watch('valor_total')
  const type = watch('tipo')

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2 mb-2">
          <FormSelect
            name="tipo"
            label="Forma de Pagamento Base"
            options={[
              { label: 'À Vista', value: 'a_vista' },
              { label: 'Financiado', value: 'financiado' },
            ]}
          />
        </div>

        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" />
        <FormCurrencyInput name="comissao" label="Comissão Imobiliária" />

        {type === 'a_vista' && (
          <>
            <FormCurrencyInput name="valor_saldo" label="Saldo Restante" />
            <FormInput name="data_pagamento_saldo" label="Data Limite p/ Pagamento" type="date" />
          </>
        )}

        {type === 'financiado' && (
          <>
            <FormCurrencyInput
              name="valor_recursos_proprios"
              label="Recursos Próprios (FGTS/Poupança)"
            />
            <FormCurrencyInput name="valor_financiado" label="Valor a Financiar" />
            <FormSelect
              name="instituicao_financeira"
              label="Banco do Financiamento"
              options={BANCO_OPTIONS}
            />
            <FormInput name="taxa_juros" label="Taxa de Juros (%)" type="number" />
            <FormInput name="prazo_meses" label="Prazo em Meses" type="number" />
            <FormInput name="data_liberacao_credito" label="Previsão de Liberação" type="date" />
          </>
        )}
      </div>

      <div className="p-4 bg-slate-50 border rounded-lg flex justify-between items-center mt-6">
        <span className="font-semibold text-slate-700">Valor Total Calculado:</span>
        <span className="text-2xl font-bold text-blue-600">
          {total ? formatCurrency(total) : 'R$ 0,00'}
        </span>
      </div>
    </div>
  )
}

function ConditionsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
      <FormSelect
        name="tipo_negociacao"
        label="Estratégia de Negociação"
        options={[
          { label: 'À Vista (Padrão)', value: 'a_vista' },
          { label: 'Financiamento Padrão', value: 'financiamento' },
          { label: 'Investidor (Flip / Revenda)', value: 'investidor' },
          { label: 'Alto Padrão (Premium)', value: 'alto_padrao' },
          { label: 'Permuta', value: 'permuta' },
        ]}
      />
      <FormInput name="cidade" label="Cidade e Estado (Foro)" placeholder="Ex: São Paulo - SP" />
      <FormInput
        name="cartorio"
        label="Cartório de Registro"
        placeholder="Ex: 1º Cartório de Imóveis"
      />
      <FormInput
        name="prazo_acordo"
        label="Prazo de Validade do Acordo"
        placeholder="Ex: 30 dias"
      />
      <FormInput name="prazo_escritura" label="Data Limite p/ Escritura" type="date" />
      <FormInput name="data_posse" label="Data Prevista p/ Posse" type="date" />
      <FormInput name="percentual_multa" label="Multa de Rescisão (%)" type="number" />
      <FormInput
        name="responsavel_comissao"
        label="Responsável pela Comissão"
        placeholder="Ex: Vendedor"
      />

      <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
        <h3 className="font-semibold text-lg text-slate-800 mb-2">Cláusulas Especiais</h3>
      </div>
      <div className="col-span-1 md:col-span-2">
        <FormInput
          name="situacao_juridica_imovel"
          label="Situação Jurídica do Imóvel (Ônus/Hipotecas)"
          placeholder="Livre e desembaraçado de quaisquer ônus..."
        />
      </div>
      <div className="col-span-1 md:col-span-2">
        <FormInput
          name="condicao_suspensiva"
          label="Condição Suspensiva"
          placeholder="Ex: Negócio condicionado à aprovação do crédito habitacional..."
        />
      </div>
    </div>
  )
}

export function ContractForm({
  tipoDocumento,
  onBack,
}: {
  tipoDocumento: string
  onBack: () => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingCompliance, setIsGeneratingCompliance] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('vendedor')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const { user } = useAuth()

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo: 'a_vista',
      tipo_documento: tipoDocumento,
      tipo_negociacao: 'a_vista',
      status: 'em_elaboracao',
      user: user?.id,
    } as any,
    mode: 'onChange',
  })

  const {
    watch,
    setValue,
    formState: { isValid, errors },
  } = form

  const handleFillDummyData = () => {
    setValue('nome_vendedor', 'João da Silva', { shouldValidate: true })
    setValue('cpf_vendedor', '111.111.111-11', { shouldValidate: true })
    setValue('rg_vendedor', '11.111.111-1', { shouldValidate: true })
    setValue('orgao_emissor_vendedor', 'SSP/SP', { shouldValidate: true })
    setValue('nacionalidade_vendedor', 'Brasileiro(a)', { shouldValidate: true })
    setValue('estado_civil_vendedor', 'Casado', { shouldValidate: true })
    setValue('profissao_vendedor', 'Engenheiro', { shouldValidate: true })
    setValue('endereco_vendedor', 'Rua das Flores, 123, Centro, São Paulo - SP', {
      shouldValidate: true,
    })
    setValue('email_vendedor', 'joao.vendedor@exemplo.com', { shouldValidate: true })
    setValue('telefone_vendedor', '(11) 98888-8888', { shouldValidate: true })

    setValue('nome_comprador', 'Maria Oliveira', { shouldValidate: true })
    setValue('cpf_comprador', '222.222.222-22', { shouldValidate: true })
    setValue('rg_comprador', '22.222.222-2', { shouldValidate: true })
    setValue('orgao_emissor_comprador', 'SSP/SP', { shouldValidate: true })
    setValue('nacionalidade_comprador', 'Brasileira', { shouldValidate: true })
    setValue('estado_civil_comprador', 'Solteiro', { shouldValidate: true })
    setValue('profissao_comprador', 'Médica', { shouldValidate: true })
    setValue('endereco_comprador', 'Av. Paulista, 1000, Bela Vista, São Paulo - SP', {
      shouldValidate: true,
    })
    setValue('email_comprador', 'maria.compradora@exemplo.com', { shouldValidate: true })
    setValue('telefone_comprador', '(11) 97777-7777', { shouldValidate: true })

    setValue('endereco_imovel', 'Rua do Imóvel, 456, Apto 12, Jardins, São Paulo - SP', {
      shouldValidate: true,
    })
    setValue('matricula_imovel', '123456', { shouldValidate: true })
    setValue('rgi_imovel', '1º Cartório de Registro de Imóveis', { shouldValidate: true })
    setValue('inscricao_municipal', '001.002.003-4', { shouldValidate: true })
    setValue('area_total', 120, { shouldValidate: true })
    setValue('vagas_garagem', 2, { shouldValidate: true })

    setValue('cidade', 'São Paulo - SP', { shouldValidate: true })
    setValue('cartorio', '1º Cartório de Registro de Imóveis de SP', { shouldValidate: true })
    setValue('prazo_acordo', '30 dias', { shouldValidate: true })
    setValue('percentual_multa', 10, { shouldValidate: true })
    setValue('responsavel_comissao', 'Vendedor', { shouldValidate: true })

    setValue('valor_sinal', 50000, { shouldValidate: true })
    setValue('comissao', 25000, { shouldValidate: true })
    setValue('valor_saldo', 450000, { shouldValidate: true })

    form.trigger()
    toast.success('Campos preenchidos com dados fictícios!')
  }

  const handleAnalyzeAI = async () => {
    setIsAnalyzing(true)
    try {
      const encodedText = btoa(unescape(encodeURIComponent(draftText)))
      const res = await pb.send('/backend/v1/analisar-contrato', {
        method: 'POST',
        body: JSON.stringify({
          arquivo: encodedText,
          tipo: 'txt',
          tipoContrato: form.getValues('tipo'),
          contractId: generatedContractId,
        }),
      })

      if (res.error) toast.error(res.error)
      else {
        setAnalysisReport(res)
        setShowAnalysisModal(true)
      }
    } catch (err: any) {
      toast.error('Erro ao analisar contrato.', { description: getErrorMessage(err) })
    } finally {
      setIsAnalyzing(false)
    }
  }

  useEffect(() => {
    if (user?.id) setValue('user', user.id)
  }, [user?.id, setValue])

  const sinal = watch('valor_sinal')
  const saldo = watch('valor_saldo')
  const financiado = watch('valor_financiado')
  const recursProp = watch('valor_recursos_proprios')
  const comissao = watch('comissao')
  const formType = watch('tipo')

  useEffect(() => {
    let total = 0
    const parseSafe = (val: any) =>
      typeof val === 'number' ? val : parseCurrency(String(val || '')) || 0

    total += parseSafe(sinal)
    if (formType === 'a_vista') {
      total += parseSafe(saldo)
    } else {
      total += parseSafe(financiado)
      total += parseSafe(recursProp)
    }
    setValue('valor_total', total, { shouldValidate: true })

    if (user?.comissao_padrao_percentual && total > 0 && !comissao) {
      const perc = Number(user.comissao_padrao_percentual) / 100
      setValue('comissao', total * perc, { shouldValidate: true })
    }
  }, [sinal, saldo, financiado, recursProp, formType, setValue, user, comissao])

  const preCheckRisks = (data: ContractFormValues) => {
    if (data.valor_total && data.valor_total > 1000000) {
      toast.warning('Aviso de Risco', {
        description:
          'Transação de alto valor detectada. Recomendada análise profunda de Compliance/PLD-FT.',
      })
    }
    if (data.tipo_negociacao === 'permuta') {
      toast.warning('Aviso de Risco', {
        description:
          'Operação de permuta. Atenção redobrada às regras de valoração de bens e tributação.',
      })
    }
  }

  const onSubmit = async (data: ContractFormValues) => {
    setIsGenerating(true)
    preCheckRisks(data)
    try {
      const submitData = { ...data, user: user?.id }
      const txt = generateDraftText(submitData, user)
      setDraftText(txt)
      const saved = await createContract(submitData, txt)
      setGeneratedContractId(saved.id)
      toast.success('Documento gerado com sucesso!')
      setIsSuccess(true)
    } catch (err: any) {
      toast.error('Erro ao gerar documento.', { description: getErrorMessage(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateComplianceDraft = async () => {
    setIsGeneratingCompliance(true)
    try {
      const isValidForm = await form.trigger()
      if (!isValidForm) return

      const payload = form.getValues()
      preCheckRisks(payload)

      const res = await pb.send('/backend/v1/gerar-minuta-compliance', {
        method: 'POST',
        body: JSON.stringify({ ...payload }),
      })

      const txt = res.minuta
      setDraftText(txt)
      const submitData = { ...payload, user: user?.id }
      const saved = await createContract(submitData, txt)
      setGeneratedContractId(saved.id)
      toast.success('Minuta de compliance (CNJ 88) gerada com sucesso!', {
        description: `Fontes utilizadas: ${res.fontes_utilizadas?.length || 0}`,
      })
      setIsSuccess(true)
    } catch (err: any) {
      toast.error('Erro ao gerar minuta de compliance.', { description: getErrorMessage(err) })
    } finally {
      setIsGeneratingCompliance(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl mx-auto p-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Documento gerado com sucesso!</h2>
        <p className="text-slate-600 text-lg">
          As cláusulas de LGPD, Assinatura Eletrônica e PLD-FT foram injetadas.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <Button variant="outline" size="lg" onClick={onBack}>
            Novo Documento
          </Button>
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => generateContractPDF(draftText, `${tipoDocumento || 'Documento'}.pdf`)}
          >
            <Download className="w-5 h-5 mr-2" /> Baixar PDF
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
                <Bot className="w-5 h-5 mr-2" /> Auditar IA
              </>
            )}
          </Button>
        </div>

        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bot className="w-7 h-7 text-purple-600" /> Relatório de Análise Jurídica
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Análise baseada em jurisprudência e legislação aplicável ao documento elaborado.
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
                <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto p-1 mb-6 bg-slate-100 overflow-x-auto justify-start sm:justify-center">
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
                  <TabsTrigger value="condicoes" className="py-2.5 text-sm md:text-base">
                    Condições
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
                  <ValuesTab />
                </TabsContent>
                <TabsContent value="condicoes" className="mt-0 outline-none">
                  <ConditionsTab />
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-4">
                <div className="flex-1">
                  {Object.keys(errors).length > 0 ? (
                    <p className="text-red-500 text-sm font-medium">
                      Preencha todos os campos obrigatórios nas abas.
                    </p>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Formulário pronto para gerar documento.
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFillDummyData}
                    className="w-full sm:w-auto text-slate-600"
                  >
                    <Wand2 className="w-4 h-4 mr-2" /> Preencher Fictício
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateComplianceDraft}
                    disabled={!isValid || isGeneratingCompliance || isGenerating}
                    className="w-full sm:w-auto text-purple-700 border-purple-200 hover:bg-purple-50"
                  >
                    {isGeneratingCompliance ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    Gerar via IA (+ PLD/FT)
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isGenerating || isGeneratingCompliance}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Gerar Padrão
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
