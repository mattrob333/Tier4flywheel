import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SignIn, UserButton, useAuth } from '@clerk/react';
import { ArrowLeft, ExternalLink, FolderOpen, RefreshCw } from 'lucide-react';
import AdvisorGate from '../components/AdvisorGate';
import { isAdvisorAuthBypass } from '../lib/advisorAuthBypass';

const STYLE = `
.audits-root{min-height:100vh;background:#0B1426;color:#F0F2F5;font-family:Inter,system-ui,sans-serif}
.audits-wrap{max-width:1120px;margin:0 auto;padding:32px 20px 80px}
.audits-top{display:flex;align-items:center;gap:14px;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:18px;margin-bottom:34px}
.audits-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(94,192,138,.1);border:1px solid rgba(94,192,138,.3);color:#5EC08A}
.audits-icon svg{width:22px;height:22px}
.audits-top h1{font-size:18px;font-weight:800;margin:0;color:#fff}
.audits-top p{margin:0;color:rgba(240,242,245,.58);font-size:12px}
.audits-user{margin-left:auto}
.audits-back{display:inline-flex;align-items:center;gap:8px;color:rgba(240,242,245,.62);text-decoration:none;font-size:13px;margin-bottom:22px}
.audits-back:hover{color:#5EC08A}
.audits-back svg{width:16px;height:16px}
.audits-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:18px;flex-wrap:wrap}
.audits-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px}
.audits-title{font-size:34px;line-height:1.08;letter-spacing:-.035em;font-weight:900;color:#fff;margin:0 0 8px}
.audits-sub{font-size:15px;line-height:1.7;color:rgba(240,242,245,.68);max-width:680px;margin:0}
.audits-btn,.audits-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;border-radius:8px;font-family:inherit;cursor:pointer;text-decoration:none}
.audits-btn{background:#5EC08A;color:#0B1426;border:0;font-weight:900;padding:0 14px}
.audits-btn.secondary{background:transparent;color:rgba(240,242,245,.68);border:1px solid rgba(255,255,255,.12)}
.audits-btn svg{width:16px;height:16px}
.audits-tabs{display:flex;gap:8px;margin:20px 0 14px;flex-wrap:wrap}
.audits-tab{background:rgba(26,31,46,.8);border:1px solid rgba(255,255,255,.1);color:rgba(240,242,245,.68);font-size:13px;font-weight:800;padding:0 14px}
.audits-tab.active{border-color:#5EC08A;color:#F0F2F5;background:rgba(94,192,138,.1)}
.audits-panel{background:rgba(26,31,46,.84);border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.18)}
.audits-table{width:100%;border-collapse:collapse;font-size:13px}
.audits-table th{text-align:left;color:rgba(240,242,245,.54);font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1)}
.audits-table td{padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
.audits-table tr:last-child td{border-bottom:0}
.audits-company{font-weight:850;color:#fff}
.audits-muted{color:rgba(240,242,245,.58)}
.audits-tag{display:inline-flex;border-radius:999px;background:rgba(94,192,138,.12);border:1px solid rgba(94,192,138,.24);color:#5EC08A;font-size:11px;font-weight:850;padding:4px 8px}
.audits-empty,.audits-error,.audits-load{padding:28px;color:rgba(240,242,245,.66);font-size:14px;line-height:1.6}
.audits-error{color:#F0F2F5;background:rgba(214,106,106,.08);border-top:1px solid rgba(214,106,106,.4)}
.audits-auth{max-width:460px;margin:0 auto;padding:72px 20px;text-align:center}
.audits-auth h1{font-size:24px;color:#fff;margin:0 0 8px}
.audits-auth p{color:rgba(240,242,245,.62);font-size:14px;margin:0 0 22px}
@media(max-width:760px){.audits-table,.audits-table thead,.audits-table tbody,.audits-table tr,.audits-table th,.audits-table td{display:block}.audits-table thead{display:none}.audits-table tr{border-bottom:1px solid rgba(255,255,255,.1)}.audits-table td{border-bottom:0;padding:8px 14px}.audits-table td:first-child{padding-top:14px}.audits-table td:last-child{padding-bottom:14px}}
`;

const getEmptyAuthHeaders = async () => ({});

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreLabel(audit) {
  const score = Number(audit.overall_score ?? audit.report?.client_report?.overall ?? audit.report?.overall);
  return Number.isFinite(score) ? `${score.toFixed(1)}/5` : '-';
}

function typeLabel(audit) {
  return audit.audit_type_name || audit.audit_type_key || 'Advisor audit';
}

async function getJSON(path, getAuthHeaders) {
  const authHeaders = getAuthHeaders ? await getAuthHeaders() : {};
  const res = await fetch(path, {
    headers: authHeaders,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function SavedAuditsList({ devMode = false, getAuthHeaders }) {
  const [audits, setAudits] = useState([]);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [tab, setTab] = useState('mine');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Tracks whether the user explicitly chose a tab, so the superuser default
  // ("all") only applies before any manual selection.
  const tabPickedRef = useRef(false);

  const visibleAudits = useMemo(() => {
    if (isSuperuser && tab === 'all') return audits;
    return audits.filter((audit) => audit.is_owner);
  }, [audits, isSuperuser, tab]);

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJSON('/api/advisor-audits', getAuthHeaders);
      setAudits(Array.isArray(data.audits) ? data.audits : []);
      setIsSuperuser(Boolean(data.isSuperuser));
      if (data.isSuperuser) setTab((current) => (tabPickedRef.current ? current : 'all'));
    } catch (err) {
      setError(err.message || 'Could not load saved audits.');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    loadAudits();
  }, [loadAudits]);

  return (
    <div className="audits-root">
      <style>{STYLE}</style>
      <div className="audits-wrap">
        <div className="audits-top">
          <div className="audits-icon">
            <FolderOpen />
          </div>
          <div>
            <h1>Saved Audits</h1>
            <p>Tier 4 Intelligence | internal history</p>
          </div>
          {devMode ? <span className="audits-tag">Dev bypass</span> : <div className="audits-user"><UserButton afterSignOutUrl="/admin" /></div>}
        </div>

        <a className="audits-back" href="/admin"><ArrowLeft /> Back to advisor console</a>

        <div className="audits-head">
          <div>
            <div className="audits-eyebrow">Advisor Records</div>
            <h2 className="audits-title">Saved advisor audits</h2>
            <p className="audits-sub">
              Reopen drafts, review completed reports, and track audit activity as the backend fills in.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="audits-btn secondary" type="button" onClick={loadAudits}>
              <RefreshCw /> Refresh
            </button>
            <a className="audits-btn" href="/admin/audit">
              New AI Advisor Audit <ExternalLink />
            </a>
          </div>
        </div>

        {isSuperuser && (
          <div className="audits-tabs">
            <button className={`audits-tab${tab === 'mine' ? ' active' : ''}`} type="button" onClick={() => { tabPickedRef.current = true; setTab('mine'); }}>
              My Audits
            </button>
            <button className={`audits-tab${tab === 'all' ? ' active' : ''}`} type="button" onClick={() => { tabPickedRef.current = true; setTab('all'); }}>
              All Advisor Audits
            </button>
          </div>
        )}

        <div className="audits-panel">
          {loading && <div className="audits-load">Loading saved audits...</div>}
          {!loading && error && (
            <div className="audits-error">
              {error}
              <br />
              Supabase needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, plus the checked-in schema, before history can load.
            </div>
          )}
          {!loading && !error && visibleAudits.length === 0 && (
            <div className="audits-empty">No saved audits yet.</div>
          )}
          {!loading && !error && visibleAudits.length > 0 && (
            <table className="audits-table">
              <thead>
                <tr>
                  {isSuperuser && tab === 'all' ? <th>Advisor</th> : null}
                  <th>Company</th>
                  <th>Audit Type</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {visibleAudits.map((audit) => (
                  <tr key={audit.id}>
                    {isSuperuser && tab === 'all' ? (
                      <td>
                        <div>{audit.owner_name || audit.owner_email}</div>
                        <div className="audits-muted">{audit.owner_email}</div>
                      </td>
                    ) : null}
                    <td>
                      <div className="audits-company">{audit.client_name}</div>
                      {audit.client_url ? <div className="audits-muted">{audit.client_url}</div> : null}
                    </td>
                    <td>{typeLabel(audit)}</td>
                    <td>{scoreLabel(audit)}</td>
                    <td><span className="audits-tag">{audit.status || 'draft'}</span></td>
                    <td>{formatDate(audit.updated_at || audit.created_at)}</td>
                    <td>
                      <a className="audits-btn secondary" href={`/admin/audit?auditId=${encodeURIComponent(audit.id)}`}>
                        Reopen
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function ClerkAuditsShell() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  if (!isLoaded) {
    return (
      <div className="audits-auth">
        <h1>Loading advisor sign-in</h1>
        <p>Checking your advisor session.</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="audits-auth">
        <h1>Tier 4 advisor sign-in</h1>
        <p>Sign in to view saved advisor audits.</p>
        <SignIn routing="hash" forceRedirectUrl="/admin/audits" fallbackRedirectUrl="/admin/audits" />
      </div>
    );
  }

  return <SavedAuditsList getAuthHeaders={getAuthHeaders} />;
}

function MissingAuthConfig() {
  return (
    <div className="audits-root">
      <style>{STYLE}</style>
      <div className="audits-auth">
        <h1>Saved audits are not configured yet</h1>
        <p>Add Clerk keys or set VITE_AUDIT_AUTH_BYPASS=true for local testing.</p>
      </div>
    </div>
  );
}

export default function AdminAuditsPage() {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const devBypass = isAdvisorAuthBypass();

  if (devBypass) return <SavedAuditsList devMode getAuthHeaders={getEmptyAuthHeaders} />;
  if (!clerkKey) return <MissingAuthConfig />;

  return (
    <AdvisorGate>
      <div className="audits-root">
        <style>{STYLE}</style>
        <ClerkAuditsShell />
      </div>
    </AdvisorGate>
  );
}
