// Formata o valor digitado no padrão brasileiro como moeda (estilo caixa: os dois
// últimos dígitos são sempre os centavos). Ex.: "4" → "0,04", "499" → "4,99",
// "499900" → "4.999,00".
export function formatPreco(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '')
  if (!digitos) return ''
  return (Number(digitos) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
