import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FileText, UploadCloud, AlertCircle, RefreshCcw, Bot, History } from 'lucide-react'
import { toast } from 'sonner'
import { Link, useSearchParams, Navigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { AnalysisReportView, type AnalysisReport } from '@/components/AnalysisReportView'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function AIAnalysis() {
  const { user, loading: authLoading } = useAuth()
  const [searchParams] = useSearchParams()
  const contractIdParam = searchParams.get('contractId')

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [contractText, setContractText] = useState<string | null>(null)
  const [contractType, setContractType] = useState<string>('a_vista')
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (contractIdParam) {
      pb.collection('contracts')
        .getOne(contractIdParam)
        .then((contract) => {
          if (contract.minuta_texto) {
            setContractText(contract.minuta_texto)
            const typeMap: Record<string, string> = {
              'À Vista': 'a_vista',
              Financiado: 'financiado',
            }
            setContractType(typeMap[contract.tipo] || contract.tipo || 'outro')
          }
        })
        .catch(console.error)
    }
  }, [contractIdParam])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleAnalyzeFile = async () => {
    if (!selectedFile && !contractText) return
    setIsAnalyzing(true)
    setErrorMsg(null)
    setReport(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      let base64Data = ''
      let tipo = 'outro'
      let fileName = 'contrato_gerado.txt'

      if (selectedFile) {
        if (selectedFile.type === 'application/pdf') tipo = 'pdf'
        else if (
          selectedFile.name.endsWith('.docx') ||
          selectedFile.type.includes('wordprocessingml')
        )
          tipo = 'docx'
        else if (selectedFile.type.startsWith('image/')) tipo = 'imagem'

        fileName = selectedFile.name
        const b64 = await fileToBase64(selectedFile)
        base64Data = b64.split(',')[1] || b64
      } else if (contractText) {
        tipo = 'txt'
        base64Data = btoa(unescape(encodeURIComponent(contractText)))
      }

      const payload = {
        arquivo: base64Data,
        tipo,
        tipoContrato: contractType,
        fileName,
        contractId: contractIdParam || undefined,
      }

      const res = await pb.send('/backend/v1/analisar-contrato', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (res.error) {
        const msg =
          'Unable to analyze the document. Please ensure the file contains readable text or check your AI configuration.'
        setErrorMsg(msg)
        toast.error(msg)
      } else {
        setReport(res)
        toast.success('Análise concluída com sucesso!')
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error(error)
      const msg =
        'Unable to analyze the document. Please ensure the file contains readable text or check your AI configuration.'
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (authLoading) return null
  if (!user) return <Navigate to="/login" />

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4">
          <Bot className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 tracking-tight">
          Análise Jurídica com IA
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Faça upload do seu contrato imobiliário e receba um relatório completo de riscos, omissões
          e conformidade legal.
        </p>
        <div className="mt-6">
          <Button variant="outline" asChild className="rounded-full shadow-sm">
            <Link to="/history">
              <History className="w-4 h-4 mr-2" /> Ver Histórico de Análises
            </Link>
          </Button>
        </div>
      </div>

      {!report && !isAnalyzing && !errorMsg && (
        <Card className="max-w-2xl mx-auto border-0 shadow-lg ring-1 ring-slate-200/50">
          <div className="p-8">
            <div className="mb-6 space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tipo de Contrato</label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_vista">Compra e Venda (À Vista)</SelectItem>
                  <SelectItem value="financiado">Compra e Venda (Financiado)</SelectItem>
                  <SelectItem value="aluguel">Aluguel / Locação</SelectItem>
                  <SelectItem value="promessa">Promessa de Compra e Venda</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 relative mt-4',
                isDragging
                  ? 'border-purple-500 bg-purple-50 scale-[1.02]'
                  : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400',
                selectedFile && !isDragging && 'border-purple-300 bg-purple-50/30',
              )}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                const f = e.dataTransfer.files?.[0]
                if (f) setSelectedFile(f)
              }}
            >
              {selectedFile ? (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                  <div className="p-4 bg-white rounded-full shadow-sm">
                    <FileText className="w-12 h-12 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-lg truncate max-w-xs px-4">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(null)
                    }}
                    className="mt-2"
                  >
                    Trocar Arquivo
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700 mb-2">
                    Arraste e solte seu contrato aqui
                  </h3>
                  <p className="text-slate-500 mb-8">Suporta PDF, DOCX, JPG e PNG</p>
                  <Button variant="secondary" className="px-8 pointer-events-none">
                    Selecionar Arquivo
                  </Button>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) {
                    setSelectedFile(f)
                    setContractText(null)
                  }
                }}
                accept=".pdf,.docx,.jpg,.jpeg,.png,.txt"
              />
            </div>

            {contractText && !selectedFile && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-slate-800">Contrato Carregado do Sistema</p>
                    <p className="text-sm text-slate-500">Pronto para análise</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setContractText(null)}>
                  Remover
                </Button>
              </div>
            )}

            {(selectedFile || contractText) && (
              <div className="mt-8 flex justify-center animate-in slide-in-from-bottom-4 duration-300">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 h-14 text-lg w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
                  onClick={handleAnalyzeFile}
                >
                  Analisar com IA Jurídica
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {isAnalyzing && (
        <div className="max-w-2xl mx-auto space-y-8 text-center py-16 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
            <Bot className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-purple-800 animate-pulse tracking-tight">
            Analisando contrato... Aguarde
          </h3>
          <div className="max-w-md mx-auto space-y-4 pt-4">
            <Skeleton className="h-4 w-full bg-purple-100/50 rounded-full" />
            <Skeleton className="h-4 w-5/6 mx-auto bg-purple-100/50 rounded-full" />
            <Skeleton className="h-4 w-4/6 mx-auto bg-purple-100/50 rounded-full" />
          </div>
          <p className="text-slate-500 text-sm mt-8 max-w-sm mx-auto">
            Nossa IA está cruzando o texto com a legislação e jurisprudência... Pode levar até 30
            segundos.
          </p>
        </div>
      )}

      {errorMsg && (
        <Card className="max-w-2xl mx-auto border-red-200 shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-800 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              {errorMsg}
            </p>
            <div className="pt-4">
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 px-8"
                onClick={() => {
                  setErrorMsg(null)
                }}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Tentar novamente
              </Button>
            </div>
          </div>
        </Card>
      )}

      {report && !isAnalyzing && !errorMsg && <AnalysisReportView report={report} />}
    </div>
  )
}
