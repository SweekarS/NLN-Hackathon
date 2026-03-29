import { SectionHeading } from '../components/SectionHeading'

export function TrustSafetySection() {
  return (
    <section id="safety" className="landing-section surface-a">
      <div className="landing-container trust-block">
        <SectionHeading
          kicker="Trust and safety"
          title="Supportive, private, and honest about limits."
        />
        <p>
          StreakSync is not a replacement for licensed professionals or emergency services. It helps
          people build stability early, while safety resources guide them toward human support when
          needed.
        </p>
        <p>
          The experience is private-first and designed to reduce shame, not amplify it.
        </p>
      </div>
    </section>
  )
}
