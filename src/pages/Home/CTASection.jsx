import { waLink } from '../../utils/waLink.js'
import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

export default function CTASection() {
  return (
    <section className={s.cta} id="contato">
      <Reveal className="wrap">
        <p className="eyebrow">Bora?</p>
        <h2>Sua próxima viagem já tem grupo</h2>
        <p>Chama a gente no WhatsApp ou no Instagram e descubra qual é o próximo destino com vagas abertas.</p>
        <div className={s.heroActions} style={{ justifyContent: 'center' }}>
          <a href={waLink()} target="_blank" rel="noopener" className="btn btn-solid">Falar no WhatsApp</a>
          <a href="https://instagram.com/viajascomigo" target="_blank" rel="noopener" className="btn btn-ghost">@viajascomigo</a>
        </div>
      </Reveal>
    </section>
  )
}
