import { APP_URL, WAITLIST_URL } from '../content'
import { LandingButton } from '../components/LandingButton'

export function ClosingCTASection() {
  return (
    <section className="landing-section closing-cta">
      <div className="landing-container closing-shell">
        <h2>Start with one gentle step, then keep going.</h2>
        <p>
          Early support should feel approachable. Join Phool and build your own sustainable
          Conditioning path.
        </p>
        <div className="hero-actions">
          <LandingButton variant="primary" href={APP_URL}>
            Download when live
          </LandingButton>
          <LandingButton variant="secondary" href={WAITLIST_URL}>
            Stay updated
          </LandingButton>
        </div>
      </div>
    </section>
  )
}
