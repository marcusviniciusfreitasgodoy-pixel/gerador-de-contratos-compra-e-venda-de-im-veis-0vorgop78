import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

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
  const { control } = useFormContext()
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Valores e Pagamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="valor_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total do Imóvel</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="valor_sinal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor do Sinal (Arras)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="comissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor da Comissão</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === 'a_vista' && (
          <>
            <FormField
              control={control}
              name="valor_saldo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor do Saldo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="data_pagamento_saldo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento do Saldo</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function FinancingBlock() {
  const { control } = useFormContext()
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <h3 className="font-semibold text-lg text-slate-800">Condições de Financiamento</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="valor_reforco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reforço de Sinal (Opcional)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="valor_complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento (Recursos Próprios)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="valor_financiado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor a ser Financiado</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} placeholder="R$ 0,00" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="instituicao_financeira"
          render={({ field }) => (
            <FormItem className="sm:col-span-2">
              <FormLabel>Instituição Financeira (Banco)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
