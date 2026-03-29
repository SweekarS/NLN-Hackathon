import { useEffect, useMemo, useRef, useState } from 'react'
import { PhoneFrame } from '../components/PhoneFrame'
import { ShowcaseSlides, showcaseSlides } from '../components/ShowcaseSlides'

const LOGO_DROP_START = 0.12
const LOGO_DROP_END = 0.34
const PHONE_BLOOM_END = 0.52
const STORY_START = 0.56

/** Step 04 stays active for the final story segment so sticky scroll can finish on the last highlight. */
function storyProgressToSlideIndex(storyProgress: number, slideCount: number) {
  if (slideCount <= 1) return 0
  if (storyProgress < 0.2) return 0
  if (storyProgress < 0.38) return 1
  if (storyProgress < 0.58) return 2
  return slideCount - 1
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeRange(value: number, start: number, end: number) {
  if (end <= start) return 0
  return clamp((value - start) / (end - start), 0, 1)
}

export function AppShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mediaQuery.matches)
    apply()
    mediaQuery.addEventListener('change', apply)
    return () => mediaQuery.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const updateProgress = () => {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      const travel = rect.height + window.innerHeight
      const nextProgress = clamp((window.innerHeight - rect.top) / travel, 0, 1)
      setProgress(nextProgress)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  const logoDropProgress = reducedMotion ? 1 : normalizeRange(progress, LOGO_DROP_START, LOGO_DROP_END)
  const phoneBloomProgress = reducedMotion ? 1 : normalizeRange(progress, LOGO_DROP_END, PHONE_BLOOM_END)
  const runStarted = reducedMotion || progress >= STORY_START

  const activeSlideIndex = useMemo(() => {
    if (reducedMotion) return 0
    if (progress < STORY_START) return -1
    const storyProgress = normalizeRange(progress, STORY_START, 1)
    return storyProgressToSlideIndex(storyProgress, showcaseSlides.length)
  }, [progress, reducedMotion])

  return (
    <section
      id="showcase"
      className={`landing-section showcase-section${reducedMotion ? ' showcase-reduced-motion' : ''}`}
      ref={sectionRef}
    >
      <div className="showcase-sticky">
        <div className="landing-container showcase-layout">
          <PhoneFrame
            logoDropProgress={logoDropProgress}
            phoneBloomProgress={phoneBloomProgress}
            reducedMotion={reducedMotion}
          >
            <ShowcaseSlides activeIndex={activeSlideIndex} />
          </PhoneFrame>

          <div className="showcase-steps">
            <p className="eyebrow">Scroll the bloom</p>
            <h2>From one leaf to a full support system.</h2>
            <p className="section-subtitle">
              The logo lands, the phone blooms up, and then the app journey starts.
            </p>

            <ol>
              {showcaseSlides.map((slide, index) => (
                <li
                  key={slide.title}
                  className={`showcase-step${
                    runStarted && activeSlideIndex === index ? ' showcase-step-active' : ''
                  }`}
                >
                  <p className="showcase-step-eyebrow">{slide.eyebrow}</p>
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <div className="showcase-scroll-tail" aria-hidden />
    </section>
  )
}
