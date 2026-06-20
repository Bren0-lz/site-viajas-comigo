import { useEffect, useRef, useState } from 'react'

const MIN_CHARS = 3
const DEBOUNCE_MS = 400

// Cache em memória compartilhado entre montagens, por par cidade+termo.
const cache = new Map()

/**
 * Busca pontos turísticos por nome em /api/passeios, usando a cidade como
 * contexto. Debounce de 400ms, AbortController e cache em memória.
 *
 * @param {string} texto  texto digitado no campo de passeio
 * @param {string} local  cidade escolhida (contexto)
 * @returns {{ resultados: { nome: string, imagem: string | null }[], carregando: boolean }}
 */
export function usePasseioBusca(texto, local) {
  const [resultados, setResultados] = useState([])
  const [carregando, setCarregando] = useState(false)
  const abortRef = useRef(null)

  const termo = (texto || '').trim()
  const cidade = (local || '').trim()

  useEffect(() => {
    if (termo.length < MIN_CHARS) {
      setResultados([])
      setCarregando(false)
      return
    }

    const chave = `${cidade.toLowerCase()}|${termo.toLowerCase()}`
    if (cache.has(chave)) {
      setResultados(cache.get(chave))
      setCarregando(false)
      return
    }

    setCarregando(true)

    const timer = setTimeout(() => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      const url =
        `/api/passeios?q=${encodeURIComponent(termo)}` +
        (cidade ? `&local=${encodeURIComponent(cidade)}` : '')

      fetch(url, { signal: controller.signal })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
        .then(data => {
          const lista = Array.isArray(data?.passeios) ? data.passeios : []
          cache.set(chave, lista)
          setResultados(lista)
          setCarregando(false)
        })
        .catch(err => {
          if (err?.name === 'AbortError') return // substituída por outra busca
          setResultados([])
          setCarregando(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [termo, cidade])

  return { resultados, carregando }
}
