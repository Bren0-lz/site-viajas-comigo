import { useEffect, useRef, useState } from 'react'

const MIN_CHARS = 3
const DEBOUNCE_MS = 500

// Cache em memória compartilhado entre montagens do hook: evita refazer a mesma
// busca quando o usuário volta a digitar um termo já consultado na sessão.
const cache = new Map()

/**
 * Autocomplete de cidades em /api/cidades.
 * - Debounce de 500ms enquanto o usuário digita.
 * - AbortController cancela requisições obsoletas (evita "race" de respostas).
 * - Cache em memória por termo normalizado.
 *
 * @param {string} termoBruto
 * @returns {{ cidades: { nome: string, descricao: string }[], carregando: boolean }}
 */
export function useCidades(termoBruto) {
  const [cidades, setCidades] = useState([])
  const [carregando, setCarregando] = useState(false)
  const abortRef = useRef(null)

  const termo = (termoBruto || '').trim()

  useEffect(() => {
    if (termo.length < MIN_CHARS) {
      setCidades([])
      setCarregando(false)
      return
    }

    const chave = termo.toLowerCase()
    if (cache.has(chave)) {
      setCidades(cache.get(chave))
      setCarregando(false)
      return
    }

    setCarregando(true)

    const timer = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      fetch(`/api/cidades?q=${encodeURIComponent(termo)}`, { signal: controller.signal })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
        .then(data => {
          const lista = Array.isArray(data?.cidades) ? data.cidades : []
          cache.set(chave, lista)
          setCidades(lista)
          setCarregando(false)
        })
        .catch(err => {
          if (err?.name === 'AbortError') return // substituída por outra busca
          setCidades([])
          setCarregando(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [termo])

  return { cidades, carregando }
}
