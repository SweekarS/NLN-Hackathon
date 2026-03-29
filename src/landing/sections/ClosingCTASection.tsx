import { LandingButton } from '../components/LandingButton'
import { RevealOnView } from '../components/RevealOnView'
import { WAITLIST_URL } from '../content'

export function ClosingCTASection() {
  return (
    <section className="landing-section closing-cta">
      <RevealOnView className="landing-container closing-shell">
        <h2>Start with one gentle step, then keep going.</h2>
        <p>
          Early support should feel approachable. Join Phool and build your own sustainable
          Conditioning path.
        </p>
        <div className="hero-actions">
          <LandingButton
            variant="secondary"
            href={WAITLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Stay updated
          </LandingButton>
        </div>
      </RevealOnView>
    </section>
  )
}
