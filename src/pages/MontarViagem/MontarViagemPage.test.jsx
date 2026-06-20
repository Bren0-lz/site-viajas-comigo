import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/renderWithRouter.jsx'
import MontarViagemPage from './MontarViagemPage.jsx'

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

describe('MontarViagemPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse({ cidades: [] })
    ))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renderiza os campos principais do formulário', () => {
    renderWithRouter(<MontarViagemPage />)
    expect(screen.getByLabelText(/Para onde você quer ir/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Início/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Fim/i)).toBeInTheDocument()
  })

  it('desabilita o envio enquanto não há destino', () => {
    renderWithRouter(<MontarViagemPage />)
    const botao = screen.getByRole('button', { name: /enviar para a consultora/i })
    expect(botao).toBeDisabled()
  })

  it('gera o link do WhatsApp com o destino codificado', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    await user.type(screen.getByLabelText(/Para onde você quer ir/i), 'Paris')

    const link = screen.getByRole('link', { name: /enviar para a consultora/i })
    const href = link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
    const texto = decodeURIComponent(href.split('?text=')[1])
    expect(texto).toContain('Paris')
  })

  it('impede datas no passado e fim anterior ao início via atributo min', () => {
    renderWithRouter(<MontarViagemPage />)
    const hoje = new Date()
    const iso = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

    const inicio = screen.getByLabelText(/Início/i)
    const fim = screen.getByLabelText(/Fim/i)
    expect(inicio).toHaveAttribute('min', iso)
    // Sem início escolhido, o fim também não pode ser anterior a hoje.
    expect(fim).toHaveAttribute('min', iso)
  })

  it('limpa a data de fim quando o novo início é posterior a ela', () => {
    renderWithRouter(<MontarViagemPage />)

    const inicio = screen.getByLabelText(/Início/i)
    const fim = screen.getByLabelText(/Fim/i)

    fireEvent.change(inicio, { target: { value: '2027-01-10' } })
    fireEvent.change(fim, { target: { value: '2027-01-15' } })
    expect(fim).toHaveValue('2027-01-15')
    // O fim passa a ser mínimo do campo fim.
    expect(fim).toHaveAttribute('min', '2027-01-10')

    // Move o início para depois do fim: o fim é descartado.
    fireEvent.change(inicio, { target: { value: '2027-02-01' } })
    expect(fim).toHaveValue('')
  })
})
