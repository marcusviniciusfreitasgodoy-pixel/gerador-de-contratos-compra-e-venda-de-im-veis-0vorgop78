import { AlertTriangle, CheckCircle, Info, ShieldAlert, XCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export interface AnalysisReport {
  summary: string
  overall_risk: 'baixo' | 'medio' | 'alto' | 'critico'
  missing_clauses: string[]
  findings: Array<{
    clause: string
    risk_level: 'critico' | 'alto' | 'medio'
    description: string
    legal_basis: string
    recommendation: string
  }>
}

export function AnalysisReportView({ report }: { report: AnalysisReport }) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critico':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'alto':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'medio':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'baixo':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critico':
        return 'Crítico'
      case 'alto':
        return 'Alto'
      case 'medio':
        return 'Médio'
      case 'baixo':
        return 'Baixo'
      default:
        return 'Desconhecido'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critico':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'alto':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'medio':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      default:
        return <Info className="h-5 w-5 text-slate-600" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="border-t-4 border-t-purple-600 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              Resumo Executivo
            </CardTitle>
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm font-semibold uppercase tracking-wider ${getRiskColor(report.overall_risk)}`}
            >
              Risco Global: {getRiskLabel(report.overall_risk)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {report.missing_clauses && report.missing_clauses.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cláusulas Essenciais Ausentes</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {report.missing_clauses.map((clause, idx) => (
                <li key={idx}>{clause}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Apontamentos</h3>
        {!report.findings || report.findings.length === 0 ? (
          <p className="text-slate-500">Nenhum apontamento encontrado pela análise.</p>
        ) : (
          report.findings.map((finding, idx) => (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getRiskIcon(finding.risk_level)}</div>
                    <div>
                      <CardTitle className="text-base text-slate-800">{finding.clause}</CardTitle>
                      <CardDescription className="mt-1 text-sm text-slate-600 font-medium">
                        Base Legal: {finding.legal_basis}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={getRiskColor(finding.risk_level)}>
                    {getRiskLabel(finding.risk_level)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                <p className="text-sm text-slate-700">{finding.description}</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Recomendação Prática
                  </span>
                  <p className="text-sm text-slate-800 mt-1">{finding.recommendation}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-8 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed font-medium">
          ⚠️ AVISO JURÍDICO: Esta análise é gerada por Inteligência Artificial para suporte
          informativo. Não substitui, em hipótese alguma, a assessoria jurídica profissional e a
          revisão humana qualificada.
        </p>
      </div>
    </div>
  )
}
