import {
  AlertTriangle,
  CheckCircle,
  Info,
  ShieldAlert,
  XCircle,
  AlertOctagon,
  Copy,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
  risks: Array<{
    category: string
    title: string
    description: string
    severity: 'ALTO' | 'MÉDIO' | 'BAIXO'
  }>
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
  const hasCritical =
    report.structural_compliance?.some((c) => c.status === 'CRÍTICO') ||
    report.legal_compliance?.some((c) => c.status === 'CRÍTICO')
  const hasRisk =
    report.structural_compliance?.some((c) => c.status === 'RISCO') ||
    report.legal_compliance?.some((c) => c.status === 'RISCO')
  const generalStatus = hasCritical ? 'CRÍTICO' : hasRisk ? 'RISCO' : 'CONFORME'

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRÍTICO':
      case 'ALTO':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RISCO':
      case 'MÉDIO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFORME':
      case 'BAIXO':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-600" />
            Relatório de Compliance Jurídico
          </h2>
          <p className="text-slate-600 font-medium">{report.contract_type}</p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-white border border-slate-200 shadow-sm px-4 py-2 rounded-lg max-w-sm text-left md:text-right">
          <span className="block text-xs text-slate-400 uppercase tracking-wider mb-0.5">
            Partes
          </span>
          {report.parties}
        </div>
      </div>

      <Tabs defaultValue="conformidade" className="w-full">
        <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start lg:justify-center mb-6 h-auto p-1 bg-slate-100/80">
          <TabsTrigger value="conformidade" className="whitespace-nowrap px-4 py-2.5">
            Conformidade
          </TabsTrigger>
          <TabsTrigger value="riscos" className="whitespace-nowrap px-4 py-2.5">
            Riscos
          </TabsTrigger>
          <TabsTrigger value="omissoes" className="whitespace-nowrap px-4 py-2.5">
            Omissões
          </TabsTrigger>
          <TabsTrigger value="abusivas" className="whitespace-nowrap px-4 py-2.5">
            Cláusulas Abusivas
          </TabsTrigger>
          <TabsTrigger value="recomendacoes" className="whitespace-nowrap px-4 py-2.5">
            Recomendações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="conformidade" className="space-y-6 focus:outline-none">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Status Geral</CardTitle>
                <Badge className={cn('text-sm px-3 py-1', getRiskColor(generalStatus))}>
                  {generalStatus === 'CONFORME' && '✅ '}
                  {generalStatus === 'RISCO' && '⚠️ '}
                  {generalStatus === 'CRÍTICO' && '🔴 '}
                  {generalStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-8 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                <span className="font-semibold block mb-1">Resumo Executivo:</span>
                {report.summary}
              </p>

              <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-purple-600" /> Checklist Estrutural
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.structural_compliance?.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-lg border',
                      item.present ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-100',
                    )}
                  >
                    {item.present ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p
                        className={cn(
                          'font-medium mb-1',
                          item.present ? 'text-slate-800' : 'text-red-800',
                        )}
                      >
                        {item.clause}
                      </p>
                      <p className="text-sm text-slate-500 leading-snug">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="riscos" className="space-y-4 focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.risks?.map((risk, idx) => (
              <Card
                key={idx}
                className="border-l-4 shadow-sm"
                style={{
                  borderLeftColor:
                    risk.severity === 'ALTO'
                      ? '#ef4444'
                      : risk.severity === 'MÉDIO'
                        ? '#f59e0b'
                        : '#3b82f6',
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className={cn(
                          'w-5 h-5 mt-0.5 shrink-0',
                          risk.severity === 'ALTO'
                            ? 'text-red-500'
                            : risk.severity === 'MÉDIO'
                              ? 'text-yellow-500'
                              : 'text-blue-500',
                        )}
                      />
                      <CardTitle className="text-base leading-tight">{risk.title}</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('shrink-0', getRiskColor(risk.severity))}
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-3">{risk.description}</p>
                  <Badge
                    variant="secondary"
                    className="text-xs uppercase tracking-wider bg-slate-100 text-slate-500 hover:bg-slate-100 border-0"
                  >
                    {risk.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {(!report.risks || report.risks.length === 0) && (
              <div className="col-span-full py-16 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                Nenhum risco significativo identificado.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="omissoes" className="space-y-4 focus:outline-none">
          {report.omissions?.map((omission, idx) => (
            <Card key={idx} className="border-amber-200 shadow-sm">
              <CardHeader className="bg-amber-50/30 pb-4">
                <CardTitle className="text-base text-amber-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-amber-600" />
                  {omission.missing_item}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-700 shadow-sm">
                  <span className="block font-semibold mb-2 text-slate-800">
                    Sugestão de Redação (Template):
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {omission.drafting_suggestion}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-slate-700"
                  onClick={() => {
                    navigator.clipboard.writeText(omission.drafting_suggestion)
                    toast.success('Copiado para a área de transferência!')
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar redação padrão
                </Button>
              </CardContent>
            </Card>
          ))}
          {(!report.omissions || report.omissions.length === 0) && (
            <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              Nenhuma omissão crítica identificada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="abusivas" className="space-y-4 focus:outline-none">
          {report.abusive_clauses?.length > 0 ? (
            report.abusive_clauses.map((item, idx) => (
              <Card key={idx} className="border-red-200 shadow-sm">
                <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
                  <CardTitle className="text-base text-red-800 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Cláusula Abusiva Detectada
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                      Texto Original
                    </span>
                    <div className="bg-slate-100 p-4 rounded-md italic text-sm text-slate-700 border border-slate-200">
                      "{item.clause}"
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="font-semibold text-red-700 block mb-1">Violação Legal:</span>
                      <p className="text-slate-700 leading-relaxed">{item.violation}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-amber-700 block mb-1">Recomendação:</span>
                      <p className="text-slate-700 leading-relaxed">{item.recommendation}</p>
                    </div>
                  </div>
                  {item.drafting_suggestion && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm mt-2">
                      <span className="font-semibold text-green-800 block mb-2">
                        Sugestão de Nova Redação:
                      </span>
                      <p className="text-green-900 leading-relaxed">{item.drafting_suggestion}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-16 text-center bg-green-50/30 rounded-xl border border-dashed border-green-200">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-800">
                ✅ Nenhuma cláusula abusiva identificada
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recomendacoes" className="space-y-6 focus:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-red-100 shadow-sm h-full">
              <CardHeader className="bg-red-50/50 border-b border-red-100 pb-4">
                <CardTitle className="text-base text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Ações Imediatas
                  <span className="text-xs font-normal text-red-600 ml-auto hidden sm:inline">
                    (Antes de Assinar)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-4">
                  {report.recommendations?.immediate?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                  {(!report.recommendations?.immediate ||
                    report.recommendations.immediate.length === 0) && (
                    <li className="text-sm text-slate-500 italic">
                      Nenhuma ação imediata pendente.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 shadow-sm h-full">
              <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
                <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Ações Recomendadas
                  <span className="text-xs font-normal text-blue-600 ml-auto hidden sm:inline">
                    (Melhorias)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-4">
                  {report.recommendations?.recommended?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                  {(!report.recommendations?.recommended ||
                    report.recommendations.recommended.length === 0) && (
                    <li className="text-sm text-slate-500 italic">
                      Nenhuma recomendação adicional.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-100 mt-8">
            <Button
              size="lg"
              onClick={() => window.print()}
              className="bg-slate-800 hover:bg-slate-900 w-full sm:w-auto"
            >
              <Download className="w-5 h-5 mr-2" /> Baixar relatório completo em PDF
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
