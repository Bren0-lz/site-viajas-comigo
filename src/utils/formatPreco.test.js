import { describe, it, expect } from 'vitest'
import { formatPreco } from './formatPreco.js'

describe('formatPreco', () => {
  it('agrupa milhares com ponto no padrão brasileiro', () => {
    expect(formatPreco('1980')).toBe('1.980')
    expect(formatPreco('2490')).toBe('2.490')
  })

  it('ignora qualquer caractere que não seja dígito', () => {
    expect(formatPreco('R$ 1.980')).toBe('1.980')
    expect(formatPreco('3.690')).toBe('3.690')
  })

  it('mantém valores curtos sem separador', () => {
    expect(formatPreco('500')).toBe('500')
  })

  it('retorna string vazia quando não há dígitos', () => {
    expect(formatPreco('')).toBe('')
    expect(formatPreco('abc')).toBe('')
    expect(formatPreco(undefined)).toBe('')
  })
})
