import { APP_URL, WAITLIST_URL, getYoutubeHeroEmbedUrl } from '../content'
import { LandingNav } from '../components/LandingNav'
import { LandingButton } from '../components/LandingButton'

export function HeroSection() {
  return (
    <div className="landing-hero-video-shell" id="top">
      <div className="landing-hero-video-bg" aria-hidden="true">
        {/* Cover-style 16:9 embed: scale iframe so it fills the viewport without letterboxing */}
        <div className="landing-hero-video-frame">
          <iframe
            src={getYoutubeHeroEmbedUrl()}
            title="StreakSync hero video"
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>

      <LandingNav />

      <section className="landing-hero-overlay" aria-label="Introduction">
        <div className="landing-container landing-hero-overlay-inner">
          <h1 className="landing-hero-title">Build calm daily rituals before stress becomes a crisis.</h1>
          <p className="landing-hero-lede">
            StreakSync helps people in stigma-heavy communities start with small, practical steps. No
            judgment, no pressure, and no clinical overwhelm on day one.
          </p>
          <div className="hero-actions landing-hero-actions">
            <LandingButton variant="primary" href={APP_URL}>
              Get early access
            </LandingButton>
            <LandingButton variant="secondary" href={WAITLIST_URL}>
              See the product
            </LandingButton>
          </div>
        </div>
      </section>
    </div>
  )
}
