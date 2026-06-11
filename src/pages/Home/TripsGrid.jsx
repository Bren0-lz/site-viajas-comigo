import TripCard from '../../components/TripCard/TripCard.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import s from './HomePage.module.css'

export default function TripsGrid({ viagens }) {
  return (
    <section className={`${s.destinos} grain`} id="viagens">
      <div className="wrap">
        <Reveal className={s.sectionHead} variant="fade">
          <p className="eyebrow">Nº 02 — Agenda aberta</p>
          <h2>Próximas <em>saídas</em></h2>
          <p>Toque em uma viagem para ver o roteiro completo, o que está incluso, fotos e a localização no mapa.</p>
        </Reveal>
        <div className={s.grid}>
          {viagens.length === 0 ? (
            <div className={s.empty}>Nenhuma viagem em cartaz no momento — em breve, novas saídas.</div>
          ) : (
            viagens.map(v => (
              <Reveal key={v.titulo} variant="fade">
                <TripCard viagem={v} />
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
