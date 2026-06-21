import crypto from 'node:crypto'

const COOKIE_NAME = 'admin_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 dias, em segundos

function secret() {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET não definido')
  return s
}

// Compara duas strings em tempo constante (evita vazar a senha pelo tempo de resposta).
export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

// Gera um hash seguro da senha, com salt aleatório, no formato "<salt_hex>:<hash_hex>".
// Usa scrypt (lento por design) para resistir a ataques de força bruta caso o banco vaze.
export function hashPassword(senha) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(String(senha), salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

// Confere uma senha contra o hash armazenado (formato gerado por hashPassword).
// Comparação em tempo constante; retorna false se o formato for inválido.
export function verifyPassword(senha, armazenado) {
  if (typeof armazenado !== 'string' || !armazenado.includes(':')) return false
  const [saltHex, hashHex] = armazenado.split(':')
  let esperado
  try {
    esperado = Buffer.from(hashHex, 'hex')
  } catch {
    return false
  }
  if (esperado.length === 0) return false
  const atual = crypto.scryptSync(String(senha), Buffer.from(saltHex, 'hex'), esperado.length)
  return atual.length === esperado.length && crypto.timingSafeEqual(atual, esperado)
}

// Gera um token de sessão assinado: payload.assinatura
export function signSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString('base64url')
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function verifySession(token) {
  if (!token || !token.includes('.')) return false
  const [payload, sig] = token.split('.')
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && exp > Date.now()
  } catch {
    return false
  }
}

function readCookie(cookieHeader, name) {
  for (const part of (cookieHeader || '').split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

// Recebe o cabeçalho Cookie cru (req.headers.cookie) e diz se a sessão é válida.
export function isAuthed(cookieHeader) {
  return verifySession(readCookie(cookieHeader, COOKIE_NAME))
}

export function sessionCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
}
