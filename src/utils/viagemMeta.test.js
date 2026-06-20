import { describe, it, expect } from 'vitest'
import { statusMeta, vagasLabel } from './viagemMeta.js'

describe('statusMeta', () => {
  it('retorna status "esgotada" quando a viagem está esgotada', () => {
    const meta = statusMeta({ esgotado: true })
    expect(meta.key).toBe('esgotada')
    expect(meta.label).toBe('Esgotada')
  })

  it('retorna status "aberta" quando a viagem não está esgotada', () => {
    const meta = statusMeta({ esgotado: false })
    expect(meta.key).toBe('aberta')
    expect(meta.label).toBe('Vagas abertas')
  })

  it('trata viagem nula/indefinida como aberta', () => {
    expect(statusMeta(null).key).toBe('aberta')
    expect(statusMeta(undefined).key).toBe('aberta')
  })

  it('fornece as cores do badge (color, bg e dot)', () => {
    const meta = statusMeta({ esgotado: true })
    expect(meta).toHaveProperty('color')
    expect(meta).toHaveProperty('bg')
    expect(meta).toHaveProperty('dot')
  })
})

describe('vagasLabel', () => {
  it('retorna "Lotada" quando a viagem está esgotada', () => {
    expect(vagasLabel({ esgotado: true, vagas: '8 vagas' })).toBe('Lotada')
  })

  it('usa o campo livre vagas quando disponível', () => {
    expect(vagasLabel({ esgotado: false, vagas: '5 vagas' })).toBe('5 vagas')
  })

  it('cai no rótulo padrão quando não há campo vagas', () => {
    expect(vagasLabel({ esgotado: false })).toBe('Vagas abertas')
    expect(vagasLabel({})).toBe('Vagas abertas')
  })
})
