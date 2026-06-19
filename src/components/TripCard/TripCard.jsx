import { Link } from 'react-router-dom'
import { slug } from '../../utils/slug.js'
import { statusMeta, vagasLabel } from '../../utils/viagemMeta.js'
import { useFlight } from '../FlightTransition/FlightTransition.jsx'
import s from './TripCard.module.css'

function bgStyle(viagem) {
  return {
    backgroundImage: viagem.imagem ? `url('${viagem.imagem}')` : undefined,
    backgroundPosition: `${viagem.capaPosX ?? 50}% ${viagem.capaPosY ?? 50}%`,
    transform: `scale(${viagem.capaZoom || 1})`,
  }
}

function StatusBadge({ viagem }) {
  const st = statusMeta(viagem)
  return (
    <span className={s.status} style={{ background: st.bg, color: st.color }}>
      <span className={s.dot} style={{ background: st.dot }} />
      {st.label}
    </span>
  )
}

/* ===== Card padrão (grid de viagens) ===== */
export default function TripCard({ viagem }) {
  const flyTo = useFlight()
  const to = `/viagem/${slug(viagem.titulo)}`

  const handleClick = e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    flyTo(to)
  }

  return (
    <Link to={to} onClick={handleClick} className={s.card}>
      <div className={s.media}>
        <div className={s.bg} style={bgStyle(viagem)} />
        <div className={s.scrim} />
        <StatusBadge viagem={viagem} />
        <div className={s.price}>
          <small>a partir de</small>
          <b>R$ {viagem.preco || '—'}</b>
        </div>
        <div className={s.mediaText}>
          {viagem.local && <div className={s.region}>{viagem.local}</div>}
          <div className={s.title}>{viagem.titulo}</div>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.meta}><i className="ph ph-calendar-blank" />{viagem.data || 'Datas a definir'}</div>
        {viagem.descricao && <p className={s.desc}>{viagem.descricao}</p>}
        <div className={s.foot}>
          <span className={s.spots}><i className="ph ph-users-three" />{vagasLabel(viagem)}</span>
          <span className={s.cta}>Ver detalhes <i className="ph ph-arrow-right" /></span>
        </div>
      </div>
    </Link>
  )
}

/* ===== Card de destaque ===== */
/* layout="tall"  → vertical grande, conteúdo sobre a foto (Hero variante A)
   layout="wide"  → horizontal, foto + painel ao lado (seção agenda variante B) */
export function FeaturedCard({ viagem, layout = 'tall' }) {
  const flyTo = useFlight()
  const to = `/viagem/${slug(viagem.titulo)}`

  const handleClick = e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault()
    flyTo(to)
  }

  if (layout === 'wide') {
    return (
      <Link to={to} onClick={handleClick} className={s.wide}>
        <div className={s.wideMedia}>
          <div className={s.bg} style={bgStyle(viagem)} />
          <div className={s.scrim} />
          <span className={s.highlight}><i className="ph ph-fire" />DESTAQUE</span>
          <div className={s.mediaText}>
            {viagem.local && <div className={s.region}>{viagem.local}</div>}
            <div className={s.wideTitle}>{viagem.titulo}</div>
          </div>
        </div>
        <div className={s.widePanel}>
          <StatusBadge viagem={viagem} />
          {(viagem.descricao || viagem.detalhes) && (
            <p className={s.wideSummary}>{viagem.descricao || viagem.detalhes}</p>
          )}
          <div className={s.wideFacts}>
            <span><i className="ph ph-calendar-blank" />{viagem.data || 'Datas a definir'}</span>
            {viagem.local && <span><i className="ph ph-map-pin" />{viagem.local}</span>}
            <span><i className="ph ph-users-three" />{vagasLabel(viagem)}</span>
          </div>
          <div className={s.wideFoot}>
            <div className={s.widedPrice}><small>a partir de</small><b>R$ {viagem.preco || '—'}</b></div>
            <span className={s.wideBtn}>Ver detalhes <i className="ph ph-arrow-right" /></span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={to} onClick={handleClick} className={s.tall}>
      <div className={s.bg} style={bgStyle(viagem)} />
      <div className={s.scrimTall} />
      <div className={s.tallTop}>
        <span className={s.highlight}><i className="ph ph-fire" />DESTAQUE</span>
        <StatusBadge viagem={viagem} />
      </div>
      <div className={s.tallBody}>
        {viagem.local && <div className={s.region}>{viagem.local}</div>}
        <div className={s.tallTitle}>{viagem.titulo}</div>
        <div className={s.tallMeta}>
          <span><i className="ph ph-calendar-blank" />{viagem.data || 'Datas a definir'}</span>
          {viagem.local && <span><i className="ph ph-map-pin" />{viagem.local}</span>}
        </div>
        <div className={s.tallFoot}>
          <div className={s.tallPrice}><small>a partir de</small><b>R$ {viagem.preco || '—'}</b></div>
          <span className={s.tallBtn}>Ver detalhes <i className="ph ph-arrow-right" /></span>
        </div>
      </div>
    </Link>
  )
}
