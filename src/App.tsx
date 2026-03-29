import { NavLink, Navigate, Route, Routes } from 'react-router-dom'

type StitchScreen = {
  id: string
  route: string
  stitchFolder: string
  title: string
  subtitle: string
  highlights: string[]
  components: string[]
  ctas: string[]
}

const stitchScreens: StitchScreen[] = [
  {
    id: 'welcome_onboarding',
    route: '/welcome-onboarding',
    stitchFolder: 'welcome_onboarding',
    title: 'Welcome & Onboarding',
    subtitle: 'Private-first introduction with no-pressure entry modes.',
    highlights: ['Safe space hero', 'Mode selection', 'Consent explainer'],
    components: [
      'HeroBanner',
      'ValueCards',
      'ModeSelector',
      'ConsentAccordion',
      'PrimaryAndGhostButtons',
    ],
    ctas: ['Start my journey', 'Maybe later'],
  },
  {
    id: 'account_privacy',
    route: '/account-privacy',
    stitchFolder: 'account_privacy',
    title: 'Account & Privacy Setup',
    subtitle: 'Consent, profile setup, and private defaults before use.',
    highlights: ['Account form', 'Visibility controls', 'Data ownership'],
    components: [
      'AuthForm',
      'VisibilityOptions',
      'SharingToggles',
      'DataControlCards',
      'ConsentConfirmModal',
    ],
    ctas: ['Create account', 'Confirm sovereignty'],
  },
  {
    id: 'home_dashboard',
    route: '/home-dashboard',
    stitchFolder: 'home_dashboard',
    title: 'Home Dashboard',
    subtitle: 'Daily encouragement with stats, heatmap, and achievements.',
    highlights: ['Quick stats', '30-day heatmap', 'Today progress ring'],
    components: [
      'EncouragingBanner',
      'StatCards',
      'HeatmapGrid',
      'ProgressRing',
      'AchievementCarousel',
    ],
    ctas: ['View all milestones', 'Add task'],
  },
  {
    id: 'daily_tasks',
    route: '/daily-tasks',
    stitchFolder: 'daily_tasks',
    title: 'Daily Tasks',
    subtitle: 'Core task completion flow with rest-day support.',
    highlights: ['Task cards', 'Completion states', 'Rest mode'],
    components: [
      'TaskList',
      'TaskCard',
      'ProgressHero',
      'RestModeCard',
      'CelebrationSheet',
    ],
    ctas: ['Complete task', 'Enable rest mode'],
  },
  {
    id: 'task_customize',
    route: '/task-customize',
    stitchFolder: 'task_customize',
    title: 'Task Customization',
    subtitle: 'Users tune daily rhythm and choose supported task types.',
    highlights: ['Task toggles', 'Custom task slots', 'Schedule preference'],
    components: [
      'TaskToggleRows',
      'CustomTaskInput',
      'ScheduleChips',
      'SaveFooter',
    ],
    ctas: ['Save routine', 'Reset to defaults'],
  },
  {
    id: 'streak_consistency',
    route: '/streak-consistency',
    stitchFolder: 'streak_consistency',
    title: 'Streak & Consistency',
    subtitle: 'Gentle continuity tracking without punitive language.',
    highlights: ['Current and longest streak', 'Break-friendly messaging'],
    components: [
      'StreakHero',
      'ConsistencyMetrics',
      'PauseStateCard',
      'JourneyInsights',
    ],
    ctas: ['Continue today', 'Review consistency'],
  },
  {
    id: 'levels_xp',
    route: '/levels-xp',
    stitchFolder: 'levels_xp',
    title: 'Levels & XP',
    subtitle: 'Progress visibility through levels, XP, and growth tiers.',
    highlights: ['XP breakdown', 'Tier roadmap', 'Next milestone'],
    components: [
      'LevelHeader',
      'XPProgressBar',
      'TierTrack',
      'GrowthHistoryList',
    ],
    ctas: ['See XP events', 'View next badge'],
  },
  {
    id: 'achievements',
    route: '/achievements',
    stitchFolder: 'achievements',
    title: 'Achievements',
    subtitle: 'Unlockable badges with friendly progress framing.',
    highlights: ['Badge grid', 'Recently unlocked', 'Progress detail'],
    components: [
      'CategoryTabs',
      'BadgeCards',
      'UnlockedStrip',
      'BadgeDetailDialog',
    ],
    ctas: ['Share badge', 'Keep private'],
  },
  {
    id: 'reports_insights',
    route: '/reports-insights',
    stitchFolder: 'reports_insights',
    title: 'Reports & Insights',
    subtitle: 'Weekly and monthly reflections focused on gentle support.',
    highlights: ['Trend cards', 'Weekly report', 'Action suggestions'],
    components: [
      'ReportSummary',
      'TrendCards',
      'InsightPrompts',
      'ExportButton',
    ],
    ctas: ['Export report', 'Plan next week'],
  },
  {
    id: 'notifications',
    route: '/notifications',
    stitchFolder: 'notifications',
    title: 'Notifications',
    subtitle: 'Configurable reminders and encouragement timing.',
    highlights: ['Reminder times', 'Nudge preferences', 'Quiet mode'],
    components: [
      'NotificationToggles',
      'TimingPicker',
      'SnoozeOptions',
      'PreviewNotification',
    ],
    ctas: ['Save preferences', 'Disable all'],
  },
  {
    id: 'stress_mode_prefs',
    route: '/stress-mode-preferences',
    stitchFolder: 'stress_mode_prefs',
    title: 'Stress Mode & Preferences',
    subtitle: 'Adaptive intensity settings based on user comfort.',
    highlights: ['High/Medium/Low modes', 'Theme and language settings'],
    components: [
      'StressModeSegmentedControl',
      'TimePreferences',
      'LanguagePicker',
      'ThemeSelector',
    ],
    ctas: ['Apply mode', 'Cancel changes'],
  },
  {
    id: 'profile_settings',
    route: '/profile-settings',
    stitchFolder: 'profile_settings',
    title: 'Profile & Settings',
    subtitle: 'Profile management, accessibility, and account controls.',
    highlights: ['Profile header', 'Accessibility options', 'Data controls'],
    components: [
      'ProfileHeader',
      'AccessibilityToggles',
      'PrivacySummary',
      'AccountActions',
    ],
    ctas: ['Update profile', 'Export data'],
  },
  {
    id: 'safety_resources',
    route: '/safety-resources',
    stitchFolder: 'safety_resources',
    title: 'Safety Resources',
    subtitle: 'Optional support resources for mental health moments.',
    highlights: ['Regional support', 'Talk-to-someone pathways', 'Quick calm'],
    components: [
      'CrisisResourceCards',
      'ProfessionalHelpList',
      'QuickCalmTiles',
    ],
    ctas: ['Find support', 'Start 60s calm'],
  },
]

function App() {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true" />
          <div>
            <p className="brand-title">AuraFarm</p>
            <p className="brand-subtitle">Mental wellness, gently paced</p>
          </div>
        </div>
        <span className="status-pill">Private MVP</span>
      </header>

      <div className="main-layout">
        <aside className="sidebar">
          <p className="sidebar-title">Imported Stitch Screens</p>
          <nav className="screen-nav" aria-label="Stitch pages">
            {stitchScreens.map((screen) => (
              <NavLink
                key={screen.id}
                to={screen.route}
                className={({ isActive }) =>
                  `screen-link${isActive ? ' screen-link-active' : ''}`
                }
              >
                {screen.title}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/welcome-onboarding" replace />}
            />
            {stitchScreens.map((screen) => (
              <Route
                key={screen.id}
                path={screen.route}
                element={<StitchScreenPage screen={screen} />}
              />
            ))}
          </Routes>
        </main>
      </div>
    </div>
  )
}

function StitchScreenPage({ screen }: { screen: StitchScreen }) {
  return (
    <section className="screen-page">
      <div className="hero-card">
        <div>
          <p className="screen-source">Stitch folder: {screen.stitchFolder}</p>
          <h1>{screen.title}</h1>
          <p className="hero-subtitle">{screen.subtitle}</p>
        </div>
        <div className="hero-actions">
          {screen.ctas.map((cta) => (
            <button key={cta} type="button" className="btn btn-primary">
              {cta}
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid">
        <article className="panel">
          <h2>Key UI Highlights</h2>
          <ul>
            {screen.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <h2>Core Components</h2>
          <ul>
            {screen.components.map((item) => (
              <li key={item}>
                <code>{item}</code>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <section className="panel preview-panel">
        <h2>Preview Block</h2>
        <p>
          This route is now wired inside one React app. Next step is replacing
          each preview block with full pixel-level JSX from your Stitch export.
        </p>
        <div className="preview-elements">
          <div className="mini-card">
            <p className="mini-card-title">Current streak</p>
            <strong>12 days</strong>
          </div>
          <div className="mini-card">
            <p className="mini-card-title">Weekly completion</p>
            <strong>5/7 days</strong>
          </div>
          <div className="mini-card">
            <p className="mini-card-title">Level progress</p>
            <strong>15/100</strong>
          </div>
        </div>
      </section>
    </section>
  )
}

export default App
