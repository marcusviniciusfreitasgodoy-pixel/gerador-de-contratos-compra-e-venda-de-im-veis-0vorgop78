import { useNavigate } from 'react-router-dom'
import {
  FileText,
  CheckSquare,
  Key,
  Shield,
  UserCheck,
  XCircle,
  Users,
  Landmark,
  FileSignature,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const PHASES = [
  {
    id: 'fase-1',
    title: 'Fase 1: Captação e Cadastro',
    description: 'Preparação e coleta inicial de dados',
    documents: [
      {
        id: 'ficha_cadastral',
        title: 'Ficha Cadastral',
        icon: UserCheck,
        desc: 'Coleta de dados detalhada das partes envolvidas',
      },
      {
        id: 'checklist_documental',
        title: 'Checklist Documental',
        icon: CheckSquare,
        desc: 'Relação de documentos exigidos',
      },
    ],
  },
  {
    id: 'fase-2',
    title: 'Fase 2: Intermediação e Proposta',
    description: 'Autorização de venda e início da negociação',
    documents: [
      {
        id: 'autorizacao_intermediacao',
        title: 'Autorização de Intermediação',
        icon: Users,
        desc: 'Autorização exclusiva para venda de imóvel',
        highlight: true,
      },
      {
        id: 'recibo_sinal',
        title: 'Recibo de Sinal',
        icon: Landmark,
        desc: 'Arras e princípio de pagamento',
        highlight: true,
      },
      {
        id: 'promessa_compra_venda',
        title: 'Promessa de Compra e Venda',
        icon: FileText,
        desc: 'Contrato particular preliminar',
        highlight: true,
      },
    ],
  },
  {
    id: 'fase-3',
    title: 'Fase 3: Contratação',
    description: 'Efetivação e regras do negócio',
    documents: [
      {
        id: 'contrato_particular',
        title: 'Contrato Particular',
        icon: FileSignature,
        desc: 'Contrato definitivo de compra e venda',
        highlight: true,
      },
      {
        id: 'declaracoes_complementares',
        title: 'Declarações Complementares',
        icon: Shield,
        desc: 'Declarações de estado civil, união, etc',
      },
    ],
  },
  {
    id: 'fase-4',
    title: 'Fase 4: Entrega do Imóvel',
    description: 'Posse e transferência física',
    documents: [
      {
        id: 'termo_entrega_chaves',
        title: 'Termo de Entrega de Chaves',
        icon: Key,
        desc: 'Efetiva entrega do imóvel ao comprador',
      },
      {
        id: 'termo_posse',
        title: 'Termo de Posse',
        icon: Key,
        desc: 'Transferência formal de posse',
      },
    ],
  },
  {
    id: 'fase-5',
    title: 'Fase 5: Encerramento',
    description: 'Rescisão ou cancelamento do negócio',
    documents: [
      {
        id: 'distrato',
        title: 'Distrato',
        icon: XCircle,
        desc: 'Rescisão amigável de negociação',
      },
    ],
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
          Selecione o documento que deseja gerar, organizado pelas fases da negociação imobiliária.
          Todos os instrumentos incluem injeção automática de cláusulas de proteção de dados (LGPD),
          validade de assinatura eletrônica e adequação PLD-FT (Provimento CNJ 88).
        </p>
      </div>

      <div className="space-y-12">
        {PHASES.map((phase) => (
          <section key={phase.id} className="space-y-5">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{phase.title}</h2>
              <p className="text-slate-500 mt-1">{phase.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {phase.documents.map((doc) => (
                <Card
                  key={doc.id}
                  className={`cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    doc.highlight ? 'border-purple-200 bg-purple-50/20' : 'hover:border-blue-200'
                  }`}
                  onClick={() => navigate('/contratos/novo', { state: { tipo_documento: doc.id } })}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`p-2.5 rounded-xl transition-colors ${
                          doc.highlight
                            ? 'bg-purple-100 text-purple-700 group-hover:bg-purple-200'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}
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
                    <CardTitle className="text-lg font-semibold text-slate-800">
                      {doc.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-slate-500 mb-5 line-clamp-2 min-h-[40px]">
                      {doc.desc}
                    </CardDescription>
                    <div
                      className={`text-sm font-semibold flex items-center transition-colors ${
                        doc.highlight
                          ? 'text-purple-600 group-hover:text-purple-700'
                          : 'text-slate-500 group-hover:text-blue-600'
                      }`}
                    >
                      Gerar documento{' '}
                      <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
