# GOVbot Web UI Redesign — Design Specification

## Context

GOVbot's current landing page uses a generic white/saffron/teal fintech template that doesn't communicate the ambition of the platform. The redesign will transform every page into a cinematic, immersive experience with intense scroll animations — while applying Impeccable's color philosophy: **one decisive accent, editorial restraint, no AI-aesthetic clichés.**

The goal: maximum animation intensity with minimum color noise.

---

## Color Theory — Impeccable Principles Applied

### Foundation: Deep Warm Black

Not blue-black. Not purple-black. A warm, editorial near-black with imperceptible warmth — like darkroom printing paper.

| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `oklch(3% 0.005 30)` / `#080807` | Page background, deepest layer |
| `--canvas` | `oklch(8% 0.005 30)` / `#121210` | Primary surface |
| `--surface` | `oklch(12% 0.008 30)` / `#1c1b18` | Cards, elevated panels |
| `--elevated` | `oklch(16% 0.008 30)` / `#272520` | Hover states, active surfaces |
| `--muted` | `oklch(25% 0.005 30)` / `#3d3a34` | Borders, dividers |

### ONE Accent: Saffron — Used Decisively

Following Impeccable's rule: one accent color at ≤10% of any screen. No secondary accents. No gradients between accents.

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `oklch(75% 0.18 55)` / `#ff9933` | THE color. CTAs, active states, the ONE thing that pops |
| `--accent-dim` | `oklch(75% 0.18 55 / 0.15)` | Glow halos, shadow tint |
| `--accent-subtle` | `oklch(75% 0.18 55 / 0.08)` | Hover backgrounds, subtle indicators |

### Text Hierarchy — Flat, No Color

| Token | Value | Usage |
|-------|-------|-------|
| `--ink` | `oklch(95% 0 0)` / `#f0ede8` | Headlines, primary text (warm white) |
| `--body` | `oklch(75% 0.005 30)` / `#b5b0a6` | Body copy |
| `--muted-text` | `oklch(50% 0.005 30)` / `#7a756c` | Captions, metadata |

### Functional Colors (Semantic Only — Never Decorative)

| Token | Value | Context |
|-------|-------|---------|
| `--success` | `oklch(72% 0.15 155)` | Verification passed, eligibility confirmed |
| `--error` | `oklch(65% 0.2 25)` | Fraud alert, failed verification |
| `--warning` | `oklch(80% 0.15 85)` | Renewal due, deadline approaching |

### What We Do NOT Use

- ❌ Gradients between multiple accent colors
- ❌ Purple, indigo, neon blue, pink (AI-aesthetic colors)
- ❌ Glassmorphism (backdrop-blur + translucent fills)
- ❌ Per-page color theming (every page uses same palette)
- ❌ Colored shadows or glows in multiple hues
- ❌ Rainbow or spectrum effects

### Cinematic Depth (Without Color)

Depth comes from **light and shadow**, not color:
- Vignette: radial gradient from transparent center to `--void` edges
- Volumetric light: single saffron-tinted directional light source (top-left)
- Film grain: 1.5% opacity monochrome noise overlay
- Ambient particles: warm white dust motes (NOT colored)
- Spotlight follows cursor: `--accent-dim` radial gradient at 8% opacity

---

## Typography — Editorial Authority

Following Impeccable: use weight/size/style for hierarchy, never color.

| Role | Font | Weight | Size | Tracking |
|------|------|--------|------|----------|
| Display | **Space Grotesk** | 700 | 64–96px | -2.5px |
| Headline | Space Grotesk | 600 | 36–48px | -1.5px |
| Subhead | **Inter** | 500 | 20–24px | -0.3px |
| Body | Inter | 400 | 16px, 1.6lh | 0 |
| Caption | Inter | 400 | 13px | +0.2px |
| Mono/Data | **JetBrains Mono** | 400 | 14px | 0 |

---

## Spacing & Layout

Scale (px): `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128`

- Sections: 128px vertical padding (generous editorial breathing room)
- Cards: 24px internal padding, 16px gap
- Max content width: 1200px centered
- Grid: 12-column with 24px gutter

---

## Elevation

Flat by default. Shadows appear ONLY on hover or active state.

| Level | Shadow | When |
|-------|--------|------|
| Rest | None | Default state for all surfaces |
| Hover | `0 4px 24px -4px oklch(3% 0 0 / 0.4)` | Card hover, button hover |
| Active | `0 8px 32px -4px oklch(3% 0 0 / 0.5), 0 0 0 1px var(--accent-subtle)` | Focused input, active card |
| Glow | `0 0 40px var(--accent-dim)` | CTA button, hero accent element |

---

## Navbar — Apple Floating Pill

- Shape: `border-radius: 999px`, centered, max-width 720px
- Background: `var(--canvas)` with `border: 1px solid var(--muted)`
- NO backdrop-blur (no glassmorphism per Impeccable rules)
- Active link: sliding pill indicator in `--accent` background
- Scroll behavior: full-width on top → shrinks to compact pill after 100px scroll (GSAP)
- Transition: 400ms `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out)
- Page transition: active pill slides smoothly between nav items (spring physics)

---

## Motion Design

### Easing (Impeccable standard)
- Primary: `cubic-bezier(0.16, 1, 0.3, 1)` — expo-out for all entrances
- Duration scale: 150ms (color) → 300ms (transform) → 600ms (orchestrated) → 1200ms (hero sequences)
- `prefers-reduced-motion`: disable all scroll-triggered animations, reduce to opacity-only fades

### Animation Rules
- ONLY animate `transform` and `opacity` — never layout properties
- Stagger delay: 50ms between siblings
- Scroll-trigger threshold: element 20% in viewport before firing
- 3D elements: `perspective(1000px)` on parent, max 15° rotation

---

## Landing Page Sections

### Section 1: Hero (100vh)

**3D India Map (React Three Fiber):**
- Low-poly wireframe outline of India in `--ink` color (warm white lines)
- Nodes pulse at scholarship portal locations (4 nodes: NSP-Delhi, PMSS, CSSS, Minority)
- Nodes are `--accent` (saffron) — the ONLY color on screen
- Connection lines trace between nodes in `--muted` with saffron pulse traveling along them
- Mouse interaction: subtle tilt (max 5°) following cursor

**Floating Bento Cards (Framer Motion):**
- 4 cards orbit the map at different depths
- Card content: actual feature previews (Aadhaar OCR fields, WhatsApp chat, eligibility result, credential)
- Cards use `--surface` background with `--muted` border — NOT colored/glowing
- Hover: card lifts (translateZ) + saffron `1px` border

**Kinetic Typography (GSAP SplitText):**
- "₹40,000 Crores Go Unclaimed" — 96px Space Grotesk, `--ink`
- On scroll: text splits by character, each letter drifts outward with physics decay
- Reveals underneath: "Not on our watch." in `--accent` (the ONE moment of color in type)
- Below: two CTAs — primary "Check Eligibility" (saffron fill, dark text) + secondary "WhatsApp" (outline)

**Background:**
- Particle field: warm white dust motes drifting slowly upward
- Single volumetric light cone from top-left (saffron-tinted, 5% opacity)
- NO mesh gradients, no aurora, no colored backgrounds

---

### Section 2: The Problem (Scroll-Pinned)

**GSAP ScrollTrigger pinned section:**
- As user scrolls, 4 pain points reveal one at a time:
  1. "4+ confusing portals" — portal icons stack and blur into chaos
  2. "23 documents manually" — paper stack grows, topples
  3. "Missed deadlines" — calendar pages flip with dates crossing out
  4. "₹40,000 Cr wasted" — number ticker animates from 0 (react-countup)
- Each stat is massive (72px number) in `--ink`, with caption in `--body`
- Background: subtle grid pattern (fine 1px lines in `--muted` at 30% opacity)
- The ONLY color: the final stat "₹40,000 Cr" counter lands in `--accent`

---

### Section 3: Core Features (Parallax + Stagger)

**8 Feature Cards — Aceternity Spotlight Effect:**
- Dark `--surface` cards with NO color fills
- On hover: spotlight follows cursor within card (white radial gradient at 3% opacity)
- Each card has a micro-animation showing the feature in action:
  - **Aadhaar OCR**: document outline → field values extracting one by one
  - **WhatsApp Bot**: chat bubbles typing in, supporting 5 languages
  - **Eligibility Screener**: 4 criteria checking off → scheme cards flipping
  - **Blockchain Wallet**: credential minting → TX hash appearing → QR generating
  - **Auto-Fill**: form fields lighting up sequentially (Playwright visualization)
  - **Bank Verify**: coin drop → checkmark bloom
  - **Fraud Detection**: two IDs overlapping → shield slam
  - **Renewal Alerts**: calendar with pulsing dates → notification bell ring

- **Parallax**: cards at depth 1, background grid at depth 0.5, floating shapes at depth 0.2
- **Stagger reveal**: cards cascade in from below (GSAP, 50ms stagger) as section enters viewport
- Card text: feature name in `--ink` (16px, weight 600), description in `--body`

---

### Section 4: Ecosystem (Orbit + Beams)

**Central Node:**
- GOVbot logo (monochrome, `--ink`) centered
- Inner orbital ring: 4 portal icons (NSP, PMSS, CSSS, Minority) circling at 20s period
- Outer orbital ring: integration icons (DigiLocker, WhatsApp, Polygon, Supabase, PM Kisan) at 35s period
- All icons monochrome `--body` color — NO colored brand logos

**Tracing Beams (Aceternity):**
- Lines connect each orbiting icon back to center
- A saffron pulse travels along each line toward center (showing data flow)
- Beams are `--muted` color, pulse is `--accent`

**Marquee (Magic UI):**
- Below orbit: infinite horizontal scroll of service names
- Text in `--muted-text`, separator dots in `--muted`
- "Aadhaar OCR · Bank Verify · DigiLocker · Auto-Fill · Renewal Alerts · Fraud Guard · QR Login · ₹ Disbursement Tracking"

---

### Section 5: How It Works (Scroll-Scrubbed Timeline)

**GSAP scroll-linked vertical timeline:**
- A single vertical line draws downward as user scrolls (starts `--muted`, fills to `--accent` as it progresses)
- 5 milestones appear at intersection points:
  1. 📱 "Message on WhatsApp" — phone mockup with bot greeting
  2. 📄 "Upload Documents" — Aadhaar/docs flowing into profile
  3. ✅ "Instant Eligibility" — scheme cards revealing results
  4. 🤖 "Auto-Fill & Submit" — form fields populating
  5. 🔗 "Blockchain Credential" — credential card minting with QR

- Each milestone: `--surface` card, icon in `--accent`, text in `--ink`/`--body`
- Cards alternate left/right of timeline
- Active card (in viewport center): `--accent` left border, slight elevation
- Background: animated dot grid (Magic UI) in `--muted` at 20% opacity

---

### Section 6: Live Demo — WhatsApp Conversation

**Phone Frame:**
- Dark phone mockup (CSS-drawn, `--surface` body, `--muted` bezels)
- WhatsApp-style chat inside showing real bot conversation:
  - User: "Hi" → Bot: menu with 5 numbered options
  - User: "1" → Bot: asks income → User: "₹2,00,000"
  - Bot: eligible schemes with ✅/❌ indicators
- Messages type in with realistic stagger delays (GSAP timeline)
- Phone tilts with cursor (3D perspective, max 8°)

**Language Buttons:**
- Row of text buttons: EN / हि / த / తె / ಕ
- Click changes the demo conversation language live
- Buttons: `--surface` bg, active one gets `--accent` underline

**Background:**
- Meteor lines (Aceternity) — but monochrome (`--muted` to transparent streaks)
- NOT green (no WhatsApp-colored background)

---

### Section 7: Security & Trust

**Infinite scrolling cards (Aceternity):**
- Horizontal auto-scrolling row of trust signals:
  - "Aadhaar masked to last 4" — number sequence with blur animation
  - "SHA-256 hashed storage" — plaintext → hash morph
  - "4-digit passkey protection" — lock dots filling
  - "Polygon blockchain credentials" — chain link forming
  - "JWT + OTP authentication" — token animation
  - "Duplicate Aadhaar detection" — shield slam

- Cards: `--surface` background, `--muted` border, text in `--ink`/`--body`
- NO colored icons — monochrome illustrations only
- Background: very subtle falling characters animation (Devanagari numerals in `--muted` at 8% opacity, drifting down slowly)

---

### Section 8: Final CTA

**Text Generate Effect (Aceternity):**
- "Your scholarship is waiting. Check in 60 seconds." — appears word by word in `--ink`
- 48px Space Grotesk

**Dual CTAs:**
- Primary: "Check Eligibility Now" — `--accent` bg, `--void` text, `border-radius: 0` (squared, Impeccable style), glow shadow on hover
- Secondary: "Chat on WhatsApp" — `--surface` bg, `--ink` text, `--muted` border, saffron border on hover

**QR Code:**
- Monochrome QR (links to WhatsApp) materializes with dot-by-dot animation
- Caption: "Scan to chat with GOVbot" in `--muted-text`

**Background:**
- Lamp effect (Aceternity) — single saffron light cone from below illuminating the CTA area
- Sparkle particles (warm white, NOT colored) around primary button

---

## Inner Pages — Cinematic Treatment

Every page shares:
- Same dark canvas (`--void` → `--canvas`)
- Same typography (Space Grotesk + Inter)
- Same saffron accent (ONE color everywhere)
- Film grain overlay (1.5% monochrome noise)
- Vignette at viewport edges
- Cursor-following subtle spotlight (`--accent-dim`)
- Ambient warm-white particles (slow, sparse)
- Page entry: content fades up 20px with 400ms expo-out

**Per-page differentiation comes from MOTION and LAYOUT, not color:**
- Dashboard: data visualization animations, real-time counters
- Eligibility: step-progress bar drawing with scroll, result cards flipping
- OCR: scan-line animation sweeping across uploaded image
- Wallet: credential cards with 3D flip on hover, chain-link animation
- Bank Verify: penny-drop physics animation on submit
- Profile: progress ring filling as completeness increases

---

## Libraries to Install

| Library | Version | Purpose |
|---------|---------|---------|
| `gsap` | ^3.12 | ScrollTrigger, SplitText, timeline orchestration |
| `@react-three/fiber` | ^8 | 3D India map in hero |
| `@react-three/drei` | ^9 | Float, OrbitControls, Line geometry |
| `three` | ^0.160 | Three.js core |
| `tailwindcss` | (existing v4) | Utility classes |
| `framer-motion` | (existing v12) | Page transitions, hover states |
| `lenis` | (existing v1.3) | Smooth scroll |

**Component sources (copy-paste, not npm):**
- Aceternity UI components: spotlight, meteor, text-generate, tracing-beam, infinite-cards, lamp
- Magic UI components: orbit, marquee, number-ticker, dot-grid, particles

---

## Verification Plan

1. Run `npm run dev` and check landing page loads with all 8 sections
2. Test scroll animations fire correctly (GSAP ScrollTrigger)
3. Verify 3D globe renders and responds to mouse (React Three Fiber)
4. Check navbar shrinks on scroll and active indicator slides
5. Test page transitions between routes (accent stays consistent saffron)
6. Verify `prefers-reduced-motion` disables scroll animations
7. Mobile: confirm 3D globe is replaced with static illustration, animations simplified
8. Performance: Lighthouse score ≥ 70 on mobile (heavy animations accepted on desktop)
9. Test all CTAs link correctly (/eligibility, WhatsApp deep link)
10. Chrome DevTools: no layout thrashing (only transform/opacity animated)

---

## Files to Modify/Create

**Modify:**
- `frontend/pages/index.tsx` — Complete rewrite of landing page
- `frontend/pages/_app.tsx` — Global cinematic overlays (grain, vignette, particles)
- `frontend/components/Layout.tsx` — New navbar, dark theme, remove old footer/nav
- `frontend/styles/globals.css` — Dark theme tokens, cinematic utilities
- `frontend/styles/design-system.css` — Replace with new token system
- `frontend/tailwind.config.ts` — Extend with custom tokens

**Create:**
- `frontend/components/landing/Hero.tsx` — 3D map + bento + kinetic type
- `frontend/components/landing/Problem.tsx` — Scroll-pinned stats
- `frontend/components/landing/Features.tsx` — Spotlight cards
- `frontend/components/landing/Ecosystem.tsx` — Orbit + beams
- `frontend/components/landing/HowItWorks.tsx` — Scroll timeline
- `frontend/components/landing/LiveDemo.tsx` — WhatsApp mockup
- `frontend/components/landing/Security.tsx` — Trust cards
- `frontend/components/landing/CTA.tsx` — Final call to action
- `frontend/components/ui/Navbar.tsx` — Apple pill navbar
- `frontend/components/ui/CinematicOverlay.tsx` — Grain + vignette + particles
- `frontend/components/three/IndiaMap.tsx` — 3D geometry
- `frontend/components/ui/` — Aceternity/Magic UI component copies
