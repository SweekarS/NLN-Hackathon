import { SectionHeading } from '../components/SectionHeading'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-section surface-b">
      <div className="landing-container">
        <SectionHeading kicker="How it works" title="Simple flow, low friction." />
        <div className="steps-grid">
          <article className="step-card">
            <p className="step-index">01</p>
            <h3>Onboarding quiz</h3>
            <p>
              Users share how they prefer to start the day, connect with others, and recharge.
            </p>
          </article>
          <article className="step-card">
            <p className="step-index">02</p>
            <h3>Personalized ritual plan</h3>
            <p>
              Gemini produces tailored tasks with practical interaction modes such as timer, photo,
              and completion check.
            </p>
          </article>
          <article className="step-card">
            <p className="step-index">03</p>
            <h3>Daily rhythm and reflection</h3>
            <p>
              Users complete rituals, build streak consistency, and review supportive insights over
              time.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
