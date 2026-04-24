routerAdd(
  'POST',
  '/backend/v1/analisar-contrato',
  (e) => {
    const body = e.requestInfo().body || {}
    let arquivo = body.arquivo || ''
    const tipo = (body.tipo || '').toLowerCase()
    const tipoContrato = body.tipoContrato || 'outro'
    const contractId = body.contractId || null
    const fileName = body.fileName || ''

    try {
      if (arquivo.includes('base64,')) {
        arquivo = arquivo.split('base64,')[1]
      }

      const geminiKey = $secrets.get('GEMINI_API_KEY')
      const openaiKey = $secrets.get('OPENAI_API_KEY')

      if (!geminiKey && !openaiKey) {
        return e.badRequestError(
          'Nenhuma chave de IA configurada (GEMINI_API_KEY ou OPENAI_API_KEY). Configure no painel de administração.',
        )
      }

      let contextText = ''
      try {
        if (openaiKey) {
          const embedText = `Contrato do tipo: ${tipoContrato}`
          const embedRes = $http.send({
            url: 'https://api.openai.com/v1/embeddings',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + openaiKey },
            body: JSON.stringify({ model: 'text-embedding-3-small', input: embedText }),
            timeout: 15,
          })
          if (embedRes.statusCode === 200) {
            const results = $vectors.search(e, 'legal_knowledge', {
              field: 'embedding',
              query: embedRes.json.data[0].embedding,
              k: 5,
            })
            const items = results.items || []
            contextText = items
              .map((r) => r.getString('title') + ': ' + r.getString('content'))
              .join('\n\n')
          }
        }

        if (!contextText) {
          const records = $app.findRecordsByFilter('legal_knowledge', '', '-updated', 10, 0)
          contextText = records
            .map((r) => r.getString('title') + ': ' + r.getString('content'))
            .join('\n\n')
        }
      } catch (err) {
        $app.logger().warn('Falha ao buscar base de conhecimento', 'error', err.message)
      }

      const systemPrompt = `Você é um Assistente Jurídico de IA especializado em Direito Imobiliário Brasileiro.
Analise o contrato fornecido (${tipoContrato}) considerando a legislação (Código Civil, STJ, TJRJ).

Contexto Jurídico (RAG):
${contextText}

Responda ESTRITAMENTE no seguinte formato JSON (sem markdown de bloco de código):
{
  "conformidade": {
    "status": "conforme" | "risco" | "critico",
    "clausulasEncontradas": ["string"],
    "clausulasFaltando": ["string"]
  },
  "riscos": [
    {
      "titulo": "string",
      "descricao": "string",
      "severidade": "ALTO" | "MEDIO" | "BAIXO",
      "embasamento": "string"
    }
  ],
  "omissoes": [
    {
      "clausula": "string",
      "importancia": "CRITICA" | "IMPORTANTE" | "RECOMENDADA",
      "redacaoPadrao": "string"
    }
  ],
  "clausulasAbusivas": [
    {
      "texto": "string",
      "motivo": "string",
      "recomendacao": "string"
    }
  ],
  "recomendacoes": {
    "imediatas": ["string"],
    "recomendadas": ["string"]
  }
}`

      let analysisResult = null

      if (geminiKey) {
        let mimeType = 'application/pdf'
        if (tipo === 'imagem' || tipo === 'image') mimeType = 'image/jpeg'
        if (tipo === 'docx')
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        if (tipo === 'txt') mimeType = 'text/plain'

        const chatRes = $http.send({
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiKey}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `Por favor, analise este contrato do tipo ${tipoContrato}.` },
                  { inline_data: { mime_type: mimeType, data: arquivo } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
          timeout: 120,
        })

        if (chatRes.statusCode !== 200) {
          $app.logger().error('Gemini AI failed', 'status', chatRes.statusCode, 'raw', chatRes.raw)
          return e.badRequestError(
            'Erro na análise da IA (Gemini). O arquivo pode ser muito grande ou a API está indisponível.',
          )
        }

        try {
          let textRes = chatRes.json.candidates[0].content.parts[0].text
          textRes = textRes
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim()
          analysisResult = JSON.parse(textRes)
        } catch (parseErr) {
          $app.logger().error('Gemini JSON parse failed', 'error', parseErr.message)
          return e.json(500, {
            error:
              'Unable to analyze the document. Please ensure the file contains readable text or check your AI configuration.',
          })
        }
      } else if (openaiKey) {
        let extractedText = ''
        if (tipo === 'imagem' || tipo === 'image') {
          const extractRes = $http.send({
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + openaiKey },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                {
                  role: 'user',
                  content: [
                    {
                      type: 'text',
                      text: 'Extraia o texto legível desta imagem. Retorne apenas o texto.',
                    },
                    { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${arquivo}` } },
                  ],
                },
              ],
            }),
            timeout: 60,
          })
          if (extractRes.statusCode === 200) {
            extractedText = extractRes.json.choices[0].message.content
          } else {
            throw new Error('Falha na extração da imagem com OpenAI.')
          }
        } else {
          try {
            const atobFn =
              typeof atob !== 'undefined'
                ? atob
                : (str) => {
                    const chars =
                      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
                    let output = ''
                    str = String(str).replace(/[=]+$/, '')
                    for (
                      let bc = 0, bs, buffer, idx = 0;
                      (buffer = str.charAt(idx++));
                      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
                        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
                        : 0
                    ) {
                      buffer = chars.indexOf(buffer)
                    }
                    return output
                  }
            const binStr = atobFn(arquivo)
            try {
              extractedText = decodeURIComponent(escape(binStr))
            } catch (err) {
              extractedText = binStr
            }
          } catch (e) {
            extractedText = arquivo
          }
        }

        const chatRes = $http.send({
          url: 'https://api.openai.com/v1/chat/completions',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + openaiKey },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Analise este contrato (${tipoContrato}):\n\n${extractedText}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
          timeout: 120,
        })

        if (chatRes.statusCode !== 200) {
          $app.logger().error('OpenAI AI failed', 'status', chatRes.statusCode, 'raw', chatRes.raw)
          return e.badRequestError(
            'Erro na análise da IA (OpenAI). O arquivo pode ser muito grande ou a API está indisponível.',
          )
        }

        try {
          analysisResult = JSON.parse(chatRes.json.choices[0].message.content)
        } catch (parseErr) {
          $app
            .logger()
            .error(
              'JSON Parse failed',
              'error',
              parseErr.message,
              'content',
              chatRes.json.choices[0].message.content,
            )
          return e.json(500, {
            error:
              'Unable to analyze the document. Please ensure the file contains readable text or check your AI configuration.',
          })
        }
      }

      try {
        const reportsCol = $app.findCollectionByNameOrId('analysis_reports')
        const reportRecord = new Record(reportsCol)
        reportRecord.set('user', e.auth.id)
        if (contractId) {
          reportRecord.set('contract', contractId)
        }
        if (fileName) {
          reportRecord.set('file_name', fileName)
        }
        reportRecord.set('analysis_result', analysisResult)

        let summaryText = ''
        if (analysisResult.conformidade && analysisResult.conformidade.status) {
          summaryText = `Status geral: ${analysisResult.conformidade.status}. Riscos: ${analysisResult.riscos ? analysisResult.riscos.length : 0}`
        }
        reportRecord.set('summary', summaryText)

        let risk = 'baixo'
        if (analysisResult.conformidade) {
          const s = (analysisResult.conformidade.status || '').toLowerCase()
          if (s === 'critico' || s === 'crítico') risk = 'critico'
          else if (s === 'risco') risk = 'alto'
          else risk = 'baixo'
        }
        reportRecord.set('risk_level', risk)

        $app.save(reportRecord)
        analysisResult.reportId = reportRecord.id
      } catch (saveErr) {
        $app.logger().error('Erro ao salvar report', 'err', saveErr.message)
      }

      return e.json(200, analysisResult)
    } catch (err) {
      $app.logger().error('Erro na rota analisar-contrato', 'error', err.message)
      return e.badRequestError(
        'Não consegui analisar o contrato. Verifique o arquivo e tente novamente.',
      )
    }
  },
  $apis.requireAuth(),
  $apis.bodyLimit(20 * 1024 * 1024),
)
