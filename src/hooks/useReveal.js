import { useEffect, useRef, useState } from 'react'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Revela um elemento quando ele entra na viewport.
 * Retorna { ref, visible }. Dispara uma única vez (once) e respeita
 * a preferência de movimento reduzido do sistema.
 */
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => prefersReducedMotion())

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    // Revela na hora se o elemento já está na viewport (ou acima) no momento da
    // montagem, sem depender do callback assíncrono do observer. No celular,
    // "Sobre a viagem" fica logo abaixo do hero e já está parcialmente visível
    // ao carregar, mas o threshold/rootMargin do observer não o revelava —
    // deixando o texto preso em opacity:0.
    const r = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (r.top < vh && r.bottom > 0) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Revela ao entrar na viewport OU quando o elemento já ficou para trás
        // (top < 0): isso cobre o caso de o usuário já ter rolado além dele e,
        // principalmente, o de o componente remontar após um re-render — como
        // acontece quando a página renderiza primeiro do cache e depois com os
        // dados do /api/viagens. Sem isso, conteúdo que já passou pela dobra
        // ficaria preso em opacity:0 e "sumiria" da tela.
        if (entry.isIntersecting || entry.boundingClientRect?.top < 0) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return { ref, visible }
}
