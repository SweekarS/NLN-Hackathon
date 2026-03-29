import './landing.css'
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
  return (
    <div className="landing-page">
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
