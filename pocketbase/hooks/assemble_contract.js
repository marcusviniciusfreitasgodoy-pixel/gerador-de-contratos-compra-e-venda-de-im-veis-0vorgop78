routerAdd(
  'POST',
  '/backend/v1/assemble-contract',
  (e) => {
    const body = e.requestInfo().body || {}
    const tipoDocumento = body.tipo_documento || 'promessa_compra_venda'

    const normalizeDigits = (str) => (str ? String(str).replace(/\D/g, '') : '')

    // Master JSON Schema mapping
    const master_data = {
      metadata: {
        versao_sistema: '1.0',
        tipo_contrato: tipoDocumento,
      },
      comprador: {
        nome: body.nome_comprador || '',
        cpf: normalizeDigits(body.cpf_comprador),
        rg: body.rg_comprador || '',
        orgao_emissor: body.orgao_emissor_comprador || '',
        data_nascimento: body.data_nascimento_comprador || '',
        nacionalidade: body.nacionalidade_comprador || 'brasileiro',
        profissao: body.profissao_comprador || '',
        estado_civil: body.estado_civil_comprador || '',
        regime_bens: body.regime_bens_comprador || '',
        email: body.email_comprador || '',
        telefone: normalizeDigits(body.telefone_comprador),
        endereco: body.endereco_comprador || '',
        cep: normalizeDigits(body.cep_comprador),
        conjuge: {
          nome: body.nome_conjuge_comprador || '',
          cpf: normalizeDigits(body.cpf_conjuge_comprador),
          rg: body.rg_conjuge_comprador || '',
        },
        procurador: {
          possui: !!body.possui_procurador_comprador,
          nome: body.nome_procurador_comprador || '',
          cpf: normalizeDigits(body.cpf_procurador_comprador),
          instrumento: body.instrumento_procurador_comprador || '',
        },
        financeiro: {
          financiamento: !!body.financiamento_comprador,
          fgts: !!body.fgts_comprador,
          banco: body.instituicao_financeira || '',
          prazo_aprovacao: Number(body.prazo_aprovacao) || Number(body.prazo_financiamento) || 45,
          renda_declarada: Number(body.renda_declarada_comprador) || 0,
        },
      },
      vendedor: {
        nome: body.nome_vendedor || '',
        cpf: normalizeDigits(body.cpf_vendedor),
        rg: body.rg_vendedor || '',
        estado_civil: body.estado_civil_vendedor || '',
        regime_bens: body.regime_bens_vendedor || '',
        email: body.email_vendedor || '',
        telefone: normalizeDigits(body.telefone_vendedor),
        endereco: body.endereco_vendedor || '',
        cep: normalizeDigits(body.cep_vendedor),
        conjuge: {
          nome: body.conjuge_vendedor || '',
          cpf: normalizeDigits(body.cpf_conjuge_vendedor),
          rg: body.rg_conjuge_vendedor || '',
        },
        procurador: {
          possui: !!body.procurador_vendedor,
          nome: body.nome_procurador_vendedor || '',
          cpf: normalizeDigits(body.cpf_procurador_vendedor),
          instrumento: body.instrumento_procurador_vendedor || '',
        },
      },
      imovel: {
        tipo: body.tipo_imovel || 'apartamento',
        endereco: body.endereco_imovel || '',
        numero: body.numero_imovel || '',
        complemento: body.complemento_imovel || '',
        bairro: body.bairro_imovel || '',
        cidade: body.cidade_imovel || '',
        estado: body.estado_imovel || '',
        cep: normalizeDigits(body.cep_imovel),
        registro: {
          matricula: body.matricula_imovel || '',
          cartorio: body.cartorio_imovel || '',
          inscricao_iptu: body.inscricao_iptu || '',
        },
        caracteristicas: {
          area_privativa: body.area_privativa || '',
          area_total: body.area_total || '',
          vagas: Number(body.vagas_garagem) || 0,
          suite: Number(body.suites) || 0,
          quartos: Number(body.quartos) || 0,
        },
        situacao_juridica: {
          ocupado: !!body.imovel_ocupado,
          locado: !!body.imovel_locado,
          financiado: !!body.imovel_financiado,
          inventario: !!body.imovel_inventario,
          usufruto: !!body.possui_usufruto,
          onus: !!body.possui_onus,
          acoes_judiciais: !!body.acoes_judiciais,
        },
      },
      financeiro: {
        valor_total: Number(body.valor_total) || 0,
        valor_sinal: Number(body.valor_sinal) || 0,
        valor_fgts: Number(body.valor_fgts) || 0,
        valor_financiamento: Number(body.valor_financiamento) || 0,
        valor_recursos_proprios: Number(body.valor_recursos_proprios) || 0,
        parcelamento: {
          possui: (Number(body.quantidade_parcelas) || 0) > 0,
          quantidade_parcelas: Number(body.quantidade_parcelas) || 0,
          valor_parcela: Number(body.valor_parcela) || 0,
        },
        datas: {
          pagamento_sinal: body.data_pagamento_sinal || '',
          assinatura: body.data_assinatura || '',
          escritura: body.prazo_escritura || '',
          quitacao: body.data_quitacao || '',
        },
        multas: {
          inadimplencia_percentual: Number(body.multa_inadimplencia) || 10,
          multa_desocupacao: Number(body.multa_desocupacao) || 0,
        },
      },
      posse: {
        imediata: !!body.posse_imediata,
        data_posse: body.data_posse || '',
        prazo_desocupacao: Number(body.prazo_desocupacao) || 0,
        vistoria_obrigatoria: !!body.vistoria_obrigatoria,
      },
      comissao: {
        percentual: Number(body.percentual_comissao) || 5,
        valor: Number(body.valor_comissao) || 0,
        responsavel_pagamento: body.responsavel_comissao || 'vendedor',
        garantida: !!body.comissao_garantida,
        imobiliaria: 'Godoy Prime Realty',
      },
      compliance: {
        lgpd: !!body.clausula_lgpd,
        assinatura_eletronica: !!body.assinatura_eletronica,
        plataforma_assinatura: body.plataforma_assinatura || 'Clicksign',
        foro: body.foro_comarca || 'Rio de Janeiro/RJ',
        mediacao: !!body.mediacao,
        arbitragem: !!body.arbitragem,
      },
    }

    const isContractType = [
      'promessa_compra_venda',
      'contrato_particular',
      'recibo_sinal',
      'distrato',
    ].includes(tipoDocumento)

    // General Compliance Validations
    if (
      !master_data.comprador.cpf &&
      body.tipo_comprador !== 'pj' &&
      tipoDocumento !== 'autorizacao_intermediacao'
    ) {
      return e.badRequestError('Compliance Alert: CPF do comprador é obrigatório.')
    }
    if (!master_data.vendedor.cpf && !body.vendedor_pj) {
      return e.badRequestError('Compliance Alert: CPF do vendedor é obrigatório.')
    }

    // Contract-specific Compliance Validations
    if (isContractType) {
      if (
        (master_data.vendedor.estado_civil.toLowerCase() === 'casado' ||
          master_data.vendedor.estado_civil.toLowerCase() === 'casada') &&
        !master_data.vendedor.conjuge.nome
      ) {
        return e.badRequestError(
          'Compliance Alert: Dados do cônjuge do vendedor são obrigatórios para casados (Sellers married under Communion of Assets require Spouse identification).',
        )
      }
      if (
        master_data.comprador.financeiro.financiamento &&
        !master_data.comprador.financeiro.banco
      ) {
        return e.badRequestError(
          'Compliance Alert: Instituição Financeira é obrigatória para financiamentos.',
        )
      }
      if (
        master_data.comprador.financeiro.financiamento &&
        master_data.financeiro.valor_financiamento === 0
      ) {
        return e.badRequestError(
          'Compliance Alert: Valor do financiamento é obrigatório quando há financiamento.',
        )
      }
      if (master_data.comissao.garantida && !master_data.comissao.responsavel_pagamento) {
        return e.badRequestError(
          'Compliance Alert: Responsável pelo pagamento da comissão é obrigatório para comissões garantidas.',
        )
      }
    }

    const clauses = $app.findRecordsByFilter(
      'legal_knowledge',
      "category = 'clausula_fixa' || category = 'clausula_condicional' || category = 'protecao_comercial'",
      'priority',
      1000,
      0,
    )

    const triggerLogicEval = (logicStr, data) => {
      if (!logicStr) return true
      try {
        const rule = JSON.parse(logicStr)
        const keys = rule.path.split('.')
        let val = data
        for (let k of keys) {
          if (val === undefined) break
          val = val[k]
        }

        if (rule.operator === '>') return val > rule.value
        if (rule.operator === '<') return val < rule.value
        if (rule.operator === '!=') return val != rule.value
        if (rule.operator === 'in') return Array.isArray(rule.value) && rule.value.includes(val)

        return val == rule.value
      } catch (err) {
        return false
      }
    }

    const replaceVariables = (text, data) => {
      return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
        const keys = path.split('.')
        let val = data
        for (let k of keys) {
          val = val?.[k]
          if (val === undefined) break
        }
        return val !== undefined ? val : match
      })
    }

    let availableClauses = []
    clauses.forEach((m) => {
      const cat = m.getString('category')
      const trigger = m.getString('trigger_logic') || ''

      let include = true

      if (cat === 'clausula_condicional' && trigger) {
        include = triggerLogicEval(trigger, master_data)
      }

      if (include) {
        const rawContent = m.getString('content')
        const interpolatedContent = replaceVariables(rawContent, master_data)

        availableClauses.push({
          id: m.id,
          code: m.getString('code') || m.getString('title').split(' - ')[0] || m.getString('title'),
          title: m.getString('title'),
          type: cat,
          trigger: trigger || 'Always include',
          content: interpolatedContent,
          version: m.getInt('version') || 1,
          priority: m.getInt('priority') || 999,
        })
      }
    })

    availableClauses.sort((a, b) => a.priority - b.priority)

    const documentTypeMap = {
      ficha_cadastral: 'Ficha Cadastral',
      checklist_documental: 'Checklist Documental',
      recibo_sinal: 'Recibo de Sinal',
      promessa_compra_venda: 'Promessa de Compra e Venda',
      contrato_particular: 'Contrato Particular de Compra e Venda',
      termo_entrega_chaves: 'Termo de Entrega de Chaves',
      termo_posse: 'Termo de Posse',
      declaracoes_complementares: 'Declarações Complementares',
      autorizacao_intermediacao: 'Autorização de Intermediação Imobiliária',
      distrato: 'Distrato de Compra e Venda',
    }

    const documentTitle = documentTypeMap[tipoDocumento] || 'Documento Imobiliário'
    let systemPrompt = `Você é um Advogado Sênior Especialista em Direito Imobiliário brasileiro.`

    if (tipoDocumento === 'ficha_cadastral') {
      systemPrompt += `
Sua função é gerar uma FICHA CADASTRAL estruturada contendo os dados do comprador, vendedor e do imóvel.
Geração em TEXTO PURO (Plain Text). É ESTRITAMENTE PROIBIDO o uso de Markdown.
Cabeçalho Obrigatório: O documento DEVE iniciar exatamente com as seguintes 3 linhas:
GODOY PRIME REALTY
Assessoria Jurídica Imobiliária
FICHA CADASTRAL

Use os dados do Master JSON para preencher a ficha, organizando de forma clara (dados pessoais, contatos, dados do imóvel). Não inclua cláusulas contratuais.
`
    } else if (tipoDocumento === 'checklist_documental') {
      systemPrompt += `
Sua função é gerar um CHECKLIST DOCUMENTAL relacionando todos os documentos necessários para a transação imobiliária com base no perfil das partes e do imóvel.
Geração em TEXTO PURO (Plain Text). É ESTRITAMENTE PROIBIDO o uso de Markdown.
Cabeçalho Obrigatório: O documento DEVE iniciar exatamente com as seguintes 3 linhas:
GODOY PRIME REALTY
Assessoria Jurídica Imobiliária
CHECKLIST DOCUMENTAL

Liste os documentos exigidos do Vendedor (ex: certidões negativas, matrícula), Comprador e Imóvel com base na situação informada. Organize em tópicos numéricos para facilitar a conferência.
`
    } else if (tipoDocumento === 'termo_entrega_chaves' || tipoDocumento === 'termo_posse') {
      systemPrompt += `
Sua função é gerar um ${documentTitle.toUpperCase()} formalizando a entrega das chaves e a imissão na posse do imóvel.
Geração em TEXTO PURO (Plain Text). É ESTRITAMENTE PROIBIDO o uso de Markdown.
Cabeçalho Obrigatório: O documento DEVE iniciar exatamente com as seguintes 3 linhas:
GODOY PRIME REALTY
Assessoria Jurídica Imobiliária
${documentTitle.toUpperCase()}

Inclua a qualificação das partes, a descrição do imóvel, a data da posse e a declaração de que o comprador vistoriou o imóvel. Inclua espaço para assinaturas ao final.
`
    } else if (tipoDocumento === 'recibo_sinal') {
      systemPrompt += `
Sua função é gerar um RECIBO DE SINAL formalizando o pagamento do princípio de pagamento (arras).
Geração em TEXTO PURO (Plain Text). É ESTRITAMENTE PROIBIDO o uso de Markdown.
Cabeçalho Obrigatório: O documento DEVE iniciar exatamente com as seguintes 3 linhas:
GODOY PRIME REALTY
Assessoria Jurídica Imobiliária
RECIBO DE SINAL E PRINCÍPIO DE PAGAMENTO

Inclua a qualificação das partes, o valor do sinal explicitado, a referência ao imóvel e as condições básicas das arras. Inclua espaço para assinatura de quem recebe.
`
    } else {
      systemPrompt += `
Sua função é montar contratos/distratos juridicamente consistentes utilizando EXCLUSIVAMENTE as cláusulas fornecidas na "Available Clauses Library".

Regras Obrigatórias (Hard Rules):
1. NEVER invent clauses. Only use the ones provided in the library. As variáveis interpoladas já foram preenchidas nos textos das cláusulas.
2. NEVER alter the legal meaning of the provided clauses. You may adjust grammar to connect them smoothly.
3. Replace any remaining placeholders like {{variable_name}} with the corresponding values from the Master JSON data.
4. Geração em TEXTO PURO (Plain Text). É ESTRITAMENTE PROIBIDO o uso de Markdown (como #, ##, **, _, etc). Não use formatação em markdown em NENHUMA parte do texto.
5. Cabeçalho Obrigatório: O documento DEVE iniciar exatamente com as seguintes 3 linhas:
GODOY PRIME REALTY
Assessoria Jurídica Imobiliária
${documentTitle.toUpperCase()}

6. Numeração Formal de Cláusulas: Estruture as cláusulas sequencialmente utilizando numeração ordinal em caixa alta (ex: CLÁUSULA PRIMEIRA - [TÍTULO], CLÁUSULA SEGUNDA - [TÍTULO]). As seções "Objeto do Contrato" e "Descrição do Imóvel" devem seguir esta mesma sequência numérica formal.
7. Qualificação das Partes: Os rótulos VENDEDOR e COMPRADOR devem estar em caixa alta como texto puro, seguidos dos respectivos dados, sem símbolos de negrito.
8. The final generated contract MUST strictly follow the logical sequence:
   -> Cabeçalho
   -> Qualifications
   -> Object & Description
   -> Price/Payment
   -> Financing (se aplicável)
   -> Possession
   -> Taxes
   -> Obligations
   -> Special Clauses
   -> Commission
   -> Default
   -> Rescission
   -> LGPD
   -> Electronic Signature
   -> Forum
   -> Signatures

Process:
1. Analyze the matched "Available Clauses Library".
2. Assemble the contract following the exact Structure sequence above.
3. Do not output anything other than the final contract.
`
    }

    const userPrompt = `Master JSON Data (Variables & Triggers):
${JSON.stringify(master_data, null, 2)}

${isContractType ? `Available Clauses Library:\n${JSON.stringify(availableClauses, null, 2)}` : ''}

Por favor, gere o documento solicitado.`

    let anthropicKey = ''
    let openaiKey = ''
    let geminiKey = ''

    if (e.auth?.id) {
      try {
        const userRecord = $app.findRecordById('users', e.auth.id)
        anthropicKey = userRecord.getString('anthropic_api_key')
        openaiKey = userRecord.getString('openai_api_key')
        geminiKey = userRecord.getString('gemini_api_key')
      } catch (_) {}
    }

    if (!anthropicKey) anthropicKey = $secrets.get('ANTHROPIC_API_KEY') || ''
    if (!openaiKey) openaiKey = $secrets.get('OPENAI_API_KEY') || ''
    if (!geminiKey) geminiKey = $secrets.get('GEMINI_API_KEY') || ''

    if (!anthropicKey && !openaiKey && !geminiKey) {
      return e.badRequestError(
        'Configure pelo menos uma chave de API para habilitar a geração por IA.',
      )
    }

    let generatedText = 'Minuta não gerada. Erro no provedor de IA.'
    let usedClauses = availableClauses.map((c) => ({
      code: c.code,
      title: c.title,
      version: c.version,
    }))

    let success = false
    let lastErrorMsg = ''

    if (anthropicKey && !success) {
      const aiBody = {
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }
      try {
        const chatRes = $http.send({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(aiBody),
          timeout: 120,
        })
        if (chatRes.statusCode === 200) {
          generatedText = chatRes.json.content[0].text
          success = true
        } else {
          lastErrorMsg = chatRes.json?.error?.message || `Anthropic: ${chatRes.statusCode}`
        }
      } catch (err) {
        lastErrorMsg = err.message
      }
    }

    if (openaiKey && !success) {
      const aiBody = {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }
      try {
        const chatRes = $http.send({
          url: 'https://api.openai.com/v1/chat/completions',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + openaiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aiBody),
          timeout: 120,
        })
        if (chatRes.statusCode === 200) {
          generatedText = chatRes.json.choices[0].message.content
          success = true
        } else {
          lastErrorMsg = chatRes.json?.error?.message || `OpenAI: ${chatRes.statusCode}`
        }
      } catch (err) {
        lastErrorMsg = err.message
      }
    }

    if (!success) {
      $app.logger().error('AI Generation failed', 'error', lastErrorMsg)
      generatedText = 'Minuta não gerada. Erro no provedor de IA.'
    }

    return e.json(200, { minuta_texto: generatedText, used_clauses: usedClauses })
  },
  $apis.requireAuth(),
)
