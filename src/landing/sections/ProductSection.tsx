import { SectionHeading } from '../components/SectionHeading'

export function ProductSection() {
  return (
    <section id="product" className="landing-section surface-b">
      <div className="landing-container prose">
        <SectionHeading
          kicker="The product"
          title="A level-up rhythm for everyday mental wellness."
        />
        <p>
          We translate emotional support into small Conditioning: breathing, movement, social connection,
          focus, and evening wind-down tasks. Progress feels like growth, not judgment.
        </p>
        <p>
          During onboarding, Google Gemini turns user preferences into a personalized Conditioning plan. If
          AI is unavailable, fallback tasks keep the flow reliable.
        </p>
      </div>
    </section>
  )
}
