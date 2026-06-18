# React + Vite

## Internal advisor audit tool

This repo includes an internal advisor audit workflow at `/admin/audit`. It is separate from the public `/audit` AI-readiness/GEO audit and uses separate API endpoints:

- `POST /api/audit-research` - company research plus tailored discovery questions
- `POST /api/audit-report` - transcript scoring and audit readout
- `POST /api/audit-followup` - short post-call email draft
- `POST /api/advisor-gate` - shared advisor password gate before Clerk
- `GET /api/advisor-audits` / `POST /api/advisor-audits` - saved audit history

The advisor tool uses the OpenAI Responses API from Vercel serverless functions. The browser never receives `OPENAI_API_KEY`; it only calls the local API routes. Supabase audit history is also server-only through `SUPABASE_SERVICE_ROLE_KEY`.

### Required environment variables

```bash
OPENAI_API_KEY=
OPENAI_AUDIT_MODEL=gpt-5.5
OPENAI_AUDIT_REPORT_MODEL=gpt-5.5

VITE_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADVISOR_GATE_PASSWORD=tier4 2026
ADVISOR_GATE_COOKIE_SECRET=
CLERK_AUTHORIZED_PARTIES=https://tier4intelligence.com,https://www.tier4intelligence.com
AUDIT_ALLOWED_EMAIL_DOMAINS=tier4intelligence.com,tier4advisors.com
AUDIT_ALLOWED_EMAILS=
AUDIT_SUPERUSER_EMAILS=
CLERK_ALLOWED_ORG_ID=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Use at least one production restriction beyond sign-in, such as `CLERK_ALLOWED_ORG_ID`, `AUDIT_ALLOWED_EMAIL_DOMAINS`, or `AUDIT_ALLOWED_EMAILS`.

Before enabling saved audit history, run `supabase/advisor_audit_schema.sql` in the Supabase SQL editor. The app will still generate audits if Supabase is not configured, but saved audit history will show a storage setup message.

For local UI/API development before Clerk is configured, set both bypass flags:

```bash
VITE_AUDIT_AUTH_BYPASS=true
AUDIT_AUTH_BYPASS=true
```

Do not enable the bypass flags in production.

### Local run

```bash
npm install
npm run dev
```

Open `http://localhost:5173/admin/audit`.

If you need local serverless API parity, run with Vercel's dev tooling so `/api/*` functions execute the same way they do in production.

### Validation checklist

- `/` and `/audit` still render the public site and public audit.
- `/admin`, `/admin/audit`, `/admin/audits`, and `/admin/seo-audit` show the advisor password gate before Clerk unless local bypass is enabled.
- Wrong advisor gate password does not reveal Clerk.
- Correct advisor gate password sets the signed HttpOnly cookie and then shows Clerk.
- Research returns a company brief and 10-15 questions.
- Report generation returns a full five-domain scorecard, recommendations, roadmap, and closing.
- Follow-up email generation returns a short client-ready draft.
- Saved audit history lists only the signed-in advisor's audits, except `AUDIT_SUPERUSER_EMAILS`, which can view all advisor audits.
- Browser bundles do not contain `OPENAI_API_KEY`.
- Vercel env vars are set before production deployment.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Redeploy trigger Sun Mar  1 19:02:06 EST 2026
