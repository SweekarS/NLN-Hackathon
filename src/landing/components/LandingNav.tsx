import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { navItems, WAITLIST_URL } from '../content'
import { BrandMark } from './BrandMark'
import { LandingButton } from './LandingButton'

export type LandingNavProps = {
  overHero?: boolean
  activeSectionId?: string | null
  colorMode?: 'light' | 'dark'
  onToggleColorMode?: () => void
}

export function LandingNav({
  overHero = false,
  activeSectionId = null,
  colorMode = 'light',
  onToggleColorMode,
}: LandingNavProps) {
  const menuHeadingId = useId()
  const panelId = useId()
  /** Narrow-viewport section menu (marketing site only — not the native app). */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const openDrawer = useCallback(() => {
    setDrawerOpen(true)
  }, [])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 980) setDrawerOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!drawerOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const focusables = panel
      ? Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute('hidden') && el.offsetParent !== null)
      : []

    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    first?.focus({ preventScroll: true })

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setDrawerOpen(false)
        menuButtonRef.current?.focus()
        return
      }

      if (e.key !== 'Tab' || focusables.length === 0) return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  const onMenuButtonKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' && !drawerOpen) {
      e.preventDefault()
      openDrawer()
    }
  }

  const wrapClass = `landing-nav-wrap${overHero ? ' landing-nav-wrap--hero' : ''}`
  const themeLabel = colorMode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <header className={wrapClass}>
      {drawerOpen ? (
        <button
          type="button"
          className="landing-nav-drawer-backdrop"
          aria-label="Close menu"
          onClick={closeDrawer}
        />
      ) : null}

      <div className="landing-nav-stack">
        <nav className="landing-nav" aria-label="Primary">
          <div className="landing-container nav-inner">
            <a href="#top" className="brand-lockup" aria-label="Phool Home">
              <BrandMark />
              <div>
                <p className="brand-name">Phool</p>
                <p className="brand-tagline">The Organic Sanctuary</p>
              </div>
            </a>

            <div className="nav-links" aria-label="Landing sections">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={activeSectionId === item.id ? 'nav-link-active' : undefined}
                  aria-current={activeSectionId === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="nav-toolbar">
              {onToggleColorMode ? (
                <button
                  type="button"
                  className="landing-theme-toggle"
                  onClick={onToggleColorMode}
                  aria-label={themeLabel}
                  title={themeLabel}
                >
                  <span className="landing-theme-toggle-track" aria-hidden />
                  <span
                    className={`landing-theme-toggle-thumb${colorMode === 'dark' ? ' landing-theme-toggle-thumb--dark' : ''}`}
                    aria-hidden
                  />
                </button>
              ) : null}

              <button
                ref={menuButtonRef}
                type="button"
                className="landing-nav-menu-btn"
                aria-expanded={drawerOpen}
                aria-controls={panelId}
                id={`${panelId}-trigger`}
                aria-label={drawerOpen ? 'Close section menu' : 'Open section menu'}
                onClick={() => (drawerOpen ? closeDrawer() : openDrawer())}
                onKeyDown={onMenuButtonKeyDown}
              >
                <span className="landing-nav-menu-icon" aria-hidden />
                <span className="landing-nav-menu-label">Menu</span>
              </button>

              <LandingButton
                variant="secondary"
                href={WAITLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="landing-nav-waitlist"
              >
                Join waitlist
              </LandingButton>
            </div>
          </div>
        </nav>

        <div
          ref={panelRef}
          id={panelId}
          className={`landing-nav-drawer${drawerOpen ? ' landing-nav-drawer--open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={menuHeadingId}
          hidden={!drawerOpen}
        >
          <p id={menuHeadingId} className="landing-nav-drawer-heading">
            On this page
          </p>
          <div className="landing-nav-drawer-links">
            {navItems.map((item) => (
              <a
                key={item.id}
                className={`landing-nav-drawer-link${activeSectionId === item.id ? ' landing-nav-drawer-link--active' : ''}`}
                href={`#${item.id}`}
                onClick={closeDrawer}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
