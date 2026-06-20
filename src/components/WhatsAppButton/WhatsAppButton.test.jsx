import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import WhatsAppButton from './WhatsAppButton.jsx'

describe('WhatsAppButton', () => {
  it('renderiza um link acessível para o WhatsApp', () => {
    render(<WhatsAppButton />)
    const link = screen.getByRole('link', { name: /whatsapp/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
  })

  it('abre em nova aba com rel de segurança', () => {
    render(<WhatsAppButton />)
    const link = screen.getByRole('link', { name: /whatsapp/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })
})
