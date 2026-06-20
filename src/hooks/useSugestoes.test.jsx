import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSugestoes } from './useSugestoes.js'

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

// O debounce é de 500ms; usamos timers reais e damos folga ao waitFor.
const ESPERA = { timeout: 2000 }

describe('useSugestoes', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('não busca para termos curtos (< 3 caracteres)', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useSugestoes('Pa'))
    expect(result.current.sugestoes).toEqual([])
    expect(result.current.carregando).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('busca após o debounce e popula as sugestões', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ passeios: [{ nome: 'Torre Eiffel' }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSugestoes('Paris'))
    expect(result.current.carregando).toBe(true)

    await waitFor(() => expect(result.current.carregando).toBe(false), ESPERA)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/sugestoes?local=Paris')
    expect(result.current.sugestoes).toEqual([{ nome: 'Torre Eiffel' }])
  })

  it('usa o cache em memória na segunda consulta do mesmo termo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ passeios: [{ nome: 'Coliseu' }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const primeira = renderHook(() => useSugestoes('Roma'))
    await waitFor(() => expect(primeira.result.current.carregando).toBe(false), ESPERA)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Segunda montagem com o mesmo termo: serve do cache, sem novo fetch.
    const segunda = renderHook(() => useSugestoes('Roma'))
    expect(segunda.result.current.sugestoes).toEqual([{ nome: 'Coliseu' }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('marca erro quando a requisição falha', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, false))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useSugestoes('Lisboa'))
    await waitFor(() => expect(result.current.erro).toBe(true), ESPERA)
    expect(result.current.sugestoes).toEqual([])
  })
})
