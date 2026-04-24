routerAdd(
  'POST',
  '/backend/v1/ai/analyze-contract',
  (e) => {
    const body = e.requestInfo().body || {}
    const text = (body.text || '').trim()
    const contractId = body.contractId || null
    const fileName = body.fileName || null

    if (!text) return e.badRequestError('Missing contract text')

    const apiKey = $secrets.get('OPENAI_API_KEY')
    if (!apiKey) return e.internalServerError('OPENAI_API_KEY not configured')

    const embedText = text.substring(0, 8000)
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

    const systemPrompt = `Você é um Assistente Jurídico de IA especializado em Direito Imobiliário Brasileiro, focado em contratos no Rio de Janeiro (Barra da Tijuca, Recreio, Leblon) e foro de Jacarepaguá.
Sua tarefa é analisar o contrato fornecido e gerar um relatório estruturado e fundamentado.

Passos obrigatórios:
1. Identifique o tipo de contrato (ex: À vista vs Financiado) para guiar a análise.
2. Identifique riscos, verifique a presença de cláusulas essenciais e cláusulas de proteção adequadas para comprador e vendedor.
3. Priorize a Legislação Primária (Código Civil, Lei do Inquilinato, etc.) na Fundamentação Legal, complementando com Jurisprudência e Boas Práticas.

Base de Conhecimento Local (RAG):
${contextText}

Responda ESTRITAMENTE em formato JSON com a seguinte estrutura:
{
  "summary": "RESUMO EXECUTIVO: [Resumo executivo de 1-2 linhas sobre a análise geral e o tipo de contrato identificado]",
  "overall_risk": "baixo" | "medio" | "alto" | "critico",
  "missing_clauses": ["Lista de strings de cláusulas essenciais ausentes. Array vazio se não houver."],
  "findings": [
    {
      "clause": "Nome ou trecho da cláusula analisada",
      "risk_level": "critico" | "alto" | "medio",
      "description": "ANÁLISE CONTEXTUAL: [Aplicação da lei ao caso concreto, explicando o risco ou contexto da cláusula]",
      "legal_basis": "FUNDAMENTAÇÃO LEGAL: [Citação explícita de Artigos (ex: Art. 421, CC) ou Súmulas priorizando a legislação primária da base RAG]",
      "recommendation": "RECOMENDAÇÃO PRÁTICA: [Passos acionáveis sobre o que deve ser ajustado]"
    }
  ]
}
Lembrete de níveis de risco:
- critico (vermelho): viola normas imperativas ou falta de cláusulas obrigatórias vitais.
- alto (amarelo): desvantagem excessiva para uma das partes.
- medio (verde): sugestões de clareza ou melhoria.`

    const chatRes = $http.send({
      url: 'https://api.openai.com/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Contrato a analisar:\n\n' + text },
        ],
        response_format: { type: 'json_object' },
      }),
      timeout: 60,
    })

    if (chatRes.statusCode !== 200) {
      $app.logger().error('OpenAI chat failed', 'status', chatRes.statusCode, 'raw', chatRes.raw)
      return e.internalServerError('AI Analysis failed. Check logs.')
    }

    const analysisResult = JSON.parse(chatRes.json.choices[0].message.content)

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
    reportRecord.set('risk_level', analysisResult.overall_risk || 'medio')
    $app.save(reportRecord)

    return e.json(200, {
      reportId: reportRecord.id,
      analysis: analysisResult,
    })
  },
  $apis.requireAuth(),
)
