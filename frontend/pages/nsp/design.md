# NSP Mock Portal — Design Specification

Pixel-faithful replica of `scholarships.gov.in` for the GovBot live-form-filling demo.

---

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `nsp-pink` | `#C2185B` | Primary CTA, icons, active links, progress bar |
| `nsp-pink-light` | `#E91E8C` | Hover states, badge backgrounds |
| `nsp-navy` | `#1A237E` | Top utility bar background |
| `nsp-blue` | `#1565C0` | Secondary nav bar, footer background |
| `nsp-orange` | `#E65100` | Fellowship card |
| `nsp-teal` | `#00796B` | Public card |
| `nsp-purple` | `#6A1B9A` | Officers card |
| `nsp-coral` | `#C62828` | Institutions card |
| `bg-light` | `#F5F5F5` | Page background |
| `card-white` | `#FFFFFF` | Card/panel backgrounds |
| `text-dark` | `#212121` | Body text |
| `text-muted` | `#757575` | Caption / subtext |
| `border-light` | `#E0E0E0` | Card borders |
| `pink-hero-bg` | `#FCE4EC` | Hero banner tint |

---

## 2. Typography

| Element | Font | Weight | Size |
|---|---|---|---|
| Portal name (EN) | Arial / system-ui | 700 | 16px |
| Portal name (HI) | Arial / system-ui | 700 | 14px |
| Nav items | Arial | 400 | 13px |
| Section headings | Arial | 700 | 18px |
| Card titles | Arial | 700 | 15px |
| Card body | Arial | 400 | 13px |
| Footer links | Arial | 400 | 12px |

---

## 3. Layout Structure

```
┌────────────────────────────────────────────────────────┐
│  TOP UTILITY BAR  (navy #1A237E, 32px)                 │
│  [GOI logo] Government of India | MeitY | NIC Logo     │
├────────────────────────────────────────────────────────┤
│  MAIN NAV BAR  (white, 64px, shadow)                   │
│  [Emblem] [NSP Logo + text]  ≡   FAQs Announcements    │
│  Academic Year 2025-26                     Helpdesk ☎  │
├────────────────────────────────────────────────────────┤
│  ROLE NAV TILES  (full-width strip)                    │
│  [Students] [Institutions] [Officers] [Public]         │
│  [Fellowship]  — each a colored square w/ icon         │
├────────────────────────────────────────────────────────┤
│  HERO CAROUSEL  (light geometric pattern, pink tint)   │
│  ① Get Yourself Registered  →  ② Online Application   │
│  →  ③ Scholarship Amount Credited                      │
├────────────────────────────────────────────────────────┤
│  STUDENT SECTION HEADING  "Students"                   │
│  TICKER / announcements bar  (horizontal scrolling)    │
├────────────────────────────────────────────────────────┤
│  CARDS GRID  (3 per row, responsive)                   │
│  [Announcements] [OTR] [Apply For Scholarship]         │
│  [Schemes on NSP] [Application Status] [Track Payment] │
│  [Aadhaar Seva Kendra] [Aadhaar Seeding] [Check UDID]  │
├────────────────────────────────────────────────────────┤
│  LOWER SECTION (2-col)                                 │
│  Announcements List  |  Get your OTR panel             │
├────────────────────────────────────────────────────────┤
│  FOOTER LOGOS  (MeitY, NIC, GOV, etc.)                 │
│  FOOTER LINKS  Copyright | Privacy | Terms | Sitemap   │
│  Last update notice                                    │
└────────────────────────────────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Top Utility Bar
- Height: 32px
- Background: `#1A237E` (navy)
- Text: white, 11px
- Contents: "Government of India" | "Ministry of Electronics & Information Technology" | NIC logo placeholder (text)
- Right side: accessibility icon (A+/A-)

### 4.2 Main Nav Bar
- Height: 64px
- Background: white
- Box-shadow: `0 2px 4px rgba(0,0,0,0.1)`
- Left: Ashoka emblem (img or SVG placeholder 40×40) + NSP logo (img placeholder) + bilingual text stack
  - Line 1: "🎓 NSP" bold pink + "national scholarship portal" small
  - Line 2: "Academic Year 2025-26" gray 11px
- Center: hamburger menu icon (`≡`, gray)
- Right: FAQs 💬 | Announcements 🔔 | Helpdesk 📞 — each with icon + label, 13px, gray-700

### 4.3 Role Nav Tiles
- 5 colored square buttons in a horizontal strip, full width
- Each: 160px min-width, 80px height, icon + label centered
- Colors: Students=`#C2185B`, Institutions=`#C62828`, Officers=`#6A1B9A`, Public=`#00796B`, Fellowship=`#E65100`
- Text: white, 14px bold
- Active tab (Students): slightly darker shade + underline

### 4.4 Hero Carousel
- Background: geometric triangle pattern on `#FCE4EC` (pinkish white)
- 3 steps connected by arrows:
  1. Icon (person at computer) + "Get Yourself Registered"
  2. Icon (form/laptop) + "Online Application"
  3. Icon (graduation cap with coins) + "Scholarship amount credited"
- Left/right arrow buttons `< >`
- Auto-rotates every 4s

### 4.5 Announcement Ticker
- Under "Students" heading
- Horizontal scroll marquee of announcement text
- Background: `#FFF9C4` (pale yellow), border-left: 4px solid `#C2185B`
- "Announcements:" label in pink bold

### 4.6 Info Cards (Student section)
Each card:
- White background, `1px solid #E0E0E0` border, no border-radius (flat)
- Padding: 20px
- Top: pink icon (SVG / emoji proxy, ~48×48)
- Title: bold 15px dark
- Body: 13px muted gray, 2–3 lines
- CTA: underlined pink link, 13px ("Login", "View all", "Track Your Payment")
- Hover: `box-shadow: 0 4px 12px rgba(194,24,91,0.15)`

Card content (from live site):
1. **Announcements** — megaphone icon — "Portal is now open for Academic Year 2025-26..." → *View all*
2. **OTR** — graduation cap icon — "One Time Registration (OTR) is a unique 14-digit number..." → *Login*
3. **Apply For Scholarship** — key icon — "Login with your OTR ID and PASSWORD..." → *Login*
4. **Schemes on NSP** — key/book icon — "List of scholarship schemes with specification..." → *Schemes on NSP*
5. **Application Status** — person icon — "For Academic Year 2022-23 and 2023-24." → *Login*
6. **Track Your Payment** — card/rupee icon — "Track your scholarship disbursement status on PFMS portal." → *Track Your Payment*
7. **Aadhaar Seva Kendra** — location pin icon — "Know the Aadhaar Seva Kendra nearest to your location." → *Aadhaar Seva Kendra*
8. **Aadhaar Seeding** — fingerprint icon — "Check your bank account seeding status with Aadhaar" → *Check Bank Account* | *How to seed Aadhaar*
9. **Check UDID details** — person icon — "Check UDID details at Swavlamban Portal" → *UDID details*

### 4.7 Lower Two-Column Section
Left — **Announcements list:**
- Bordered box, heading "Announcements" with pink megaphone icon
- Bulleted list of 4 announcement items, each a pink link + 2-line description
- "View more" link at bottom

Right — **Get your OTR:**
- Bordered box, heading "Get your OTR" with graduation icon
- Short description paragraphs
- Bold pink "Apply now!" CTA button (outline style)

### 4.8 Footer
- **Logo strip:** MeitY, NIC, DigitalIndia, GOV logos (grayscale placeholders in a flex row)
- **Link row:** Copyright Policy | Privacy Policy | Terms and Conditions | Disclaimer | Hyperlink | Site Map
- **Last update notice:** "Last update on October 2025"
- **Bhashini notice:** "The original text is in English. Translation into other languages is powered by the Bhashini service."
- Background: white, border-top: `1px solid #E0E0E0`, padding: 24px

### 4.9 Floating Chat Widget (bottom-right)
- Round pink button, `#C2185B`, 56px diameter
- Speech bubble icon + "VANI" label tooltip on hover
- Opens an "I am still learning" overlay panel

---

## 5. GovBot Live-Fill Overlay

This is the **unique addition** on top of the NSP replica — an overlay/sidebar that demonstrates GovBot filling the form.

### Trigger
- Pink "▶ Watch GovBot Apply" floating button (bottom-left corner, distinct from NSP's chat widget)
- Also auto-triggers when Supabase Realtime detects a new `applications` row

### Overlay Layout
```
┌─────────────────────────────────────────┐
│  🤖 GovBot is filling your application  │
│  ━━━━━━━━━━━━━━━━━━━━━━  72%            │
├─────────────────────────────────────────┤
│  ✅ Name entered          Ravi Kumar    │
│  ✅ DOB filled            15/08/2003    │
│  ✅ Aadhaar number        XXXX XXXX     │
│  ⏳ Academic details...               │
│  ○  Bank details                       │
│  ○  Document upload                    │
├─────────────────────────────────────────┤
│  [Highlight active field in main form]  │
└─────────────────────────────────────────┘
```

### Behavior
- When a field is "being typed": the corresponding form input gets a glowing `box-shadow: 0 0 0 3px #C2185B` ring + cursor blink
- Text appears character-by-character at ~60ms/char
- Step log updates in real-time
- On completion: full-screen success overlay with confirmation number

---

## 6. Responsive Breakpoints

| Breakpoint | Cards per row | Notes |
|---|---|---|
| `≥1024px` | 3 | Full layout |
| `768–1023px` | 2 | Role tiles wrap to 2 rows |
| `<768px` | 1 | Stack all, hamburger nav |

---

## 7. Assets / Placeholder Strategy

Since we can't use real GOI assets, we use:
- **Emblem:** Unicode "🏛️" or SVG circle placeholder
- **NSP Logo:** Text "🎓 NSP" styled with CSS
- **Icons:** Unicode emoji proxies for cards (📢 🎓 🔑 📋 💳 📍 💰 👤)
- **Partner logos in footer:** Gray text badges (MeitY | NIC | Digital India | Gov.in)

---

## 8. Application Form Page (`/nsp/apply`)

Accessible via "Apply For Scholarship → Login" card. This is a separate sub-page with the 4-step multi-section form that GovBot animates filling.

### Form Tabs (NSP style: pink underline active tab)
```
[Applicant Details] [Academic Details] [Bank Details] [Documents & Submit]
```

### Fields per tab

**Tab 1 – Applicant Details**
- Full Name (as per Aadhaar) *
- Date of Birth (DD/MM/YYYY) *
- Gender (M/F/Other) — radio
- Category (General / SC / ST / OBC / Minority) — dropdown
- Religion — dropdown
- Mobile Number *
- Email ID
- Aadhaar Number *
- Annual Family Income *
- State of Domicile — dropdown

**Tab 2 – Academic Details**
- Institute State — dropdown
- Institute District — dropdown
- Institute Name — searchable dropdown
- Course/Class — dropdown
- Year of Study — dropdown
- Board/University
- Previous Year Marks (%)
- Admission Date

**Tab 3 – Bank Details**
- Account Holder Name
- Bank Name — dropdown
- Account Number *
- Confirm Account Number *
- IFSC Code *
- Branch Name (auto-filled from IFSC)

**Tab 4 – Documents & Submit**
- Aadhaar Card (upload box, accepts jpg/png/pdf ≤2MB)
- Income Certificate (upload box)
- Previous Marksheet (upload box)
- Caste/Category Certificate (conditional)
- Declaration checkbox
- Submit button (pink, full-width)

All inputs: flat style, `1px solid #BDBDBD` border, pink focus ring, label above field.

---

## 9. Mock Application Form Data (for Demo)

When GovBot demo runs, these values are typed in sequence:

```json
{
  "name": "Ravi Kumar",
  "dob": "15/08/2003",
  "gender": "Male",
  "category": "OBC",
  "mobile": "98XXXXXX12",
  "aadhaar": "XXXX XXXX 4521",
  "income": "180000",
  "state": "Karnataka",
  "institute": "Government PU College, Bengaluru",
  "course": "Pre-University (Science)",
  "year": "1st Year",
  "bank": "State Bank of India",
  "account": "XXXX XXXX 7890",
  "ifsc": "SBIN0001234"
}
```

---

## 10. File Map

```
frontend/pages/
├── nsp/
│   ├── index.tsx        ← NSP home page (replica)
│   ├── apply.tsx        ← Multi-step application form
│   └── design.md        ← This file
frontend/styles/
│   └── nsp.css          ← NSP-specific overrides (if needed)
```
