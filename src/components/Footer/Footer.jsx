import { useNavigate } from 'react-router-dom'
import { waLink } from '../../utils/waLink.js'
import s from './Footer.module.css'

export default function Footer() {
  const navigate = useNavigate()

  function goTop(e) {
    e.preventDefault()
    if (window.location.pathname !== '/') {
      navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function navTo(hash) {
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
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.grid}>
          <div className={s.brandCol}>
            <a
              href="/"
              className={s.brand}
              onClick={goTop}
              aria-label="Viajas Comigo"
            >
              <img src="/logo-emblem.webp" alt="" className={s.emblem} width="220" height="194" decoding="async" />
              <span className={s.word}>
                <span className={s.wordmark}>
                  <span className={s.wordV}>Viajas</span><span className="gradText">comigo</span>
                </span>
                <span className={s.tagline}>AGÊNCIA DE VIAGENS</span>
              </span>
            </a>
            <p className={s.about}>
              Agência de viagens em grupo. A gente cuida de cada detalhe pra você só aproveitar.
            </p>
            <a href={waLink()} target="_blank" rel="noopener" className={s.waBtn}>
              <i className="ph ph-whatsapp-logo" />Fale com a gente
            </a>
          </div>

          <div className={s.col}>
            <div className={s.colTitle}>Navegação</div>
            <a onClick={() => navTo('viagens')}>Viagens</a>
            <a onClick={() => navTo('porque')}>Por que em grupo</a>
            <a onClick={() => navTo('contato')}>Contato</a>
          </div>

          <div className={s.col}>
            <div className={s.colTitle}>Contato</div>
            <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener"><i className="ph ph-instagram-logo" />@viajascomigo</a>
          </div>
        </div>

        <div className={s.copy}>
          © {new Date().getFullYear()} Viajas Comigo · Agência de Viagens. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
