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
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
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

      <Accordion
        type="multiple"
        defaultValue={['conformidade', 'riscos', 'omissoes', 'abusivas', 'recomendacoes']}
        className="w-full space-y-4"
      >
        {/* CONFORMIDADE */}
        <AccordionItem
          value="conformidade"
          className="bg-white border border-slate-200 rounded-lg shadow-sm px-4"
        >
          <AccordionTrigger className="hover:no-underline font-semibold text-lg text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Conformidade Essencial
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Cláusulas Presentes
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                  <ul className="space-y-2">
                    {report.conformidade?.clausulasEncontradas?.map((c, i) => (
                      <li
                        key={i}
                        className="text-sm text-green-900 flex items-start gap-2 bg-white p-2 rounded shadow-sm border border-green-50"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                    {!report.conformidade?.clausulasEncontradas?.length && (
                      <li className="text-sm text-slate-500 italic">
                        Nenhuma cláusula identificada.
                      </li>
                    )}
                  </ul>
                </ScrollArea>
              </div>
              <div className="bg-red-50/50 p-4 rounded-lg border border-red-100">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Cláusulas Ausentes
                </h4>
                <ScrollArea className="h-[200px] pr-4">
                  <ul className="space-y-2">
                    {report.conformidade?.clausulasFaltando?.map((c, i) => (
                      <li
                        key={i}
                        className="text-sm text-red-900 flex items-start gap-2 bg-white p-2 rounded shadow-sm border border-red-50"
                      >
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        {c}
                      </li>
                    ))}
                    {!report.conformidade?.clausulasFaltando?.length && (
                      <li className="text-sm text-slate-500 italic">Nenhuma cláusula ausente.</li>
                    )}
                  </ul>
                </ScrollArea>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* RISCOS */}
        <AccordionItem
          value="riscos"
          className="bg-white border border-slate-200 rounded-lg shadow-sm px-4"
        >
          <AccordionTrigger className="hover:no-underline font-semibold text-lg text-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Riscos Analisados
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.riscos?.map((risk, idx) => (
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
              {(!report.riscos || report.riscos.length === 0) && (
                <div className="col-span-full py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" /> Nenhum risco
                  significativo identificado.
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* OMISSÕES */}
        <AccordionItem
          value="omissoes"
          className="bg-white border border-slate-200 rounded-lg shadow-sm px-4"
        >
          <AccordionTrigger className="hover:no-underline font-semibold text-lg text-slate-800">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-orange-500" /> Omissões Importantes
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            {report.omissoes?.map((omission, idx) => (
              <Card key={idx} className="border-amber-200 shadow-sm">
                <CardHeader className="bg-amber-50/30 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-base text-amber-900 flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-amber-600" /> {omission.clausula}
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
                      toast.success('Copiado!')
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copiar redação padrão
                  </Button>
                </CardContent>
              </Card>
            ))}
            {(!report.omissoes || report.omissoes.length === 0) && (
              <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" /> Nenhuma omissão
                crítica identificada.
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ABUSIVAS */}
        <AccordionItem
          value="abusivas"
          className="bg-white border border-slate-200 rounded-lg shadow-sm px-4"
        >
          <AccordionTrigger className="hover:no-underline font-semibold text-lg text-slate-800">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" /> Cláusulas Abusivas
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 space-y-4">
            {report.clausulasAbusivas?.length > 0 ? (
              report.clausulasAbusivas.map((item, idx) => (
                <Card key={idx} className="border-red-200 shadow-sm">
                  <CardHeader className="bg-red-50/50 pb-4 border-b border-red-100">
                    <CardTitle className="text-base text-red-800 flex items-center gap-2">
                      <XCircle className="w-5 h-5" /> Cláusula Abusiva Detectada
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
                        <span className="font-semibold text-amber-700 block mb-1">
                          Recomendação:
                        </span>
                        <p className="text-slate-700 leading-relaxed">{item.recomendacao}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-8 text-center bg-green-50/30 rounded-xl border border-dashed border-green-200">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-lg font-medium text-green-800">
                  ✅ Nenhuma cláusula abusiva identificada
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* RECOMENDAÇÕES */}
        <AccordionItem
          value="recomendacoes"
          className="bg-white border border-slate-200 rounded-lg shadow-sm px-4"
        >
          <AccordionTrigger className="hover:no-underline font-semibold text-lg text-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Recomendações Finais
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 print:block hidden">
        <strong>AVISO JURÍDICO:</strong> Este relatório é gerado automaticamente por Inteligência
        Artificial e tem caráter puramente informativo e auxiliar. Não substitui a avaliação,
        revisão ou parecer de um advogado devidamente qualificado e inscrito na OAB.
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100 mt-8 print:hidden">
        <Button
          size="lg"
          onClick={() => {
            setTimeout(() => window.print(), 100)
          }}
          className="bg-slate-800 hover:bg-slate-900 w-full sm:w-auto"
        >
          <Download className="w-5 h-5 mr-2" /> Baixar relatório em PDF
        </Button>
      </div>
    </div>
  )
}
