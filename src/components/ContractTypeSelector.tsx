import { Button } from '@/components/ui/button'
import { FileText, Building } from 'lucide-react'

export function ContractTypeSelector({
  onSelect,
}: {
  onSelect: (type: 'a_vista' | 'financiado') => void
}) {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-in fade-in">
      <div
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-blue-200 text-center flex flex-col justify-between group cursor-pointer"
        onClick={() => onSelect('a_vista')}
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">À Vista</h2>
          <p className="text-slate-600 mb-8">
            Pagamento com sinal e saldo, sem financiamento bancário.
          </p>
        </div>
        <Button className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 pointer-events-none">
          Gerar À Vista
        </Button>
      </div>
      <div
        className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all hover:border-blue-200 text-center flex flex-col justify-between group cursor-pointer"
        onClick={() => onSelect('financiado')}
      >
        <div>
          <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Building className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-slate-800">Financiado</h2>
          <p className="text-slate-600 mb-8">
            Pagamento com sinal, recursos próprios e financiamento bancário.
          </p>
        </div>
        <Button className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 pointer-events-none">
          Gerar Financiado
        </Button>
      </div>
    </div>
  )
}
