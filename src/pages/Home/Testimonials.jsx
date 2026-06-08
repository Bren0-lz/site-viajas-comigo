import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

const depoimentos = [
  { text: '"Viajei sozinha pela primeira vez e me senti em família. Tudo organizadíssimo, só me preocupei em aproveitar."', who: 'Marina S.', trip: 'Foz do Iguaçu' },
  { text: '"Melhor custo-benefício que já vi. Conheci gente nova e voltei com amigos pra vida toda."', who: 'Rogério & Cláudia', trip: 'Nordeste' },
  { text: '"Não precisei pensar em nada. Recebi o roteiro pronto e foi só curtir. Já estou no próximo grupo!"', who: 'Patrícia L.', trip: 'Chile' },
]

export default function Testimonials() {
  return (
    <section className={s.depo} id="depoimentos">
      <div className="wrap">
        <Reveal className={s.sectionHead}>
          <p className="eyebrow">Quem já foi, voltou contando</p>
          <h2>O que dizem nossos viajantes</h2>
        </Reveal>
        <div className={s.depoGrid}>
          {depoimentos.map((d, i) => (
            <Reveal key={d.who} className={s.quote} delay={i * 0.1}>
              <div className={s.stars}>★★★★★</div>
              <p>{d.text}</p>
              <div className={s.who}><b>{d.who}</b> — {d.trip}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
