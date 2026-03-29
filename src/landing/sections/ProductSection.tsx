import { RevealOnView } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'

export function ProductSection() {
  return (
    <section id="product" className="landing-section surface-b landing-section-rich">
      <div className="landing-container editorial-split">
        <RevealOnView>
          <SectionHeading
            kicker="The product"
            title="A level-up rhythm for everyday mental wellness."
          />
        </RevealOnView>
        <RevealOnView className="prose-body" delayMs={90}>
          <p>
            We translate emotional support into small conditioning moments: breathing, movement, social
            connection, focus, and evening wind-down tasks. Progress feels like growth, not judgment.
          </p>
          <p>
            During onboarding, Google Gemini turns user preferences into a personalized conditioning plan. If
            AI is unavailable, fallback tasks keep the flow reliable.
          </p>
        </RevealOnView>
        <RevealOnView delayMs={140}>
          <aside className="landing-callout section-glow">
            <p className="landing-callout-eyebrow">The feeling</p>
            <blockquote>One gentle step at a time, not a scorecard.</blockquote>
            <p className="landing-callout-note">
              Conditioning are concrete and completable, so momentum shows up in real life, not just in the
              app.
            </p>
          </aside>
        </RevealOnView>
      </div>
    </section>
  )
}
