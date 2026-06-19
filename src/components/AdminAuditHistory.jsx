import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Clipboard,
  Download,
  ExternalLink,
  FileJson,
  Mail,
  RefreshCw,
  Trash2,
} from 'lucide-react';

const SALES_STAGES = [
  { value: 'not_started', label: 'Not started' },
  { value: 'second_call_booked', label: 'Second call booked' },
  { value: 'prd_created', label: 'PRD created' },
  { value: 'proposal_sent', label: 'Proposal sent' },
  { value: 'closed_won', label: 'Closed won' },
  { value: 'closed_lost', label: 'Closed lost' },
  { value: 'nurture', label: 'Nurture' },
];

const STYLE = `
.audit-history{margin-top:28px;background:rgba(26,31,46,.84);border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.18)}
.audit-history-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.1);flex-wrap:wrap}
.audit-history-eyebrow{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#C9A84C;margin-bottom:5px}
.audit-history-title{font-size:20px;font-weight:900;color:#fff;margin:0}
.audit-history-sub{font-size:13px;line-height:1.55;color:rgba(240,242,245,.58);margin:4px 0 0;max-width:720px}
.audit-history-head-actions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.audit-history-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:36px;border-radius:8px;background:transparent;color:rgba(240,242,245,.72);border:1px solid rgba(255,255,255,.12);font:inherit;font-size:13px;font-weight:800;padding:0 12px;cursor:pointer;text-decoration:none}
.audit-history-btn:hover{color:#F0F2F5;border-color:rgba(94,192,138,.42);background:rgba(94,192,138,.08)}
.audit-history-btn.danger{color:#FF8A8A;border-color:rgba(255,122,122,.3)}
.audit-history-btn.danger:hover{color:#FFB0B0;border-color:rgba(255,122,122,.72);background:rgba(255,122,122,.08)}
.audit-history-btn:disabled{opacity:.44;cursor:not-allowed}
.audit-history-btn svg{width:15px;height:15px}
.audit-history-table{width:100%;border-collapse:collapse;font-size:13px}
.audit-history-table th{text-align:left;color:rgba(240,242,245,.54);font-weight:800;font-size:11px;letter-spacing:.08em;text-transform:uppercase;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.1);white-space:nowrap}
.audit-history-table td{padding:13px 14px;border-bottom:1px solid rgba(255,255,255,.08);vertical-align:top}
.audit-history-row{transition:.14s;cursor:pointer}
.audit-history-row:hover,.audit-history-row.expanded{background:rgba(94,192,138,.055)}
.audit-history-company{font-weight:850;color:#fff}
.audit-history-muted{color:rgba(240,242,245,.58);font-size:12px}
.audit-history-tag{display:inline-flex;border-radius:999px;background:rgba(94,192,138,.12);border:1px solid rgba(94,192,138,.24);color:#5EC08A;font-size:11px;font-weight:850;padding:4px 8px;white-space:nowrap}
.audit-history-sales{display:inline-flex;border-radius:999px;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);color:#D7BC68;font-size:11px;font-weight:850;padding:4px 8px;white-space:nowrap}
.audit-history-chevron{width:32px;text-align:right;color:#5EC08A}
.audit-history-chevron svg{width:17px;height:17px;transition:.14s}
.audit-history-row.expanded .audit-history-chevron svg{transform:rotate(180deg)}
.audit-history-detail-cell{padding:0!important;background:rgba(11,20,38,.38);border-bottom:1px solid rgba(255,255,255,.12)!important}
.audit-history-detail{padding:18px 18px 20px;display:grid;grid-template-columns:1fr;gap:16px}
@media(min-width:840px){.audit-history-detail{grid-template-columns:1.2fr .8fr}}
.audit-history-detail h3{margin:0 0 8px;color:#fff;font-size:15px}
.audit-history-detail p{margin:0;color:rgba(240,242,245,.64);font-size:13px;line-height:1.55}
.audit-history-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}
.audit-history-stage-panel{border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(26,31,46,.58);padding:14px}
.audit-history-stage-label{font-family:"JetBrains Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#C9A84C;margin-bottom:8px}
.audit-history-stage-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.audit-history-select{min-height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:#0B1426;color:#F0F2F5;font:inherit;font-size:13px;padding:0 10px}
.audit-history-copied{color:#5EC08A;font-size:12px;font-weight:800}
.audit-history-empty,.audit-history-error,.audit-history-load{padding:22px;color:rgba(240,242,245,.66);font-size:14px;line-height:1.6}
.audit-history-error{color:#F0F2F5;background:rgba(214,106,106,.08);border-top:1px solid rgba(214,106,106,.4)}
@media(max-width:760px){.audit-history-table,.audit-history-table thead,.audit-history-table tbody,.audit-history-table tr,.audit-history-table th,.audit-history-table td{display:block}.audit-history-table thead{display:none}.audit-history-row{border-bottom:1px solid rgba(255,255,255,.1)}.audit-history-table td{border-bottom:0;padding:7px 14px}.audit-history-table td:first-child{padding-top:14px}.audit-history-table td:last-child{padding-bottom:14px}.audit-history-chevron{text-align:left}.audit-history-detail-cell{display:block!important}}
`;

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function safeFileName(value) {
  return String(value || 'advisor-audit')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'advisor-audit';
}

function scoreLabel(audit) {
  const score = Number(audit.overall_score ?? audit.report?.overall);
  const scale = Number(audit.report?.score_scale || (audit.audit_type_key === 'geo' ? 100 : 5));
  if (!Number.isFinite(score)) return '-';
  if (scale === 100) return `${Math.round(score)}/100`;
  return `${score.toFixed(1)}/5`;
}

function typeLabel(audit) {
  return audit.audit_type_name || audit.audit_type_key || 'Advisor audit';
}

function salesStageValue(audit) {
  return audit.report?.sales_stage || 'not_started';
}

function salesStageLabel(value) {
  return SALES_STAGES.find((stage) => stage.value === value)?.label || 'Not started';
}

function listText(items) {
  return Array.isArray(items) ? items.filter(Boolean).map((item) => `- ${item}`).join('\n') : '';
}

function scoreBreakdownText(scores = {}) {
  return Object.entries(scores)
    .map(([key, value]) => {
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
      return `- ${label}: ${value?.score ?? 0}/${value?.max ?? 0}`;
    })
    .join('\n');
}

function questionsText(audit) {
  return Array.isArray(audit.questions)
    ? audit.questions.map((question, index) => `${index + 1}. ${question}`).join('\n')
    : '';
}

function buildReportText(audit) {
  const report = audit.report || {};
  if (!report || !Object.keys(report).length) return '';

  if (report.geo_audit) {
    const geo = report.geo || {};
    const domain = audit.client_name || geo.domain || 'the audited website';
    const issues = Array.isArray(geo.issues) ? geo.issues.map((item) => item.text || item) : [];
    const wins = Array.isArray(geo.wins) ? geo.wins : [];
    const metadata = geo.meta || {};
    return [
      `# GEO Website Optimization Brief: ${domain}`,
      '',
      'Use this markdown as source material for an AI agent improving the website for AI search visibility, citability, and technical crawl readiness.',
      '',
      '## Audit Context',
      '',
      `- Audit type: AI Search / GEO Audit`,
      `Advisor: ${audit.owner_name || audit.owner_email || '-'}`,
      `- Domain: ${domain}`,
      `- Final URL: ${geo.url || metadata.finalUrl || audit.client_url || domain}`,
      `- Generated: ${metadata.auditGeneratedAt || audit.updated_at || ''}`,
      `- Sales stage: ${salesStageLabel(salesStageValue(audit))}`,
      `- Overall score: ${scoreLabel(audit)}${report.band ? ` (${report.band})` : ''}`,
      '',
      '## AI Agent Objective',
      '',
      `Improve ${domain} so AI search systems can clearly crawl, understand, cite, and recommend the company. Prioritize changes that increase machine-readable context, structured data, content clarity, technical crawl access, and authority signals.`,
      '',
      '## Score Breakdown',
      '',
      scoreBreakdownText(geo.scores),
      '',
      report.executive_summary ? `## Summary\n\n${report.executive_summary}\n` : '',
      wins.length ? `## What Is Working\n\n${listText(wins)}\n` : '',
      issues.length ? `## Issues To Fix\n\n${listText(issues)}\n` : '',
      '## Recommended Optimization Plan',
      '',
      '1. Confirm crawler accessibility for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and major search crawlers.',
      '2. Add or improve `llms.txt` and `llms-full.txt` so AI systems have a concise and expanded machine-readable summary.',
      '3. Strengthen homepage title, meta description, H1, service copy, location/service-area copy, and proof points.',
      '4. Add schema markup for Organization, LocalBusiness or ProfessionalService, services, FAQs, and sameAs profiles where appropriate.',
      '5. Expand sitemap coverage and make sure important service pages are crawlable and internally linked.',
      '6. Create citation-ready content blocks that answer who the company serves, what it does, where it operates, and why it is credible.',
      '',
      '## Crawl Evidence',
      '',
      '```json',
      JSON.stringify(metadata, null, 2),
      '```',
      '',
      '## Raw GEO Audit JSON',
      '',
      '```json',
      JSON.stringify(geo, null, 2),
      '```',
    ]
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  const sections = [
    `# ${audit.client_name || 'Advisor Audit'} - ${typeLabel(audit)}`,
    '',
    `Advisor: ${audit.owner_name || audit.owner_email || '-'}`,
    `Sales stage: ${salesStageLabel(salesStageValue(audit))}`,
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
              rec.internal_solution_mapping ? `Internal mapping: ${rec.internal_solution_mapping}` : '',
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

function fullAuditExport(audit) {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      sales_stage: salesStageValue(audit),
      sales_stage_label: salesStageLabel(salesStageValue(audit)),
      audit,
    },
    null,
    2,
  );
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

async function patchJSON(path, payload, getAuthHeaders) {
  const authHeaders = getAuthHeaders ? await getAuthHeaders() : {};
  const res = await fetch(path, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

async function deleteJSON(path, getAuthHeaders) {
  const authHeaders = getAuthHeaders ? await getAuthHeaders() : {};
  const res = await fetch(path, {
    method: 'DELETE',
    headers: authHeaders,
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminAuditHistory({ getAuthHeaders }) {
  const [audits, setAudits] = useState([]);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [savingStageId, setSavingStageId] = useState('');

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

  async function updateSalesStage(audit, value) {
    setSavingStageId(audit.id);
    setError('');
    try {
      const data = await patchJSON(
        `/api/advisor-audits?id=${encodeURIComponent(audit.id)}`,
        { salesStage: value },
        getAuthHeaders,
      );
      setAudits((current) => current.map((item) => (item.id === audit.id ? data.audit : item)));
    } catch (err) {
      setError(err.message || 'Could not update sales stage.');
    } finally {
      setSavingStageId('');
    }
  }

  async function deleteAudit(audit) {
    const label = audit.client_name || 'this audit';
    const ok = window.confirm(`Delete ${label}? This removes the saved audit report from Supabase.`);
    if (!ok) return;

    setDeletingId(audit.id);
    setError('');
    try {
      await deleteJSON(`/api/advisor-audits?id=${encodeURIComponent(audit.id)}`, getAuthHeaders);
      setAudits((current) => current.filter((item) => item.id !== audit.id));
      if (expandedId === audit.id) setExpandedId('');
    } catch (err) {
      setError(err.message || 'Could not delete audit.');
    } finally {
      setDeletingId('');
    }
  }

  function exportAll() {
    const payload = {
      exported_at: new Date().toISOString(),
      count: sortedAudits.length,
      audits: sortedAudits.map((audit) => ({
        ...audit,
        sales_stage: salesStageValue(audit),
        sales_stage_label: salesStageLabel(salesStageValue(audit)),
      })),
    };
    downloadText(`tier4-advisor-audits-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  return (
    <section className="audit-history" aria-label="Existing audits">
      <style>{STYLE}</style>
      <div className="audit-history-head">
        <div>
          <div className="audit-history-eyebrow">Existing Audits</div>
          <h2 className="audit-history-title">{isSuperuser ? 'All advisor audits' : 'Your advisor audits'}</h2>
          <p className="audit-history-sub">
            Click a row to expand it, download source material, update sales stage, or export records for prompt improvement.
          </p>
        </div>
        <div className="audit-history-head-actions">
          <button className="audit-history-btn" type="button" onClick={exportAll} disabled={!sortedAudits.length}>
            <FileJson /> Export all data
          </button>
          <button className="audit-history-btn" type="button" onClick={loadAudits}>
            <RefreshCw /> Refresh
          </button>
        </div>
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
              <th>Audit Status</th>
              <th>Sales Stage</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sortedAudits.map((audit) => {
              const isExpanded = expandedId === audit.id;
              const reportText = buildReportText(audit);
              const isGeoAudit = audit.report?.geo_audit || audit.audit_type_key === 'geo';
              const followupEmail = audit.followup_email || audit.followupEmail || '';
              const qText = questionsText(audit);
              const baseName = safeFileName(`${audit.client_name}-${typeLabel(audit)}`);
              return (
                <React.Fragment key={audit.id}>
                  <tr
                    className={`audit-history-row${isExpanded ? ' expanded' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? '' : audit.id)}
                  >
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
                    <td><span className="audit-history-sales">{salesStageLabel(salesStageValue(audit))}</span></td>
                    <td>{formatDate(audit.updated_at || audit.created_at)}</td>
                    <td className="audit-history-chevron"><ChevronDown /></td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td className="audit-history-detail-cell" colSpan={8}>
                        <div className="audit-history-detail">
                          <div>
                            <h3>{audit.client_name || 'Untitled company'}</h3>
                            <p>
                              {audit.research || audit.client_desc || 'No brief has been saved for this audit yet.'}
                            </p>
                            <div className="audit-history-actions">
                              <a
                                className="audit-history-btn"
                                href={`/admin/audit?auditId=${encodeURIComponent(audit.id)}`}
                                onClick={(event) => event.stopPropagation()}
                              >
                                <ExternalLink /> Open full audit
                              </a>
                              <button
                                className="audit-history-btn"
                                type="button"
                                disabled={!qText}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  downloadText(`${baseName}-questions.txt`, qText);
                                }}
                              >
                                <Download /> Download questions
                              </button>
                              <button
                                className="audit-history-btn"
                                type="button"
                                disabled={!audit.transcript}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  downloadText(`${baseName}-transcript.txt`, audit.transcript || '');
                                }}
                              >
                                <Download /> Download transcript
                              </button>
                              <button
                                className="audit-history-btn"
                                type="button"
                                disabled={!reportText}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  downloadText(
                                    `${baseName}-${isGeoAudit ? 'geo-optimization-brief' : 'report'}.md`,
                                    reportText,
                                    'text/markdown',
                                  );
                                }}
                              >
                                <Download /> {isGeoAudit ? 'Download GEO markdown' : 'Download report'}
                              </button>
                              <button
                                className="audit-history-btn"
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  downloadText(`${baseName}-full-export.json`, fullAuditExport(audit), 'application/json');
                                }}
                              >
                                <FileJson /> Export record
                              </button>
                              <button
                                className="audit-history-btn"
                                type="button"
                                disabled={!reportText}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  copyText(reportText, `${audit.id}-report`);
                                }}
                              >
                                <Clipboard /> Copy report
                              </button>
                              <button
                                className="audit-history-btn"
                                type="button"
                                disabled={!followupEmail}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  copyText(followupEmail, `${audit.id}-email`);
                                }}
                              >
                                <Mail /> Copy follow-up
                              </button>
                              <button
                                className="audit-history-btn danger"
                                type="button"
                                disabled={deletingId === audit.id}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteAudit(audit);
                                }}
                              >
                                <Trash2 /> {deletingId === audit.id ? 'Deleting...' : 'Delete audit'}
                              </button>
                            </div>
                            {copiedId.startsWith(audit.id) && <div className="audit-history-copied">Copied</div>}
                          </div>

                          <div className="audit-history-stage-panel" onClick={(event) => event.stopPropagation()}>
                            <div className="audit-history-stage-label">Sales Tracking</div>
                            <h3>Second-call / close status</h3>
                            <p>Use this to track whether audits are turning into next calls, PRDs, proposals, and wins.</p>
                            <div className="audit-history-stage-row" style={{ marginTop: 12 }}>
                              <select
                                className="audit-history-select"
                                value={salesStageValue(audit)}
                                disabled={savingStageId === audit.id}
                                onChange={(event) => updateSalesStage(audit, event.target.value)}
                              >
                                {SALES_STAGES.map((stage) => (
                                  <option key={stage.value} value={stage.value}>
                                    {stage.label}
                                  </option>
                                ))}
                              </select>
                              {savingStageId === audit.id && <span className="audit-history-muted">Saving...</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
