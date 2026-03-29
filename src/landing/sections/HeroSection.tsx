import { useEffect, useRef, useState } from 'react'
import { APP_URL, getYoutubeHeroEmbedUrl, HERO_KICKER } from '../content'
import { LandingButton } from '../components/LandingButton'

export function HeroSection() {
  const shellRef = useRef<HTMLDivElement>(null)
  const [loadVideo, setLoadVideo] = useState(false)
  const [posterHide, setPosterHide] = useState(false)

  useEffect(() => {
    let cancelled = false

    const arm = () => {
      if (!cancelled) setLoadVideo(true)
    }

    const el = shellRef.current
    const io =
      el &&
      new IntersectionObserver(
        ([e]) => {
          if (e?.isIntersecting) arm()
        },
        { root: null, rootMargin: '80px', threshold: 0.05 },
      )

    if (el && io) {
      io.observe(el)
    }

    const t = window.setTimeout(arm, 2800)
    window.addEventListener('pointerdown', arm, { capture: true, once: true })

    let idleId: number | undefined
    if (typeof requestIdleCallback === 'function') {
      idleId = requestIdleCallback(arm, { timeout: 3200 })
    }

    return () => {
      cancelled = true
      if (io && el) io.unobserve(el)
      if (io) io.disconnect()
      window.clearTimeout(t)
      window.removeEventListener('pointerdown', arm, { capture: true })
      if (idleId !== undefined && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId)
      }
    }
  }, [])

  useEffect(() => {
    if (!loadVideo) return
    const t = window.setTimeout(() => setPosterHide(true), 900)
    return () => window.clearTimeout(t)
  }, [loadVideo])

  return (
    <div ref={shellRef} className="landing-hero-video-shell" id="top">
      <div className="landing-hero-video-bg" aria-hidden="true">
        <div
          className={`landing-hero-video-poster${posterHide ? ' landing-hero-video-poster--hide' : ''}`}
        />
        <div className="landing-hero-video-frame">
          {loadVideo ? (
            <iframe
              src={getYoutubeHeroEmbedUrl()}
              title="Phool hero video"
              allow="autoplay; encrypted-media"
            />
          ) : null}
        </div>
      </div>

      <section className="landing-hero-overlay" aria-label="Introduction">
        <div className="landing-container landing-hero-overlay-inner">
          <p className="landing-hero-eyebrow landing-hero-kicker">{HERO_KICKER}</p>
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
