import { WAITLIST_URL } from '../content'

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-inner">
        <p>StreakSync — The Organic Sanctuary</p>
        <nav aria-label="Footer links">
          <a href="#safety">Safety</a>
          <a href={WAITLIST_URL}>Privacy</a>
          <a href={WAITLIST_URL}>Contact</a>
        </nav>
      </div>
    </footer>
  )
}
