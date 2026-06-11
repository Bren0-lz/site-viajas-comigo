import { waLink } from '../../utils/waLink.js'
import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

export default function CTASection() {
  return (
    <section className={`${s.cta} grain`} id="contato">
      <Reveal className="wrap" variant="fade">
        <p className="eyebrow">Nº 04 — Bora?</p>
        <h2>Sua próxima viagem já tem <em>grupo</em>.</h2>
        <p className={s.ctaLead}>Chama a gente no WhatsApp ou no Instagram e descubra qual é o próximo destino com vagas abertas.</p>
        <div className={s.ctaLinks}>
          <a href={waLink()} target="_blank" rel="noopener" className={s.ctaLink}>
            Falar no WhatsApp
            <small>resposta rápida</small>
          </a>
          <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener" className={s.ctaLink}>
            Seguir no Instagram
            <small>@viajascomigo</small>
          </a>
        </div>
      </Reveal>
    </section>
  )
}
