// Deriva o "status" visual de uma viagem a partir do modelo atual (campo `esgotado`).
// O protótipo previa 3 status, mas o backend só guarda esgotado/aberta — então
// mapeamos para esses dois, mantendo o visual de "dot + label" do design.
export function statusMeta(viagem) {
  if (viagem?.esgotado) {
    return { key: 'esgotada', label: 'Esgotada', color: '#C2362B', bg: 'rgba(239,68,68,.14)', dot: '#EF4444' }
  }
  return { key: 'aberta', label: 'Vagas abertas', color: '#0B7A3B', bg: 'rgba(37,211,102,.16)', dot: '#1FB257' }
}

// Texto de vagas: usa o campo livre `vagas` quando houver; senão, um rótulo coerente.
export function vagasLabel(viagem) {
  if (viagem?.esgotado) return 'Lotada'
  return viagem?.vagas || 'Vagas abertas'
}
