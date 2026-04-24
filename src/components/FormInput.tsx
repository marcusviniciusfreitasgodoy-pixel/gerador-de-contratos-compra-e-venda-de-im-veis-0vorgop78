import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FormInputProps {
  name: string
  label: string
  required?: boolean
  placeholder?: string
  mask?: (value: string) => string
  type?: string
  step?: string
  options?: { label: string; value: string }[]
}

export function FormInput({
  name,
  label,
  required,
  placeholder,
  mask,
  type = 'text',
  options,
  step,
}: FormInputProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-slate-700 font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            {options ? (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="focus:ring-blue-500 bg-white">
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
            ) : (
              <Input
                type={type}
                step={step}
                placeholder={placeholder}
                {...field}
                value={field.value || ''}
                onChange={(e) => {
                  let val = e.target.value
                  if (mask) val = mask(val)
                  field.onChange(val)
                }}
                className="focus-visible:ring-blue-500 bg-white transition-all"
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
