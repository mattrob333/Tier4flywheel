# Tier 4 Intelligence Website and Advisor Tools

This repo powers the Tier 4 Intelligence website plus the internal advisor console used by Tier 4 advisors and salespeople.

The public site remains available at `/`. The internal tools live under `/admin` and are protected by a shared advisor gate plus Clerk authentication.

## What Is Included

- Public marketing site and public AI Search/GEO audit launcher.
- Advisor console at `/admin`.
- Four-step AI advisor audit pipeline at `/admin/audit`.
- Existing/saved audit table on the advisor dashboard.
- Internal AI Search/GEO technical crawl launcher at `/admin/seo-audit`.
- Server-side OpenAI Responses API calls for research, report generation, and follow-up email drafting.
- Supabase-backed audit persistence with advisor-owned records and superuser visibility.

## Main Routes

### Public

- `/` - public Tier 4 Intelligence website.
- `/audit` - public AI readiness/GEO audit entry point.
- `/api/report?domain=example.com` - public technical crawl report with a short cache.

### Internal Advisor Console

- `/admin` - advisor dashboard with new audit, GEO audit, and audit history.
- `/admin/audit` - four-step AI advisor audit pipeline.
- `/admin/audit?auditId=<id>` - reopen a saved advisor audit.
- `/admin/audits` - dedicated saved-audits view.
- `/admin/seo-audit` - internal launcher for the AI Search/GEO technical crawl.

### Internal APIs

- `POST /api/advisor-gate` - verifies the shared advisor access password and sets the signed HttpOnly gate cookie.
- `GET /api/advisor-gate/status` - checks whether the advisor gate cookie is valid.
- `POST /api/advisor-gate/logout` - clears the advisor gate cookie.
- `POST /api/audit-research` - researches the company and returns a brief plus 10-15 call questions.
- `POST /api/audit-report` - scores the transcript and returns the structured report JSON.
- `POST /api/audit-followup` - drafts the post-call follow-up email.
- `GET /api/advisor-audits` - lists saved audits for the signed-in advisor, or all audits for configured superusers.
- `GET /api/advisor-audits?id=<id>` - loads one saved audit with owner-or-superuser enforcement.
- `POST /api/advisor-audits` - creates or updates an advisor audit milestone.

## Advisor Audit Flow

The advisor audit pipeline has four steps:

1. **Client** - enter company name, optional website, context, advisor name, and audit type.
2. **Questions** - generate a research brief and tailored discovery questions using server-side web search through the OpenAI Responses API.
3. **Transcript** - paste the full call transcript.
4. **Report** - generate a scored report, recommendations, roadmap, follow-up email, and copyable markdown.

The three audit types are:

- **AI Discovery** - broad first conversation with an AI-curious prospect.
- **AI Solution Scoping** - specific AI build or workflow problem.
- **Agent Governance** - AI agents and non-human identity governance.

The browser never receives `OPENAI_API_KEY`. All OpenAI calls are made from Vercel serverless API functions.

## Report Quality Guardrails

The report endpoint uses structured JSON schema output plus a validation and repair pass.

The validator checks for:

- non-ASCII/corrupted characters
- unfinished or truncated sentences
- missing business risk, primary opportunity, pilot, governance signal, and Pedigree fit fields
- roadmap title/date mismatch
- overall score math
- product-language leaks in client-facing recommendation titles
- missing domain evidence and why-it-matters explanations

If validation fails, the server runs one repair request and only returns the report if the repaired JSON passes validation.

## Saved Audit History

Audit milestones are saved to Supabase after major steps:

- questions ready
- report ready
- follow-up ready

Advisors see their own audits. Emails listed in `AUDIT_SUPERUSER_EMAILS` can see all advisor audits from the dashboard table and dedicated saved-audits view.

Before using persistence, run the checked-in schema:

```bash
supabase/advisor_audit_schema.sql
```

or the migration:

```bash
supabase/migrations/20260618230500_advisor_audit_schema.sql
```

The server uses `SUPABASE_SERVICE_ROLE_KEY`, so row-level security is enabled in the database but app-level owner/superuser enforcement happens in the API.

## AI Search/GEO Audit

`/api/report` is a deterministic technical crawler, not an OpenAI-generated report.

It checks:

- homepage HTML
- `robots.txt`
- `llms.txt`
- `llms-full.txt`
- `sitemap.xml`
- basic metadata, schema, security headers, word count, and crawler signals

Advisor launches from `/admin/seo-audit` append `source=outbound&fresh=<timestamp>`, which bypasses cache and returns:

- `X-Cache: BYPASS`
- `Cache-Control: no-store, max-age=0`
- `X-Audit-Workflow: technical-crawl`

Public `/api/report` calls can use a short 10-minute cache. The report page shows crawl evidence so users can see whether the result was fresh or cached.

## Access Control

The advisor area has two layers:

1. **Advisor gate** - shared password stored in `ADVISOR_GATE_PASSWORD`; sets a signed HttpOnly cookie using `ADVISOR_GATE_COOKIE_SECRET`.
2. **Clerk** - user authentication and server-side API bearer-token verification.

Additional restrictions are enforced server-side with one or more of:

- `AUDIT_ALLOWED_EMAIL_DOMAINS`
- `AUDIT_ALLOWED_EMAILS`
- `CLERK_ALLOWED_ORG_ID`
- Clerk Restricted Mode / invite-only production configuration

Do not rely on the shared password as the only security boundary.

## Environment Variables

Copy `.env.example` for local development.

Required for the advisor AI audit:

```bash
OPENAI_API_KEY=
OPENAI_AUDIT_MODEL=gpt-5.5
OPENAI_AUDIT_REPORT_MODEL=gpt-5.5
```

Required for Clerk:

```bash
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_AUTHORIZED_PARTIES=https://tier4intelligence.com,https://www.tier4intelligence.com
```

Required for the advisor password gate:

```bash
ADVISOR_GATE_PASSWORD=tier4 2026
ADVISOR_GATE_COOKIE_SECRET=<long random secret, at least 32 chars>
```

Recommended production restrictions:

```bash
AUDIT_ALLOWED_EMAIL_DOMAINS=tier4intelligence.com,tier4advisors.com
AUDIT_ALLOWED_EMAILS=
AUDIT_SUPERUSER_EMAILS=<Matt email and any other superusers>
CLERK_ALLOWED_ORG_ID=
```

Required for saved audit history:

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Local-only bypass flags:

```bash
VITE_AUDIT_AUTH_BYPASS=false
AUDIT_AUTH_BYPASS=false
```

Never enable bypass flags in production.

Lead/contact form variables:

```bash
AIRTABLE_PAT=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the Vite app:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/admin
```

For local serverless API parity, use Vercel dev tooling so `/api/*` functions execute like production.

## Deployment

The app is configured for Vercel in `vercel.json`:

- framework: Vite
- build command: `npm run build`
- output directory: `dist`
- `/api/*` routes handled by Vercel serverless functions
- SPA fallback rewrites for non-API routes

Deploy by pushing `master` to GitHub. Vercel builds from the repository and uses the Vercel environment variables.

## Validation Checklist

Run before shipping changes:

```bash
npm run lint
npm run build
```

Manual checks:

- `/` and `/audit` still render public pages.
- `/admin`, `/admin/audit`, `/admin/audits`, and `/admin/seo-audit` show advisor gate before Clerk when bypass is disabled.
- Wrong advisor password does not reveal Clerk.
- Correct advisor password shows Clerk sign-in.
- Non-allowed Clerk users cannot call advisor APIs.
- Research returns a brief plus 10-15 questions.
- Copy buttons work for question list, client-ready email, report markdown, and follow-up email.
- Transcript report generation returns a complete scored report with no truncation or corrupted characters.
- Follow-up generation returns a short email draft.
- Audit history saves and reopens records.
- Superuser email can see all audits; normal advisors see only their own.
- Browser bundles do not contain secret values for `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY`.
- Internal GEO report from `/admin/seo-audit` returns a fresh technical crawl and includes the advisor dashboard back button.

## Current Implementation Notes

The original handoff spec referenced a standalone Next.js + Anthropic build. The current production implementation intentionally uses the existing Tier 4 Intelligence Vite/Vercel site and the OpenAI Responses API so the tool can live inside the existing website and admin console.

The product behavior remains the same: authenticated advisors can run research, questions, transcript scoring, reports, follow-up emails, and saved audit history without exposing AI provider keys to the browser.
