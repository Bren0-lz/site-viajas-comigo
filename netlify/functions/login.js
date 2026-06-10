import { safeEqual, signSession, sessionCookie } from '../lib/auth.js'
import { clientOpcional } from '../lib/store.js'

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
})

// Limite de tentativas de senha por IP, para frear ataques de força bruta.
const MAX_TENTATIVAS = 8          // tentativas erradas permitidas...
const JANELA_SEGUNDOS = 15 * 60   // ...dentro desta janela (15 min).

// Descobre o IP de quem chamou. Na Netlify, o header confiável é
// 'x-nf-client-connection-ip'; caímos para o x-forwarded-for se preciso.
function ipDoCliente(headers = {}) {
  const h = name => headers[name] || headers[name.toLowerCase()]
  return (
    h('x-nf-client-connection-ip') ||
    (h('x-forwarded-for') || '').split(',')[0].trim() ||
    'desconhecido'
  )
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { erro: 'Método não permitido' })
  }
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return json(500, { erro: 'ADMIN_PASSWORD não configurada no servidor.' })
  }

  // Rate limiting: se o IP já estourou o limite, bloqueia antes de checar a senha.
  // Falha aberto — se o Redis não estiver disponível, o login segue funcionando.
  const redis = clientOpcional()
  const chave = `login_attempts:${ipDoCliente(event.headers)}`
  if (redis) {
    try {
      const tentativas = Number(await redis.get(chave)) || 0
      if (tentativas >= MAX_TENTATIVAS) {
        return json(429, { erro: 'Muitas tentativas. Tente de novo em alguns minutos.' })
      }
    } catch { /* falha aberto */ }
  }

  let senha = ''
  try { senha = (JSON.parse(event.body || '{}').senha) || '' } catch {}

  if (!safeEqual(senha, expected)) {
    // Conta a tentativa errada e (re)arma a expiração da janela.
    if (redis) {
      try {
        const total = await redis.incr(chave)
        if (total === 1) await redis.expire(chave, JANELA_SEGUNDOS)
      } catch { /* falha aberto */ }
    }
    return json(401, { erro: 'Senha incorreta' })
  }

  // Sucesso: zera o contador desse IP.
  if (redis) {
    try { await redis.del(chave) } catch { /* ignora */ }
  }
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie(signSession()) })
}
