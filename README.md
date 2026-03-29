<div align="center">

# Phool

### The Organic Sanctuary

[![Live demo](https://img.shields.io/badge/demo-nln--hackathon.vercel.app-446D52?style=for-the-badge&logo=vercel&logoColor=white)](https://nln-hackathon.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

*Private-first daily Conditioning · optional AI-assisted onboarding · safety-aware by design*

<br/>

</div>

---

## Abstract

> **Phool** is a cross-platform wellness companion that emphasizes **privacy**, **consistency without shame**, and **clear safety boundaries**. The marketing site is a Vite/React landing experience; the client application is an Expo (React Native) app backed by **Supabase**, with optional **Google Gemini** integration for Conditioning generation and guided flows. The product is **not** a clinical tool, emergency service, or replacement for professional mental health care.

**Live marketing site:** [nln-hackathon.vercel.app](https://nln-hackathon.vercel.app)

---

## Table of contents

1. [Product framing (notation)](#product-framing-notation)
2. [Repository layout](#repository-layout)
3. [Features](#features)
4. [Technology stack](#technology-stack)
5. [Landing page composition](#landing-page-composition)
6. [Prerequisites](#prerequisites)
7. [Setup](#setup)
8. [Scripts](#scripts)
9. [Documentation](#documentation)
10. [Team](#team)
11. [Disclaimer](#disclaimer)

---

## Product framing (notation)

*The following expressions use [GitHub Flavored Markdown LaTeX](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions) ($\LaTeX$-style math) to state design intent compactly.*

**Incremental progress.** Daily engagement is treated as a nonnegative accumulation of completed Conditioning over discrete days $t = 1,2,\ldots,T$:

$$
S_T \;=\; \sum_{t=1}^{T} s_t,
\qquad
s_t \in \{0,1\},
$$

where $s_t = 1$ indicates completion on day $t$. The UX avoids punitive framing when $s_t = 0$—consistency is encouraged without all-or-nothing scoring.

**Privacy and safety as constraints.** High-level design prioritizes user agency and minimal sensitive exposure. Conceptually, features are chosen within a feasible region that respects privacy preservation and escalation to **human** crisis resources (not modeled as an optimization here, but stated explicitly in-product):

$$
\text{Shippable feature set } \mathcal{F}
\;\subseteq\;
\Bigl\{ f \;\Big|\; \text{Privacy}(f)=\text{strong},\; \text{Safety}(f)=\text{human-first} \Bigr\}.
$$

---

## Repository layout

| Domain | Path | Role |
|--------|------|------|
| **Web** (marketing) | `src/`, `index.html`, `vite.config.ts` | Vite + React + TypeScript landing |
| **Mobile** | `mobile/` | Expo Router application |
| **Product docs** | `docs/` | PRDs and specifications (`PRD_LANDING.md`, etc.) |
| **Database helpers** | `mobile/supabase/sql/` | Supabase SQL for schema alignment |

---

## Features

### Web — marketing landing

| Capability | Description |
|------------|-------------|
| **Navigation** | Sticky glass-style nav with anchored sections and primary CTAs |
| **Hero** | Value proposition, waitlist/app links (`WAITLIST_URL`, `APP_URL` in `src/landing/content.ts`), optional YouTube hero embed |
| **Showcase** | Phone mockup, staged motion narrative, feature slides (`PhoneFrame`, `ShowcaseSlides`) |
| **Content sections** | Story, product narrative, feature grid, how-it-works, trust & safety, FAQ |
| **Conversion** | Closing CTA band and footer |
| **Compliance copy** | Clear positioning: not a 24/7 therapist; fallbacks when AI is unavailable; crisis pathways |

### Mobile — Phool application

| Area | Description |
|------|-------------|
| **Shell** | Expo Router; post-onboarding: **Home**, **Tasks**, **Insights**, **Profile** with custom tab bar |
| **Onboarding** | Authentication flow, quiz, optional Gemini-assisted Conditioning generation |
| **Core loop** | Daily Conditioning, task interactions, streak-oriented feedback (Zustand + Supabase) |
| **Insights** | Progress visualization (e.g. heatmap-style components) |
| **Account** | Profile editing, customization, notifications, privacy screens |
| **Safety** | Dedicated safety content; counselor-style AI chat **only** where keys and policy allow |
| **Supporting** | Journal, notifications, haptics/media integrations as used in flows |

---

## Technology stack

### Web (repository root)

| Layer | Technology |
|-------|------------|
| UI | React **19** |
| Language | TypeScript **~5.9** |
| Tooling | Vite **8**, `@vitejs/plugin-react` |
| Routing | React Router **7** (`/` → landing) |
| Quality | ESLint **9** |
| Typography | Google Fonts: **Plus Jakarta Sans**, **Manrope** (`index.html`) |

### Mobile (`mobile/`)

| Layer | Technology |
|-------|------------|
| Platform | Expo **~54**, React Native **0.81** |
| UI runtime | React **19.1** |
| Navigation | Expo Router **~6** |
| State | Zustand **5** |
| Backend client | `@supabase/supabase-js` |
| Motion / UX | Reanimated, Gesture Handler, Screens, Safe Area Context |
| Persistence | Async Storage |
| Ecosystem | Notifications, Haptics, Image Picker, AV, Linear Gradient, Location, Sensors, Web Browser, Splash, System UI, Status Bar, SVG |
| Fonts | `@expo-google-fonts/manrope`, `@expo-google-fonts/plus-jakarta-sans` |

### Services

| Service | Responsibility |
|---------|----------------|
| **Supabase** | Authentication, database, project configuration |
| **Google AI (Gemini)** | Optional: onboarding Conditioning generation and safety-adjacent chat surfaces (via `EXPO_PUBLIC_GEMINI_API_KEY`) |

---

## Landing page composition

**Entry:** [`src/landing/LandingPage.tsx`](src/landing/LandingPage.tsx)

**Section sequence**

1. `HeroSection`
2. `AppShowcaseSection`
3. `StorySection`
4. `ProductSection`
5. `FeaturesSection`
6. `HowItWorksSection`
7. `TrustSafetySection`
8. `FAQSection`
9. `ClosingCTASection`
10. `LandingFooter`

**Layout glue:** `WaveDivider` between major vertical blocks.

**Shared UI** ([`src/landing/components/`](src/landing/components/))  
`LandingNav`, `LandingButton`, `BrandMark`, `PhoneFrame`, `ShowcaseSlides`, `SectionHeading`, `FeatureCard`, `FAQAccordion`, and related primitives.

**Data & style:** [`src/landing/content.ts`](src/landing/content.ts) · [`src/landing/landing.css`](src/landing/landing.css)

---

## Prerequisites

- **Node.js** (LTS) and **npm**
- **Mobile:** `npx expo` workflow; **Expo Go** on hardware, or **Xcode** / **Android Studio** emulators

---

## Setup

### Web (landing)

```bash
npm install
npm run dev
```

| Command | Purpose |
|---------|---------|
| `npm run build` | `tsc -b` + Vite production build → `dist/` (gitignored; produced on Vercel) |
| `npm run preview` | Serve production build locally |
| `npm run lint` | ESLint |

### Mobile

```bash
cd mobile
npm install
cp .env.example .env
```

Populate `mobile/.env` from your team’s vault (**never commit secrets**):

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous (public) key |
| `EXPO_PUBLIC_GEMINI_API_KEY` | No | Gemini-powered flows |

Configure Supabase **Authentication** providers and redirect URLs per [`mobile/.env.example`](mobile/.env.example). Optionally execute SQL under [`mobile/supabase/sql/`](mobile/supabase/sql/) in the Supabase SQL editor.

```bash
npm start
# npm run ios | npm run android | npm run web
```

---

## Scripts

| Scope | Command | Description |
|-------|---------|-------------|
| Root | `npm run dev` | Vite development server |
| Root | `npm run build` | Typecheck + production bundle |
| Root | `npm run preview` | Preview `dist/` |
| Root | `npm run lint` | Lint web workspace |
| `mobile/` | `npm start` | Expo dev server |
| `mobile/` | `npm run ios` · `android` · `web` | Target platforms |

---

## Documentation

| Document | Contents |
|----------|----------|
| [`docs/PRD_LANDING.md`](docs/PRD_LANDING.md) | Landing IA, design system, motion spec, content rules |

---

## Team

| Contributor |
|-------------|
| **Arya Kafle** |
| **Ashim Pandey** |
| **Sudip Sharma** |
| **Sushant Shrestha** |
| **Sweekar Shrestha** |

---

## Disclaimer

This repository supports a **hackathon and educational** demonstration. **Phool does not provide medical advice, diagnosis, or treatment.** For emergencies or imminent risk of harm, contact **local emergency services** or a **qualified crisis line** in your jurisdiction.
