routerAdd(
  'POST',
  '/backend/v1/testar_conexao_ia',
  (e) => {
    const body = e.requestInfo().body || {}
    const apiKey = (body.apiKey || '').trim()

    if (!apiKey) {
      return e.badRequestError('Chave de API ausente.')
    }

    const res = $http.send({
      url: 'https://api.anthropic.com/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      let errorMsg = 'Erro ao validar a chave de API.'
      if (res.statusCode === 401) errorMsg = 'Chave de API inválida ou não autorizada.'
      else if (res.statusCode === 403) errorMsg = 'Erro de permissão com esta chave de API.'
      else if (res.statusCode === 429) errorMsg = 'Sem saldo ou limite de requisições excedido.'
      else if (res.statusCode >= 500)
        errorMsg = 'O serviço da Anthropic está indisponível no momento.'
      else if (res.json && res.json.error && res.json.error.message) {
        errorMsg = res.json.error.message
      }

      return e.badRequestError(errorMsg)
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
