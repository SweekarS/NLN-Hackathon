import { FeatureCard } from '../components/FeatureCard'
import { SectionHeading } from '../components/SectionHeading'
import { featureCards } from '../content'

export function FeaturesSection() {
  return (
    <section className="landing-section surface-a">
      <div className="landing-container">
        <SectionHeading
          kicker="Features"
          title="Everything needed for a calm daily rhythm."
        />
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
