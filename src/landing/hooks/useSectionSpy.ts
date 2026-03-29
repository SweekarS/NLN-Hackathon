import { useEffect, useState } from 'react'

const SPY_ROOT_MARGIN = '-42% 0px -42% 0px'

export function useSectionSpy(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const ratios = new Map<string, number>()

    const pickActive = () => {
      let bestId: string | null = null
      let bestRatio = 0
      for (const [id, ratio] of ratios) {
        if (ratio > bestRatio) {
          bestRatio = ratio
          bestId = id
        }
      }
      setActiveId(bestRatio > 0 ? bestId : null)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id
          if (!id) continue
          if (entry.isIntersecting) {
            ratios.set(id, entry.intersectionRatio)
          } else {
            ratios.set(id, 0)
          }
        }
        pickActive()
      },
      {
        root: null,
        rootMargin: SPY_ROOT_MARGIN,
        threshold: [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.35, 0.5, 0.65, 0.8, 0.95, 1],
      },
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return activeId
}
