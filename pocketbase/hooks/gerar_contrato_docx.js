// @deps docx@8.5.0
routerAdd(
  'POST',
  '/backend/v1/gerar-contrato-docx',
  (e) => {
    const { Document, Packer, Paragraph, TextRun, AlignmentType } = require('docx')

    const body = e.requestInfo().body
    if (!body) return e.badRequestError('Dados do contrato não fornecidos.')

    const formatCurrency = (val) => {
      if (val == null) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '[data]'
      try {
        const d = new Date(dateStr)
        return new Intl.DateTimeFormat('pt-BR').format(d)
      } catch {
        return '[data]'
      }
    }

    const {
      tipo,
      nome_vendedor,
      nome_comprador,
      cpf_vendedor,
      cpf_comprador,
      rg_vendedor,
      rg_comprador,
      orgao_emissor_vendedor,
      orgao_emissor_comprador,
      nacionalidade_vendedor,
      nacionalidade_comprador,
      estado_civil_vendedor,
      estado_civil_comprador,
      profissao_vendedor,
      profissao_comprador,
      endereco_vendedor,
      endereco_comprador,
      email_vendedor,
      email_comprador,
      telefone_vendedor,
      telefone_comprador,
      endereco_imovel,
      matricula_imovel,
      rgi_imovel,
      inscricao_municipal,
      area_total,
      vagas_garagem,
      valor_total,
      valor_sinal,
      valor_saldo,
      comissao,
      valor_reforco,
      valor_complemento,
      valor_financiado,
      instituicao_financeira,
      taxa_juros,
      prazo_meses,
      data_liberacao_credito,
      data_pagamento_saldo,
    } = body

    const doc = new Document({
      creator: 'Godoy Prime Realty',
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'Godoy Prime Realty', bold: true, size: 28 })],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA',
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [
                new TextRun({ text: 'Cláusula 1 - Identificação das Partes', bold: true }),
              ],
            }),
            new Paragraph({
              text: `VENDEDOR: ${nome_vendedor || ''}, nacionalidade: ${nacionalidade_vendedor || ''}, estado civil: ${estado_civil_vendedor || ''}, profissão: ${profissao_vendedor || ''}, portador do RG nº ${rg_vendedor || ''} expedido por ${orgao_emissor_vendedor || ''}, inscrito no CPF sob o nº ${cpf_vendedor || ''}, residente e domiciliado em ${endereco_vendedor || ''}. E-mail: ${email_vendedor || ''}, Telefone: ${telefone_vendedor || ''}.`,
            }),
            new Paragraph({
              text: `COMPRADOR: ${nome_comprador || ''}, nacionalidade: ${nacionalidade_comprador || ''}, estado civil: ${estado_civil_comprador || ''}, profissão: ${profissao_comprador || ''}, portador do RG nº ${rg_comprador || ''} expedido por ${orgao_emissor_comprador || ''}, inscrito no CPF sob o nº ${cpf_comprador || ''}, residente e domiciliado em ${endereco_comprador || ''}. E-mail: ${email_comprador || ''}, Telefone: ${telefone_comprador || ''}.`,
            }),
            new Paragraph({ text: '' }),

            new Paragraph({ children: [new TextRun({ text: 'Cláusula 2 - Objeto', bold: true })] }),
            new Paragraph({
              text: `O objeto do presente contrato é o imóvel situado em ${endereco_imovel || ''}, Matrícula nº ${matricula_imovel || ''}, registrado no RGI de ${rgi_imovel || ''}, Inscrição Municipal nº ${inscricao_municipal || ''}, possuindo área total de ${area_total || ''} m² e ${vagas_garagem || ''} vaga(s) de garagem.`,
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [
                new TextRun({ text: 'Cláusula 3 - Preço e Condições de Pagamento', bold: true }),
              ],
            }),
            new Paragraph({
              text: `O preço certo e ajustado para a presente compra e venda é de ${formatCurrency(valor_total)} (por extenso), que será pago da seguinte forma:`,
            }),
            ...(tipo === 'a_vista'
              ? [
                  new Paragraph({ text: `- Sinal: ${formatCurrency(valor_sinal)} (por extenso).` }),
                  new Paragraph({
                    text: `- Saldo: ${formatCurrency(valor_saldo)} (por extenso), com vencimento em ${formatDate(data_pagamento_saldo)}.`,
                  }),
                  new Paragraph({ text: `- Comissão: ${formatCurrency(comissao)} (por extenso).` }),
                ]
              : [
                  new Paragraph({ text: `- Sinal: ${formatCurrency(valor_sinal)} (por extenso).` }),
                  new Paragraph({
                    text: `- Reforço de Sinal: ${formatCurrency(valor_reforco)} (por extenso).`,
                  }),
                  new Paragraph({
                    text: `- Complemento: ${formatCurrency(valor_complemento)} (por extenso).`,
                  }),
                  new Paragraph({
                    text: `- Valor Financiado: ${formatCurrency(valor_financiado)} (por extenso), através da instituição financeira ${instituicao_financeira || ''}, com taxa de juros de ${taxa_juros || ''}% ao ano e prazo de ${prazo_meses || ''} meses.`,
                  }),
                  new Paragraph({ text: `- Comissão: ${formatCurrency(comissao)} (por extenso).` }),
                ]),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [new TextRun({ text: 'Cláusula 4 - Documentação', bold: true })],
            }),
            new Paragraph({
              text: 'As partes obrigam-se a apresentar as seguintes certidões e documentos: Ônus Reais, Quitação Fiscal, Quitação Condominial e Negativas Pessoais.',
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [new TextRun({ text: 'Cláusula 5 - Obrigações', bold: true })],
            }),
            new Paragraph({
              text: 'O VENDEDOR obriga-se a transferir o domínio, garantir a habitabilidade e quitar impostos até a data da posse. O COMPRADOR obriga-se ao pagamento do preço, custos de registro e impostos futuros.',
            }),
            new Paragraph({ text: '' }),

            new Paragraph({ children: [new TextRun({ text: 'Cláusula 6 - Posse', bold: true })] }),
            new Paragraph({
              text: 'A posse do imóvel será transferida com a entrega das chaves, sujeita à penalidade de R$ 300,00 por dia em caso de atraso.',
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [new TextRun({ text: 'Cláusula 7 - Penalidades', bold: true })],
            }),
            new Paragraph({
              text: 'Em caso de rescisão por culpa do COMPRADOR, perderá este o sinal pago. Sendo a culpa do VENDEDOR, devolverá o sinal em dobro. Em caso de atraso, haverá multa e juros.',
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [new TextRun({ text: 'Cláusula 8 - Legislação', bold: true })],
            }),
            new Paragraph({
              text: 'Este contrato é regido pelo Código Civil Brasileiro aplicável à espécie.',
            }),
            new Paragraph({ text: '' }),

            new Paragraph({ children: [new TextRun({ text: 'Cláusula 9 - Foro', bold: true })] }),
            new Paragraph({
              text: 'Fica eleito o Foro da Comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.',
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),

            new Paragraph({
              text: `Rio de Janeiro, ${new Intl.DateTimeFormat('pt-BR').format(new Date())}`,
            }),
            new Paragraph({ text: 'Foro: Comarca do Rio de Janeiro' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '_________________________________________________' }),
            new Paragraph({ text: `VENDEDOR: ${nome_vendedor || ''}` }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '_________________________________________________' }),
            new Paragraph({ text: `COMPRADOR: ${nome_comprador || ''}` }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '_________________________________________________' }),
            new Paragraph({ text: 'TESTEMUNHA 1 (Nome e CPF):' }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: '_________________________________________________' }),
            new Paragraph({ text: 'TESTEMUNHA 2 (Nome e CPF):' }),
          ],
        },
      ],
    })

    let base64 = ''
    let hasError = false

    Packer.toBase64(doc)
      .then((b) => {
        base64 = b
      })
      .catch((err) => {
        hasError = true
      })

    if (hasError || !base64) {
      return e.json(500, { message: 'Erro ao gerar contrato. Tente novamente.' })
    }

    const d = new Date().toISOString().split('T')[0]
    const filename =
      `Contrato_${nome_vendedor || 'Vendedor'}_${nome_comprador || 'Comprador'}_${d}.docx`.replace(
        /\s+/g,
        '_',
      )

    return e.json(200, { filename, base64 })
  },
  $apis.requireAuth(),
)
