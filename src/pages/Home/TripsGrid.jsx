import TripCard from '../../components/TripCard/TripCard.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

export default function TripsGrid({ viagens }) {
  return (
    <section className={s.destinos} id="viagens">
      <div className="wrap">
        <Reveal className={`${s.sectionHead} ${s.destinosHead}`}>
          <p className="eyebrow">Agenda aberta</p>
          <h2>Próximas viagens</h2>
          <p>Escolha um destino e toque para ver o roteiro completo, o que está incluso, fotos e o mapa.</p>
        </Reveal>
        <div className={s.grid}>
          {viagens.length === 0 ? (
            <div className={s.empty}>Nenhuma viagem cadastrada ainda. Em breve, novidades! ✦</div>
          ) : (
            viagens.map((v, i) => (
              <Reveal key={v.titulo} delay={i * 0.08}>
                <TripCard viagem={v} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
