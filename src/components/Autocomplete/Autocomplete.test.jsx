import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Autocomplete from './Autocomplete.jsx'

// Wrapper controlado para exercitar o componente como na página real.
function Harness({ opcoes, onSelecionar, onEnterLivre }) {
  const [value, setValue] = useState('')
  return (
    <Autocomplete
      id="ac"
      value={value}
      onChange={setValue}
      opcoes={opcoes}
      onSelecionar={onSelecionar}
      onEnterLivre={onEnterLivre}
      placeholder="Digite..."
    />
  )
}

const OPCOES = [
  { nome: 'Gramado', descricao: 'RS, Brasil' },
  { nome: 'Maragogi', descricao: 'AL, Brasil' },
]

describe('Autocomplete', () => {
  it('exibe as opções ao digitar e seleciona ao clicar', async () => {
    const user = userEvent.setup()
    const onSelecionar = vi.fn()
    render(<Harness opcoes={OPCOES} onSelecionar={onSelecionar} />)

    await user.type(screen.getByRole('combobox'), 'g')
    expect(screen.getByRole('option', { name: /Gramado/i })).toBeInTheDocument()

    await user.click(screen.getByRole('option', { name: /Gramado/i }))
    expect(onSelecionar).toHaveBeenCalledWith(OPCOES[0])
  })

  it('navega por teclado e seleciona com Enter', async () => {
    const user = userEvent.setup()
    const onSelecionar = vi.fn()
    render(<Harness opcoes={OPCOES} onSelecionar={onSelecionar} />)

    const input = screen.getByRole('combobox')
    await user.type(input, 'a')
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onSelecionar).toHaveBeenCalledWith(OPCOES[1])
  })

  it('chama onEnterLivre quando Enter é pressionado sem opção ativa', async () => {
    const user = userEvent.setup()
    const onEnterLivre = vi.fn()
    render(<Harness opcoes={[]} onSelecionar={vi.fn()} onEnterLivre={onEnterLivre} />)

    await user.type(screen.getByRole('combobox'), 'Passeio livre{Enter}')
    expect(onEnterLivre).toHaveBeenCalled()
  })

  it('fecha o dropdown ao pressionar Escape', async () => {
    const user = userEvent.setup()
    render(<Harness opcoes={OPCOES} onSelecionar={vi.fn()} />)

    await user.type(screen.getByRole('combobox'), 'g')
    expect(screen.getByRole('option', { name: /Gramado/i })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })
})
