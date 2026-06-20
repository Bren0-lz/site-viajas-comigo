import { describe, it, expect, vi } from 'vitest'
import { buscarPasseios, normalizarTexto } from './passeios.js'

function okJson(body) {
  return vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(body) }))
}

// Resposta no formato de generator=search + pageimages.
const RESP = {
  query: { pages: {
    '900': { pageid: 900, index: 2, title: 'Praia de Copacabana', thumbnail: { source: 'https://img/copa.jpg' } },
    '100': { pageid: 100, index: 1, title: 'Cristo Redentor', thumbnail: { source: 'https://img/cristo.jpg' } },
    '300': { pageid: 300, index: 3, title: 'Lista de praias do Rio' }, // genérico -> ignorado
  } },
}

describe('normalizarTexto', () => {
  it('apara e colapsa espaços, preservando acentos e caixa', () => {
    expect(normalizarTexto('  Cristo   Redentor ')).toBe('Cristo Redentor')
  })
  it('lida com valores nulos', () => {
    expect(normalizarTexto()).toBe('')
  })
})

describe('buscarPasseios', () => {
  it('mapeia resultados por relevância (index) e inclui imagem', async () => {
    const fetchImpl = okJson(RESP)
    const r = await buscarPasseios('Cristo', 'Rio de Janeiro', fetchImpl)
    expect(r.passeios).toEqual([
      { nome: 'Cristo Redentor', imagem: 'https://img/cristo.jpg' },
      { nome: 'Praia de Copacabana', imagem: 'https://img/copa.jpg' },
    ])
  })

  it('inclui a cidade como contexto na query de busca', async () => {
    const fetchImpl = okJson(RESP)
    await buscarPasseios('Cristo', 'Rio de Janeiro', fetchImpl)
    const [url] = fetchImpl.mock.calls[0]
    expect(decodeURIComponent(url)).toContain('Cristo Rio de Janeiro')
  })

  it('envia User-Agent', async () => {
    const fetchImpl = okJson(RESP)
    await buscarPasseios('Cristo', '', fetchImpl)
    const [, opts] = fetchImpl.mock.calls[0]
    expect(opts.headers['User-Agent']).toMatch(/viajas-comigo/)
  })

  it('passeio sem thumbnail fica com imagem null', async () => {
    const fetchImpl = okJson({ query: { pages: { '1': { index: 1, title: 'Morro do Pinto' } } } })
    const r = await buscarPasseios('Morro', 'Rio', fetchImpl)
    expect(r.passeios).toEqual([{ nome: 'Morro do Pinto', imagem: null }])
  })

  it('não busca para termo muito curto (< 2 caracteres)', async () => {
    const fetchImpl = vi.fn()
    const r = await buscarPasseios('a', 'Rio', fetchImpl)
    expect(r.passeios).toEqual([])
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('degrada para lista vazia quando a rede falha', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new Error('rede')))
    const r = await buscarPasseios('Cristo', 'Rio', fetchImpl)
    expect(r.passeios).toEqual([])
  })

  it('degrada para lista vazia quando a resposta não é ok', async () => {
    const fetchImpl = vi.fn(() => Promise.resolve({ ok: false }))
    const r = await buscarPasseios('Cristo', 'Rio', fetchImpl)
    expect(r.passeios).toEqual([])
  })
})
