import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

const items = [
  { num: 'i', title: 'Mais barato', desc: 'Negociamos pacotes coletivos com preços que você não consegue sozinho.' },
  { num: 'ii', title: 'Sem dor de cabeça', desc: 'Roteiro, reservas e imprevistos por nossa conta. Você só aproveita.' },
  { num: 'iii', title: 'Companhia garantida', desc: 'Ideal pra quem quer viajar mas não tem com quem. Aqui ninguém vai sozinho.' },
  { num: 'iv', title: 'Segurança', desc: 'Grupo acompanhado do início ao fim, com suporte em todas as etapas.' },
]

export default function WhyGroup() {
  return (
    <section id="porque" className={`${s.light} grain`}>
      <div className={`wrap ${s.whyGrid}`}>
        <Reveal variant="fade">
          <p className="eyebrow">Nº 03 — Vantagens</p>
          <h2 className={s.whyTitle}>Por que viajar <em>em grupo</em>?</h2>
          <ul className={s.whyList}>
            {items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={0.08 + i * 0.08} variant="fade">
                <h3><span className={s.whyNum}>{item.num}</span>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </ul>
        </Reveal>
        <Reveal variant="wipe" className={s.whyMedia}>
          <div className={`${s.whyPhoto} duo`} />
          <p className={s.whyCaption}>Saída em grupo — todo mundo junto, do embarque à volta</p>
        </Reveal>
      </div>
    </section>
  )
}
