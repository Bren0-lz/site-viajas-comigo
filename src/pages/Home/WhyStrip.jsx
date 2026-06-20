import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

// Ícones inline (SVG) — não dependem de fonte/CDN externa, então renderizam sempre.
// Herdam a cor via currentColor e o tamanho via font-size de .whyIcon (1em).
const svgProps = {
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const PiggyBank = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M19 8.5c1.2.8 2 2.1 2 3.6 0 1.4-.7 2.6-1.8 3.5l.3 2.4h-2.2l-.4-1.4a8 8 0 0 1-4.4 0L11.9 18H9.7l.3-2.4A5 5 0 0 1 8 11.5C8 8.5 11 6 14.5 6c.9 0 1.7.1 2.5.4" />
    <path d="M14.5 6c-.6-1.2-2-2-3.5-1.7 0 .9.4 1.6 1 2.1" />
    <circle cx="15.5" cy="10.5" r=".6" fill="currentColor" stroke="none" />
    <path d="M4 11h2" />
  </svg>
)

const Suitcase = () => (
  <svg {...svgProps} aria-hidden="true">
    <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
    <path d="M8.5 7.5V6a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 6v1.5" />
    <path d="M9 11v5M15 11v5" />
  </svg>
)

const Users = () => (
  <svg {...svgProps} aria-hidden="true">
    <circle cx="9" cy="8.5" r="2.8" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 6a2.6 2.6 0 0 1 0 5.2" />
    <path d="M16.5 13.5A5.5 5.5 0 0 1 20.5 19" />
  </svg>
)

const Shield = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M12 3.5 5 6v5c0 4 3 7.3 7 9.5 4-2.2 7-5.5 7-9.5V6l-7-2.5Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const items = [
  { Icon: PiggyBank, title: 'Mais barato', desc: 'Pacotes coletivos com preços que você não consegue sozinho.' },
  { Icon: Suitcase, title: 'Sem dor de cabeça', desc: 'Passagens, hospedagem e roteiro por nossa conta.' },
  { Icon: Users, title: 'Companhia garantida', desc: 'Perfeito pra quem quer viajar mas não tem com quem.' },
  { Icon: Shield, title: 'Segurança', desc: 'Grupo acompanhado e com suporte do início ao fim.' },
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
          {items.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} className={s.whyStripItem} delay={i * 0.08}>
              <span className={s.whyIcon}><Icon /></span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
