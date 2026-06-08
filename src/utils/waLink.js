const WHATSAPP = '5599999999999'
const MSG_PADRAO = 'Olá! Vim pelo site da Viajas Comigo e quero saber das próximas viagens.'

export function waLink(extra) {
  const msg = encodeURIComponent(extra || MSG_PADRAO)
  return `https://wa.me/${WHATSAPP}?text=${msg}`
}
