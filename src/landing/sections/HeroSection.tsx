import { APP_URL, getYoutubeHeroEmbedUrl } from '../content'
import { LandingButton } from '../components/LandingButton'

export function HeroSection() {
  return (
    <div className="landing-hero-video-shell" id="top">
      <div className="landing-hero-video-bg" aria-hidden="true">
        {/* Cover-style 16:9 embed: scale iframe so it fills the viewport without letterboxing */}
        <div className="landing-hero-video-frame">
          <iframe
            src={getYoutubeHeroEmbedUrl()}
            title="Phool hero video"
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>

      <section className="landing-hero-overlay" aria-label="Introduction">
        <div className="landing-container landing-hero-overlay-inner">
          <h1 className="landing-hero-title">Build calm daily Conditioning before stress becomes a crisis.</h1>
          <p className="landing-hero-lede">
            Phool helps people in stigma-heavy communities start with small, practical steps. No
            judgment, no pressure, and no clinical overwhelm on day one.
          </p>
          <div className="hero-actions landing-hero-actions">
            <LandingButton
              variant="primary"
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get early access
            </LandingButton>
          </div>
        </div>
      </section>
    </div>
  )
}
