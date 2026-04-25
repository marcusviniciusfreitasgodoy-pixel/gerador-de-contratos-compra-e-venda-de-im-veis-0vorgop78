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
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Ping' }],
      }),
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      return e.badRequestError('Erro ao validar a chave de API.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
