import { navItems, WAITLIST_URL } from '../content'
import { BrandMark } from './BrandMark'
import { LandingButton } from './LandingButton'

export function LandingNav() {
  return (
    <header className="landing-nav-wrap">
      <nav className="landing-nav">
        <div className="landing-container nav-inner">
          <a href="#top" className="brand-lockup" aria-label="StreakSync Home">
            <BrandMark />
            <div>
              <p className="brand-name">StreakSync</p>
              <p className="brand-tagline">The Organic Sanctuary</p>
            </div>
          </a>

          <div className="nav-links" aria-label="Landing sections">
            {navItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                {item.label}
              </a>
            ))}
          </div>

          <LandingButton variant="secondary" href={WAITLIST_URL}>
            Join waitlist
          </LandingButton>
        </div>
      </nav>
    </header>
  )
}
