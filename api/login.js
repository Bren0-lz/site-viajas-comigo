import { safeEqual, signSession, sessionCookie } from './_lib/auth.js'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return res.status(500).json({ erro: 'ADMIN_PASSWORD não configurada no servidor.' })
  }
  const senha = (req.body && req.body.senha) || ''
  if (!safeEqual(senha, expected)) {
    return res.status(401).json({ erro: 'Senha incorreta' })
  }
  res.setHeader('Set-Cookie', sessionCookie(signSession()))
  return res.status(200).json({ ok: true })
}
