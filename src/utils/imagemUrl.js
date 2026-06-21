// Ajusta a URL de uma imagem para entregá-la no tamanho certo do contexto onde
// ela aparece (card, hero, galeria…), evitando baixar uma imagem grande para um
// espaço pequeno. O recorte/posicionamento visual continua a cargo do CSS
// (background-size: cover + background-position), por isso usamos "c_limit":
// apenas reduzimos a imagem mantendo a proporção, sem cortá-la.
//
// Lida com duas origens de URL:
//  - Cloudinary  → insere a transformação após "/upload/"
//  - Unsplash    → ajusta o parâmetro "w" da querystring
//  - Outras/vazias → retorna inalterada (degradação segura)

const ENTREGA = 'f_auto,q_auto'

// Identifica um bloco de transformação Cloudinary já presente no 1º segmento
// após "/upload/" (ex.: "f_auto,q_auto" ou "f_auto,q_auto,c_limit,w_600"),
// para substituí-lo em vez de empilhar transformações duplicadas.
const TRANSFORM_CLOUDINARY = /(^|,)(f_|q_|w_|h_|c_|g_|dpr_|e_)/

function aplicarTransformacaoCloudinary(url, params) {
  const marcador = '/upload/'
  const i = url.indexOf(marcador)
  if (i === -1) return url

  const corte = i + marcador.length
  const resto = url.slice(corte)
  const barra = resto.indexOf('/')
  const primeiroSeg = barra === -1 ? resto : resto.slice(0, barra)

  // Se o primeiro segmento já é uma transformação, troca-o; senão, insere antes.
  const semTransform = TRANSFORM_CLOUDINARY.test(primeiroSeg)
    ? resto.slice(barra + 1)
    : resto

  return `${url.slice(0, corte)}${params}/${semTransform}`
}

function comLarguraUnsplash(url, largura) {
  try {
    const u = new URL(url)
    u.searchParams.set('w', String(largura))
    return u.toString()
  } catch {
    return url
  }
}

// Retorna a URL otimizada. Sem `largura`, apenas garante o formato/qualidade
// automáticos (usado no momento do upload). Com `largura`, adiciona também o
// dimensionamento — aplicado na renderização, por contexto.
export function imagemUrl(url, largura) {
  if (!url) return url

  const isCloudinary = url.includes('res.cloudinary.com') || url.includes('/upload/')
  if (isCloudinary) {
    const params = largura ? `${ENTREGA},c_limit,w_${largura}` : ENTREGA
    return aplicarTransformacaoCloudinary(url, params)
  }

  if (largura && url.includes('images.unsplash.com')) {
    return comLarguraUnsplash(url, largura)
  }

  return url
}
