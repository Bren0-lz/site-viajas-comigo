import { useState } from 'react'
import { SEED_VIAGENS } from '../data/viagens.js'
import { slug } from '../utils/slug.js'

const KEY = 'viajascomigo_destinos'

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (Array.isArray(saved) && saved.length) return saved
  } catch (_) {}
  return SEED_VIAGENS.map(v => ({ ...v }))
}

export function useViagens() {
  const [viagens, setViagens] = useState(load)

  function persist(next) {
    setViagens(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  function addViagem(data) {
    persist([{ ...data }, ...viagens])
  }

  function updateViagem(targetSlug, data) {
    persist(viagens.map(v => slug(v.titulo) === targetSlug ? { ...data } : v))
  }

  function deleteViagem(targetSlug) {
    persist(viagens.filter(v => slug(v.titulo) !== targetSlug))
  }

  function restaurar() {
    persist(SEED_VIAGENS.map(v => ({ ...v })))
  }

  return { viagens, addViagem, updateViagem, deleteViagem, restaurar }
}
