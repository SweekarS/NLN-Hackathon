import { useEffect, useState } from 'react'
import './landing.css'
import { LandingNav } from './components/LandingNav'
import { TransitionBand } from './components/TransitionBand'
import { WaveDivider } from './components/WaveDivider'
import { AppShowcaseSection } from './sections/AppShowcaseSection'
import { ClosingCTASection } from './sections/ClosingCTASection'
import { FAQSection } from './sections/FAQSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { HeroSection } from './sections/HeroSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { LandingFooter } from './sections/LandingFooter'
import { ProductSection } from './sections/ProductSection'
import { StorySection } from './sections/StorySection'
import { TrustSafetySection } from './sections/TrustSafetySection'

export default function LandingPage() {
  const [navOverHero, setNavOverHero] = useState(true)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNavOverHero(entry.isIntersecting)
      },
      { root: null, rootMargin: '-64px 0px 0px 0px', threshold: 0 },
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="landing-page">
      <LandingNav overHero={navOverHero} />
      <HeroSection />
      <main>
        <AppShowcaseSection />
        <WaveDivider />
        <StorySection />
        <ProductSection />
        <WaveDivider flipped />
        <TransitionBand />
        <FeaturesSection />
        <HowItWorksSection />
        <TrustSafetySection />
        <WaveDivider compact />
        <FAQSection />
        <ClosingCTASection />
      </main>
      <LandingFooter />
    </div>
  )
}
