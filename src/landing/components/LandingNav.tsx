import { navItems, WAITLIST_URL } from '../content'
import { BrandMark } from './BrandMark'
import { LandingButton } from './LandingButton'

export function LandingNav({ overHero = false }: { overHero?: boolean }) {
  return (
    <header className={`landing-nav-wrap${overHero ? ' landing-nav-wrap--hero' : ''}`}>
      <nav className="landing-nav">
        <div className="landing-container nav-inner">
          <a href="#top" className="brand-lockup" aria-label="Phool Home">
            <BrandMark />
            <div>
              <p className="brand-name">Phool</p>
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

          <LandingButton
            variant="secondary"
            href={WAITLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join waitlist
          </LandingButton>
        </div>
      </nav>
    </header>
  )
}
