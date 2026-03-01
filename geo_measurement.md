# Tier 4 Intelligence — GEO Measurement & Reusable Project Template

## Purpose of This File

This is the **third and final companion file** in the Tier 4 Intelligence website project. Together, the three files form a complete, repeatable system for building premium B2B websites with full AI discoverability and lead capture infrastructure.

| File | What It Covers |
|------|---------------|
| `TIER4-BUILDER-v2.md` | Frontend — visual design, animations, component architecture, content |
| `TIER4-INFRASTRUCTURE.md` | Backend — LLM.txt, JSON-LD, lead capture, CRM connectors, agent-readiness |
| `TIER4-GEO-MEASUREMENT.md` (this file) | Measurement — how to verify and optimize AI visibility using GEO tooling, plus the reusable project template for repeating this system for any client |

---

## PART 1: GENERATIVE ENGINE OPTIMIZATION (GEO) — THE MEASUREMENT LAYER

### Why This Matters

You've built an LLM.txt file, structured JSON-LD data, and an agent-readable info endpoint. But how do you know it's working? How do you know what ChatGPT, Claude, Perplexity, and Google AI Overviews actually say about Tier 4 Intelligence when someone asks "who builds AI systems for PE-backed home services companies?"

Traditional SEO gives you Google Search Console rankings. GEO gives you something new: **how AI models see, rank, and recommend your brand.** This is the emerging discipline of Generative Engine Optimization — optimizing your visibility inside AI-generated answers, not just search engine results pages.

### The Core Insight for Tier 4

Tier 4 Intelligence literally sells AI automation to businesses. If Tier 4's own brand isn't visible and well-positioned inside AI models, that's a credibility gap. Running GEO measurement and showing the results is both operational intelligence AND a live proof point — "we practice what we sell."

---

### Tool: Voyage GEO Agent

**Repository:** https://github.com/Onvoyage-AI/voyage-geo-agent
**License:** MIT (open source)
**Runs as:** CLI tool, Claude Code skill, or OpenClaw Agent skill

Voyage GEO Agent measures one thing: **how LLMs and agents see and rank your brand across models.** It runs a 5-stage pipeline:

#### Stage 1: Research
- Scrapes your website (tier4intelligence.com)
- Builds a brand profile: competitors, USPs, keywords
- Identifies what Tier 4 *wants* to be known for

#### Stage 2: Query Generation
- Creates realistic search queries that real people would type into ChatGPT / Perplexity / Claude
- Queries are **brand-blind** — they never mention "Tier 4 Intelligence" by name
- Examples: "best AI automation for home services PE portfolios," "who builds managed AI systems for HVAC companies," "AI growth flywheel for service businesses," "fractional CAO for private equity"

#### Stage 3: Execution
- Sends generated queries to multiple AI models via OpenRouter (or direct API keys)
- Supported providers: ChatGPT (OpenAI), Claude (Anthropic), Perplexity, Grok, DeepSeek, Gemini (Google), Llama, and others

#### Stage 4: Analysis
- Measures across 6 dimensions:
  - **Mention rate** — What % of queries result in Tier 4 being mentioned?
  - **Mindshare** — When mentioned, how prominent is the mention? (first recommendation vs. buried in a list)
  - **Sentiment** — Positive, neutral, cautious, or negative framing?
  - **Competitor positioning** — Who shows up next to us? Are we the default pick or an also-ran?
  - **USP coverage** — Do models accurately describe our key differentiators (compounding flywheel, managed operations, PE focus, platform-agnostic, OpenClaw)?
  - **Provider affinity** — Which models are strongest advocates for Tier 4? Which ones barely know we exist?

#### Stage 5: Reporting
- Generates interactive HTML report with charts
- Also exports JSON, CSV, and Markdown for further analysis
- The report becomes a GEO baseline you can track over time (monthly cadence recommended)

---

### How to Run Voyage GEO Agent for Tier 4

#### Prerequisites
```bash
# Clone the repo
git clone https://github.com/Onvoyage-AI/voyage-geo-agent.git
cd voyage-geo-agent

# Install dependencies
pip install -r requirements.txt

# Set API keys (OpenRouter is the easiest — single key for all models)
export OPENROUTER_API_KEY="your-key-here"
# Or set individual provider keys:
# export OPENAI_API_KEY="your-key"
# export ANTHROPIC_API_KEY="your-key"
```

#### Run via CLI
```bash
# Basic brand analysis
python -m voyage_geo run --brand "Tier 4 Intelligence" --url "https://tier4intelligence.com"

# With custom query themes focused on your market
python -m voyage_geo run \
  --brand "Tier 4 Intelligence" \
  --url "https://tier4intelligence.com" \
  --competitors "Accenture AI,McKinsey Digital,ServiceTitan Pro Services,Rosie AI,Sameday AI" \
  --keywords "AI automation,home services,private equity,EBITDA expansion,growth flywheel,managed AI,agentic systems,voice agents,programmatic SEO,dispatch optimization"
```

#### Run as Claude Code / OpenClaw Skill
The agent can also be invoked as a skill within Claude Code or OpenClaw, making it part of your automated monitoring pipeline. See the repo documentation for skill registration.

---

### GEO Optimization Checklist for Tier 4

After running the initial GEO baseline, use these tactics to improve AI visibility:

#### Content Signals (what makes LLMs recommend you)
- [ ] **LLM.txt deployed and accessible** — This is the most direct signal. Ensure `/llms.txt` is live, accurate, and comprehensive.
- [ ] **Consistent brand language across all web properties** — LLMs build understanding by aggregating signals. If your LinkedIn says "AI consulting firm" and your website says "automation company," models fragment your identity. Use "automation company that builds and operates agentic AI systems" everywhere.
- [ ] **Unique, specific claims** — Generic content gets averaged out by models. Specific claims get remembered. "+113% EBITDA expansion" is memorable. "We improve business outcomes" is invisible.
- [ ] **Competitor differentiation explicitly stated** — LLMs need to know how you differ from competitors to position you correctly. The Philosophy section ("Most AI vendors sell tools. We build the compounding machine.") gives models a clear differentiation frame.
- [ ] **Structured data (JSON-LD)** — Helps models understand entity relationships, service taxonomy, and organizational structure.

#### Distribution Signals (where LLMs learn about you)
- [ ] **LinkedIn articles and posts** — LLMs heavily index LinkedIn content. Write thought leadership posts that use the same language as your website. Topics: "Why compounding systems beat point solutions," "The flywheel effect in home services automation," "Selling to agents, not just humans."
- [ ] **GitHub presence** — If OpenClaw has any open-source components or if you publish any technical content, GitHub signals authority to technical LLMs.
- [ ] **Podcast appearances / interviews** — Transcripts get indexed. Mention Tier 4 Intelligence, the Growth Flywheel, and specific capabilities by name.
- [ ] **PR / press mentions** — Even a single mention in a home services industry publication or PE trade press creates a citation that models can anchor to.
- [ ] **Directory and aggregator listings** — Ensure Tier 4 is listed on relevant directories (Clutch, G2, industry-specific platforms) with consistent NAP and description.

#### Technical Signals (what makes your site agent-friendly)
- [ ] **robots.txt allows AI crawlers** — GPTBot, ClaudeBot, PerplexityBot all explicitly allowed (covered in Infrastructure spec).
- [ ] **Fast page load** — AI crawlers have timeouts. A slow site may be partially indexed.
- [ ] **Clean HTML semantic structure** — Proper heading hierarchy (H1 → H2 → H3), semantic HTML elements, aria labels.
- [ ] **`/api/info.json` endpoint** — Gives programmatic agents a clean data source (covered in Infrastructure spec).

---

### GEO Monitoring Cadence

| Frequency | Action |
|-----------|--------|
| **Month 0** (launch) | Run initial GEO baseline. Record mention rate, mindshare, sentiment, USP coverage, competitor positioning across all providers. This is your "before" snapshot. |
| **Month 1** | Re-run after deploying LLM.txt, JSON-LD, and initial LinkedIn content. Measure improvement. |
| **Monthly** (ongoing) | Run GEO report. Track trends. Identify which models are improving and which are stale. Adjust content strategy accordingly. |
| **Quarterly** | Comprehensive GEO review. Compare against competitors. Identify new query patterns. Update LLM.txt content if the offering has evolved. |

---

## PART 2: REUSABLE PROJECT TEMPLATE — THE FULL CLOUD PROJECT

### The Vision

These three files aren't just for the Tier 4 Intelligence website. They're a **reusable template** for building premium B2B websites for any client — particularly the types of companies Tier 4 works with. Any time you need to build a site that looks world-class, captures leads, is discoverable by AI, and is ready for agent integration, you use this same three-file system.

### Project File Structure

```
/project-root/
│
├── /specs/                              # The instruction layer (what the AI builder reads)
│   ├── FRONTEND-SPEC.md                 # Visual design, animations, component architecture
│   ├── INFRASTRUCTURE-SPEC.md           # LLM.txt, JSON-LD, lead capture, CRM, agent-readiness
│   └── GEO-MEASUREMENT-SPEC.md          # GEO baseline, optimization checklist, monitoring cadence
│
├── /src/                                # The codebase (what the AI builder produces)
│   ├── App.jsx                          # Main React application
│   ├── index.css                        # Tailwind directives + noise overlay + custom utilities
│   ├── /components/                     # (if needed for 600+ line files)
│   └── /api/                            # Serverless functions
│       ├── lead.js                      # Universal lead capture → webhook fan-out
│       └── info.json                    # Agent-readable company data endpoint
│
├── /public/                             # Static assets served at root
│   ├── index.html                       # HTML shell with meta tags, JSON-LD, GTM, font links
│   ├── llms.txt                         # LLM-readable brand summary
│   ├── llms-full.txt                    # Extended LLM-readable content
│   ├── robots.txt                       # AI crawler permissions
│   ├── sitemap.xml                      # URL index for crawlers
│   ├── og-image.jpg                     # 1200x630 Open Graph image
│   └── favicon.ico                      # Brand favicon
│
├── /geo/                                # GEO measurement outputs
│   ├── baseline-report.html             # Initial Voyage GEO Agent report
│   ├── monthly/                         # Monthly tracking reports
│   └── run-geo.sh                       # Script to re-run GEO analysis
│
├── .env.example                         # Template for all environment variables
├── package.json                         # Dependencies
├── tailwind.config.js                   # Tailwind configuration with brand tokens
├── vite.config.js                       # Vite configuration
└── README.md                            # Project overview and setup instructions
```

### Master `.env.example`

This template captures EVERY configurable value across all three spec files. Copy to `.env` and fill in real values before deploying.

```env
# ===========================
# TIER 4 INTELLIGENCE — ENV
# ===========================

# --- Brand Configuration ---
BRAND_NAME="Tier 4 Intelligence"
BRAND_TAGLINE="Agentic Automation for Growth-Stage Businesses"
BRAND_URL="https://tier4intelligence.com"
BRAND_EMAIL="matt@tier4intelligence.com"
BRAND_LOCATION="Alpharetta, GA"

# --- Voice Agent ---
VOICE_AGENT_PHONE=+18885444500
VOICE_AGENT_LABEL="Talk to Our AI Agent"

# --- Chat Agent ---
CHAT_AGENT_ENDPOINT=https://api.tier4intelligence.com/chat
CHAT_AGENT_ENABLED=true
CHAT_AGENT_WELCOME_MESSAGE="Hi — I'm an AI assistant from Tier 4 Intelligence. I can answer questions about the Growth Flywheel or help you book a call. What would you like to know?"

# --- CRM / Webhook Destinations ---
# Uncomment and configure whichever destinations are active.
# The lead API fans out to ALL configured webhooks in parallel.
#WEBHOOK_GOOGLE_SHEETS=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
#WEBHOOK_ZOHO_CRM=https://flow.zoho.com/YOUR_FLOW_WEBHOOK_URL
#WEBHOOK_HUBSPOT=https://api.hsforms.com/submissions/v3/integration/submit/PORTAL/FORM
#WEBHOOK_GENERIC=https://hooks.zapier.com/hooks/catch/YOUR_ZAP_ID
#WEBHOOK_SLACK=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
#NOTIFICATION_EMAIL=matt@tier4intelligence.com

# --- Analytics ---
GTM_CONTAINER_ID=GTM-XXXXXXX

# --- GEO Measurement ---
# For running Voyage GEO Agent
OPENROUTER_API_KEY=your-openrouter-key
#OPENAI_API_KEY=your-openai-key
#ANTHROPIC_API_KEY=your-anthropic-key

# --- Deployment ---
# Set based on your hosting platform (Vercel, Netlify, Cloudflare, etc.)
NODE_ENV=production
```

---

### How to Reuse This Template for a New Client

When Tier 4 builds a website for a new client (or for a portfolio company), follow this process:

#### Step 1: Fork the Template
Copy the `/specs/` folder and the project structure. The three spec files become your starting point.

#### Step 2: Customize `FRONTEND-SPEC.md`
- **Brand name and purpose** — Replace Tier 4 content with client content
- **Aesthetic preset** — Choose or modify the palette, typography, and image mood to match the client's industry and positioning
- **Section content** — Adapt the flywheel (or replace with client's core offering structure), stage deep-dives, philosophy, trust signals, and CTA
- **Keep the design system rules** — The noise overlay, rounded corners, magnetic buttons, GSAP animation lifecycle, and component architecture are universal quality standards. Don't change these.

#### Step 3: Customize `INFRASTRUCTURE-SPEC.md`
- **LLM.txt** — Rewrite with the client's brand, services, metrics, and target market
- **JSON-LD** — Update Organization schema with client's NAP data, services, and entity relationships
- **Meta/OG tags** — Update title, description, OG image for the client
- **Lead capture forms** — Adjust fields to match client's qualification criteria (the universal webhook architecture stays the same)
- **Agent readiness** — Update chat widget messaging, voice agent number, `/api/info.json` content

#### Step 4: Customize `GEO-MEASUREMENT-SPEC.md`
- **Brand and competitors** — Update for the client's competitive landscape
- **Query themes** — Generate queries relevant to the client's market
- **USP checklist** — Define what the client wants to be known for
- **Run baseline** — Execute Voyage GEO Agent before launch, then re-run post-launch to measure impact

#### Step 5: Build
Hand all three spec files to your AI builder (Gemini, Claude, Cursor, etc.) and say: "Build the frontend from the frontend spec. Then layer the infrastructure from the infrastructure spec. Then run the GEO baseline from the measurement spec."

---

### What Makes This Template Different

Most website projects produce a pretty frontend with no intelligence underneath. This template produces three layers every time:

1. **The Experience Layer** (frontend spec) — What humans see. Cinematic, premium, zero generic AI patterns.
2. **The Intelligence Layer** (infrastructure spec) — What machines see. LLM.txt, JSON-LD, structured data, lead capture, agent endpoints.
3. **The Measurement Layer** (GEO spec) — How you verify and optimize AI visibility over time.

The result: a site that looks like a digital instrument, works like a lead machine, and is discoverable by the next generation of AI-powered search and agent systems.

---

## PART 3: GEO-SPECIFIC CONTENT STRATEGY FOR TIER 4

### High-Priority GEO Content to Create (Outside the Website)

The website infrastructure (LLM.txt, JSON-LD, agent endpoints) is necessary but not sufficient for strong GEO scores. LLMs build brand understanding from the entire web — not just your domain. Here's a content strategy specifically designed to improve Tier 4's AI visibility:

#### Tier 1: Foundational (create before or at launch)
1. **LinkedIn company page** — Updated description using exact brand language: "Tier 4 Intelligence is an automation company that builds and operates agentic AI systems for growth-stage businesses."
2. **LinkedIn personal profile (Matt)** — Headline: "CEO, Tier 4 Intelligence | Building the AI Growth Flywheel for PE-Backed Service Businesses" — this exact phrasing trains models on the association between Matt, Tier 4, and the flywheel.
3. **Clutch or G2 listing** — Creates a third-party citation that models can cross-reference.
4. **GitHub organization** — Even a minimal `tier4intelligence` org with a pinned repo (OpenClaw documentation, a public utility, or even just a well-structured README about the company) creates a technical authority signal.

#### Tier 2: Amplification (first 60 days post-launch)
5. **3-5 LinkedIn articles** — Topics designed to seed LLM training data:
   - "Why Compounding Systems Beat Point Solutions in Home Services"
   - "The Estimate Graveyard: How Service Companies Lose 60% of Revenue They Already Paid For"
   - "Selling to Agents: Why Your Next Customer Might Not Be Human"
   - "The Dispatcher Debbie Problem: Why AI Dispatch Beats Human Dispatch at Scale"
6. **One podcast / interview appearance** — A home services industry podcast or PE operations podcast. The transcript becomes indexed content.
7. **One press mention** — Even a contributed article to a trade publication (ACHR News, Plumbing & Mechanical, PE Hub) creates a high-authority citation.

#### Tier 3: Compounding (ongoing)
8. **Monthly GEO report** — Track progress, identify gaps, double down on what's working.
9. **Quarterly content refresh** — Update LLM.txt and LinkedIn content as the offering evolves.
10. **Client case studies** — Once pilot results are live (Q2 2026 target), publish them everywhere. Specific numbers from real deployments are the highest-signal content for LLM citation.

---

## Summary

Three files. Three layers. One system.

| Layer | File | What It Does |
|-------|------|-------------|
| Experience | `TIER4-BUILDER-v2.md` | Makes humans say "this is premium" |
| Intelligence | `TIER4-INFRASTRUCTURE.md` | Makes machines understand what you are |
| Measurement | `TIER4-GEO-MEASUREMENT.md` | Proves it's working and tells you how to improve |

This is a full cloud project template. Use it for Tier 4 Intelligence. Then reuse it for every client site you build. The design system, the infrastructure plumbing, and the GEO measurement pipeline are universal — only the content and brand tokens change.

Build the instrument. Measure the signal. Compound the visibility.