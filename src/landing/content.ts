/** Google Form: early signup / launch notifications */
export const WAITLIST_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdeR1hzN-qZZxbTXUA_YdkuIBbcmWrqv5D9sjVj7ZdFoP6zXA/viewform'
export const APP_URL = 'https://github.com/SweekarS/Phool'

/** Hero kicker line (shown above the headline). */
export const HERO_KICKER =
  'Private daily conditioning · Built for stigma-heavy communities · Safety-first'

/** Hero background video (YouTube). */
export const YOUTUBE_HERO_VIDEO_ID = '8bl1Gg4GFXA'

export function getYoutubeHeroEmbedUrl(): string {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    playsinline: '1',
    loop: '1',
    playlist: YOUTUBE_HERO_VIDEO_ID,
    controls: '0',
    disablekb: '1',
    fs: '0',
    iv_load_policy: '3',
    modestbranding: '1',
    rel: '0',
  })
  return `https://www.youtube-nocookie.com/embed/${YOUTUBE_HERO_VIDEO_ID}?${params}`
}

export const navItems = [
  { id: 'showcase', label: 'Showcase' },
  { id: 'story', label: 'Story' },
  { id: 'product', label: 'Product' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'safety', label: 'Safety' },
  { id: 'faq', label: 'FAQ' },
]

export const featureCards = [
  {
    icon: '🌱',
    title: 'AI-personalized onboarding Conditioning',
    description:
      'A short quiz helps Gemini generate a personalized daily Conditioning set that fits each person’s rhythm.',
  },
  {
    icon: '✅',
    title: 'Concrete daily tasks',
    description:
      'Conditioning include timers, photo check-ins, and simple completions so progress feels practical and clear.',
  },
  {
    icon: '📈',
    title: 'Streaks and gentle insights',
    description:
      'Consistency is tracked over time without punitive language, guilt loops, or all-or-nothing framing.',
  },
  {
    icon: '🛟',
    title: 'Built-in safety support',
    description:
      'The safety area links to real crisis pathways when immediate human support is needed.',
  },
]

export const faqItems = [
  {
    question: 'Is Phool a 24/7 AI therapist?',
    answer:
      'No. The current build uses Gemini during onboarding to generate personalized daily Conditioning. It does not replace clinicians or emergency care.',
  },
  {
    question: 'What happens if AI is unavailable?',
    answer:
      'The app falls back to sensible default Conditioning tasks so onboarding does not dead-end.',
  },
  {
    question: 'Who is this for?',
    answer:
      'People who want private, low-pressure daily support, especially in communities where mental health stigma makes asking for help harder.',
  },
  {
    question: 'Does this replace crisis lines or professionals?',
    answer:
      'No. Phool is a daily stability companion and includes safety guidance that points users to real support pathways.',
  },
]
