import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export function generateContractPDF(text: string, fileName: string) {
  try {
    const doc = new jsPDF()
    const margin = 20
    const pageWidth = 210
    const contentWidth = pageWidth - margin * 2
    const pageHeight = 297

    const addHeader = (d: jsPDF) => {
      d.setFont('helvetica', 'bold')
      d.setFontSize(15)
      d.setTextColor(15, 23, 42) // slate-900
      d.text('GODOY PRIME REALTY', pageWidth / 2, 18, { align: 'center' })
      d.setFontSize(9)
      d.setTextColor(100, 116, 139) // slate-500
      d.text('Master Contract Framework • Assessoria Jurídica Imobiliária', pageWidth / 2, 23, {
        align: 'center',
      })
      d.setDrawColor(226, 232, 240) // slate-200
      d.setLineWidth(0.5)
      d.line(margin, 28, pageWidth - margin, 28)
    }

    const addFooter = (d: jsPDF, pageNum: number, total: number) => {
      d.setDrawColor(226, 232, 240)
      d.setLineWidth(0.5)
      d.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25)

      d.setFont('helvetica', 'normal')
      d.setFontSize(8)
      d.setTextColor(148, 163, 184)

      // Left: QR Code Placeholder
      d.text('[ QR CODE VALIDATION ]', margin, pageHeight - 15)

      // Center: Pagination
      d.text(`Página ${pageNum} de ${total}`, pageWidth / 2, pageHeight - 15, { align: 'center' })

      // Right: Timestamp
      d.text(
        `Emitido em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        pageWidth - margin,
        pageHeight - 15,
        { align: 'right' },
      )
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(30, 41, 59) // slate-800
    const lineHeight = 6

    const safeText = String(text || '').replace(/•/g, '-')
    const lines = doc.splitTextToSize(safeText, contentWidth)

    let y = 40
    addHeader(doc)

    for (const line of lines) {
      if (y > pageHeight - 35) {
        doc.addPage()
        addHeader(doc)
        y = 40
      }

      // Simple logic to detect Headings and Clauses
      if (line.trim().length > 0 && line === line.toUpperCase() && !line.includes('___')) {
        doc.setFont('helvetica', 'bold')
      } else {
        doc.setFont('helvetica', 'normal')
      }

      doc.text(line, margin, y)
      y += lineHeight
    }

    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(doc, i, totalPages)
    }

    doc.save(fileName)
  } catch (err) {
    console.error('Error generating PDF', err)
  }
}
