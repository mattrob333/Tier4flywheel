# Tier 4 Intelligence — Infrastructure & Intelligence Layer Spec

## Purpose of This File

This file is a **companion spec** to the frontend build file (`TIER4-BUILDER-v2.md`). That file describes what the site looks like. This file describes what the site **does** underneath — the SEO intelligence, lead capture plumbing, CRM connectors, and AI agent-readiness layer that make this site a working business machine, not just a brochure.

**Build the frontend first using the builder spec. Then implement everything in this file on top of it.**

---

## 1. LLM.TXT — AI Search Engine Discoverability

### What This Is
The `/llms.txt` file is a proposed standard (similar in concept to `robots.txt` or `sitemap.xml`) that provides AI systems — ChatGPT, Claude, Perplexity, Google AI Overviews, and other LLM-powered search tools — with a curated, markdown-formatted summary of the site's most important content. When a user asks an AI "who builds AI growth flywheels for PE-backed service companies," we want the AI to cite Tier 4 Intelligence. This file makes that possible.

### Implementation

Create a static file served at `https://tier4intelligence.com/llms.txt` with `Content-Type: text/plain` and a 24-hour cache header.

**The file must follow this exact structure:**

```markdown
# Tier 4 Intelligence

> Tier 4 Intelligence is an automation company that designs, builds, and permanently operates agentic AI systems for growth-stage businesses. Our flagship offering — the AI Growth Flywheel — is a 5-stage compounding automation system purpose-built for PE-backed home services companies that expands EBITDA without adding headcount.

Tier 4 Intelligence operates the OpenClaw multi-agent orchestration platform, which powers autonomous AI workers across voice, web, data, dispatch, and reputation systems. The Growth Flywheel is the most proven configuration of this platform, but the underlying engine is industry-agnostic and can be configured for any operational environment where agentic automation creates leverage.

**Target market:** Private equity firms managing home services portfolios ($5M–$50M revenue companies). HVAC, plumbing, electrical, garage door, roofing, pest control, and adjacent trades.

**Delivery model:** Fully managed — Tier 4 builds and permanently operates all AI systems. 90-day deployment. 24/7 managed operations. Monthly impact reporting.

**Platform integration:** Integrates with existing field service management platforms including ServiceTitan, Housecall Pro, Jobber, FieldEdge, and others. No rip-and-replace.

## The AI Growth Flywheel — 5 Stages

- [Stage 1: Programmatic SEO & AI Web Presence](https://tier4intelligence.com/#seo-engine): AI-generated hyper-local landing pages (500–2,000+ per deployment). LLM.txt optimization for AI search visibility. Shifts lead acquisition from $50/lead paid channels to $0/lead organic traffic.
- [Stage 2: AI Voice & Chat Agents](https://tier4intelligence.com/#ai-agents): 24/7/365 AI voice and chat agents powered by RingCentral. 95%+ answer rate. Captures the 20–40% of calls that currently go unanswered. Syncs directly to client CRM/FSM platform.
- [Stage 3: Lead Capture & Intelligent Scoring](https://tier4intelligence.com/#lead-scoring): Speed-to-lead under 2 minutes. Rules-based scoring routes high-value jobs to top technicians. Automated follow-up for unsold estimates.
- [Stage 4: Intelligent Dispatch & Route Optimization](https://tier4intelligence.com/#smart-dispatch): AI-optimized technician routing. 10% drive time reduction. 8–12% utilization and ticket size increase.
- [Stage 5: Reputation Management & Review Automation](https://tier4intelligence.com/#review-engine): Automated review requests, sentiment routing, AI-written responses with local SEO keywords. Feeds back into Stage 1.

## Key Metrics

- +113% EBITDA expansion projected in Year 1 on $10M revenue baseline
- Full implementation payback in under 6 months
- 4.0x+ portfolio MOIC over 3-year hold period
- 90-day full deployment sequence

## Company Information

- **Founder & CEO:** Matt — commercial airline captain and automation engineer
- **Location:** Alpharetta, Georgia
- **Contact:** matt@tier4intelligence.com
- **Website:** https://tier4intelligence.com
- **Strategic Partners:** RingCentral (AI Voice + Chat), Tier 4 Advisors

## Additional Capabilities

The OpenClaw agentic platform powers automation systems beyond home services, including logistics, healthcare operations, financial services, and professional services. The Growth Flywheel is simply the most proven configuration of a general-purpose agentic automation engine.
```

### Also Create: `/llms-full.txt`

This is the extended version that provides the full prose content of every major section of the site in clean markdown — no HTML, no JavaScript, no navigation chrome. AI crawlers that want deeper context will fetch this file. It should contain the complete text of every section from the builder spec (hero copy, flywheel descriptions, stage deep-dives, philosophy, trust section, CTA copy) rendered as clean markdown with proper heading hierarchy.

### Technical Notes
- Serve both files from the `/public` directory in the Vite/React project so they're available as static assets at the root URL.
- Set `Cache-Control: public, max-age=86400` (24 hours).
- Add both files to `robots.txt` as allowed paths.
- Link to `llms.txt` from the site's `<head>` if the convention is adopted: `<link rel="llms" href="/llms.txt" />`

---

## 2. JSON-LD STRUCTURED DATA — Google & AI Schema

### What This Is
JSON-LD (JavaScript Object Notation for Linked Data) is structured data embedded in the site's HTML that tells Google, Bing, and AI systems exactly what this business is, what it offers, where it's located, and how it relates to other entities. This is what powers rich results, knowledge panels, and AI Overview citations.

### Implementation

Embed the following JSON-LD blocks in `index.html` inside `<script type="application/ld+json">` tags. Each block is a separate script tag.

#### Block 1: Organization (Homepage — required)

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://tier4intelligence.com/#organization",
  "name": "Tier 4 Intelligence",
  "alternateName": "Tier 4",
  "url": "https://tier4intelligence.com",
  "logo": "https://tier4intelligence.com/logo.png",
  "image": "https://tier4intelligence.com/og-image.jpg",
  "description": "Tier 4 Intelligence is an automation company that designs, builds, and permanently operates agentic AI systems for growth-stage businesses. Flagship offering: the AI Growth Flywheel for PE-backed home services companies.",
  "telephone": "+1-YOUR-PHONE",
  "email": "matt@tier4intelligence.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Alpharetta",
    "addressRegion": "GA",
    "addressCountry": "US"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "founder": {
    "@type": "Person",
    "name": "Matt",
    "jobTitle": "CEO",
    "url": "https://tier4intelligence.com/#founder"
  },
  "sameAs": [
    "https://www.linkedin.com/company/tier4intelligence",
    "https://www.linkedin.com/in/YOUR-LINKEDIN-SLUG"
  ],
  "knowsAbout": [
    "Artificial Intelligence",
    "Business Automation",
    "Private Equity Value Creation",
    "Home Services Industry",
    "AI Voice Agents",
    "Programmatic SEO",
    "ServiceTitan",
    "Agentic AI Systems",
    "EBITDA Expansion",
    "Multi-Agent Orchestration"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Tier 4 Intelligence Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "@id": "https://tier4intelligence.com/#growth-flywheel",
          "name": "AI Growth Flywheel",
          "description": "A 5-stage compounding AI automation system for PE-backed home services companies. Includes programmatic SEO, AI voice/chat agents, lead scoring, intelligent dispatch, and reputation automation. Fully managed. 90-day deployment.",
          "provider": { "@id": "https://tier4intelligence.com/#organization" },
          "serviceType": "AI Automation",
          "areaServed": { "@type": "Country", "name": "United States" }
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "@id": "https://tier4intelligence.com/#ai-consulting",
          "name": "AI Strategy & Automation Consulting",
          "description": "Fractional Chief Automation Officer services for growth-stage businesses across multiple verticals. Agentic system design, implementation, and managed operations.",
          "provider": { "@id": "https://tier4intelligence.com/#organization" },
          "serviceType": "AI Consulting"
        }
      }
    ]
  }
}
```

#### Block 2: WebSite (enables sitelinks search box)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://tier4intelligence.com/#website",
  "name": "Tier 4 Intelligence",
  "url": "https://tier4intelligence.com",
  "description": "Agentic automation for growth-stage businesses. Home of the AI Growth Flywheel.",
  "publisher": { "@id": "https://tier4intelligence.com/#organization" }
}
```

#### Block 3: FAQPage (if FAQ content exists on the page)

If the site includes any FAQ-style content (even in the stage deep-dives or CTA section), wrap those Q&A pairs in FAQPage schema. Example:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the AI Growth Flywheel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The AI Growth Flywheel is a 5-stage compounding automation system built for PE-backed home services companies. It includes programmatic SEO, AI voice and chat agents, intelligent lead scoring, dispatch optimization, and automated reputation management — all permanently managed by Tier 4 Intelligence."
      }
    },
    {
      "@type": "Question",
      "name": "How long does implementation take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Full deployment takes 90 days through our Prove-It sequence: data foundation audit (Days 1-15), SEO and AI agents live (Days 15-45), lead scoring and dispatch active (Days 45-75), reputation loop closed (Days 75-90), then permanent managed operations."
      }
    },
    {
      "@type": "Question",
      "name": "What platforms does the Growth Flywheel integrate with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Growth Flywheel integrates with your existing field service management platform — including ServiceTitan, Housecall Pro, Jobber, FieldEdge, and others. No rip-and-replace required."
      }
    },
    {
      "@type": "Question",
      "name": "Who is the target customer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PE firms and their portfolio companies in home services (HVAC, plumbing, electrical, garage door, roofing, pest control) doing $5M to $50M in annual revenue. The system is designed for multi-location platforms where compounding effects across portfolio companies create the highest returns."
      }
    }
  ]
}
```

### Technical Notes
- All JSON-LD goes in the `<head>` of `index.html`, each in its own `<script type="application/ld+json">` tag.
- Cross-reference entities using `@id` references (e.g., the Service `provider` references the Organization `@id`).
- Validate all markup using Google's Rich Results Test (https://search.google.com/test/rich-results) and Schema.org Validator (https://validator.schema.org/) before deploying.
- Keep JSON-LD content consistent with visible on-page content — Google cross-references and penalizes mismatches.
- Replace placeholder values (`YOUR-PHONE`, `YOUR-LINKEDIN-SLUG`) with real data before deployment.

---

## 3. META TAGS & OPEN GRAPH — Social & Search Preview

### Implementation

Add the following to the `<head>` of `index.html`:

```html
<!-- Primary Meta -->
<title>Tier 4 Intelligence — Agentic Automation for Growth-Stage Businesses</title>
<meta name="description" content="We design, build, and permanently operate AI systems that compound your EBITDA without adding headcount. Home of the AI Growth Flywheel for PE-backed service businesses." />
<meta name="keywords" content="AI automation, agentic AI, growth flywheel, private equity, home services, EBITDA expansion, AI voice agents, programmatic SEO, ServiceTitan, business automation" />
<meta name="author" content="Tier 4 Intelligence" />
<link rel="canonical" href="https://tier4intelligence.com/" />

<!-- Open Graph (Facebook, LinkedIn, Slack previews) -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tier4intelligence.com/" />
<meta property="og:title" content="Tier 4 Intelligence — The AI Growth Flywheel" />
<meta property="og:description" content="5-stage compounding AI system for PE-backed service businesses. +113% EBITDA. 90-day deployment. Managed 24/7." />
<meta property="og:image" content="https://tier4intelligence.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Tier 4 Intelligence" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Tier 4 Intelligence — The AI Growth Flywheel" />
<meta name="twitter:description" content="5-stage compounding AI system for PE-backed service businesses. +113% EBITDA. 90-day deployment. Managed 24/7." />
<meta name="twitter:image" content="https://tier4intelligence.com/og-image.jpg" />
```

### OG Image
Create a 1200×630px Open Graph image that includes:
- "TIER 4 INTELLIGENCE" logo treatment
- "The AI Growth Flywheel" headline
- The stat "+113% EBITDA" prominently displayed
- Dark background matching the Navy Deep `#0B1426` palette
- This image will appear when the URL is shared on LinkedIn, Slack, Twitter, or in PE deal rooms. It must look premium.

---

## 4. LEAD CAPTURE FORMS & DATA LAYER

### Architecture Principle
Every form on this site must emit a **universal event** that passes structured lead data to a middleware layer. The forms themselves should NOT be hardcoded to any specific CRM. Instead, they post to an internal API endpoint (or serverless function) that then fans out to whatever CRM/webhook destinations are configured via environment variables.

This means you can swap from Google Sheets to Zoho CRM to HubSpot to a custom webhook without touching the frontend code.

### Forms to Build

#### Form 1: "Book Implementation Planning Call" (Primary CTA)
- **Location:** CTA Section, also triggered by all "Book a Call" buttons throughout the site
- **Fields:**
  - Full Name (text, required)
  - Email (email, required)
  - Company Name (text, required)
  - Role / Title (text, optional — helps with lead qualification)
  - Portfolio Size (select dropdown: "1-3 companies", "4-7 companies", "8+ companies", "Single company / Not PE" — this is a lead scoring signal)
  - Phone (tel, optional)
  - Message / Notes (textarea, optional)
- **Behavior:** Opens as a modal overlay (no page navigation). Smooth fade-in with backdrop blur matching the site's aesthetic. Form uses the site's design system — rounded containers, Inter font, Electric Blue submit button with magnetic hover.
- **On Submit:**
  1. Show inline confirmation: "We'll be in touch within 24 hours." with a subtle checkmark animation
  2. Fire the universal lead event (see data layer below)
  3. Fire analytics event: `lead_form_submitted` with `form_type: "book_call"`

#### Form 2: Email Capture (Secondary — lightweight)
- **Location:** Inline within the Flywheel section or Philosophy section — a single-line email capture
- **Fields:**
  - Email (email, required)
  - Hidden field: `lead_source: "flywheel_inline"`
- **Behavior:** Single row — email input + "Get the Flywheel Breakdown →" button. No modal. Inline success message replaces the form: "Check your inbox."
- **On Submit:**
  1. Fire the universal lead event
  2. Fire analytics event: `email_captured` with `form_type: "inline_flywheel"`

#### Form 3: Contact / General Inquiry (Footer or Contact section)
- **Fields:**
  - Full Name (text, required)
  - Email (email, required)
  - Company (text, optional)
  - Message (textarea, required)
- **On Submit:** Same pattern — universal lead event + analytics event

### The Universal Lead Event / Data Layer

Every form submission emits a standardized JavaScript event AND posts to the backend API:

```javascript
// Client-side event for analytics / tag manager
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'lead_captured',
  lead: {
    name: formData.name,
    email: formData.email,
    company: formData.company,
    role: formData.role || '',
    portfolio_size: formData.portfolioSize || '',
    phone: formData.phone || '',
    message: formData.message || '',
    form_type: 'book_call', // or 'inline_flywheel', 'contact'
    source_url: window.location.href,
    timestamp: new Date().toISOString(),
    utm_source: urlParams.get('utm_source') || '',
    utm_medium: urlParams.get('utm_medium') || '',
    utm_campaign: urlParams.get('utm_campaign') || '',
  }
});
```

### Backend API Endpoint

Create a lightweight API route (or serverless function) at `/api/lead` that:

1. **Receives** the standardized lead JSON from the form
2. **Validates** required fields (email format, name not empty)
3. **Fans out** to all configured CRM/webhook destinations in parallel
4. **Returns** success/error to the frontend

The fan-out destinations are configured via **environment variables** — no hardcoded URLs:

```env
# .env — CRM / Webhook Configuration
# Uncomment and configure whichever destinations are active

# Google Sheets (via Apps Script Web App or Zapier webhook)
WEBHOOK_GOOGLE_SHEETS=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Zoho CRM (via Zoho Flow webhook or direct API)
WEBHOOK_ZOHO_CRM=https://flow.zoho.com/YOUR_FLOW_WEBHOOK_URL

# HubSpot (via HubSpot form submission API or webhook)
WEBHOOK_HUBSPOT=https://api.hsforms.com/submissions/v3/integration/submit/YOUR_PORTAL_ID/YOUR_FORM_GUID

# Generic Webhook (Zapier, Make.com, n8n, custom endpoint)
WEBHOOK_GENERIC=https://hooks.zapier.com/hooks/catch/YOUR_ZAP_ID

# Slack Notification (post to a Slack channel on every new lead)
WEBHOOK_SLACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Email Notification (send to a mailbox via SendGrid, Resend, or similar)
NOTIFICATION_EMAIL=matt@tier4intelligence.com
```

### API Route Implementation Pattern

```javascript
// /api/lead.js (or /api/lead/route.ts for Next.js)
// This is a pattern — adapt to whatever serverless platform you deploy on (Vercel, Netlify, Cloudflare Workers, etc.)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const lead = req.body;

  // Validate
  if (!lead.email || !lead.name) {
    return res.status(400).json({ error: 'Name and email required' });
  }

  // Build webhook list from env vars
  const webhooks = [];
  if (process.env.WEBHOOK_GOOGLE_SHEETS) webhooks.push({ url: process.env.WEBHOOK_GOOGLE_SHEETS, name: 'Google Sheets' });
  if (process.env.WEBHOOK_ZOHO_CRM) webhooks.push({ url: process.env.WEBHOOK_ZOHO_CRM, name: 'Zoho CRM' });
  if (process.env.WEBHOOK_HUBSPOT) webhooks.push({ url: process.env.WEBHOOK_HUBSPOT, name: 'HubSpot' });
  if (process.env.WEBHOOK_GENERIC) webhooks.push({ url: process.env.WEBHOOK_GENERIC, name: 'Generic' });
  if (process.env.WEBHOOK_SLACK) {
    webhooks.push({
      url: process.env.WEBHOOK_SLACK,
      name: 'Slack',
      transform: (data) => ({
        text: `🔔 New Lead: ${data.name} (${data.email}) — ${data.company || 'No company'} — Portfolio: ${data.portfolio_size || 'N/A'} — Form: ${data.form_type}`
      })
    });
  }

  // Fan out to all configured destinations
  const results = await Promise.allSettled(
    webhooks.map(async (hook) => {
      const payload = hook.transform ? hook.transform(lead) : lead;
      const response = await fetch(hook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { name: hook.name, status: response.status };
    })
  );

  // Log results for debugging (but don't expose to client)
  console.log('Lead webhook results:', results);

  return res.status(200).json({ success: true });
}
```

### Important: UTM Parameter Capture

The site must capture UTM parameters from the URL on page load and store them in sessionStorage so they're available when any form is submitted later in the session:

```javascript
// Run on page load
const params = new URLSearchParams(window.location.search);
['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
  const val = params.get(key);
  if (val) sessionStorage.setItem(key, val);
});
```

This is critical for tracking which PE outreach emails, LinkedIn campaigns, or referral links are generating leads.

---

## 5. AI AGENT-READINESS LAYER

### What This Means
The site needs to be built so that Tier 4's own AI agents (and future third-party agents) can interact with it programmatically. This isn't about embedding a chatbot widget (though that's included below) — it's about making the entire site **agent-addressable**.

### 5A. Chat Widget — Agent-Powered

Build a floating chat widget in the bottom-right corner of the site.

- **Visual:** Small pill-shaped trigger button: Electric Blue, chat icon (Lucide `MessageSquare`), subtle pulse animation on first load. Expands into a chat panel on click.
- **Chat Panel:** `rounded-[2rem]`, dark background matching the site palette, message bubbles (user = Electric Blue, agent = Slate), typing indicator with animated dots.
- **Backend:** The chat widget posts messages to an API endpoint that will eventually be connected to Tier 4's OpenClaw agent system. For now, build it with a **configurable endpoint**:

```env
# Chat agent configuration
CHAT_AGENT_ENDPOINT=https://api.tier4intelligence.com/chat
CHAT_AGENT_ENABLED=true
CHAT_AGENT_WELCOME_MESSAGE="Hi — I'm an AI assistant from Tier 4 Intelligence. I can answer questions about the Growth Flywheel, how our system works, or help you book a call with our team. What would you like to know?"
```

- **If `CHAT_AGENT_ENABLED` is `false`:** The chat widget still appears, but instead of a live agent, it shows a simple form: "Leave your question and email — we'll respond within 24 hours." This captures leads even if the agent backend isn't connected yet.
- **Data captured from chat:** Every conversation should be posted to the same `/api/lead` endpoint with `form_type: "chat_widget"` and the conversation transcript included.

### 5B. Voice Agent CTA

The site should prominently display a **click-to-call phone number** that routes to Tier 4's AI voice agent.

- Display the number in the hero section (subtle, below the CTA) and in the footer.
- Format: `<a href="tel:+1XXXXXXXXXX">` with the phone number configured via env var:

```env
VOICE_AGENT_PHONE=+18885444500
VOICE_AGENT_LABEL="Talk to Our AI Agent"
```

- On mobile, this triggers a native phone call. On desktop, it displays the number with a "Call Us" label.
- This is intentional — Tier 4 is an automation company. Having an AI agent answer the company's own phone is a live demo of the product.

### 5C. Structured API for Agents

Create a simple JSON endpoint at `/api/info.json` that returns the site's key information in a clean, machine-readable format. This is for AI agents (your own or third-party) that need to programmatically understand what Tier 4 offers:

```json
{
  "company": "Tier 4 Intelligence",
  "tagline": "Agentic Automation for Growth-Stage Businesses",
  "flagship_offering": "AI Growth Flywheel",
  "target_market": "PE-backed home services companies, $5M-$50M revenue",
  "stages": [
    { "number": 1, "name": "Programmatic SEO & AI Web Presence", "key_metric": "70% reduction in cost-per-lead" },
    { "number": 2, "name": "AI Voice & Chat Agents", "key_metric": "95%+ answer rate, 24/7" },
    { "number": 3, "name": "Lead Capture & Intelligent Scoring", "key_metric": "Sub-2-minute speed-to-lead" },
    { "number": 4, "name": "Intelligent Dispatch & Route Optimization", "key_metric": "10% drive time reduction" },
    { "number": 5, "name": "Reputation Management & Review Automation", "key_metric": "Compounding loop back to Stage 1" }
  ],
  "key_stats": {
    "ebitda_expansion": "+113% Year 1",
    "payback_period": "Under 6 months",
    "portfolio_moic": "4.0x+ over 3-year hold",
    "deployment_time": "90 days"
  },
  "integrations": ["ServiceTitan", "Housecall Pro", "Jobber", "FieldEdge"],
  "contact": {
    "email": "matt@tier4intelligence.com",
    "booking_url": "https://tier4intelligence.com/#book-call",
    "phone": "+18885444500"
  }
}
```

### 5D. Sitemap & Robots.txt

```
# /public/robots.txt
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://tier4intelligence.com/sitemap.xml
```

Create a basic `sitemap.xml` that includes the homepage URL and any section anchors that function as distinct pages. Also reference the `llms.txt` file:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemapindex.org/schemas/sitemap/0.9">
  <url>
    <loc>https://tier4intelligence.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tier4intelligence.com/llms.txt</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 6. ANALYTICS & TRACKING

### Google Tag Manager Container

Embed a GTM container in the `<head>` of `index.html`. Configure via env var:

```env
GTM_CONTAINER_ID=GTM-XXXXXXX
```

```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM_CONTAINER_ID_HERE');</script>
```

### Events to Track (via dataLayer)

All form submissions already push to `dataLayer` (defined in section 4). Additionally, track:

- `flywheel_segment_clicked` — which flywheel stage the user interacted with
- `stage_card_viewed` — which sticky-stacking stage card scrolled into view (tracks engagement depth)
- `cta_clicked` — any CTA button click with button label and location
- `chat_opened` — chat widget opened
- `phone_number_clicked` — voice agent CTA clicked
- `scroll_depth` — 25%, 50%, 75%, 100% scroll milestones

---

## 7. DEPLOYMENT CHECKLIST

Before going live, verify:

- [ ] `/llms.txt` is accessible and returns valid markdown with `text/plain` content type
- [ ] `/llms-full.txt` contains the full site content in clean markdown
- [ ] All JSON-LD blocks validate in Google Rich Results Test with zero errors
- [ ] All meta tags and OG tags render correct previews (test with https://www.opengraph.xyz/)
- [ ] OG image is 1200×630, loads fast, and looks premium
- [ ] Primary lead form submits successfully and data arrives at at least one configured webhook
- [ ] Inline email capture works and fires analytics event
- [ ] UTM parameters are captured from URL and included in form submissions
- [ ] Chat widget opens, displays welcome message, and captures conversations (or falls back to form if agent disabled)
- [ ] Voice agent phone number is displayed and click-to-call works on mobile
- [ ] `/api/info.json` returns valid JSON with current company info
- [ ] `robots.txt` allows AI crawlers (GPTBot, ClaudeBot, PerplexityBot)
- [ ] `sitemap.xml` is valid and submitted to Google Search Console
- [ ] GTM container fires and all dataLayer events are pushing correctly
- [ ] All environment variables are set in production (no placeholder values)
- [ ] HTTPS is enforced on all pages and assets
- [ ] Page speed: Core Web Vitals passing (check with Lighthouse)

---

## Summary

This file turns the frontend spec into a working lead machine and AI-discoverable asset. The frontend builder spec (`TIER4-BUILDER-v2.md`) creates the experience. This file creates the intelligence underneath it:

1. **LLM.txt** — AI search engines can cite you
2. **JSON-LD** — Google understands exactly what you are
3. **Meta/OG** — LinkedIn and Slack previews look premium
4. **Lead Capture** — Forms that connect to any CRM via webhooks
5. **Agent-Readiness** — Chat widget, voice agent, and programmatic API
6. **Analytics** — Every interaction tracked and measurable
7. **Deployment Checklist** — Nothing goes live broken

Build the frontend. Then layer this on top. The result is a site that looks like a digital instrument AND works like one.