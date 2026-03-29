export const showcaseSlides = [
  {
    eyebrow: 'Step 01',
    title: 'Personalized ritual setup',
    description:
      'Onboarding asks simple questions about energy, social comfort, and recharge patterns.',
    points: [
      'Gemini personalizes daily rituals from quiz answers.',
      'Fallback defaults keep onboarding resilient if AI is unavailable.',
    ],
  },
  {
    eyebrow: 'Step 02',
    title: 'Task flow that feels practical',
    description:
      'Each day is made of small, concrete actions users can finish even on hard days.',
    points: [
      'Supports timer-based, photo check-in, and simple completion tasks.',
      'Completion is designed to be low friction and private-first.',
    ],
  },
  {
    eyebrow: 'Step 03',
    title: 'Consistency and momentum',
    description:
      'Progress is framed as growth with visual streaks and supportive insight trends.',
    points: [
      'Tracks streak continuity and lightweight weekly reflection.',
      'Encourages users to restart gently instead of feeling punished.',
    ],
  },
  {
    eyebrow: 'Step 04',
    title: 'Safety comes first',
    description:
      'The app supports daily wellness and directs urgent moments to human support.',
    points: [
      'Safety screen provides crisis resource pathways.',
      'Positioned as support, never as a replacement for professional care.',
    ],
  },
]

export function ShowcaseSlides({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="showcase-screen-stack">
      {showcaseSlides.map((slide, index) => {
        const isActive = activeIndex === index
        return (
          <article
            key={slide.title}
            className={`showcase-screen-card${isActive ? ' showcase-screen-card-active' : ''}`}
            aria-hidden={!isActive}
          >
            <p className="showcase-screen-eyebrow">{slide.eyebrow}</p>
            <h3>{slide.title}</h3>
            <p className="showcase-screen-copy">{slide.description}</p>
            <ul>
              {slide.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        )
      })}
    </div>
  )
}
