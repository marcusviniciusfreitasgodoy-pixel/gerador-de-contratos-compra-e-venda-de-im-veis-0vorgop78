routerAdd(
  'POST',
  '/backend/v1/testar_conexao_ia',
  (e) => {
    const body = e.requestInfo().body || {}
    let apiKey = body.apiKey || ''
    let source = 'Provided'

    apiKey = apiKey.replace(/[^\x21-\x7E]/g, '')

    if (!apiKey) {
      if (e.auth && e.auth.getString('anthropic_api_key')) {
        apiKey = e.auth.getString('anthropic_api_key').replace(/[^\x21-\x7E]/g, '')
        source = 'Database'
      } else {
        const secretKey = $secrets.get('ANTHROPIC_API_KEY')
        if (secretKey) {
          apiKey = secretKey.replace(/[^\x21-\x7E]/g, '')
          source = 'Secret'
        }
      }
    }

    if (!apiKey) {
      return e.badRequestError('Chave de API ausente. Configure nos segredos ou no banco de dados.')
    }

    // Tenta primeiro listar os modelos (zero-cost e não depende de um modelo específico)
    let res = $http.send({
      url: 'https://api.anthropic.com/v1/models',
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      timeout: 15,
    })

    let usedFallback = false
    let isModelsList = true

    // Se o endpoint de models falhar (ex: erro 404 de rota não encontrada na API antiga), faz fallback para a mensagem
    if (
      res.statusCode === 404 ||
      (res.statusCode !== 200 &&
        res.json &&
        res.json.error &&
        res.json.error.type === 'not_found_error')
    ) {
      isModelsList = false
      let reqBody = {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Say "ok"' }],
      }

      res = $http.send({
        url: 'https://api.anthropic.com/v1/messages',
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(reqBody),
        timeout: 15,
      })

      if (
        res.statusCode !== 200 &&
        res.json &&
        res.json.error &&
        res.json.error.type === 'not_found_error'
      ) {
        reqBody.model = 'claude-3-5-sonnet-20241022'
        res = $http.send({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(reqBody),
          timeout: 15,
        })
        usedFallback = true
      }

      if (
        res.statusCode !== 200 &&
        res.json &&
        res.json.error &&
        res.json.error.type === 'not_found_error'
      ) {
        reqBody.model = 'claude-3-5-sonnet-latest'
        res = $http.send({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify(reqBody),
          timeout: 15,
        })
        usedFallback = true
      }

      // Se ainda der not_found_error depois de todas as tentativas, a chave é válida mas os modelos estão restritos
      if (
        res.statusCode !== 200 &&
        res.json &&
        res.json.error &&
        res.json.error.type === 'not_found_error'
      ) {
        return e.json(200, {
          success: true,
          source,
          fallback: true,
          note: 'Chave válida, mas acesso aos modelos testados está restrito.',
        })
      }
    }

    if (res.statusCode !== 200) {
      let errorMsg = 'Erro ao validar a chave de API.'
      let errorType = 'unknown_error'

      if (res.json && res.json.error) {
        errorType = res.json.error.type || errorType
        errorMsg = res.json.error.message || errorMsg
      }

      if (
        errorType === 'invalid_api_key' ||
        errorType === 'authentication_error' ||
        res.statusCode === 401
      ) {
        errorType = 'authentication_error'
        errorMsg = 'Chave API inválida. Por favor, verifique a chave configurada em seu perfil.'
      } else if (errorType === 'insufficient_credits' || res.statusCode === 429) {
        errorType = 'insufficient_credits'
        errorMsg =
          'Sem saldo ou limite de requisições excedido. Verifique o seu saldo (Credits) no Anthropic Console.'
      } else if (errorType === 'permission_error' || res.statusCode === 403) {
        errorType = 'permission_error'
        errorMsg = 'Erro de permissão. Sua chave não tem acesso a este recurso.'
      } else if (errorType === 'not_found_error' || res.statusCode === 404) {
        errorType = 'not_found_error'
        errorMsg =
          'O modelo de IA solicitado não está disponível para sua chave. Verifique se sua conta Anthropic possui créditos ativos (Tier 1+).'
      } else if (res.statusCode >= 500) {
        errorType = 'server_error'
        errorMsg = 'O serviço da Anthropic está indisponível no momento.'
      }

      $app
        .logger()
        .error('Falha na validação da API Anthropic', 'status', res.statusCode, 'raw', res.raw)

      return e.badRequestError(`[${errorType}] ${errorMsg}`)
    }

    return e.json(200, { success: true, source, fallback: usedFallback, isModelsList })
  },
  $apis.requireAuth(),
)
