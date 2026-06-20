import crypto from 'node:crypto'
import { isAuthed } from './_lib/auth.js'

// Pasta no Cloudinary onde as fotos das viagens ficam guardadas.
const FOLDER = 'viajas-comigo'
// Transformação aplicada no momento do upload (no arquivo "master" guardado):
// apenas limita a largura a 1920px, sem cortar — controla o tamanho do original
// sem travar qualidade nem formato. A otimização de qualidade e formato (WebP/AVIF)
// é feita na ENTREGA, por navegador, montando a URL no front (ver uploadImagem.js).
const TRANSFORMATION = 'c_limit,w_1920'

// Assina os parâmetros do upload do jeito que o Cloudinary espera:
// ordena alfabeticamente como "chave=valor&chave=valor", concatena o api_secret
// e tira o SHA-1. Assim não precisamos do SDK do Cloudinary como dependência.
function assinar(params, apiSecret) {
  const base = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(base + apiSecret).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'Método não permitido' })
  }
  // Só admin logado pode pedir uma assinatura de upload.
  if (!isAuthed(req.headers.cookie)) {
    return res.status(401).json({ erro: 'Não autorizado' })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ erro: 'Upload de imagens não configurado (faltam as variáveis do Cloudinary).' })
  }

  const timestamp = Math.floor(Date.now() / 1000)
  // Apenas os parâmetros assinados entram no cálculo da assinatura.
  const signature = assinar(
    { folder: FOLDER, timestamp, transformation: TRANSFORMATION },
    apiSecret,
  )

  return res.status(200).json({
    cloudName,
    apiKey,
    timestamp,
    folder: FOLDER,
    transformation: TRANSFORMATION,
    signature,
  })
}
