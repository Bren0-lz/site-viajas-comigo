import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

const items = [
  { title: 'Mais barato', desc: 'Negociamos pacotes coletivos com preços que você não consegue sozinho.' },
  { title: 'Sem dor de cabeça', desc: 'Roteiro, reservas e imprevistos por nossa conta. Você só aproveita.' },
  { title: 'Companhia garantida', desc: 'Ideal pra quem quer viajar mas não tem com quem. Aqui ninguém vai sozinho.' },
  { title: 'Segurança', desc: 'Grupo acompanhado do início ao fim, com suporte em todas as etapas.' },
]

export default function WhyGroup() {
  return (
    <section id="porque" className={s.light}>
      <div className={`wrap ${s.whyGrid}`}>
        <Reveal variant="left">
          <p className="eyebrow">Vantagens</p>
          <h2 className={s.whyTitle}>Por que viajar em grupo?</h2>
          <ul className={s.whyList}>
            {items.map((item, i) => (
              <Reveal as="li" key={item.title} delay={0.1 + i * 0.1}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Reveal>
            ))}
          </ul>
        </Reveal>
        <Reveal variant="right" className={s.whyPhoto} />
      </div>
    </section>
  )
}
