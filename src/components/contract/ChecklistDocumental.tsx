import { useFormContext } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useEffect } from 'react'
import { getActiveDocs } from '@/lib/checklist-generator'

export function ChecklistDocumental() {
  const { control, watch, setValue, getValues } = useFormContext()
  const values = watch()
  const activeDocs = getActiveDocs(values)

  useEffect(() => {
    const currentChecklist = getValues('checklist_compliance') || {}
    const newChecklist: Record<string, boolean> = {}

    activeDocs.forEach((doc) => {
      newChecklist[doc] = currentChecklist[doc] || false
    })

    setValue('checklist_compliance', newChecklist, { shouldDirty: true })
  }, [
    values.vendedor_pj,
    values.vendedor_uniao_estavel,
    values.estado_civil_vendedor,
    values.comprador_uniao_estavel,
    values.estado_civil_comprador,
    values.imovel_inventario,
    values.imovel_locado,
    values.imovel_ocupado,
    values.imovel_desocupado,
    values.ocupacao_imovel,
  ])

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-500 mb-4">
        Marque os documentos que já foram coletados ou verificados. Esta lista é atualizada
        automaticamente de acordo com as características do negócio.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {activeDocs.map((doc) => (
          <FormField
            key={doc}
            control={control}
            name={`checklist_compliance.${doc}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 rounded-md bg-white shadow-sm border border-slate-200 transition-colors hover:border-slate-300">
                <FormControl>
                  <Checkbox
                    checked={field.value || false}
                    onCheckedChange={field.onChange}
                    className="mt-1"
                  />
                </FormControl>
                <div className="flex flex-col space-y-1">
                  <FormLabel className="text-sm font-medium leading-snug cursor-pointer">
                    {doc}
                  </FormLabel>
                  <div>
                    {field.value ? (
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        ✓ COLETADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                        ⚠️ PENDENTE
                      </span>
                    )}
                  </div>
                </div>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}
