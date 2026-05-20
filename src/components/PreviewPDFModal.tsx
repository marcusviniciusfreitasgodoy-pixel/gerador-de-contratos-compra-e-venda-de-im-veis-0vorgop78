import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Download, FileText } from 'lucide-react'

interface PreviewPDFModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string | null
  loading: boolean
  onDownload: () => void
  title?: string
}

export function PreviewPDFModal({
  open,
  onOpenChange,
  pdfUrl,
  loading,
  onDownload,
  title = 'Visualização do Documento',
}: PreviewPDFModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription className="sr-only">Prévia do documento em PDF</DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-slate-100 flex items-center justify-center relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-slate-600 font-medium">Gerando prévia do documento...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <p className="text-slate-500">Não foi possível carregar a prévia.</p>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-white flex-shrink-0 sm:justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar para Edição
          </Button>
          <Button onClick={onDownload} disabled={!pdfUrl || loading}>
            <Download className="w-4 h-4 mr-2" />
            Baixar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
