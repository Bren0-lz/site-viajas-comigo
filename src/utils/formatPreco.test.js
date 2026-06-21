import { describe, it, expect } from 'vitest'
import { formatPreco } from './formatPreco.js'

describe('formatPreco', () => {
  it('trata os dois últimos dígitos como centavos e agrupa milhares', () => {
    expect(formatPreco('499900')).toBe('4.999,00')
    expect(formatPreco('499950')).toBe('4.999,50')
    expect(formatPreco('198000')).toBe('1.980,00')
  })

  it('ignora qualquer caractere que não seja dígito', () => {
    expect(formatPreco('R$ 1.980,00')).toBe('1.980,00')
    expect(formatPreco('3.690,90')).toBe('3.690,90')
  })

  it('preenche os centavos quando há poucos dígitos', () => {
    expect(formatPreco('4')).toBe('0,04')
    expect(formatPreco('49')).toBe('0,49')
    expect(formatPreco('499')).toBe('4,99')
    expect(formatPreco('500')).toBe('5,00')
  })

  it('retorna string vazia quando não há dígitos', () => {
    expect(formatPreco('')).toBe('')
    expect(formatPreco('abc')).toBe('')
    expect(formatPreco(undefined)).toBe('')
  })
})
