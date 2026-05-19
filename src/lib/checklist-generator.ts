import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export function generateChecklistHTML(data: any): string {
  const isVendedorPJ = data.vendedor_pj
  const isVendedorUniao =
    data.vendedor_uniao_estavel ||
    data.estado_civil_vendedor === 'Casado' ||
    data.estado_civil_vendedor === 'Casada'
  const isCompradorUniao =
    data.comprador_uniao_estavel ||
    data.estado_civil_comprador === 'Casado' ||
    data.estado_civil_comprador === 'Casada'

  let html = `<!-- CHECKLIST_FORMAT -->\n`
  html += `<div style="font-family: sans-serif; color: #0C2340;">\n`
  html += `<h2 style="color: #D4AF37; text-align: center; margin-bottom: 20px; font-weight: bold;">CHECKLIST DE DUE DILIGENCE</h2>\n`

  const addSection = (title: string, items: string[]) => {
    html += `<div class="checklist-block" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">\n`
    html += `<h3 style="color: #0C2340; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">${title}</h3>\n`
    html += `<ul style="list-style-type: none; padding-left: 0;">\n`
    items.forEach((item) => {
      html += `<li style="margin-bottom: 8px; display: flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; border: 1px solid #94a3b8; border-radius: 2px; margin-right: 12px;"></span>${item}</li>\n`
    })
    html += `</ul>\n</div>\n`
  }

  // Vendedor
  const vendedorItems = []
  if (isVendedorPJ) {
    vendedorItems.push(
      'Cartão CNPJ',
      'Contrato Social / Estatuto Social',
      'Últimas Alterações Contratuais',
      'Documento de Identidade dos Sócios/Representantes',
      'CPF dos Sócios/Representantes',
      'Certidão Negativa de Débitos (CND) Federal, Estadual e Municipal',
    )
  } else {
    vendedorItems.push(
      'Documento de Identidade (RG/CNH)',
      'CPF',
      'Comprovante de Residência Atualizado',
      'Certidão de Estado Civil (Nascimento atualizada ou Casamento)',
    )
  }
  if (isVendedorUniao) {
    vendedorItems.push(
      'Documento de Identidade do Cônjuge/Companheiro(a)',
      'CPF do Cônjuge/Companheiro(a)',
      'Pacto Antenupcial (se houver)',
    )
  }
  vendedorItems.push(
    'Certidão do 2º Ofício de Distribuidor',
    'Certidão de Interdições e Tutelas',
    'Certidão da Justiça Federal',
    'Certidão da Justiça do Trabalho',
  )
  addSection('1. DOCUMENTAÇÃO DO VENDEDOR', vendedorItems)

  // Comprador
  const compradorItems = [
    'Documento de Identidade (RG/CNH)',
    'CPF',
    'Comprovante de Residência Atualizado',
  ]
  if (data.estado_civil_comprador) {
    compradorItems.push(`Comprovante de Estado Civil (${data.estado_civil_comprador})`)
  } else {
    compradorItems.push('Comprovante de Estado Civil')
  }

  if (isCompradorUniao) {
    compradorItems.push(
      'Documento de Identidade do Cônjuge/Companheiro(a)',
      'CPF do Cônjuge/Companheiro(a)',
      'Certidão de Casamento/União Estável',
    )
  }
  addSection('2. DOCUMENTAÇÃO DO COMPRADOR', compradorItems)

  // Imóvel
  addSection('3. DOCUMENTAÇÃO DO IMÓVEL', [
    'Matrícula Atualizada (com ônus e ações)',
    'Capa do carnê de IPTU',
    'Certidão de Quitação Fiscal e Enfitêutica',
    'Declaração de Quitação Condominial (assinada pelo síndico)',
    'Certidão do Funesbom (Corpo de Bombeiros)',
  ])

  // Financeiro
  addSection('4. INFORMAÇÕES FINANCEIRAS BANCÁRIAS', [
    'Dados do Banco (Nome/Código)',
    'Agência e Conta (com dígito)',
    'Titularidade e CPF/CNPJ vinculado',
    'Chave PIX vinculada (se aplicável)',
  ])

  html += `</div>`
  return html
}

export async function generateChecklistPDFTemplate(
  minutaText: string,
  fileName: string,
  userDetails: any,
): Promise<void> {
  return new Promise((resolve) => {
    const doc = new jsPDF()
    let y = 40
    const margin = 20
    const pageWidth = 210
    const contentWidth = pageWidth - margin * 2
    const pageHeight = 297

    const addHeader = (d: jsPDF) => {
      // Gold bar
      d.setFillColor(212, 175, 55)
      d.rect(0, 0, pageWidth, 8, 'F')

      d.setFont('helvetica', 'bold')
      d.setFontSize(14)
      d.setTextColor(12, 35, 64)
      d.text(userDetails?.imobiliaria_nome || 'GODOY PRIME REALTY', margin, 20)

      d.setFontSize(10)
      d.setTextColor(212, 175, 55)
      d.text('Assessoria Jurídica Imobiliária', margin, 25)

      d.setFontSize(14)
      d.setTextColor(12, 35, 64)
      d.text('CHECKLIST DE DUE DILIGENCE', pageWidth / 2, 35, { align: 'center' })

      // Progress Bar (Visual Indicator)
      d.setDrawColor(226, 232, 240)
      d.setLineWidth(4)
      d.line(margin, 42, pageWidth - margin, 42)
      d.setDrawColor(212, 175, 55)
      d.line(margin, 42, margin + contentWidth * 0.33, 42) // Progress visual

      return 52
    }

    y = addHeader(doc)

    const parser = new DOMParser()
    const dom = parser.parseFromString(minutaText, 'text/html')
    const blocks = dom.querySelectorAll('.checklist-block')

    blocks.forEach((block) => {
      const title = block.querySelector('h3')?.textContent || ''
      const items = Array.from(block.querySelectorAll('li')).map((li) => li.textContent || '')

      // Measure block height
      const blockHeight = 16 + items.length * 7 + 6

      if (y + blockHeight > pageHeight - 30) {
        doc.addPage()
        y = addHeader(doc)
      }

      // Draw grey block (Light grey layout block)
      doc.setFillColor(248, 250, 252) // slate-50
      doc.setDrawColor(226, 232, 240) // slate-200
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'FD')

      let currentY = y + 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(12, 35, 64) // Navy Blue
      doc.text(title, margin + 5, currentY)

      // Underline title with Gold
      doc.setDrawColor(212, 175, 55)
      doc.setLineWidth(0.5)
      doc.line(margin + 5, currentY + 2, margin + 5 + doc.getTextWidth(title), currentY + 2)

      currentY += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(51, 65, 85)

      items.forEach((item) => {
        doc.setDrawColor(148, 163, 184)
        doc.rect(margin + 5, currentY - 3, 3, 3)

        const cleanItem = item.replace(/^\[ \]\s*/, '').trim()
        doc.text(cleanItem, margin + 12, currentY)
        currentY += 7
      })

      y += blockHeight + 8
    })

    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.text(
        `Página ${i} de ${totalPages} - Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      )
    }

    doc.save(`${fileName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    resolve()
  })
}
