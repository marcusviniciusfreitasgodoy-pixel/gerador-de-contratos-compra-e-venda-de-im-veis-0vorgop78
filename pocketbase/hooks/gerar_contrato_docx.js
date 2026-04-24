routerAdd(
  'POST',
  '/backend/v1/gerar-contrato-docx',
  (e) => {
    const body = e.requestInfo().body
    if (!body) return e.badRequestError('Dados do contrato não fornecidos.')

    const formatCurrency = (val) => {
      if (val == null || val === '') return 'R$ 0,00'
      const num = Number(val)
      if (isNaN(num)) return 'R$ 0,00'
      const parts = num.toFixed(2).split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      return 'R$ ' + parts.join(',')
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return '[data]'
      try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return '[data]'
        const day = String(d.getUTCDate()).padStart(2, '0')
        const month = String(d.getUTCMonth() + 1).padStart(2, '0')
        const year = d.getUTCFullYear()
        return `${day}/${month}/${year}`
      } catch {
        return '[data]'
      }
    }

    const {
      tipo,
      minuta_texto,
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
      data_pagamento_saldo,
      vendedor_banco,
      vendedor_agencia,
      vendedor_conta,
      vendedor_pix,
      user_details,
    } = body

    const hojeDate = new Date()
    const hojeDay = String(hojeDate.getUTCDate()).padStart(2, '0')
    const hojeMonth = String(hojeDate.getUTCMonth() + 1).padStart(2, '0')
    const hojeYear = hojeDate.getUTCFullYear()
    const hoje = `${hojeDay}/${hojeMonth}/${hojeYear}`

    let bodyContent = ''

    if (minuta_texto) {
      bodyContent = minuta_texto
        .split('\n')
        .map((line) => (line.trim() === '' ? '<br>' : `<p style="margin: 0 0 10px 0;">${line}</p>`))
        .join('')
    } else {
      const pgtoHTML =
        tipo === 'a_vista'
          ? `
          <ul>
            <li>Sinal: ${formatCurrency(valor_sinal)} (por extenso).</li>
            ${valor_reforco && Number(valor_reforco) > 0 ? `<li>Reforço de Sinal: ${formatCurrency(valor_reforco)} (por extenso).</li>` : ''}
            ${valor_complemento && Number(valor_complemento) > 0 ? `<li>Complemento: ${formatCurrency(valor_complemento)} (por extenso).</li>` : ''}
            ${valor_saldo && Number(valor_saldo) > 0 ? `<li>Saldo: ${formatCurrency(valor_saldo)} (por extenso), com vencimento em ${formatDate(data_pagamento_saldo)}.</li>` : ''}
            <li>Comissão: ${formatCurrency(comissao)} (por extenso).</li>
          </ul>
        `
          : `        <ul>
          <li>Sinal: ${formatCurrency(valor_sinal)} (por extenso).</li>
          <li>Reforço de Sinal: ${formatCurrency(valor_reforco)} (por extenso).</li>
          <li>Complemento: ${formatCurrency(valor_complemento)} (por extenso).</li>
          <li>Valor Financiado: ${formatCurrency(valor_financiado)} (por extenso)${instituicao_financeira ? `, através da instituição financeira ${instituicao_financeira}` : ''}.</li>
          <li>Comissão: ${formatCurrency(comissao)} (por extenso).</li>
        </ul>
      `

      const sellerBankInfo = vendedor_banco
        ? `
        <p>Os pagamentos devidos ao VENDEDOR deverão ser efetuados na seguinte conta bancária:</p>
        <p>Banco: ${vendedor_banco}, Agência: ${vendedor_agencia}, Conta: ${vendedor_conta}, Chave Pix: ${vendedor_pix}.</p>
      `
        : ''

      const user = user_details
      const brokerBankInfo = user?.banco_nome
        ? `
        <p>O pagamento da comissão de corretagem deverá ser depositado na conta bancária de titularidade de ${user.imobiliaria_nome || user.name}, CPF/CNPJ: ${user.imobiliaria_documento || ''}, CRECI: ${user.creci || ''}.</p>
        <p>Banco: ${user.banco_nome}, Agência: ${user.agencia}, Conta: ${user.conta}, Chave Pix: ${user.chave_pix}.</p>
      `
        : ''

      bodyContent = `
        <h1 style="text-align: center; font-size: 28px;">${user?.imobiliaria_nome || 'Godoy Prime Realty'}</h1>
        <br>
        <h2 style="text-align: center; font-size: 24px;">INSTRUMENTO PARTICULAR DE PROMESSA DE COMPRA E VENDA</h2>
        <br>
        
        <h3>Cláusula 1 - Identificação das Partes</h3>
        <p><strong>VENDEDOR:</strong> ${nome_vendedor || ''}, nacionalidade: ${nacionalidade_vendedor || ''}, estado civil: ${estado_civil_vendedor || ''}, profissão: ${profissao_vendedor || ''}, portador do RG nº ${rg_vendedor || ''} expedido por ${orgao_emissor_vendedor || ''}, inscrito no CPF sob o nº ${cpf_vendedor || ''}, residente e domiciliado em ${endereco_vendedor || ''}. E-mail: ${email_vendedor || ''}, Telefone: ${telefone_vendedor || ''}.</p>
        <p><strong>COMPRADOR:</strong> ${nome_comprador || ''}, nacionalidade: ${nacionalidade_comprador || ''}, estado civil: ${estado_civil_comprador || ''}, profissão: ${profissao_comprador || ''}, portador do RG nº ${rg_comprador || ''} expedido por ${orgao_emissor_comprador || ''}, inscrito no CPF sob o nº ${cpf_comprador || ''}, residente e domiciliado em ${endereco_comprador || ''}. E-mail: ${email_comprador || ''}, Telefone: ${telefone_comprador || ''}.</p>
        <br>

        <h3>Cláusula 2 - Objeto</h3>
        <p>O objeto do presente contrato é o imóvel situado em ${endereco_imovel || ''}, Matrícula nº ${matricula_imovel || ''}, registrado no RGI de ${rgi_imovel || ''}, Inscrição Municipal nº ${inscricao_municipal || ''}, possuindo área total de ${area_total || ''} m² e ${vagas_garagem || ''} vaga(s) de garagem.</p>
        <br>

        <h3>Cláusula 3 - Preço e Condições de Pagamento</h3>
        <p>O preço certo e ajustado para a presente compra e venda é de ${formatCurrency(valor_total)} (por extenso), que será pago da seguinte forma:</p>
        ${pgtoHTML}
        ${sellerBankInfo}
        ${brokerBankInfo}
        <br>

        <h3>Cláusula 4 - Documentação</h3>
        <p>As partes obrigam-se a apresentar as seguintes certidões e documentos: Ônus Reais, Quitação Fiscal, Quitação Condominial e Negativas Pessoais.</p>
        <br>

        <h3>Cláusula 5 - Obrigações</h3>
        <p>O VENDEDOR obriga-se a transferir o domínio, garantir a habitabilidade e quitar impostos até a data da posse. O COMPRADOR obriga-se ao pagamento do preço, custos de registro e impostos futuros.</p>
        <br>

        <h3>Cláusula 6 - Posse</h3>
        <p>A posse do imóvel será transferida com a entrega das chaves, sujeita à penalidade de R$ 300,00 por dia em caso de atraso.</p>
        <br>

        <h3>Cláusula 7 - Penalidades</h3>
        <p>Em caso de rescisão por culpa do COMPRADOR, perderá este o sinal pago. Sendo a culpa do VENDEDOR, devolverá o sinal em dobro. Em caso de atraso, haverá multa e juros.</p>
        <br>

        <h3>Cláusula 8 - Legislação</h3>
        <p>Este contrato é regido pelo Código Civil Brasileiro aplicável à espécie.</p>
        <br>

        <h3>Cláusula 9 - Foro</h3>
        <p>Fica eleito o Foro da Comarca do Rio de Janeiro para dirimir quaisquer dúvidas oriundas deste contrato.</p>
        <br><br>

        <p>Rio de Janeiro, ${hoje}</p>
        <p>Foro: Comarca do Rio de Janeiro</p>
        <br><br>
        
        <p>_________________________________________________</p>
        <p>VENDEDOR: ${nome_vendedor || ''}</p>
        <br><br>
        
        <p>_________________________________________________</p>
        <p>COMPRADOR: ${nome_comprador || ''}</p>
        <br><br>
        
        <p>_________________________________________________</p>
        <p>TESTEMUNHA 1 (Nome e CPF):</p>
        <br><br>
        
        <p>_________________________________________________</p>
        <p>TESTEMUNHA 2 (Nome e CPF):</p>
      `
    }

    const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Contrato</title></head>
    <body style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
      ${bodyContent}
    </body>
    </html>
  `

    const d = new Date().toISOString().split('T')[0]
    const filename =
      `Contrato_${nome_vendedor || 'Vendedor'}_${nome_comprador || 'Comprador'}_${d}.doc`.replace(
        /\s+/g,
        '_',
      )

    return e.json(200, { filename, html })
  },
  $apis.requireAuth(),
)
