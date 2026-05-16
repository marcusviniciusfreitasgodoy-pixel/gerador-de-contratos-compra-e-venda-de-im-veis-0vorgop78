import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export async function generateMinutaPDF(minutaText: string, fileName: string): Promise<void> {
  return new Promise((resolve) => {
    const doc = new jsPDF()
    let y = 20
    const margin = 20
    const pageWidth = 210
    const contentWidth = pageWidth - margin * 2
    const pageHeight = 297

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(minutaText, contentWidth)

    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - 20) {
        doc.addPage()
        y = 20
      }
      doc.text(lines[i], margin, y)
      y += 6
    }

    doc.save(`${fileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    resolve()
  })
}

export async function generateAnalysisPDF(report: any, contract: any): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF()
      let y = 20
      const margin = 20
      const pageWidth = 210
      const contentWidth = pageWidth - margin * 2
      const pageHeight = 297

      const addFooter = () => {
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i)
          doc.setFontSize(8)
          doc.setTextColor(100, 100, 100)
          const footerText =
            'AVISO JURÍDICO: Esta análise é suporte informativo. Não substitui assessoria jurídica profissional.'
          doc.text(footerText, margin, pageHeight - 10)
          const dateText = `Gerado em ${format(new Date(), 'dd/MM/yyyy')} - Godoy Prime Realty`
          doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText), pageHeight - 10)
        }
      }

      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
      }

      const addText = (
        text: string,
        size: number,
        isBold: boolean,
        color: number[],
        indent = 0,
      ) => {
        const safeText = String(text || '')
          .replace(/•/g, '-')
          .replace(/✅/g, '[V]')
          .replace(/⚠️/g, '[!]')
          .replace(/🔴/g, '[X]')
        if (!safeText.trim()) return
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setFontSize(size)
        doc.setTextColor(color[0], color[1], color[2])
        const lines = doc.splitTextToSize(safeText, contentWidth - indent)
        checkPageBreak(lines.length * (size * 0.4) + 2)
        doc.text(lines, margin + indent, y)
        y += lines.length * (size * 0.4) + 2
      }

      const addSectionTitle = (title: string, forceBreak = true) => {
        if (forceBreak && y > 40) {
          doc.addPage()
          y = 20
        } else {
          checkPageBreak(20)
        }
        y += 5
        addText(title, 14, true, [0, 0, 0])
        y += 2
      }

      // Header
      addText('ANÁLISE JURÍDICA DE CONTRATO', 16, true, [0, 0, 0])
      y += 5

      addText(`Data da Análise: ${format(new Date(), 'dd/MM/yyyy')}`, 11, false, [50, 50, 50])
      addText(`Tipo de Contrato: ${contract?.tipo || 'Não especificado'}`, 11, false, [50, 50, 50])
      addText(`Vendedor: ${contract?.nome_vendedor || 'Não especificado'}`, 11, false, [50, 50, 50])
      addText(
        `Comprador: ${contract?.nome_comprador || 'Não especificado'}`,
        11,
        false,
        [50, 50, 50],
      )
      y += 5

      // Section 1
      addSectionTitle('1. CONFORMIDADE ESTRUTURAL', false)
      const status = report?.conformidade?.status?.toUpperCase() || 'DESCONHECIDO'
      let statusColor = [100, 100, 100]
      let statusLabel = status
      if (status === 'CONFORME' || status === 'BAIXO') {
        statusColor = [34, 197, 94]
        statusLabel = '[V] ' + status
      } else if (status === 'RISCO' || status === 'MEDIO' || status === 'MÉDIO') {
        statusColor = [245, 158, 11]
        statusLabel = '[!] ' + status
      } else if (status === 'CRITICO' || status === 'CRÍTICO' || status === 'ALTO') {
        statusColor = [239, 68, 68]
        statusLabel = '[X] ' + status
      }

      addText(`Status Geral: ${statusLabel}`, 12, true, statusColor)
      y += 2

      addText('Cláusulas Encontradas:', 11, true, [0, 0, 0])
      if (!report?.conformidade?.clausulasEncontradas?.length) {
        addText('Nenhuma', 11, false, [100, 100, 100], 5)
      } else {
        report.conformidade.clausulasEncontradas.forEach((c: string) => {
          addText(`[V] ${c}`, 11, false, [34, 197, 94], 5)
        })
      }
      y += 2

      addText('Cláusulas Faltando:', 11, true, [0, 0, 0])
      if (!report?.conformidade?.clausulasFaltando?.length) {
        addText('Nenhuma', 11, false, [100, 100, 100], 5)
      } else {
        report.conformidade.clausulasFaltando.forEach((c: string) => {
          addText(`[X] ${c}`, 11, false, [239, 68, 68], 5)
        })
      }

      // Section 2
      addSectionTitle('2. RISCOS IDENTIFICADOS', true)
      if (!report?.riscos || report.riscos.length === 0) {
        addText('Nenhum risco significativo identificado.', 11, false, [34, 197, 94])
      } else {
        report.riscos.forEach((r: any) => {
          let rColor = [50, 50, 50]
          const sev = r.severidade?.toUpperCase()
          if (sev === 'ALTO') rColor = [239, 68, 68]
          else if (sev === 'MEDIO' || sev === 'MÉDIO') rColor = [245, 158, 11]
          else if (sev === 'BAIXO') rColor = [34, 197, 94]

          addText(`${r.titulo} (${r.severidade})`, 11, true, rColor)
          addText(r.descricao, 11, false, [50, 50, 50])
          if (r.embasamento) {
            addText(`Embasamento: ${r.embasamento}`, 10, false, [100, 100, 100], 5)
          }
          y += 3
        })
      }

      // Section 3
      addSectionTitle('3. CLÁUSULAS ABUSIVAS', true)
      if (!report?.clausulasAbusivas || report.clausulasAbusivas.length === 0) {
        addText('Nenhuma cláusula abusiva identificada.', 11, false, [34, 197, 94])
      } else {
        report.clausulasAbusivas.forEach((a: any) => {
          addText(`Texto: "${a.texto}"`, 11, false, [239, 68, 68])
          addText(`Motivo: ${a.motivo}`, 11, false, [50, 50, 50])
          addText(`Recomendação: ${a.recomendacao}`, 11, false, [245, 158, 11])
          y += 3
        })
      }

      // Section 4
      addSectionTitle('4. OMISSÕES', true)
      if (!report?.omissoes || report.omissoes.length === 0) {
        addText('Nenhuma omissão crítica identificada.', 11, false, [34, 197, 94])
      } else {
        report.omissoes.forEach((o: any) => {
          addText(`${o.clausula} (${o.importancia})`, 11, true, [245, 158, 11])
          addText(`Sugestão: ${o.redacaoPadrao}`, 11, false, [50, 50, 50], 5)
          y += 3
        })
      }

      // Section 5
      addSectionTitle('5. RECOMENDAÇÕES', true)
      addText('Imediatas:', 11, true, [239, 68, 68])
      if (!report?.recomendacoes?.imediatas?.length) {
        addText('- Nenhuma', 11, false, [50, 50, 50], 5)
      } else {
        report.recomendacoes.imediatas.forEach((r: string) => {
          addText(`- ${r}`, 11, false, [50, 50, 50], 5)
        })
      }
      y += 3
      addText('Recomendadas:', 11, true, [34, 197, 94])
      if (!report?.recomendacoes?.recomendadas?.length) {
        addText('- Nenhuma', 11, false, [50, 50, 50], 5)
      } else {
        report.recomendacoes.recomendadas.forEach((r: string) => {
          addText(`- ${r}`, 11, false, [50, 50, 50], 5)
        })
      }

      addFooter()

      const typeStr = (contract?.tipo || 'Contrato').replace(/\s+/g, '_')
      const dateStr = format(new Date(), 'yyyy-MM-dd')
      doc.save(`Analise_Juridica_${typeStr}_${dateStr}.pdf`)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
