import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Clipboard, ExternalLink, Mail, MoreVertical, RefreshCw } from 'lucide-react';

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
.audit-history-actions{position:relative;display:flex;justify-content:flex-end}
.audit-history-menu-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:8px;background:transparent;color:#5EC08A;border:1px solid rgba(94,192,138,.3);cursor:pointer}
.audit-history-menu-btn:hover,.audit-history-menu-btn[aria-expanded="true"]{background:rgba(94,192,138,.1);border-color:rgba(94,192,138,.58)}
.audit-history-menu-btn svg{width:17px;height:17px}
.audit-history-menu{position:absolute;right:0;top:40px;z-index:20;min-width:190px;background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:6px;box-shadow:0 24px 80px rgba(0,0,0,.42)}
.audit-history-action{display:flex;align-items:center;gap:9px;width:100%;min-height:34px;border:0;border-radius:7px;background:transparent;color:#F0F2F5;text-decoration:none;font:inherit;font-size:12px;font-weight:800;padding:0 9px;cursor:pointer;text-align:left}
.audit-history-action:hover{background:rgba(94,192,138,.1);color:#5EC08A}
.audit-history-action:disabled{opacity:.42;cursor:not-allowed}
.audit-history-action svg{width:14px;height:14px;flex:0 0 auto}
.audit-history-copied{padding:5px 9px;color:#5EC08A;font-size:11px;font-weight:800}
.audit-history-empty,.audit-history-error,.audit-history-load{padding:22px;color:rgba(240,242,245,.66);font-size:14px;line-height:1.6}
.audit-history-error{color:#F0F2F5;background:rgba(214,106,106,.08);border-top:1px solid rgba(214,106,106,.4)}
@media(max-width:760px){.audit-history-table,.audit-history-table thead,.audit-history-table tbody,.audit-history-table tr,.audit-history-table th,.audit-history-table td{display:block}.audit-history-table thead{display:none}.audit-history-table tr{border-bottom:1px solid rgba(255,255,255,.1)}.audit-history-table td{border-bottom:0;padding:7px 14px}.audit-history-table td:first-child{padding-top:14px}.audit-history-table td:last-child{padding-bottom:14px}.audit-history-actions{justify-content:flex-start}.audit-history-menu{left:0;right:auto}}
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

function listText(items) {
  return Array.isArray(items) ? items.filter(Boolean).map((item) => `- ${item}`).join('\n') : '';
}

function buildReportText(audit) {
  const report = audit.report || {};
  if (!report || !Object.keys(report).length) return '';

  const title = `${audit.client_name || 'Advisor Audit'} - ${typeLabel(audit)}`;
  const sections = [
    `# ${title}`,
    '',
    `Score: ${scoreLabel(audit)}${report.band ? ` (${report.band})` : ''}`,
    report.executive_summary ? `\n## Executive Summary\n${report.executive_summary}` : '',
    report.business_risk ? `\n## Business Risk\n${report.business_risk}` : '',
    report.primary_opportunity ? `\n## Primary Opportunity\n${report.primary_opportunity}` : '',
    Array.isArray(report.topFindings) && report.topFindings.length
      ? `\n## Top Findings\n${listText(report.topFindings)}`
      : '',
    Array.isArray(report.recommendations) && report.recommendations.length
      ? `\n## Recommendations\n${report.recommendations
          .map((rec) => {
            if (typeof rec === 'string') return `- ${rec}`;
            return [
              `### ${rec.title || 'Recommendation'}`,
              rec.client_action ? `Client action: ${rec.client_action}` : '',
              rec.business_reason ? `Business reason: ${rec.business_reason}` : '',
              rec.impact ? `Impact: ${rec.impact}` : '',
              rec.effort ? `Effort: ${rec.effort}` : '',
              rec.owner ? `Owner: ${rec.owner}` : '',
            ]
              .filter(Boolean)
              .join('\n');
          })
          .join('\n\n')}`
      : '',
    report.roadmap
      ? `\n## ${report.roadmap.title || 'Roadmap'}\n${(report.roadmap.phases || [])
          .map((phase) => `### ${phase.period || ''} ${phase.theme || ''}\n${listText(phase.actions)}`)
          .join('\n\n')}`
      : '',
    report.closing ? `\n## Closing\n${report.closing}` : '',
  ];

  return sections.filter(Boolean).join('\n').trim();
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
  const [openMenuId, setOpenMenuId] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const sortedAudits = useMemo(() => audits, [audits]);

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

  async function copyText(text, id) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(''), 1600);
  }

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
      {!loading && !error && sortedAudits.length === 0 && <div className="audit-history-empty">No audits have been saved yet.</div>}
      {!loading && !error && sortedAudits.length > 0 && (
        <table className="audit-history-table">
          <thead>
            <tr>
              <th>Advisor</th>
              <th>Company</th>
              <th>Audit Type</th>
              <th>Score</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAudits.map((audit) => {
              const reportText = buildReportText(audit);
              const followupEmail = audit.followup_email || audit.followupEmail || '';
              const isOpen = openMenuId === audit.id;
              return (
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
                    <div className="audit-history-actions">
                      <button
                        className="audit-history-menu-btn"
                        type="button"
                        aria-label={`Actions for ${audit.client_name || 'audit'}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenMenuId(isOpen ? '' : audit.id)}
                      >
                        <MoreVertical />
                      </button>
                      {isOpen && (
                        <div className="audit-history-menu">
                          <a
                            className="audit-history-action"
                            href={`/admin/audit?auditId=${encodeURIComponent(audit.id)}`}
                          >
                            <ExternalLink /> Open audit
                          </a>
                          <button
                            className="audit-history-action"
                            type="button"
                            disabled={!reportText}
                            onClick={() => copyText(reportText, `${audit.id}-report`)}
                          >
                            <Clipboard /> Copy report
                          </button>
                          <button
                            className="audit-history-action"
                            type="button"
                            disabled={!followupEmail}
                            onClick={() => copyText(followupEmail, `${audit.id}-email`)}
                          >
                            <Mail /> Copy follow-up
                          </button>
                          {copiedId.startsWith(audit.id) && <div className="audit-history-copied">Copied</div>}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
