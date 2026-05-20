import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText, AlertCircle } from 'lucide-react'

interface PreviewPDFModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  content?: string | null
  loading: boolean
  onDownload: () => void
  title?: string
  error?: string | null
}

export function PreviewPDFModal({
  open,
  onOpenChange,
  pdfUrl,
  content,
  loading,
  onDownload,
  title = 'Visualização Prévia do Documento',
  error = null,
}: PreviewPDFModalProps) {
  const cleanContent = content
    ? content
        .replace(/<br\s*[/]?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/#/g, '')
        .replace(/\n\s*\n/g, '\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-6 h-6 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">Prévia do documento em PDF</DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-slate-800 text-lg font-semibold">
                Processando inteligência artificial e gerando PDF...
              </p>
              <p className="text-slate-500 mt-2 text-sm max-w-md">
                Isso pode levar alguns segundos dependendo da complexidade do documento e das regras
                de compliance aplicadas.
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-md animate-in fade-in zoom-in-95">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Erro ao gerar prévia</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Voltar para Edição
              </Button>
            </div>
          ) : content ? (
            <div className="w-full h-full overflow-y-auto bg-slate-200/50 p-4 sm:p-8 flex justify-center animate-in fade-in">
              <div
                className="bg-white shadow-md w-full max-w-[800px] min-h-[1056px] p-8 sm:p-12 text-slate-800 text-sm leading-relaxed"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
              >
                <div className="border-b-2 border-[#D4AF37] pb-4 mb-8 text-center">
                  <h2 className="text-xl font-bold text-[#0C2340] mb-2">PRÉVIA DO DOCUMENTO</h2>
                  <p className="text-xs text-slate-500">
                    O documento final em PDF conterá a formatação oficial e os cabeçalhos/rodapés da
                    imobiliária.
                  </p>
                </div>
                <div className="whitespace-pre-wrap max-w-none text-slate-700 font-medium text-justify">
                  {cleanContent}
                </div>
              </div>
            </div>
          ) : pdfUrl ? (
            <object
              data={`${pdfUrl}#toolbar=0`}
              type="application/pdf"
              className="w-full h-full border-0 animate-in fade-in"
            >
              <iframe
                src={`${pdfUrl}#toolbar=0`}
                className="w-full h-full border-0"
                title="PDF Preview"
              />
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6">
              <p className="text-slate-500 font-medium">A prévia não está disponível no momento.</p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Voltar para Edição
          </Button>
          <Button
            onClick={onDownload}
            disabled={!pdfUrl || loading || !!error}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
