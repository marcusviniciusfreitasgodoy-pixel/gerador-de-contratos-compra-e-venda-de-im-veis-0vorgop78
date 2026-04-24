import { FormInput } from './FormInput'
import { formatCPF, formatPhone, formatCurrency } from '@/lib/formatters'

export function PersonBlock({
  suffix,
  title,
}: {
  suffix: '_vendedor' | '_comprador'
  title: string
}) {
  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput name={`nome${suffix}`} label="Nome Completo" required />
        <FormInput name={`cpf${suffix}`} label="CPF" mask={formatCPF} required />
        <FormInput name={`rg${suffix}`} label="RG" required />
        <FormInput name={`orgao_emissor${suffix}`} label="Órgão Emissor" required />
        <FormInput name={`nacionalidade${suffix}`} label="Nacionalidade" required />
        <FormInput name={`estado_civil${suffix}`} label="Estado Civil" required />
        <FormInput name={`profissao${suffix}`} label="Profissão" required />
        <FormInput name={`endereco${suffix}`} label="Endereço" required />
        <FormInput name={`email${suffix}`} label="Email" type="email" required />
        <FormInput name={`telefone${suffix}`} label="Telefone" mask={formatPhone} required />
      </div>
    </div>
  )
}

export function PropertyBlock() {
  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput name="endereco_imovel" label="Endereço do Imóvel" required />
        <FormInput name="matricula_imovel" label="Matrícula" required />
        <FormInput name="rgi_imovel" label="RGI" required />
        <FormInput name="inscricao_municipal" label="Inscrição Municipal" required />
        <FormInput name="area_total" label="Área Total (m²)" type="number" step="0.01" required />
        <FormInput name="vagas_garagem" label="Vagas de Garagem" type="number" required />
      </div>
    </div>
  )
}

export function FinancialBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Dados Financeiros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="valor_total"
          label="Valor Total"
          mask={formatCurrency}
          placeholder="R$ 0,00"
          required
        />
        <FormInput
          name="valor_sinal"
          label="Valor do Sinal"
          mask={formatCurrency}
          placeholder="R$ 0,00"
          required
        />
        <FormInput
          name="comissao"
          label="Comissão"
          mask={formatCurrency}
          placeholder="R$ 0,00"
          required
        />
        {type === 'a_vista' && (
          <>
            <FormInput
              name="valor_saldo"
              label="Valor do Saldo"
              mask={formatCurrency}
              placeholder="R$ 0,00"
              required
            />
            <FormInput
              name="data_pagamento_saldo"
              label="Data Pagamento Saldo"
              type="date"
              required
            />
          </>
        )}
      </div>
    </div>
  )
}

export function FinancingBlock() {
  return (
    <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 border-b pb-2">Detalhes de Financiamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput
          name="valor_reforco"
          label="Valor de Reforço"
          mask={formatCurrency}
          placeholder="R$ 0,00"
        />
        <FormInput
          name="valor_complemento"
          label="Valor de Complemento"
          mask={formatCurrency}
          placeholder="R$ 0,00"
        />
        <FormInput
          name="valor_financiado"
          label="Valor Financiado"
          mask={formatCurrency}
          placeholder="R$ 0,00"
          required
        />
        <FormInput name="instituicao_financeira" label="Instituição Financeira" />
      </div>
    </div>
  )
}
