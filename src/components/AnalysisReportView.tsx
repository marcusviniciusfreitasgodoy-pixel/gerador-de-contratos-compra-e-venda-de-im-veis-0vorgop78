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
  conformidade: {
    status: 'conforme' | 'risco' | 'critico' | string
    clausulasEncontradas: string[]
    clausulasFaltando: string[]
  }
  riscos: Array<{
    titulo: string
    descricao: string
    severidade: 'ALTO' | 'MEDIO' | 'BAIXO' | string
    embasamento: string
  }>
  omissoes: Array<{
    clausula: string
    importancia: 'CRITICA' | 'IMPORTANTE' | 'RECOMENDADA' | string
    redacaoPadrao: string
  }>
  clausulasAbusivas: Array<{
    texto: string
    motivo: string
    recomendacao: string
  }>
  recomendacoes: {
    imediatas: string[]
    recomendadas: string[]
  }
  reportId?: string
}

export function AnalysisReportView({ report }: { report: AnalysisReport }) {
  const generalStatus = report.conformidade?.status?.toUpperCase() || 'DESCONHECIDO'

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICO':
      case 'CRÍTICO':
      case 'ALTO':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'RISCO':
      case 'MEDIO':
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
        </div>
        <Badge className={cn('text-sm px-4 py-1.5 shadow-sm', getRiskColor(generalStatus))}>
          Status: {generalStatus}
        </Badge>
      </div>

      <Tabs defaultValue="conformidade" className="w-full">
        <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start lg:justify-center mb-6 h-auto p-1 bg-slate-100/80">
          <TabsTrigger value="conformidade" className="whitespace-nowrap px-4 py-2.5">
            Conformidade
          </TabsTrigger>
          <TabsTrigger value="riscos" className="whitespace-nowrap px-4 py-2.5">
            Riscos Analisados
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
            <CardHeader>
              <CardTitle className="text-lg">Cláusulas Essenciais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Presentes
                  </h4>
                  <ul className="space-y-2">
                    {report.conformidade?.clausulasEncontradas?.map((c, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-700 flex items-start gap-2 bg-green-50/50 p-2 rounded border border-green-100"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                    {!report.conformidade?.clausulasEncontradas?.length && (
                      <li className="text-sm text-slate-500 italic">
                        Nenhuma cláusula identificada corretamente.
                      </li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Ausentes
                  </h4>
                  <ul className="space-y-2">
                    {report.conformidade?.clausulasFaltando?.map((c, i) => (
                      <li
                        key={i}
                        className="text-sm text-slate-700 flex items-start gap-2 bg-red-50/50 p-2 rounded border border-red-100"
                      >
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                    {!report.conformidade?.clausulasFaltando?.length && (
                      <li className="text-sm text-slate-500 italic">
                        Nenhuma cláusula essencial ausente.
                      </li>
                    )}
                  </ul>
                </div>
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
                    risk.severidade?.toUpperCase() === 'ALTO'
                      ? '#ef4444'
                      : risk.severidade?.toUpperCase() === 'MEDIO'
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
                          risk.severidade?.toUpperCase() === 'ALTO'
                            ? 'text-red-500'
                            : risk.severidade?.toUpperCase() === 'MEDIO'
                              ? 'text-yellow-500'
                              : 'text-blue-500',
                        )}
                      />
                      <CardTitle className="text-base leading-tight">{risk.titulo}</CardTitle>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('shrink-0', getRiskColor(risk.severidade))}
                    >
                      {risk.severidade}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">{risk.descricao}</p>
                  {risk.embasamento && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs text-slate-500 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{risk.embasamento}</span>
                    </div>
                  )}
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
          {report.omissoes?.map((omission, idx) => (
            <Card key={idx} className="border-amber-200 shadow-sm">
              <CardHeader className="bg-amber-50/30 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base text-amber-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-amber-600" />
                  {omission.clausula}
                </CardTitle>
                <Badge variant="outline" className="bg-white">
                  {omission.importancia}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm text-slate-700 shadow-sm">
                  <span className="block font-semibold mb-2 text-slate-800">
                    Sugestão de Redação:
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{omission.redacaoPadrao}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto text-slate-700"
                  onClick={() => {
                    navigator.clipboard.writeText(omission.redacaoPadrao)
                    toast.success('Copiado para a área de transferência!')
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" /> Copiar redação padrão
                </Button>
              </CardContent>
            </Card>
          ))}
          {(!report.omissoes || report.omissoes.length === 0) && (
            <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              Nenhuma omissão crítica identificada.
            </div>
          )}
        </TabsContent>

        <TabsContent value="abusivas" className="space-y-4 focus:outline-none">
          {report.clausulasAbusivas?.length > 0 ? (
            report.clausulasAbusivas.map((item, idx) => (
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
                      Texto Encontrado
                    </span>
                    <div className="bg-slate-100 p-4 rounded-md italic text-sm text-slate-700 border border-slate-200">
                      "{item.texto}"
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="font-semibold text-red-700 block mb-1">Motivo:</span>
                      <p className="text-slate-700 leading-relaxed">{item.motivo}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-amber-700 block mb-1">Recomendação:</span>
                      <p className="text-slate-700 leading-relaxed">{item.recomendacao}</p>
                    </div>
                  </div>
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
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-4">
                  {report.recomendacoes?.imediatas?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                  {(!report.recomendacoes?.imediatas ||
                    report.recomendacoes.imediatas.length === 0) && (
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
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <ul className="space-y-4">
                  {report.recomendacoes?.recomendadas?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                  {(!report.recomendacoes?.recomendadas ||
                    report.recomendacoes.recomendadas.length === 0) && (
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
              <Download className="w-5 h-5 mr-2" /> Baixar relatório em PDF
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
