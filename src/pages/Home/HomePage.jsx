import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import HeroSection from './HeroSection.jsx'
import TripsGrid from './TripsGrid.jsx'
import WhyStrip from './WhyStrip.jsx'
import CTASection from './CTASection.jsx'

export default function HomePage({ viagens }) {
  const featured = viagens[0] || null

  return (
    <>
      <Header overlay />
      <main className="pageFade">
        <HeroSection featured={featured} />
        <TripsGrid viagens={viagens} featured={featured} />
        <WhyStrip />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
