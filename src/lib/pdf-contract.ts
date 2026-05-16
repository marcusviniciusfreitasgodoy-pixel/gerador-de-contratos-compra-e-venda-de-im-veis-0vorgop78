import { jsPDF } from 'jspdf'

export function generateContractPDF(text: string, fileName: string) {
  try {
    const doc = new jsPDF()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)

    const margin = 20
    const pageWidth = 210
    const contentWidth = pageWidth - margin * 2
    const pageHeight = 297

    const safeText = String(text || '').replace(/•/g, '-')
    const lines = doc.splitTextToSize(safeText, contentWidth)

    let y = 20
    for (const line of lines) {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = 20
      }
      doc.text(line, margin, y)
      y += 6
    }

    doc.save(fileName)
  } catch (err) {
    console.error('Error generating PDF', err)
  }
}
