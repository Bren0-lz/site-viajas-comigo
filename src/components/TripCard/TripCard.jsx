import { Link } from 'react-router-dom'
import { slug } from '../../utils/slug.js'
import { useFlight } from '../FlightTransition/FlightTransition.jsx'
import s from './TripCard.module.css'

export default function TripCard({ viagem }) {
  const flyTo = useFlight()
  const to = `/viagem/${slug(viagem.titulo)}`

  const handleClick = e => {
    // Deixa o usuário abrir em nova aba / ctrl+clique normalmente
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    flyTo(to)
  }

  return (
    <Link to={to} onClick={handleClick} className={s.card}>
      <div className={`${s.img} duo${viagem.esgotado ? ' ' + s.soldOut : ''}`}>
        <div
          className={s.imgBg}
          style={{
            backgroundImage: `url('${viagem.imagem}')`,
            backgroundPosition: `${viagem.capaPosX ?? 50}% ${viagem.capaPosY ?? 50}%`,
            '--capa-zoom': viagem.capaZoom || 1,
          }}
        />
        <span className={`${s.badge}${viagem.esgotado ? ' ' + s.esgotado : ''}`}>
          {viagem.esgotado ? 'Esgotado' : 'Vagas abertas'}
        </span>
      </div>

      <div className={s.body}>
        <h3>{viagem.titulo}</h3>
        <div className={s.meta}>
          {viagem.data}
          {viagem.vagas ? <span className={s.metaSep}>·</span> : null}
          {viagem.vagas}
        </div>
        <p className={s.desc}>{viagem.descricao}</p>
        <div className={s.foot}>
          <div className={s.price}>
            <small>A partir de</small>
            <b>R$ {viagem.preco}</b>
          </div>
          <span className={s.link}>Ver roteiro</span>
        </div>
      </div>
    </Link>
  )
}
