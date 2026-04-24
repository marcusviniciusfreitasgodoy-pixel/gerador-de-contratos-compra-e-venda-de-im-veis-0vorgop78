routerAdd(
  'POST',
  '/backend/v1/ai/analyze-contract',
  (e) => {
    const body = e.requestInfo().body || {}
    let text = (body.text || '').trim()
    const imageBase64 = body.image_base64 || null
    const contractId = body.contractId || null
    const fileName = body.fileName || null

    const apiKey = $secrets.get('OPENAI_API_KEY')
    if (!apiKey) return e.internalServerError('OPENAI_API_KEY not configured')

    let extractedText = text

    if (imageBase64) {
      const extractRes = $http.send({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extraia todo o texto legível desta imagem de contrato. Retorne APENAS o texto extraído, de forma contínua e estruturada, sem comentários.',
                },
                { type: 'image_url', image_url: { url: imageBase64 } },
              ],
            },
          ],
        }),
        timeout: 60,
      })

      if (extractRes.statusCode !== 200) {
        $app
          .logger()
          .error('OpenAI Vision failed', 'status', extractRes.statusCode, 'raw', extractRes.raw)
        return e.internalServerError('Falha ao extrair texto da imagem.')
      }
      extractedText = extractRes.json.choices[0].message.content.trim()
    }

    if (!extractedText) return e.badRequestError('Nenhum texto para analisar.')

    // RAG - Context Search
    const embedText = extractedText.substring(0, 8000)
    const embedRes = $http.send({
      url: 'https://api.openai.com/v1/embeddings',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: embedText }),
      timeout: 30,
    })

    let contextText = ''
    if (embedRes.statusCode === 200) {
      const results = $vectors.search(e, 'legal_knowledge', {
        field: 'embedding',
        query: embedRes.json.data[0].embedding,
        k: 10,
      })
      const items = results.items || []
      contextText = items
        .map((r) => r.getString('title') + ': ' + r.getString('content'))
        .join('\n\n')
    }

    const systemPrompt = `Você é um Assistente Jurídico de IA especializado em Direito Imobiliário Brasileiro.
Sua tarefa é analisar o contrato fornecido e gerar um relatório estruturado e detalhado.

Passos obrigatórios:
1. Verifique se o texto se trata de um contrato imobiliário (ex: compra e venda, aluguel, promessa, financiamento, incorporação). Se NÃO for, defina "is_real_estate_contract" como false e deixe os demais campos vazios.
2. Identifique o tipo de contrato.
3. Resuma as partes envolvidas.
4. Faça um resumo executivo de 1-2 linhas do objetivo do contrato.
5. Verifique a presença das 10 cláusulas estruturais obrigatórias (Identificação das partes, Objeto do contrato, Preço e forma de pagamento, Documentação necessária, Obrigações das partes, Imissão na posse, Multas e penalidades, Legislação aplicável, Foro competente, Assinaturas e testemunhas) e classifique cada uma como "CONFORME", "RISCO" ou "CRÍTICO".
6. Analise a conformidade jurídica de cláusulas específicas.
7. Classifique os riscos nas 5 categorias exatas: buyer, seller, execution, registration e financing.
8. Identifique cláusulas abusivas (ex: ferem o CDC, unilaterais). Para cada, explique a violação, dê recomendação e sugira nova redação.
9. Identifique omissões críticas e sugira texto.
10. Liste recomendações imediatas e recomendadas.

Contexto Jurídico (RAG):
${contextText}

Responda ESTRITAMENTE no seguinte formato JSON (e nada mais):
{
  "is_real_estate_contract": true ou false,
  "contract_type": "string",
  "parties": "string",
  "summary": "string",
  "structural_compliance": [
    { "clause": "string (nome da cláusula obrigatória)", "present": true ou false, "status": "CONFORME" | "RISCO" | "CRÍTICO", "details": "string" }
  ],
  "legal_compliance": [
    { "clause_text": "string", "status": "CONFORME" | "RISCO" | "CRÍTICO", "legal_basis": "string (Art. X...)", "explanation": "string" }
  ],
  "risks": {
    "buyer": ["string"],
    "seller": ["string"],
    "execution": ["string"],
    "registration": ["string"],
    "financing": ["string"]
  },
  "abusive_clauses": [
    { "clause": "string", "violation": "string", "recommendation": "string", "drafting_suggestion": "string" }
  ],
  "omissions": [
    { "missing_item": "string", "drafting_suggestion": "string" }
  ],
  "recommendations": {
    "immediate": ["string"],
    "recommended": ["string"]
  }
}`

    const chatRes = $http.send({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Contrato a analisar:\n\n' + extractedText },
        ],
        response_format: { type: 'json_object' },
      }),
      timeout: 90,
    })

    if (chatRes.statusCode !== 200) {
      $app.logger().error('OpenAI chat failed', 'status', chatRes.statusCode, 'raw', chatRes.raw)
      return e.internalServerError('Falha na análise da IA.')
    }

    const analysisResult = JSON.parse(chatRes.json.choices[0].message.content)

    // Save report to database
    const reportsCol = $app.findCollectionByNameOrId('analysis_reports')
    const reportRecord = new Record(reportsCol)
    reportRecord.set('user', e.auth.id)
    if (contractId) {
      try {
        $app.findRecordById('contracts', contractId)
        reportRecord.set('contract', contractId)
      } catch (_) {}
    }
    if (fileName) reportRecord.set('file_name', fileName)
    reportRecord.set('analysis_result', analysisResult)
    reportRecord.set('summary', analysisResult.summary || 'Resumo não gerado')

    // Auto-calculate risk
    let risk = 'baixo'
    if (analysisResult.is_real_estate_contract) {
      const hasCritical =
        analysisResult.structural_compliance?.some((c) => c.status === 'CRÍTICO') ||
        analysisResult.legal_compliance?.some((c) => c.status === 'CRÍTICO')
      const hasRisco =
        analysisResult.structural_compliance?.some((c) => c.status === 'RISCO') ||
        analysisResult.legal_compliance?.some((c) => c.status === 'RISCO')
      risk = hasCritical ? 'critico' : hasRisco ? 'alto' : 'baixo'
    }
    reportRecord.set('risk_level', risk)
    $app.save(reportRecord)

    return e.json(200, {
      reportId: reportRecord.id,
      analysis: analysisResult,
    })
  },
  $apis.requireAuth(),
)
