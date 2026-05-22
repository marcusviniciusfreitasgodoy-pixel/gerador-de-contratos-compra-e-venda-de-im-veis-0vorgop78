import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ContractForm } from '@/components/ContractForm'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { DocumentContext } from '@/contexts/DocumentContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  FileText,
  CheckSquare,
  Receipt,
  FileSignature,
  FileKey,
  Key,
  FileCheck,
  Users,
  Ban,
  Handshake,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const DOCUMENT_TYPES = [
  {
    id: 'ficha_cadastral',
    title: 'Ficha Cadastral',
    desc: 'Levantamento de dados e qualificação das partes',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    id: 'checklist_documental',
    title: 'Checklist Documental',
    desc: 'Relação de certidões e documentos exigidos',
    icon: CheckSquare,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: 'autorizacao_intermediacao',
    title: 'Autorização de Intermediação',
    desc: 'Contrato de prestação de serviços do corretor',
    icon: FileText,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    id: 'recibo_sinal',
    title: 'Recibo de Sinal',
    desc: 'Comprovante de recebimento das arras ou sinal',
    icon: Receipt,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    id: 'promessa_compra_venda',
    title: 'Promessa de Compra e Venda',
    desc: 'Principal instrumento preliminar do negócio',
    icon: Handshake,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    id: 'contrato_particular',
    title: 'Contrato Particular',
    desc: 'Contrato definitivo com força de escritura',
    icon: FileSignature,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    id: 'termo_entrega_chaves',
    title: 'Termo de Entrega de Chaves',
    desc: 'Documento que formaliza a entrega do imóvel',
    icon: Key,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    id: 'termo_posse',
    title: 'Termo de Posse',
    desc: 'Transferência da posse precária ou definitiva',
    icon: FileKey,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    id: 'declaracoes_complementares',
    title: 'Declarações Complementares',
    desc: 'Declarações acessórias de estado ou ciência',
    icon: FileCheck,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    id: 'distrato',
    title: 'Distrato',
    desc: 'Instrumento para desfazimento do negócio',
    icon: Ban,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
]

export default function NewContract() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { user } = useAuth()

  const [tipoDocumento, setTipoDocumento] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.tipo_documento) {
      let tipo = location.state.tipo_documento
      if (tipo === 'promessa_cv') tipo = 'promessa_compra_venda'
      if (tipo === 'checklist') tipo = 'checklist_documental'
      if (tipo === 'termo_chaves') tipo = 'termo_entrega_chaves'
      if (tipo === 'declaracoes') tipo = 'declaracoes_complementares'
      if (tipo === 'autorizacao') tipo = 'autorizacao_intermediacao'
      setTipoDocumento(tipo)
    }
  }, [location])

  const infoMap: Record<string, { title: string; gender: string }> = {
    ficha_cadastral: { title: 'Ficha Cadastral', gender: 'a' },
    checklist_documental: { title: 'Checklist Documental', gender: 'o' },
    recibo_sinal: { title: 'Recibo de Sinal', gender: 'o' },
    promessa_compra_venda: { title: 'Promessa de Compra e Venda', gender: 'a' },
    contrato_particular: { title: 'Contrato Particular', gender: 'o' },
    termo_entrega_chaves: { title: 'Termo de Entrega de Chaves', gender: 'o' },
    termo_posse: { title: 'Termo de Posse', gender: 'o' },
    declaracoes_complementares: { title: 'Declarações Complementares', gender: 'as' },
    autorizacao_intermediacao: { title: 'Autorização de Intermediação', gender: 'a' },
    distrato: { title: 'Distrato', gender: 'o' },
  }

  const docInfo = tipoDocumento ? infoMap[tipoDocumento] : { title: 'Documento', gender: 'o' }
  const documentName = docInfo?.title || 'Documento'
  const documentGender = docInfo?.gender || 'o'

  useRealtime('contracts', (e) => {
    if (e.action === 'create' && user && e.record.user === user.id) {
      const gerado =
        documentGender === 'as' ? 'geradas' : documentGender === 'a' ? 'gerada' : 'gerado'
      toast({
        title: 'Sucesso!',
        description: `${documentName} ${gerado} com sucesso!`,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      })
    }
  })

  if (!tipoDocumento) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-6xl animate-fade-in-up">
        <div className="mb-10 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0C2340] tracking-tight mb-3">
            Novo Documento
          </h1>
          <p className="text-slate-600 text-lg">
            Selecione o tipo de instrumento jurídico ou formulário que deseja gerar para dar
            andamento à sua transação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCUMENT_TYPES.map((doc, index) => (
            <Card
              key={doc.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-slate-200/60 overflow-hidden relative"
              onClick={() => setTipoDocumento(doc.id)}
            >
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm group-hover:bg-[#0C2340] group-hover:text-[#D4AF37] transition-colors">
                {index + 1}
              </div>
              <CardContent className="p-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${doc.bg} group-hover:scale-110 transition-transform duration-500 shadow-sm border border-black/5`}
                >
                  <doc.icon className={`w-7 h-7 ${doc.color}`} />
                </div>
                <h3 className="font-bold text-lg text-[#0C2340] mb-2 pr-8 group-hover:text-[#D4AF37] transition-colors leading-tight">
                  {doc.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{doc.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <DocumentContext.Provider value={documentName}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => setTipoDocumento(null)}
            className="mb-4 -ml-4 text-slate-500 hover:text-[#0C2340]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Selecionar outro documento
          </Button>
          <h1 className="text-3xl font-bold text-[#0C2340] tracking-tight animate-in fade-in slide-in-from-bottom-2">
            Gerar {documentName}
          </h1>
          <p className="text-slate-600 mt-2 text-lg animate-in fade-in slide-in-from-bottom-3">
            Preencha os dados da negociação abaixo. O sistema estruturará as cláusulas específicas
            baseadas na estratégia escolhida e adicionará automaticamente regras de Compliance.
          </p>
        </div>
        <ContractForm
          tipoDocumento={tipoDocumento}
          onBack={() => setTipoDocumento(null)}
          documentName={documentName}
          documentGender={documentGender}
        />
      </div>
    </DocumentContext.Provider>
  )
}
