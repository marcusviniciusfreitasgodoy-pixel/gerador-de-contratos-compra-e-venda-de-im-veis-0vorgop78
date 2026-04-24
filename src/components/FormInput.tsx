import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
