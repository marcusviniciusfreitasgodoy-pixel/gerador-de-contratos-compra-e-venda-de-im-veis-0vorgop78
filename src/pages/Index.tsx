import { useState } from 'react'
import { ContractForm } from '@/components/ContractForm'
import { Button } from '@/components/ui/button'
import { CircleDollarSign, Landmark } from 'lucide-react'

export default function Index() {
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
        <h1 className="text-4xl font-bold text-slate-800">Gerador de Contratos Imobiliários</h1>
        <p className="text-slate-600 mt-4 text-lg">Crie minutas de compra e venda em segundos</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all text-center flex flex-col justify-between group cursor-pointer">
          <div>
            <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <CircleDollarSign className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Compra e Venda À Vista</h2>
            <p className="text-slate-600 mb-8 text-[15px]">
              Sinal + Saldo. Pagamento integral antes da escritura.
            </p>
          </div>
          <Button
            onClick={() => setType('a_vista')}
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
          >
            Começar
          </Button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all text-center flex flex-col justify-between group cursor-pointer">
          <div>
            <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Landmark className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-slate-800">
              Compra e Venda com Financiamento
            </h2>
            <p className="text-slate-600 mb-8 text-[15px]">
              Sinal + Reforço + Complemento + Financiado. Com aprovação bancária.
            </p>
          </div>
          <Button
            onClick={() => setType('financiado')}
            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
          >
            Começar
          </Button>
        </div>
      </div>
    </div>
  )
}
