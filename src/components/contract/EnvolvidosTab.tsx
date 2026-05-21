import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormInput, FormMaskedInput, FormSelect } from '@/components/FormInput'
import { ESTADO_CIVIL_OPTIONS, REGIME_BENS_OPTIONS } from '@/lib/constants'

export function EnvolvidosTab() {
  const { watch, control } = useFormContext()
  const tipoComprador = watch('tipo_comprador')
  const estCivilC = watch('estado_civil_comprador')
  const vendPj = watch('vendedor_pj')
  const estCivilV = watch('estado_civil_vendedor')

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-[#0C2340]/10 shadow-sm">
        <CardHeader className="bg-[#0C2340]/5 pb-4">
          <CardTitle className="text-[#0C2340] text-lg">1. Comprador</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormMaskedInput name="cnpj_comprador" label="CNPJ" maskType="cnpj" />
              <FormInput name="representante_comprador" label="Representante Legal" />
              <FormInput name="email_comprador" label="E-mail" type="email" />
              <FormMaskedInput name="telefone_comprador" label="Telefone" maskType="phone" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormMaskedInput name="cpf_comprador" label="CPF" maskType="cpf" />
              <FormInput name="rg_comprador" label="RG" />
              <FormInput name="email_comprador" label="E-mail" type="email" />
              <FormMaskedInput name="telefone_comprador" label="Telefone" maskType="phone" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
              <FormInput name="nome_conjuge_comprador" label="Nome do Cônjuge" />
              <FormMaskedInput name="cpf_conjuge_comprador" label="CPF Cônjuge" maskType="cpf" />
              <FormInput name="rg_conjuge_comprador" label="RG Cônjuge" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#D4AF37]/20 shadow-sm">
        <CardHeader className="bg-[#D4AF37]/10 pb-4">
          <CardTitle className="text-[#0C2340] text-lg">2. Vendedor</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <FormField
            control={control}
            name="vendedor_pj"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 cursor-pointer">
                  Vendedor é Pessoa Jurídica (PJ)
                </FormLabel>
              </FormItem>
            )}
          />
          <FormInput name="nome_vendedor" label={vendPj ? 'Razão Social' : 'Nome Completo'} />
          {vendPj ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormMaskedInput name="cnpj_vendedor" label="CNPJ" maskType="cnpj" />
              <FormInput name="representante_vendedor" label="Representante Legal" />
              <FormInput name="email_vendedor" label="E-mail" type="email" />
              <FormMaskedInput name="telefone_vendedor" label="Telefone" maskType="phone" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormMaskedInput name="cpf_vendedor" label="CPF" maskType="cpf" />
              <FormInput name="rg_vendedor" label="RG" />
              <FormInput name="email_vendedor" label="E-mail" type="email" />
              <FormMaskedInput name="telefone_vendedor" label="Telefone" maskType="phone" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border p-4 rounded bg-slate-50">
              <FormInput name="conjuge_vendedor" label="Nome do Cônjuge" />
              <FormMaskedInput name="cpf_conjuge_vendedor" label="CPF Cônjuge" maskType="cpf" />
              <FormInput name="rg_conjuge_vendedor" label="RG Cônjuge" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
