routerAdd(
  'POST',
  '/backend/v1/assemble-contract',
  (e) => {
    const body = e.requestInfo().body || {}

    const normalizeDigits = (str) => (str ? String(str).replace(/\D/g, '') : '')

    // Master JSON Schema mapping
    const master_data = {
      metadata: {
        versao_sistema: '1.0',
        tipo_contrato: body.tipo_documento || 'promessa_compra_venda',
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

    // Hard Blocks (Compliance Validation)
    if (!master_data.comprador.cpf && body.tipo_comprador !== 'pj') {
      return e.badRequestError('Compliance Alert: CPF do comprador é obrigatório.')
    }
    if (!master_data.vendedor.cpf && !body.vendedor_pj) {
      return e.badRequestError('Compliance Alert: CPF do vendedor é obrigatório.')
    }
    if (
      (master_data.vendedor.estado_civil.toLowerCase() === 'casado' ||
        master_data.vendedor.estado_civil.toLowerCase() === 'casada') &&
      !master_data.vendedor.conjuge.nome
    ) {
      return e.badRequestError(
        'Compliance Alert: Dados do cônjuge do vendedor são obrigatórios para casados (Sellers married under Communion of Assets require Spouse identification).',
      )
    }
    if (master_data.comprador.financeiro.financiamento && !master_data.comprador.financeiro.banco) {
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

    // Sort by priority to help AI sequence them naturally
    availableClauses.sort((a, b) => a.priority - b.priority)

    const systemPrompt = `Você é um Advogado Sênior Especialista em Direito Imobiliário brasileiro.
Sua função é montar contratos juridicamente consistentes utilizando EXCLUSIVAMENTE as cláusulas fornecidas na "Available Clauses Library".

Regras Obrigatórias (Hard Rules):
1. NEVER invent clauses. Only use the ones provided in the library. As variáveis interpoladas já foram preenchidas nos textos das cláusulas.
2. NEVER alter the legal meaning of the provided clauses. You may adjust grammar to connect them smoothly.
3. Replace any remaining placeholders like {{variable_name}} with the corresponding values from the Master JSON data.
4. Maintain formal legal language and formatting.
5. The final generated contract MUST strictly follow the "Estrutura Obrigatória" sequence:
   -> Header (Título e Data)
   -> Qualifications (Qualificação das Partes: Vendedor, Comprador, Cônjuges, Procuradores)
   -> Object (Objeto do Contrato)
   -> Description (Descrição do Imóvel e Registro)
   -> Price/Payment (Condições de Pagamento e Preço)
   -> Financing (Financiamento Bancário - se aplicável)
   -> Possession (Posse e Desocupação)
   -> Taxes (Tributos e Despesas)
   -> Obligations (Obrigações)
   -> Special Clauses (Cláusulas Especiais e Proteção Comercial)
   -> Commission (Comissão de Corretagem)
   -> Default (Penalidades e Multas)
   -> Rescission (Rescisão)
   -> LGPD (Conformidade LGPD)
   -> Electronic Signature (Assinatura Eletrônica)
   -> Forum (Foro / Resolução de Conflitos)
   -> Signatures (Assinaturas e Testemunhas)

Process:
1. Analyze the matched "Available Clauses Library".
2. Assemble the contract following the exact Structure Enforcement sequence above.
3. Do not output anything other than the final contract.

Output:
Provide ONLY the final assembled contract text in simple markdown format (## for sections). Do not include conversational text ou explicações.`

    const userPrompt = `Master JSON Data (Variables & Triggers):
${JSON.stringify(master_data, null, 2)}

Available Clauses Library:
${JSON.stringify(availableClauses, null, 2)}

Please assemble the contract.`

    const url = $secrets.get('SKIP_AI_GATEWAY_URL')
    const apiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    let generatedText = 'Minuta não gerada. Erro no provedor de IA.'
    let usedClauses = availableClauses.map((c) => ({
      code: c.code,
      title: c.title,
      version: c.version,
    }))

    if (url && apiKey) {
      try {
        const completionUrl = url.endsWith('/')
          ? url + 'v1/chat/completions'
          : url + '/v1/chat/completions'
        const res = $http.send({
          url: completionUrl,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + apiKey,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
          }),
          timeout: 110,
        })

        if (res.statusCode === 200 && res.json && res.json.choices && res.json.choices.length > 0) {
          generatedText = res.json.choices[0].message.content
        } else {
          $app.logger().warn('AI Gateway returned non-200', 'status', res.statusCode)
          throw new Error('AI Generation failed')
        }
      } catch (err) {
        $app.logger().error('AI Gateway call failed', 'error', err)
        return e.badRequestError('Error generating contract with AI.')
      }
    }

    return e.json(200, { minuta_texto: generatedText, used_clauses: usedClauses })
  },
  $apis.requireAuth(),
)
