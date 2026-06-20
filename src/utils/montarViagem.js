// Funções puras para montar a mensagem de WhatsApp da feature "Montar a própria
// viagem". Mantidas sem dependências de React/DOM para serem 100% testáveis e
// reaproveitáveis (a codificação para URL fica por conta de waLink()).

// Converte "YYYY-MM-DD" num Date no fuso local (evita o deslocamento de um dia
// que acontece quando o construtor interpreta a string como UTC).
function parseData(iso) {
  if (typeof iso !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim())
  if (!m) return null
  const ano = Number(m[1])
  const mes = Number(m[2])
  const dia = Number(m[3])
  const d = new Date(ano, mes - 1, dia)
  // Rejeita datas impossíveis (ex.: 2026-02-31 "rola" para março).
  if (d.getFullYear() !== ano || d.getMonth() !== mes - 1 || d.getDate() !== dia) {
    return null
  }
  return d
}

function formatarBR(d) {
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  return `${dia}/${mes}/${d.getFullYear()}`
}

const MS_DIA = 24 * 60 * 60 * 1000

/**
 * Formata o período da viagem a partir de duas datas ISO (YYYY-MM-DD).
 * - Ambas válidas: "12/07/2026 a 18/07/2026 (7 dias)". Se as datas vierem
 *   invertidas, são reordenadas. Mesmo dia => "(1 dia)".
 * - Apenas uma válida: mostra "A partir de" / "Até".
 * - Nenhuma: string vazia.
 */
export function formatarPeriodo(inicio, fim) {
  let ini = parseData(inicio)
  let f = parseData(fim)

  if (ini && f) {
    if (f < ini) [ini, f] = [f, ini]
    const dias = Math.round((f - ini) / MS_DIA) + 1
    const sufixo = dias === 1 ? '1 dia' : `${dias} dias`
    return `${formatarBR(ini)} a ${formatarBR(f)} (${sufixo})`
  }
  if (ini) return `A partir de ${formatarBR(ini)}`
  if (f) return `Até ${formatarBR(f)}`
  return ''
}

/**
 * Monta a mensagem de WhatsApp concatenando destino e período.
 * Ignora seções vazias. Retorna texto puro (sem encode). Os passeios ficam
 * por conta da consultora, então não entram na mensagem.
 *
 * @param {{ local?: string, dataInicio?: string, dataFim?: string }} dados
 * @returns {string}
 */
export function buildMensagemViagem({ local, dataInicio, dataFim } = {}) {
  const destino = typeof local === 'string' ? local.trim() : ''
  const periodo = formatarPeriodo(dataInicio, dataFim)

  const linhas = ['Olá! Montei uma viagem no site da Viajas Comigo e gostaria de um orçamento:', '']

  if (destino) linhas.push(`📍 Destino: ${destino}`)
  if (periodo) linhas.push(`🗓️ Período: ${periodo}`)

  linhas.push('')
  linhas.push('Podemos conversar sobre os valores?')

  return linhas.join('\n')
}
