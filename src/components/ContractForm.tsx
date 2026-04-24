import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import { PersonBlock, PropertyBlock, FinancialBlock, FinancingBlock } from './ContractBlocks'
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { createContract, generateContractDocx } from '@/services/contracts'
import { toast } from 'sonner'

export function ContractForm({
  type,
  onBack,
}: {
  type: 'a_vista' | 'financiado'
  onBack: () => void
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      tipo: type,
      status: 'gerado',
    } as any,
    mode: 'onChange',
  })

  const onSubmit = async (data: ContractFormValues) => {
    setIsGenerating(true)
    try {
      const savedContract = await createContract(data)

      try {
        const docxResponse = await generateContractDocx(savedContract)

        if (docxResponse.html && docxResponse.filename) {
          const blob = new Blob([docxResponse.html], { type: 'application/msword' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = docxResponse.filename
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        } else if (docxResponse.base64 && docxResponse.filename) {
          const byteCharacters = atob(docxResponse.base64)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          const blob = new Blob([byteArray], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          })

          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = docxResponse.filename
          document.body.appendChild(link)
          link.click()
          link.remove()
          window.URL.revokeObjectURL(url)
        }

        toast.success('Contrato gerado com sucesso!')
        setIsSuccess(true)
      } catch (err: any) {
        toast.error('Erro ao gerar contrato. Tente novamente.', {
          action: {
            label: 'Tentar Novamente',
            onClick: () => onSubmit(data),
          },
        })
      }
    } catch (error) {
      toast.error('Erro ao salvar contrato no sistema. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 py-20 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-bold text-slate-800">Contrato gerado com sucesso!</h2>
        <p className="text-slate-600 text-lg max-w-md mx-auto">
          O contrato foi salvo no sistema de forma segura.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-base bg-white"
            onClick={() => {
              setIsSuccess(false)
              onBack()
            }}
          >
            Novo Contrato
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
        className="max-w-5xl mx-auto animate-in fade-in space-y-8"
      >
        <input type="hidden" {...form.register('tipo')} value={type} />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-white border border-slate-200 rounded-xl shadow-sm gap-4">
          <div className="flex items-center gap-5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full bg-white"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm text-slate-500 font-medium tracking-wide uppercase">
                Tipo Selecionado
              </p>
              <p className="font-bold text-slate-800 text-xl">
                {type === 'a_vista' ? 'À Vista (Sinal + Saldo)' : 'Financiado'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <PersonBlock suffix="_vendedor" title="Dados do Vendedor" />
          <PersonBlock suffix="_comprador" title="Dados do Comprador" />
          <PropertyBlock />
          <FinancialBlock type={type} />
          {type === 'financiado' && <FinancingBlock />}
        </div>

        <div className="flex justify-end pt-4 pb-12">
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
