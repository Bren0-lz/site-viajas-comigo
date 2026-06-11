import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

const steps = [
  {
    num: '01',
    title: 'Você escolhe a viagem',
    desc: 'Você olha as próximas viagens aqui embaixo, abre os detalhes e vê tudo: roteiro, o que está incluso, fotos e o mapa.',
  },
  {
    num: '02',
    title: 'A gente organiza',
    desc: 'Passagens, hospedagem, passeios e roteiro: tudo combinado e fechado pela Viajas Comigo.',
  },
  {
    num: '03',
    title: 'Todo mundo junto',
    desc: 'No dia, é só embarcar. Você viaja acompanhado, faz amizades e curte sem preocupação.',
  },
]

export default function HowItWorks() {
  return (
    <section id="como" className={`${s.light} grain`}>
      <div className="wrap">
        <Reveal className={s.sectionHead} variant="fade">
          <p className="eyebrow">Nº 01 — Simples assim</p>
          <h2>Como funciona uma viagem <em>em grupo</em></h2>
          <p>Você não precisa entender de logística, roteiro ou reserva. A gente cuida de tudo — você só escolhe o destino e arruma a mala.</p>
        </Reveal>
        <div className={s.steps}>
          {steps.map(step => (
            <Reveal key={step.num} className={s.step} variant="fade">
              <div className={s.stepNum}>{step.num}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
