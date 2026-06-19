import React, { useState } from 'react';
import { ClerkLoaded, Show, SignIn, UserButton } from '@clerk/react';
import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
import AdvisorGate from '../components/AdvisorGate';

const STYLE = `
.seo-root{min-height:100vh;background:#0B1426;color:#F0F2F5;font-family:Inter,system-ui,sans-serif}
.seo-wrap{max-width:820px;margin:0 auto;padding:32px 20px 80px}
.seo-top{display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:18px;margin-bottom:42px}
.seo-badge{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:800;letter-spacing:.14em;color:#fff;background:#5EC08A;border-radius:6px;padding:5px 9px}
.seo-top h1{font-size:18px;font-weight:800;margin:0;color:#fff}
.seo-top p{margin:0;color:rgba(240,242,245,.58);font-size:12px}
.seo-user{margin-left:auto}
.seo-back{display:inline-flex;align-items:center;gap:8px;color:rgba(240,242,245,.62);text-decoration:none;font-size:13px;margin-bottom:24px}
.seo-back:hover{color:#5EC08A}
.seo-back svg{width:16px;height:16px}
.seo-panel{background:rgba(26,31,46,.84);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.18)}
.seo-eyebrow{display:inline-flex;width:fit-content;border:1px solid rgba(201,168,76,.3);background:rgba(201,168,76,.1);color:#C9A84C;border-radius:999px;padding:7px 12px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase}
.seo-title{font-size:34px;line-height:1.08;letter-spacing:-.035em;font-weight:900;color:#fff;margin:20px 0 12px}
.seo-sub{font-size:15px;line-height:1.7;color:rgba(240,242,245,.68);max-width:680px;margin:0 0 24px}
.seo-form{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:640px){.seo-form{grid-template-columns:1fr auto}}
.seo-input{width:100%;min-height:46px;background:#0F172A;border:1px solid rgba(255,255,255,.1);color:#fff;border-radius:10px;padding:11px 13px;font-size:15px}
.seo-input:focus{outline:none;border-color:rgba(94,192,138,.7)}
.seo-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border:none;border-radius:10px;background:#5EC08A;color:#fff;font-weight:800;padding:0 18px;cursor:pointer;box-shadow:0 0 24px rgba(94,192,138,.2)}
.seo-btn:hover{background:#6dcc98}
.seo-btn svg{width:16px;height:16px}
.seo-error{margin-top:12px;color:#f0a0a0;font-size:13px}
.seo-note{margin-top:18px;color:rgba(240,242,245,.48);font-size:12px;line-height:1.6}
.seo-auth{max-width:460px;margin:0 auto;padding:72px 20px;text-align:center}
.seo-auth h1{font-size:24px;color:#fff;margin:0 0 8px}
.seo-auth p{color:rgba(240,242,245,.62);font-size:14px;margin:0 0 22px}
`;

function normalizeDomainInput(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
  const withoutWww = withoutProtocol.replace(/^www\./i, '');
  const [domain] = withoutWww.split(/[/?#]/);
  return domain.trim().replace(/\/$/, '');
}

function SeoAuditTool({ devMode = false }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    const cleaned = normalizeDomainInput(domain);

    if (!cleaned || !cleaned.includes('.')) {
      setError('Enter a valid website domain.');
      return;
    }

    setError('');
    window.location.assign(`/api/report?domain=${encodeURIComponent(cleaned)}&source=outbound&fresh=${Date.now()}`);
  }

  return (
    <div className="seo-root">
      <style>{STYLE}</style>
      <div className="seo-wrap">
        <div className="seo-top">
          <span className="seo-badge">T4</span>
          <div>
            <h1>AI Search / GEO Audit</h1>
            <p>Tier 4 Intelligence | internal</p>
          </div>
          {devMode ? null : <div className="seo-user"><UserButton afterSignOutUrl="/admin" /></div>}
        </div>

        <a className="seo-back" href="/admin"><ArrowLeft /> Back to advisor console</a>

        <section className="seo-panel">
          <span className="seo-eyebrow">Advisor Tool</span>
          <h2 className="seo-title">Run a fresh AI search visibility crawl.</h2>
          <p className="seo-sub">
            Enter a prospect or client domain. This launches a fresh technical crawl of the homepage, robots.txt,
            llms.txt, llms-full.txt, and sitemap.xml, then opens the internal advisor report view.
          </p>

          <form className="seo-form" onSubmit={submit}>
            <input
              className="seo-input"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              placeholder="example.com"
              autoComplete="url"
            />
            <button className="seo-btn" type="submit">
              <Search /> Run fresh crawl <ExternalLink />
            </button>
          </form>
          {error && <div className="seo-error">{error}</div>}

          <p className="seo-note">
            This is a deterministic technical crawl, not an OpenAI-generated report. The report page shows whether it
            came from cache or from a fresh crawl.
          </p>
        </section>
      </div>
    </div>
  );
}

function MissingAuthConfig() {
  return (
    <div className="seo-root">
      <style>{STYLE}</style>
      <div className="seo-auth">
        <h1>SEO audit launcher is not configured yet</h1>
        <p>Add Clerk keys or set VITE_AUDIT_AUTH_BYPASS=true for local testing.</p>
      </div>
    </div>
  );
}

export default function AdminSeoAuditPage() {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const devBypass = import.meta.env.VITE_AUDIT_AUTH_BYPASS === 'true';

  if (devBypass) return <SeoAuditTool devMode />;
  if (!clerkKey) return <MissingAuthConfig />;

  return (
    <AdvisorGate>
      <div className="seo-root">
        <style>{STYLE}</style>
        <ClerkLoaded>
          <Show when="signed-out">
            <div className="seo-auth">
              <h1>Tier 4 advisor sign-in</h1>
              <p>Sign in to access the internal GEO audit launcher.</p>
              <SignIn routing="hash" />
            </div>
          </Show>
          <Show when="signed-in">
            <SeoAuditTool />
          </Show>
        </ClerkLoaded>
      </div>
    </AdvisorGate>
  );
}
