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
  ShieldCheck,
  Download,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { createContract } from '@/services/contracts'
import { FormInput, FormCurrencyInput, FormMaskedInput, FormSelect } from './FormInput'
import { toast } from 'sonner'
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
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { generateContractPDF } from '@/lib/pdf-contract'
import { cn } from '@/lib/utils'
import { ESTADO_CIVIL_OPTIONS, REGIME_BENS_OPTIONS, PLATAFORMA_OPTIONS } from '@/lib/constants'

const WIZARD_STEPS = [
  { id: 1, title: 'Partes' },
  { id: 2, title: 'Imóvel' },
  { id: 3, title: 'Negociação' },
  { id: 4, title: 'Jurídico' },
]

function PartiesTab() {
  const { watch, control } = useFormContext()
  const tipoComprador = watch('tipo_comprador')
  const estCivilC = watch('estado_civil_comprador')
  const procC = watch('possui_procurador_comprador')
  const vendPj = watch('vendedor_pj')
  const estCivilV = watch('estado_civil_vendedor')
  const procV = watch('procurador_vendedor')

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Dados do Comprador</h3>
        <FormSelect
          name="tipo_comprador"
          label="Tipo"
          options={[
            { label: 'PF', value: 'pf' },
            { label: 'PJ', value: 'pj' },
          ]}
        />
        <FormInput
          name="nome_comprador"
          label={tipoComprador === 'pj' ? 'Razão Social' : 'Nome Completo'}
        />
        {tipoComprador === 'pj' ? (
          <div className="grid grid-cols-2 gap-4">
            <FormMaskedInput name="cnpj_comprador" label="CNPJ" maskType="cnpj" />
            <FormInput name="representante_comprador" label="Representante Legal" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormMaskedInput name="cpf_comprador" label="CPF" maskType="cpf" />
            <FormInput name="rg_comprador" label="RG" />
            <FormInput name="orgao_emissor_comprador" label="Órgão Emissor" />
            <FormInput name="data_nascimento_comprador" label="Data de Nascimento" type="date" />
            <FormInput name="nacionalidade_comprador" label="Nacionalidade" />
            <FormInput name="profissao_comprador" label="Profissão" />
            <FormSelect
              name="estado_civil_comprador"
              label="Estado Civil"
              options={ESTADO_CIVIL_OPTIONS}
            />
            {estCivilC === 'Casado' && (
              <FormSelect
                name="regime_bens_comprador"
                label="Regime Bens"
                options={REGIME_BENS_OPTIONS}
              />
            )}
          </div>
        )}
        {estCivilC === 'Casado' && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="nome_conjuge_comprador" label="Nome do Cônjuge" />
            <FormMaskedInput name="cpf_conjuge_comprador" label="CPF do Cônjuge" maskType="cpf" />
            <FormInput name="rg_conjuge_comprador" label="RG do Cônjuge" />
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="cep_comprador" label="CEP" />
          <FormInput name="endereco_comprador" label="Endereço" />
          <FormInput name="email_comprador" label="Email" />
          <FormMaskedInput name="telefone_comprador" label="Telefone" maskType="phone" />
        </div>
        <div className="flex gap-4">
          <FormField
            control={control}
            name="possui_procurador_comprador"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Tem Procurador</FormLabel>
              </FormItem>
            )}
          />
        </div>
        {procC && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="nome_procurador_comprador" label="Nome Procurador" />
            <FormMaskedInput
              name="cpf_procurador_comprador"
              label="CPF Procurador"
              maskType="cpf"
            />
            <FormInput name="instrumento_procurador_comprador" label="Instrumento (Livro/Folha)" />
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg border-b pb-2">Dados do Vendedor</h3>
        <FormField
          control={control}
          name="vendedor_pj"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">PJ</FormLabel>
            </FormItem>
          )}
        />
        <FormInput name="nome_vendedor" label={vendPj ? 'Razão Social' : 'Nome Completo'} />
        {vendPj ? (
          <div className="grid grid-cols-2 gap-4">
            <FormMaskedInput name="cnpj_vendedor" label="CNPJ" maskType="cnpj" />
            <FormInput name="representante_vendedor" label="Representante Legal" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <FormMaskedInput name="cpf_vendedor" label="CPF" maskType="cpf" />
            <FormInput name="rg_vendedor" label="RG" />
            <FormInput name="orgao_emissor_vendedor" label="Órgão Emissor" />
            <FormInput name="data_nascimento_vendedor" label="Data de Nascimento" type="date" />
            <FormSelect
              name="estado_civil_vendedor"
              label="Estado Civil"
              options={ESTADO_CIVIL_OPTIONS}
            />
            {estCivilV === 'Casado' && (
              <FormSelect
                name="regime_bens_vendedor"
                label="Regime Bens"
                options={REGIME_BENS_OPTIONS}
              />
            )}
          </div>
        )}
        {estCivilV === 'Casado' && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="conjuge_vendedor" label="Nome do Cônjuge" />
            <FormMaskedInput name="cpf_conjuge_vendedor" label="CPF do Cônjuge" maskType="cpf" />
            <FormInput name="rg_conjuge_vendedor" label="RG do Cônjuge" />
          </div>
        )}
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="cep_vendedor" label="CEP" />
          <FormInput name="endereco_vendedor" label="Endereço" />
          <FormInput name="email_vendedor" label="Email" />
          <FormMaskedInput name="telefone_vendedor" label="Telefone" maskType="phone" />
        </div>
        <FormField
          control={control}
          name="procurador_vendedor"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Tem Procurador</FormLabel>
            </FormItem>
          )}
        />
        {procV && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="nome_procurador_vendedor" label="Nome Procurador" />
            <FormMaskedInput name="cpf_procurador_vendedor" label="CPF Procurador" maskType="cpf" />
            <FormInput name="instrumento_procurador_vendedor" label="Instrumento (Livro/Folha)" />
          </div>
        )}
      </div>
    </div>
  )
}

function PropertyTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Dados do Imóvel</h3>
      <div className="grid grid-cols-3 gap-4">
        <FormInput name="cep_imovel" label="CEP" />
        <FormInput name="endereco_imovel" label="Logradouro" />
        <FormInput name="numero_imovel" label="Número" />
        <FormInput name="complemento_imovel" label="Complemento" />
        <FormInput name="bairro_imovel" label="Bairro" />
        <FormInput name="cidade_imovel" label="Cidade" />
        <FormInput name="estado_imovel" label="UF" />
        <FormSelect
          name="tipo_imovel"
          label="Tipo"
          options={[
            { label: 'Apartamento', value: 'Apartamento' },
            { label: 'Casa', value: 'Casa' },
            { label: 'Terreno', value: 'Terreno' },
            { label: 'Comercial', value: 'Comercial' },
          ]}
        />
      </div>
      <div className="grid grid-cols-3 gap-4 border-t pt-4">
        <FormInput name="matricula_imovel" label="Matrícula" />
        <FormInput name="cartorio_imovel" label="Cartório (RGI)" />
        <FormInput name="inscricao_iptu" label="Inscrição IPTU" />
        <FormInput name="area_privativa" label="Área Priv. (m²)" type="number" />
        <FormInput name="area_total" label="Área Total (m²)" type="number" />
        <FormInput name="quartos" label="Quartos" type="number" />
        <FormInput name="suites" label="Suítes" type="number" />
        <FormInput name="vagas_garagem" label="Vagas" type="number" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-sm mb-4">Situação e Riscos</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            'imovel_ocupado',
            'imovel_locado',
            'imovel_financiado',
            'imovel_inventario',
            'possui_onus',
            'possui_usufruto',
            'acoes_judiciais',
          ].map((name) => (
            <FormField
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer capitalize">
                    {name.replace(/_/g, ' ')}
                  </FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FinancialTab() {
  const { watch, control, setValue } = useFormContext()
  const total = watch('valor_total')

  useEffect(() => {
    const s = parseCurrency(String(watch('valor_sinal') || '0')),
      fin = parseCurrency(String(watch('valor_financiamento') || '0')),
      fgts = parseCurrency(String(watch('valor_fgts') || '0')),
      rec = parseCurrency(String(watch('valor_recursos_proprios') || '0'))
    setValue('valor_total', s + fin + fgts + rec, { shouldValidate: true })
  }, [
    watch('valor_sinal'),
    watch('valor_financiamento'),
    watch('valor_fgts'),
    watch('valor_recursos_proprios'),
    setValue,
  ])

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Negociação e Finanças</h3>
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
        <span className="font-semibold">Valor Total Estimado:</span>
        <span className="text-2xl font-bold text-blue-600">
          {total ? formatCurrency(total) : 'R$ 0,00'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" />
        <FormInput name="data_pagamento_sinal" label="Data Pgto Sinal" type="date" />
        <div className="flex items-center gap-2">
          <FormField
            control={control}
            name="financiamento_comprador"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Terá Financiamento</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fgts_comprador"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Terá FGTS</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-1"></div>
        <FormCurrencyInput name="valor_financiamento" label="Valor a Financiar" />
        <FormInput name="instituicao_financeira" label="Instituição Financeira" />
        <FormInput name="prazo_aprovacao" label="Prazo Aprovação (dias)" type="number" />
        <FormCurrencyInput name="renda_declarada_comprador" label="Renda Declarada" />
        <FormCurrencyInput name="valor_fgts" label="Valor FGTS" />
        <FormCurrencyInput name="valor_recursos_proprios" label="Recursos Próprios / Saldo" />
        <FormInput name="quantidade_parcelas" label="Qtd. Parcelas" type="number" />
        <FormCurrencyInput name="valor_parcela" label="Valor da Parcela" />
        <FormInput name="data_assinatura" label="Data de Assinatura" type="date" />
        <FormInput name="data_quitacao" label="Data de Quitação" type="date" />
        <FormInput name="prazo_escritura" label="Data Limite Escritura" type="date" />
        <FormInput name="multa_inadimplencia" label="Multa Inadimplência (%)" type="number" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-sm mb-4">Posse do Imóvel</h3>
        <FormField
          control={control}
          name="posse_imediata"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 mb-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Posse Imediata</FormLabel>
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormInput name="data_posse" label="Data da Posse" type="date" />
          <FormInput name="prazo_desocupacao" label="Prazo Desocupação (dias)" type="number" />
          <FormCurrencyInput name="multa_desocupacao" label="Multa Diária" />
        </div>
      </div>
    </div>
  )
}

function LegalTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Cláusulas e Finalização</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_comissao" label="Valor Comissão" />
        <FormInput name="percentual_comissao" label="Percentual (%)" type="number" />
        <FormSelect
          name="responsavel_comissao"
          label="Responsável Pgto"
          options={[
            { label: 'Vendedor', value: 'Vendedor' },
            { label: 'Comprador', value: 'Comprador' },
            { label: 'Ambos', value: 'Ambos' },
          ]}
        />
        <FormInput name="data_pagamento_comissao" label="Data Pgto Comissão" type="date" />
      </div>
      <div className="flex flex-wrap gap-4">
        <FormField
          control={control}
          name="comissao_garantida"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Comissão Garantida</FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="vistoria_obrigatoria"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Vistoria Obrigatória</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Assinatura</h4>
          <FormField
            control={control}
            name="assinatura_eletronica"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Eletrônica</FormLabel>
              </FormItem>
            )}
          />
          <FormSelect
            name="plataforma_assinatura"
            label="Plataforma"
            options={PLATAFORMA_OPTIONS}
          />
          <FormField
            control={control}
            name="clausula_lgpd"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">LGPD</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Conflitos</h4>
          <FormInput
            name="foro_comarca"
            label="Foro (Comarca/UF)"
            placeholder="Rio de Janeiro/RJ"
          />
          <FormField
            control={control}
            name="arbitragem"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Arbitragem</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mediacao"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Mediação</FormLabel>
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
  const [draftText, setDraftText] = useState('')
  const [checklist, setChecklist] = useState({
    matricula_atualizada: false,
    debitos_quitados: false,
  })

  const { user } = useAuth()
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo_comprador: 'pf',
      vendedor_pj: false,
      tipo_documento: tipoDocumento,
      status: 'em_elaboracao',
      possui_procurador_comprador: false,
      financiamento_comprador: false,
      fgts_comprador: false,
      procurador_vendedor: false,
      posse_imediata: false,
    } as any,
    mode: 'onChange',
  })

  const initiateGeneration = async () => {
    const valid = await form.trigger()
    if (!valid) return toast.error('Preencha os campos obrigatórios primeiro.')
    const values = form.getValues()
    if (values.estado_civil_vendedor === 'Casado' && !values.conjuge_vendedor)
      return toast.error('Dados do cônjuge do vendedor são obrigatórios para casados.')
    if (values.financiamento_comprador && !values.instituicao_financeira)
      return toast.error('Instituição Financeira é obrigatória para financiamentos.')

    if (
      (values.estado_civil_vendedor === 'Casado' || values.estado_civil_vendedor === 'Casada') &&
      !values.conjuge_vendedor
    ) {
      return toast.error('Compliance: Vendedores casados exigem identificação do cônjuge.')
    }

    setShowChecklist(true)
  }

  const handleConfirmChecklist = async () => {
    form.setValue('checklist_compliance', checklist)
    setShowChecklist(false)
    setIsGenerating(true)
    try {
      const payload = { ...form.getValues() }
      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setDraftText(res.minuta_texto)
      await createContract({ ...payload, used_clauses: res.used_clauses }, res.minuta_texto)
      toast.success('Contrato gerado com sucesso!')
      setIsSuccess(true)
    } catch (err) {
      toast.error('Erro na geração', { description: getErrorMessage(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12 animate-in fade-in bg-white rounded-2xl shadow-sm border p-8">
        <CheckCircle2 size={40} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-3xl font-bold">Master Contract Montado!</h2>
        <div className="flex justify-center gap-3 mt-8">
          <Button variant="outline" onClick={onBack}>
            Novo Documento
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => generateContractPDF(draftText, `${tipoDocumento}.pdf`)}
          >
            <Download className="mr-2 w-4 h-4" /> Exportar PDF
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
      <div className="flex justify-between mb-8 px-12">
        {WIZARD_STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex flex-col items-center',
              s.id <= currentStep ? 'text-blue-600' : 'text-slate-400',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2',
                s.id === currentStep
                  ? 'bg-blue-600 text-white shadow-md scale-110'
                  : s.id < currentStep
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100',
              )}
            >
              {s.id}
            </div>
            <span className="text-sm font-medium">{s.title}</span>
          </div>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form className="space-y-6">
              {currentStep === 1 && <PartiesTab />}
              {currentStep === 2 && <PropertyTab />}
              {currentStep === 3 && <FinancialTab />}
              {currentStep === 4 && <LegalTab />}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Voltar
                </Button>
                {currentStep < 4 ? (
                  <Button type="button" onClick={() => setCurrentStep((s) => s + 1)}>
                    Próximo <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button type="button" onClick={initiateGeneration} className="bg-blue-600">
                    <Bot className="mr-2 w-4 h-4" /> Finalizar
                  </Button>
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
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" /> Compliance
            </DialogTitle>
            <DialogDescription>Valide os itens documentais obrigatórios.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {Object.entries(checklist).map(([key, val]) => (
              <div key={key} className="flex items-center space-x-3 p-3 border rounded bg-slate-50">
                <Checkbox
                  id={key}
                  checked={val}
                  onCheckedChange={(c) => setChecklist((p) => ({ ...p, [key]: !!c }))}
                />
                <Label htmlFor={key} className="capitalize cursor-pointer">
                  {key.replace(/_/g, ' ')} confirmado?
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
                </>
              ) : (
                'Confirmar e Montar Documento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
