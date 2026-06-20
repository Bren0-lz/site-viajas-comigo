// Normaliza o termo de busca: tira espaços nas pontas, colapsa espaços internos
// e padroniza em minúsculas (usado como chave de cache e na query).
export function normalizarLocal(local) {
  return String(local || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

const USER_AGENT = 'viajas-comigo/1.0 (https://viajascomigo.com)'

// Títulos do Wikipedia que não fazem sentido como "passeio" (entradas
// administrativas/genéricas). Comparação feita em minúsculas.
const TITULOS_IGNORADOS = [/^lista d/i, /^categoria:/i, /wikipédia/i]

/**
 * Busca pontos turísticos famosos de um local usando APIs públicas e gratuitas:
 * Nominatim (geocodificação) + Wikipedia GeoSearch (lugares próximos notáveis).
 *
 * Função pura quanto a estado externo: recebe a implementação de fetch por
 * injeção para ser testável sem rede real. Degrada suave — qualquer falha
 * resulta em `passeios: []`, deixando o usuário adicionar passeios manualmente.
 *
 * @param {string} local
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ local: string, passeios: { nome: string }[] }>}
 */
export async function buscarSugestoes(local, fetchImpl = fetch) {
  const termo = normalizarLocal(local)
  if (!termo) return { local: termo, passeios: [] }

  // 1) Geocodifica o destino -> lat/lon.
  const geoUrl =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(termo)
  const geoRes = await fetchImpl(geoUrl, { headers: { 'User-Agent': USER_AGENT } })
  if (!geoRes.ok) return { local: termo, passeios: [] }
  const geo = await geoRes.json()
  if (!Array.isArray(geo) || !geo.length) return { local: termo, passeios: [] }

  const { lat, lon } = geo[0]
  if (!lat || !lon) return { local: termo, passeios: [] }

  // 2) Busca lugares notáveis num raio de 10 km ao redor do ponto.
  const wikiUrl =
    'https://pt.wikipedia.org/w/api.php?action=query&list=geosearch' +
    `&gscoord=${encodeURIComponent(lat)}|${encodeURIComponent(lon)}` +
    '&gsradius=10000&gslimit=15&format=json&origin=*'
  const wikiRes = await fetchImpl(wikiUrl, { headers: { 'User-Agent': USER_AGENT } })
  if (!wikiRes.ok) return { local: termo, passeios: [] }
  const wiki = await wikiRes.json()
  const itens = wiki?.query?.geosearch
  if (!Array.isArray(itens)) return { local: termo, passeios: [] }

  // 3) Mapeia títulos -> passeios, filtrando genéricos/duplicados e o próprio
  //    nome do destino. Limita a 10 sugestões para não poluir a interface.
  const vistos = new Set()
  const passeios = []
  for (const item of itens) {
    const nome = typeof item?.title === 'string' ? item.title.trim() : ''
    if (!nome) continue
    const chave = nome.toLowerCase()
    if (vistos.has(chave)) continue
    if (termo.includes(chave) || chave.includes(termo)) continue
    if (TITULOS_IGNORADOS.some(rx => rx.test(nome))) continue
    vistos.add(chave)
    passeios.push({ nome })
    if (passeios.length >= 10) break
  }

  return { local: termo, passeios }
}
