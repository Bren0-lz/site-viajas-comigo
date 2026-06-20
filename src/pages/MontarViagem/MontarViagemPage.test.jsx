import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../../test/renderWithRouter.jsx'
import MontarViagemPage from './MontarViagemPage.jsx'

function jsonResponse(body, ok = true) {
  return { ok, json: () => Promise.resolve(body) }
}

describe('MontarViagemPage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      jsonResponse({ passeios: [{ nome: 'Torre Eiffel' }, { nome: 'Museu do Louvre' }] })
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
    expect(screen.getByLabelText(/Adicionar um passeio seu/i)).toBeInTheDocument()
  })

  it('desabilita o envio enquanto não há destino', () => {
    renderWithRouter(<MontarViagemPage />)
    const botao = screen.getByRole('button', { name: /enviar para a consultora/i })
    expect(botao).toBeDisabled()
  })

  it('busca e exibe sugestões ao digitar o destino', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    await user.type(screen.getByLabelText(/Para onde você quer ir/i), 'Paris')

    expect(await screen.findByRole('button', { name: /Torre Eiffel/i }, { timeout: 2000 }))
      .toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Museu do Louvre/i })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/sugestoes?local=Paris'),
      expect.any(Object)
    )
  })

  it('marca uma sugestão e a adiciona à lista de passeios', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    await user.type(screen.getByLabelText(/Para onde você quer ir/i), 'Paris')
    const chip = await screen.findByRole('button', { name: /Torre Eiffel/i }, { timeout: 2000 })
    await user.click(chip)

    expect(screen.getByText(/Seus passeios \(1\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Remover Torre Eiffel/i })).toBeInTheDocument()
  })

  it('adiciona e remove um passeio personalizado', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    const campo = screen.getByLabelText(/Adicionar um passeio seu/i)
    await user.type(campo, 'Passeio de barco no Sena')
    await user.click(screen.getByRole('button', { name: /^Adicionar$/i }))

    expect(screen.getByText(/Seus passeios \(1\)/i)).toBeInTheDocument()
    const remover = screen.getByRole('button', { name: /Remover Passeio de barco no Sena/i })
    await user.click(remover)

    expect(screen.queryByText(/Seus passeios/i)).not.toBeInTheDocument()
  })

  it('gera o link do WhatsApp com destino e passeios codificados', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    await user.type(screen.getByLabelText(/Para onde você quer ir/i), 'Paris')
    const chip = await screen.findByRole('button', { name: /Torre Eiffel/i }, { timeout: 2000 })
    await user.click(chip)

    const link = screen.getByRole('link', { name: /enviar para a consultora/i })
    const href = link.getAttribute('href')
    expect(href).toMatch(/^https:\/\/wa\.me\//)
    const texto = decodeURIComponent(href.split('?text=')[1])
    expect(texto).toContain('Paris')
    expect(texto).toContain('Torre Eiffel')
  })

  it('não duplica um passeio já sugerido quando adicionado manualmente', async () => {
    const user = userEvent.setup()
    renderWithRouter(<MontarViagemPage />)

    await user.type(screen.getByLabelText(/Para onde você quer ir/i), 'Paris')
    const chip = await screen.findByRole('button', { name: /Torre Eiffel/i }, { timeout: 2000 })
    await user.click(chip)

    const campo = screen.getByLabelText(/Adicionar um passeio seu/i)
    await user.type(campo, 'Torre Eiffel')
    await user.click(screen.getByRole('button', { name: /^Adicionar$/i }))

    expect(screen.getByText(/Seus passeios \(1\)/i)).toBeInTheDocument()
  })
})
