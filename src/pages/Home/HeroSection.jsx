import { waLink } from '../../utils/waLink.js'
import s from './HomePage.module.css'

export default function HeroSection() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className={s.hero} id="topo">
      <div className={`wrap ${s.heroInner}`}>
        <p className="eyebrow">Viagens em grupo • Brasil e mundo</p>
        <span className={s.heroAccent} />
        <h1>A gente monta o pacote.<br />Você só <em>embarca</em>.</h1>
        <p>Viagens em grupo com tudo organizado. Veja as próximas datas abaixo.</p>
        <div className={s.heroActions}>
          <a onClick={() => scrollTo('viagens')} href="#viagens" className="btn btn-solid">Ver próximas viagens</a>
          <a href={waLink()} target="_blank" rel="noopener" className="btn btn-ghost">Quero participar</a>
        </div>
      </div>
      <span className={s.scrollCue}>viagens abertas ↓</span>
    </section>
  )
}
