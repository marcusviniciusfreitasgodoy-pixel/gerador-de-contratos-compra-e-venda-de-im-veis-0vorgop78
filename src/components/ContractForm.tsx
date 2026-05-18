import { useState, useEffect } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { contractSchema, type ContractFormValues, parseCurrencySafe } from '@/lib/schemas'
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Wand2,
} from 'lucide-react'
import { saveContractDraft } from '@/services/contracts'
import {
  FormInput,
  FormCurrencyInput,
  FormMaskedInput,
  FormSelect,
  FormFileInput,
} from './FormInput'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { parseCurrency, formatCurrency } from '@/lib/formatters'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { cn } from '@/lib/utils'
import { ESTADO_CIVIL_OPTIONS, REGIME_BENS_OPTIONS, PLATAFORMA_OPTIONS } from '@/lib/constants'

const WIZARD_STEPS = [
  { id: 1, title: 'Comprador' },
  { id: 2, title: 'Vendedor' },
  { id: 3, title: 'Imóvel' },
  { id: 4, title: 'Negociação' },
  { id: 5, title: 'Compliance Jurídico' },
]

function CompradorTab() {
  const { watch, control } = useFormContext()
  const tipoComprador = watch('tipo_comprador')
  const estCivilC = watch('estado_civil_comprador')
  const temFinanciamento = watch('financiamento_comprador')

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Identificação do Comprador</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          name="tipo_comprador"
          label="Tipo"
          options={[
            { label: 'Pessoa Física', value: 'pf' },
            { label: 'Pessoa Jurídica', value: 'pj' },
          ]}
        />
        <FormInput
          name="nome_comprador"
          label={tipoComprador === 'pj' ? 'Razão Social' : 'Nome Completo'}
        />
      </div>

      {tipoComprador === 'pj' ? (
        <div className="grid grid-cols-2 gap-4">
          <FormMaskedInput name="cnpj_comprador" label="CNPJ" maskType="cnpj" />
          <FormInput name="representante_comprador" label="Representante Legal" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormMaskedInput name="cpf_comprador" label="CPF" maskType="cpf" />
          <FormInput name="rg_comprador" label="RG" />
          <FormSelect
            name="nacionalidade_comprador"
            label="Nacionalidade"
            options={[
              { label: 'Brasileiro(a)', value: 'Brasileiro(a)' },
              { label: 'Estrangeiro(a)', value: 'Estrangeiro(a)' },
            ]}
          />
          <FormInput name="profissao_comprador" label="Profissão" />
          <FormInput name="data_nascimento_comprador" label="Data de Nascimento" type="date" />
          <FormSelect
            name="estado_civil_comprador"
            label="Estado Civil"
            options={ESTADO_CIVIL_OPTIONS}
          />
          {(estCivilC === 'Casado' || estCivilC === 'Casada') && (
            <FormSelect
              name="regime_bens_comprador"
              label="Regime Bens"
              options={REGIME_BENS_OPTIONS}
            />
          )}
        </div>
      )}

      {(estCivilC === 'Casado' || estCivilC === 'Casada') && (
        <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
          <FormInput name="nome_conjuge_comprador" label="Nome do Cônjuge" />
          <FormMaskedInput name="cpf_conjuge_comprador" label="CPF do Cônjuge" maskType="cpf" />
          <FormInput name="rg_conjuge_comprador" label="RG do Cônjuge" />
        </div>
      )}

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Estrutura Financeira</h3>
        <div className="flex gap-4">
          <FormField
            control={control}
            name="financiamento_comprador"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Utilizará Financiamento</FormLabel>
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
                <FormLabel className="!mt-0 cursor-pointer">Utilizará FGTS</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {temFinanciamento && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
            <FormSelect
              name="instituicao_financeira"
              label="Banco Pretendido"
              options={[
                { label: 'Caixa Econômica', value: 'Caixa' },
                { label: 'Itaú', value: 'Itaú' },
                { label: 'Bradesco', value: 'Bradesco' },
                { label: 'Santander', value: 'Santander' },
                { label: 'Banco do Brasil', value: 'Banco do Brasil' },
                { label: 'Outro', value: 'Outro' },
              ]}
            />
            <FormInput name="prazo_financiamento" label="Prazo Desejado (meses)" type="number" />
            <FormCurrencyInput name="valor_financiamento" label="Valor a Financiar" />
          </div>
        )}
      </div>
    </div>
  )
}

function VendedorTab() {
  const { watch, control } = useFormContext()
  const vendPj = watch('vendedor_pj')
  const estCivilV = watch('estado_civil_vendedor')
  const inventario = watch('imovel_inventario')
  const locado = watch('imovel_locado')

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Identificação do Vendedor</h3>
      <FormField
        control={control}
        name="vendedor_pj"
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <FormLabel className="!mt-0 cursor-pointer">Vendedor é Pessoa Jurídica (PJ)</FormLabel>
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
          <FormSelect
            name="estado_civil_vendedor"
            label="Estado Civil"
            options={ESTADO_CIVIL_OPTIONS}
          />
          {(estCivilV === 'Casado' || estCivilV === 'Casada') && (
            <FormSelect
              name="regime_bens_vendedor"
              label="Regime Bens"
              options={REGIME_BENS_OPTIONS}
            />
          )}
        </div>
      )}

      {(estCivilV === 'Casado' || estCivilV === 'Casada') && (
        <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
          <FormInput name="conjuge_vendedor" label="Nome do Cônjuge" />
          <FormMaskedInput name="cpf_conjuge_vendedor" label="CPF do Cônjuge" maskType="cpf" />
          <FormInput name="rg_conjuge_vendedor" label="RG do Cônjuge" />
        </div>
      )}

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Situação Jurídica do Imóvel</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { name: 'imovel_inventario', label: 'Em Inventário' },
            { name: 'imovel_locado', label: 'Imóvel Locado' },
            { name: 'imovel_financiado', label: 'Imóvel Financiado' },
            { name: 'imovel_ocupado', label: 'Imóvel Ocupado' },
            { name: 'possui_usufruto', label: 'Possui Usufruto' },
          ].map((fieldData) => (
            <FormField
              key={fieldData.name}
              control={control}
              name={fieldData.name}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">{fieldData.label}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </div>

        {inventario && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-amber-50 border-amber-200">
            <FormInput name="numero_processo_inventario" label="Número do Processo" />
            <FormInput name="inventariante" label="Inventariante" />
            <FormInput name="alvara_inventario" label="Alvará (Dados)" />
          </div>
        )}

        {locado && (
          <div className="grid grid-cols-3 gap-4 border p-4 rounded bg-blue-50 border-blue-200">
            <FormInput name="detalhes_locacao" label="Contrato de Locação (Detalhes)" />
            <FormInput name="prazo_locacao" label="Prazo da Locação" />
            <FormField
              control={control}
              name="preferencia_locatario"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 mt-8">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    Locatário renunciou preferência?
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function ImovelTab() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Identificação do Imóvel</h3>
      <div className="grid grid-cols-3 gap-4">
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
        <FormInput name="matricula_imovel" label="Nº da Matrícula *" />
        <FormInput name="cartorio_imovel" label="Cartório (RGI)" />
        <FormInput name="inscricao_iptu" label="Inscrição Municipal (IPTU)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="endereco_imovel" label="Logradouro" />
        <div className="grid grid-cols-2 gap-2">
          <FormInput name="numero_imovel" label="Número" />
          <FormInput name="complemento_imovel" label="Complemento" />
        </div>
        <FormInput name="bairro_imovel" label="Bairro" />
        <div className="grid grid-cols-2 gap-2">
          <FormInput name="cidade_imovel" label="Cidade" />
          <FormInput name="estado_imovel" label="UF" />
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Características Físicas</h3>
        <div className="grid grid-cols-5 gap-4">
          <FormInput name="area_privativa" label="Área Priv. (m²)" type="number" />
          <FormInput name="area_total" label="Área Total (m²)" type="number" />
          <FormInput name="quartos" label="Quartos" type="number" />
          <FormInput name="suites" label="Suítes" type="number" />
          <FormInput name="vagas_garagem" label="Vagas" type="number" />
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Upload de Documentos (Compliance)</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormFileInput
            name="matricula_file"
            label="Cópia da Matrícula Atualizada (Opcional)"
            accept=".pdf,image/*"
          />
          <FormFileInput name="iptu_file" label="Capa do IPTU (Opcional)" accept=".pdf,image/*" />
        </div>
      </div>
    </div>
  )
}

function NegociacaoTab() {
  const { watch, control, setValue } = useFormContext()
  const total = watch('valor_total')
  const parcelas = watch('havera_parcelas')

  useEffect(() => {
    const s = parseCurrency(String(watch('valor_sinal') || '0'))
    const fin = parseCurrency(String(watch('valor_financiamento') || '0'))
    const fgts = parseCurrency(String(watch('valor_fgts') || '0'))
    const rec = parseCurrency(String(watch('valor_recursos_proprios') || '0'))
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
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex justify-between items-center mb-6">
        <span className="font-semibold">Valor Total Estimado:</span>
        <span className="text-2xl font-bold text-blue-600">
          {total ? formatCurrency(total) : 'R$ 0,00'}
        </span>
      </div>

      <h3 className="font-semibold text-lg border-b pb-2">Valores</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" />
        <FormCurrencyInput name="valor_fgts" label="Valor FGTS" />
        <FormCurrencyInput name="valor_financiamento" label="Valor a Financiar (Revisão)" />
        <FormCurrencyInput name="valor_recursos_proprios" label="Recursos Próprios / Saldo" />
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Parcelamento</h3>
        <FormField
          control={control}
          name="havera_parcelas"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">
                Haverá pagamento parcelado direto?
              </FormLabel>
            </FormItem>
          )}
        />
        {parcelas && (
          <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="quantidade_parcelas" label="Quantidade de Parcelas" type="number" />
            <FormCurrencyInput name="valor_parcela" label="Valor da Parcela" />
          </div>
        )}
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Posse do Imóvel</h3>
        <FormField
          control={control}
          name="posse_imediata"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 mb-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">Posse Imediata na Assinatura</FormLabel>
            </FormItem>
          )}
        />
        {!watch('posse_imediata') && (
          <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-slate-50">
            <FormInput name="data_posse" label="Data de Posse Acordada" type="date" />
            <FormInput name="prazo_desocupacao" label="Prazo Desocupação (dias)" type="number" />
          </div>
        )}
      </div>
    </div>
  )
}

function ComplianceTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Assinatura Eletrônica</h3>
      <div className="space-y-4">
        <FormField
          control={control}
          name="assinatura_eletronica"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer">
                Utilizar Assinatura Digital/Eletrônica
              </FormLabel>
            </FormItem>
          )}
        />
        <FormSelect
          name="plataforma_assinatura"
          label="Plataforma de Assinatura"
          options={PLATAFORMA_OPTIONS}
        />
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Resolução de Conflitos</h3>
        <div className="flex gap-4">
          <FormField
            control={control}
            name="arbitragem"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md flex-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Cláusula de Arbitragem</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="mediacao"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md flex-1">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Cláusula de Mediação</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">LGPD</h3>
        <FormField
          control={control}
          name="clausula_lgpd"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
                />
              </FormControl>
              <FormLabel className="!mt-0 cursor-pointer text-emerald-900 font-medium">
                Consentimento LGPD (Obrigatório para prosseguir)
              </FormLabel>
            </FormItem>
          )}
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
  const [currentStep, setCurrentStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [draftId, setDraftId] = useState<string | undefined>()

  const { user } = useAuth()
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo_comprador: 'pf',
      vendedor_pj: false,
      tipo_documento: tipoDocumento,
      status: 'em_elaboracao',
      financiamento_comprador: false,
      possui_financiamento: false,
      fgts_comprador: false,
      posse_imediata: false,
      imovel_inventario: false,
      imovel_locado: false,
      havera_parcelas: false,
      clausula_lgpd: false,
    } as any,
    mode: 'onChange',
  })

  const isFinanciado = form.watch('financiamento_comprador') || form.watch('possui_financiamento')

  useEffect(() => {
    if (!isFinanciado) {
      form.clearErrors('valor_financiamento')
    }
  }, [isFinanciado, form])

  const handleFillMockData = () => {
    const currentValues = form.getValues()
    const hasData =
      currentValues.nome_comprador || currentValues.nome_vendedor || currentValues.matricula_imovel

    if (hasData) {
      if (!window.confirm('Existem dados preenchidos. Deseja sobrescrever com dados de teste?')) {
        return
      }
    }

    form.reset({
      ...currentValues,
      tipo_comprador: 'pf',
      nome_comprador: 'João Batista da Silva',
      cpf_comprador: '123.456.789-00',
      rg_comprador: '12.345.678-9',
      nacionalidade_comprador: 'Brasileiro(a)',
      profissao_comprador: 'Engenheiro de Software',
      data_nascimento_comprador: '1985-05-15',
      estado_civil_comprador: 'Casado',
      regime_bens_comprador: 'Comunhão Parcial',
      nome_conjuge_comprador: 'Maria Aparecida da Silva',
      cpf_conjuge_comprador: '987.654.321-00',
      rg_conjuge_comprador: '98.765.432-1',
      financiamento_comprador: true,
      possui_financiamento: true,
      fgts_comprador: true,
      instituicao_financeira: 'Caixa',
      prazo_financiamento: 360,

      vendedor_pj: false,
      nome_vendedor: 'Carlos Eduardo Oliveira',
      cpf_vendedor: '111.222.333-44',
      rg_vendedor: '11.222.333-4',
      estado_civil_vendedor: 'Divorciado',

      imovel_inventario: false,
      imovel_locado: false,
      imovel_financiado: false,
      imovel_ocupado: false,
      possui_usufruto: false,

      tipo_imovel: 'Apartamento',
      matricula_imovel: '123456',
      cartorio_imovel: '1º Ofício de Registro de Imóveis',
      inscricao_iptu: '9876543-2',
      endereco_imovel: 'Avenida Paulista',
      numero_imovel: '1000',
      complemento_imovel: 'Apto 152',
      bairro_imovel: 'Bela Vista',
      cidade_imovel: 'São Paulo',
      estado_imovel: 'SP',
      area_privativa: 120,
      area_total: 150,
      quartos: 3,
      suites: 1,
      vagas_garagem: 2,

      valor_total: '500.000,00',
      valor_sinal: '50.000,00',
      valor_fgts: '100.000,00',
      valor_financiamento: formatCurrency(500000 * 0.7), // 70% do valor total
      valor_recursos_proprios: '0,00',
      havera_parcelas: false,

      posse_imediata: false,
      data_posse: '2026-12-01',
      prazo_desocupacao: 30,

      assinatura_eletronica: true,
      plataforma_assinatura: 'Clicksign',
      arbitragem: false,
      mediacao: true,
      clausula_lgpd: true,
    } as any)

    toast.success('Formulário preenchido com dados de teste.')
  }

  // Auto-save logic
  const handleNext = async () => {
    let isValid = false

    if (currentStep === 1) {
      isValid = await form.trigger(['nome_comprador'])
      const estC = form.getValues('estado_civil_comprador')
      if (estC === 'Casado' || estC === 'Casada') {
        if (!form.getValues('nome_conjuge_comprador')) {
          toast.error('Informe o nome do cônjuge do comprador.')
          isValid = false
        }
      }
    } else if (currentStep === 2) {
      isValid = await form.trigger(['nome_vendedor'])
      const estV = form.getValues('estado_civil_vendedor')
      if ((estV === 'Casado' || estV === 'Casada') && !form.getValues('conjuge_vendedor')) {
        toast.error('Informe o nome do cônjuge do vendedor (Compliance exigido).')
        isValid = false
      }
    } else if (currentStep === 3) {
      const mat = form.getValues('matricula_imovel')
      if (!mat) {
        toast.error('O número da Matrícula é obrigatório.')
        isValid = false
      } else {
        isValid = true
      }
    } else if (currentStep === 4) {
      isValid = await form.trigger([
        'valor_sinal',
        'valor_fgts',
        'valor_financiamento',
        'valor_recursos_proprios',
        'havera_parcelas',
      ])

      const isFinanciado =
        form.getValues('financiamento_comprador') || form.getValues('possui_financiamento')
      const valorFinanciamentoStr = form.getValues('valor_financiamento')
      const valorFinanciamento = parseCurrencySafe(valorFinanciamentoStr)

      if (isFinanciado && valorFinanciamento <= 0) {
        toast.error(
          'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento',
          {
            style: { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#f87171' },
          },
        )
        form.setError('valor_financiamento', {
          type: 'manual',
          message: 'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento',
        })
        setTimeout(() => {
          const el = document.querySelector('[name="valor_financiamento"]') as HTMLElement
          if (el) {
            el.focus()
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
        isValid = false
      }
    }

    if (!isValid) return

    try {
      const record = await saveContractDraft(form.getValues(), draftId)
      setDraftId(record.id)
    } catch (err) {
      console.error('Failed to autosave draft:', err)
    }

    setCurrentStep((s) => s + 1)
  }

  const initiateGeneration = async () => {
    const valid = await form.trigger()

    const isFinanciado =
      form.getValues('financiamento_comprador') || form.getValues('possui_financiamento')
    const valorFinanciamentoStr = form.getValues('valor_financiamento')
    const valorFinanciamento = parseCurrencySafe(valorFinanciamentoStr)
    let customValid = true

    if (isFinanciado && valorFinanciamento <= 0) {
      toast.error(
        'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento',
        {
          style: { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#f87171' },
        },
      )
      form.setError('valor_financiamento', {
        type: 'manual',
        message: 'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento',
      })
      setCurrentStep(4)
      setTimeout(() => {
        const el = document.querySelector('[name="valor_financiamento"]') as HTMLElement
        if (el) {
          el.focus()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      customValid = false
    }

    if (!valid || !customValid) return toast.error('Preencha todos os campos obrigatórios.')

    const lgpd = form.getValues('clausula_lgpd')
    if (!lgpd) return toast.error('O consentimento da LGPD é obrigatório.')

    setIsGenerating(true)
    try {
      const values = form.getValues()

      const jsonMestre = {
        comprador: {
          nome: values.nome_comprador,
          cpf: values.cpf_comprador,
          estado_civil: values.estado_civil_comprador,
          regime_bens: values.regime_bens_comprador,
          financeiro: {
            financiamento: values.financiamento_comprador,
            fgts: values.fgts_comprador,
          },
        },
        imovel: {
          situacao_juridica: {
            locado: values.imovel_locado,
            inventario: values.imovel_inventario,
          },
        },
        negociacao: {
          valor_total: parseCurrencySafe(values.valor_total),
          posse: {
            imediata: values.posse_imediata,
            data: values.data_posse,
          },
        },
      }

      const payloadForAi = { ...values, json_mestre: jsonMestre }
      delete payloadForAi.matricula_file
      delete payloadForAi.iptu_file

      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(payloadForAi),
      })

      await saveContractDraft(
        { ...values, used_clauses: res?.used_clauses, status: 'concluido' },
        draftId,
        res?.minuta_texto,
      )

      toast.success('Contrato gerado com sucesso!')
      setIsSuccess(true)
    } catch (err) {
      toast.error('Erro na geração do documento', {
        description:
          getErrorMessage(err) || 'Verifique as informações preenchidas e tente novamente.',
        style: { backgroundColor: '#0C2340', color: '#D4AF37', borderColor: '#D4AF37' },
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12 animate-in fade-in bg-white rounded-2xl shadow-sm border p-8">
        <CheckCircle2 size={40} className="mx-auto text-green-600 mb-4" />
        <h2 className="text-3xl font-bold">Contrato Montado com Sucesso!</h2>
        <p className="text-slate-500 mt-2">
          Validação de compliance concluída e cláusulas processadas.
        </p>
        <div className="flex justify-center gap-3 mt-8">
          <Button variant="outline" onClick={onBack}>
            Novo Documento
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="-ml-4 w-fit">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button
          type="button"
          onClick={handleFillMockData}
          className="bg-[#0C2340] text-[#D4AF37] hover:bg-[#0C2340]/90 border border-[#D4AF37] shadow-sm font-medium w-full sm:w-auto"
          size="sm"
        >
          <Wand2 className="w-4 h-4 mr-2" />
          Preencher Dados de Teste
        </Button>
      </div>
      <div className="flex justify-between mb-8 px-2 sm:px-12 relative">
        <div className="absolute top-5 left-8 right-8 sm:left-16 sm:right-16 h-[2px] bg-slate-200 -z-10" />
        {WIZARD_STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              'flex flex-col items-center bg-transparent',
              s.id <= currentStep ? 'text-primary' : 'text-slate-400',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 border-2',
                s.id === currentStep
                  ? 'bg-primary text-primary-foreground border-secondary shadow-md ring-4 ring-primary/10'
                  : s.id < currentStep
                    ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200',
              )}
            >
              {s.id < currentStep ? <CheckCircle2 className="w-5 h-5 text-primary" /> : s.id}
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-bold text-center w-16 sm:w-auto',
                s.id === currentStep ? 'text-primary' : '',
              )}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-8">
          <Form {...form}>
            <form className="space-y-6">
              {currentStep === 1 && <CompradorTab />}
              {currentStep === 2 && <VendedorTab />}
              {currentStep === 3 && <ImovelTab />}
              {currentStep === 4 && <NegociacaoTab />}
              {currentStep === 5 && <ComplianceTab />}

              <div className="flex justify-between pt-8 mt-8 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={currentStep === 1 || isGenerating}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
                {currentStep < 5 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Próximo <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={initiateGeneration}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-w-[200px] font-bold shadow-lg"
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin text-primary" />{' '}
                        <span className="text-primary">Processando IA...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 w-5 h-5 text-primary" />{' '}
                        <span className="text-primary">Validar e Gerar Contrato</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
