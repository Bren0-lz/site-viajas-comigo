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
          <div className={s.col}>
            <div className={s.brand}>
              <span className={s.brandV}>Viajas</span>
              <span className={s.brandC}>Comigo</span>
            </div>
            <p>Viagens em grupo organizadas do começo ao fim. A gente monta o pacote, junta a galera e vai todo mundo junto.</p>
          </div>

          <div className={s.col}>
            <h4>Navegação</h4>
            <a onClick={() => navTo('como')}>Como funciona</a>
            <a onClick={() => navTo('viagens')}>Próximas viagens</a>
            <a onClick={() => navTo('porque')}>Por que em grupo</a>
            <a onClick={() => navTo('depoimentos')}>Depoimentos</a>
          </div>

          <div className={s.col}>
            <h4>Contato</h4>
            <a href={waLink()} target="_blank" rel="noopener">WhatsApp</a>
            <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener">Instagram @viajascomigo</a>
            <a href="mailto:contato@viajascomigo.com.br">contato@viajascomigo.com.br</a>
          </div>
        </div>

        <div className={s.copy}>
          © {new Date().getFullYear()} Viajas Comigo · Todos os direitos reservados · CADASTUR 00.000.000/0000-00
        </div>
      </div>
    </footer>
  )
}
