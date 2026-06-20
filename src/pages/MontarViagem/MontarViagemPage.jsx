import { useMemo, useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import Autocomplete from '../../components/Autocomplete/Autocomplete.jsx'
import { useSugestoes } from '../../hooks/useSugestoes.js'
import { useCidades } from '../../hooks/useCidades.js'
import { buildMensagemViagem } from '../../utils/montarViagem.js'
import { waLink } from '../../utils/waLink.js'
import s from './MontarViagemPage.module.css'

// Foto do passeio com fallback: se não há imagem ou ela falha ao carregar
// (CSP, 404, rede), mostra o gradiente em vez do ícone de imagem quebrada.
function CardFoto({ imagem }) {
  const [erro, setErro] = useState(false)
  if (!imagem || erro) {
    return <span className={s.cardFoto}><span className={s.cardFotoVazia} aria-hidden="true" /></span>
  }
  return (
    <span className={s.cardFoto}>
      <img src={imagem} alt="" loading="lazy" onError={() => setErro(true)} />
    </span>
  )
}

// Data de hoje no formato YYYY-MM-DD (horário local), usada como mínimo dos campos.
function hojeISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export default function MontarViagemPage() {
  const [local, setLocal] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  // Passeios escolhidos a partir das sugestões (toggle de cards).
  const [selecionados, setSelecionados] = useState([])
  // Passeios digitados manualmente pelo usuário.
  const [personalizados, setPersonalizados] = useState([])
  const [novoPasseio, setNovoPasseio] = useState('')

  const { sugestoes, carregando, erro } = useSugestoes(local)
  const { cidades, carregando: carregandoCidades } = useCidades(local)

  const hoje = hojeISO()

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

  // Sugestões da região que combinam com o que o usuário digita no campo livre
  // e que ainda não foram escolhidas — viram o dropdown do autocomplete.
  const opcoesPasseio = useMemo(() => {
    const termo = novoPasseio.trim().toLowerCase()
    if (!termo) return []
    return sugestoes
      .filter(({ nome }) => nome.toLowerCase().includes(termo))
      .filter(({ nome }) => !passeios.some(p => p.toLowerCase() === nome.toLowerCase()))
      .map(({ nome }) => ({ nome }))
  }, [novoPasseio, sugestoes, passeios])

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

  function adicionarPasseioNome(nomeBruto) {
    const nome = (nomeBruto || '').trim()
    if (!nome) return
    const existe = passeios.some(p => p.toLowerCase() === nome.toLowerCase())
    if (!existe) setPersonalizados(prev => [...prev, nome])
    setNovoPasseio('')
  }

  function adicionarPasseio() {
    adicionarPasseioNome(novoPasseio)
  }

  function removerPasseio(nome) {
    setSelecionados(prev => prev.filter(p => p !== nome))
    setPersonalizados(prev => prev.filter(p => p !== nome))
  }

  function onChangeInicio(valor) {
    setDataInicio(valor)
    // Se o fim ficou anterior ao novo início, descarta o fim.
    if (dataFim && valor && dataFim < valor) setDataFim('')
  }

  function onChangeFim(valor) {
    const minimo = dataInicio || hoje
    // Ignora datas anteriores ao início (ou a hoje), cobrindo navegadores que
    // não respeitam o atributo `min`.
    if (valor && valor < minimo) return
    setDataFim(valor)
  }

  return (
    <>
      <Header />
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
            <Autocomplete
              id="mv-local"
              className={s.input}
              placeholder="Ex.: Rio de Janeiro, Gramado, Maragogi..."
              value={local}
              onChange={setLocal}
              opcoes={cidades}
              onSelecionar={cidade => setLocal(cidade.nome)}
              carregando={carregandoCidades}
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
                min={hoje}
                value={dataInicio}
                onChange={e => onChangeInicio(e.target.value)}
              />
            </div>
            <div className={s.field}>
              <label htmlFor="mv-fim">Fim</label>
              <input
                id="mv-fim"
                type="date"
                className={s.input}
                min={dataInicio || hoje}
                value={dataFim}
                onChange={e => onChangeFim(e.target.value)}
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
              <div className={s.cardsGrid}>
                {sugestoes.map(({ nome, imagem }) => {
                  const ativo = selecionados.includes(nome)
                  return (
                    <button
                      key={nome}
                      type="button"
                      className={`${s.cardPasseio}${ativo ? ' ' + s.cardOn : ''}`}
                      aria-pressed={ativo}
                      onClick={() => toggleSugestao(nome)}
                    >
                      <CardFoto imagem={imagem} />
                      <span className={s.cardNome}>{nome}</span>
                      <span className={s.cardAdd}>{ativo ? '✓ Adicionado' : '+ Adicionar'}</span>
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
              <Autocomplete
                id="mv-novo"
                className={s.input}
                placeholder="Ex.: Cristo Redentor, Pão de Açúcar..."
                value={novoPasseio}
                onChange={setNovoPasseio}
                opcoes={opcoesPasseio}
                onSelecionar={opcao => adicionarPasseioNome(opcao.nome)}
                onEnterLivre={adicionarPasseio}
              />
              <button type="button" className="btn btn-ghost" onClick={adicionarPasseio}>
                Adicionar
              </button>
            </div>
            <p className={s.hint}>Dica: digite o nome do ponto turístico (ex.: "Cristo Redentor"), não uma frase.</p>
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
