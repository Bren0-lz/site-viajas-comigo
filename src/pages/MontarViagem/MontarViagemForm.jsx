import { useMemo, useState } from 'react'
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

// Formulário de "Montar a minha viagem". Reaproveitado na página dedicada
// (/montar-viagem) e como seção dentro da Home. `headingTag` controla o nível
// do título (h1 na página dedicada, h2 quando é só mais uma seção da Home).
export default function MontarViagemForm({ id, headingTag: Heading = 'h2' }) {
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
      <Reveal className={`wrap ${s.head}`}>
        <p className="eyebrow">Do seu jeito</p>
        <Heading>Monte a sua <span className="gradText">própria viagem</span></Heading>
        <p className={s.sub}>
          Escolha o destino e o período e mande tudo pronto para a nossa consultora
          no WhatsApp. Ela cuida dos passeios e monta o roteiro com você.
        </p>
      </Reveal>

      <section className={`wrap ${s.form}`}>
        {/* Destino */}
        <div className={s.field}>
          <label htmlFor={`${id}-local`}>Para onde você quer ir?</label>
          <Autocomplete
            id={`${id}-local`}
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
            <label htmlFor={`${id}-inicio`}>Início</label>
            <input
              id={`${id}-inicio`}
              type="date"
              className={s.input}
              min={hoje}
              value={dataInicio}
              onChange={e => onChangeInicio(e.target.value)}
            />
          </div>
          <div className={s.field}>
            <label htmlFor={`${id}-fim`}>Fim</label>
            <input
              id={`${id}-fim`}
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
    </>
  )
}
