import { FAQAccordion } from '../components/FAQAccordion'
import { SectionHeading } from '../components/SectionHeading'

export function FAQSection() {
  return (
    <section id="faq" className="landing-section surface-b">
      <div className="landing-container">
        <SectionHeading kicker="FAQ" title="Clear answers before you start." />
        <FAQAccordion />
      </div>
    </section>
  )
}
