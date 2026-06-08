import { safeEqual, signSession, sessionCookie } from '../lib/auth.js'

const json = (statusCode, body, headers = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
})

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { erro: 'Método não permitido' })
  }
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return json(500, { erro: 'ADMIN_PASSWORD não configurada no servidor.' })
  }
  let senha = ''
  try { senha = (JSON.parse(event.body || '{}').senha) || '' } catch {}
  if (!safeEqual(senha, expected)) {
    return json(401, { erro: 'Senha incorreta' })
  }
  return json(200, { ok: true }, { 'Set-Cookie': sessionCookie(signSession()) })
}
