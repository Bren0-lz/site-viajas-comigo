import { useCallback, useRef, useState } from 'react'

// Casa com a transição `opacity 0.8s` de .heroVideo no CSS.
export const FADE_SECONDS = 0.8

/**
 * Decide se já é hora de passar o bastão para o outro vídeo.
 * Verdadeiro quando o tempo restante do clipe ativo é <= fadeSeconds.
 * Protege contra duration ausente (0/NaN) enquanto o vídeo carrega metadata.
 */
export function shouldHandoff(currentTime, duration, fadeSeconds = FADE_SECONDS) {
  if (!Number.isFinite(duration) || duration <= 0) return false
  if (!Number.isFinite(currentTime)) return false
  // Tolerância para arredondamento de ponto flutuante no limite da janela.
  return duration - currentTime <= fadeSeconds + 1e-3
}

/**
 * Loop de vídeo sem emenda usando dois elementos que se sobrepõem.
 *
 * Em vez de deixar um único <video loop> reiniciar (onde alguns navegadores
 * piscam um frame preto), assim que o vídeo ativo se aproxima do fim iniciamos
 * o outro do zero e trocamos a opacidade. Como sempre há um vídeo totalmente
 * pintado por cima durante a troca, a emenda do loop fica imperceptível.
 *
 * Retorna refs para os dois vídeos, o índice ativo (0 | 1) e o handler
 * onTimeUpdate que deve ser ligado a ambos os vídeos.
 */
export function useSeamlessLoop(fadeSeconds = FADE_SECONDS) {
  const videoARef = useRef(null)
  const videoBRef = useRef(null)
  const [active, setActive] = useState(0)
  // Evita disparar o handoff repetidamente durante a janela de fade.
  const handingOff = useRef(false)

  const onTimeUpdate = useCallback(
    (event) => {
      const current = event.currentTarget
      const refs = [videoARef, videoBRef]
      const currentIndex = refs.findIndex((r) => r.current === current)
      // timeupdate do vídeo inativo (que ainda está terminando de resetar) é ignorado.
      if (currentIndex === -1 || currentIndex !== active) return

      if (handingOff.current) return
      if (!shouldHandoff(current.currentTime, current.duration, fadeSeconds)) return

      const nextIndex = currentIndex === 0 ? 1 : 0
      const next = refs[nextIndex].current
      if (!next) return

      handingOff.current = true
      next.currentTime = 0
      const playback = next.play()
      if (playback && typeof playback.catch === 'function') playback.catch(() => {})
      setActive(nextIndex)

      // O vídeo que saiu de cena é resetado para o próximo ciclo, já fora da vista.
      window.setTimeout(() => {
        current.pause()
        current.currentTime = 0
        handingOff.current = false
      }, fadeSeconds * 1000)
    },
    [active, fadeSeconds]
  )

  return { videoARef, videoBRef, active, onTimeUpdate }
}
