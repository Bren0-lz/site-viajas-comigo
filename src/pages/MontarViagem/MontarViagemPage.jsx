import { useMemo, useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import { useSugestoes } from '../../hooks/useSugestoes.js'
import { buildMensagemViagem } from '../../utils/montarViagem.js'
import { waLink } from '../../utils/waLink.js'
import s from './MontarViagemPage.module.css'

export default function MontarViagemPage() {
  const [local, setLocal] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  // Passeios escolhidos a partir das sugestões (toggle de chips).
  const [selecionados, setSelecionados] = useState([])
  // Passeios digitados manualmente pelo usuário.
  const [personalizados, setPersonalizados] = useState([])
  const [novoPasseio, setNovoPasseio] = useState('')

  const { sugestoes, carregando, erro } = useSugestoes(local)

  // União sem duplicar (sugeridos marcados + personalizados), preservando ordem.
  const passeios = useMemo(() => {
    const vistos = new Set()
    const out = []
    for (const p of [...selecionados, ...personalizados]) {
      const chave = p.toLowerCase()
      if (vistos.has(chave)) continue
      vistos.add(chave)
      out.push(p)
    }
    return out
  }, [selecionados, personalizados])

  const mensagem = useMemo(
    () => buildMensagemViagem({ local, dataInicio, dataFim, passeios }),
    [local, dataInicio, dataFim, passeios]
  )

  const podeEnviar = local.trim().length > 0

  function toggleSugestao(nome) {
    setSelecionados(prev =>
      prev.includes(nome) ? prev.filter(p => p !== nome) : [...prev, nome]
    )
  }

  function adicionarPasseio() {
    const nome = novoPasseio.trim()
    if (!nome) return
    const existe = passeios.some(p => p.toLowerCase() === nome.toLowerCase())
    if (!existe) setPersonalizados(prev => [...prev, nome])
    setNovoPasseio('')
  }

  function removerPasseio(nome) {
    setSelecionados(prev => prev.filter(p => p !== nome))
    setPersonalizados(prev => prev.filter(p => p !== nome))
  }

  function onNovoPasseioKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      adicionarPasseio()
    }
  }

  return (
    <>
      <Header overlay />
      <main className={`pageFade ${s.page}`}>
        <Reveal className={`wrap ${s.head}`}>
          <p className="eyebrow">Do seu jeito</p>
          <h1>Monte a sua <span className="gradText">própria viagem</span></h1>
          <p className={s.sub}>
            Escolha o destino, o período e os passeios. A gente sugere os pontos mais
            famosos da região e você manda tudo pronto para a nossa consultora no WhatsApp.
          </p>
        </Reveal>

        <section className={`wrap ${s.form}`}>
          {/* Destino */}
          <div className={s.field}>
            <label htmlFor="mv-local">Para onde você quer ir?</label>
            <input
              id="mv-local"
              type="text"
              className={s.input}
              placeholder="Ex.: Paris, Gramado, Maragogi..."
              value={local}
              onChange={e => setLocal(e.target.value)}
              autoComplete="off"
            />
          </div>

          {/* Período */}
          <div className={s.row}>
            <div className={s.field}>
              <label htmlFor="mv-inicio">Início</label>
              <input
                id="mv-inicio"
                type="date"
                className={s.input}
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>
            <div className={s.field}>
              <label htmlFor="mv-fim">Fim</label>
              <input
                id="mv-fim"
                type="date"
                className={s.input}
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
              />
            </div>
          </div>

          {/* Sugestões */}
          <div className={s.field}>
            <label>Passeios famosos na região</label>
            {carregando && <p className={s.hint}>Buscando sugestões...</p>}
            {!carregando && erro && (
              <p className={s.hint}>Não foi possível buscar sugestões agora. Adicione os passeios manualmente abaixo.</p>
            )}
            {!carregando && !erro && local.trim().length >= 3 && sugestoes.length === 0 && (
              <p className={s.hint}>Nenhuma sugestão encontrada — adicione os seus passeios abaixo.</p>
            )}
            {sugestoes.length > 0 && (
              <div className={s.chips}>
                {sugestoes.map(({ nome }) => {
                  const ativo = selecionados.includes(nome)
                  return (
                    <button
                      key={nome}
                      type="button"
                      className={`${s.chip}${ativo ? ' ' + s.chipOn : ''}`}
                      aria-pressed={ativo}
                      onClick={() => toggleSugestao(nome)}
                    >
                      {ativo ? '✓ ' : '+ '}{nome}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Passeio personalizado */}
          <div className={s.field}>
            <label htmlFor="mv-novo">Adicionar um passeio seu</label>
            <div className={s.addRow}>
              <input
                id="mv-novo"
                type="text"
                className={s.input}
                placeholder="Ex.: Jantar com vista para a Torre Eiffel"
                value={novoPasseio}
                onChange={e => setNovoPasseio(e.target.value)}
                onKeyDown={onNovoPasseioKeyDown}
                autoComplete="off"
              />
              <button type="button" className="btn btn-ghost" onClick={adicionarPasseio}>
                Adicionar
              </button>
            </div>
          </div>

          {/* Resumo dos passeios escolhidos */}
          {passeios.length > 0 && (
            <div className={s.field}>
              <label>Seus passeios ({passeios.length})</label>
              <ul className={s.lista}>
                {passeios.map(nome => (
                  <li key={nome} className={s.itemPasseio}>
                    <span>{nome}</span>
                    <button
                      type="button"
                      className={s.remover}
                      aria-label={`Remover ${nome}`}
                      onClick={() => removerPasseio(nome)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pré-visualização da mensagem */}
          <div className={s.field}>
            <label>Prévia da mensagem</label>
            <pre className={s.preview}>{mensagem}</pre>
          </div>

          {/* Envio */}
          <div className={s.actions}>
            {podeEnviar ? (
              <a
                href={waLink(mensagem)}
                target="_blank"
                rel="noopener"
                className={`btn btn-solid ${s.enviar}`}
              >
                <i className="ph ph-whatsapp-logo" />Enviar para a consultora
              </a>
            ) : (
              <button type="button" className={`btn btn-solid ${s.enviar}`} disabled>
                <i className="ph ph-whatsapp-logo" />Enviar para a consultora
              </button>
            )}
            {!podeEnviar && <p className={s.hint}>Informe ao menos o destino para enviar.</p>}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
