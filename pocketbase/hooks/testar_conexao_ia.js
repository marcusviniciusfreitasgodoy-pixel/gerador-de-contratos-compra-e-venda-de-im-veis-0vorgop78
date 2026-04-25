routerAdd(
  'POST',
  '/backend/v1/testar_conexao_ia',
  (e) => {
    const body = e.requestInfo().body || {}
    let apiKey = body.apiKey || ''
    let source = 'Provided'

    apiKey = apiKey.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '')

    if (!apiKey) {
      const secretKey = $secrets.get('ANTHROPIC_API_KEY')
      if (secretKey) {
        apiKey = secretKey.trim().replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        source = 'Secret'
      } else if (e.auth && e.auth.getString('anthropic_api_key')) {
        apiKey = e.auth
          .getString('anthropic_api_key')
          .trim()
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
        source = 'Database'
      }
    }

    if (!apiKey) {
      return e.badRequestError('Chave de API ausente. Configure nos segredos ou no banco de dados.')
    }

    let res = $http.send({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
      timeout: 15,
    })

    if (res.statusCode === 400 || res.statusCode === 404) {
      if (
        res.json &&
        res.json.error &&
        res.json.error.message &&
        res.json.error.message.toLowerCase().includes('model')
      ) {
        res = $http.send({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }],
          }),
          timeout: 15,
        })
      }
    }

    if (res.statusCode !== 200) {
      let errorMsg = 'Erro ao validar a chave de API.'
      let errorType = 'unknown_error'

      if (res.json && res.json.error) {
        errorType = res.json.error.type || errorType
        errorMsg = res.json.error.message || errorMsg
      } else if (res.statusCode === 401) {
        errorType = 'invalid_api_key'
        errorMsg = 'Chave de API inválida ou não autorizada.'
      } else if (res.statusCode === 403) {
        errorType = 'permission_error'
        errorMsg = 'Erro de permissão com esta chave de API.'
      } else if (res.statusCode === 429) {
        errorType = 'insufficient_credits'
        errorMsg = 'Sem saldo ou limite de requisições excedido.'
      } else if (res.statusCode >= 500) {
        errorType = 'server_error'
        errorMsg = 'O serviço da Anthropic está indisponível no momento.'
      }

      $app
        .logger()
        .error('Falha na validação da API Anthropic', 'status', res.statusCode, 'raw', res.raw)

      return e.badRequestError(`[${errorType}] ${errorMsg}`)
    }

    return e.json(200, { success: true, source })
  },
  $apis.requireAuth(),
)
