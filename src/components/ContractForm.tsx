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

const ESTADO_CIVIL_OPTIONS = [
  { label: 'Solteiro(a)', value: 'Solteiro' },
  { label: 'Casado', value: 'Casado' },
  { label: 'Divorciado(a)', value: 'Divorciado' },
  { label: 'Viúvo(a)', value: 'Viúvo' },
]

const REGIME_BENS_OPTIONS = [
  { label: 'Comunhão Parcial', value: 'Comunhão Parcial' },
  { label: 'Comunhão Universal', value: 'Comunhão Universal' },
  { label: 'Separação Total', value: 'Separação Total' },
  { label: 'Participação Final', value: 'Participação Final' },
]

const PLATAFORMA_OPTIONS = [
  { label: 'Clicksign', value: 'Clicksign' },
  { label: 'ZapSign', value: 'ZapSign' },
  { label: 'Docusign', value: 'Docusign' },
  { label: 'Autentique', value: 'Autentique' },
]

const WIZARD_STEPS = [
  { id: 1, title: 'Partes' },
  { id: 2, title: 'Imóvel' },
  { id: 3, title: 'Negociação' },
  { id: 4, title: 'Jurídico' },
]

function PartiesTab() {
  const { watch, control } = useFormContext()
  const tipoComprador = watch('tipo_comprador')
  const estadoCivilComprador = watch('estado_civil_comprador')
  const possuiProcuradorComprador = watch('possui_procurador_comprador')

  const vendedorPj = watch('vendedor_pj')
  const estadoCivilVendedor = watch('estado_civil_vendedor')
  const possuiProcuradorVendedor = watch('procurador_vendedor')

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">Dados do Comprador</h3>
        <div className="w-64">
          <FormSelect
            name="tipo_comprador"
            label="Tipo de Pessoa"
            options={[
              { label: 'Pessoa Física (PF)', value: 'pf' },
              { label: 'Pessoa Jurídica (PJ)', value: 'pj' },
            ]}
          />
        </div>

        <FormInput
          name="nome_comprador"
          label={tipoComprador === 'pj' ? 'Razão Social' : 'Nome Completo'}
        />

        {tipoComprador === 'pj' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="cnpj_comprador" label="CNPJ" placeholder="00.000.000/0000-00" />
            <FormInput name="representante_comprador" label="Representante Legal" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormMaskedInput
              name="cpf_comprador"
              label="CPF"
              placeholder="000.000.000-00"
              maskType="cpf"
            />
            <FormInput name="rg_comprador" label="RG" />
            <FormInput name="nacionalidade_comprador" label="Nacionalidade" />
            <FormInput name="profissao_comprador" label="Profissão" />
            <FormSelect
              name="estado_civil_comprador"
              label="Estado Civil"
              options={ESTADO_CIVIL_OPTIONS}
            />
            {estadoCivilComprador === 'Casado' && (
              <FormSelect
                name="regime_bens_comprador"
                label="Regime de Bens"
                options={REGIME_BENS_OPTIONS}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="endereco_comprador" label="Endereço Completo" />
          <FormInput name="email_comprador" label="Email" />
          <FormMaskedInput name="telefone_comprador" label="Telefone" maskType="phone" />
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <FormField
            control={control}
            name="possui_procurador_comprador"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Representado por Procurador</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="financiamento_comprador"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Necessita Financiamento</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fgts_comprador"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Uso de FGTS</FormLabel>
              </FormItem>
            )}
          />
        </div>
        {possuiProcuradorComprador && (
          <FormInput name="nome_procurador_comprador" label="Nome do Procurador (Comprador)" />
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">Dados do Vendedor</h3>
        <FormField
          control={control}
          name="vendedor_pj"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 mb-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Vendedor é Pessoa Jurídica</FormLabel>
            </FormItem>
          )}
        />

        <FormInput name="nome_vendedor" label={vendedorPj ? 'Razão Social' : 'Nome Completo'} />

        {vendedorPj ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput name="cnpj_vendedor" label="CNPJ" placeholder="00.000.000/0000-00" />
            <FormInput name="representante_vendedor" label="Representante Legal" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormMaskedInput
              name="cpf_vendedor"
              label="CPF"
              placeholder="000.000.000-00"
              maskType="cpf"
            />
            <FormInput name="rg_vendedor" label="RG" />
            <FormSelect
              name="estado_civil_vendedor"
              label="Estado Civil"
              options={ESTADO_CIVIL_OPTIONS}
            />
            {estadoCivilVendedor === 'Casado' && (
              <>
                <FormSelect
                  name="regime_bens_vendedor"
                  label="Regime de Bens"
                  options={REGIME_BENS_OPTIONS}
                />
                <FormInput name="conjuge_vendedor" label="Nome do Cônjuge" />
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="endereco_vendedor" label="Endereço Completo" />
          <FormInput name="email_vendedor" label="Email" />
          <FormMaskedInput name="telefone_vendedor" label="Telefone" maskType="phone" />
        </div>

        <FormField
          control={control}
          name="procurador_vendedor"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Representado por Procurador</FormLabel>
            </FormItem>
          )}
        />
        {possuiProcuradorVendedor && (
          <FormInput name="nome_procurador_vendedor" label="Nome do Procurador (Vendedor)" />
        )}
      </div>
    </div>
  )
}

function PropertyTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput name="endereco_imovel" label="Endereço do Imóvel" />
        <FormSelect
          name="tipo_imovel"
          label="Tipo de Imóvel"
          options={[
            { label: 'Apartamento', value: 'Apartamento' },
            { label: 'Casa', value: 'Casa' },
            { label: 'Terreno', value: 'Terreno' },
            { label: 'Comercial', value: 'Comercial' },
          ]}
        />
        <FormInput name="matricula_imovel" label="Matrícula" />
        <FormInput name="cartorio_imovel" label="Cartório (RGI)" />
        <FormInput name="inscricao_iptu" label="Inscrição Municipal (IPTU)" />
        <div className="grid grid-cols-2 gap-2">
          <FormInput name="area_privativa" label="Área Priv. (m²)" type="number" />
          <FormInput name="area_total" label="Área Total (m²)" type="number" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FormInput name="vagas_garagem" label="Vagas" type="number" />
          <div className="pt-8">
            <FormField
              control={control}
              name="possui_box"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">Possui Box</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-sm text-slate-800 mb-4">Situação e Riscos (Flags)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="imovel_ocupado"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Ocupado</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imovel_locado"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Locado</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imovel_financiado"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Financiado/Alienação</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imovel_inventario"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Em Inventário</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="possui_onus"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Possui Ônus/Penhora</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="possui_usufruto"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Usufruto</FormLabel>
              </FormItem>
            )}
          />
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
      <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">Negociação e Finanças</h3>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center">
        <span className="font-semibold text-slate-700">Valor Total Estimado:</span>
        <span className="text-2xl font-bold text-blue-600">
          {total ? formatCurrency(total) : 'R$ 0,00'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" />
        <FormInput name="data_pagamento_sinal" label="Data Pgto Sinal" type="date" />

        <FormCurrencyInput name="valor_financiamento" label="Valor a Financiar" />
        <FormInput name="prazo_financiamento" label="Prazo Financiamento (dias)" type="number" />

        <FormCurrencyInput name="valor_fgts" label="Valor FGTS" />
        <FormCurrencyInput name="valor_recursos_proprios" label="Recursos Próprios / Saldo" />

        <FormInput name="quantidade_parcelas" label="Qtd. Parcelas (se houver)" type="number" />
        <FormCurrencyInput name="valor_parcela" label="Valor da Parcela" />

        <FormInput name="prazo_escritura" label="Data Limite p/ Escritura" type="date" />
        <FormInput name="multa_inadimplencia" label="Multa Inadimplência (%)" type="number" />
      </div>

      <div className="mt-4 pt-4 border-t">
        <h3 className="font-semibold text-sm text-slate-800 mb-4">Posse do Imóvel</h3>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput name="data_posse" label="Data da Posse" type="date" />
          <FormInput name="prazo_desocupacao" label="Prazo Desocupação (dias)" type="number" />
          <FormCurrencyInput name="multa_desocupacao" label="Multa Diária (Atraso)" />
          <FormInput name="entrega_chaves" label="Data Entrega das Chaves" type="date" />
        </div>
      </div>
    </div>
  )
}

function LegalTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg text-slate-800 border-b pb-2">
        Cláusulas e Finalização
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_comissao" label="Valor Comissão" />
        <FormInput name="percentual_comissao" label="Percentual (%)" type="number" />
        <FormSelect
          name="responsavel_comissao"
          label="Responsável Pgto"
          options={[
            { label: 'Vendedor', value: 'Vendedor' },
            { label: 'Comprador', value: 'Comprador' },
            { label: 'Ambos (Meio a Meio)', value: 'Ambos' },
          ]}
        />
        <FormInput name="data_pagamento_comissao" label="Data Pgto Comissão" type="date" />
      </div>

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

      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Assinatura e Validação</h4>
          <FormField
            control={control}
            name="assinatura_eletronica"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Assinatura Eletrônica</FormLabel>
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
                <FormLabel className="!mt-0 cursor-pointer">Incluir Cláusula LGPD</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Resolução de Conflitos</h4>
          <FormInput name="foro_comarca" label="Foro (Comarca/UF)" placeholder="Ex: São Paulo/SP" />
          <FormField
            control={control}
            name="arbitragem"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Câmara de Arbitragem</FormLabel>
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
                <FormLabel className="!mt-0 cursor-pointer">Mediação Prévia</FormLabel>
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
      user: user?.id,
      possui_procurador_comprador: false,
      financiamento_comprador: false,
      fgts_comprador: false,
      procurador_vendedor: false,
      imovel_ocupado: false,
      imovel_locado: false,
      imovel_financiado: false,
      imovel_inventario: false,
      possui_onus: false,
      possui_usufruto: false,
      possui_box: false,
      posse_imediata: false,
      comissao_garantida: false,
      assinatura_eletronica: false,
      clausula_lgpd: false,
      arbitragem: false,
      mediacao: false,
    } as any,
    mode: 'onChange',
  })

  const { setValue } = form

  const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 4))
  const handlePrev = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const initiateGeneration = async () => {
    const valid = await form.trigger()
    if (!valid) return toast.error('Preencha os campos obrigatórios primeiro.')
    setShowChecklist(true)
  }

  const handleConfirmChecklist = async () => {
    setValue('checklist_compliance', checklist)
    setShowChecklist(false)
    setIsGenerating(true)
    try {
      const payload = { ...form.getValues(), user: user?.id }
      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      const txt = res.minuta_texto
      setDraftText(txt)
      await createContract(payload, txt)
      toast.success('Master Contract gerado pelo Motor Jurídico!')
      setIsSuccess(true)
    } catch (err) {
      toast.error('Erro na geração', { description: getErrorMessage(err) })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-12 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Master Contract Montado!</h2>
        <p className="text-slate-600 text-lg">
          O Motor Jurídico injetou as cláusulas condicionais, proteção LGPD e demais regras
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
                {currentStep === 1 && <PartiesTab />}
                {currentStep === 2 && <PropertyTab />}
                {currentStep === 3 && <FinancialTab />}
                {currentStep === 4 && <LegalTab />}
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
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={initiateGeneration}
                  >
                    <Bot className="mr-2 h-4 w-4" /> Finalizar e Gerar Master Contract
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
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-600" /> Confirmação de Compliance
            </DialogTitle>
            <DialogDescription>
              Para a montagem final do Master Contract, valide os itens documentais obrigatórios.
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
                <Label htmlFor={key} className="capitalize cursor-pointer font-medium text-sm">
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando Motor Jurídico...
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
