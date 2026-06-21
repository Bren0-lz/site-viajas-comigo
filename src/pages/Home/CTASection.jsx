import { Link } from 'react-router-dom'
import { waLink } from '../../utils/waLink.js'
import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

export default function CTASection() {
  return (
    <section className={s.cta} id="contato">
      <span className={`${s.blob} ${s.blobCta1}`} />
      <span className={`${s.blob} ${s.blobCta2}`} />
      <Reveal className={`wrap ${s.ctaInner}`}>
        <p className="eyebrow">Bora?</p>
        <h2>Sua próxima viagem já tem grupo</h2>
        <p>Chama a gente no WhatsApp ou no Instagram e descubra qual é o próximo destino com vagas abertas.</p>
        <div className={s.heroActions} style={{ justifyContent: 'center' }}>
          <a href={waLink()} target="_blank" rel="noopener" className={s.waPulse}>
            <i className="ph ph-whatsapp-logo" />Falar no WhatsApp
          </a>
          <Link to="/montar-viagem" className="btn btn-ghost">
            <i className="ph ph-map-trifold" />Montar minha viagem
          </Link>
          <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener" className={`btn ${s.igBtn}`}>
            <i className="ph ph-instagram-logo" />@viajascomigo
          </a>
        </div>
      </Reveal>
    </section>
  )
}
