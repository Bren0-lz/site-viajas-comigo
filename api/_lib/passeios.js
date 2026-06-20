// Normaliza texto livre: tira espaços nas pontas e colapsa espaços internos
// (preserva acentos e caixa, que ajudam na busca por nome).
export function normalizarTexto(s) {
  return String(s || '').trim().replace(/\s+/g, ' ')
}

const USER_AGENT = 'viajas-comigo/1.0 (https://viajascomigo.com)'

// Títulos da Wikipedia que não fazem sentido como "passeio" (genéricos).
const TITULOS_IGNORADOS = [/^lista d/i, /^categoria:/i, /wikipédia/i, /desambiguação/i]

/**
 * Busca pontos turísticos por NOME na Wikipedia (busca textual), trazendo a
 * foto de cada um. Diferente de buscarSugestoes (que lista vizinhos do centro
 * da cidade), aqui o usuário digita o nome do lugar (ex.: "Cristo Redentor") e
 * recebe o lugar certo, mesmo que esteja longe do centro. O `local` entra como
 * contexto para desambiguar nomes comuns.
 *
 * Degrada suave: qualquer falha resulta em `passeios: []`.
 *
 * @param {string} q       texto digitado pelo usuário
 * @param {string} [local] cidade escolhida (contexto de busca)
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ passeios: { nome: string, imagem: string | null }[] }>}
 */
export async function buscarPasseios(q, local = '', fetchImpl = fetch) {
  const termo = normalizarTexto(q)
  if (termo.length < 2) return { passeios: [] }

  const cidade = normalizarTexto(local)
  const busca = cidade ? `${termo} ${cidade}` : termo

  const url =
    'https://pt.wikipedia.org/w/api.php?action=query&generator=search' +
    `&gsrsearch=${encodeURIComponent(busca)}&gsrnamespace=0&gsrlimit=8` +
    '&prop=pageimages&piprop=thumbnail&pithumbsize=320&format=json&origin=*'

  let res
  try {
    res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT } })
  } catch {
    return { passeios: [] }
  }
  if (!res.ok) return { passeios: [] }

  const data = await res.json()
  const pages = data?.query?.pages
  if (!pages || typeof pages !== 'object') return { passeios: [] }

  // Os resultados de generator=search vêm como mapa; `index` preserva a ordem
  // de relevância da busca.
  const ordenadas = Object.values(pages).sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0))

  const vistos = new Set()
  const passeios = []
  for (const p of ordenadas) {
    const nome = typeof p?.title === 'string' ? p.title.trim() : ''
    if (!nome) continue
    const chave = nome.toLowerCase()
    if (vistos.has(chave)) continue
    if (TITULOS_IGNORADOS.some(rx => rx.test(nome))) continue
    vistos.add(chave)
    passeios.push({ nome, imagem: p?.thumbnail?.source || null })
    if (passeios.length >= 8) break
  }

  return { passeios }
}
