import { SectionHeading } from '../components/SectionHeading'

export function StorySection() {
  return (
    <section id="story" className="landing-section surface-a">
      <div className="landing-container editorial">
        <SectionHeading
          kicker="The story"
          title="In many places, silence is still the default."
        />
        <p>
          In culturally conservative communities, including Nepal, many people hide stress, anxiety,
          and emotional exhaustion because stigma can feel more dangerous than the struggle itself.
        </p>
        <p>
          That silence is where preventable crises grow. Phool is designed as a practical first
          step for people who need support but are not ready to seek formal care yet.
        </p>
      </div>
    </section>
  )
}
