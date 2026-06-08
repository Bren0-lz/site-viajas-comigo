import { createContext, useContext, useCallback, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import s from './FlightTransition.module.css'

const FlightContext = createContext(() => {})

export const useFlight = () => useContext(FlightContext)

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function FlightProvider({ children }) {
  const navigate = useNavigate()
  const [flying, setFlying] = useState(false)
  const timers = useRef([])

  const flyTo = useCallback(
    to => {
      // Acessibilidade: sem animação para quem prefere movimento reduzido
      if (prefersReduced()) {
        navigate(to)
        return
      }

      // Evita disparar várias decolagens ao mesmo tempo
      if (flying) return
      setFlying(true)

      // Navega quando o céu já cobriu a tela (meio da animação)
      timers.current.push(setTimeout(() => navigate(to), 620))
      // Remove o overlay quando o avião já saiu e a tela foi revelada
      timers.current.push(setTimeout(() => setFlying(false), 1500))
    },
    [navigate, flying]
  )

  return (
    <FlightContext.Provider value={flyTo}>
      {children}

      {flying && (
        <div className={s.overlay} aria-hidden="true">
          <div className={s.sky} />
          <div className={s.flight}>
            <span className={s.trail} />
            <svg
              className={s.plane}
              viewBox="0 0 512 512"
              fill="currentColor"
              role="presentation"
            >
              <path d="M482 256c0-16-13-29-29-29l-121 0L213 33c-4-7-11-11-19-11l-30 0c-8 0-13 7-11 14l40 191-92 0-31-41c-3-4-7-6-12-6l-22 0c-7 0-12 6-10 13l22 72c1 3 1 6 0 9l-22 72c-2 7 3 13 10 13l22 0c5 0 9-2 12-6l31-41 92 0-40 191c-2 7 3 14 11 14l30 0c8 0 15-4 19-11l119-194 121 0c16 0 29-13 29-29z" />
            </svg>
          </div>
        </div>
      )}
    </FlightContext.Provider>
  )
}
