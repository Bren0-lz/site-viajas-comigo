import { describe, it, expect } from 'vitest'
import { waLink } from './waLink.js'

describe('waLink', () => {
  it('gera link para o número do WhatsApp configurado', () => {
    expect(waLink()).toMatch(/^https:\/\/wa\.me\/5527997499609\?text=/)
  })

  it('usa a mensagem padrão quando nenhum texto é passado', () => {
    const url = waLink()
    const texto = decodeURIComponent(new URL(url).searchParams.get('text'))
    expect(texto).toBe('Olá! Vim pelo site da Viajas Comigo e quero saber das próximas viagens.')
  })

  it('codifica a mensagem extra na query string', () => {
    const url = waLink('Quero saber da Serra Gaúcha & preços')
    const texto = new URL(url).searchParams.get('text')
    expect(texto).toBe('Quero saber da Serra Gaúcha & preços')
    // o texto bruto na URL deve estar percent-encoded (sem espaços nem &)
    expect(url).not.toContain(' ')
    expect(url.split('?text=')[1]).not.toContain('&')
  })
})
