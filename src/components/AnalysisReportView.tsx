import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  XCircle,
  AlertOctagon,
  Scale,
  BookOpen,
  PenTool,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export interface AnalysisReport {
  is_real_estate_contract: boolean
  contract_type: string
  parties: string
  summary: string
  structural_compliance: Array<{
    clause: string
    present: boolean
    status: 'CONFORME' | 'RISCO' | 'CRÍTICO'
    details: string
  }>
  legal_compliance: Array<{
    clause_text: string
    status: 'CONFORME' | 'RISCO' | 'CRÍTICO'
    legal_basis: string
    explanation: string
  }>
  risks: {
    buyer: string[]
    seller: string[]
    execution: string[]
    registration: string[]
    financing: string[]
  }
  abusive_clauses: Array<{
    clause: string
    violation: string
    recommendation: string
    drafting_suggestion: string
  }>
  omissions: Array<{
    missing_item: string
    drafting_suggestion: string
  }>
  recommendations: {
    immediate: string[]
    recommended: string[]
  }
}

export function AnalysisReportView({ report }: { report: AnalysisReport }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RISCO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFORME':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRÍTICO':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'RISCO':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'CONFORME':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Info className="h-5 w-5 text-slate-600" />
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Cabeçalho */}
      <Card className="border-t-4 border-t-purple-600 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2 mb-2">
                <ShieldAlert className="w-6 h-6 text-purple-600" />
                Relatório de Compliance Jurídico
              </CardTitle>
              <CardDescription className="text-base text-slate-600 font-medium">
                {report.contract_type}
              </CardDescription>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Data da Análise
              </div>
              <div className="font-medium text-slate-800">
                {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">
              Partes Envolvidas
            </h4>
            <p className="text-slate-700">{report.parties}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm uppercase tracking-wide mb-1">
              Resumo Executivo
            </h4>
            <p className="text-slate-700 leading-relaxed">{report.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Seção 1: Conformidade Estrutural */}
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            Seção 1: Conformidade Estrutural (Cláusulas Obrigatórias)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {report.structural_compliance?.map((item, idx) => (
              <div
                key={idx}
                className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="mt-1">
                  {item.present ? (
                    getRiskIcon(item.status)
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="font-semibold text-slate-800">{item.clause}</h5>
                    <Badge
                      variant="outline"
                      className={
                        item.present ? getRiskColor(item.status) : 'bg-red-100 text-red-800'
                      }
                    >
                      {item.present ? item.status : 'AUSENTE'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Conformidade Jurídica */}
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Seção 2: Conformidade Jurídica
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!report.legal_compliance || report.legal_compliance.length === 0 ? (
            <p className="text-slate-500">Nenhum apontamento específico.</p>
          ) : (
            report.legal_compliance.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(item.status)}
                    <span className="font-semibold text-slate-800">{item.clause_text}</span>
                  </div>
                  <Badge variant="outline" className={getRiskColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <div className="pl-7 space-y-2 text-sm">
                  <p className="text-slate-700">
                    <span className="font-semibold">Fundamentação:</span> {item.legal_basis}
                  </p>
                  <p className="text-slate-600">{item.explanation}</p>
                </div>
                {idx < report.legal_compliance.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Seção 3: Riscos Identificados */}
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-orange-600" />
            Seção 3: Mapeamento de Riscos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(report.risks || {}).map(([key, risks]) => {
            const labels: Record<string, string> = {
              buyer: 'Riscos para Comprador',
              seller: 'Riscos para Vendedor',
              execution: 'Risco de Execução',
              registration: 'Risco de Registro',
              financing: 'Risco de Financiamento',
            }
            if (!risks || risks.length === 0) return null
            return (
              <div key={key} className="bg-orange-50/50 p-4 rounded-lg border border-orange-100">
                <h5 className="font-semibold text-orange-800 mb-2">{labels[key]}</h5>
                <ul className="list-disc pl-5 text-sm text-orange-900 space-y-1">
                  {risks.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Seção 4: Cláusulas Abusivas */}
      {report.abusive_clauses && report.abusive_clauses.length > 0 && (
        <Card className="border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <CardTitle className="text-lg flex items-center gap-2 text-red-800">
              <XCircle className="w-5 h-5" />
              Seção 4: Cláusulas Abusivas Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {report.abusive_clauses.map((item, idx) => (
              <div key={idx} className="space-y-3">
                <div className="font-medium text-slate-800 bg-slate-100 p-3 rounded-md italic">
                  "{item.clause}"
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="font-semibold text-red-700">Violação:</span> {item.violation}
                  </div>
                  <div>
                    <span className="font-semibold text-amber-700">Recomendação:</span>{' '}
                    {item.recommendation}
                  </div>
                  <div className="bg-green-50 p-3 rounded border border-green-100">
                    <span className="font-semibold text-green-800 flex items-center gap-2 mb-1">
                      <PenTool className="w-4 h-4" /> Sugestão de Redação:
                    </span>
                    <p className="text-green-900">{item.drafting_suggestion}</p>
                  </div>
                </div>
                {idx < report.abusive_clauses.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Seção 5: Omissões */}
      {report.omissions && report.omissions.length > 0 && (
        <Card>
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Seção 5: Omissões Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {report.omissions.map((item, idx) => (
              <Alert key={idx} className="bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800 font-semibold">
                  {item.missing_item}
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="bg-white p-3 rounded border border-amber-100 text-slate-700 text-sm">
                    <span className="font-semibold block mb-1">Sugestão de Inclusão:</span>
                    {item.drafting_suggestion}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Seção 6: Recomendações */}
      <Card>
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Seção 6: Plano de Ação Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" /> Ações Imediatas
            </h5>
            <ul className="space-y-2">
              {report.recommendations?.immediate?.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-blue-700 flex items-center gap-2 mb-3">
              <Info className="w-4 h-4" /> Melhorias Recomendadas
            </h5>
            <ul className="space-y-2">
              {report.recommendations?.recommended?.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Rodapé: Legal Disclaimer */}
      <div className="bg-slate-100 border border-slate-200 rounded-lg p-5 flex items-start gap-3">
        <Info className="h-6 w-6 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">⚠️ AVISO JURÍDICO:</span> Este relatório é
          gerado por Inteligência Artificial baseado na legislação e jurisprudência fornecidas, com
          o objetivo de auxiliar na revisão documental. Ele{' '}
          <span className="font-bold">não substitui a assessoria jurídica profissional</span>. Para
          questões críticas, formalização de contratos e proteção integral das partes, consulte
          sempre um advogado especializado.
        </p>
      </div>
    </div>
  )
}
