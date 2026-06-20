import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import MontarViagemForm from './MontarViagemForm.jsx'
import s from './MontarViagemPage.module.css'

export default function MontarViagemPage() {
  return (
    <>
      <Header />
      <main className={`pageFade ${s.page}`}>
        <MontarViagemForm id="mv" headingTag="h1" />
      </main>
      <Footer />
    </>
  )
}
