import { useState, useEffect, useCallback } from 'react'
import { SEED_VIAGENS } from '../data/viagens.js'
import { slug } from '../utils/slug.js'

const CACHE_KEY = 'viajascomigo_destinos'

// Cache local: serve só para o site renderizar instantaneamente enquanto a API
// responde. A fonte da verdade é sempre o backend (/api/viagens).
function loadCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (Array.isArray(saved) && saved.length) return saved
  } catch (_) {}
  return SEED_VIAGENS.map(v => ({ ...v }))
}

function saveCache(viagens) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(viagens)) } catch (_) {}
}

export function useViagens() {
  const [viagens, setViagensState] = useState(loadCache)
  const [loading, setLoading] = useState(true)

  // Carrega do servidor ao montar.
  useEffect(() => {
    let ativo = true
    fetch('/api/viagens')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Falha ao carregar')))
      .then(data => {
        if (!ativo || !Array.isArray(data)) return
        setViagensState(data)
        saveCache(data)
      })
      .catch(() => { /* mantém o cache local em caso de falha */ })
      .finally(() => { if (ativo) setLoading(false) })
    return () => { ativo = false }
  }, [])

  // Grava o array inteiro no backend (requer sessão de admin) e atualiza o estado.
  const persist = useCallback(async (next) => {
    const res = await fetch('/api/viagens', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    })
    if (!res.ok) {
      const msg = res.status === 401 ? 'Sessão expirada. Faça login de novo.' : 'Não foi possível salvar.'
      throw new Error(msg)
    }
    const saved = await res.json()
    setViagensState(saved)
    saveCache(saved)
  }, [])

  const addViagem = useCallback((data) => persist([{ ...data }, ...viagens]), [persist, viagens])

  const updateViagem = useCallback((targetSlug, data) =>
    persist(viagens.map(v => slug(v.titulo) === targetSlug ? { ...data } : v)), [persist, viagens])

  const deleteViagem = useCallback((targetSlug) =>
    persist(viagens.filter(v => slug(v.titulo) !== targetSlug)), [persist, viagens])

  const restaurar = useCallback(() => persist(SEED_VIAGENS.map(v => ({ ...v }))), [persist])

  return { viagens, loading, addViagem, updateViagem, deleteViagem, restaurar }
}
