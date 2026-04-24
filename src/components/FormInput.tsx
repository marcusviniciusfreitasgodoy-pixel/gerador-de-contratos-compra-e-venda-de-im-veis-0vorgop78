import { useState, useEffect, useRef } from 'react'
import { useFormContext, ControllerRenderProps, ControllerFieldState } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

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

interface FormInputInnerProps extends Omit<FormInputProps, 'name'> {
  field: ControllerRenderProps<any, any>
  fieldState: ControllerFieldState
}

function FormInputInner({
  field,
  fieldState,
  label,
  required,
  placeholder,
  mask,
  type = 'text',
  options,
  step,
}: FormInputInnerProps) {
  const [localValue, setLocalValue] = useState(field.value || '')
  const onChangeRef = useRef(field.onChange)
  onChangeRef.current = field.onChange

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== field.value) {
        onChangeRef.current(localValue)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [localValue, field.value])

  useEffect(() => {
    if (field.value !== localValue) {
      setLocalValue(field.value || '')
    }
  }, [field.value])

  const isError = !!fieldState.error
  const isValid = fieldState.isDirty && !fieldState.invalid && localValue !== ''

  return (
    <FormItem className="flex flex-col">
      <FormLabel className="text-slate-700 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <FormControl>
        {options ? (
          <div className="relative">
            <Select
              onValueChange={(val) => {
                field.onChange(val)
                setLocalValue(val)
              }}
              value={field.value || ''}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(
                    'focus:ring-blue-500 bg-white pr-10',
                    isError && 'border-red-500 focus:ring-red-500',
                    isValid && 'border-green-500 focus:ring-green-500',
                  )}
                >
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
            {isError && (
              <XCircle className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500 h-4 w-4 pointer-events-none" />
            )}
            {isValid && (
              <CheckCircle2 className="absolute right-8 top-1/2 -translate-y-1/2 text-green-500 h-4 w-4 pointer-events-none" />
            )}
          </div>
        ) : (
          <div className="relative">
            <Input
              {...field}
              type={type}
              step={step}
              placeholder={placeholder}
              value={localValue}
              onChange={(e) => {
                let val = e.target.value
                if (mask) val = mask(val)
                setLocalValue(val)
              }}
              className={cn(
                'focus-visible:ring-blue-500 bg-white transition-all pr-10',
                isError && 'border-red-500 focus-visible:ring-red-500',
                isValid && 'border-green-500 focus-visible:ring-green-500',
              )}
            />
            {isError && (
              <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 h-5 w-5 pointer-events-none" />
            )}
            {isValid && (
              <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 h-5 w-5 pointer-events-none" />
            )}
          </div>
        )}
      </FormControl>
      <FormMessage className="text-[12pt] text-red-500 font-medium mt-1" />
    </FormItem>
  )
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
      render={({ field, fieldState }) => (
        <FormInputInner
          field={field}
          fieldState={fieldState}
          label={label}
          required={required}
          placeholder={placeholder}
          mask={mask}
          type={type}
          options={options}
          step={step}
        />
      )}
    />
  )
}
