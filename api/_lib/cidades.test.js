import { describe, it, expect, vi } from 'vitest'
import { buscarCidades, normalizarTermo } from './cidades.js'

function okJson(body) {
  return vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }))
}

describe('normalizarTermo', () => {
  it('apara, colapsa espaços e padroniza em minúsculas', () => {
    expect(normalizarTermo('  Rio   DE  Janeiro ')).toBe('rio de janeiro')
  })
  it('lida com valores nulos', () => {
    expect(normalizarTermo()).toBe('')
    expect(normalizarTermo(null)).toBe('')
  })
})

describe('buscarCidades', () => {
  it('mapeia resultados do Nominatim em cidades com descrição', async () => {
    const fetchImpl = okJson([
      { lat: '-29.3', lon: '-50.8', address: { city: 'Gramado', state: 'Rio Grande do Sul', country: 'Brasil' } },
      { lat: '-21.0', lon: '-44.0', address: { town: 'Gramado', state: 'Minas Gerais', country: 'Brasil' } },
    ])
    const r = await buscarCidades('gramado', fetchImpl)
    expect(r.cidades).toEqual([
      { nome: 'Gramado', descricao: 'Rio Grande do Sul, Brasil', lat: '-29.3', lon: '-50.8' },
      { nome: 'Gramado', descricao: 'Minas Gerais, Brasil', lat: '-21.0', lon: '-44.0' },
    ])
  })

  it('ignora resultados sem nome de cidade', async () => {
    const fetchImpl = okJson([
      { lat: '1', lon: '2', address: { state: 'Algum Estado', country: 'Brasil' } },
      { lat: '3', lon: '4', address: { village: 'Vila Bela', country: 'Brasil' } },
    ])
    const r = await buscarCidades('teste', fetchImpl)
    expect(r.cidades).toEqual([
      { nome: 'Vila Bela', descricao: 'Brasil', lat: '3', lon: '4' },
    ])
  })

  it('deduplica cidades de mesmo nome e descrição', async () => {
    const fetchImpl = okJson([
      { lat: '1', lon: '2', address: { city: 'Gramado', state: 'RS', country: 'Brasil' } },
      { lat: '1', lon: '2', address: { city: 'Gramado', state: 'RS', country: 'Brasil' } },
    ])
    const r = await buscarCidades('gramado', fetchImpl)
    expect(r.cidades).toHaveLength(1)
  })

  it('envia User-Agent ao Nominatim', async () => {
    const fetchImpl = okJson([])
    await buscarCidades('gramado', fetchImpl)
    const [, opts] = fetchImpl.mock.calls[0]
    expect(opts.headers['User-Agent']).toMatch(/viajas-comigo/)
  })

  it('degrada para lista vazia quando a rede falha', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new Error('rede')))
    const r = await buscarCidades('gramado', fetchImpl)
    expect(r.cidades).toEqual([])
  })

  it('degrada para lista vazia quando a resposta não é ok', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: false }))
    const r = await buscarCidades('gramado', fetchImpl)
    expect(r.cidades).toEqual([])
  })

  it('retorna vazio para termo vazio sem chamar a rede', async () => {
    const fetchImpl = vi.fn()
    const r = await buscarCidades('  ', fetchImpl)
    expect(r.cidades).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
