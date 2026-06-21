import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import HeroSection from './HeroSection.jsx'
import TripsGrid from './TripsGrid.jsx'
import WhyStrip from './WhyStrip.jsx'
import CTASection from './CTASection.jsx'
import MontarViagemForm from '../MontarViagem/MontarViagemForm.jsx'
import s from './HomePage.module.css'

export default function HomePage({ viagens }) {
  // Destaque = viagem marcada no admin (flag `destaque`). Se nenhuma estiver
  // marcada, cai para a primeira da lista (retrocompatível com dados antigos).
  const featured = viagens.find(v => v.destaque) || viagens[0] || null

  return (
    <>
      <Header overlay />
      <main className="pageFade">
        <HeroSection featured={featured} />
        <TripsGrid viagens={viagens} featured={featured} />
        <section className={s.montar} id="montar-viagem">
          <MontarViagemForm id="home-mv" />
        </section>
        <WhyStrip />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
