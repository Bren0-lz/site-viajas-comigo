// Formata o valor digitado no padrão brasileiro (ponto como separador de milhar,
// reais inteiros). Ex.: "1980" → "1.980", "R$ 2.490" → "2.490".
export function formatPreco(texto) {
  const digitos = String(texto ?? '').replace(/\D/g, '')
  if (!digitos) return ''
  return Number(digitos).toLocaleString('pt-BR')
}
