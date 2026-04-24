import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { contractSchema, type ContractFormValues } from '@/lib/schemas'
import { PersonBlock, PropertyBlock, FinancialBlock, FinancingBlock } from './ContractBlocks'
import { ArrowLeft, Loader2, CheckCircle2, Wand2 } from 'lucide-react'
import { createContract, generateContractDocx } from '@/services/contracts'
import { addDays } from 'date-fns'
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

  const handleFillDummyData = () => {
    const commonData = {
      nome_vendedor: 'Marcos da Silva Sauro',
      cpf_vendedor: '123.456.789-00',
      rg_vendedor: 'MG-12.345.678',
      orgao_emissor_vendedor: 'SSP/MG',
      nacionalidade_vendedor: 'Brasileiro',
      estado_civil_vendedor: 'Casado',
      profissao_vendedor: 'Engenheiro',
      endereco_vendedor: 'Rua das Flores, 123, Bairro Jardim, Belo Horizonte/MG',
      email_vendedor: 'vendedor.teste@exemplo.com',
      telefone_vendedor: '(31) 98888-7777',

      nome_comprador: 'Ana Beatriz de Souza',
      cpf_comprador: '987.654.321-11',
      rg_comprador: '12.345.678-9',
      orgao_emissor_comprador: 'DETRAN/RJ',
      nacionalidade_comprador: 'Brasileira',
      estado_civil_comprador: 'Solteira',
      profissao_comprador: 'Advogada',
      endereco_comprador: 'Av. Atlântica, 456, Copacabana, Rio de Janeiro/RJ',
      email_comprador: 'comprador.teste@exemplo.com',
      telefone_comprador: '(21) 99999-8888',

      endereco_imovel: 'Rua Alameda dos Anjos, nº 10, Condomínio Solar, Curitiba/PR',
      matricula_imovel: '123.456-A',
      rgi_imovel: '2º Ofício de Registro de Imóveis',
      inscricao_municipal: '01.02.003.0045.001',
      area_total: '150.5',
      vagas_garagem: '2',

      valor_total: 'R$ 500.000,00',
      valor_sinal: 'R$ 50.000,00',
      comissao: 'R$ 25.000,00',
    }

    if (type === 'a_vista') {
      const data = {
        ...commonData,
        valor_saldo: 'R$ 450.000,00',
        data_pagamento_saldo: addDays(new Date(), 30).toISOString().split('T')[0],
        valor_reforco: '',
        valor_complemento: '',
        valor_financiado: '',
        instituicao_financeira: '',
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
        }
      })
    } else {
      const data = {
        ...commonData,
        valor_reforco: 'R$ 25.000,00',
        valor_complemento: 'R$ 25.000,00',
        valor_financiado: 'R$ 400.000,00',
        instituicao_financeira: 'Caixa Econômica Federal',
        valor_saldo: '',
        data_pagamento_saldo: undefined,
      }
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value as any, { shouldValidate: true, shouldDirty: true })
        }
      })
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
          <Button
            type="button"
            variant="secondary"
            onClick={handleFillDummyData}
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
          >
            <Wand2 className="w-4 h-4 text-blue-600" />
            Preencher Dados de Teste
          </Button>
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
