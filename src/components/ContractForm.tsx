import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  FileText,
} from 'lucide-react'
import { saveContractDraft } from '@/services/contracts'
import { generateDraftText } from '@/lib/draft-template'
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
import { PreviewPDFModal } from './PreviewPDFModal'
import { getMinutaPDFBlobUrl, generateMinutaPDF } from '@/lib/pdf-generator'

const WIZARD_STEPS_ALL = [
  { id: 'perfil_checklist', title: 'Perfil da Checklist' },
  { id: 'comprador', title: 'Comprador' },
  { id: 'vendedor', title: 'Vendedor' },
  { id: 'imovel', title: 'Imóvel' },
  { id: 'negociacao', title: 'Negociação' },
  { id: 'compliance', title: 'Compliance Jurídico' },
  { id: 'preview', title: 'Minuta' },
]

function PerfilChecklistTab() {
  const { control } = useFormContext()
  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Perfil da Checklist (Due Diligence)</h3>
      <p className="text-sm text-slate-500 mb-4">
        Preencha os perfis abaixo para gerar uma checklist condicional e personalizada.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-4 bg-slate-50 shadow-sm border-slate-200">
          <h4 className="font-medium text-primary mb-4 flex items-center gap-2">
            Perfil do Vendedor
          </h4>
          <FormField
            control={control}
            name="vendedor_pj"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 mb-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  Vendedor é Empresário / Pessoa Jurídica
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="vendedor_uniao_estavel"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Vendedor em União Estável</FormLabel>
              </FormItem>
            )}
          />
        </Card>
        <Card className="p-4 bg-slate-50 shadow-sm border-slate-200">
          <h4 className="font-medium text-primary mb-4 flex items-center gap-2">
            Perfil do Comprador
          </h4>
          <FormField
            control={control}
            name="comprador_uniao_estavel"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 mb-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Comprador em União Estável</FormLabel>
              </FormItem>
            )}
          />
          <FormSelect
            name="regime_bens_comprador"
            label="Regime de Bens do Comprador"
            options={REGIME_BENS_OPTIONS}
          />
        </Card>
      </div>
    </div>
  )
}

function PreviewTab({ user }: { user: any }) {
  const { getValues } = useFormContext()
  const values = getValues()
  const text = generateDraftText(values, user)

  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2">Pré-visualização do Documento</h3>
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 whitespace-pre-wrap font-mono text-sm h-[500px] overflow-y-auto">
        {text}
      </div>
    </div>
  )
}

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
          <FormInput name="email_comprador" label="E-mail do Comprador" type="email" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormMaskedInput name="cpf_comprador" label="CPF" maskType="cpf" />
          <FormInput name="rg_comprador" label="RG" />
          <FormInput name="email_comprador" label="E-mail do Comprador" type="email" />
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
  const { watch, control, setValue } = useFormContext()
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
          <FormInput name="email_vendedor" label="E-mail do Vendedor" type="email" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormMaskedInput name="cpf_vendedor" label="CPF" maskType="cpf" />
          <FormInput name="rg_vendedor" label="RG" />
          <FormInput name="orgao_emissor_vendedor" label="Órgão Emissor" />
          <FormInput name="telefone_vendedor" label="Telefone / Celular" />
          <FormInput name="email_vendedor" label="E-mail do Vendedor" type="email" />
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
            { name: 'imovel_desocupado', label: 'Imóvel desocupado' },
            { name: 'possui_usufruto', label: 'Possui Usufruto' },
          ].map((fieldData) => (
            <FormField
              key={fieldData.name}
              control={control}
              name={fieldData.name}
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(val) => {
                        field.onChange(val)
                        if (fieldData.name === 'imovel_ocupado' && val) {
                          setValue('imovel_desocupado', false)
                        }
                        if (fieldData.name === 'imovel_desocupado' && val) {
                          setValue('imovel_ocupado', false)
                        }
                      }}
                    />
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
            { label: 'Cobertura', value: 'Cobertura' },
            { label: 'Sala Comercial', value: 'Sala Comercial' },
          ]}
        />
        <FormInput name="matricula_imovel" label="Nº da Matrícula *" />
        <FormInput name="cartorio_imovel" label="Cartório (RGI)" />
        <FormInput name="inscricao_iptu" label="Inscrição Municipal (IPTU)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput name="endereco_imovel" label="Logradouro" />
        <div className="grid grid-cols-3 gap-2">
          <FormInput name="numero_imovel" label="Número" />
          <FormInput name="complemento_imovel" label="Complemento" />
          <FormInput name="cep_imovel" label="CEP" />
        </div>
        <FormInput name="bairro_imovel" label="Bairro" />
        <div className="grid grid-cols-2 gap-2">
          <FormInput name="cidade_imovel" label="Cidade" />
          <FormInput name="estado_imovel" label="UF" />
        </div>
      </div>

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Valores</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormCurrencyInput name="valor_condominio" label="Valor do Condomínio (R$)" />
          <FormCurrencyInput name="valor_iptu_anual" label="Valor do IPTU Anual (R$)" />
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
        <h3 className="font-semibold text-lg border-b pb-2">
          Upload de Documentos (Compliance - Lei 7.433/85)
        </h3>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-4 text-sm">
          A ausência da <strong>Matrícula Atualizada</strong> (com ônus e ações) ou certidões
          exigidas pela Lei 7.433/85 (distribuidor, interdições e tutelas, fiscais) pode gerar
          alertas de risco na auditoria do contrato. Recomenda-se o upload prévio.
        </div>
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

function NegociacaoTab({ tipoDocumento }: { tipoDocumento: string }) {
  const { watch, control, setValue } = useFormContext()
  const total = watch('valor_total')
  const parcelas = watch('havera_parcelas')

  const isAutorizacao = tipoDocumento === 'autorizacao_intermediacao'
  const showValues = !['termo_entrega_chaves', 'termo_posse', 'autorizacao_intermediacao'].includes(
    tipoDocumento,
  )
  const showPosse = !['recibo_sinal', 'autorizacao_intermediacao'].includes(tipoDocumento)
  const showParcelamento = ![
    'recibo_sinal',
    'termo_entrega_chaves',
    'termo_posse',
    'autorizacao_intermediacao',
  ].includes(tipoDocumento)
  const showPenalidades = tipoDocumento !== 'autorizacao_intermediacao'

  useEffect(() => {
    if (!showValues) return
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
    showValues,
  ])

  return (
    <div className="space-y-6 animate-in fade-in">
      {isAutorizacao && (
        <>
          <h3 className="font-semibold text-lg border-b pb-2">Tipo de Gestão</h3>
          <div className="grid grid-cols-1 gap-4 mb-6">
            <FormSelect
              name="gestao_exclusiva"
              label="Exclusividade *"
              options={[
                { label: 'Com Gestão Exclusiva', value: 'com_exclusiva' },
                { label: 'Sem Gestão Exclusiva', value: 'sem_exclusiva' },
              ]}
            />
          </div>
          <h3 className="font-semibold text-lg border-b pb-2">Avaliação e Venda</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormCurrencyInput name="valor_avaliacao" label="Valor de Avaliação (R$)" />
            <FormCurrencyInput name="valor_total" label="Valor de Venda (R$)" />
          </div>
        </>
      )}

      {showValues && (
        <>
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

          <h3 className="font-semibold text-lg border-b pb-2 mt-6">Comissão</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput name="percentual_comissao" label="Percentual (%)" type="number" />
            <FormCurrencyInput name="valor_comissao" label="Valor Fixo da Comissão" />
            <FormSelect
              name="responsavel_comissao"
              label="Responsável Pagamento"
              options={[
                { label: 'Vendedor', value: 'vendedor' },
                { label: 'Comprador', value: 'comprador' },
                { label: 'Ambos', value: 'ambos' },
              ]}
            />
            <FormField
              control={control}
              name="comissao_garantida"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 mt-8">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    Comissão Garantida em Distrato
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </>
      )}

      {showParcelamento && (
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
      )}

      {showPosse && (
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
      )}

      {showPenalidades && (
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Penalidades / Multas</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormInput name="multa_inadimplencia" label="Multa Inadimplência (%)" type="number" />
            <FormCurrencyInput name="multa_desocupacao" label="Multa Atraso Desocupação (Diária)" />
          </div>
        </div>
      )}
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
        <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Conformidade e LGPD
        </h3>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg mb-4 text-sm">
          <strong>Compliance Legal (Lei 7.433/85):</strong> Lembre-se de anexar as certidões
          necessárias na aba "Imóvel" ou certifique-se de realizar a Due Diligence completa antes de
          finalizar. Documentos faltantes podem atrasar a geração e validação da minuta.
        </div>
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
  const activeSteps = WIZARD_STEPS_ALL.filter((s) => {
    if (tipoDocumento === 'checklist_documental') {
      return ['perfil_checklist', 'comprador', 'vendedor', 'imovel', 'compliance'].includes(s.id)
    }
    if (tipoDocumento === 'autorizacao_intermediacao') {
      return ['vendedor', 'imovel', 'negociacao'].includes(s.id)
    }
    if (['ficha_cadastral'].includes(tipoDocumento)) {
      return s.id !== 'negociacao' && s.id !== 'preview' && s.id !== 'perfil_checklist'
    }
    return s.id !== 'preview' && s.id !== 'perfil_checklist'
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
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [currentMinuta, setCurrentMinuta] = useState<string>('')
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo_comprador: 'pf',
      vendedor_pj: false,
      vendedor_uniao_estavel: false,
      comprador_uniao_estavel: false,
      tipo_documento: tipoDocumento,
      status: 'rascunho',
      financiamento_comprador: false,
      possui_financiamento: false,
      fgts_comprador: false,
      posse_imediata: false,
      imovel_inventario: false,
      imovel_locado: false,
      imovel_desocupado: false,
      havera_parcelas: false,
      clausula_lgpd: false,
    } as any,
    mode: 'onChange',
  })

  const isFinanciado =
    form.watch('financiamento_comprador') ||
    form.watch('possui_financiamento') ||
    form.watch('tipo_negociacao' as any) === 'financiamento'
  const valorFinanciamentoWatch = form.watch('valor_financiamento')

  useEffect(() => {
    if (!isFinanciado) {
      form.clearErrors('valor_financiamento')
    } else if (parseCurrencySafe(valorFinanciamentoWatch) > 0) {
      form.clearErrors('valor_financiamento')
    }
  }, [isFinanciado, valorFinanciamentoWatch, form])

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
      email_comprador: 'joao.batista@email.com',
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
      email_vendedor: 'carlos.eduardo@email.com',
      cpf_vendedor: '111.222.333-44',
      rg_vendedor: '11.222.333-4',
      estado_civil_vendedor: 'Divorciado',
      vendedor_uniao_estavel: false,
      comprador_uniao_estavel: false,

      imovel_inventario: false,
      imovel_locado: false,
      imovel_financiado: false,
      imovel_ocupado: false,
      imovel_desocupado: true,
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

      valor_condominio: formatCurrency(1200),
      valor_iptu_anual: formatCurrency(3500),
      valor_avaliacao: formatCurrency(550000),

      valor_total: formatCurrency(500000),
      valor_sinal: formatCurrency(50000),
      valor_fgts: formatCurrency(100000),
      valor_financiamento: formatCurrency(500000 * 0.7), // 70% do valor total
      valor_recursos_proprios: formatCurrency(0),
      havera_parcelas: false,

      percentual_comissao: 5,
      valor_comissao: formatCurrency(0),
      responsavel_comissao: 'vendedor',
      comissao_garantida: true,

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
    const stepId = currentStepData.id

    if (stepId === 'perfil_checklist') {
      if (form.getValues('comprador_uniao_estavel') && !form.getValues('regime_bens_comprador')) {
        toast.error('Informe o regime de bens do comprador para a União Estável.')
        isValid = false
      } else {
        isValid = true
      }
    } else if (stepId === 'comprador') {
      isValid = await form.trigger(['nome_comprador'])
      const estC = form.getValues('estado_civil_comprador')
      if (estC === 'Casado' || estC === 'Casada') {
        if (!form.getValues('nome_conjuge_comprador')) {
          if (tipoDocumento !== 'checklist_documental') {
            toast.error('Informe o nome do cônjuge do comprador.')
            isValid = false
          } else {
            isValid = true
          }
        }
      }
    } else if (stepId === 'vendedor') {
      isValid = await form.trigger(['nome_vendedor'])
      const estV = form.getValues('estado_civil_vendedor')
      if ((estV === 'Casado' || estV === 'Casada') && !form.getValues('conjuge_vendedor')) {
        if (tipoDocumento !== 'checklist_documental') {
          toast.error('Informe o nome do cônjuge do vendedor (Compliance exigido).')
          isValid = false
        } else {
          isValid = true
        }
      }
    } else if (stepId === 'imovel') {
      const mat = form.getValues('matricula_imovel')
      if (!mat && !['ficha_cadastral', 'checklist_documental'].includes(tipoDocumento)) {
        toast.error('O número da Matrícula é obrigatório para este documento.')
        isValid = false
      } else {
        isValid = true
      }
    } else if (stepId === 'negociacao') {
      isValid = await form.trigger([
        'valor_sinal',
        'valor_fgts',
        'valor_financiamento',
        'valor_recursos_proprios',
        'havera_parcelas',
        'gestao_exclusiva',
      ])

      const isFinanciadoVal =
        form.getValues('financiamento_comprador') ||
        form.getValues('possui_financiamento') ||
        (form.getValues() as any).tipo_negociacao === 'financiamento'
      const valorFinanciamentoStr = form.getValues('valor_financiamento')
      const valorFinanciamentoVal = parseCurrencySafe(valorFinanciamentoStr)

      if (
        isFinanciadoVal &&
        valorFinanciamentoVal <= 0 &&
        !['ficha_cadastral', 'checklist_documental', 'autorizacao_intermediacao'].includes(
          tipoDocumento,
        )
      ) {
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
      } else {
        form.clearErrors('valor_financiamento')
      }
    }

    if (!isValid) return

    try {
      const rawValues = form.getValues()
      const parsed = contractSchema.safeParse(rawValues)
      const dataToSave = parsed.success ? parsed.data : rawValues

      const record = await saveContractDraft(dataToSave, draftId)
      setDraftId(record.id)
    } catch (err) {
      console.error('Failed to autosave draft:', err)
    }

    setCurrentStepIndex((s) => s + 1)
  }

  const validateFormAndGetPayload = async () => {
    const valid = await form.trigger()

    const rawValues = form.getValues()
    const parsedResult = contractSchema.safeParse(rawValues)
    const values = parsedResult.success ? parsedResult.data : rawValues

    const isFinanciado =
      values.financiamento_comprador ||
      values.possui_financiamento ||
      (values as any).tipo_negociacao === 'financiamento'
    const valorFinanciamento = parseCurrencySafe(values.valor_financiamento)
    let customValid = true

    if (
      isFinanciado &&
      valorFinanciamento <= 0 &&
      !['ficha_cadastral', 'checklist_documental', 'autorizacao_intermediacao'].includes(
        tipoDocumento,
      )
    ) {
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
      const negIndex = activeSteps.findIndex((s) => s.id === 'negociacao')
      if (negIndex !== -1) setCurrentStepIndex(negIndex)
      setTimeout(() => {
        const el = document.querySelector('[name="valor_financiamento"]') as HTMLElement
        if (el) {
          el.focus()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      customValid = false
    } else {
      form.clearErrors('valor_financiamento')
    }

    if (!valid || !customValid) {
      toast.error('Preencha todos os campos obrigatórios.')
      return null
    }

    const lgpd = values.clausula_lgpd
    if (!lgpd) {
      toast.error('O consentimento da LGPD é obrigatório.')
      return null
    }

    if (tipoDocumento === 'autorizacao_intermediacao' && !values.gestao_exclusiva) {
      toast.error('O tipo de gestão (Exclusividade) é obrigatório.')
      return null
    }

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
          desocupado: values.imovel_desocupado,
          ocupado: values.imovel_ocupado,
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

    let instrucoes_checklist = ''
    if (tipoDocumento === 'checklist_documental') {
      instrucoes_checklist =
        "INSTRUÇÕES OBRIGATÓRIAS PARA O CHECKLIST:\n- Formatar como uma lista clara e estruturada.\n- INCLUIR OBRIGATORIAMENTE: Certidão do Funesbom (Corpo de Bombeiros), Certidão do 2º Ofício de Distribuidor, Certidão de Interdições e Tutelas.\n- INCLUIR UMA SEÇÃO DE: 'Informações Bancárias Detalhadas'.\n"
      if (values.vendedor_pj) {
        instrucoes_checklist +=
          '- EXIGIR: CNPJ, Contrato Social/Estatuto, Últimas Alterações Contratuais (Vendedor PJ).\n'
      }
      if (values.vendedor_uniao_estavel || values.comprador_uniao_estavel) {
        instrucoes_checklist +=
          '- EXIGIR: RG, CPF e Comprovante de Residência do(a) companheiro(a) devido à União Estável.\n'
      }
      ;(jsonMestre as any).instrucoes_checklist = instrucoes_checklist
    }

    const payloadForAi = { ...values, json_mestre: jsonMestre } as any
    delete payloadForAi.matricula_file
    delete payloadForAi.iptu_file

    return { payloadForAi, values }
  }

  const handlePreviewBeforeGenerate = async () => {
    const data = await validateFormAndGetPayload()
    if (!data) return

    setIsPreviewing(true)
    setPreviewError(null)
    setPreviewModalOpen(true)

    try {
      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(data.payloadForAi),
      })

      if (!res?.minuta_texto) {
        throw new Error(
          'O contrato não retornou um texto válido. Verifique os dados e tente novamente.',
        )
      }

      let text = res.minuta_texto
      text = text.replace(/<p[^>]*>\s*Assessoria Jurídica Imobiliária\s*<\/p>/gi, '')
      text = text.replace(/Assessoria Jurídica Imobiliária/gi, '')
      if (tipoDocumento === 'autorizacao_intermediacao') {
        text = text.replace(/<p[^>]*>\s*MINUTA DE CONTRATO\s*<\/p>/gi, '')
        text = text.replace(/MINUTA DE CONTRATO/gi, '')
      }

      setCurrentMinuta(text)

      const record = await saveContractDraft(
        { ...data.values, used_clauses: res?.used_clauses, status: 'rascunho' },
        draftId,
        text,
      )
      setDraftId(record.id)

      const replaceBrandingPlaceholders = (txt?: string) => {
        if (!txt || !user) return ''
        return txt
          .replace(/{{imobiliaria_nome}}/g, user.imobiliaria_nome || '')
          .replace(/{{creci}}/g, user.creci || '')
          .replace(/{{imobiliaria_documento}}/g, user.imobiliaria_documento || '')
      }

      const url = await getMinutaPDFBlobUrl(text, {
        ...user,
        header_content: replaceBrandingPlaceholders(user?.header_content),
        footer_content: replaceBrandingPlaceholders(user?.footer_content),
        tipo_documento: tipoDocumento,
      })

      if (!url) {
        throw new Error('Falha ao renderizar o PDF (Blob URL inválida).')
      }

      setPreviewPdfUrl(url)
    } catch (err) {
      console.error(err)
      setPreviewError(
        getErrorMessage(err) || 'Ocorreu um erro ao processar a prévia. Tente novamente.',
      )
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleDownloadPreviewPDF = async () => {
    if (!currentMinuta) return
    try {
      const replaceBrandingPlaceholders = (txt?: string) => {
        if (!txt || !user) return ''
        return txt
          .replace(/{{imobiliaria_nome}}/g, user.imobiliaria_nome || '')
          .replace(/{{creci}}/g, user.creci || '')
          .replace(/{{imobiliaria_documento}}/g, user.imobiliaria_documento || '')
      }

      await generateMinutaPDF(currentMinuta, `Contrato_Previa`, {
        ...user,
        header_content: replaceBrandingPlaceholders(user?.header_content),
        footer_content: replaceBrandingPlaceholders(user?.footer_content),
        tipo_documento: tipoDocumento,
      })
      toast.success('PDF baixado com sucesso!')
    } catch (error) {
      toast.error('Erro ao gerar PDF.')
    }
  }

  const initiateGeneration = async () => {
    const data = await validateFormAndGetPayload()
    if (!data) return

    const { payloadForAi, values } = data

    setIsGenerating(true)
    try {
      const res = await pb.send('/backend/v1/assemble-contract', {
        method: 'POST',
        body: JSON.stringify(payloadForAi),
      })

      let text = res?.minuta_texto || ''
      text = text.replace(/<p[^>]*>\s*Assessoria Jurídica Imobiliária\s*<\/p>/gi, '')
      text = text.replace(/Assessoria Jurídica Imobiliária/gi, '')

      await saveContractDraft(
        { ...values, used_clauses: res?.used_clauses, status: 'finalizado' },
        draftId,
        text,
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
          <Button
            onClick={() => navigate('/contratos')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg"
          >
            Acessar Meus Contratos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in relative">
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl min-h-[500px]">
          <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-800">
            Gerando minuta... Isso pode levar alguns segundos
          </h2>
          <p className="text-slate-600 mt-2 text-lg">Por favor, aguarde.</p>
        </div>
      )}
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
        {activeSteps.map((s, idx) => (
          <div
            key={s.id}
            className={cn(
              'flex flex-col items-center bg-transparent',
              idx <= currentStepIndex ? 'text-primary' : 'text-slate-400',
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 border-2',
                idx === currentStepIndex
                  ? 'bg-primary text-primary-foreground border-secondary shadow-md ring-4 ring-primary/10'
                  : idx < currentStepIndex
                    ? 'bg-secondary text-secondary-foreground border-secondary shadow-sm'
                    : 'bg-white text-slate-400 border-slate-200',
              )}
            >
              {idx < currentStepIndex ? <CheckCircle2 className="w-5 h-5 text-primary" /> : idx + 1}
            </div>
            <span
              className={cn(
                'text-[10px] sm:text-xs font-bold text-center w-16 sm:w-auto',
                idx === currentStepIndex ? 'text-primary' : '',
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
              {currentStepData.id === 'perfil_checklist' && <PerfilChecklistTab />}
              {currentStepData.id === 'comprador' && <CompradorTab />}
              {currentStepData.id === 'vendedor' && <VendedorTab />}
              {currentStepData.id === 'imovel' && <ImovelTab />}
              {currentStepData.id === 'negociacao' && (
                <NegociacaoTab tipoDocumento={tipoDocumento} />
              )}
              {currentStepData.id === 'compliance' && <ComplianceTab />}
              {currentStepData.id === 'preview' && <PreviewTab user={user} />}

              <div className="flex justify-between pt-8 mt-8 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStepIndex((s) => s - 1)}
                  disabled={currentStepIndex === 0 || isGenerating}
                  className={currentStepIndex === 0 ? 'invisible' : ''}
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Anterior
                </Button>
                {currentStepIndex < activeSteps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isGenerating}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Próximo <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviewBeforeGenerate}
                      disabled={isGenerating || isPreviewing}
                      className="border-primary text-primary hover:bg-primary/5 min-w-[150px] font-semibold shadow-sm"
                    >
                      {isPreviewing ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin text-primary" />
                          <span className="text-primary">Carregando...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 w-5 h-5 text-primary" />
                          <span className="text-primary">Visualização Prévia</span>
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={initiateGeneration}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-w-[200px] font-bold shadow-lg"
                      disabled={isGenerating || isPreviewing}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 w-5 h-5 animate-spin text-primary" />
                          <span className="text-primary">Processando IA...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 w-5 h-5 text-primary" />
                          <span className="text-primary">Validar e Gerar Contrato</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <PreviewPDFModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        pdfUrl={previewPdfUrl}
        content={currentMinuta}
        loading={isPreviewing}
        onDownload={handleDownloadPreviewPDF}
        error={previewError}
      />
    </div>
  )
}
