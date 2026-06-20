import { describe, it, expect } from 'vitest'
import { formatarPeriodo, buildMensagemViagem } from './montarViagem.js'

describe('formatarPeriodo', () => {
  it('formata um intervalo normal com a contagem de dias (inclusiva)', () => {
    expect(formatarPeriodo('2026-07-12', '2026-07-18')).toBe('12/07/2026 a 18/07/2026 (7 dias)')
  })

  it('reordena quando as datas vêm invertidas', () => {
    expect(formatarPeriodo('2026-07-18', '2026-07-12')).toBe('12/07/2026 a 18/07/2026 (7 dias)')
  })

  it('usa singular quando início e fim são o mesmo dia', () => {
    expect(formatarPeriodo('2026-07-12', '2026-07-12')).toBe('12/07/2026 a 12/07/2026 (1 dia)')
  })

  it('mostra "A partir de" quando só há data de início', () => {
    expect(formatarPeriodo('2026-07-12', '')).toBe('A partir de 12/07/2026')
  })

  it('mostra "Até" quando só há data de fim', () => {
    expect(formatarPeriodo('', '2026-07-18')).toBe('Até 18/07/2026')
  })

  it('retorna vazio quando não há datas', () => {
    expect(formatarPeriodo('', '')).toBe('')
    expect(formatarPeriodo()).toBe('')
  })

  it('ignora datas em formato inválido', () => {
    expect(formatarPeriodo('12/07/2026', '2026-13-40')).toBe('')
  })

  it('não desloca o dia por causa de fuso (parse local)', () => {
    expect(formatarPeriodo('2026-01-01', '')).toBe('A partir de 01/01/2026')
  })
})

describe('buildMensagemViagem', () => {
  it('inclui destino, período e passeios', () => {
    const msg = buildMensagemViagem({
      local: 'Paris',
      dataInicio: '2026-07-12',
      dataFim: '2026-07-18',
      passeios: ['Torre Eiffel', 'Museu do Louvre'],
    })
    expect(msg).toContain('Paris')
    expect(msg).toContain('12/07/2026 a 18/07/2026 (7 dias)')
    expect(msg).toContain('• Torre Eiffel')
    expect(msg).toContain('• Museu do Louvre')
  })

  it('omite a seção de passeios quando a lista está vazia', () => {
    const msg = buildMensagemViagem({ local: 'Paris', passeios: [] })
    expect(msg).toContain('Paris')
    expect(msg).not.toContain('Passeios desejados')
  })

  it('omite o período quando não há datas', () => {
    const msg = buildMensagemViagem({ local: 'Paris' })
    expect(msg).not.toContain('Período')
  })

  it('limpa espaços e descarta passeios vazios', () => {
    const msg = buildMensagemViagem({
      local: '  Roma  ',
      passeios: ['  Coliseu  ', '', '   '],
    })
    expect(msg).toContain('📍 Destino: Roma')
    expect(msg).toContain('• Coliseu')
    expect(msg).not.toContain('• \n')
  })

  it('funciona sem nenhum argumento (mensagem base)', () => {
    const msg = buildMensagemViagem()
    expect(typeof msg).toBe('string')
    expect(msg).toContain('Viajas Comigo')
  })
})
