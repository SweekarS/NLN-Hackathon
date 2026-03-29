import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { navItems } from './content'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useSectionSpy } from './hooks/useSectionSpy'

const THEME_STORAGE_KEY = 'phool-theme'

function syncThemeColor(isDark: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', isDark ? '#0f1a15' : '#096444')
}

export default function LandingPage() {
  const [navOverHero, setNavOverHero] = useState(true)
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light',
  )

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [])
  const activeSectionId = useSectionSpy(sectionIds)
  const scrollProgress = useScrollProgress()

  const toggleColorMode = useCallback(() => {
    setColorMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      if (next === 'dark') {
        document.documentElement.dataset.theme = 'dark'
        localStorage.setItem(THEME_STORAGE_KEY, 'dark')
      } else {
        document.documentElement.removeAttribute('data-theme')
        localStorage.removeItem(THEME_STORAGE_KEY)
      }
      syncThemeColor(next === 'dark')
      return next
    })
  }, [])

  useEffect(() => {
    syncThemeColor(colorMode === 'dark')
  }, [colorMode])

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
      <a className="landing-skip-link" href="#main-content">
        Skip to main content
      </a>
      <div
        className="landing-scroll-progress"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden
      />
      <LandingNav
        overHero={navOverHero}
        activeSectionId={activeSectionId}
        colorMode={colorMode}
        onToggleColorMode={toggleColorMode}
      />
      <HeroSection />
      <main id="main-content">
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
