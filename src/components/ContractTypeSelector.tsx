import { FileText, Building } from 'lucide-react'
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function ContractTypeSelector({
  onSelect,
}: {
  onSelect: (type: 'A_VISTA' | 'FINANCIADO') => void
}) {
  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
      <h2 className="text-2xl font-medium mb-10 text-center text-slate-600">
        Qual tipo de contrato você deseja gerar?
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <Card
          className="cursor-pointer border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden group"
          onClick={() => onSelect('A_VISTA')}
        >
          <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <FileText className="w-16 h-16 text-blue-700" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-800">À Vista</CardTitle>
            <CardDescription className="text-lg text-slate-600 leading-relaxed">
              Sinal + Saldo. Ideal para pagamentos diretos sem intervenção bancária e processos
              rápidos.
            </CardDescription>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden group"
          onClick={() => onSelect('FINANCIADO')}
        >
          <CardContent className="p-10 flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <Building className="w-16 h-16 text-blue-700" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-800">Financiado</CardTitle>
            <CardDescription className="text-lg text-slate-600 leading-relaxed">
              Sinal + Reforço + Complemento + Financiado. Preparado para compras com crédito
              imobiliário.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
