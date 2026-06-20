import { waLink } from '../../utils/waLink.js'
import s from './HomePage.module.css'

// Vídeo de fundo do hero, tocado em loop contínuo
const HERO_VIDEO = '/hero-1.mp4'

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function HeroSection() {
  return (
    <section className={s.heroB} id="topo">
      <video
        className={`${s.heroVideo} ${s.heroVideoOn}`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <span className={s.heroOverlay} />
      <div className={s.heroBInner}>
        <h1 className={s.heroBTitle}>
          O próximo destino do grupo já tem <span className="gradText">data marcada.</span>
        </h1>
        <p className={s.heroBText}>
          Pacotes completos com passagem, hospedagem, passeios e ingressos. Veja as viagens
          programadas, escolha a sua e garanta sua vaga.
        </p>
        <div className={s.heroActions}>
          <a onClick={() => scrollTo('viagens')} href="#viagens" className="btn btn-solid">
            Ver viagens programadas<i className="ph ph-arrow-down" />
          </a>
          <a href={waLink()} target="_blank" rel="noopener" className={s.waPulse}>
            <i className="ph ph-whatsapp-logo" />Falar com consultor
          </a>
        </div>
      </div>
    </section>
  )
}
