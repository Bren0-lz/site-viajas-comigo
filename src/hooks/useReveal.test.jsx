import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useReveal } from './useReveal.js'

// Componente de prova: liga o ref a um elemento real para que o
// IntersectionObserver seja exercitado como em produção.
function Probe(props) {
  const { ref, visible } = useReveal(props)
  return <div ref={ref} data-testid="el" data-visible={String(visible)} />
}

function stubMatchMedia(reduced) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

describe('useReveal', () => {
  let observerCallback
  let observe
  let disconnect

  beforeEach(() => {
    observerCallback = undefined
    observe = vi.fn()
    disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', vi.fn(function (cb) {
      observerCallback = cb
      this.observe = observe
      this.disconnect = disconnect
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('começa invisível quando o movimento não é reduzido', () => {
    stubMatchMedia(false)
    render(<Probe />)
    expect(screen.getByTestId('el').dataset.visible).toBe('false')
    expect(observe).toHaveBeenCalled()
  })

  it('fica visível imediatamente quando já está na viewport na montagem', () => {
    stubMatchMedia(false)
    // Simula um elemento já parcialmente visível ao montar (ex.: "Sobre a
    // viagem" logo abaixo do hero no celular). Deve revelar sem depender do
    // callback do observer.
    const spy = vi
      .spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue({ top: 100, bottom: 400, left: 0, right: 0, width: 0, height: 300 })
    render(<Probe />)
    expect(screen.getByTestId('el').dataset.visible).toBe('true')
    expect(observe).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('fica visível imediatamente quando o usuário prefere movimento reduzido', () => {
    stubMatchMedia(true)
    render(<Probe />)
    expect(screen.getByTestId('el').dataset.visible).toBe('true')
  })

  it('torna-se visível quando o elemento entra na viewport', () => {
    stubMatchMedia(false)
    render(<Probe />)
    expect(screen.getByTestId('el').dataset.visible).toBe('false')

    act(() => {
      observerCallback([{ isIntersecting: true }])
    })

    expect(screen.getByTestId('el').dataset.visible).toBe('true')
    expect(disconnect).toHaveBeenCalled()
  })

  it('permanece invisível enquanto o elemento não intersecta', () => {
    stubMatchMedia(false)
    render(<Probe />)

    act(() => {
      observerCallback([{ isIntersecting: false }])
    })

    expect(screen.getByTestId('el').dataset.visible).toBe('false')
  })
})
