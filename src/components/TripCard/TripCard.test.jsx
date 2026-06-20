import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../../test/renderWithRouter.jsx'
import TripCard, { FeaturedCard } from './TripCard.jsx'

const viagemBase = {
  titulo: 'Serra Gaúcha',
  data: '10 a 15 de Outubro',
  descricao: 'Gramado e Canela no clima de montanha.',
  preco: '1.980',
  vagas: '5 vagas',
  esgotado: false,
  local: 'Gramado, RS, Brasil',
  imagem: 'https://exemplo.com/foto.jpg',
}

describe('TripCard', () => {
  it('exibe título, local, preço e data da viagem', () => {
    renderWithRouter(<TripCard viagem={viagemBase} />)
    expect(screen.getByText('Serra Gaúcha')).toBeInTheDocument()
    expect(screen.getByText('Gramado, RS, Brasil')).toBeInTheDocument()
    expect(screen.getByText(/1\.980/)).toBeInTheDocument()
    expect(screen.getByText('10 a 15 de Outubro')).toBeInTheDocument()
  })

  it('linka para a página de detalhe usando o slug do título', () => {
    renderWithRouter(<TripCard viagem={viagemBase} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/viagem/serra-gaucha')
  })

  it('mostra o badge "Vagas abertas" para viagem disponível', () => {
    renderWithRouter(<TripCard viagem={viagemBase} />)
    expect(screen.getByText('Vagas abertas')).toBeInTheDocument()
    expect(screen.getByText('5 vagas')).toBeInTheDocument()
  })

  it('mostra "Esgotada" e "Lotada" quando a viagem está esgotada', () => {
    renderWithRouter(<TripCard viagem={{ ...viagemBase, esgotado: true }} />)
    expect(screen.getByText('Esgotada')).toBeInTheDocument()
    expect(screen.getByText('Lotada')).toBeInTheDocument()
  })

  it('usa textos de fallback quando faltam preço e data', () => {
    renderWithRouter(<TripCard viagem={{ titulo: 'Viagem Surpresa' }} />)
    expect(screen.getByText(/R\$\s*—/)).toBeInTheDocument()
    expect(screen.getByText('Datas a definir')).toBeInTheDocument()
  })
})

describe('FeaturedCard', () => {
  it('renderiza o selo de destaque no layout padrão (tall)', () => {
    renderWithRouter(<FeaturedCard viagem={viagemBase} />)
    expect(screen.getByText('DESTAQUE')).toBeInTheDocument()
    expect(screen.getByText('Serra Gaúcha')).toBeInTheDocument()
  })

  it('renderiza o layout wide com resumo da viagem', () => {
    renderWithRouter(<FeaturedCard viagem={viagemBase} layout="wide" />)
    expect(screen.getByText('DESTAQUE')).toBeInTheDocument()
    expect(screen.getByText('Gramado e Canela no clima de montanha.')).toBeInTheDocument()
  })
})
