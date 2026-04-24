import { FormInput, FormCurrencyInput } from './FormInput'

export function PersonBlock({
  suffix,
  title,
}: {
  suffix: '_vendedor' | '_comprador'
  title: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput name={`nome${suffix}`} label="Nome Completo" placeholder="Ex: João da Silva" />
        <FormInput name={`cpf${suffix}`} label="CPF" placeholder="000.000.000-00" />
        <FormInput name={`rg${suffix}`} label="RG" placeholder="MG-12.345.678" />
        <FormInput name={`orgao_emissor${suffix}`} label="Órgão Emissor" placeholder="SSP/MG" />
        <FormInput name={`nacionalidade${suffix}`} label="Nacionalidade" placeholder="Brasileiro" />
        <FormInput name={`estado_civil${suffix}`} label="Estado Civil" placeholder="Casado" />
        <FormInput name={`profissao${suffix}`} label="Profissão" placeholder="Engenheiro" />
        <FormInput name={`endereco${suffix}`} label="Endereço" placeholder="Rua..." />
        <FormInput name={`email${suffix}`} label="E-mail" placeholder="email@exemplo.com" />
        <FormInput name={`telefone${suffix}`} label="Telefone" placeholder="(00) 00000-0000" />
      </div>
    </div>
  )
}

export function PropertyBlock() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput name="endereco_imovel" label="Endereço do Imóvel" placeholder="Rua..." />
        <FormInput name="matricula_imovel" label="Matrícula" placeholder="Ex: 12345" />
        <FormInput name="rgi_imovel" label="RGI" placeholder="Ex: 1º Ofício" />
        <FormInput
          name="inscricao_municipal"
          label="Inscrição Municipal (IPTU)"
          placeholder="000.000.000"
        />
        <FormInput name="area_total" label="Área Total (m²)" placeholder="Ex: 100" />
        <FormInput name="vagas_garagem" label="Vagas de Garagem" placeholder="Ex: 2" />
      </div>
    </div>
  )
}

export function FinancialBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Valores e Pagamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormCurrencyInput name="valor_total" label="Valor Total" placeholder="R$ 0,00" />
        <FormCurrencyInput name="valor_sinal" label="Sinal (Arras)" placeholder="R$ 0,00" />
        <FormCurrencyInput
          name="valor_reforco"
          label="Reforço de Sinal (Opcional)"
          placeholder="R$ 0,00"
        />
        <FormCurrencyInput
          name="valor_complemento"
          label="Complemento (Opcional)"
          placeholder="R$ 0,00"
        />

        {type === 'a_vista' && (
          <FormCurrencyInput name="valor_saldo" label="Saldo Remanescente" placeholder="R$ 0,00" />
        )}

        {type === 'a_vista' && (
          <FormInput name="data_pagamento_saldo" label="Data de Pagamento do Saldo" type="date" />
        )}

        <FormCurrencyInput name="comissao" label="Valor da Comissão" placeholder="R$ 0,00" />
      </div>
    </div>
  )
}

export function FinancingBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  if (type === 'a_vista') return null

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Condições de Financiamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormCurrencyInput name="valor_financiado" label="Valor Financiado" placeholder="R$ 0,00" />
        <FormInput
          name="instituicao_financeira"
          label="Instituição Financeira"
          placeholder="Ex: Caixa Econômica Federal"
        />
        <FormInput name="taxa_juros" label="Taxa de Juros (%)" placeholder="Ex: 8.5" />
        <FormInput name="prazo_meses" label="Prazo (meses)" placeholder="Ex: 360" />
      </div>
    </div>
  )
}
