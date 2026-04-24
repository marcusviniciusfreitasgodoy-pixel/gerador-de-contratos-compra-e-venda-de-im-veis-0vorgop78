import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import { PersonBlock, PropertyBlock, FinancialBlock, FinancingBlock } from './ContractBlocks'
import { FileText, ArrowLeft, Loader2, Download } from 'lucide-react'
import { createContract } from '@/services/contracts'
import { toast } from 'sonner'

export function ContractForm({
  type,
  onBack,
}: {
  type: 'A_VISTA' | 'FINANCIADO'
  onBack: () => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      type,
      seller_data: {},
      buyer_data: {},
      property_data: {},
      financial_data: {},
      ...(type === 'FINANCIADO' ? { financing_details: {} } : {}),
    } as any,
    mode: 'onChange',
  })

  const onSubmit = async (data: ContractFormValues) => {
    setIsGenerating(true)
    try {
      await createContract(data)
      toast.success('Contrato gerado com sucesso!')
      setIsSuccess(true)
    } catch (error) {
      toast.error('Erro ao gerar contrato. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-20 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <FileText size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800">Contrato Pronto!</h2>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          A minuta do contrato foi gerada e salva com sucesso. Você já pode fazer o download do
          arquivo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-base"
            onClick={() => {
              setIsSuccess(false)
              onBack()
            }}
          >
            Novo Contrato
          </Button>
          <Button
            size="lg"
            className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Download className="mr-3 h-5 w-5" /> Baixar DOCX
          </Button>
        </div>
      </div>
    )
  }

  const isValid = form.formState.isValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-5xl mx-auto animate-in fade-in"
      >
        <input type="hidden" {...form.register('type')} value={type} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                Tipo Selecionado
              </p>
              <p className="font-bold text-slate-800 text-xl">
                {type === 'A_VISTA' ? 'À Vista (Sinal + Saldo)' : 'Financiado'}
              </p>
            </div>
          </div>
        </div>

        <PersonBlock prefix="seller_data" title="Dados do Vendedor" />
        <PersonBlock prefix="buyer_data" title="Dados do Comprador" />
        <PropertyBlock />
        <FinancialBlock type={type} />
        {type === 'FINANCIADO' && <FinancingBlock />}

        <div className="flex justify-end pt-8 pb-12">
          <Button
            type="submit"
            disabled={!isValid || isGenerating}
            size="lg"
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-lg h-14 px-10 shadow-lg shadow-blue-200"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" /> Gerando minuta...
              </>
            ) : (
              'Gerar Contrato'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
