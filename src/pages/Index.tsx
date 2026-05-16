import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  FileText,
  ShieldCheck,
  FileSignature,
  FileKey,
  RefreshCcw,
  Landmark,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DOCUMENTS = [
  {
    id: 'promessa_compra_venda',
    title: 'Promessa de Compra e Venda',
    icon: FileText,
    description: 'Contrato preliminar de negociação',
  },
  {
    id: 'recibo_sinal',
    title: 'Recibo de Sinal',
    icon: Landmark,
    description: 'Comprovante de arras (Art. 417-420 CC)',
  },
  {
    id: 'contrato_particular',
    title: 'Contrato Particular',
    icon: FileSignature,
    description: 'Instrumento particular de compra e venda',
  },
  {
    id: 'termo_entrega_chaves',
    title: 'Termo de Entrega de Chaves',
    icon: FileKey,
    description: 'Documento de entrega do imóvel',
  },
  {
    id: 'termo_posse',
    title: 'Termo de Posse',
    icon: ShieldCheck,
    description: 'Transferência de posse do imóvel',
  },
  {
    id: 'autorizacao_intermediacao',
    title: 'Autorização Intermediação',
    icon: Users,
    description: 'Autorização para venda exclusiva',
  },
  {
    id: 'distrato',
    title: 'Distrato',
    icon: RefreshCcw,
    description: 'Cancelamento de negócio jurídico',
  },
  {
    id: 'ficha_cadastral',
    title: 'Ficha Cadastral',
    icon: FileText,
    description: 'Coleta de dados de clientes',
  },
  {
    id: 'checklist_documental',
    title: 'Checklist Documental',
    icon: FileText,
    description: 'Lista de documentos necessários',
  },
  {
    id: 'declaracoes_complementares',
    title: 'Declarações Extras',
    icon: FileText,
    description: 'Declarações complementares',
  },
]

const NEGOTIATION_TYPES = [
  { id: 'a_vista', label: 'À Vista' },
  { id: 'financiamento', label: 'Financiamento' },
  { id: 'investidor', label: 'Investidor (Flip/Renda)' },
  { id: 'alto_padrao', label: 'Alto Padrão' },
  { id: 'permuta', label: 'Permuta' },
]

export default function Index() {
  const navigate = useNavigate()
  const [negType, setNegType] = useState('a_vista')

  const handleStart = (docId: string) => {
    navigate('/contratos/novo', { state: { tipo_documento: docId, tipo_negociacao: negType } })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          Kit Profissional Imobiliário
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Selecione o tipo de negociação e o documento desejado para gerar minutas seguras,
          atualizadas e em conformidade com as exigências legais (LGPD e PLD-FT).
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center mb-10 gap-4 p-4 bg-slate-50 rounded-xl border">
        <label className="font-semibold text-slate-700">Tipo de Negociação Padrão:</label>
        <Select value={negType} onValueChange={setNegType}>
          <SelectTrigger className="w-[250px] bg-white">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {NEGOTIATION_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DOCUMENTS.map((doc) => (
          <Card
            key={doc.id}
            className="hover:shadow-lg transition-all duration-300 hover:border-blue-200 group flex flex-col"
          >
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <doc.icon size={24} />
              </div>
              <CardTitle className="text-lg leading-tight">{doc.title}</CardTitle>
              <CardDescription className="h-10 mt-2">{doc.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button
                onClick={() => handleStart(doc.id)}
                className="w-full bg-slate-900 hover:bg-blue-600 transition-colors"
              >
                Gerar Documento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
