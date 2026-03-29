import { RevealOnView } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'

export function StorySection() {
  return (
    <section id="story" className="landing-section surface-a landing-section-rich">
      <div className="landing-container editorial-split">
        <RevealOnView>
          <SectionHeading
            kicker="The story"
            title="In many places, silence is still the default."
          />
        </RevealOnView>
        <RevealOnView className="editorial-body" delayMs={90}>
          <p>
            In culturally conservative communities, including Nepal, many people hide stress, anxiety,
            and emotional exhaustion because stigma can feel more dangerous than the struggle itself.
          </p>
          <p>
            That silence is where preventable crises grow. Phool is designed as a practical first
            step for people who need support but are not ready to seek formal care yet.
          </p>
        </RevealOnView>
        <RevealOnView delayMs={140}>
          <aside className="landing-callout section-glow">
            <p className="landing-callout-eyebrow">Why it matters</p>
            <blockquote>Silence is not neutral—it is where small struggles become harder to reverse.</blockquote>
            <p className="landing-callout-note">
              Phool meets people where stigma makes speaking up feel risky, with privacy-first daily
              structure.
            </p>
          </aside>
        </RevealOnView>
      </div>
    </section>
  )
}
