import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useViagens } from './useViagens.js'
import { SEED_VIAGENS } from '../data/viagens.js'

const CACHE_KEY = 'viajascomigo_destinos'

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) }
}

describe('useViagens', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('inicia com o seed quando não há cache local', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))) // nunca resolve
    const { result } = renderHook(() => useViagens())
    expect(result.current.viagens).toHaveLength(SEED_VIAGENS.length)
    expect(result.current.loading).toBe(true)
  })

  it('substitui o estado pelos dados do servidor e atualiza o cache', async () => {
    const doServidor = [{ titulo: 'Bonito' }]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(doServidor)))

    const { result } = renderHook(() => useViagens())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.viagens).toEqual(doServidor)
    expect(JSON.parse(localStorage.getItem(CACHE_KEY))).toEqual(doServidor)
  })

  it('mantém o cache local quando o fetch falha', async () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify([{ titulo: 'Cacheada' }]))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))

    const { result } = renderHook(() => useViagens())

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.viagens).toEqual([{ titulo: 'Cacheada' }])
  })

  it('addViagem faz PUT com a nova viagem no início da lista', async () => {
    const inicial = [{ titulo: 'Antiga' }]
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(inicial)) // GET inicial
      .mockResolvedValueOnce(jsonResponse([{ titulo: 'Nova' }, ...inicial])) // PUT
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useViagens())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.addViagem({ titulo: 'Nova' })
    })

    const [, putOptions] = fetchMock.mock.calls[1]
    expect(putOptions.method).toBe('PUT')
    const enviado = JSON.parse(putOptions.body)
    expect(enviado[0]).toEqual({ titulo: 'Nova' })
    expect(result.current.viagens).toEqual([{ titulo: 'Nova' }, ...inicial])
  })

  it('deleteViagem remove a viagem pelo slug do título', async () => {
    const inicial = [{ titulo: 'Serra Gaúcha' }, { titulo: 'Bonito' }]
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse(inicial))
      .mockResolvedValueOnce(jsonResponse([{ titulo: 'Bonito' }]))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useViagens())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.deleteViagem('serra-gaucha')
    })

    const enviado = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(enviado).toEqual([{ titulo: 'Bonito' }])
  })

  it('lança mensagem de sessão expirada quando o PUT retorna 401', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse({}, false, 401))
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useViagens())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await expect(
      act(async () => {
        await result.current.addViagem({ titulo: 'X' })
      })
    ).rejects.toThrow(/Sessão expirada/)
  })
})
