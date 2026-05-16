import { useNavigate } from 'react-router-dom'
import { FileText, Receipt, CheckSquare, Key, Shield, UserCheck, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const DOCUMENTS = [
  {
    id: 'ficha_cadastral',
    title: 'Ficha Cadastral',
    icon: UserCheck,
    desc: 'Coleta de dados detalhada das partes envolvidas',
  },
  {
    id: 'checklist',
    title: 'Checklist Documental',
    icon: CheckSquare,
    desc: 'Relação de documentos exigidos',
  },
  {
    id: 'recibo_sinal',
    title: 'Recibo de Sinal',
    icon: Receipt,
    desc: 'Arras e princípio de pagamento',
    highlight: true,
  },
  {
    id: 'promessa_cv',
    title: 'Promessa de Compra e Venda',
    icon: FileText,
    desc: 'Contrato particular preliminar',
    highlight: true,
  },
  {
    id: 'contrato_particular',
    title: 'Contrato Particular',
    icon: FileText,
    desc: 'Contrato definitivo de compra e venda',
    highlight: true,
  },
  {
    id: 'termo_chaves',
    title: 'Termo de Entrega de Chaves',
    icon: Key,
    desc: 'Efetiva entrega do imóvel ao comprador',
  },
  { id: 'termo_posse', title: 'Termo de Posse', icon: Key, desc: 'Transferência formal de posse' },
  {
    id: 'declaracoes',
    title: 'Declarações Complementares',
    icon: Shield,
    desc: 'Declarações de estado civil, união, etc',
  },
  {
    id: 'autorizacao',
    title: 'Autorização de Intermediação',
    icon: FileText,
    desc: 'Autorização exclusiva/simples de venda',
  },
  {
    id: 'distrato',
    title: 'Distrato de Contrato',
    icon: XCircle,
    desc: 'Rescisão amigável de negociação',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in">
      <div className="mb-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
          Kit Profissional Imobiliário
        </h1>
        <p className="text-slate-600 mt-3 text-lg leading-relaxed">
          Selecione o documento que deseja gerar. Todos os instrumentos do Kit incluem injeção
          automática de cláusulas de proteção de dados (LGPD), validade de assinatura eletrônica e
          adequação PLD-FT (Provimento CNJ 88).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DOCUMENTS.map((doc) => (
          <Card
            key={doc.id}
            className={`cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${doc.highlight ? 'border-purple-200 bg-purple-50/20' : 'hover:border-blue-200'}`}
            onClick={() => navigate('/contratos/novo', { state: { tipo_documento: doc.id } })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-xl transition-colors ${doc.highlight ? 'bg-purple-100 text-purple-700 group-hover:bg-purple-200' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'}`}
                >
                  <doc.icon className="w-5 h-5" />
                </div>
                {doc.highlight && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 border-none font-medium"
                  >
                    Essencial
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-semibold text-slate-800">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-slate-500 mb-5 line-clamp-2">
                {doc.desc}
              </CardDescription>
              <div
                className={`text-sm font-semibold flex items-center transition-colors ${doc.highlight ? 'text-purple-600 group-hover:text-purple-700' : 'text-slate-500 group-hover:text-blue-600'}`}
              >
                Gerar documento{' '}
                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
