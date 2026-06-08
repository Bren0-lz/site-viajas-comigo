import { getViagens, setViagens } from './_lib/store.js'
import { isAuthed } from './_lib/auth.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Leitura pública: o site usa isto para listar as viagens.
      const viagens = await getViagens()
      return res.status(200).json(viagens)
    }

    if (req.method === 'PUT') {
      // Gravação: só com sessão de admin válida.
      if (!isAuthed(req)) {
        return res.status(401).json({ erro: 'Não autorizado' })
      }
      const body = req.body
      if (!Array.isArray(body)) {
        return res.status(400).json({ erro: 'Esperado um array de viagens' })
      }
      const saved = await setViagens(body)
      return res.status(200).json(saved)
    }

    res.setHeader('Allow', 'GET, PUT')
    return res.status(405).json({ erro: 'Método não permitido' })
  } catch (err) {
    return res.status(500).json({ erro: err.message || 'Erro interno' })
  }
}
