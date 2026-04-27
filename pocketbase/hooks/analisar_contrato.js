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
    const adaptiveThought = body.adaptiveThought === true

    try {
      if (arquivo.includes('base64,')) {
        arquivo = arquivo.split('base64,')[1]
      }

      // Payload Sanitization for TXT
      if (tipo === 'txt') {
        arquivo = arquivo.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        arquivo = arquivo.replace(/[═─━│┃┄┅┆┇┈┉╌╍╎╏║╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀]/g, ' ')
        arquivo = arquivo.replace(/={2,}/g, ' ')
        arquivo = arquivo.replace(/\s{2,}/g, ' ').trim()
      }

      let anthropicKey = ''
      if (e.auth?.id) {
        try {
          const userRecord = $app.findRecordById('users', e.auth.id)
          anthropicKey = userRecord.getString('anthropic_api_key')
        } catch (_) {}
      }

      if (anthropicKey) {
        anthropicKey = anthropicKey.replace(/[^\x21-\x7E]/g, '')
      } else {
        anthropicKey = $secrets.get('ANTHROPIC_API_KEY')
        if (anthropicKey) {
          anthropicKey = anthropicKey.replace(/[^\x21-\x7E]/g, '')
        }
      }

      let openaiKey = e.auth?.getString('openai_api_key')
      if (openaiKey) {
        openaiKey = openaiKey.replace(/[^\x21-\x7E]/g, '')
      } else {
        openaiKey = $secrets.get('OPENAI_API_KEY')
        if (openaiKey) {
          openaiKey = openaiKey.replace(/[^\x21-\x7E]/g, '')
        }
      }

      if (!anthropicKey) {
        return e.badRequestError(
          'Configure sua chave de IA da Anthropic no painel de integração ou nos segredos do sistema para habilitar esta função.',
        )
      }

      let contextText = ''
      try {
        if (openaiKey) {
          const embedText = `Contrato do tipo: ${tipoContrato}`
          const embedRes = $http.send({
            url: 'https://api.openai.com/v1/embeddings',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + openaiKey,
              'Cache-Control': 'no-cache',
            },
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
Analise o contrato fornecido (${tipoContrato}) considerando a legislação (Código Civil, STJ, TJRJ) e os Padrões de Alta Rigorosidade da Godoy Prime Realty.

INSTRUÇÕES CRÍTICAS DE AVALIAÇÃO:
1. DOCUMENTAÇÃO EXAUSTIVA E PRAZO: Verifique se o contrato exige a lista COMPLETA de certidões e se há prazo para apresentação (ex: 10 dias). As certidões do vendedor e imóvel exigidas são: CNDT, Feitos Ajuizados (Federal, Estadual, Trabalhista), Protestos, Objeto e Pé, Ônus Reais, Quitação Fiscal/IPTU e Quitação Condominial. Se a lista estiver completa e o prazo presente, aponte como "conforme". Se faltar algum item, aponte a omissão.
2. CLÁUSULA DE FINANCIAMENTO: Se houver indícios de financiamento bancário, DEVE existir cláusula que responsabilize o COMPRADOR pela obtenção do crédito e estipule obrigação de quitar com recursos próprios (ex: prazo de 30 dias) em caso de negativa. Atrasos burocráticos do banco não isentam o comprador, salvo culpa do vendedor. Se esta cláusula existir dessa exata forma, está "conforme".
3. NÃO ABREVIES CLÁUSULAS: A integridade legal exige precisão. Cláusulas de posse, obrigações, penalidades e rescisão devem ser robustas. Se o contrato apresentar o texto padrão da Godoy Prime Realty, considere-o 100% em conformidade.
4. IMPORTANTE: Não retorne "crítico" ou "risco" para contratos que sigam rigorosamente as instruções 1 e 2. Se o texto gerado estiver de acordo com o padrão estabelecido, o status deve ser "conforme" sem falsos positivos.

Contexto Jurídico (RAG):
${contextText}

Responda ESTRITAMENTE no seguinte formato JSON (sem markdown de bloco de código):
{
  "conformidade": "conforme|risco|critico",
  "clausulas_encontradas": ["string"],
  "clausulas_faltando": ["string"],
  "riscos": [
    {
      "titulo": "string",
      "descricao": "string",
      "severidade": "ALTO|MEDIO|BAIXO",
      "embasamento": "string"
    }
  ],
  "omissoes": [
    {
      "clausula": "string",
      "importancia": "CRITICA|IMPORTANTE|RECOMENDADA",
      "redacaoPadrao": "string"
    }
  ],
  "clausulas_abusivas": [
    {
      "texto": "string",
      "motivo": "string",
      "recomendacao": "string"
    }
  ],
  "recomendacoes": {
    "imediatas": ["string"],
    "recomendadas": ["string"]
  },
  "relatorio_completo": "string"
}`

      let analysisResult = null
      let extractedText = ''

      if (tipo === 'imagem' || tipo === 'image') {
        const imgBody = {
          model: 'claude-3-5-sonnet-latest',
          max_tokens: 8192,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: arquivo,
                  },
                },
                {
                  type: 'text',
                  text: 'Extraia o texto legível desta imagem. Retorne apenas o texto.',
                },
              ],
            },
          ],
        }

        let extractRes = $http.send({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'cache-control': 'no-cache',
          },
          body: JSON.stringify(imgBody),
          timeout: 60,
        })

        if (extractRes.statusCode !== 200) {
          let errType = extractRes.json?.error?.type || ''
          let errMsg = extractRes.json?.error?.message || ''
          if (
            extractRes.statusCode === 404 ||
            errType === 'not_found_error' ||
            errMsg.includes('not found') ||
            extractRes.statusCode === 400 ||
            extractRes.statusCode === 403
          ) {
            imgBody.model = 'claude-3-haiku-20241022'
            extractRes = $http.send({
              url: 'https://api.anthropic.com/v1/messages',
              method: 'POST',
              headers: {
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
                'cache-control': 'no-cache',
              },
              body: JSON.stringify(imgBody),
              timeout: 60,
            })
          }
        }

        if (extractRes.statusCode === 200) {
          extractedText = extractRes.json.content[0].text
        } else {
          let imgErrType = 'unknown_error'
          let imgErrMsg = 'Erro desconhecido'
          if (extractRes.json && extractRes.json.error) {
            imgErrType = extractRes.json.error.type || imgErrType
            imgErrMsg = extractRes.json.error.message || imgErrMsg
          }
          if (
            extractRes.statusCode === 404 ||
            extractRes.statusCode === 400 ||
            extractRes.statusCode === 403
          ) {
            imgErrType = 'MODEL_NOT_AVAILABLE'
            imgErrMsg =
              'O modelo de IA solicitado não está disponível para sua chave. Verifique se sua conta Anthropic possui créditos ativos (Tier 1+).'
          }
          throw new Error(`[${imgErrType}] ${imgErrMsg}`)
        }
      } else if (tipo === 'txt') {
        extractedText = arquivo
      } else {
        try {
          const atobFn =
            typeof atob !== 'undefined'
              ? atob
              : (str) => {
                  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
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

      if (extractedText.length > 200000) {
        extractedText = extractedText.substring(0, 200000)
      }

      let usedModel = 'claude-3-5-sonnet-latest'
      const aiBody = {
        model: usedModel,
        max_tokens: adaptiveThought ? 8192 : 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analise este contrato (${tipoContrato}):\n\n${extractedText}`,
          },
        ],
      }

      if (adaptiveThought) {
        aiBody.system =
          aiBody.system +
          '\n\nINSTRUÇÃO ADICIONAL: Modo de Pensamento Adaptativo Ativado. Realize uma auditoria profunda, raciocinando meticulosamente sobre cada cláusula e buscando potenciais riscos ocultos ou omissões sutis com o máximo rigor possível.'
      }
      aiBody.temperature = 1.0

      let chatRes = $http.send({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'cache-control': 'no-cache',
        },
        body: JSON.stringify(aiBody),
        timeout: 180,
      })

      if (chatRes.statusCode !== 200) {
        let errType = chatRes.json?.error?.type || ''
        let errMsg = chatRes.json?.error?.message || ''
        if (
          chatRes.statusCode === 404 ||
          errType === 'not_found_error' ||
          errMsg.includes('not found') ||
          chatRes.statusCode === 400 ||
          chatRes.statusCode === 403
        ) {
          $app.logger().info('Falling back to claude-3-haiku-20241022')
          usedModel = 'claude-3-haiku-20241022'
          aiBody.model = usedModel
          chatRes = $http.send({
            url: 'https://api.anthropic.com/v1/messages',
            method: 'POST',
            headers: {
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
              'cache-control': 'no-cache',
            },
            body: JSON.stringify(aiBody),
            timeout: 180,
          })
        }
      }

      if (chatRes.statusCode !== 200) {
        $app.logger().error('Anthropic AI failed', 'status', chatRes.statusCode, 'raw', chatRes.raw)

        let errMsg = 'Falha na comunicação com o serviço de IA.'
        let errType = 'unknown_error'

        if (chatRes.json && chatRes.json.error) {
          errType = chatRes.json.error.type || errType
          errMsg = chatRes.json.error.message || errMsg
        }

        if (chatRes.statusCode === 429 || errType === 'insufficient_credits') {
          errType = 'INSUFFICIENT_FUNDS'
          errMsg =
            'Sem saldo ou limite de requisições excedido. Verifique o seu saldo (Credits) no Anthropic Console.'
        } else if (
          chatRes.statusCode === 401 ||
          errType === 'invalid_api_key' ||
          errType === 'authentication_error'
        ) {
          errType = 'INVALID_KEY'
          errMsg =
            'Sua chave de API da Anthropic parece ser inválida. Verifique as configurações do seu perfil.'
        } else if (
          chatRes.statusCode === 404 ||
          chatRes.statusCode === 400 ||
          chatRes.statusCode === 403 ||
          errType === 'not_found_error'
        ) {
          errType = 'MODEL_NOT_AVAILABLE'
          errMsg =
            'O modelo de IA solicitado não está disponível para sua chave. Verifique se sua conta Anthropic possui créditos ativos (Tier 1+).'
        } else {
          errMsg =
            'Ocorreu um erro inesperado ao processar a análise. Por favor, tente novamente mais tarde.'
        }

        return e.badRequestError(
          `[${errType}] ${errMsg} | Detalhe da API: ${chatRes.json?.error?.message || ''}`,
        )
      }

      try {
        let content = chatRes.json.content[0].text
        if (content.includes('```json')) {
          content = content.split('```json')[1].split('```')[0]
        } else if (content.includes('```')) {
          content = content.split('```')[1].split('```')[0]
        }
        analysisResult = JSON.parse(content.trim())
        analysisResult.usedModel = usedModel
      } catch (parseErr) {
        $app
          .logger()
          .error(
            'JSON Parse failed',
            'error',
            parseErr.message,
            'content',
            chatRes.json?.content?.[0]?.text,
          )
        return e.json(500, {
          error:
            'Unable to analyze the document. Please ensure the file contains readable text or check your AI configuration.',
        })
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
        if (analysisResult.conformidade) {
          const statusVal =
            typeof analysisResult.conformidade === 'string'
              ? analysisResult.conformidade
              : analysisResult.conformidade.status
          summaryText = `Status geral: ${statusVal}. Riscos: ${analysisResult.riscos ? analysisResult.riscos.length : 0}`
        }
        reportRecord.set('summary', summaryText)

        let risk = 'baixo'
        if (analysisResult.conformidade) {
          const s = (
            typeof analysisResult.conformidade === 'string'
              ? analysisResult.conformidade
              : analysisResult.conformidade.status || ''
          ).toLowerCase()
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
      const errorMsg = err.message.startsWith('[')
        ? err.message
        : 'Não consegui analisar o contrato. Verifique o arquivo e tente novamente.'
      return e.badRequestError(errorMsg)
    }
  },
  $apis.requireAuth(),
  $apis.bodyLimit(20 * 1024 * 1024),
)
