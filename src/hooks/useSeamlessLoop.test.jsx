import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { useSeamlessLoop, shouldHandoff, FADE_SECONDS } from './useSeamlessLoop.js'

describe('shouldHandoff', () => {
  it('é falso no começo do clipe (muito tempo restante)', () => {
    expect(shouldHandoff(0, 30, FADE_SECONDS)).toBe(false)
    expect(shouldHandoff(10, 30, FADE_SECONDS)).toBe(false)
  })

  it('é verdadeiro quando o tempo restante <= janela de fade', () => {
    expect(shouldHandoff(30 - FADE_SECONDS, 30, FADE_SECONDS)).toBe(true)
    expect(shouldHandoff(29.95, 30, FADE_SECONDS)).toBe(true)
    expect(shouldHandoff(30, 30, FADE_SECONDS)).toBe(true)
  })

  it('é falso quando duration ainda não está disponível (0/NaN)', () => {
    expect(shouldHandoff(0, 0, FADE_SECONDS)).toBe(false)
    expect(shouldHandoff(5, NaN, FADE_SECONDS)).toBe(false)
    expect(shouldHandoff(NaN, 30, FADE_SECONDS)).toBe(false)
  })
})

// Componente de prova: liga os refs do hook a dois vídeos reais, no padrão de useReveal.test.
function Probe() {
  const { videoARef, videoBRef, active, onTimeUpdate } = useSeamlessLoop()
  return (
    <div data-testid="active" data-active={String(active)}>
      <video data-testid="video-0" ref={videoARef} onTimeUpdate={onTimeUpdate} />
      <video data-testid="video-1" ref={videoBRef} onTimeUpdate={onTimeUpdate} />
    </div>
  )
}

// jsdom não reproduz vídeo: define currentTime/duration controláveis no elemento.
function stubTime(el, { currentTime, duration }) {
  Object.defineProperty(el, 'currentTime', { configurable: true, writable: true, value: currentTime })
  Object.defineProperty(el, 'duration', { configurable: true, value: duration })
}

describe('useSeamlessLoop', () => {
  let play

  beforeEach(() => {
    vi.useFakeTimers()
    play = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(play)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('começa com o vídeo 0 ativo', () => {
    render(<Probe />)
    expect(screen.getByTestId('active').dataset.active).toBe('0')
  })

  it('troca para o vídeo 1 e o inicia quando o vídeo 0 se aproxima do fim', () => {
    render(<Probe />)
    const v0 = screen.getByTestId('video-0')
    const v1 = screen.getByTestId('video-1')

    stubTime(v0, { currentTime: 30 - FADE_SECONDS, duration: 30 })

    act(() => {
      fireEvent.timeUpdate(v0)
    })

    expect(screen.getByTestId('active').dataset.active).toBe('1')
    expect(play).toHaveBeenCalledTimes(1)
    expect(v1.currentTime).toBe(0)
  })

  it('não troca enquanto o vídeo ainda está longe do fim', () => {
    render(<Probe />)
    const v0 = screen.getByTestId('video-0')
    stubTime(v0, { currentTime: 5, duration: 30 })

    act(() => {
      fireEvent.timeUpdate(v0)
    })

    expect(screen.getByTestId('active').dataset.active).toBe('0')
    expect(play).not.toHaveBeenCalled()
  })

  it('não dispara o handoff repetidamente durante a janela de fade', () => {
    render(<Probe />)
    const v0 = screen.getByTestId('video-0')
    stubTime(v0, { currentTime: 29.9, duration: 30 })

    act(() => {
      fireEvent.timeUpdate(v0)
      fireEvent.timeUpdate(v0)
      fireEvent.timeUpdate(v0)
    })

    expect(play).toHaveBeenCalledTimes(1)
  })

  it('ignora timeupdate vindo do vídeo inativo', () => {
    render(<Probe />)
    const v1 = screen.getByTestId('video-1')
    stubTime(v1, { currentTime: 29.9, duration: 30 })

    act(() => {
      fireEvent.timeUpdate(v1)
    })

    expect(screen.getByTestId('active').dataset.active).toBe('0')
    expect(play).not.toHaveBeenCalled()
  })
})
