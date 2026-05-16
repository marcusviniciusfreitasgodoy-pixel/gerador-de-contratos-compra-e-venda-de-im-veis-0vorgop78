routerAdd(
  'POST',
  '/backend/v1/assemble-contract',
  (e) => {
    const body = e.requestInfo().body || {}

    // Master JSON Schema mapping
    const master_data = {
      operacao: {
        tipo_contrato: body.tipo_documento || '',
        data_contrato: new Date().toISOString(),
        foro: body.foro_comarca || '',
      },
      comprador: {
        nome: body.nome_comprador || '',
        cpf: body.cpf_comprador || '',
        rg: body.rg_comprador || '',
        estado_civil: body.estado_civil_comprador || '',
        regime_bens: body.regime_bens_comprador || '',
        email: body.email_comprador || '',
        telefone: body.telefone_comprador || '',
        financiamento: !!body.financiamento_comprador,
        fgts: !!body.fgts_comprador,
      },
      vendedor: {
        nome: body.nome_vendedor || '',
        cpf: body.cpf_vendedor || '',
        estado_civil: body.estado_civil_vendedor || '',
        conjuge: body.conjuge_vendedor || '',
      },
      imovel: {
        tipo: body.tipo_imovel || '',
        endereco: body.endereco_imovel || '',
        matricula: body.matricula_imovel || '',
        cartorio: body.cartorio_imovel || '',
        ocupado: !!body.imovel_ocupado,
        locado: !!body.imovel_locado,
        financiado: !!body.imovel_financiado,
        inventario: !!body.imovel_inventario,
        onus: !!body.possui_onus,
      },
      financeiro: {
        valor_total: Number(body.valor_total) || 0,
        valor_sinal: Number(body.valor_sinal) || 0,
        valor_financiamento: Number(body.valor_financiamento) || 0,
        parcelas: Number(body.quantidade_parcelas) || 0,
        prazo_financiamento: Number(body.prazo_financiamento) || 0,
        instituicao_financeira: body.instituicao_financeira || '',
      },
      posse: {
        imediata: !!body.posse_imediata,
        data_posse: body.data_posse || '',
        prazo_desocupacao: Number(body.prazo_desocupacao) || 0,
        multa_desocupacao: Number(body.multa_desocupacao) || 0,
      },
      comissao: {
        percentual: Number(body.percentual_comissao) || 0,
        valor: Number(body.valor_comissao) || 0,
        garantida: !!body.comissao_garantida,
      },
    }

    // Hard Blocks (Compliance Validation)
    if (
      master_data.vendedor.estado_civil.toLowerCase() === 'casado' &&
      !master_data.vendedor.conjuge
    ) {
      return e.badRequestError(
        'Marriage Rule Compliance Alert: Dados do cônjuge do vendedor são obrigatórios para casados.',
      )
    }

    if (master_data.comprador.financiamento && !master_data.financeiro.instituicao_financeira) {
      return e.badRequestError(
        'Financing Rule Compliance Alert: Instituição Financeira é obrigatória para financiamentos.',
      )
    }

    if (
      master_data.comprador.financiamento &&
      (!master_data.financeiro.valor_financiamento ||
        master_data.financeiro.valor_financiamento === 0)
    ) {
      return e.badRequestError(
        'Financing Rule Compliance Alert: Informações de financiamento incompletas. Valor do financiamento é obrigatório.',
      )
    }

    const clauses = $app.findRecordsByFilter(
      'legal_knowledge',
      "category = 'clausula_fixa' || category = 'clausula_condicional' || category = 'protecao_comercial'",
      'priority',
      1000,
      0,
    )

    let availableClauses = []
    clauses.forEach((m) => {
      availableClauses.push({
        id: m.id,
        code: m.getString('code') || m.getString('title').split(' - ')[0] || m.getString('title'),
        title: m.getString('title'),
        type: m.getString('category'),
        trigger: m.getString('trigger_logic') || 'Always include if applicable',
        content: m.getString('content'),
        version: m.getInt('version') || 1,
      })
    })

    const systemPrompt = `Sua função é montar contratos juridicamente consistentes utilizando exclusivamente as cláusulas fornecidas.

Rules:
1. Never invent clauses; only use the ones provided in the library.
2. Never alter the legal meaning of the provided clauses.
3. Replace placeholders/variables like {{variable_name}} with the corresponding values from the Master JSON data. For example, {{comprador.nome}} should be replaced by the buyer's name. If a value is missing, leave the placeholder intact.
4. Respect conditional logic based on the "trigger" of each clause and the provided Master JSON. Include conditional clauses only if their trigger logic evaluates to true against the Master JSON data.
5. Maintain formal legal language.
6. Organize the final contract in logical sequence: 1. Capa, 2. Dados das Partes, 3. Dados do Imóvel, 4. Cláusulas Fixas, 5. Cláusulas Condicionais (Posse, Financeiras, Bancárias, etc.), 6. Assinaturas.
7. Ensure the final text forms a coherent, continuous legal document without internal clause code brackets (e.g., [FIN001]).

Process:
1. Analyze Master JSON Data.
2. Identify Triggers for each available clause.
3. Select Clauses that are "clausula_fixa", "clausula_condicional" or "protecao_comercial" whose trigger evaluates to true.
4. Assemble Contract replacing placeholders.
5. Validate Consistency.

Output:
Provide ONLY the final assembled contract text in plain text or simple markdown format, starting directly with the document title and content. Do not include conversational text or explanations.`

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
            model: 'gpt-4o-mini',
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
