import { Link } from 'react-router-dom'
import { slug } from '../../utils/slug.js'
import s from './TripCard.module.css'

export default function TripCard({ viagem }) {
  return (
    <Link to={`/viagem/${slug(viagem.titulo)}`} className={s.card}>
      <div className={s.img}>
        <div
          className={s.imgBg}
          style={{ backgroundImage: `url('${viagem.imagem}')` }}
        />
        <span className={`${s.badge}${viagem.esgotado ? ' ' + s.esgotado : ''}`}>
          {viagem.esgotado ? 'Esgotado' : 'Vagas abertas'}
        </span>
      </div>

      <div className={s.body}>
        <h3>{viagem.titulo}</h3>
        <div className={s.date}>{viagem.data}</div>
        <p className={s.desc}>{viagem.descricao}</p>
        <div className={s.foot}>
          <div className={s.price}>
            <small>A partir de</small>
            <b>R$ {viagem.preco}</b>
            <div className={s.vagas}>{viagem.vagas}</div>
          </div>
          <span className={s.btn}>Ver detalhes →</span>
        </div>
      </div>
    </Link>
  )
}
