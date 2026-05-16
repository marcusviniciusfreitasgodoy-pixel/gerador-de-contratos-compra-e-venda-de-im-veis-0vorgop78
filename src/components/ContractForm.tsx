import { useState, useEffect } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
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
  ChevronRight,
  ChevronLeft,
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
  DialogFooter,
} from '@/components/ui/dialog'
import { AnalysisReportView, type AnalysisReport } from './AnalysisReportView'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { generateContractPDF } from '@/lib/pdf-contract'
import { cn } from '@/lib/utils'

const ESTADO_CIVIL_OPTIONS = [
  { label: 'Solteiro(a)', value: 'Solteiro' },
  { label: 'Casado(a)', value: 'Casado' },
  { label: 'Divorciado(a)', value: 'Divorciado' },
  { label: 'Viúvo(a)', value: 'Viúvo' },
]
const BANCO_OPTIONS = [
  { label: 'Caixa Econômica', value: 'Caixa' },
  { label: 'Itaú', value: 'Itaú' },
  { label: 'Bradesco', value: 'Bradesco' },
  { label: 'Santander', value: 'Santander' },
  { label: 'Outro', value: 'Outro' },
]
const WIZARD_STEPS = [
  { id: 1, title: 'Partes' },
  { id: 2, title: 'Imóvel' },
  { id: 3, title: 'Financeiro' },
  { id: 4, title: 'Condições' },
]

function PersonTab({ prefix, title }: { prefix: 'vendedor' | 'comprador'; title: string }) {
  const { watch } = useFormContext()
  const tipoPessoa = watch(`tipo_${prefix}`)

  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
      <div className="mb-4">
        <FormSelect
          name={`tipo_${prefix}`}
          label="Tipo de Pessoa"
          options={[
            { label: 'Pessoa Física (PF)', value: 'pf' },
            { label: 'Pessoa Jurídica (PJ)', value: 'pj' },
          ]}
        />
      </div>
      <FormInput
        name={`nome_${prefix}`}
        label={tipoPessoa === 'pj' ? 'Razão Social' : 'Nome Completo'}
      />

      {tipoPessoa === 'pj' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name={`cnpj_${prefix}`} label="CNPJ" placeholder="00.000.000/0000-00" />
          <FormInput
            name={`representante_${prefix}`}
            label="Representante Legal"
            placeholder="Nome completo do representante"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormMaskedInput
            name={`cpf_${prefix}`}
            label="CPF"
            placeholder="000.000.000-00"
            maskType="cpf"
          />
          <FormInput name={`rg_${prefix}`} label="RG" />
          <FormInput name={`nacionalidade_${prefix}`} label="Nacionalidade" />
          <FormSelect
            name={`estado_civil_${prefix}`}
            label="Estado Civil"
            options={ESTADO_CIVIL_OPTIONS}
          />
          <FormInput name={`profissao_${prefix}`} label="Profissão" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput name={`endereco_${prefix}`} label="Endereço Completo" />
        <FormInput name={`email_${prefix}`} label="Email" />
        <FormMaskedInput name={`telefone_${prefix}`} label="Telefone" maskType="phone" />
      </div>
    </div>
  )
}

function PropertyTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
      <FormInput name="endereco_imovel" label="Endereço do Imóvel" />
      <FormInput name="matricula_imovel" label="Matrícula" />
      <FormInput name="rgi_imovel" label="Cartório (RGI)" />
      <FormInput name="inscricao_municipal" label="Inscrição Municipal (IPTU)" />
      <FormInput name="area_total" label="Área Total (m²)" type="number" />
      <FormInput name="vagas_garagem" label="Vagas de Garagem" type="number" />
    </div>
  )
}

function ValuesTab() {
  const { watch, setValue } = useFormContext()
  const total = watch('valor_total')
  const type = watch('tipo')
  const negociacao = watch('tipo_negociacao')

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          name="tipo"
          label="Forma de Pagamento Base"
          options={[
            { label: 'À Vista', value: 'a_vista' },
            { label: 'Financiado', value: 'financiado' },
          ]}
        />
        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" />
        {type === 'a_vista' && (
          <>
            <FormCurrencyInput name="valor_saldo" label="Saldo Restante" />
            <FormInput name="data_pagamento_saldo" label="Data p/ Pagamento" type="date" />
          </>
        )}
        {type === 'financiado' && (
          <>
            <FormCurrencyInput name="valor_recursos_proprios" label="Recursos Próprios" />
            <FormCurrencyInput name="valor_financiado" label="Valor a Financiar" />
            <FormSelect
              name="instituicao_financeira"
              label="Banco do Financiamento"
              options={BANCO_OPTIONS}
            />
            <FormInput name="prazo_meses" label="Prazo (Meses)" type="number" />
          </>
        )}
        {negociacao === 'permuta' && (
          <FormCurrencyInput name="possui_torna" label="Valor da Torna (Diferença a pagar)" />
        )}
        <FormCurrencyInput name="comissao" label="Comissão Imobiliária" />
      </div>
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center mt-6">
        <span className="font-semibold text-slate-700">Valor Total:</span>
        <span className="text-2xl font-bold text-blue-600">
          {total ? formatCurrency(total) : 'R$ 0,00'}
        </span>
      </div>
    </div>
  )
}

function ConditionsTab() {
  const { control } = useFormContext()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
      <FormSelect
        name="tipo_negociacao"
        label="Estratégia do Contrato"
        options={[
          { label: 'Padrão', value: 'a_vista' },
          { label: 'Financiamento Padrão', value: 'financiamento' },
          { label: 'Investidor / Revenda', value: 'investidor' },
          { label: 'Permuta', value: 'permuta' },
        ]}
      />
      <FormInput name="cidade" label="Foro (Cidade/Estado)" />
      <FormInput name="prazo_acordo" label="Prazo do Acordo" />
      <FormInput name="prazo_escritura" label="Data Limite p/ Escritura" type="date" />
      <FormInput name="data_posse" label="Data Limite p/ Posse" type="date" />
      <FormInput name="percentual_multa" label="Multa de Rescisão (%)" type="number" />

      <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t">
        <h3 className="font-semibold text-lg text-slate-800 mb-4">
          Cláusulas de Proteção & Condições
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="imovel_ocupado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Imóvel Ocupado</FormLabel>
                  <p className="text-xs text-muted-foreground">Exige cláusula de desocupação.</p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="uso_fgts"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Uso de FGTS</FormLabel>
                  <p className="text-xs text-muted-foreground">Autoriza resgate do FGTS.</p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vendedor_casado"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Vendedor Casado</FormLabel>
                  <p className="text-xs text-muted-foreground">Exige anuência do cônjuge.</p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="clausula_arrependimento"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Direito de Arrependimento</FormLabel>
                  <p className="text-xs text-muted-foreground">Quebra a irretratabilidade.</p>
                </div>
              </FormItem>
            )}
          />
        </div>
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [generateIntent, setGenerateIntent] = useState<'standard' | 'ai' | null>(null)
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [generatedContractId, setGeneratedContractId] = useState<string | null>(null)
  const [checklist, setChecklist] = useState({
    matricula_atualizada: false,
    titularidade_verificada: false,
    debitos_quitados: false,
    capacidade_civil: false,
  })

  const { user } = useAuth()
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo: 'a_vista',
      tipo_vendedor: 'pf',
      tipo_comprador: 'pf',
      tipo_documento: tipoDocumento,
      tipo_negociacao: 'a_vista',
      status: 'em_elaboracao',
      user: user?.id,
      clausula_arrependimento: false,
      possui_financiamento: false,
      uso_fgts: false,
      imovel_ocupado: false,
      vendedor_casado: false,
    } as any,
    mode: 'onChange',
  })

  const {
    watch,
    setValue,
    formState: { isValid },
  } = form

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4))
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const initiateGeneration = async (intent: 'standard' | 'ai') => {
    const valid = await form.trigger()
    if (!valid) return toast.error('Preencha os campos obrigatórios primeiro.')
    setGenerateIntent(intent)
    setShowChecklist(true)
  }

  const handleConfirmChecklist = async () => {
    setValue('checklist_compliance', checklist)
    setShowChecklist(false)
    setIsGenerating(true)
    try {
      const payload = { ...form.getValues(), user: user?.id }
      let txt = ''
      if (generateIntent === 'ai') {
        const res = await pb.send('/backend/v1/gerar-minuta-compliance', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        txt = res.minuta
        toast.success('Minuta gerada por IA com sucesso!')
      } else {
        txt = generateDraftText(payload, user)
      }
      setDraftText(txt)
      const saved = await createContract(payload, txt)
      setGeneratedContractId(saved.id)
      setIsSuccess(true)
    } catch (err) {
      toast.error('Erro na geração', { description: getErrorMessage(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  // Value auto-calc effect
  useEffect(() => {
    const s = parseCurrency(String(watch('valor_sinal') || '0')),
      fin = parseCurrency(String(watch('valor_financiado') || '0')),
      rec = parseCurrency(String(watch('valor_recursos_proprios') || '0')),
      sal = parseCurrency(String(watch('valor_saldo') || '0'))
    setValue('valor_total', watch('tipo') === 'a_vista' ? s + sal : s + fin + rec, {
      shouldValidate: true,
    })
  }, [
    watch('valor_sinal'),
    watch('valor_financiado'),
    watch('valor_recursos_proprios'),
    watch('valor_saldo'),
    watch('tipo'),
    setValue,
  ])

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Master Contract Gerado!</h2>
        <p className="text-slate-600 text-lg">
          As cláusulas condicionais, proteção LGPD e Assinatura Eletrônica foram injetadas
          perfeitamente.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Button variant="outline" onClick={onBack}>
            Novo Documento
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => generateContractPDF(draftText, `${tipoDocumento}.pdf`)}
          >
            <Download className="mr-2 h-4 w-4" /> Exportar PDF Premium
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <Button variant="ghost" onClick={onBack} className="mb-6 -ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>
      <div className="flex justify-between items-center mb-8 px-4 sm:px-12">
        {WIZARD_STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex flex-col items-center',
              s.id <= currentStep ? 'text-blue-600' : 'text-slate-400 opacity-50',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all',
                s.id === currentStep
                  ? 'bg-blue-600 text-white shadow-md scale-110'
                  : s.id < currentStep
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100',
              )}
            >
              {s.id}
            </div>
            <span className="text-sm font-medium hidden sm:block">{s.title}</span>
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form className="space-y-6">
              <div className="min-h-[400px]">
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PersonTab prefix="vendedor" title="Dados do Vendedor" />
                    <PersonTab prefix="comprador" title="Dados do Comprador" />
                  </div>
                )}
                {currentStep === 2 && <PropertyTab />}
                {currentStep === 3 && <ValuesTab />}
                {currentStep === 4 && <ConditionsTab />}
              </div>
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext}>
                    Próximo <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="text-purple-700 border-purple-200"
                      onClick={() => initiateGeneration('ai')}
                    >
                      <Bot className="mr-2 h-4 w-4" /> IA + Compliance
                    </Button>
                    <Button
                      type="button"
                      className="bg-blue-600"
                      onClick={() => initiateGeneration('standard')}
                    >
                      <Save className="mr-2 h-4 w-4" /> Finalizar
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" /> Checklist de Compliance
            </DialogTitle>
            <DialogDescription>
              Para a geração do Master Contract, valide os itens de segurança obrigatórios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(checklist).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-3 p-3 border rounded bg-slate-50">
                <Checkbox
                  id={key}
                  checked={val}
                  onCheckedChange={(c) => setChecklist((p) => ({ ...p, [key]: !!c }))}
                />
                <Label htmlFor={key} className="capitalize cursor-pointer font-medium">
                  {key.replace(/_/g, ' ')} confirmada?
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              disabled={!Object.values(checklist).every(Boolean) || isGenerating}
              onClick={handleConfirmChecklist}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...
                </>
              ) : (
                'Confirmar e Gerar Documento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
