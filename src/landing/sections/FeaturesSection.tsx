import { FeatureCard } from '../components/FeatureCard'
import { RevealOnView } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'
import { featureCards } from '../content'

export function FeaturesSection() {
  return (
    <section className="landing-section surface-a landing-section-rich">
      <div className="landing-container">
        <RevealOnView>
          <SectionHeading
            kicker="Features"
            title="Everything needed for a calm daily rhythm."
          />
        </RevealOnView>
        <RevealOnView className="feature-grid-bento feature-card-stagger">
          {featureCards.map((feature, index) => (
            <FeatureCard key={feature.title} featured={index === 0} {...feature} />
          ))}
        </RevealOnView>
      </div>
    </section>
  )
}
