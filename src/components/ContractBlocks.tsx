import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const formatCurrency = (value: string) => {
  if (!value) return ''
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''
  const amount = (Number(numbers) / 100).toFixed(2)
  const [integers, decimals] = amount.split('.')
  const formattedIntegers = integers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `R$ ${formattedIntegers},${decimals}`
}

const applyMask = (value: string, mask: string) => {
  let i = 0
  const v = value.replace(/\D/g, '')
  return mask.replace(/#/g, () => v[i++] || '').replace(/([^#0-9])+$/g, '')
}

const maskCPF = (v: string) => applyMask(v, '###.###.###-##')
const maskPhone = (v: string) => {
  const n = v.replace(/\D/g, '')
  return applyMask(n, n.length <= 10 ? '(##) ####-####' : '(##) #####-####')
}

export function PersonBlock({
  suffix,
  title,
}: {
  suffix: '_vendedor' | '_comprador'
  title: string
}) {
  const { control } = useFormContext()
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
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
                <Input
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(maskCPF(e.target.value))}
                  maxLength={14}
                />
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
            <FormItem className="md:col-span-2">
              <FormLabel>Endereço</FormLabel>
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} value={field.value || ''} />
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
                <Input
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                  maxLength={15}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

export function PropertyBlock() {
  const { control } = useFormContext()
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Dados do Imóvel</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
        <FormField
          control={control}
          name="endereco_imovel"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
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
              <FormLabel>RGI</FormLabel>
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
              <FormLabel>Inscrição Municipal</FormLabel>
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
              <FormLabel>Área Total</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
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
                <Input type="number" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}

export function FinancialBlock({ type }: { type: 'a_vista' | 'financiado' }) {
  const { control } = useFormContext()

  const handleCurrency =
    (onChange: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(formatCurrency(e.target.value))
    }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Dados Financeiros</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
        <FormField
          control={control}
          name="valor_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Total</FormLabel>
              <FormControl>
                <Input
                  placeholder="R$ 0,00"
                  {...field}
                  value={field.value || ''}
                  onChange={handleCurrency(field.onChange)}
                />
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
              <FormLabel>Valor do Sinal</FormLabel>
              <FormControl>
                <Input
                  placeholder="R$ 0,00"
                  {...field}
                  value={field.value || ''}
                  onChange={handleCurrency(field.onChange)}
                />
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
              <FormLabel>Comissão</FormLabel>
              <FormControl>
                <Input
                  placeholder="R$ 0,00"
                  {...field}
                  value={field.value || ''}
                  onChange={handleCurrency(field.onChange)}
                />
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
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      value={field.value || ''}
                      onChange={handleCurrency(field.onChange)}
                    />
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
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === 'financiado' && (
          <>
            <FormField
              control={control}
              name="valor_reforco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor de Reforço de Sinal</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      value={field.value || ''}
                      onChange={handleCurrency(field.onChange)}
                    />
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
                  <FormLabel>Valor de Complemento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="R$ 0,00"
                      {...field}
                      value={field.value || ''}
                      onChange={handleCurrency(field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function FinancingBlock() {
  const { control } = useFormContext()

  const handleCurrency =
    (onChange: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(formatCurrency(e.target.value))
    }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Detalhes de Financiamento</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-6">
        <FormField
          control={control}
          name="valor_financiado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Financiado</FormLabel>
              <FormControl>
                <Input
                  placeholder="R$ 0,00"
                  {...field}
                  value={field.value || ''}
                  onChange={handleCurrency(field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="instituicao_financeira"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instituição Financeira</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
