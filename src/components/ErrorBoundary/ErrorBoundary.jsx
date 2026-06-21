import { Component } from 'react'
import s from './ErrorBoundary.module.css'

/**
 * Captura erros de renderização (inclui falha ao carregar chunks lazy que o
 * lazyWithRetry não conseguiu recuperar) e mostra uma tela amigável com a
 * opção de recarregar, em vez de deixar a aplicação em tela branca.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary capturou:', error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={s.wrap}>
          <h1>Algo deu errado</h1>
          <p>Não foi possível carregar esta página. Tente novamente.</p>
          <button
            type="button"
            className="btn btn-solid"
            onClick={() => window.location.reload()}
          >
            Recarregar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
