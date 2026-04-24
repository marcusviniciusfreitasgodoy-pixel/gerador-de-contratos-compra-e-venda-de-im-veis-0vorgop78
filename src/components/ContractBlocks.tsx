import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { FormInput } from './FormInput'
import { formatCurrency } from '@/lib/formatters'

export function PersonBlock({
  suffix,
  title,
}: {
  suffix: '_vendedor' | '_comprador'
  title: string
}) {
  const { control } = useFormContext()
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name={`nome${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`cpf${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="000.000.000-00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`rg${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`orgao_emissor${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Órgão Emissor</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`nacionalidade${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nacionalidade</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`estado_civil${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Civil</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`profissao${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`endereco${suffix}`}
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`email${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`telefone${suffix}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="(00) 00000-0000" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export function PropertyBlock() {
  const { control } = useFormContext()
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Dados do Imóvel</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="endereco_imovel"
          render={({ field }) => (
            <FormItem className="sm:col-span-2 lg:col-span-3">
              <FormLabel>Endereço do Imóvel</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="matricula_imovel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rgi_imovel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RGI (Cartório)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="inscricao_municipal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inscrição Municipal (IPTU)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="area_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Área Total (m²)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} type="number" step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="vagas_garagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vagas de Garagem</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

export function FinancialBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Valores e Pagamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput
          name="valor_total"
          label="Valor Total do Imóvel"
          placeholder="R$ 0,00"
          mask={formatCurrency}
        />
        <FormInput
          name="valor_sinal"
          label="Valor do Sinal (Arras)"
          placeholder="R$ 0,00"
          mask={formatCurrency}
        />
        <FormInput
          name="comissao"
          label="Valor da Comissão"
          placeholder="R$ 0,00"
          mask={formatCurrency}
        />
        {type === 'a_vista' && (
          <>
            <FormInput
              name="valor_saldo"
              label="Valor do Saldo"
              placeholder="R$ 0,00"
              mask={formatCurrency}
            />
            <FormInput name="data_pagamento_saldo" label="Data de Pagamento do Saldo" type="date" />
          </>
        )}
      </div>
    </div>
  )
}

export function FinancingBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Condições de Financiamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput
          name="valor_reforco"
          label="Reforço de Sinal (Opcional)"
          placeholder="R$ 0,00"
          mask={formatCurrency}
        />
        <FormInput
          name="valor_complemento"
          label="Complemento (Recursos Próprios)"
          placeholder="R$ 0,00"
          mask={formatCurrency}
        />
        {type === 'financiado' && (
          <>
            <FormInput
              name="valor_financiado"
              label="Valor a ser Financiado"
              placeholder="R$ 0,00"
              mask={formatCurrency}
            />
            <FormInput name="instituicao_financeira" label="Instituição Financeira (Banco)" />
          </>
        )}
      </div>
    </div>
  )
}
