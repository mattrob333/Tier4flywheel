import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

const STYLE = `
.audit-history{margin-top:28px;background:rgba(26,31,46,.84);border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.18)}
.audit-history-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.1);flex-wrap:wrap}
.audit-history-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:5px}
.audit-history-title{font-size:20px;font-weight:900;color:#fff;margin:0}
.audit-history-sub{font-size:13px;line-height:1.55;color:rgba(240,242,245,.58);margin:4px 0 0;max-width:720px}
.audit-history-refresh{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:36px;border-radius:8px;background:transparent;color:rgba(240,242,245,.68);border:1px solid rgba(255,255,255,.12);font:inherit;font-size:13px;font-weight:800;padding:0 12px;cursor:pointer}
.audit-history-refresh:hover{color:#F0F2F5;border-color:rgba(94,192,138,.42)}
.audit-history-refresh svg{width:15px;height:15px}
.audit-history-table{width:100%;border-collapse:collapse;font-size:13px}
.audit-history-table th{text-align:left;color:rgba(240,242,245,.54);font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.1);white-space:nowrap}
.audit-history-table td{padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
.audit-history-table tr:last-child td{border-bottom:0}
.audit-history-table tbody tr{transition:.14s}
.audit-history-table tbody tr:hover{background:rgba(94,192,138,.055)}
.audit-history-company{font-weight:850;color:#fff}
.audit-history-muted{color:rgba(240,242,245,.58);font-size:12px}
.audit-history-tag{display:inline-flex;border-radius:999px;background:rgba(94,192,138,.12);border:1px solid rgba(94,192,138,.24);color:#5EC08A;font-size:11px;font-weight:850;padding:4px 8px;white-space:nowrap}
.audit-history-open{display:inline-flex;align-items:center;justify-content:center;min-height:32px;border-radius:8px;background:transparent;color:#5EC08A;border:1px solid rgba(94,192,138,.3);text-decoration:none;font-size:12px;font-weight:900;padding:0 11px}
.audit-history-open:hover{background:rgba(94,192,138,.1)}
.audit-history-empty,.audit-history-error,.audit-history-load{padding:22px;color:rgba(240,242,245,.66);font-size:14px;line-height:1.6}
.audit-history-error{color:#F0F2F5;background:rgba(214,106,106,.08);border-top:1px solid rgba(214,106,106,.4)}
@media(max-width:760px){.audit-history-table,.audit-history-table thead,.audit-history-table tbody,.audit-history-table tr,.audit-history-table th,.audit-history-table td{display:block}.audit-history-table thead{display:none}.audit-history-table tr{border-bottom:1px solid rgba(255,255,255,.1)}.audit-history-table td{border-bottom:0;padding:7px 14px}.audit-history-table td:first-child{padding-top:14px}.audit-history-table td:last-child{padding-bottom:14px}}
`;

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreLabel(audit) {
  const score = Number(audit.overall_score ?? audit.report?.overall);
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

export default function AdminAuditHistory({ getAuthHeaders }) {
  const [audits, setAudits] = useState([]);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAudits = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJSON('/api/advisor-audits', getAuthHeaders);
      setAudits(Array.isArray(data.audits) ? data.audits : []);
      setIsSuperuser(Boolean(data.isSuperuser));
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
    <section className="audit-history" aria-label="Existing audits">
      <style>{STYLE}</style>
      <div className="audit-history-head">
        <div>
          <div className="audit-history-eyebrow">Existing Audits</div>
          <h2 className="audit-history-title">{isSuperuser ? 'All advisor audits' : 'Your advisor audits'}</h2>
          <p className="audit-history-sub">
            Review companies, advisors, scores, and current status. Open any row to continue the audit or review the report.
          </p>
        </div>
        <button className="audit-history-refresh" type="button" onClick={loadAudits}>
          <RefreshCw /> Refresh
        </button>
      </div>

      {loading && <div className="audit-history-load">Loading audit history...</div>}
      {!loading && error && <div className="audit-history-error">{error}</div>}
      {!loading && !error && audits.length === 0 && <div className="audit-history-empty">No audits have been saved yet.</div>}
      {!loading && !error && audits.length > 0 && (
        <table className="audit-history-table">
          <thead>
            <tr>
              <th>Advisor</th>
              <th>Company</th>
              <th>Audit Type</th>
              <th>Score</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Open</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((audit) => (
              <tr key={audit.id}>
                <td>
                  <div>{audit.owner_name || audit.owner_email || '-'}</div>
                  {audit.owner_email ? <div className="audit-history-muted">{audit.owner_email}</div> : null}
                </td>
                <td>
                  <div className="audit-history-company">{audit.client_name || 'Untitled company'}</div>
                  {audit.client_url ? <div className="audit-history-muted">{audit.client_url}</div> : null}
                </td>
                <td>{typeLabel(audit)}</td>
                <td>{scoreLabel(audit)}</td>
                <td><span className="audit-history-tag">{audit.status || 'draft'}</span></td>
                <td>{formatDate(audit.updated_at || audit.created_at)}</td>
                <td>
                  <a className="audit-history-open" href={`/admin/audit?auditId=${encodeURIComponent(audit.id)}`}>
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
