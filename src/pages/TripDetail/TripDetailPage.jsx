import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import Lightbox from '../../components/Lightbox/Lightbox.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import { slug } from '../../utils/slug.js'
import { waLink } from '../../utils/waLink.js'
import s from './TripDetailPage.module.css'

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
        <div className={s.notFound}>
          <p>Carregando viagem…</p>
        </div>
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

  const allImages = [viagem.imagem, ...(viagem.galeria || [])].filter(Boolean)
  const msg = `Olá! Tenho interesse na viagem para ${viagem.titulo} (${viagem.data}). Pode me passar mais detalhes?`

  return (
    <>
      <Header />

      <div className="pageFade">
      <section
        className={s.hero}
        style={{
          '--capa-img': `url('${viagem.imagem}')`,
          '--capa-pos': `${viagem.capaPosX ?? 50}% ${viagem.capaPosY ?? 50}%`,
          '--capa-zoom': viagem.capaZoom || 1,
          ...(viagem.capaCor ? { '--capa-cor': viagem.capaCor } : {}),
        }}
        onClick={() => setLbIndex(0)}
        aria-label="Ver foto"
      >
        <div className={`wrap ${s.heroContent}`}>
          <div className={`${s.badge}${viagem.esgotado ? ' ' + s.esgotado : ''}`}>
            {viagem.esgotado ? 'Esgotado' : 'Vagas abertas'}
          </div>
          <h1>{viagem.titulo}</h1>
          <div className={s.meta}>
            {viagem.data}{viagem.local ? ` · ${viagem.local}` : ''}
          </div>
        </div>
        {allImages.length > 1 && (
          <span className={s.photoCount}>📷 {allImages.length} fotos · toque para ampliar</span>
        )}
      </section>

      <div className={s.layout}>
        <div className={s.main}>
          {(viagem.detalhes || viagem.descricao) && (
            <Reveal as="p" className={s.lead}>{viagem.detalhes || viagem.descricao}</Reveal>
          )}

          {viagem.galeria?.length > 0 && (
            <Reveal className={s.block}>
              <h2><span className={s.dot} />Fotos da viagem</h2>
              <div className={s.galeria}>
                {viagem.galeria.map((img, i) => (
                  <div
                    key={img}
                    className={`${s.gItem}${i === 0 ? ' ' + s.feat : ''}`}
                    onClick={() => setLbIndex(allImages.indexOf(img))}
                  >
                    <img src={img} alt={viagem.titulo} loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {(viagem.inclusos?.length > 0 || viagem.roteiro?.length > 0) && (
            <div className={s.pair}>
              {viagem.inclusos?.length > 0 && (
                <Reveal className={s.block}>
                  <h2><span className={s.dot} />O que está incluso</h2>
                  <ul className={s.inclusos}>
                    {viagem.inclusos.map(item => (
                      <li key={item}>
                        <span className={s.ck}>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              )}

              {viagem.roteiro?.length > 0 && (
                <Reveal className={s.block}>
                  <h2><span className={s.dot} />Roteiro dia a dia</h2>
                  <ul className={s.roteiro}>
                    {viagem.roteiro.map(linha => {
                      const partes = linha.split('—')
                      return (
                        <li key={linha}>
                          {partes.length > 1
                            ? <><b>{partes[0].trim()}</b> — {partes.slice(1).join('—').trim()}</>
                            : linha
                          }
                        </li>
                      )
                    })}
                  </ul>
                </Reveal>
              )}
            </div>
          )}

          {viagem.local && (
            <Reveal className={s.block}>
              <h2><span className={s.dot} />Onde fica</h2>
              <p className={s.loc}>📍 {viagem.local}</p>
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
            <small>A partir de</small>
            <div className={s.val}>R$ {viagem.preco || '—'}</div>
            <div className={s.per}>por pessoa</div>
            <ul className={s.facts}>
              <li><span>Datas</span><b>{viagem.data || 'A definir'}</b></li>
              <li><span>Vagas</span><b>{viagem.vagas || 'Consultar'}</b></li>
              {viagem.local && <li><span>Destino</span><b>{viagem.local}</b></li>}
            </ul>

            {viagem.esgotado ? (
              <span className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', opacity: 0.6, cursor: 'default' }}>
                Esgotado
              </span>
            ) : (
              <a href={waLink(msg)} target="_blank" rel="noopener" className={s.btnWa}>
                Tenho interesse (WhatsApp)
              </a>
            )}

            <a
              href="https://instagram.com/viajascomigo"
              target="_blank"
              rel="noopener"
              className={s.btnInsta}
            >
              Ver no Instagram
            </a>
            <p className={s.reassure}>Sem compromisso — tire suas dúvidas direto com a gente.</p>
          </Reveal>
        </aside>
      </div>
      </div>

      <Footer />
      <WhatsAppButton />

      {lbIndex !== null && (
        <Lightbox
          images={allImages}
          initialIndex={lbIndex}
          onClose={() => setLbIndex(null)}
        />
      )}
    </>
  )
}
