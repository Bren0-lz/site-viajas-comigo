import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import s from './Header.module.css'

const MORPH_DISTANCE = 260 // px de scroll até a logo pousar na navbar

const clamp = (n, min, max) => Math.min(Math.max(n, min), max)
const lerp = (a, b, t) => a + (b - a) * t

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const slotRef = useRef(null)
  const flyRef = useRef(null)

  // morph só na home e quando o usuário aceita movimento
  const isHome = pathname === '/'
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const morphAtivo = isHome && !reduced

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Posiciona a logo voadora a cada frame, interpolando entre o centro da faixa
  // branca no topo (grande) e o slot real da marca na navbar (encolhida).
  useLayoutEffect(() => {
    if (!morphAtivo) return

    let raf = 0
    const place = () => {
      raf = 0
      const slot = slotRef.current
      const fly = flyRef.current
      const leadEl = document.getElementById('brand-lead')
      if (!slot || !fly || !leadEl) return

      const t = slot.getBoundingClientRect()
      const lead = leadEl.getBoundingClientRect()
      const baseH = fly.offsetHeight // altura grande inicial (definida no CSS)
      const baseW = fly.offsetWidth
      if (!t.height || !baseH) return

      const p = clamp(window.scrollY / MORPH_DISTANCE, 0, 1)

      // p=0 → escala 1 (tamanho grande do CSS); p=1 → encolhe até a altura do slot
      const escala = lerp(1, t.height / baseH, p)
      // centro alvo: centro da faixa branca (p=0) → centro do slot (p=1)
      const cx = lerp(lead.left + lead.width / 2, t.left + t.width / 2, p)
      const cy = lerp(lead.top + lead.height / 2, t.top + t.height / 2, p)

      // logo ancorada em top:0/left:0 (origin top-left); centralizada no alvo
      const tx = cx - (baseW * escala) / 2
      const ty = cy - (baseH * escala) / 2
      fly.style.transform = `translate(${tx}px, ${ty}px) scale(${escala})`
    }

    const onScrollOrResize = () => {
      if (!raf) raf = requestAnimationFrame(place)
    }

    place()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [morphAtivo])

  function navTo(hash) {
    setMenuOpen(false)
    if (window.location.pathname !== '/') {
      navigate('/')
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
    <header className={`${s.header}${scrolled ? ' ' + s.scrolled : ''}${morphAtivo && !scrolled ? ' ' + s.overHero : ''}`}>
      <div className={`wrap ${s.nav}`}>
        <Link to="/" className={s.brand} aria-label="Viajas Comigo">
          {morphAtivo ? (
            // placeholder invisível só para reservar o espaço da marca no layout
            <span ref={slotRef} className={s.brandSlot} aria-hidden="true" />
          ) : (
            <picture>
              <source srcSet="/logo-light.webp" type="image/webp" />
              <img
                src="/logo-light.png"
                alt="Viajas Comigo"
                className={s.brandImg}
                width="511"
                height="400"
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          )}
        </Link>

        <nav className={`${s.links}${menuOpen ? ' ' + s.open : ''}`}>
          <a onClick={() => navTo('viagens')} href="#viagens">Próximas viagens</a>
          <a onClick={() => navTo('porque')} href="#porque">Por que em grupo</a>
          {/* <a onClick={() => navTo('depoimentos')} href="#depoimentos">Depoimentos</a> */}
          <a onClick={() => navTo('contato')} href="#contato" className={s.cta}>Fale com a gente</a>
        </nav>

        <button
          className={s.burger}
          aria-label="Menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>

    {morphAtivo && (
      <Link
        to="/"
        ref={flyRef}
        className={s.brandFly}
        aria-label="Viajas Comigo"
      >
        <picture>
          <source srcSet="/logo-light.webp" type="image/webp" />
          <img
            src="/logo-light.png"
            alt="Viajas Comigo"
            className={s.brandFlyImg}
            width="511"
            height="400"
            decoding="async"
            fetchPriority="high"
          />
        </picture>
      </Link>
    )}
    </>
  )
}
