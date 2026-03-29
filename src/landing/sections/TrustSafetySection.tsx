import { RevealOnView } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'

export function TrustSafetySection() {
  return (
    <section id="safety" className="landing-section surface-a landing-section-rich">
      <div className="landing-container editorial-split">
        <RevealOnView>
          <SectionHeading
            kicker="Trust and safety"
            title="Supportive, private, and honest about limits."
          />
        </RevealOnView>
        <RevealOnView className="trust-body" delayMs={90}>
          <p>
            Phool is not a replacement for licensed professionals or emergency services. It helps
            people build stability early, while safety resources guide them toward human support when
            needed.
          </p>
          <p>The experience is private-first and designed to reduce shame, not amplify it.</p>
        </RevealOnView>
        <RevealOnView delayMs={140}>
          <aside className="landing-callout section-glow">
            <p className="landing-callout-eyebrow">Clear boundaries</p>
            <blockquote>Companion care today, clinical care when you need it.</blockquote>
            <p className="landing-callout-note">
              Crisis pathways and honest limits are part of the product, not an afterthought.
            </p>
          </aside>
        </RevealOnView>
      </div>
    </section>
  )
}
