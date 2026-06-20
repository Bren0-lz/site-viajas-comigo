import { buscarPasseios, normalizarTexto } from './_lib/passeios.js'
import { clientOpcional } from './_lib/store.js'

const CACHE_TTL = 60 * 60 * 24 * 30 // 30 dias

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ erro: 'Método não permitido' })
    }

    const q = normalizarTexto(req.query?.q)
    if (!q) return res.status(400).json({ erro: 'Informe o parâmetro "q".' })

    const local = normalizarTexto(req.query?.local)

    const redis = clientOpcional()
    const cacheKey = `passeios:${local.toLowerCase()}|${q.toLowerCase()}`

    // Cache hit.
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached && Array.isArray(cached.passeios)) return res.status(200).json(cached)
    }

    const resultado = await buscarPasseios(q, local)

    // Só grava no cache quando achou algo (permite nova tentativa se falhou).
    if (redis && resultado.passeios.length) {
      try { await redis.set(cacheKey, resultado, { ex: CACHE_TTL }) } catch (_) {}
    }

    return res.status(200).json(resultado)
  } catch (err) {
    return res.status(500).json({ erro: err.message || 'Erro interno' })
  }
}
