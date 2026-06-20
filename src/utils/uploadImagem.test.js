import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadImagem } from './uploadImagem.js'

// Cria um File falso. jsdom suporta a API File.
function fakeFile({ type = 'image/png', size = 1024 } = {}) {
  const file = new File(['x'], 'foto.png', { type })
  // size é somente-leitura num File real; sobrescrevemos para simular tamanho.
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

describe('uploadImagem', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejeita arquivos que não são imagem', async () => {
    await expect(uploadImagem(fakeFile({ type: 'application/pdf' })))
      .rejects.toThrow(/arquivo de imagem/i)
  })

  it('rejeita quando nenhum arquivo é informado', async () => {
    await expect(uploadImagem(null)).rejects.toThrow(/arquivo de imagem/i)
  })

  it('rejeita imagens acima de 10 MB', async () => {
    const grande = fakeFile({ size: 11 * 1024 * 1024 })
    await expect(uploadImagem(grande)).rejects.toThrow(/10 MB/)
  })

  it('lança erro quando a assinatura do backend falha', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({ erro: 'Não autorizado' }, false)
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(uploadImagem(fakeFile())).rejects.toThrow('Não autorizado')
    expect(fetchMock).toHaveBeenCalledWith('/api/upload-sign', { method: 'POST' })
  })

  it('lança erro quando o envio ao Cloudinary falha', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ cloudName: 'demo', apiKey: 'k', timestamp: 1, folder: 'f', transformation: 't', signature: 's' }))
      .mockResolvedValueOnce(jsonResponse({}, false))
    vi.stubGlobal('fetch', fetchMock)

    await expect(uploadImagem(fakeFile())).rejects.toThrow(/Falha ao enviar/)
  })

  it('retorna a URL com transformação de entrega otimizada inserida', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ cloudName: 'demo', apiKey: 'k', timestamp: 1, folder: 'f', transformation: 't', signature: 's' }))
      .mockResolvedValueOnce(jsonResponse({ secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/foto.png' }))
    vi.stubGlobal('fetch', fetchMock)

    const url = await uploadImagem(fakeFile())
    expect(url).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/foto.png')
  })

  it('não duplica a transformação se ela já estiver na URL', async () => {
    const jaOtimizada = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/foto.png'
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ cloudName: 'demo', apiKey: 'k', timestamp: 1, folder: 'f', transformation: 't', signature: 's' }))
      .mockResolvedValueOnce(jsonResponse({ secure_url: jaOtimizada }))
    vi.stubGlobal('fetch', fetchMock)

    const url = await uploadImagem(fakeFile())
    expect(url).toBe(jaOtimizada)
  })

  it('envia o FormData com os campos da assinatura para o Cloudinary', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ cloudName: 'demo', apiKey: 'k', timestamp: 123, folder: 'viagens', transformation: 't', signature: 'abc' }))
      .mockResolvedValueOnce(jsonResponse({ secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/foto.png' }))
    vi.stubGlobal('fetch', fetchMock)

    await uploadImagem(fakeFile())

    const [endpoint, options] = fetchMock.mock.calls[1]
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/demo/image/upload')
    expect(options.method).toBe('POST')
    expect(options.body).toBeInstanceOf(FormData)
    expect(options.body.get('api_key')).toBe('k')
    expect(options.body.get('signature')).toBe('abc')
    expect(options.body.get('folder')).toBe('viagens')
  })
})
