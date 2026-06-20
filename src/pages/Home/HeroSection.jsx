import { useEffect, useRef, useState } from 'react'
import { waLink } from '../../utils/waLink.js'
import { FeaturedCard } from '../../components/TripCard/TripCard.jsx'
import s from './HomePage.module.css'

// Cenas turísticas do Brasil que rodam em sequência no fundo do hero
const HERO_CLIPS = ['/hero-1.mp4', '/hero-2.mp4', '/hero-3.mp4']

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

function Stats({ light }) {
  return (
    <div className={`${s.stats}${light ? ' ' + s.statsLight : ''}`}>
      <div><div className={s.statNum}>+2.400</div><div className={s.statLbl}>viajantes felizes</div></div>
      <div className={s.statSep} />
      <div><div className={s.statNum}>4,9<i className="ph ph-star-fill" /></div><div className={s.statLbl}>nota dos clientes</div></div>
      <div className={s.statSep} />
      <div><div className={s.statNum}>+60</div><div className={s.statLbl}>destinos realizados</div></div>
    </div>
  )
}

export default function HeroSection({ variant, featured }) {
  const [clip, setClip] = useState(0)
  const videoRefs = useRef([])

  // Toca o clipe ativo e reinicia do começo; o crossfade por opacidade (CSS)
  // evita o "flash"/pausa que existia ao remontar o <video> a cada troca.
  useEffect(() => {
    if (variant !== 'B') return
    const v = videoRefs.current[clip]
    if (v) {
      v.currentTime = 0
      v.play().catch(() => {})
    }
  }, [clip, variant])

  if (variant === 'B') {
    return (
      <section className={s.heroB} id="topo">
        {HERO_CLIPS.map((src, i) => (
          <video
            key={src}
            ref={el => { videoRefs.current[i] = el }}
            className={`${s.heroVideo}${i === clip ? ' ' + s.heroVideoOn : ''}`}
            autoPlay={i === 0}
            muted
            playsInline
            preload="auto"
            onEnded={() => setClip(c => (c + 1) % HERO_CLIPS.length)}
          >
            <source src={src} type="video/mp4" />
          </video>
        ))}
        <span className={s.heroOverlay} />
        <div className={s.heroBInner}>
          <span className={s.badgeB}><i className="ph ph-airplane-tilt" />Agência de viagens em grupo</span>
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

  // Variante A · Elegante
  return (
    <section className={s.heroA} id="topo">
      <span className={`${s.blob} ${s.blobA1}`} />
      <span className={`${s.blob} ${s.blobA2}`} />
      <div className={s.heroAInner}>
        <div className={s.heroACol}>
          <span className={s.badgeA}><i className="ph ph-airplane-tilt" />Viagens em grupo</span>
          <h1 className={s.heroATitle}>
            Viaje em grupo,<br />sinta-se em casa <span className="gradText">no paraíso.</span>
          </h1>
          <p className={s.heroAText}>
            A gente monta tudo pra você: passagem, hospedagem, passeios e ingressos. Você só escolhe
            o destino e leva quem ama. O resto é com a Viajas Comigo.
          </p>
          <div className={s.heroActions}>
            <a onClick={() => scrollTo('viagens')} href="#viagens" className="btn btn-solid">
              Ver próximas viagens<i className="ph ph-arrow-right" />
            </a>
            <a onClick={() => scrollTo('porque')} href="#porque" className="btn btn-ghost">Como funciona</a>
          </div>
          <Stats />
        </div>
        {featured && (
          <div className={s.heroAFeatured}>
            <FeaturedCard viagem={featured} layout="tall" />
          </div>
        )}
      </div>
    </section>
  )
}
