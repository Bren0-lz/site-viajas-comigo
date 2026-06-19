import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

const items = [
  { icon: 'ph-piggy-bank', title: 'Mais barato', desc: 'Pacotes coletivos com preços que você não consegue sozinho.' },
  { icon: 'ph-suitcase-rolling', title: 'Sem dor de cabeça', desc: 'Passagens, hospedagem e roteiro por nossa conta.' },
  { icon: 'ph-users-three', title: 'Companhia garantida', desc: 'Perfeito pra quem quer viajar mas não tem com quem.' },
  { icon: 'ph-shield-check', title: 'Segurança', desc: 'Grupo acompanhado e com suporte do início ao fim.' },
]

export default function WhyStrip() {
  return (
    <section id="porque" className={s.light}>
      <div className="wrap">
        <Reveal className={`${s.sectionHead} ${s.whyStripHead}`}>
          <p className="eyebrow">Simples e sem stress</p>
          <h2>Por que viajar com a gente?</h2>
        </Reveal>
        <div className={s.whyStrip}>
          {items.map((item, i) => (
            <Reveal key={item.title} className={s.whyStripItem} delay={i * 0.08}>
              <span className={s.whyIcon}><i className={`ph ${item.icon}`} /></span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
