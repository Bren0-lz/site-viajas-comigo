import { useMemo, useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import Reveal from '../../components/Reveal/Reveal.jsx'
import Autocomplete from '../../components/Autocomplete/Autocomplete.jsx'
import { useCidades } from '../../hooks/useCidades.js'
import { buildMensagemViagem } from '../../utils/montarViagem.js'
import { waLink } from '../../utils/waLink.js'
import s from './MontarViagemPage.module.css'

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

  const { cidades, carregando: carregandoCidades } = useCidades(local)

  const hoje = hojeISO()

  const mensagem = useMemo(
    () => buildMensagemViagem({ local, dataInicio, dataFim }),
    [local, dataInicio, dataFim]
  )

  const podeEnviar = local.trim().length > 0

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
            Escolha o destino e o período e mande tudo pronto para a nossa consultora
            no WhatsApp. Ela cuida dos passeios e monta o roteiro com você.
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
