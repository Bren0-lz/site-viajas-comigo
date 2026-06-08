import { getViagens, setViagens } from '../lib/store.js'
import { isAuthed } from '../lib/auth.js'

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export async function handler(event) {
  try {
    if (event.httpMethod === 'GET') {
      // Leitura pública: o site usa isto para listar as viagens.
      return json(200, await getViagens())
    }

    if (event.httpMethod === 'PUT') {
      // Gravação: só com sessão de admin válida.
      if (!isAuthed(event.headers.cookie)) {
        return json(401, { erro: 'Não autorizado' })
      }
      let body
      try { body = JSON.parse(event.body || 'null') } catch { body = null }
      if (!Array.isArray(body)) {
        return json(400, { erro: 'Esperado um array de viagens' })
      }
      return json(200, await setViagens(body))
    }

    return { ...json(405, { erro: 'Método não permitido' }), headers: { 'Content-Type': 'application/json', Allow: 'GET, PUT' } }
  } catch (err) {
    return json(500, { erro: err.message || 'Erro interno' })
  }
}
