import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { waLink } from '../../utils/waLink.js'
import s from './Header.module.css'

export default function Header({ overlay = false }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!overlay) return
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [overlay])

  const navClass = `${s.nav}${overlay ? ' ' + s.overlay : ''}${overlay && !scrolled ? ' ' + s.transparent : ''}`

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
    <header className={navClass}>
      <div className={s.inner}>
        <Link to="/" className={s.brand} aria-label="Viajas Comigo">
          <img src="/logo-emblem.webp" alt="" className={s.emblem} width="220" height="194" decoding="async" />
          <span className={s.word}>
            <span className={s.wordmark}>
              <span className={s.wordV}>Viajas</span><span className="gradText">comigo</span>
            </span>
            <span className={s.tagline}>AGÊNCIA DE VIAGENS</span>
          </span>
        </Link>

        <nav className={`${s.links}${menuOpen ? ' ' + s.open : ''}`}>
          <a onClick={() => navTo('viagens')} href="#viagens">Viagens</a>
          <Link to="/montar-viagem" onClick={() => setMenuOpen(false)}>Montar minha viagem</Link>
          <a onClick={() => navTo('porque')} href="#porque">Por que em grupo</a>
          <a onClick={() => navTo('contato')} href="#contato">Contato</a>

          <div className={s.mobileActions}>
            <a href={waLink()} target="_blank" rel="noopener" className={s.waBtn} onClick={() => setMenuOpen(false)}>
              <i className="ph ph-whatsapp-logo" />Falar conosco
            </a>
          </div>
        </nav>

        <div className={s.actions}>
          <a href={waLink()} target="_blank" rel="noopener" className={s.waBtn}>
            <i className="ph ph-whatsapp-logo" />Falar conosco
          </a>
        </div>

        <button
          className={`${s.burger}${menuOpen ? ' ' + s.burgerOpen : ''}`}
          aria-label="Menu"
          onClick={() => setMenuOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
