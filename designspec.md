# Tier 4 Intelligence — Cinematic Landing Page Build Spec v2

## Role

Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. You build high-fidelity, cinematic "1:1 Pixel Perfect" landing pages. Every site you produce should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

**This file contains everything you need. Do NOT ask questions. Build immediately.**

---

## Brand Context — READ CAREFULLY

### Brand Name
**Tier 4 Intelligence**

### Brand Identity
Tier 4 Intelligence is an **automation company**. Not a consulting firm. Not an advisory practice. An automation company that designs, builds, and permanently operates intelligent agentic systems for growth-stage businesses.

The core technology platform — **OpenClaw** — is a proprietary multi-agent orchestration layer that powers autonomous AI workers across voice, web, data, dispatch, and reputation systems. The AI Growth Flywheel (the flagship offering) is the most proven configuration of this platform, purpose-built for service-industry businesses backed by private equity. But the underlying engine is industry-agnostic — it can be configured for any operational environment where agentic automation creates leverage.

### One-Line Purpose
Tier 4 Intelligence builds and permanently operates agentic AI systems that compound revenue and expand EBITDA — without adding headcount.

### Target Audience (Primary)
Private equity firms and their portfolio companies in the service industry vertical (HVAC, plumbing, electrical, garage door, roofing, pest control, and adjacent trades). Decision-makers are PE operating partners, portfolio company CEOs, and VP-level operations leaders at companies doing $5M–$50M in annual revenue. They are sophisticated buyers who respond to precision, data, and systems thinking — not hype.

### Target Audience (Secondary — addressed subtly, not featured)
Growth-stage businesses in any vertical that need intelligent automation infrastructure: logistics, healthcare operations, financial services, professional services. These visitors should find a clear signal that the door is open, but the page should NOT pivot to serve them equally — the flywheel is the star.

### Core Offering: The AI Growth Flywheel
This is NOT a bundle of disconnected AI tools. It is a **compounding system** where each stage amplifies every other stage. The flywheel metaphor is critical — each revolution makes the business harder to compete with and more valuable at exit.

The Growth Flywheel is powered by Tier 4's OpenClaw agentic platform and integrates natively with the client's **existing field service management platform** — ServiceTitan, Housecall Pro, Jobber, FieldEdge, or any system of record the company already runs. No rip-and-replace. The AI layers on top of their current infrastructure.

**Stage 1 — Programmatic SEO & AI-Enabled Web Presence**
Hundreds of hyper-local, high-intent landing pages generated at scale ("emergency plumber Alpharetta," "24/7 AC repair Roswell"). LLM.txt optimization for AI search engine visibility — ensuring the business is cited by AI-powered search tools, not just indexed by Google. Full website rebuild replacing the outdated single-page sites most service companies run. Goal: dominate local search results in every zip code served. Shift lead acquisition from $50/lead paid channels to $0/lead organic traffic.

**Stage 2 — AI Voice & Chat Agents (24/7 Customer Engagement)**
AI voice agents answer every inbound call — no voicemail, no missed calls, 24/7/365. Captures the 20–40% of calls that currently go unanswered, each representing $250–$350 in wasted marketing spend. AI chat agents on the website engage every visitor. A dedicated AI voice number is featured on every page. The agents qualify leads, schedule appointments, handle FAQs in natural conversation, and sync directly to the client's existing CRM/FSM platform. Strategic partner: RingCentral.

**Stage 3 — Lead Capture & Intelligent Scoring**
Every captured lead is qualified, scored, and followed up automatically. Speed-to-lead under 2 minutes. A 10-minute delay drops lead qualification rates by 400%. Rules-based scoring routes high-value emergency jobs to top-performing technicians immediately. Automated follow-up sequences for unsold estimates (the "estimate graveyard" — typically 60–70% of quotes never close).

**Stage 4 — Intelligent Dispatch & Route Optimization**
AI dispatch optimization integrates with the client's existing scheduling and routing platform. Reduces drive time by 10% across the fleet, increases technician utilization by 8–12%, and routes the highest-value calls to the best closers. Effectively adds "virtual trucks" to the fleet without hiring. Replaces the "Dispatcher Debbie" problem where critical ops knowledge lives in one person's head — the AI institutionalizes it.

**Stage 5 — Reputation Management & Review Automation**
Automated review requests triggered on job completion. AI routes happy customers to Google, unhappy customers to internal resolution. AI writes personalized review responses seeded with local SEO keywords. More reviews → higher local search ranking → more organic traffic → feeds back into Stage 1. This is where the flywheel closes the loop and begins compounding.

### Key Stats for the Site
- **+113% EBITDA** — Year 1 projection on $10M baseline
- **<6 Months** — Full implementation payback
- **4.0x+** — Portfolio MOIC over 3-year hold
- **90-Day Prove-It** — Full deployment sequence
- **95%+ Answer Rate** — AI voice agent coverage
- **$0/Lead Organic** — vs. $50/lead from Google LSAs

### CTA
**Primary:** "Book Implementation Planning Call"
**Secondary:** "See the Full Flywheel"

### Trust Signals
- **Tier 4 Advisors** strategic advisory partnership
- **RingCentral** strategic partner for AI Voice + Chat
- **Platform-agnostic** — integrates with ServiceTitan, Housecall Pro, Jobber, FieldEdge, and other field service platforms
- **OpenClaw** proprietary agentic orchestration platform
- **Fractional Chief Automation Officer** delivery model — executive-level operational rigor, not vendor sales
- SOC-2 aligned practices

---

## Selected Aesthetic: "Midnight Luxe" (Dark Editorial) — MODIFIED

### Why This Preset
PE operating partners live in a world of pitch decks, data rooms, and private equity club meetings. The dark editorial aesthetic communicates the same exclusivity, precision, and sophistication they expect from a six-figure engagement. A private operations center meets a precision engineering firm.

### Design Tokens

- **Identity:** A PE firm's private operations center — data-dense, dark, authoritative. Precision instruments for precision operators.
- **Palette:**
  - Navy Deep `#0B1426` (Primary / Hero Background)
  - Electric Blue `#2563EB` (Accent — CTAs, highlights, active states)
  - Champagne `#C9A84C` (Secondary Accent — premium touches, stat highlights)
  - Ivory `#FAF8F5` (Background for light sections)
  - Slate `#1A1F2E` (Card backgrounds, dark sections)
  - Ghost White `#F0F2F5` (Body text on dark)
  - Charcoal `#0F0F14` (Deepest background — footer)
- **Typography:**
  - Headings: `"Inter"` 700/800, tight tracking (-0.02em)
  - Drama / Hero Serif: `"Playfair Display"` Italic
  - Body: `"Inter"` 400, 1.7 line-height
  - Data / Monospace: `"JetBrains Mono"` — used for stats, stage labels, status indicators
- **Image Mood:** dark server rooms, fiber optic light trails, abstract data visualizations, dark glass architecture, control room interfaces, aerial night cityscapes. NO stock photos of handshakes, smiling businesspeople, or generic office scenes. Every image should feel like it belongs in a Bloomberg terminal or a PE war room.
- **Hero Line Pattern:**
  - Line 1: "Automation is the" — `Inter` Bold, uppercase tracking
  - Line 2: *"Multiplier."* — `Playfair Display` Italic, massive (5x size), Electric Blue

---

## Fixed Design System (NEVER CHANGE)

### Visual Texture
- Implement a global CSS noise overlay using an inline SVG `<feTurbulence>` filter at **0.05 opacity** to eliminate flat digital gradients.
- Use a `rounded-[2rem]` to `rounded-[3rem]` radius system for all containers. No sharp corners anywhere.

### Micro-Interactions
- All buttons must have a **"magnetic" feel**: subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Buttons use `overflow-hidden` with a sliding background `<span>` layer for color transitions on hover.
- Links and interactive elements get a `translateY(-1px)` lift on hover.

### Animation Lifecycle
- Use `gsap.context()` within `useEffect` for ALL animations. Return `ctx.revert()` in the cleanup function.
- Default easing: `power3.out` for entrances, `power2.inOut` for morphs.
- Stagger value: `0.08` for text, `0.15` for cards/containers.

---

## Component Architecture — SECTION BY SECTION

### A. NAVBAR — "The Floating Island"

A `fixed` pill-shaped container, horizontally centered.
- **Morphing Logic:** Transparent with Ghost White text at hero top. Transitions to `bg-[#0B1426]/70 backdrop-blur-xl` with a subtle `border border-white/10` when scrolled past the hero. Use `IntersectionObserver` or ScrollTrigger.
- **Logo:** "TIER 4" in `Inter` 800 weight + "INTELLIGENCE" in `Inter` 400, letterspaced. All caps. Electric Blue accent on the "4".
- **Nav Links:** The Flywheel · How It Works · Platform · Contact
- **CTA Button:** "Book a Call" — Electric Blue background, Navy text, magnetic hover effect.

---

### B. HERO SECTION — "The Opening Shot"

`100dvh` height. The most important 5 seconds of the entire site.

- **Background:** Full-bleed Unsplash image (dark server room with blue fiber optic traces, or aerial night cityscape with data overlay feel). Heavy gradient overlay: `bg-gradient-to-t from-[#0B1426] via-[#0B1426]/80 to-transparent`.
- **Layout:** Content pushed to the **bottom-left third** using flex + generous padding (`pl-[8%] pb-[12%]`).
- **Typography Stack:**
  1. Eyebrow: `"JetBrains Mono"` — "AGENTIC AUTOMATION FOR GROWTH-STAGE BUSINESSES" — small, uppercase, letterspaced, Champagne colored. With a pulsing dot indicator before it.
  2. Headline Part 1: "Automation is the" — `Inter` 800, white, large
  3. Headline Part 2: *"Multiplier."* — `Playfair Display` Italic, Electric Blue, 3–5x size of Part 1
  4. Subheadline: "We design, build, and permanently operate intelligent AI systems that compound your revenue and expand your EBITDA — without adding headcount." — `Inter` 400, Ghost White, max-width ~600px
  5. CTA: "Book Implementation Planning Call →" — Electric Blue button, large, magnetic hover
- **Animation:** GSAP staggered `fade-up` (y: 40 → 0, opacity: 0 → 1) on each element sequentially. Delay 0.2s between each. Total entrance ~1.5s.
- **Floating Stat Chips:** Three small pill-shaped elements floating on the right side of the hero (visible on desktop):
  - `+113% EBITDA` — JetBrains Mono, Champagne border
  - `<6mo Payback` — JetBrains Mono, Electric Blue border
  - `4.0x+ MOIC` — JetBrains Mono, Champagne border
  - These fade-in with a slight delay after the main headline loads.

---

### C. IDENTITY SECTION — "What We Are"

Short, powerful section immediately below the hero that establishes the automation company identity before diving into the flywheel. Light section (`bg-[#FAF8F5]`).

**Layout:** Centered text block, max-width 800px.

- **Heading:** "We're not consultants. We're not advisors." — Inter 400, muted
- **Follow-up:** "We're an automation company." — Inter 800, large, dark
- **Body paragraph:** "Tier 4 Intelligence builds and permanently operates agentic AI systems — autonomous agents that handle voice, web, data, dispatch, and reputation around the clock. Our proprietary OpenClaw platform orchestrates multi-agent swarms that integrate with your existing infrastructure. No rip-and-replace. No 300-page strategy decks. Working systems that run while you sleep."
- **Three identity pills** in a horizontal row below the paragraph (small, outlined, rounded-full):
  - "Agentic Systems" · "Permanent Operations" · "Platform-Agnostic"

**Animation:** Fade-up on scroll into view.

---

### D. FLYWHEEL SECTION — "The System" ★ MOST IMPORTANT SECTION ★

This is the intellectual centerpiece of the entire site and must feel like looking at a precision-engineered machine.

**Section intro:** Dark section (`bg-[#1A1F2E]`).
- Eyebrow: JetBrains Mono, Champagne — "FLAGSHIP OFFERING"
- Title: "The AI Growth Flywheel" — Inter 800, large, white
- Subtitle: "Five stages. One compounding system. Purpose-built for PE-backed service businesses. Powered by OpenClaw." — Inter 400, Ghost White 70%
- Secondary note: "Integrates with ServiceTitan, Housecall Pro, Jobber, FieldEdge, and other field service platforms." — JetBrains Mono, small, muted, with subtle platform-logo-style treatment if possible

**The Flywheel Visualization — Interactive Circular Diagram:**
Build a large, animated circular/ring flywheel diagram in the center of the section using SVG + GSAP.

- 5 segments arranged in a circle, connected by animated arrows/flow lines showing the compounding loop
- Each segment represents one stage and has an icon (Lucide), label, and one-line description
- **Interaction:** On hover/click of a segment, the ring highlights that segment in Electric Blue, dims the others, and a detail panel slides in from the side (or expands below on mobile) showing:
  - Stage name and number
  - 2-sentence description
  - Key metric (in JetBrains Mono, Champagne)
  - The connection to the next stage ("This feeds into...")
- A subtle continuous rotation animation on the ring (very slow, 60s per revolution) to reinforce the "flywheel in motion" metaphor. Pauses on hover.
- Center of the ring: "EBITDA +" with a counting animation that ticks up (like a compound interest counter)

**The 5 Segments (clockwise):**

1. **SEO Engine** — Icon: `Globe` — "500–2,000+ hyper-local pages. LLM.txt optimized. $0/lead organic traffic." — Metric: "70% reduction in cost-per-lead"
2. **AI Agents** — Icon: `Phone` — "24/7 voice + chat. 95%+ answer rate. Zero missed revenue." — Metric: "$250–$350 saved per recovered call"
3. **Lead Scoring** — Icon: `Zap` — "Under 2-minute response. Intelligent qualification & routing." — Metric: "400% improvement in lead qualification"
4. **Smart Dispatch** — Icon: `Route` — "AI-optimized routing. Best tech to best job. Every time." — Metric: "10% drive time reduction, +12% ticket size"
5. **Review Engine** — Icon: `Star` — "Automated requests. Sentiment routing. SEO keyword seeding." — Metric: "Feeds back into Stage 1 → compounds"

**Below the Flywheel — Three Stat Blocks:**
Horizontal row of three large stat cards with JetBrains Mono numbers and Inter labels:
- `+113%` / "EBITDA Expansion, Year 1" / "$10M baseline → $3.2M EBITDA"
- `< 6 mo` / "Full Payback Period" / "Implementation cost recovered"
- `4.0x+` / "Portfolio MOIC" / "3-year hold, 5+ companies"

Each stat animates with a counting-up effect on scroll-into-view.

---

### E. STAGE DEEP-DIVES — "Sticky Stacking Archive"

5 full-screen cards that stack on scroll.

- **Stacking Interaction:** Using GSAP ScrollTrigger with `pin: true`. As a new card scrolls into view, the card underneath scales to `0.92`, blurs to `16px`, and fades to `0.4`.
- Each card: `bg-[#1A1F2E]` with subtle `border border-white/5`, `rounded-[3rem]`, full viewport height.

**Card 1 — Stage 1: Programmatic SEO**
- Left side: Stage number "01" in massive JetBrains Mono (120px+, Champagne, 10% opacity behind), title "Programmatic SEO & AI Web Presence" in Inter Bold, description paragraph
- Right side: **Animated micro-UI** — A simulated search results panel showing local search results appearing one by one. Three business listings with star ratings, "Ad" badges on the top two (red/faded), then the client's organic listing sliding in with a green "Organic" badge and glowing highlight. The organic listing pushes to position #1. JetBrains Mono "$0/lead" label appears beside it.
- Key copy: "500–2,000+ hyper-local pages auto-generated on your existing domain. LLM.txt optimization ensures your business is cited by AI search engines — not just indexed by Google. Shifts your lead mix from 50%+ paid to 30% organic — permanently."

**Card 2 — Stage 2: AI Voice & Chat Agents**
- Right side: **Animated micro-UI** — "Telemetry Typewriter" style. A simulated live feed showing:
  ```
  [11:47 PM] Inbound call — Alpharetta, GA
  [11:47 PM] AI Agent answered in 0.8s
  [11:47 PM] Intent: Emergency HVAC repair
  [11:47 PM] Appointment booked: Tomorrow 8AM
  [11:47 PM] CRM ticket created ✓
  [11:48 PM] SMS confirmation sent to homeowner ✓
  ```
  Lines type out character by character with a blinking Electric Blue cursor. "LIVE" label with pulsing green dot in the corner.
- Key copy: "Every call answered. Every chat engaged. Every after-hours lead captured. Our AI agents speak naturally, qualify leads, book appointments, and sync directly to your existing field service platform — 24/7/365. No missed revenue. No voicemail. No excuses."

**Card 3 — Stage 3: Lead Scoring & Follow-Up**
- Right side: **Animated micro-UI** — A lead card that slides in showing: Customer name, service requested, estimated job value, urgency score (animated gauge filling to "HIGH" in Electric Blue). Then a routing animation: the lead card "flies" to a technician avatar labeled "Top Closer — 94% close rate". Timer in corner counts "0:00 → 1:47" showing speed-to-lead.
- Key copy: "A 10-minute delay drops qualification by 400%. Our system responds in under 2 minutes. Every lead scored, prioritized, and routed to the right technician — automatically. The 'estimate graveyard' (60–70% of quotes that never close) gets automated follow-up sequences that recover revenue you already paid to acquire."

**Card 4 — Stage 4: Intelligent Dispatch**
- Right side: **Animated micro-UI** — A simplified map/grid with dots representing trucks. An animated SVG shows routes optimizing in real-time — lines redrawing shorter, dots rearranging. A metric panel shows: "Drive Time: 47min → 38min ✓" and "Utilization: 71% → 83% ✓" with counting animations.
- Key copy: "AI dispatch reads every job, every technician's skill profile, every route — and makes the optimal match instantly. Integrates with your existing dispatch platform. 10% reduction in drive time. 8–12% increase in utilization and average ticket. Adds 'virtual trucks' to your fleet without a single hire."

**Card 5 — Stage 5: Reputation & Reviews**
- Right side: **Animated micro-UI** — A simulated review card appearing: 5 stars filling in one by one (gold/Champagne), review text typing out, then a local search ranking meter that ticks up from #4 to #1. An arrow curves from the review card back to "Stage 1 — SEO" with a "Loop Complete" label, reinforcing the flywheel.
- Key copy: "Every completed job triggers an automated review request. Happy customers are routed to Google. Unhappy customers are intercepted for resolution before they go public. AI writes personalized responses seeded with local SEO keywords. More reviews → higher rankings → more organic leads → the flywheel accelerates."

---

### F. PHILOSOPHY — "The Manifesto"

Full-width section, `bg-[#0B1426]` background.

- **Typography pattern:**
  - Line 1 (neutral, smaller, Inter 400, Ghost White 60%): "Most AI vendors sell you tools."
  - Line 2 (neutral, smaller): "A chatbot here. A voice agent there. Disconnected. Additive."
  - Line 3 (massive, Playfair Display Italic, Ghost White): "We build the"
  - Line 4 (massive, Playfair Display Italic, **Electric Blue**): *"compounding machine."*
  - Line 5 (neutral, smaller, after a gap): "One system. Five stages. Each revolution makes the next one stronger. That's not a tool — that's a flywheel."

- **Animation:** Word-by-word or line-by-line fade-up triggered by ScrollTrigger. The Electric Blue word should have a subtle glow animation (`text-shadow` pulse).

- **Background:** Subtle parallaxing texture — abstract dark data visualization or fiber optic pattern at 8% opacity.

---

### G. SOCIAL PROOF / TRUST — "The Credibility Stack"

Light section (`bg-[#FAF8F5]`). Establishes credibility through partnerships, methodology, and operational rigor.

**Layout:** Three trust blocks:

1. **Partnership & Integration Row:** RingCentral partner badge, "Integrates with ServiceTitan, Housecall Pro, Jobber, FieldEdge & more" in a clean horizontal strip. Grayscale, subtle hover-to-color effect.

2. **"The 90-Day Prove-It" Timeline:** A horizontal scrolling timeline (or step progression) showing:
   - Days 1–15: "Data Foundation Audit" — Audit and clean your existing systems
   - Days 15–45: "Stage 1 + 2 Live" — SEO pages deployed, AI agents answering calls
   - Days 45–75: "Stage 3 + 4 Live" — Lead scoring and dispatch optimization active
   - Days 75–90: "Stage 5 + Full Loop" — Reviews flowing, flywheel spinning
   - Day 90+: "Permanent Managed Operations" — We run it. You measure EBITDA.
   Use JetBrains Mono for day labels. Electric Blue progress bar animating on scroll.

3. **Operational Rigor Block:**
   - "Led by a commercial airline captain who thinks in checklists, redundancy, and systems — the same operational discipline now applied to building AI infrastructure."
   - This signals the process rigor that PE operators respect. Aviation background = no cowboy engineering.

---

### H. BEYOND HOME SERVICES — "The Signal" ★ SUBTLE, NOT FEATURED ★

This section is **one short block**. It does NOT get its own feature cards. It does NOT have a separate CTA. It exists purely as a signal that Tier 4's capabilities extend beyond the flywheel — so that visitors from other verticals have a thread to pull on, and PE firms with diverse portfolios know the platform scales.

**Layout:** Narrow dark band (`bg-[#1A1F2E]`), centered text, no more than 5-6 lines total.

- **Heading:** "Beyond Home Services" — Inter 700, white, moderate size (NOT as large as other section headings — this is intentionally understated)
- **Body:** "The Growth Flywheel is our most proven configuration — but the OpenClaw agentic platform underneath it isn't limited to one industry. The same autonomous agent infrastructure powers automation systems across logistics, healthcare operations, financial services, and professional services. If your portfolio extends beyond home services, we extend with it."
- **No CTA button.** Just a simple text link: "Talk to us about your vertical →" linking to the contact/booking section.
- **No cards, no feature lists, no icons.** Keep it sparse and confident. The restraint IS the message — "we don't need to sell you on this; it's obvious."

---

### I. CTA SECTION — "The Close"

Full-width dark section (`bg-[#0B1426]`). No pricing displayed — engagements start at $15K/month per company, which is a sales conversation, not a checkout page.

- **Headline:** "Your portfolio's next $10M in EBITDA is already sitting in missed calls, unscored leads, and unoptimized routes." — Inter Bold, large.
- **Subheadline:** "Let's find it. 30-minute call. No deck. Just your data and our system." — Inter 400, Ghost White 70%.
- **Single massive CTA button:** "Book Implementation Planning Call →" — Electric Blue, full magnetic hover effect, centered, generous padding.
- **Below CTA (small, JetBrains Mono, muted):** "Or email directly: matt@tier4intelligence.com"
- **Three micro-stats** flanking the CTA or below it:
  - "90-day deployment"
  - "Managed 24/7"
  - "PE-grade reporting"

---

### J. FOOTER

- `bg-[#0F0F14]`, `rounded-t-[4rem]`.
- **Grid Layout:**
  - Column 1: "TIER 4 INTELLIGENCE" logo treatment, tagline "Agentic Automation for Growth-Stage Businesses"
  - Column 2: Nav links — The Flywheel, How It Works, Platform, Contact
  - Column 3: Contact — matt@tier4intelligence.com, LinkedIn link
  - Column 4: Legal — Privacy, Terms
- **"System Operational" indicator:** Pulsing green dot + "Agents Active" in JetBrains Mono, bottom left. Reinforces that Tier 4 runs systems 24/7.
- **Bottom bar:** "© 2026 Tier 4 Intelligence. Alpharetta, GA." in muted small text.

---

## Technical Requirements (NEVER CHANGE)

- **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 (with ScrollTrigger plugin), Lucide React for icons.
- **Fonts:** Load via Google Fonts `<link>` tags in `index.html`: Inter (400, 700, 800), Playfair Display (Italic), JetBrains Mono (400).
- **Images:** Use real Unsplash URLs. Search keywords: dark server room, fiber optic blue, abstract data visualization, dark glass architecture, aerial night city, control room. **NEVER** use stock photos of handshakes, smiling people, or generic office scenes.
- **File structure:** Single `App.jsx` with components defined in the same file (or split into `components/` if >600 lines). Single `index.css` for Tailwind directives + noise overlay + custom utilities.
- **No placeholders.** Every card, every label, every animation, every micro-UI must be fully implemented and functional.
- **Responsive:** Mobile-first. Stack cards vertically on mobile. Reduce hero font sizes. Collapse navbar into hamburger. Flywheel diagram becomes a vertical list on mobile with tap-to-expand cards.

---

## Build Sequence

You have everything you need. Execute in this order:

1. **Scaffold:** `npm create vite@latest`, install React, Tailwind, GSAP, Lucide React.
2. **Fonts & Base:** Set up Google Fonts links, noise overlay CSS, Tailwind config with custom colors.
3. **Navbar:** Floating island with scroll morph behavior.
4. **Hero:** Full-bleed dark hero with the typography stack, stat chips, and entrance animations.
5. **Identity Section:** "We're an automation company" — short, powerful, sets the frame before the flywheel.
6. **Flywheel Section:** Interactive circular diagram with hover/click detail panels. Stat blocks below.
7. **Stage Deep-Dives:** 5 sticky-stacking full-screen cards with unique animated micro-UIs for each stage.
8. **Philosophy/Manifesto:** Dark section with the contrast typography and word-by-word reveal.
9. **Trust/Social Proof:** Partnership logos, 90-day timeline, operational rigor block.
10. **Beyond Home Services:** Single understated paragraph. No cards. Confident restraint.
11. **CTA Section:** The close. Single massive button. No pricing.
12. **Footer:** Dark, rounded top, "Agents Active" indicator.
13. **Polish:** Ensure every animation is wired, every interaction works, every image loads. Test responsive. Test scroll performance.

---

## Content Reference — Exact Phrases

### Headline Options (pick the best or combine):
- "Automation is the *Multiplier.*"
- "The AI Growth Flywheel for Service Businesses"
- "Your EBITDA, *Compounded.*"
- "Five Stages. One System. *Compounding Returns.*"

### Subheadline:
"We design, build, and permanently operate intelligent AI systems that compound your revenue and expand your EBITDA — without adding headcount."

### Identity Statement:
"Tier 4 Intelligence is an automation company. We build and permanently operate agentic AI systems — autonomous agents that handle voice, web, data, dispatch, and reputation around the clock."

### Philosophy Contrast:
- "Most AI vendors sell tools. We build the compounding machine."

### Platform Language (USE THIS — never say "built on ServiceTitan" exclusively):
- "Integrates with your existing field service platform — ServiceTitan, Housecall Pro, Jobber, FieldEdge, and others."
- "Layers on top of your current infrastructure. No rip-and-replace."

### Stage Descriptions (short form for cards/tooltips):
1. SEO Engine → "Dominate every zip code. $0/lead organic traffic at scale."
2. AI Agents → "Every call answered. Every chat engaged. 24/7/365."
3. Lead Scoring → "Under 2 minutes. Scored, qualified, routed. Automatically."
4. Smart Dispatch → "Right tech, right job, right route. Every time."
5. Review Engine → "More stars → more rankings → more leads → the loop closes."

### Beyond Home Services (exact copy):
"The Growth Flywheel is our most proven configuration — but the OpenClaw agentic platform underneath it isn't limited to one industry. The same autonomous agent infrastructure powers automation systems across logistics, healthcare operations, financial services, and professional services. If your portfolio extends beyond home services, we extend with it."

---

## Execution Directive

"Do not build a website; build a digital instrument. This site will be the first thing a PE operating partner sees before a six-figure engagement conversation. Every scroll should feel like precision. Every animation should feel like machinery. Every section should build the case that this is an automation company operating at a level the prospect hasn't seen from an AI vendor before. The specificity of the flywheel is the premium — don't dilute it. The breadth of the platform is the confidence — don't oversell it. Eradicate all generic AI patterns. Build it like Bloomberg designed a landing page for the future of private equity operations."