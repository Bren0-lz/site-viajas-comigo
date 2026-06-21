import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './auth.js'

describe('hashPassword / verifyPassword', () => {
  it('gera um hash no formato "salt:hash" e confere a senha correta', () => {
    const hash = hashPassword('minhaSenha123')
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/)
    expect(verifyPassword('minhaSenha123', hash)).toBe(true)
  })

  it('rejeita senha errada', () => {
    const hash = hashPassword('correta')
    expect(verifyPassword('errada', hash)).toBe(false)
  })

  it('usa salt aleatório: hashes da mesma senha são diferentes', () => {
    expect(hashPassword('igual')).not.toBe(hashPassword('igual'))
  })

  it('retorna false para formatos inválidos', () => {
    expect(verifyPassword('x', '')).toBe(false)
    expect(verifyPassword('x', 'semseparador')).toBe(false)
    expect(verifyPassword('x', null)).toBe(false)
  })
})
