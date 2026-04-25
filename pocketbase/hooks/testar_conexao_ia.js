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
      url: 'https://api.openai.com/v1/models',
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + apiKey,
      },
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      if (res.statusCode === 401) {
        return e.badRequestError('Chave Inválida.')
      }
      if (res.statusCode === 429) {
        return e.badRequestError('Limite de cota excedido.')
      }
      return e.badRequestError('Erro ao validar a chave de API.')
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
