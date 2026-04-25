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
      url:
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
        apiKey,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'teste de conexão' }],
          },
        ],
      }),
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      return e.badRequestError('Chave de API inválida ou sem permissão.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
