import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return reduced
}

export function RevealOnView({
  children,
  className = '',
  style,
  delayMs,
  rootMargin = '0px 0px -10% 0px',
  threshold = 0.12,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
  delayMs?: number
  rootMargin?: string
  threshold?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { rootMargin, threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion, rootMargin, threshold])

  const cls = `${className} reveal-on-view${visible ? ' reveal-on-view-visible' : ''}`.trim()
  const mergedStyle: CSSProperties & { ['--reveal-delay']?: string } = {
    ...style,
    ...(delayMs != null ? { ['--reveal-delay']: `${delayMs}ms` } : {}),
  }

  return (
    <div ref={ref} className={cls} style={mergedStyle}>
      {children}
    </div>
  )
}
