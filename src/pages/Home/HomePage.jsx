import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import HeroSection from './HeroSection.jsx'
import HowItWorks from './HowItWorks.jsx'
import TripsGrid from './TripsGrid.jsx'
import WhyGroup from './WhyGroup.jsx'
// import Testimonials from './Testimonials.jsx'
import CTASection from './CTASection.jsx'

export default function HomePage({ viagens }) {
  return (
    <>
      <Header />
      <main className="pageFade">
        <HeroSection />
        <HowItWorks />
        <TripsGrid viagens={viagens} />
        <WhyGroup />
        {/* <Testimonials /> */}
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
