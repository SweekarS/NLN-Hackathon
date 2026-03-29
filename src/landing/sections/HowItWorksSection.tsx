import { useEffect, useMemo, useRef, useState } from 'react'
import { RevealOnView, usePrefersReducedMotion } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'

const HOW_START = 0.07
const HOW_END = 0.93

const HOW_STEPS = [
  {
    title: 'Onboarding quiz',
    body: 'Users share how they prefer to start the day, connect with others, and recharge.',
  },
  {
    title: 'Personalized conditioning plan',
    body: 'Gemini produces tailored tasks with practical interaction modes such as timer, photo, and completion check.',
  },
  {
    title: 'Daily rhythm and reflection',
    body: 'Users complete conditioning, build streak consistency, and review supportive insights over time.',
  },
] as const

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeRange(value: number, start: number, end: number) {
  if (end <= start) return 0
  return clamp((value - start) / (end - start), 0, 1)
}

export function HowItWorksSection() {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return (
      <section id="how-it-works" className="landing-section surface-b landing-section-rich">
        <div className="landing-container">
          <RevealOnView>
            <SectionHeading kicker="How it works" title="Simple flow, low friction." />
          </RevealOnView>
          <div className="steps-grid">
            {HOW_STEPS.map((step, index) => (
              <article key={step.title} className="step-card section-glow">
                <p className="step-index">{String(index + 1).padStart(2, '0')}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return <HowItWorksScrolly />
}

function HowItWorksScrolly() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [progress, setProgress] = useState(0)

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

  const activeIndex = useMemo(() => {
    const t = normalizeRange(progress, HOW_START, HOW_END)
    return Math.min(HOW_STEPS.length - 1, Math.floor(t * HOW_STEPS.length - 1e-9))
  }, [progress])

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="landing-section how-section"
      aria-label="How it works"
    >
      <div className="how-sticky">
        <div className="landing-container how-layout">
          <div className="how-rail">
            <RevealOnView>
              <SectionHeading kicker="How it works" title="Simple flow, low friction." />
            </RevealOnView>
            <ol className="how-rail-steps">
              {HOW_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className={`how-rail-step${activeIndex === index ? ' how-rail-step-active' : ''}`}
                >
                  <span className="how-rail-step-dot" aria-hidden />
                  <div className="how-rail-step-copy">
                    <p className="step-index">{String(index + 1).padStart(2, '0')}</p>
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="how-stage" aria-live="polite">
            {HOW_STEPS.map((step, index) => (
              <article
                key={step.title}
                className={`how-panel${activeIndex === index ? ' how-panel-active' : ''}`}
                aria-hidden={activeIndex !== index}
              >
                <p className="step-index">{String(index + 1).padStart(2, '0')}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="how-scroll-tail" aria-hidden />
    </section>
  )
}
