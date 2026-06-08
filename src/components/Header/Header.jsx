import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import s from './Header.module.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header className={`${s.header}${scrolled ? ' ' + s.scrolled : ''}`}>
      <div className={`wrap ${s.nav}`}>
        <Link to="/" className={s.brand} aria-label="Viajas Comigo">
          <picture>
            <source
              srcSet={scrolled ? '/logo-header.webp' : '/logo-light.webp'}
              type="image/webp"
            />
            <img
              src={scrolled ? '/logo-header.png' : '/logo-light.png'}
              alt="Viajas Comigo"
              className={s.brandImg}
              width="569"
              height="328"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </Link>

        <nav className={`${s.links}${menuOpen ? ' ' + s.open : ''}`}>
          <a onClick={() => navTo('como')} href="#como">Como funciona</a>
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
  )
}
