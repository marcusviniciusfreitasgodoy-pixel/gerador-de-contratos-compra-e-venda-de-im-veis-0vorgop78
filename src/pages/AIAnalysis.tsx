import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Scale, FileText, Bot } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { AnalysisReportView, type AnalysisReport } from '@/components/AnalysisReportView'

export default function AIAnalysis() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AnalysisReport | null>(null)

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Insira o texto do contrato para análise.')
      return
    }

    setIsAnalyzing(true)
    try {
      const res = await pb.send('/backend/v1/ai/analyze-contract', {
        method: 'POST',
        body: JSON.stringify({ text }),
      })
      setReport(res.analysis)
      toast.success('Análise concluída com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao analisar o contrato.', {
        description: error.message || 'Verifique se a chave da API está configurada no backend.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Bot className="h-8 w-8 text-purple-600" />
          Análise Jurídica com IA
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Analise contratos imobiliários para identificar riscos e validar cláusulas essenciais
          baseando-se na legislação e jurisprudência brasileira.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documento
              </CardTitle>
              <CardDescription>
                Cole o texto do contrato abaixo para iniciar a análise inteligente.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-100px)]">
              <Textarea
                placeholder="Ex: Pelo presente instrumento particular de compra e venda..."
                className="flex-grow min-h-[400px] resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !text.trim()}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 h-12 shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analisando...
                  </>
                ) : (
                  <>
                    <Scale className="w-5 h-5 mr-2" /> Iniciar Análise
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isAnalyzing ? (
            <Card className="h-full flex items-center justify-center min-h-[500px] border-dashed border-2">
              <div className="text-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" />
                <p className="text-slate-600 font-medium animate-pulse text-lg">
                  A IA está revisando o contrato...
                </p>
                <p className="text-sm text-slate-400 max-w-sm mx-auto px-4">
                  Buscando na base de conhecimento jurisprudência do RJ, cláusulas obrigatórias e
                  potenciais riscos.
                </p>
              </div>
            </Card>
          ) : report ? (
            <AnalysisReportView report={report} />
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[500px] bg-slate-50 border-dashed">
              <div className="text-center space-y-4 px-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-purple-300">
                  <Scale size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-700">Nenhuma análise em andamento</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Insira o texto ao lado e inicie a análise para ver o relatório estruturado de
                  riscos e conformidade jurídica.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
