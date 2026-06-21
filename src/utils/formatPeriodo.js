// Formata um período (datas ISO "YYYY-MM-DD") como texto legível em português,
// usado no campo "Datas" das viagens. Ex.: "12 a 18 de julho de 2026".
// O resultado é guardado em `viagem.data` (string), que é o que as páginas
// públicas exibem — assim a seleção por calendário não muda a forma de exibir.

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// Quebra "YYYY-MM-DD" em partes numéricas sem passar por Date (evita o
// deslocamento de fuso que o construtor faz ao interpretar como UTC).
function partes(iso) {
  const [ano, mes, dia] = (iso || '').split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return { ano, mes: mes - 1, dia }
}

export function formatPeriodo(inicio, fim) {
  const a = partes(inicio)
  const b = partes(fim)

  if (!a && !b) return ''
  // Só uma das pontas preenchida.
  if (a && !b) return `${a.dia} de ${MESES[a.mes]} de ${a.ano}`
  if (!a && b) return `${b.dia} de ${MESES[b.mes]} de ${b.ano}`

  // Mesmo mês e ano: "12 a 18 de julho de 2026".
  if (a.ano === b.ano && a.mes === b.mes) {
    return `${a.dia} a ${b.dia} de ${MESES[a.mes]} de ${a.ano}`
  }
  // Mesmo ano, meses diferentes: "28 de junho a 3 de julho de 2026".
  if (a.ano === b.ano) {
    return `${a.dia} de ${MESES[a.mes]} a ${b.dia} de ${MESES[b.mes]} de ${a.ano}`
  }
  // Anos diferentes: "28 de dezembro de 2026 a 3 de janeiro de 2027".
  return `${a.dia} de ${MESES[a.mes]} de ${a.ano} a ${b.dia} de ${MESES[b.mes]} de ${b.ano}`
}
