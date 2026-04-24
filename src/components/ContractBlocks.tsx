import { FormInput } from '@/components/FormInput'
import { formatCPF, formatPhone, formatNumber, formatCurrency } from '@/lib/formatters'

const MARITAL_STATUS = [
  { label: 'Solteiro(a)', value: 'solteiro' },
  { label: 'Casado(a)', value: 'casado' },
  { label: 'Divorciado(a)', value: 'divorciado' },
  { label: 'Viúvo(a)', value: 'viuvo' },
]

const NATIONALITIES = [
  { label: 'Brasileiro(a)', value: 'brasileiro' },
  { label: 'Estrangeiro(a)', value: 'estrangeiro' },
]

export function PersonBlock({ prefix, title }: { prefix: string; title: string }) {
  return (
    <div className="space-y-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput name={`${prefix}.name`} label="Nome Completo" required />
        <FormInput name={`${prefix}.cpf`} label="CPF" required mask={formatCPF} />
        <FormInput name={`${prefix}.rg`} label="RG" required />
        <FormInput name={`${prefix}.issuing_body`} label="Órgão Emissor" required />
        <FormInput
          name={`${prefix}.nationality`}
          label="Nacionalidade"
          required
          options={NATIONALITIES}
        />
        <FormInput
          name={`${prefix}.marital_status`}
          label="Estado Civil"
          required
          options={MARITAL_STATUS}
        />
        <FormInput name={`${prefix}.profession`} label="Profissão" required />
        <FormInput name={`${prefix}.email`} label="E-mail" type="email" required />
        <FormInput name={`${prefix}.phone`} label="Telefone" required mask={formatPhone} />
      </div>
      <FormInput name={`${prefix}.address`} label="Endereço Completo" required />
    </div>
  )
}

export function PropertyBlock() {
  return (
    <div className="space-y-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-slate-800">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput name="property_data.registration" label="Matrícula" required />
        <FormInput name="property_data.rgi" label="RGI" required />
        <FormInput name="property_data.municipal_id" label="Inscrição Municipal" required />
        <FormInput name="property_data.area" label="Área Total (m²)" required mask={formatNumber} />
        <FormInput
          name="property_data.garage"
          label="Vagas de Garagem"
          required
          mask={formatNumber}
        />
      </div>
      <FormInput name="property_data.address" label="Endereço Completo do Imóvel" required />
    </div>
  )
}

export function FinancialBlock({ type }: { type: 'A_VISTA' | 'FINANCIADO' }) {
  return (
    <div className="space-y-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-slate-800">Valores e Pagamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="financial_data.total_value"
          label="Valor Total"
          required
          mask={formatCurrency}
        />
        <FormInput
          name="financial_data.signal_value"
          label="Valor do Sinal"
          required
          mask={formatCurrency}
        />
        <FormInput
          name="financial_data.commission"
          label="Comissão"
          required
          mask={formatCurrency}
        />

        {type === 'A_VISTA' && (
          <>
            <FormInput
              name="financial_data.balance_value"
              label="Valor do Saldo"
              required
              mask={formatCurrency}
            />
            <FormInput
              name="financial_data.balance_date"
              label="Data de Pagamento do Saldo"
              type="date"
              required
            />
          </>
        )}

        {type === 'FINANCIADO' && (
          <>
            <FormInput
              name="financial_data.reinforcement"
              label="Valor de Reforço (Opcional)"
              mask={formatCurrency}
            />
            <FormInput
              name="financial_data.complement"
              label="Valor de Complemento (Opcional)"
              mask={formatCurrency}
            />
            <FormInput
              name="financial_data.financed_amount"
              label="Valor Financiado"
              required
              mask={formatCurrency}
            />
          </>
        )}
      </div>
    </div>
  )
}

const INSTITUTIONS = [
  { label: 'Caixa Econômica', value: 'caixa' },
  { label: 'Itaú', value: 'itau' },
  { label: 'Santander', value: 'santander' },
  { label: 'Bradesco', value: 'bradesco' },
  { label: 'Outro', value: 'outro' },
]

export function FinancingBlock() {
  return (
    <div className="space-y-6 p-8 border border-slate-200 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
      <h3 className="text-xl font-bold text-slate-800">Detalhes do Financiamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="financing_details.institution"
          label="Instituição Financeira"
          required
          options={INSTITUTIONS}
        />
        <FormInput
          name="financing_details.interest_rate"
          label="Taxa de Juros (%) a.a."
          required
          type="number"
          step="0.01"
        />
        <FormInput name="financing_details.term" label="Prazo (meses)" required type="number" />
        <FormInput
          name="financing_details.release_date"
          label="Data Prevista de Liberação"
          type="date"
          required
        />
      </div>
    </div>
  )
}
