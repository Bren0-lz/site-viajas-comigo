import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCidades } from './useCidades.js'

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

// O debounce é de 500ms; usamos timers reais e damos folga ao waitFor.
const ESPERA = { timeout: 2000 }

describe('useCidades', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('não busca para termos curtos (< 3 caracteres)', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderHook(() => useCidades('Gr'))
    expect(result.current.cidades).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('busca após o debounce e popula as cidades', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ cidades: [{ nome: 'Gramado', descricao: 'RS, Brasil' }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCidades('Gramado'))
    expect(result.current.carregando).toBe(true)

    await waitFor(() => expect(result.current.carregando).toBe(false), ESPERA)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/cidades?q=Gramado')
    expect(result.current.cidades).toEqual([{ nome: 'Gramado', descricao: 'RS, Brasil' }])
  })

  it('usa o cache em memória na segunda consulta do mesmo termo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ cidades: [{ nome: 'Maragogi', descricao: 'AL, Brasil' }] })
    )
    vi.stubGlobal('fetch', fetchMock)

    const primeira = renderHook(() => useCidades('Maragogi'))
    await waitFor(() => expect(primeira.result.current.carregando).toBe(false), ESPERA)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const segunda = renderHook(() => useCidades('Maragogi'))
    expect(segunda.result.current.cidades).toEqual([{ nome: 'Maragogi', descricao: 'AL, Brasil' }])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('mantém lista vazia quando a requisição falha', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(null, false))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useCidades('Curitiba'))
    await waitFor(() => expect(result.current.carregando).toBe(false), ESPERA)
    expect(result.current.cidades).toEqual([])
  })
})
