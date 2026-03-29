# StreakSync Landing Page PRD

## Product
- **Name:** StreakSync
- **Subtitle:** The Organic Sanctuary
- **Purpose:** Help people in stigma-heavy communities build mental stability through private daily rituals before stress escalates.

## Problem
People who need support often avoid formal care early because of stigma, social pressure, and fear of judgment. Existing habit apps feel generic and clinical, and they do not provide a culturally sensitive “first step” experience.

## Audience
- Students and young professionals in stigma-heavy contexts.
- Secondary: campus groups, youth NGOs, wellness partners.

## Goals
1. Explain the story/problem clearly and empathetically.
2. Describe the product with code-accurate claims.
3. Convert with waitlist/early-access CTAs.
4. Present a premium, calm “Living Editorial” visual identity.

## Non-Negotiable Product Truths
- Gemini is used during onboarding to generate personalized rituals.
- The app is **not** a 24/7 therapy chat companion.
- Safety resources must be framed as human support pathways.
- Fallback ritual tasks exist when AI is unavailable.

## Information Architecture
1. Sticky nav with anchors and CTA.
2. Hero: value prop, CTA, “what makes it different” card.
3. Showcase (`#showcase`): logo drop -> phone bloom -> app slides. Desktop: phone mockup left, headline and step cards right; narrow viewports stack with phone first.
4. Wave divider.
5. Story section.
6. Product section.
7. Wave divider.
8. Features section.
9. How it works section.
10. Trust and safety section.
11. FAQ section.
12. Closing CTA section.
13. Footer.

## Design System Requirements (Organic Sanctuary)
- Surfaces over hard lines: avoid 1px section separators.
- Use mist/base surfaces (`#F6FBF7` family), soft layering, organic spacing.
- Headline font: Plus Jakarta Sans; body font: Manrope.
- Primary CTA: botanical gradient `#096444 -> #2E7D5B`, pill shape.
- Secondary CTA: `#BFEECC` background, `#446D52` text.
- Glass nav: ~80% surface opacity and `24px` backdrop blur.
- Charcoal text (`#1F2A24`) instead of pure black.

## Showcase Motion Spec
- **Layout:** Sticky viewport is top-aligned (not vertically centered) so tall content is not clipped; phone stage is capped to fit typical viewports.
- **Phase A:** Hero-only first view; no phone peeking.
- **Phase B:** Logo falls to a ground anchor.
- **Phase C:** Phone blooms from that same anchor.
- **Phase D:** Feature slides begin only after bloom completes.
- Honor `prefers-reduced-motion` with static fallback.

## Content/Copy Rules
- Align messaging with `docs/PITCH_STREAKSYNC.md`.
- Keep language supportive, non-clinical, and non-judgmental.
- Never imply replacement for professionals or emergency care.

## Success Criteria
- First paint shows hero only under nav.
- No `/design-gallery` route or links.
- Showcase assets load from `/landing/*.png`.
- Scroll sequence follows A -> B -> C -> D.
- `npm run build` passes and landing files lint cleanly.
