routerAdd(
  'POST',
  '/backend/v1/assemble-contract',
  (e) => {
    const body = e.requestInfo().body || {}

    const clauses = $app.findRecordsByFilter(
      'legal_knowledge',
      "category = 'clausula_fixa' || category = 'clausula_condicional'",
      'title',
      1000,
      0,
    )

    let finalBlocks = []
    let usedClauses = []

    const addClause = (codePrefix) => {
      const matched = clauses.filter((c) => c.getString('title').startsWith(codePrefix))
      matched.forEach((m) => {
        let content = m.getString('content')
        content = content.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
          const key = p1.trim()
          if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
            return String(body[key])
          }
          return match
        })
        finalBlocks.push(`### ${m.getString('title')}\n\n${content}`)
        usedClauses.push({
          code: m.getString('title').split(' - ')[0],
          title: m.getString('title'),
          version: m.getInt('version') || 1,
        })
      })
    }

    addClause('FIX')

    if (body.clausula_lgpd) addClause('FIX006')
    if (body.assinatura_eletronica) addClause('FIX007')

    if (body.financiamento_comprador) addClause('FIN')
    if (body.imovel_ocupado) addClause('POS')
    if (body.imovel_locado) addClause('LOC')
    if (body.imovel_inventario) addClause('INV')
    if (Number(body.valor_comissao) > 0) addClause('COM')
    if (body.estado_civil_vendedor === 'Casado') addClause('CAS')

    let minuta = finalBlocks.join('\n\n')

    const block1Role =
      'You are a Specialist in Brazilian real estate law. You must use the authorized clauses provided only. Do not invent new legal frameworks.'
    const block2Rules =
      'Use formal, clear, and unambiguous language. Never omit mandatory clauses. Respect conditional logic. Integrate the selected clauses seamlessly into a professional contract structure: 1. Qualification of Parties, 2. Object, 3. Price and Payment, 4. Specific Conditions (Financing, Possession, etc.), 5. General Provisions.'
    const block3Input = `Contract Variables:\n${JSON.stringify(body, null, 2)}\n\nSelected Pre-approved Clauses:\n${minuta}`
    const block4Decision =
      'Map the triggers to specific clause codes and ensure the final text forms a coherent, continuous legal document without brackets like [FIX001]. Output ONLY the final contract text in plain text or simple markdown. Start directly with the contract content.'

    const prompt = `${block1Role}\n\n${block2Rules}\n\n${block3Input}\n\n${block4Decision}`

    const url = $secrets.get('SKIP_AI_GATEWAY_URL')
    const apiKey = $secrets.get('SKIP_AI_GATEWAY_API_KEY')

    let generatedText = minuta

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
              { role: 'system', content: 'You are an expert real estate lawyer in Brazil.' },
              { role: 'user', content: prompt },
            ],
          }),
          timeout: 30,
        })

        if (res.statusCode === 200 && res.json && res.json.choices && res.json.choices.length > 0) {
          generatedText = res.json.choices[0].message.content
        } else {
          $app.logger().warn('AI Gateway returned non-200', 'status', res.statusCode)
        }
      } catch (err) {
        $app.logger().error('AI Gateway call failed', 'error', err)
      }
    }

    return e.json(200, { minuta_texto: generatedText, used_clauses: usedClauses })
  },
  $apis.requireAuth(),
)
