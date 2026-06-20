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
 * Nominatim (geocodificação) + Wikipedia GeoSearch (lugares próximos notáveis)
 * + Wikipedia PageImages (foto de cada lugar).
 *
 * Função pura quanto a estado externo: recebe a implementação de fetch por
 * injeção para ser testável sem rede real. Degrada suave — qualquer falha
 * resulta em `passeios: []`, deixando o usuário adicionar passeios manualmente.
 *
 * @param {string} local
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ local: string, passeios: { nome: string, imagem: string | null }[] }>}
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
  const escolhidos = []
  for (const item of itens) {
    const nome = typeof item?.title === 'string' ? item.title.trim() : ''
    if (!nome) continue
    const chave = nome.toLowerCase()
    if (vistos.has(chave)) continue
    if (termo.includes(chave) || chave.includes(termo)) continue
    if (TITULOS_IGNORADOS.some(rx => rx.test(nome))) continue
    vistos.add(chave)
    escolhidos.push({ nome, pageid: item.pageid })
    if (escolhidos.length >= 10) break
  }

  if (!escolhidos.length) return { local: termo, passeios: [] }

  // 4) Busca a thumbnail de cada lugar (uma única chamada com todos os pageids).
  //    Se falhar, os passeios ficam sem imagem (imagem: null).
  const thumbs = await buscarThumbnails(escolhidos.map(e => e.pageid), fetchImpl)
  const passeios = escolhidos.map(({ nome, pageid }) => ({
    nome,
    imagem: thumbs[pageid] || null,
  }))

  return { local: termo, passeios }
}

/**
 * Busca thumbnails da Wikipedia para um conjunto de pageids.
 * @param {(number|string)[]} pageids
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<Record<string, string>>} mapa pageid -> URL da imagem
 */
async function buscarThumbnails(pageids, fetchImpl) {
  const ids = pageids.filter(Boolean)
  if (!ids.length) return {}
  try {
    const url =
      'https://pt.wikipedia.org/w/api.php?action=query&prop=pageimages' +
      '&piprop=thumbnail&pithumbsize=320&format=json&origin=*&pageids=' +
      encodeURIComponent(ids.join('|'))
    const res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!res.ok) return {}
    const data = await res.json()
    const pages = data?.query?.pages
    if (!pages || typeof pages !== 'object') return {}
    const mapa = {}
    for (const pid of Object.keys(pages)) {
      const src = pages[pid]?.thumbnail?.source
      if (src) mapa[pid] = src
    }
    return mapa
  } catch {
    return {}
  }
}
