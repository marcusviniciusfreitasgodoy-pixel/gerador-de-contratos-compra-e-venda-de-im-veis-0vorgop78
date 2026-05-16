routerAdd(
  'POST',
  '/backend/v1/assemble-contract',
  (e) => {
    const body = e.requestInfo().body || {}

    const clauses = $app.findRecordsByFilter(
      'legal_knowledge',
      "category = 'clausula_fixa' || category = 'clausula_condicional'",
      'title',
      100,
      0,
    )

    let finalBlocks = []
    const addClause = (codePrefix) => {
      const matched = clauses.filter((c) => c.getString('title').startsWith(codePrefix))
      matched.forEach((m) =>
        finalBlocks.push('### ' + m.getString('title') + '\n\n' + m.getString('content')),
      )
    }

    addClause('FIX001')
    addClause('FIX002')
    addClause('FIX003')
    addClause('FIX004')
    addClause('FIX005')

    if (body.clausula_lgpd) addClause('FIX006')
    if (body.assinatura_eletronica) addClause('FIX007')

    if (body.financiamento_comprador) addClause('FIN')
    if (body.imovel_ocupado) addClause('POS')
    if (body.imovel_locado) addClause('LOC')
    if (body.imovel_inventario) addClause('INV')
    if (Number(body.valor_comissao) > 0) addClause('COM')
    if (body.estado_civil_vendedor === 'Casado') addClause('CAS')

    let minuta = finalBlocks.join('\n\n')

    minuta = minuta.replace(/{{(.*?)}}/g, (match, p1) => {
      const key = p1.trim()
      if (body[key] !== undefined && body[key] !== null && body[key] !== '') {
        return String(body[key])
      }
      return match
    })

    return e.json(200, { minuta_texto: minuta })
  },
  $apis.requireAuth(),
)
