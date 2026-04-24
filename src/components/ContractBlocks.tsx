import { FormInput } from './FormInput'
import { formatCPF, formatPhone, formatCurrency, formatNumber } from '@/lib/formatters'

export function PersonBlock({
  suffix,
  title,
}: {
  suffix: '_vendedor' | '_comprador'
  title: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput name={`nome${suffix}`} label="Nome Completo" required />
        <FormInput name={`cpf${suffix}`} label="CPF" required mask={formatCPF} />
        <FormInput name={`rg${suffix}`} label="RG" required />
        <FormInput name={`orgao_emissor${suffix}`} label="Órgão Emissor" required />
        <FormInput name={`nacionalidade${suffix}`} label="Nacionalidade" required />
        <FormInput
          name={`estado_civil${suffix}`}
          label="Estado Civil"
          required
          options={[
            { label: 'Solteiro(a)', value: 'solteiro' },
            { label: 'Casado(a)', value: 'casado' },
            { label: 'Divorciado(a)', value: 'divorciado' },
            { label: 'Viúvo(a)', value: 'viuvo' },
          ]}
        />
        <FormInput name={`profissao${suffix}`} label="Profissão" required />
        <FormInput name={`telefone${suffix}`} label="Telefone" required mask={formatPhone} />
        <div className="md:col-span-2">
          <FormInput name={`email${suffix}`} label="E-mail" required type="email" />
        </div>
        <div className="md:col-span-2">
          <FormInput name={`endereco${suffix}`} label="Endereço Completo" required />
        </div>
      </div>
    </div>
  )
}

export function PropertyBlock() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput name="endereco_imovel" label="Endereço do Imóvel" required />
        </div>
        <FormInput name="matricula_imovel" label="Matrícula" required />
        <FormInput name="rgi_imovel" label="RGI" required />
        <FormInput name="inscricao_municipal" label="Inscrição Municipal (IPTU)" required />
        <FormInput name="area_total" label="Área Total (m²)" required mask={formatNumber} />
        <FormInput name="vagas_garagem" label="Vagas de Garagem" required mask={formatNumber} />
      </div>
    </div>
  )
}

export function FinancialBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Dados Financeiros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput name="valor_total" label="Valor Total (R$)" required mask={formatCurrency} />
        <FormInput name="valor_sinal" label="Valor do Sinal (R$)" required mask={formatCurrency} />
        <FormInput name="comissao" label="Comissão (%) ou (R$)" required mask={formatCurrency} />

        {type === 'a_vista' && (
          <>
            <FormInput name="valor_saldo" label="Valor do Saldo (R$)" mask={formatCurrency} />
            <FormInput name="data_pagamento_saldo" label="Data Pagamento Saldo" type="date" />
          </>
        )}

        {type === 'financiado' && (
          <>
            <FormInput name="valor_reforco" label="Valor do Reforço (R$)" mask={formatCurrency} />
            <FormInput
              name="valor_complemento"
              label="Valor do Complemento (R$)"
              mask={formatCurrency}
            />
            <FormInput
              name="valor_financiado"
              label="Valor Financiado (R$)"
              mask={formatCurrency}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function FinancingBlock() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <h3 className="text-xl font-bold text-slate-800">Detalhes do Financiamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput name="instituicao_financeira" label="Instituição Financeira" />
        <FormInput name="taxa_juros" label="Taxa de Juros (%)" mask={formatNumber} />
        <FormInput name="prazo_meses" label="Prazo (meses)" mask={formatNumber} />
        <FormInput name="data_liberacao_credito" label="Previsão Liberação Crédito" type="date" />
      </div>
    </div>
  )
}
