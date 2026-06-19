import { useState } from 'react'
import TripCard, { FeaturedCard } from '../../components/TripCard/TripCard.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import { slug } from '../../utils/slug.js'
import s from './HomePage.module.css'

const CHIPS = [
  { key: 'todas', label: 'Todas' },
  { key: 'aberta', label: 'Vagas abertas' },
  { key: 'esgotada', label: 'Esgotadas' },
]

function matchFilter(viagem, filter) {
  if (filter === 'aberta') return !viagem.esgotado
  if (filter === 'esgotada') return !!viagem.esgotado
  return true
}

export default function TripsGrid({ viagens, variant, featured }) {
  const [filter, setFilter] = useState('todas')

  const featuredSlug = featured ? slug(featured.titulo) : null
  const list = viagens
    .filter(v => slug(v.titulo) !== featuredSlug)
    .filter(v => matchFilter(v, filter))

  return (
    <section className={s.agenda} id="viagens">
      <div className="wrap">
        {variant === 'B' && featured && (
          <Reveal className={s.featuredWideWrap}>
            <FeaturedCard viagem={featured} layout="wide" />
          </Reveal>
        )}

        <Reveal className={s.agendaHead}>
          <div>
            <p className="eyebrow">Agenda</p>
            <h2>{variant === 'B' ? 'Todas as viagens' : 'Próximas viagens programadas'}</h2>
          </div>
          <div className={s.chips}>
            {CHIPS.map(c => (
              <button
                key={c.key}
                className={`${s.chip}${filter === c.key ? ' ' + s.chipOn : ''}`}
                onClick={() => setFilter(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className={s.grid}>
          {list.length === 0 ? (
            <div className={s.empty}>Nenhuma viagem nesta seleção ainda. Em breve, novidades! ✦</div>
          ) : (
            list.map((v, i) => (
              <Reveal key={slug(v.titulo)} delay={i * 0.08}>
                <TripCard viagem={v} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
