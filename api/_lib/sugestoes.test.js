import { describe, it, expect, vi } from 'vitest'
import { buscarSugestoes, normalizarLocal } from './sugestoes.js'

// Cria um fetch falso que responde em sequência conforme a URL chamada.
function mockFetchOk({ geo, wiki, img }) {
  return vi.fn((url) => {
    if (url.includes('nominatim')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(geo) })
    }
    if (url.includes('prop=pageimages')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(img ?? { query: { pages: {} } }) })
    }
    if (url.includes('geosearch')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(wiki) })
    }
    return Promise.reject(new Error('URL inesperada: ' + url))
  })
}

const GEO_PARIS = [{ lat: '48.85', lon: '2.35' }]

describe('normalizarLocal', () => {
  it('apara, colapsa espaços e padroniza em minúsculas', () => {
    expect(normalizarLocal('  Rio   DE  Janeiro ')).toBe('rio de janeiro')
  })
  it('lida com valores nulos', () => {
    expect(normalizarLocal()).toBe('')
    expect(normalizarLocal(null)).toBe('')
  })
})

describe('buscarSugestoes', () => {
  it('mapeia os títulos do Wikipedia em passeios (caminho feliz)', async () => {
    const fetchImpl = mockFetchOk({
      geo: GEO_PARIS,
      wiki: { query: { geosearch: [
        { title: 'Torre Eiffel' },
        { title: 'Museu do Louvre' },
      ] } },
    })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.local).toBe('paris')
    // Sem pageid nos resultados, não há busca de thumbnail (imagem: null).
    expect(r.passeios).toEqual([
      { nome: 'Torre Eiffel', imagem: null },
      { nome: 'Museu do Louvre', imagem: null },
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('inclui a thumbnail quando há pageid e a Wikipedia retorna imagem', async () => {
    const fetchImpl = mockFetchOk({
      geo: GEO_PARIS,
      wiki: { query: { geosearch: [
        { title: 'Torre Eiffel', pageid: 111 },
        { title: 'Museu do Louvre', pageid: 222 },
      ] } },
      img: { query: { pages: {
        111: { thumbnail: { source: 'https://img/torre.jpg' } },
        222: {}, // sem thumbnail -> imagem null
      } } },
    })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.passeios).toEqual([
      { nome: 'Torre Eiffel', imagem: 'https://img/torre.jpg' },
      { nome: 'Museu do Louvre', imagem: null },
    ])
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('degrada para imagem null quando a busca de thumbnails falha', async () => {
    const fetchImpl = vi.fn((url) => {
      if (url.includes('nominatim')) return Promise.resolve({ ok: true, json: () => Promise.resolve(GEO_PARIS) })
      if (url.includes('prop=pageimages')) return Promise.resolve({ ok: false })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ query: { geosearch: [{ title: 'Torre Eiffel', pageid: 111 }] } }) })
    })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.passeios).toEqual([{ nome: 'Torre Eiffel', imagem: null }])
  })

  it('envia User-Agent ao Nominatim (exigido pela política do OSM)', async () => {
    const fetchImpl = mockFetchOk({ geo: GEO_PARIS, wiki: { query: { geosearch: [] } } })
    await buscarSugestoes('Paris', fetchImpl)
    const [, opts] = fetchImpl.mock.calls[0]
    expect(opts.headers['User-Agent']).toMatch(/viajas-comigo/)
  })

  it('retorna lista vazia quando o local não é geocodificado', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve([]) }))
    const r = await buscarSugestoes('xyzlugarinexistente', fetchImpl)
    expect(r.passeios).toEqual([])
    // Não deve chamar a Wikipedia se não houve geocodificação.
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('deduplica e filtra títulos genéricos ou iguais ao destino', async () => {
    const fetchImpl = mockFetchOk({
      geo: GEO_PARIS,
      wiki: { query: { geosearch: [
        { title: 'Torre Eiffel' },
        { title: 'Torre Eiffel' },          // duplicado
        { title: 'Paris' },                  // igual ao destino
        { title: 'Lista de monumentos' },    // genérico
        { title: '' },                       // vazio
        { title: 'Arco do Triunfo' },
      ] } },
    })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.passeios).toEqual([
      { nome: 'Torre Eiffel', imagem: null },
      { nome: 'Arco do Triunfo', imagem: null },
    ])
  })

  it('limita a 10 sugestões', async () => {
    const muitos = Array.from({ length: 20 }, (_, i) => ({ title: `Ponto ${i}` }))
    const fetchImpl = mockFetchOk({ geo: GEO_PARIS, wiki: { query: { geosearch: muitos } } })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.passeios).toHaveLength(10)
  })

  it('retorna lista vazia quando a busca falha por rede', async () => {
    const fetchImpl = vi.fn((url) => {
      if (url.includes('nominatim')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(GEO_PARIS) })
      }
      return Promise.resolve({ ok: false })
    })
    const r = await buscarSugestoes('Paris', fetchImpl)
    expect(r.passeios).toEqual([])
  })

  it('retorna lista vazia para termo vazio sem chamar a rede', async () => {
    const fetchImpl = vi.fn()
    const r = await buscarSugestoes('   ', fetchImpl)
    expect(r.passeios).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
