// Envia uma imagem do computador do admin direto para o Cloudinary.
// O fluxo é "upload assinado": pedimos uma assinatura ao nosso backend
// (/api/upload-sign, que valida a sessão de admin e guarda o segredo do
// Cloudinary) e então mandamos o arquivo direto para o Cloudinary — sem
// passar pela função serverless, o que evita o limite de tamanho dela.

const TAMANHO_MAX = 10 * 1024 * 1024 // 10 MB

// Transformação de ENTREGA: pedimos ao Cloudinary o melhor formato (WebP/AVIF
// conforme o navegador) e a melhor qualidade automática. Fica na URL servida —
// e o resultado é cacheado no CDN.
const ENTREGA = 'f_auto,q_auto'

// Insere a transformação de entrega logo após "/upload/" na URL do Cloudinary,
// para que toda renderização da imagem já saia otimizada e no formato moderno.
function comEntregaOtimizada(url) {
  const marcador = '/upload/'
  const i = url.indexOf(marcador)
  if (i === -1 || url.includes(`${marcador}${ENTREGA}/`)) return url
  const corte = i + marcador.length
  return `${url.slice(0, corte)}${ENTREGA}/${url.slice(corte)}`
}

export async function uploadImagem(file) {
  if (!file || !file.type?.startsWith('image/')) {
    throw new Error('Escolha um arquivo de imagem (JPG, PNG, etc.).')
  }
  if (file.size > TAMANHO_MAX) {
    throw new Error('Imagem muito grande. O limite é 10 MB.')
  }

  // 1) Pega a assinatura do nosso backend (precisa estar logado).
  const res = await fetch('/api/upload-sign', { method: 'POST' })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.erro || 'Não foi possível preparar o envio. Faça login de novo.')
  }
  const { cloudName, apiKey, timestamp, folder, transformation, signature } = await res.json()

  // 2) Envia o arquivo direto para o Cloudinary.
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', apiKey)
  form.append('timestamp', timestamp)
  form.append('folder', folder)
  form.append('transformation', transformation)
  form.append('signature', signature)

  const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!up.ok) {
    throw new Error('Falha ao enviar a imagem. Tente de novo.')
  }
  const data = await up.json()
  return comEntregaOtimizada(data.secure_url)
}
