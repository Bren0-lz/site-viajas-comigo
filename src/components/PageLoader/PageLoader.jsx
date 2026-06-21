import Header from '../Header/Header.jsx'
import Footer from '../Footer/Footer.jsx'
import s from './PageLoader.module.css'

/**
 * Fallback do Suspense enquanto um chunk de página (lazy) é baixado.
 * Mostra cabeçalho, rodapé e um indicador de carregamento — assim, em rede
 * lenta, o usuário vê feedback em vez de uma tela branca.
 */
export default function PageLoader() {
  return (
    <>
      <Header />
      <div className={s.wrap}>
        <span className={s.spinner} aria-hidden="true" />
        <p>Carregando…</p>
      </div>
      <Footer />
    </>
  )
}
