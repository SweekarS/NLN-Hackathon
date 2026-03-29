import type { ReactNode } from 'react'

type PhoneFrameProps = {
  logoDropProgress: number
  phoneBloomProgress: number
  reducedMotion: boolean
  children: ReactNode
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function PhoneFrame({
  logoDropProgress,
  phoneBloomProgress,
  reducedMotion,
  children,
}: PhoneFrameProps) {
  const dropY = -235 + logoDropProgress * 395
  const logoOpacity = reducedMotion ? 0 : clamp(1 - phoneBloomProgress * 1.5, 0, 1)
  const logoScale = reducedMotion
    ? 0.45
    : clamp(0.86 + logoDropProgress * 0.18 - phoneBloomProgress * 0.66, 0.3, 1)

  const phoneOpacity = reducedMotion ? 1 : clamp((phoneBloomProgress - 0.02) / 0.98, 0, 1)
  const phoneScale = reducedMotion ? 1 : 0.58 + phoneBloomProgress * 0.42
  const phoneY = reducedMotion ? 0 : 215 - phoneBloomProgress * 215

  return (
    <div className="showcase-phone-stage">
      <div className="showcase-ground-anchor" aria-hidden="true" />
      <img
        src="/branding/phool-logo.png"
        alt=""
        className="showcase-bloom-logo"
        style={{
          opacity: logoOpacity,
          transform: `translate(-50%, calc(-50% + ${dropY}px)) scale(${logoScale})`,
        }}
      />

      <div
        className="showcase-phone-shell"
        style={{
          opacity: phoneOpacity,
          transform: `translateY(${phoneY}px) scale(${phoneScale})`,
        }}
      >
        <img src="/landing/phone-mockup.png" alt="StreakSync app preview in phone frame" />
        <div className="showcase-phone-screen">{children}</div>
      </div>
    </div>
  )
}
