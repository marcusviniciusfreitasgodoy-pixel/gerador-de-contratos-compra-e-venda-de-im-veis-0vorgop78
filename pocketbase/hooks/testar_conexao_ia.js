routerAdd(
  'POST',
  '/backend/v1/testar-conexao-ia',
  (e) => {
    const body = e.requestInfo().body || {}
    const key = body.apiKey || e.auth?.getString('gemini_api_key') || $secrets.get('GEMINI_API_KEY')

    if (!key) {
      return e.badRequestError('Nenhuma chave configurada.')
    }

    const res = $http.send({
      url: `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with "OK" if you can read this.' }] }],
      }),
      timeout: 15,
    })

    if (res.statusCode === 200) {
      return e.json(200, { success: true, message: 'Conexão estabelecida com sucesso.' })
    } else if (res.statusCode === 429) {
      return e.badRequestError('Limite de tokens excedido ou cota atingida.')
    } else {
      return e.badRequestError(
        'Chave de API inválida. Por favor, revise suas configurações de integração no painel de servidor.',
      )
    }
  },
  $apis.requireAuth(),
)
