import { lazy } from 'react'

const RELOAD_FLAG = 'viajas_chunk_reload'

/**
 * Igual ao React.lazy, mas resiliente a "stale chunks": quando um deploy novo
 * troca o hash dos arquivos, uma aba antiga pode pedir um chunk que virou 404 e
 * o React ficaria preso em tela branca.
 *
 * Estratégia: se o import() falhar, recarrega a página UMA vez (flag em
 * sessionStorage evita loop). O reload baixa o index.html novo com os hashes
 * corretos. Se mesmo após o reload o import falhar, propaga o erro para o
 * ErrorBoundary tratar com uma tela amigável.
 */
export function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn()
      .then(mod => {
        // Carregou com sucesso: limpa a flag para permitir um futuro reload.
        try { window.sessionStorage.removeItem(RELOAD_FLAG) } catch (_) {}
        return mod
      })
      .catch(err => {
        let alreadyReloaded = false
        try { alreadyReloaded = window.sessionStorage.getItem(RELOAD_FLAG) === '1' } catch (_) {}

        if (!alreadyReloaded) {
          try { window.sessionStorage.setItem(RELOAD_FLAG, '1') } catch (_) {}
          window.location.reload()
          // Retorna uma promise pendente: a página vai recarregar antes de resolver.
          return new Promise(() => {})
        }

        // Já tentamos recarregar e ainda falhou: deixa o ErrorBoundary assumir.
        throw err
      })
  )
}
