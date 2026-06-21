import { signSession, sessionCookie } from './_lib/auth.js'
import { clientOpcional, getPasswordHash } from './_lib/store.js'
import { senhaConfere } from './_lib/senha.js'

// Limite de tentativas de senha por IP, para frear ataques de força bruta.
const MAX_TENTATIVAS = 8          // tentativas erradas permitidas...
const JANELA_SEGUNDOS = 15 * 60   // ...dentro desta janela (15 min).

// Descobre o IP de quem chamou. Na Vercel, o header confiável é
// 'x-forwarded-for' (o primeiro IP da lista é o cliente real).
function ipDoCliente(headers = {}) {
  const h = name => headers[name] || headers[name.toLowerCase()]
  return (
    (h('x-forwarded-for') || '').split(',')[0].trim() ||
    h('x-real-ip') ||
    'desconhecido'
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'Método não permitido' })
  }
  // A senha vigente pode vir do banco (trocada pelo painel) ou da ADMIN_PASSWORD do
  // ambiente (semente inicial). Só é erro de configuração se nenhuma das duas existir.
  const temSenhaSalva = !!(await getPasswordHash())
  if (!temSenhaSalva && !process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ erro: 'Nenhuma senha configurada no servidor (defina ADMIN_PASSWORD).' })
  }

  // Rate limiting: se o IP já estourou o limite, bloqueia antes de checar a senha.
  // Falha aberto — se o Redis não estiver disponível, o login segue funcionando.
  const redis = clientOpcional()
  const chave = `login_attempts:${ipDoCliente(req.headers)}`
  if (redis) {
    try {
      const tentativas = Number(await redis.get(chave)) || 0
      if (tentativas >= MAX_TENTATIVAS) {
        return res.status(429).json({ erro: 'Muitas tentativas. Tente de novo em alguns minutos.' })
      }
    } catch { /* falha aberto */ }
  }

  // O body já vem parseado pela Vercel quando é JSON; aceita string por garantia.
  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const senha = (body && body.senha) || ''

  if (!(await senhaConfere(senha))) {
    // Conta a tentativa errada e (re)arma a expiração da janela.
    if (redis) {
      try {
        const total = await redis.incr(chave)
        if (total === 1) await redis.expire(chave, JANELA_SEGUNDOS)
      } catch { /* falha aberto */ }
    }
    return res.status(401).json({ erro: 'Senha incorreta' })
  }

  // Sucesso: zera o contador desse IP.
  if (redis) {
    try { await redis.del(chave) } catch { /* ignora */ }
  }
  res.setHeader('Set-Cookie', sessionCookie(signSession()))
  return res.status(200).json({ ok: true })
}
