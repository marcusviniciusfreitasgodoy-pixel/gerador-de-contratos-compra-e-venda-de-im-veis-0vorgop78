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
        k: 3,
      })
      const items = results.items || []
      contextText = items
        .map((r) => r.getString('title') + ': ' + r.getString('content'))
        .join('\n\n')
    }

    const systemPrompt = `Você é um Assistente Jurídico de IA especializado em Direito Imobiliário Brasileiro, focado em contratos no Rio de Janeiro (Barra da Tijuca, Recreio, Leblon) e foro de Jacarepaguá.
Sua tarefa é analisar o contrato fornecido, identificar riscos, verificar a presença das 10 cláusulas essenciais (Identificação das partes, Objeto, Preço/Pagamento, Documentação, Obrigações, Posse, Multas, Legislação, Foro, Assinaturas), e gerar um relatório estruturado.
Use a base de conhecimento a seguir para embasar sua análise, citando leis ou artigos específicos.

Base de Conhecimento Local (RAG):
${contextText}

Responda ESTRITAMENTE em formato JSON:
{
  "summary": "Resumo executivo da análise",
  "overall_risk": "baixo" | "medio" | "alto" | "critico",
  "missing_clauses": ["Lista de strings de cláusulas essenciais ausentes. Array vazio se não houver."],
  "findings": [
    {
      "clause": "Nome ou trecho da cláusula",
      "risk_level": "critico" | "alto" | "medio",
      "description": "Descrição clara do risco",
      "legal_basis": "Citação legal base (ex: Art. 481 do CC)",
      "recommendation": "O que deve ser ajustado"
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
