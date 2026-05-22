import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSelect } from '@/components/FormInput'
import { PLATAFORMA_OPTIONS } from '@/lib/constants'

export function JuridicoTab({ tipoDocumento }: { tipoDocumento: string }) {
  const {
    control,
    formState: { errors },
  } = useFormContext()
  const isAutorizacao = tipoDocumento === 'autorizacao_intermediacao'

  return (
    <div className="space-y-6 animate-in fade-in">
      <h3 className="font-semibold text-lg border-b pb-2 text-[#0C2340]">
        Termos Legais e Específicos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          name="tipo_negociacao"
          label="Tipo de Negociação"
          options={[
            { label: 'À Vista', value: 'a_vista' },
            { label: 'Financiamento', value: 'financiamento' },
            { label: 'Investidor', value: 'investidor' },
            { label: 'Alto Padrão', value: 'alto_padrao' },
            { label: 'Permuta', value: 'permuta' },
          ]}
        />

        {isAutorizacao && (
          <FormSelect
            name="gestao_exclusiva"
            label="Gestão Exclusiva *"
            options={[
              { label: 'Com Exclusividade', value: 'com_exclusiva' },
              { label: 'Sem Exclusividade', value: 'sem_exclusiva' },
            ]}
          />
        )}
      </div>

      {!isAutorizacao && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="clausula_arrependimento"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  Incluir Cláusula de Arrependimento
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="posse_imediata"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 border p-3 rounded-md">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">Posse Imediata na Assinatura</FormLabel>
              </FormItem>
            )}
          />
        </div>
      )}

      {!isAutorizacao && (
        <div className="pt-4 border-t space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2 text-[#0C2340]">
            Assinatura e Resolução de Conflitos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField
              control={control}
              name="assinatura_eletronica"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 mt-8">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">Assinatura Eletrônica</FormLabel>
                </FormItem>
              )}
            />
            <FormSelect
              name="plataforma_assinatura"
              label="Plataforma de Assinatura"
              options={PLATAFORMA_OPTIONS}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
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
      )}

      <div className="pt-4 border-t space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2 text-[#0C2340]">Compliance</h3>
        <FormField
          control={control}
          name="clausula_lgpd"
          render={({ field }) => (
            <FormItem
              className={`flex items-center space-x-2 p-4 rounded-lg border ${errors.clausula_lgpd ? 'bg-red-50 border-red-500' : 'bg-emerald-50 border-emerald-200'}`}
            >
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={`data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white ${errors.clausula_lgpd ? 'border-red-500' : ''}`}
                />
              </FormControl>
              <div className="flex flex-col space-y-1 !mt-0">
                <FormLabel
                  className={`cursor-pointer font-medium leading-tight ${errors.clausula_lgpd ? 'text-red-700' : 'text-emerald-900'}`}
                >
                  Consentimento LGPD (Obrigatório)
                </FormLabel>
                {errors.clausula_lgpd && (
                  <p className="text-[0.8rem] font-medium text-red-500">
                    {errors.clausula_lgpd.message as string}
                  </p>
                )}
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
