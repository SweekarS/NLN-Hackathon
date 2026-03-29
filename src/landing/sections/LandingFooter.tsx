import { WAITLIST_URL } from '../content'

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-inner">
        <p>Phool: The Organic Sanctuary</p>
        <nav aria-label="Footer links">
          <a href="#safety">Safety</a>
          <a href="#faq">FAQ</a>
          <a href={WAITLIST_URL} target="_blank" rel="noopener noreferrer">
            Join waitlist
          </a>
        </nav>
      </div>
    </footer>
  )
}
