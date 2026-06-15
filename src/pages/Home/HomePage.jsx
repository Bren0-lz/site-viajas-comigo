import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import HeroSection from './HeroSection.jsx'
import TripsGrid from './TripsGrid.jsx'
import WhyStrip from './WhyStrip.jsx'
import CTASection from './CTASection.jsx'

export default function HomePage({ viagens }) {
  return (
    <>
      <Header />
      <main className="pageFade">
        <HeroSection />
        <TripsGrid viagens={viagens} />
        <WhyStrip />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
