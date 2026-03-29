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
          <a
            href="https://docs.google.com/presentation/d/1LOA0tCjZ9Q-jaPj9Rb7K2W1xXV30udysQHwfhvxHSUE/edit?slide=id.p2#slide=id.p2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Slideshow
          </a>
        </nav>
      </div>
    </footer>
  )
}
