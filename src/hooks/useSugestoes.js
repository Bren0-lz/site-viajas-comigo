import { useEffect, useRef, useState } from 'react'

const MIN_CHARS = 3
const DEBOUNCE_MS = 500

// Cache em memória compartilhado entre montagens do hook: evita refazer a mesma
// busca quando o usuário volta a digitar um destino já consultado na sessão.
const cache = new Map()

/**
 * Busca sugestões de passeios para um destino em /api/sugestoes.
 * - Debounce de 500ms enquanto o usuário digita.
 * - AbortController cancela requisições obsoletas (evita "race" de respostas).
 * - Cache em memória por termo normalizado.
 *
 * @param {string} local
 * @returns {{ sugestoes: { nome: string }[], carregando: boolean, erro: boolean }}
 */
export function useSugestoes(local) {
  const [sugestoes, setSugestoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)
  const abortRef = useRef(null)

  const termo = (local || '').trim()

  useEffect(() => {
    // Termo curto demais: limpa o estado e não consulta.
    if (termo.length < MIN_CHARS) {
      setSugestoes([])
      setCarregando(false)
      setErro(false)
      return
    }

    const chave = termo.toLowerCase()
    if (cache.has(chave)) {
      setSugestoes(cache.get(chave))
      setCarregando(false)
      setErro(false)
      return
    }

    setCarregando(true)
    setErro(false)

    const timer = setTimeout(() => {
      // Cancela qualquer busca anterior ainda em voo.
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      fetch(`/api/sugestoes?local=${encodeURIComponent(termo)}`, { signal: controller.signal })
        .then(r => (r.ok ? r.json() : Promise.reject(new Error('falha'))))
        .then(data => {
          const lista = Array.isArray(data?.passeios) ? data.passeios : []
          cache.set(chave, lista)
          setSugestoes(lista)
          setCarregando(false)
        })
        .catch(err => {
          if (err?.name === 'AbortError') return // substituída por outra busca
          setSugestoes([])
          setErro(true)
          setCarregando(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      abortRef.current?.abort()
    }
  }, [termo])

  return { sugestoes, carregando, erro }
}
