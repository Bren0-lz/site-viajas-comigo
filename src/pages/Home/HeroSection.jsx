import { useSeamlessLoop } from '../../hooks/useSeamlessLoop.js'
import s from './HomePage.module.css'

// Vídeo de fundo do hero, tocado em loop contínuo
const HERO_VIDEO = '/hero-1.mp4'
// Imagem leve mostrada de imediato (LCP) enquanto o vídeo carrega
const HERO_POSTER = '/hero-poster.webp'

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function HeroSection() {
  const { videoARef, videoBRef, active, onTimeUpdate } = useSeamlessLoop()

  return (
    <section className={s.heroB} id="topo">
      <video
        ref={videoARef}
        className={`${s.heroVideo} ${active === 0 ? s.heroVideoOn : ''}`}
        autoPlay
        muted
        playsInline
        preload="auto"
        poster={HERO_POSTER}
        onTimeUpdate={onTimeUpdate}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <video
        ref={videoBRef}
        className={`${s.heroVideo} ${active === 1 ? s.heroVideoOn : ''}`}
        muted
        playsInline
        preload="metadata"
        poster={HERO_POSTER}
        onTimeUpdate={onTimeUpdate}
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>
      <span className={s.heroOverlay} />
      <div className={s.heroBInner}>
        <h1 className={s.heroBTitle}>
          Chega de esperar. <span className="gradText">Sua viagem já tem data.</span>
        </h1>
        <p className={s.heroBText}>
          Pacotes completos com passagem, hospedagem, passeios e ingressos. É só escolher entre
          as viagens programadas e garantir sua vaga — do resto a gente cuida.
        </p>
        <div className={s.heroActions}>
          <a onClick={() => scrollTo('viagens')} href="#viagens" className="btn btn-solid">
            Ver viagens programadas<i className="ph ph-arrow-down" />
          </a>
        </div>
      </div>
    </section>
  )
}
