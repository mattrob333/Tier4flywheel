import React, { useCallback } from 'react';
import { SignIn, UserButton, useAuth } from '@clerk/react';
import { ClipboardList, Search } from 'lucide-react';
import AdminAuditHistory from '../components/AdminAuditHistory';
import AdvisorGate from '../components/AdvisorGate';
import { isAdvisorAuthBypass } from '../lib/advisorAuthBypass';

const STYLE = `
.admin-root{min-height:100vh;background:#0B1426;color:#F0F2F5;font-family:Inter,system-ui,sans-serif}
.admin-wrap{max-width:1080px;margin:0 auto;padding:32px 20px 80px}
.admin-top{display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:18px;margin-bottom:48px}
.admin-badge{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;font-weight:800;letter-spacing:.14em;color:#fff;background:#5EC08A;border-radius:6px;padding:5px 9px}
.admin-top h1{font-size:18px;font-weight:800;margin:0;color:#fff}
.admin-top p{margin:0;color:rgba(240,242,245,.58);font-size:12px}
.admin-user{margin-left:auto}
.admin-hero{margin-bottom:34px}
.admin-eyebrow{display:inline-flex;width:fit-content;border:1px solid rgba(201,168,76,.3);background:rgba(201,168,76,.1);color:#C9A84C;border-radius:999px;padding:7px 12px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase}
.admin-title{font-size:42px;line-height:1.04;letter-spacing:-.04em;font-weight:900;color:#fff;margin:20px 0 12px;max-width:760px}
.admin-sub{font-size:17px;line-height:1.7;color:rgba(240,242,245,.72);max-width:720px;margin:0}
.admin-grid{display:grid;grid-template-columns:1fr;gap:18px}
@media(min-width:760px){.admin-grid{grid-template-columns:1fr 1fr}}
.admin-card{display:flex;flex-direction:column;gap:18px;text-decoration:none;color:inherit;background:rgba(26,31,46,.82);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:24px;min-height:240px;box-shadow:0 24px 70px rgba(0,0,0,.18);transition:.16s}
.admin-card:hover{transform:translateY(-2px);border-color:rgba(94,192,138,.42);box-shadow:0 28px 90px rgba(94,192,138,.08)}
.admin-icon{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(94,192,138,.1);border:1px solid rgba(94,192,138,.28);color:#5EC08A}
.admin-icon svg{width:22px;height:22px}
.admin-card h2{font-size:22px;font-weight:800;color:#fff;margin:0}
.admin-card p{color:rgba(240,242,245,.68);font-size:14px;line-height:1.6;margin:0}
.admin-meta{margin-top:auto;display:flex;align-items:center;gap:8px;color:#5EC08A;font-size:13px;font-weight:700}
.admin-note{margin-top:26px;border-top:1px solid rgba(255,255,255,.1);padding-top:16px;color:rgba(240,242,245,.48);font-size:12px}
.admin-auth{max-width:460px;margin:0 auto;padding:72px 20px;text-align:center}
.admin-auth h1{font-size:24px;color:#fff;margin:0 0 8px}
.admin-auth p{color:rgba(240,242,245,.62);font-size:14px;margin:0 0 22px}
`;

const getEmptyAuthHeaders = async () => ({});

function AdminDashboard({ devMode = false, getAuthHeaders }) {
  return (
    <div className="admin-root">
      <style>{STYLE}</style>
      <div className="admin-wrap">
        <div className="admin-top">
          <span className="admin-badge">T4</span>
          <div>
            <h1>Advisor Console</h1>
            <p>Tier 4 Intelligence | internal tools</p>
          </div>
          {devMode ? <span className="admin-meta">Dev bypass</span> : <div className="admin-user"><UserButton afterSignOutUrl="/admin" /></div>}
        </div>

        <section className="admin-hero">
          <span className="admin-eyebrow">Advisor Login</span>
          <h2 className="admin-title">Run the tools that support discovery, scoping, and client follow-up.</h2>
          <p className="admin-sub">
            This internal area keeps customer-facing website pages separate from advisor workflows.
          </p>
        </section>

        <div className="admin-grid">
          <a className="admin-card" href="/admin/audit">
            <span className="admin-icon"><ClipboardList /></span>
            <div>
              <h2>New AI Advisor Audit</h2>
              <p>
                Research a prospect, generate tailored call questions, paste the transcript, and produce a scored AI
                audit report with a follow-up email.
              </p>
            </div>
            <span className="admin-meta">Open audit pipeline</span>
          </a>

          <a className="admin-card" href="/admin/seo-audit">
            <span className="admin-icon"><Search /></span>
            <div>
              <h2>AI Search / GEO Audit</h2>
              <p>
                Use the existing website visibility audit internally. Enter a domain and generate the current
                AI-search report without exposing it as a prominent public CTA.
              </p>
            </div>
            <span className="admin-meta">Open GEO audit</span>
          </a>
        </div>

        <AdminAuditHistory getAuthHeaders={getAuthHeaders} />

        <div className="admin-note">
          The public `/audit` route and `/api/report` endpoint still exist. This console simply gives advisors a quieter
          way to reach the tools.
        </div>
      </div>
    </div>
  );
}

function MissingAuthConfig() {
  return (
    <div className="admin-root">
      <style>{STYLE}</style>
      <div className="admin-auth">
        <h1>Advisor console is not configured yet</h1>
        <p>Add Clerk keys or set VITE_AUDIT_AUTH_BYPASS=true for local testing.</p>
      </div>
    </div>
  );
}

function ClerkAdminDashboard() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="admin-auth">
        <h1>Loading advisor sign-in</h1>
        <p>Checking your advisor session.</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="admin-auth">
        <h1>Tier 4 advisor sign-in</h1>
        <p>Sign in to access internal advisor tools.</p>
        <SignIn routing="hash" forceRedirectUrl="/admin" fallbackRedirectUrl="/admin" />
      </div>
    );
  }

  return <AdminDashboard getAuthHeaders={getAuthHeaders} />;
}

export default function AdminHomePage() {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const devBypass = isAdvisorAuthBypass();

  if (devBypass) return <AdminDashboard devMode getAuthHeaders={getEmptyAuthHeaders} />;
  if (!clerkKey) return <MissingAuthConfig />;

  return (
    <AdvisorGate>
      <div className="admin-root">
        <style>{STYLE}</style>
        <ClerkAdminDashboard />
      </div>
    </AdvisorGate>
  );
}
