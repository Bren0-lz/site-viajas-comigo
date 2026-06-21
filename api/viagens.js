import { getViagens, setViagens } from './_lib/store.js'
import { isAuthed } from './_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Leitura pública: o site usa isto para listar as viagens.
      // Cache na CDN da Vercel: serve sem invocar a function por 5 min;
      // stale-while-revalidate entrega o cache antigo na hora e revalida em background.
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400')
      return res.status(200).json(await getViagens())
    }

    if (req.method === 'PUT') {
      // Gravação: só com sessão de admin válida.
      if (!isAuthed(req.headers.cookie)) {
        return res.status(401).json({ erro: 'Não autorizado' })
      }
      // O body já vem parseado pela Vercel quando é JSON; aceita string por garantia.
      let body = req.body
      if (typeof body === 'string') {
        try { body = JSON.parse(body) } catch { body = null }
      }
      if (!Array.isArray(body)) {
        return res.status(400).json({ erro: 'Esperado um array de viagens' })
      }
      return res.status(200).json(await setViagens(body))
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ erro: 'Método não permitido' })
  } catch (err) {
    return res.status(500).json({ erro: err.message || 'Erro interno' })
  }
}
