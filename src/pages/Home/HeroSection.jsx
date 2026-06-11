import { waLink } from '../../utils/waLink.js'
import s from './HomePage.module.css'

export default function HeroSection() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={`${s.hero} grain`} id="topo">
      <div className={`${s.heroPhoto} duo`} aria-hidden="true">
        <div className={s.heroPhotoImg} />
      </div>

      <div className={`wrap ${s.heroInner}`}>
        <div className={s.masthead}>
          <span>Viagens em grupo</span>
          <span>Brasil &amp; mundo</span>
        </div>
        <h1>A gente monta o pacote.<br />Você só <em>embarca</em>.</h1>
        <p>Na Viajas Comigo a gente organiza tudo, junta a galera e viaja todo mundo junto. Sem stress de planejar — só a parte boa da viagem.</p>
        <div className={s.heroActions}>
          <a onClick={() => scrollTo('viagens')} href="#viagens" className="btn btn-solid">Ver próximas viagens</a>
          <a href={waLink()} target="_blank" rel="noopener" className="lnk-arrow">Quero participar</a>
        </div>
      </div>

      <span className={s.heroRule} aria-hidden="true" />
    </section>
  )
}
