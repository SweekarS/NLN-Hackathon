import { FAQAccordion } from '../components/FAQAccordion'
import { RevealOnView } from '../components/RevealOnView'
import { SectionHeading } from '../components/SectionHeading'

export function FAQSection() {
  return (
    <section id="faq" className="landing-section surface-b landing-section-rich">
      <div className="landing-container">
        <RevealOnView>
          <SectionHeading kicker="FAQ" title="Clear answers before you start." />
        </RevealOnView>
        <RevealOnView className="reveal-stagger-children">
          <FAQAccordion />
        </RevealOnView>
      </div>
    </section>
  )
}
