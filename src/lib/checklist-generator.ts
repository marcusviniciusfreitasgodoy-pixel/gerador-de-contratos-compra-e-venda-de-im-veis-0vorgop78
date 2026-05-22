import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { getLogoBase64 } from './pdf-utils'

function getCategories(data: any) {
  const isVendedorPJ = data?.vendedor_pj
  const isCompradorPJ = data?.tipo_comprador === 'pj'

  return [
    {
      title: 'Vendedor',
      items: isVendedorPJ
        ? [
            'Contrato Social Atualizado ou Estatuto Social',
            'CNPJ',
            'Documento de Identidade dos Sócios/Representantes',
            'CPF dos Sócios/Representantes',
            'Comprovante de Endereço da Empresa',
            'Certidão Negativa de Débitos Federais (CND)',
            'Certidão Negativa de Débitos Estaduais',
            'Certidão Negativa de Débitos Municipais',
            'Certidão Negativa de Débitos Trabalhistas (CNDT)',
            'Certidão do FGTS',
            'Certidão Simplificada da Junta Comercial',
          ]
        : [
            'Documento de Identidade (RG/CNH)',
            'CPF',
            'Comprovante de Residência Atualizado',
            'Certidão de Estado Civil (Nascimento atualizada ou Casamento)',
            'Documento de Identidade do Cônjuge/Companheiro(a)',
            'CPF do Cônjuge/Companheiro(a)',
            'Pacto Antenupcial (se houver)',
            'Certidões de Protesto de Títulos (domicílio e local do imóvel)',
            'Certidão de Distribuição Cível e Criminal Estadual',
            'Certidão Conjunta de Débitos Relativos a Tributos Federais e à Dívida Ativa da União (RFB)',
            'Certidão do 2º Ofício de Distribuidor',
            'Certidão de Interdições e Tutelas',
            'Certidão da Justiça Federal',
            'Certidão da Justiça do Trabalho',
          ],
    },
    {
      title: 'Comprador',
      items: isCompradorPJ
        ? [
            'Contrato Social Atualizado ou Estatuto Social',
            'CNPJ',
            'Documento de Identidade dos Sócios/Representantes',
            'CPF dos Sócios/Representantes',
            'Comprovante de Endereço da Empresa',
          ]
        : [
            'Documento de Identidade (RG/CNH)',
            'CPF',
            'Comprovante de Residência Atualizado',
            'Comprovante de Estado Civil (Casado)',
            'Documento de Identidade do Cônjuge/Companheiro(a)',
            'CPF do Cônjuge/Companheiro(a)',
            'Certidão de Casamento/União Estável',
          ],
    },
    {
      title: 'Imóvel',
      items: [
        'Matrícula Atualizada (com ônus e ações)',
        'Capa do carnê de IPTU',
        'Certidão de Quitação Fiscal e Enfitêutica',
        'Declaração de Quitação Condominial (assinada pelo síndico)',
        'Cópia da Ata de Eleição do Síndico',
        'Certidão do Funesbom (Corpo de Bombeiros)',
        'Laudo de Vistoria com fotos',
        'Comprovantes de quitação de contas de consumo (Luz, Água, Gás)',
        'Termo de declaração de desocupação pelo vendedor',
      ],
    },
    {
      title: 'Dados Bancários',
      items: [
        'Dados do Banco (Nome/Código)',
        'Agência e Conta (com dígito)',
        'Titularidade e CPF/CNPJ vinculado',
        'Chave PIX vinculada (se aplicável)',
      ],
    },
  ]
}

export function getActiveDocs(data: any): string[] {
  let docs: string[] = []
  getCategories(data).forEach((cat) => {
    cat.items.forEach((item) => {
      docs.push(`${cat.title} - ${item}`)
    })
  })
  return docs
}

export function generateChecklistHTML(data: any): string {
  let html = `<!-- CHECKLIST_FORMAT -->\n`
  html += `<div style="font-family: sans-serif; color: #0C2340;">\n`
  html += `<h2 style="color: #D4AF37; text-align: center; margin-bottom: 20px; font-weight: bold;">CHECKLIST DE DUE DILIGENCE</h2>\n`

  getCategories(data).forEach((category) => {
    html += `<div class="checklist-block" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">\n`
    html += `<h3 style="color: #0C2340; margin-top: 0; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">${category.title.toUpperCase()}</h3>\n`
    html += `<ul style="list-style-type: none; padding-left: 0;">\n`

    category.items.forEach((item) => {
      const key = `${category.title} - ${item}`
      const isChecked = data.compliance_checklist && data.compliance_checklist[key] === true
      const prefix = isChecked ? '✓ COLETADO' : '⚠️ PENDENTE'
      const color = isChecked ? '#16a34a' : '#ea580c'
      html += `<li style="margin-bottom: 8px; display: flex; align-items: center;" data-checked="${isChecked ? 'true' : 'false'}"><strong style="color: ${color}; margin-right: 8px; font-size: 11px;">${prefix}</strong> <span style="font-size: 13px;">- ${item}</span></li>\n`
    })
    html += `</ul>\n</div>\n`
  })

  html += `</div>`
  return html
}

export async function generateChecklistPDFTemplate(
  minutaText: string,
  fileName: string,
  userDetails: any,
): Promise<void> {
  const logoBase64 = await getLogoBase64(userDetails)

  return new Promise((resolve) => {
    const doc = new jsPDF()
    let y = 40
    const margin = 20
    const pageWidth = 210
    const contentWidth = pageWidth - margin * 2
    const pageHeight = 297

    const addHeader = (d: jsPDF) => {
      d.setFillColor(212, 175, 55)
      d.rect(0, 0, pageWidth, 8, 'F')

      if (logoBase64) {
        try {
          d.addImage(logoBase64, 'PNG', margin, 12, 25, 15, undefined, 'FAST')
        } catch (err) {
          try {
            d.addImage(logoBase64, 'JPEG', margin, 12, 25, 15, undefined, 'FAST')
          } catch {
            // ignore
          }
        }
      }

      d.setFont('helvetica', 'bold')
      d.setFontSize(14)
      d.setTextColor(12, 35, 64)
      d.text('CHECKLIST DE DUE DILIGENCE', pageWidth / 2, 30, { align: 'center' })

      d.setDrawColor(226, 232, 240)
      d.setLineWidth(4)
      d.line(margin, 38, pageWidth - margin, 38)
      d.setDrawColor(212, 175, 55)
      d.line(margin, 38, margin + contentWidth * 0.33, 38)

      return 48
    }

    y = addHeader(doc)

    const parser = new DOMParser()
    const dom = parser.parseFromString(minutaText, 'text/html')
    const blocks = dom.querySelectorAll('.checklist-block')

    blocks.forEach((block) => {
      const title = block.querySelector('h3')?.textContent || ''
      const itemsNodes = Array.from(block.querySelectorAll('li'))
      const items = itemsNodes.map((li) => {
        const fullText = li.textContent || ''
        const text = fullText.replace(/^(✓ COLETADO|⚠️ PENDENTE)\s*-\s*/, '').trim()
        return {
          text,
          checked: li.getAttribute('data-checked') === 'true',
        }
      })

      const blockHeight = 16 + items.length * 7 + 6

      if (y + blockHeight > pageHeight - 30) {
        doc.addPage()
        y = addHeader(doc)
      }

      doc.setFillColor(248, 250, 252)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y, contentWidth, blockHeight, 3, 3, 'FD')

      let currentY = y + 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(12, 35, 64)
      doc.text(title, margin + 5, currentY)

      doc.setDrawColor(212, 175, 55)
      doc.setLineWidth(0.5)
      doc.line(margin + 5, currentY + 2, margin + 5 + doc.getTextWidth(title), currentY + 2)

      currentY += 10

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)

      items.forEach((item) => {
        if (item.checked) {
          doc.setTextColor(22, 163, 74)
          doc.setFont('helvetica', 'bold')
          doc.text('COLETADO', margin + 5, currentY)
        } else {
          doc.setTextColor(234, 88, 12)
          doc.setFont('helvetica', 'bold')
          doc.text('PENDENTE', margin + 5, currentY)
        }

        doc.setTextColor(51, 65, 85)
        doc.setFont('helvetica', 'normal')
        doc.text(`- ${item.text}`, margin + 32, currentY)
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
