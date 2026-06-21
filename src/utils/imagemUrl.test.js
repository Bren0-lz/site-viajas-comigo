import { describe, it, expect } from 'vitest'
import { imagemUrl } from './imagemUrl.js'

const CLOUDINARY = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/foto.png'
const CLOUDINARY_CRU = 'https://res.cloudinary.com/demo/image/upload/v1/foto.png'
const UNSPLASH = 'https://images.unsplash.com/photo-123?auto=format&fit=crop&w=1200&q=80'

describe('imagemUrl', () => {
  it('retorna a URL inalterada quando vazia ou nula', () => {
    expect(imagemUrl('')).toBe('')
    expect(imagemUrl(null)).toBe(null)
    expect(imagemUrl(undefined)).toBe(undefined)
  })

  it('insere f_auto,q_auto numa URL Cloudinary crua (sem largura)', () => {
    expect(imagemUrl(CLOUDINARY_CRU)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/foto.png'
    )
  })

  it('não duplica o bloco quando já há f_auto,q_auto (sem largura)', () => {
    expect(imagemUrl(CLOUDINARY)).toBe(CLOUDINARY)
  })

  it('adiciona dimensionamento c_limit,w_ numa URL Cloudinary', () => {
    expect(imagemUrl(CLOUDINARY_CRU, 600)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v1/foto.png'
    )
  })

  it('substitui o bloco existente em vez de empilhar (Cloudinary com largura)', () => {
    expect(imagemUrl(CLOUDINARY, 1600)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1600/v1/foto.png'
    )
  })

  it('substitui um bloco que já tinha largura (re-render em outro contexto)', () => {
    const comW600 = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_600/v1/foto.png'
    expect(imagemUrl(comW600, 1200)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_limit,w_1200/v1/foto.png'
    )
  })

  it('ajusta o parâmetro w de uma URL do Unsplash', () => {
    const out = imagemUrl(UNSPLASH, 600)
    const u = new URL(out)
    expect(u.searchParams.get('w')).toBe('600')
    expect(u.searchParams.get('fit')).toBe('crop')
    expect(u.searchParams.get('q')).toBe('80')
  })

  it('não altera a URL do Unsplash quando nenhuma largura é pedida', () => {
    expect(imagemUrl(UNSPLASH)).toBe(UNSPLASH)
  })

  it('retorna inalterada uma URL de origem desconhecida', () => {
    const outra = 'https://exemplo.com/foto.jpg'
    expect(imagemUrl(outra, 600)).toBe(outra)
  })
})
