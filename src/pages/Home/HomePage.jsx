import { useState } from 'react'
import Header from '../../components/Header/Header.jsx'
import Footer from '../../components/Footer/Footer.jsx'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton.jsx'
import HeroSection from './HeroSection.jsx'
import TripsGrid from './TripsGrid.jsx'
import WhyStrip from './WhyStrip.jsx'
import CTASection from './CTASection.jsx'
import s from './HomePage.module.css'

const STORE_KEY = 'vc_variant'

function VariantToggle({ variant, onChange }) {
  return (
    <div className={s.toggle}>
      <span className={s.toggleLabel}>VISUAL</span>
      <button
        className={`${s.togglePill}${variant === 'A' ? ' ' + s.togglePillOn : ''}`}
        onClick={() => onChange('A')}
      >A · Elegante</button>
      <button
        className={`${s.togglePill}${variant === 'B' ? ' ' + s.togglePillOn : ''}`}
        onClick={() => onChange('B')}
      >B · Vibrante</button>
    </div>
  )
}

export default function HomePage({ viagens }) {
  const [variant, setVariant] = useState(() => {
    try { return localStorage.getItem(STORE_KEY) || 'A' } catch { return 'A' }
  })

  function change(v) {
    setVariant(v)
    try { localStorage.setItem(STORE_KEY, v) } catch (_) {}
  }

  const featured = viagens[0] || null

  return (
    <>
      <Header overlay={variant === 'B'} />
      <main className="pageFade">
        <HeroSection variant={variant} featured={featured} />
        <TripsGrid viagens={viagens} variant={variant} featured={featured} />
        <WhyStrip />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
      <VariantToggle variant={variant} onChange={change} />
    </>
  )
}
