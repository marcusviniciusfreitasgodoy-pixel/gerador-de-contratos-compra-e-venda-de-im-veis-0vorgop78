import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFormContext } from 'react-hook-form'
import { formatCurrency } from '@/lib/formatters'
import { ChangeEvent } from 'react'

export function FormInput({
  name,
  label,
  placeholder,
  type = 'text',
}: {
  name: string
  label: string
  placeholder?: string
  type?: string
}) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input type={type} placeholder={placeholder} {...field} value={field.value || ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function FormCurrencyInput({
  name,
  label,
  placeholder = 'R$ 0,00',
}: {
  name: string
  label: string
  placeholder?: string
}) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const formatted = formatCurrency(e.target.value)
          field.onChange(formatted)
        }

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ''}
                onChange={handleChange}
                placeholder={placeholder}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function FormMaskedInput({
  name,
  label,
  placeholder,
  maskType,
}: {
  name: string
  label: string
  placeholder?: string
  maskType: 'cpf' | 'cnpj' | 'phone'
}) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let val = e.target.value.replace(/\D/g, '')
          if (maskType === 'cpf') {
            val = val.replace(/(\d{3})(\d)/, '$1.$2')
            val = val.replace(/(\d{3})(\d)/, '$1.$2')
            val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
          } else if (maskType === 'cnpj') {
            val = val.replace(/(\d{2})(\d)/, '$1.$2')
            val = val.replace(/(\d{3})(\d)/, '$1.$2')
            val = val.replace(/(\d{3})(\d)/, '$1/$2')
            val = val.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
          } else if (maskType === 'phone') {
            val = val.replace(/(\d{2})(\d)/, '($1) $2')
            val = val.replace(/(\d{4,5})(\d{4})$/, '$1-$2')
          }
          field.onChange(val)
        }
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value || ''}
                onChange={handleChange}
                placeholder={placeholder}
                maxLength={maskType === 'cpf' ? 14 : maskType === 'cnpj' ? 18 : 15}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

export function FormSelect({
  name,
  label,
  options,
  placeholder = 'Selecione...',
}: {
  name: string
  label: string
  options: { label: string; value: string }[]
  placeholder?: string
}) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
