import { useNavigate } from 'react-router-dom'
import { waLink } from '../../utils/waLink.js'
import s from './Footer.module.css'

export default function Footer() {
  const navigate = useNavigate()

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
            <div className={s.logoBox}>
              <img src="/logo.webp" alt="Viajas Comigo" className={s.logoImg} />
            </div>
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
            <a href="mailto:contato@viajascomigo.com.br"><i className="ph ph-envelope-simple" />contato@viajascomigo.com.br</a>
            <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener"><i className="ph ph-instagram-logo" />@viajascomigo</a>
            <span><i className="ph ph-map-pin" />Brasil</span>
          </div>
        </div>

        <div className={s.copy}>
          © {new Date().getFullYear()} Viajas Comigo · Agência de Viagens. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
