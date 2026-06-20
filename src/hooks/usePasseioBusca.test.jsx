import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { usePasseioBusca } from './usePasseioBusca.js'

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

const ESPERA = { timeout: 2000 }

describe('usePasseioBusca', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('não busca para termos curtos (< 3 caracteres)', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => usePasseioBusca('Cr', 'Rio'))
    expect(result.current.resultados).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('busca por nome incluindo a cidade na URL e popula os resultados', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ passeios: [{ nome: 'Cristo Redentor', imagem: 'https://img/cristo.jpg' }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => usePasseioBusca('Cristo', 'Rio de Janeiro'))
    await waitFor(() => expect(result.current.carregando).toBe(false), ESPERA)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = decodeURIComponent(fetchMock.mock.calls[0][0])
    expect(url).toContain('/api/passeios?q=Cristo')
    expect(url).toContain('local=Rio de Janeiro')
    expect(result.current.resultados).toEqual([{ nome: 'Cristo Redentor', imagem: 'https://img/cristo.jpg' }])
  })

  it('usa o cache em memória na segunda consulta do mesmo par cidade+termo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ passeios: [{ nome: 'Pão de Açúcar', imagem: null }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const primeira = renderHook(() => usePasseioBusca('Pão', 'Rio'))
    await waitFor(() => expect(primeira.result.current.carregando).toBe(false), ESPERA)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const segunda = renderHook(() => usePasseioBusca('Pão', 'Rio'))
    expect(segunda.result.current.resultados).toEqual([{ nome: 'Pão de Açúcar', imagem: null }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
