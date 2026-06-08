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
