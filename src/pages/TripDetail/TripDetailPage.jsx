import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import Lightbox from '../../components/Lightbox/Lightbox.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import { slug } from '../../utils/slug.js'
import { waLink } from '../../utils/waLink.js'
import { statusMeta, vagasLabel } from '../../utils/viagemMeta.js'
import { imagemUrl } from '../../utils/imagemUrl.js'
import s from './TripDetailPage.module.css'

// "Dia 1 — Chegada e check-in" → { num: '1', title: 'Chegada e check-in' }
function parseDia(linha, i) {
  const partes = linha.split('—')
  const title = partes.length > 1 ? partes.slice(1).join('—').trim() : linha.trim()
  return { num: String(i + 1), title }
}

export default function TripDetailPage({ viagens, loading }) {
  const { slug: slugParam } = useParams()
  const [lbIndex, setLbIndex] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slugParam])

  const viagem = viagens.find(v => slug(v.titulo) === slugParam)

  if (!viagem && loading) {
    return (
      <>
        <Header />
        <div className={s.notFound}><p>Carregando viagem…</p></div>
        <Footer />
      </>
    )
  }

  if (!viagem) {
    return (
      <>
        <Header />
        <div className={s.notFound}>
          <h1>Viagem não encontrada</h1>
          <p>Talvez ela já tenha saído do ar ou o link esteja incompleto.</p>
          <Link to="/#viagens" className="btn btn-solid">Ver todas as viagens</Link>
        </div>
        <Footer />
      </>
    )
  }

  const st = statusMeta(viagem)
  const allImages = [viagem.imagem, ...(viagem.galeria || [])].filter(Boolean)
  const msgReserva = `Olá! Quero reservar minha vaga na viagem para ${viagem.titulo} (${viagem.data}). Como faço para garantir?`
  const msgDuvidas = `Olá! Tenho interesse na viagem para ${viagem.titulo} (${viagem.data}). Pode me passar mais informações?`
  const heroImg = imagemUrl(viagem.imagem, 1600)
  const heroBg = {
    backgroundImage: heroImg ? `url('${heroImg}')` : undefined,
    backgroundPosition: `${viagem.capaPosX ?? 50}% ${viagem.capaPosY ?? 50}%`,
  }

  return (
    <>
      <Header />

      <div className="pageFade">
        <section className={s.top}>
          <Link to="/#viagens" className={s.back}>
            <svg className={s.backIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Voltar às viagens
          </Link>
        </section>

        <section className={s.heroWrap}>
          <span className={s.status} style={{ background: st.bg, color: st.color }}>
            <span className={s.dot} style={{ background: st.dot }} />{st.label}
          </span>
          <div
            className={s.hero}
            style={heroBg}
            onClick={() => allImages.length && setLbIndex(0)}
            aria-label="Ver foto"
          >
            <div className={s.heroScrim} />
            <div className={s.heroContent}>
              {viagem.local && <div className={s.region}>{viagem.local}</div>}
              <h1>{viagem.titulo}</h1>
              <div className={s.meta}>
                <span><i className="ph ph-calendar-blank" />{viagem.data || 'Datas a definir'}</span>
                {viagem.local && <span><i className="ph ph-map-pin" />{viagem.local}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className={s.layout}>
          <div className={s.main}>
            {(viagem.detalhes || viagem.descricao) && (
              <Reveal className={s.block}>
                <h2>Sobre a viagem</h2>
                <p className={s.lead}>{viagem.detalhes || viagem.descricao}</p>
              </Reveal>
            )}

            {viagem.galeria?.length > 0 && (
              <Reveal className={s.block}>
                <h2>Galeria</h2>
                <div className={s.galeria}>
                  {viagem.galeria.map(img => (
                    <div
                      key={img}
                      className={s.gItem}
                      style={{ backgroundImage: `url('${imagemUrl(img, 600)}')` }}
                      onClick={() => setLbIndex(allImages.indexOf(img))}
                    />
                  ))}
                </div>
              </Reveal>
            )}

            {viagem.inclusos?.length > 0 && (
              <Reveal className={s.block}>
                <h2>O que está incluído</h2>
                <div className={s.inclusos}>
                  {viagem.inclusos.map(item => (
                    <div key={item} className={s.incItem}>
                      <span className={s.ck}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}

            {viagem.roteiro?.length > 0 && (
              <Reveal className={s.block}>
                <h2>Programação dia a dia</h2>
                <div className={s.timeline}>
                  {viagem.roteiro.map((linha, i) => {
                    const d = parseDia(linha, i)
                    const last = i === viagem.roteiro.length - 1
                    return (
                      <div key={linha} className={s.day}>
                        <div className={s.dayLine}>
                          <div className={s.dayNum}>{d.num}</div>
                          {!last && <div className={s.dayBar} />}
                        </div>
                        <div className={s.dayBody}>
                          <div className={s.dayEyebrow}>Dia {d.num}</div>
                          <div className={s.dayTitle}>{d.title}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            )}

            {viagem.local && (
              <Reveal className={s.block}>
                <h2>Onde fica</h2>
                <p className={s.loc}><i className="ph ph-map-pin" />{viagem.local}</p>
                <iframe
                  title={`Mapa de ${viagem.local}`}
                  className={s.mapFrame}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(viagem.local)}&output=embed`}
                />
              </Reveal>
            )}
          </div>

          <aside className={s.side}>
            <Reveal className={s.cardPrice} variant="fade">
              <span className={s.priceLbl}>a partir de</span>
              <div className={s.priceVal}>R$ {viagem.preco || '—'}</div>
              <div className={s.priceNote}>por pessoa</div>
              <div className={s.divider} />
              <ul className={s.facts}>
                <li><span><i className="ph ph-calendar-blank" />Datas</span><b>{viagem.data || 'A definir'}</b></li>
                {viagem.local && <li><span><i className="ph ph-map-pin" />Local</span><b>{viagem.local}</b></li>}
                <li><span><i className="ph ph-users-three" />Vagas</span><b>{vagasLabel(viagem)}</b></li>
              </ul>

              {viagem.esgotado ? (
                <span className={s.btnSoldout}>Esgotado</span>
              ) : (
                <a href={waLink(msgReserva)} target="_blank" rel="noopener" className={s.btnReserve}>Reservar minha vaga</a>
              )}
              <a href={waLink(msgDuvidas)} target="_blank" rel="noopener" className={s.btnWa}>
                <i className="ph ph-whatsapp-logo" />Tirar dúvidas no WhatsApp
              </a>
              <div className={s.reassure}><i className="ph ph-shield-check" />Reserva sem compromisso</div>
            </Reveal>
          </aside>
        </section>
      </div>

      <Footer />
      <WhatsAppButton />

      {lbIndex !== null && (
        <Lightbox images={allImages} initialIndex={lbIndex} onClose={() => setLbIndex(null)} />
      )}
    </>
  )
}
