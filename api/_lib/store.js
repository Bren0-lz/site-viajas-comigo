import { Redis } from '@upstash/redis'
import { SEED_VIAGENS } from '../../src/data/viagens.js'

const KEY = 'viagens'

// A integração da Upstash/Vercel injeta KV_REST_API_* ou UPSTASH_REDIS_REST_*.
// Aceitamos os dois nomes para não depender de qual integração foi usada.
function client() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('Armazenamento não configurado (faltam as variáveis KV/Upstash).')
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
