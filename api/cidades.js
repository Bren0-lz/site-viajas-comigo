import { buscarCidades, normalizarTermo } from './_lib/cidades.js'
import { clientOpcional } from './_lib/store.js'

const CACHE_TTL = 60 * 60 * 24 * 30 // 30 dias

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ erro: 'Método não permitido' })
    }

    const termo = normalizarTermo(req.query?.q)
    if (!termo) return res.status(400).json({ erro: 'Informe o parâmetro "q".' })

    const redis = clientOpcional()
    const cacheKey = `cidades:${termo}`

    // Cache hit.
    if (redis) {
      const cached = await redis.get(cacheKey)
      if (cached && Array.isArray(cached.cidades)) return res.status(200).json(cached)
    }

    const resultado = await buscarCidades(termo)

    // Só grava no cache quando achou algo, para permitir nova tentativa futura
    // caso a primeira busca tenha falhado por rede.
    if (redis && resultado.cidades.length) {
      try { await redis.set(cacheKey, resultado, { ex: CACHE_TTL }) } catch (_) {}
    }

    return res.status(200).json(resultado)
  } catch (err) {
    return res.status(500).json({ erro: err.message || 'Erro interno' })
  }
}
