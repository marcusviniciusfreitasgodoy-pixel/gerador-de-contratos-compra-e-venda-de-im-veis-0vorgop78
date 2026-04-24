import { useState } from 'react'
import { ContractForm } from '@/components/ContractForm'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

const Index = () => {
  const [type, setType] = useState<'a_vista' | 'financiado' | null>(null)

  if (type) {
    return (
      <div className="container mx-auto py-8 px-4">
        <ContractForm type={type} onBack={() => setType(null)} />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl animate-in fade-in">
      <div className="text-center mb-12">
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="text-blue-600 h-10 w-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800">Gerador de Contratos</h1>
        <p className="text-slate-600 mt-4 text-lg">
          Selecione o tipo de contrato que deseja gerar.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">À Vista</h2>
            <p className="text-slate-600 mb-8">
              Pagamento com sinal e saldo, sem financiamento bancário.
            </p>
          </div>
          <Button
            onClick={() => setType('a_vista')}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Gerar À Vista
          </Button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow text-center flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Financiado</h2>
            <p className="text-slate-600 mb-8">
              Pagamento com sinal, recursos próprios e financiamento bancário.
            </p>
          </div>
          <Button
            onClick={() => setType('financiado')}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          >
            Gerar Financiado
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Index
