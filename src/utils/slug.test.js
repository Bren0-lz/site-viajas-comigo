import { describe, it, expect } from 'vitest'
import { slug } from './slug.js'

describe('slug', () => {
  it('converte para minúsculas e troca espaços por hífen', () => {
    expect(slug('Serra Gaúcha')).toBe('serra-gaucha')
  })

  it('remove acentos (normalização NFD)', () => {
    expect(slug('São João del-Rei')).toBe('sao-joao-del-rei')
  })

  it('colapsa múltiplos separadores em um único hífen', () => {
    expect(slug('Praia & Sol — Nordeste')).toBe('praia-sol-nordeste')
  })

  it('remove hífens do início e do fim', () => {
    expect(slug('  Bonito  ')).toBe('bonito')
    expect(slug('---teste---')).toBe('teste')
  })

  it('preserva números', () => {
    expect(slug('Réveillon 2026')).toBe('reveillon-2026')
  })

  it('retorna string vazia para entradas vazias ou nulas', () => {
    expect(slug('')).toBe('')
    expect(slug(null)).toBe('')
    expect(slug(undefined)).toBe('')
  })

  it('aceita valores não-string convertendo para texto', () => {
    expect(slug(2026)).toBe('2026')
  })
})
