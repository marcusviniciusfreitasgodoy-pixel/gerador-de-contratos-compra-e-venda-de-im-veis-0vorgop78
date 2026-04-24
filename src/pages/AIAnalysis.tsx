import { useState, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Scale, FileText, Bot, Upload, FileWarning } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { AnalysisReportView, type AnalysisReport } from '@/components/AnalysisReportView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AIAnalysis() {
  const [text, setText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text')

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      document.body.appendChild(script)
      script.onload = async () => {
        try {
          const pdfjsLib = (window as any).pdfjsLib
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

          const arrayBuffer = await file.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
          let extractedText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(' ')
            extractedText += pageText + '\n\n'
          }
          resolve(extractedText)
        } catch (e) {
          reject(e)
        }
      }
      script.onerror = () => reject(new Error('Failed to load PDF.js'))
    })
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
      document.body.appendChild(script)
      script.onload = async () => {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const result = await (window as any).mammoth.extractRawText({ arrayBuffer })
          resolve(result.value)
        } catch (e) {
          reject(e)
        }
      }
      script.onerror = () => reject(new Error('Failed to load Mammoth.js'))
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReport(null)

    if (file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file)
      handleAnalyze({ image_base64: base64, fileName: file.name })
      return
    }

    setIsAnalyzing(true)
    toast.info('Extraindo texto do documento...')
    try {
      let extractedText = ''
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file)
      } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
        extractedText = await extractTextFromDOCX(file)
      } else if (file.type === 'text/plain') {
        extractedText = await file.text()
      } else {
        toast.error('Formato não suportado. Use PDF, DOCX, TXT ou Imagens.')
        setIsAnalyzing(false)
        return
      }

      setText(extractedText)
      setInputMode('text')
      toast.success('Texto extraído! Iniciando análise...')
      handleAnalyze({ text: extractedText, fileName: file.name })
    } catch (err) {
      setIsAnalyzing(false)
      toast.error('Erro ao ler o arquivo. Tente colar o texto manualmente.')
    }
  }

  const handleAnalyzeText = () => {
    if (!text.trim()) {
      toast.error('Insira o texto do contrato para análise.')
      return
    }
    handleAnalyze({ text, fileName: 'Texto Colado' })
  }

  const handleAnalyze = async (payload: {
    text?: string
    image_base64?: string
    fileName?: string
  }) => {
    setIsAnalyzing(true)
    setReport(null)
    try {
      const res = await pb.send('/backend/v1/ai/analyze-contract', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setReport(res.analysis)
      toast.success('Análise concluída com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao analisar o contrato.', {
        description: error.message || 'Verifique se a chave da API está configurada no backend.',
      })
    } finally {
      setIsAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Bot className="h-8 w-8 text-purple-600" />
          Análise Jurídica com IA
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          Faça upload de documentos (PDF, DOCX, Imagem) ou cole o texto. A IA identificará riscos,
          cláusulas abusivas e validará a estrutura do seu contrato imobiliário.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Entrada do Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Tabs
                value={inputMode}
                onValueChange={(v) => setInputMode(v as any)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">Texto</TabsTrigger>
                  <TabsTrigger value="file">Arquivo</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-4 flex flex-col h-[400px]">
                  <Textarea
                    placeholder="Cole aqui o conteúdo do contrato..."
                    className="flex-grow resize-none min-h-[300px]"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <Button
                    onClick={handleAnalyzeText}
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
                </TabsContent>

                <TabsContent value="file" className="mt-4 h-[400px]">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-purple-400 transition-colors group p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-lg mb-1">
                      Selecione um arquivo
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Suporta PDF, DOCX, Imagens (JPG/PNG) e TXT
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.docx,.txt,image/*"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {isAnalyzing ? (
            <Card className="h-full flex items-center justify-center min-h-[600px] border-dashed border-2">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto" />
                <p className="text-purple-700 font-semibold animate-pulse text-xl">
                  A IA está revisando o contrato...
                </p>
                <div className="text-sm text-slate-500 max-w-sm mx-auto space-y-2 text-left bg-slate-50 p-4 rounded-lg">
                  <p>✓ Lendo cláusulas e estruturando dados</p>
                  <p>✓ Consultando base jurisprudencial (RAG)</p>
                  <p>✓ Mapeando riscos estruturais e jurídicos</p>
                </div>
              </div>
            </Card>
          ) : report ? (
            !report.is_real_estate_contract ? (
              <Card className="h-full flex items-center justify-center min-h-[600px] bg-red-50 border-red-200">
                <div className="text-center space-y-4 px-6">
                  <FileWarning className="w-16 h-16 text-red-500 mx-auto" />
                  <h3 className="text-2xl font-bold text-red-800">Documento Inválido</h3>
                  <p className="text-red-600 text-lg max-w-md mx-auto">
                    Este não parece ser um contrato imobiliário. Envie um contrato de compra e
                    venda, aluguel ou similar.
                  </p>
                </div>
              </Card>
            ) : (
              <AnalysisReportView report={report} />
            )
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[600px] bg-slate-50 border-dashed">
              <div className="text-center space-y-4 px-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-purple-300">
                  <Scale size={40} />
                </div>
                <h3 className="text-xl font-medium text-slate-700">Nenhuma análise em andamento</h3>
                <p className="text-slate-500 text-base max-w-md mx-auto">
                  Faça o upload de um arquivo ou cole o texto ao lado para gerar o relatório
                  completo de conformidade e riscos.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
