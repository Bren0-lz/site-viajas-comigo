// Normaliza o termo de busca: tira espaços nas pontas, colapsa espaços internos
// e padroniza em minúsculas (usado como chave de cache).
export function normalizarTermo(q) {
  return String(q || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

const USER_AGENT = 'viajas-comigo/1.0 (https://viajascomigo.com)'

/**
 * Autocomplete de cidades usando o Nominatim (OpenStreetMap), a mesma fonte já
 * usada na busca de sugestões. Degrada suave: qualquer falha resulta em
 * `cidades: []`, deixando o campo funcionar como texto livre.
 *
 * @param {string} q
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ q: string, cidades: { nome: string, descricao: string, lat: string, lon: string }[] }>}
 */
export async function buscarCidades(q, fetchImpl = fetch) {
  const termo = normalizarTermo(q)
  if (!termo) return { q: termo, cidades: [] }

  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1' +
    '&limit=6&accept-language=pt-BR&q=' + encodeURIComponent(termo)

  let res
  try {
    res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } })
  } catch {
    return { q: termo, cidades: [] }
  }
  if (!res.ok) return { q: termo, cidades: [] }

  const dados = await res.json()
  if (!Array.isArray(dados)) return { q: termo, cidades: [] }

  const vistos = new Set()
  const cidades = []
  for (const item of dados) {
    const end = item?.address || {}
    const nome = end.city || end.town || end.village || end.municipality
    if (!nome) continue

    const partes = [end.state, end.country].filter(Boolean)
    const descricao = partes.join(', ')

    // Evita duplicados (mesma cidade/estado aparecendo em mais de um resultado).
    const chave = `${nome}|${descricao}`.toLowerCase()
    if (vistos.has(chave)) continue
    vistos.add(chave)

    cidades.push({ nome, descricao, lat: item.lat, lon: item.lon })
    if (cidades.length >= 5) break
  }

  return { q: termo, cidades }
}
