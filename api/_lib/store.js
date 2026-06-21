import { Redis } from '@upstash/redis'
import { SEED_VIAGENS } from '../../src/data/viagens.js'

const KEY = 'viagens'

// Aceita tanto os nomes da Upstash (UPSTASH_REDIS_REST_*) quanto os antigos
// KV_REST_API_*, pra não depender de qual padrão você usou ao criar o banco.
function client() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    throw new Error('Armazenamento não configurado (faltam as variáveis do Upstash Redis).')
  }
  return new Redis({ url, token })
}

// Igual ao client(), mas retorna null em vez de lançar erro quando o Redis não
// está configurado. Usado pelo rate limiting do login, que deve "falhar aberto"
// (permitir o login) caso o armazenamento esteja indisponível, em vez de travar
// o acesso ao painel.
export function clientOpcional() {
  try {
    return client()
  } catch {
    return null
  }
}

export async function getViagens() {
  const redis = client()
  const data = await redis.get(KEY)
  if (Array.isArray(data)) return data
  // Primeira leitura: semeia com as viagens de exemplo para o site não nascer vazio.
  const seed = SEED_VIAGENS.map(v => ({ ...v }))
  await redis.set(KEY, seed)
  return seed
}

export async function setViagens(viagens) {
  if (!Array.isArray(viagens)) throw new Error('Formato inválido')
  await client().set(KEY, viagens)
  return viagens
}

// Hash da senha do admin (alterável pelo painel). Guardado separado das viagens.
const SENHA_KEY = 'admin_password'

// Lê o hash da senha. Usa o client opcional para "falhar aberto": se o Redis
// estiver indisponível, retorna null e o login cai para a ADMIN_PASSWORD do env.
export async function getPasswordHash() {
  const redis = clientOpcional()
  if (!redis) return null
  try {
    const hash = await redis.get(SENHA_KEY)
    return typeof hash === 'string' ? hash : null
  } catch {
    return null
  }
}

export async function setPasswordHash(hash) {
  if (typeof hash !== 'string' || !hash) throw new Error('Hash inválido')
  await client().set(SENHA_KEY, hash)
}
