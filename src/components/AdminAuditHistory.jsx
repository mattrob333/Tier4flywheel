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
  TrendingUp,
  Pencil,
  FilePlus,
  CheckCircle2,
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
const OUTCOME_FLAGS = [
  ['proposal_requested', 'Proposal requested'],
  ['budget_discussed', 'Budget discussed'],
  ['decision_maker_identified', 'Decision maker identified'],
  ['pedigree_demo_discussed', 'Pedigree demo discussed'],
  ['geo_package_discussed', 'GEO package discussed'],
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
.audit-history-checks{display:grid;grid-template-columns:1fr;gap:7px;margin-top:12px}
.audit-history-check{display:flex;align-items:center;gap:8px;color:rgba(240,242,245,.66);font-size:12px}
.audit-history-check input{accent-color:#5EC08A}
.audit-history-copied{color:#5EC08A;font-size:12px;font-weight:800}
.audit-history-empty,.audit-history-error,.audit-history-load{padding:22px;color:rgba(240,242,245,.66);font-size:14px;line-height:1.6}
.audit-history-error{color:#F0F2F5;background:rgba(214,106,106,.08);border-top:1px solid rgba(214,106,106,.4)}
@media(max-width:760px){.audit-history-table,.audit-history-table thead,.audit-history-table tbody,.audit-history-table tr,.audit-history-table th,.audit-history-table td{display:block}.audit-history-table thead{display:none}.audit-history-row{border-bottom:1px solid rgba(255,255,255,.1)}.audit-history-table td{border-bottom:0;padding:7px 14px}.audit-history-table td:first-child{padding-top:14px}.audit-history-table td:last-child{padding-bottom:14px}.audit-history-chevron{text-align:left}.audit-history-detail-cell{display:block!important}}
.audit-history-econ{margin-top:16px;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:rgba(26,31,46,.58);padding:14px}
.audit-history-econ-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}
.audit-history-econ-title{font-size:14px;font-weight:850;color:#fff;display:flex;align-items:center;gap:8px}
.audit-history-econ-title svg{width:16px;height:16px;color:#C9A84C}
.audit-history-econ-badge{display:inline-flex;border-radius:999px;font-size:11px;font-weight:850;padding:4px 8px;white-space:nowrap}
.audit-history-econ-badge.estimated{background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.28);color:#D7BC68}
.audit-history-econ-badge.insufficient_data{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.16);color:rgba(240,242,245,.58)}
.audit-history-econ-badge.validated{background:rgba(94,192,138,.14);border:1px solid rgba(94,192,138,.3);color:#5EC08A}
.audit-history-econ-badge.revised{background:rgba(99,168,224,.14);border:1px solid rgba(99,168,224,.3);color:#6FA8E0}
.audit-history-econ-badge.rejected{background:rgba(214,106,106,.12);border:1px solid rgba(214,106,106,.3);color:#FF8A8A}
.audit-history-econ-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.audit-history-econ-stat{background:rgba(11,20,38,.5);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:9px 11px}
.audit-history-econ-stat-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(240,242,245,.5);font-weight:800;margin-bottom:3px}
.audit-history-econ-stat-value{font-size:16px;font-weight:900;color:#F0F2F5}
.audit-history-econ-stat-value.muted{color:rgba(240,242,245,.4);font-size:13px;font-weight:700}
.audit-history-econ-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.audit-history-econ-empty{color:rgba(240,242,245,.5);font-size:13px;line-height:1.5}
.econ-modal-overlay{position:fixed;inset:0;background:rgba(6,10,20,.74);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:32px 16px;overflow-y:auto}
.econ-modal{width:100%;max-width:680px;background:rgba(20,25,38,.98);border:1px solid rgba(255,255,255,.12);border-radius:14px;box-shadow:0 30px 90px rgba(0,0,0,.4);overflow:hidden}
.econ-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.econ-modal-title{font-size:16px;font-weight:900;color:#fff;display:flex;align-items:center;gap:9px}
.econ-modal-title svg{width:18px;height:18px;color:#C9A84C}
.econ-modal-close{background:transparent;border:1px solid rgba(255,255,255,.14);border-radius:8px;color:rgba(240,242,245,.7);font:inherit;font-weight:800;font-size:13px;padding:6px 11px;cursor:pointer}
.econ-modal-close:hover{color:#F0F2F5;border-color:rgba(255,255,255,.3)}
.econ-modal-body{padding:16px 18px;display:flex;flex-direction:column;gap:14px}
.econ-modal-field{display:flex;flex-direction:column;gap:5px}
.econ-modal-label{font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:rgba(240,242,245,.54);font-weight:800}
.econ-modal-input{min-height:38px;border-radius:8px;border:1px solid rgba(255,255,255,.14);background:#0B1426;color:#F0F2F5;font:inherit;font-size:14px;padding:0 11px}
.econ-modal-input:focus{outline:none;border-color:rgba(94,192,138,.5)}
.econ-modal-textarea{min-height:70px;padding:9px 11px;resize:vertical;line-height:1.5;font-size:13px}
.econ-modal-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.econ-modal-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
@media(max-width:560px){.econ-modal-row,.econ-modal-row-3{grid-template-columns:1fr}}
.econ-modal-totals{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;background:rgba(11,20,38,.5);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:11px}
.econ-modal-total-label{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:rgba(240,242,245,.5);font-weight:800;margin-bottom:2px}
.econ-modal-total-value{font-size:16px;font-weight:900;color:#5EC08A}
.econ-modal-total-value.muted{color:rgba(240,242,245,.4)}
.econ-modal-actions{display:flex;gap:10px;justify-content:flex-end;padding:14px 18px;border-top:1px solid rgba(255,255,255,.1)}
.econ-modal-save{display:inline-flex;align-items:center;gap:8px;min-height:38px;border-radius:8px;background:#5EC08A;color:#061A0E;border:none;font:inherit;font-size:14px;font-weight:900;padding:0 18px;cursor:pointer}
.econ-modal-save:disabled{opacity:.5;cursor:not-allowed}
.econ-modal-save:hover{background:#6FD49A}
.econ-modal-error{color:#FF8A8A;font-size:13px;padding:0 18px}
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
  const score = Number(audit.overall_score ?? audit.report?.client_report?.overall ?? audit.report?.overall);
  const scale = Number(audit.report?.score_scale || (audit.audit_type_key === 'geo' ? 100 : 5));
  if (!Number.isFinite(score)) return '-';
  if (scale === 100) return `${Math.round(score)}/100`;
  return `${score.toFixed(1)}/5`;
}

function typeLabel(audit) {
  return audit.audit_type_name || audit.audit_type_key || 'Advisor audit';
}

function lifecycleStatus(audit) {
  return audit.current_stage || audit.status || 'draft';
}

function salesStageValue(audit) {
  return audit.report?.sales_stage || 'not_started';
}

function salesStageLabel(value) {
  return SALES_STAGES.find((stage) => stage.value === value)?.label || 'Not started';
}

function isGeoAudit(audit) {
  return audit.report?.geo_audit || audit.audit_type_key === 'geo';
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

  // Client-facing export. New reports nest the client layer under client_report;
  // legacy reports are flat. Never export the advisor_intelligence layer.
  const r = report.client_report && typeof report.client_report === 'object' ? report.client_report : report;
  const execSummary = r.executive_summary || r.execSummary || '';
  const topFindings = r.top_findings || r.topFindings || [];
  const scorecard = r.scorecard || r.domains || [];

  const sections = [
    `# ${audit.client_name || 'Advisor Audit'} - ${typeLabel(audit)}`,
    '',
    `Advisor: ${audit.owner_name || audit.owner_email || '-'}`,
    `Sales stage: ${salesStageLabel(salesStageValue(audit))}`,
    `Score: ${scoreLabel(audit)}${r.band ? ` (${r.band})` : ''}`,
    execSummary ? `\n## Executive Summary\n${execSummary}` : '',
    r.business_risk ? `\n## Business Risk\n${r.business_risk}` : '',
    Array.isArray(topFindings) && topFindings.length ? `\n## Top Findings\n${listText(topFindings)}` : '',
    Array.isArray(scorecard) && scorecard.length
      ? `\n## Scorecard\n${scorecard
          .map((d) => `- ${d.name || 'Domain'}: ${d.score ?? '-'}/5`)
          .join('\n')}`
      : '',
    Array.isArray(r.recommendations) && r.recommendations.length
      ? `\n## Recommendations\n${r.recommendations
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
    r.roadmap
      ? `\n## ${r.roadmap.title || 'Roadmap'}\n${(r.roadmap.phases || [])
          .map((phase) => `### ${phase.period || ''} ${phase.theme || ''}\n${listText(phase.actions)}`)
          .join('\n\n')}`
      : '',
    r.closing ? `\n## Closing\n${r.closing}` : '',
  ];

  return sections.filter(Boolean).join('\n').trim();
}

/**
 * Structured economic_impact export block.
 * Surfaces the full economic extraction (variables, formulas, evidence,
 * validation questions) plus denormalized fields and validation status
 * so the learning-loop / evaluation agent can consume it without parsing
 * the raw audit row.
 */
function economicImpactExportBlock(audit) {
  const row = audit.economic_impact || null;
  return {
    has_extraction: Boolean(row) || Boolean(audit.economic_impact_status),
    status: row?.status || audit.economic_impact_status || null,
    currency: row?.currency || 'USD',
    annual_cost_estimate: row?.annual_cost_estimate ?? audit.economic_annual_cost_estimate ?? null,
    annual_savings_low: row?.annual_savings_low ?? null,
    annual_savings_high: row?.annual_savings_high ?? null,
    confidence: row?.confidence || audit.economic_confidence || null,
    summary: audit.economic_summary || null,
    validated: Boolean(audit.economic_validated),
    variables: row?.variables || null,
    formulas: row?.formulas || null,
    evidence_quotes: row?.evidence_quotes || [],
    assumptions: row?.assumptions || [],
    missing_inputs: row?.missing_inputs || [],
    validation_questions: row?.validation_questions || [],
  };
}

/**
 * Structured proposal export block.
 * Includes the Phase 4 value_case block and economic linkage fields.
 */
function proposalExportBlock(audit) {
  const p = audit.proposal || null;
  return {
    generated: Boolean(p),
    type: p?.proposal_type || null,
    status: p?.proposal_status || audit.proposal_status || null,
    proposal_json: p?.proposal_json || null,
    proposal_text: p?.proposal_text || null,
    estimated_value: p?.estimated_value || null,
    economic_impact_id: p?.economic_impact_id || null,
    includes_value_case: Boolean(p?.includes_value_case),
    investment_low: p?.investment_low ?? null,
    investment_high: p?.investment_high ?? null,
    payback_low: p?.payback_low ?? null,
    payback_high: p?.payback_high ?? null,
    value_case: p?.proposal_json?.value_case || null,
  };
}

/**
 * Structured readout export block.
 * Includes economics validation outcome fields persisted in Phase 3.
 */
function readoutExportBlock(audit) {
  const r = audit.readout || null;
  return {
    guide_json: r?.readout_guide_json || null,
    guide_text: r?.readout_guide_text || null,
    transcript: r?.readout_transcript_text || null,
    advisor_notes: r?.advisor_notes || null,
    client_agreement_level: r?.client_agreement_level || audit.client_agreement_level || null,
    client_interest_level: r?.client_interest_level || audit.client_interest_level || null,
    selected_next_step: r?.selected_next_step || audit.selected_next_step || null,
    proposal_requested: Boolean(r?.proposal_requested || audit.proposal_requested),
    objections: r?.objections || [],
    economics_discussed: Boolean(r?.economics_discussed),
    economics_validated: Boolean(r?.economics_validated),
    economics_revised: Boolean(r?.economics_revised),
  };
}

function fullAuditExport(audit) {
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      sales_stage: salesStageValue(audit),
      sales_stage_label: salesStageLabel(salesStageValue(audit)),
      economic_impact: economicImpactExportBlock(audit),
      readout: readoutExportBlock(audit),
      proposal: proposalExportBlock(audit),
      audit,
    },
    null,
    2,
  );
}

function proposalText(audit) {
  return audit.proposal?.proposal_text || '';
}

function readoutGuideText(audit) {
  return audit.readout?.readout_guide_text || '';
}

function formatEconMoney(value, currency = 'USD') {
  if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return '';
  const symbol = currency === 'USD' ? '$' : '';
  return `${symbol}${Number(value).toLocaleString('en-US')}`;
}

function formatEconRange(low, high, currency = 'USD') {
  const lo = formatEconMoney(low, currency);
  const hi = formatEconMoney(high, currency);
  if (!lo && !hi) return '';
  if (lo && hi && lo === hi) return lo;
  if (!lo) return `up to ${hi}`;
  if (!hi) return `${lo}+`;
  return `${lo} – ${hi}`;
}

const ECON_STATUS_LABELS = {
  estimated: 'Estimated',
  insufficient_data: 'Insufficient data',
  validated: 'Validated',
  revised: 'Revised',
  rejected: 'Rejected',
};

function economicCardData(audit) {
  const row = audit.economic_impact || null;
  // Fall back to denormalized fields on advisor_audits when no full row is attached.
  const status = row?.status || audit.economic_impact_status || '';
  const currency = row?.currency || 'USD';
  const annualCost = row?.annual_cost_estimate ?? audit.economic_annual_cost_estimate ?? null;
  const savingsLow = row?.annual_savings_low ?? null;
  const savingsHigh = row?.annual_savings_high ?? null;
  const confidence = row?.confidence || audit.economic_confidence || '';
  const validated = Boolean(audit.economic_validated);
  const hasAny =
    annualCost !== null ||
    savingsLow !== null ||
    savingsHigh !== null ||
    Boolean(row) ||
    Boolean(audit.economic_impact_status);
  return {
    hasAny,
    row,
    status: status || 'estimated',
    statusLabel: ECON_STATUS_LABELS[status] || (status || 'Estimated'),
    currency,
    annualCost,
    savingsRange: formatEconRange(savingsLow, savingsHigh, currency),
    confidence,
    validated,
  };
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

async function postJSON(path, payload, getAuthHeaders) {
  const authHeaders = getAuthHeaders ? await getAuthHeaders() : {};
  const res = await fetch(path, {
    method: 'POST',
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
  const [editingEcon, setEditingEcon] = useState(null);
  const [econDraft, setEconDraft] = useState(null);
  const [savingEcon, setSavingEcon] = useState(false);
  const [econError, setEconError] = useState('');

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
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(''), 1600);
    } catch {
      setError('Could not copy to the clipboard.');
    }
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
      // Keep the attached artifacts if the API response doesn't include them —
      // otherwise the row's readout/proposal/economics UI would blank out.
      setAudits((current) =>
        current.map((item) =>
          item.id === audit.id
            ? {
                ...item,
                ...data.audit,
                readout: data.audit?.readout ?? item.readout,
                proposal: data.audit?.proposal ?? item.proposal,
                economic_impact: data.audit?.economic_impact ?? item.economic_impact,
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err.message || 'Could not update sales stage.');
    } finally {
      setSavingStageId('');
    }
  }

  async function generateReadoutGuide(audit) {
    setSavingStageId(audit.id);
    setError('');
    try {
      await postJSON('/api/audit-readout-guide', { audit_id: audit.id, readout_id: audit.readout?.id }, getAuthHeaders);
      await loadAudits();
    } catch (err) {
      setError(err.message || 'Could not generate readout guide.');
    } finally {
      setSavingStageId('');
    }
  }

  async function generateProposal(audit) {
    setSavingStageId(audit.id);
    setError('');
    try {
      await postJSON(
        '/api/audit-proposal',
        {
          audit_id: audit.id,
          readout_id: audit.readout?.id,
          proposal_type: audit.readout?.selected_next_step || 'AI recommend',
        },
        getAuthHeaders,
      );
      await loadAudits();
    } catch (err) {
      setError(err.message || 'Could not generate proposal.');
    } finally {
      setSavingStageId('');
    }
  }

  function openEconModal(audit) {
    const row = audit.economic_impact;
    if (!row) return;
    const variables = row.variables || {};
    setEconError('');
    setEconDraft({
      id: row.id,
      auditId: audit.id,
      status: row.status || 'estimated',
      currency: row.currency || 'USD',
      annual_cost_estimate: row.annual_cost_estimate ?? '',
      annual_savings_low: row.annual_savings_low ?? '',
      annual_savings_high: row.annual_savings_high ?? '',
      confidence: row.confidence || '',
      improvement_target: variables.improvement_target || '',
      assumptions: Array.isArray(row.assumptions) ? row.assumptions.join('\n') : '',
      missing_inputs: Array.isArray(row.missing_inputs) ? row.missing_inputs.join('\n') : '',
      client_validation_notes: row.client_validation_notes || '',
      formula: (row.formulas && row.formulas.formula) || '',
      calculation_basis: (row.formulas && row.formulas.calculation_basis) || '',
    });
    setEditingEcon(audit);
  }

  function closeEconModal() {
    setEditingEcon(null);
    setEconDraft(null);
    setEconError('');
  }

  function updateEconField(key, value) {
    setEconDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function saveEcon() {
    if (!econDraft) return;
    setSavingEcon(true);
    setEconError('');
    const payload = {
      status: econDraft.status,
      confidence: econDraft.confidence,
      annual_cost_estimate: econDraft.annual_cost_estimate,
      annual_savings_low: econDraft.annual_savings_low,
      annual_savings_high: econDraft.annual_savings_high,
      client_validation_notes: econDraft.client_validation_notes,
      assumptions: econDraft.assumptions
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      missing_inputs: econDraft.missing_inputs
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      variables: {
        ...((editingEcon?.economic_impact && editingEcon.economic_impact.variables) || {}),
        improvement_target: econDraft.improvement_target,
      },
    };
    try {
      await patchJSON(
        `/api/audit-economic-impact?id=${encodeURIComponent(econDraft.id)}`,
        payload,
        getAuthHeaders,
      );
      await loadAudits();
      closeEconModal();
    } catch (err) {
      setEconError(err.message || 'Could not save economic revisions.');
    } finally {
      setSavingEcon(false);
    }
  }

  async function toggleOutcome(audit, key, value) {
    setSavingStageId(audit.id);
    setError('');
    try {
      await postJSON(
        '/api/audit-readout-transcript',
        {
          audit_id: audit.id,
          readout_id: audit.readout?.id,
          readout_guide_json: audit.readout?.readout_guide_json || null,
          readout_guide_text: audit.readout?.readout_guide_text || '',
          readout_transcript_text: audit.readout?.readout_transcript_text || '',
          advisor_notes: audit.readout?.advisor_notes || '',
          readout_call_date: audit.readout?.readout_call_date || null,
          participants: audit.readout?.participants || '',
          client_agreement_level: audit.readout?.client_agreement_level || null,
          client_interest_level: audit.readout?.client_interest_level || null,
          selected_next_step: audit.readout?.selected_next_step || null,
          proposal_requested: Boolean(audit.readout?.proposal_requested),
          prd_requested: Boolean(audit.readout?.prd_requested),
          geo_package_discussed: Boolean(audit.readout?.geo_package_discussed),
          pedigree_demo_discussed: Boolean(audit.readout?.pedigree_demo_discussed),
          budget_discussed: Boolean(audit.readout?.budget_discussed),
          decision_maker_identified: Boolean(audit.readout?.decision_maker_identified),
          timeline_discussed: Boolean(audit.readout?.timeline_discussed),
          objections: audit.readout?.objections || [],
          [key]: value,
        },
        getAuthHeaders,
      );
      await loadAudits();
    } catch (err) {
      setError(err.message || 'Could not update outcome.');
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
    const advisorAudits = sortedAudits.filter((audit) => !isGeoAudit(audit));
    const payload = {
      exported_at: new Date().toISOString(),
      purpose: 'Advisor audit prompt and report improvement. GEO audits are intentionally excluded.',
      count: advisorAudits.length,
      excluded_geo_count: sortedAudits.length - advisorAudits.length,
      audits: advisorAudits.map((audit) => ({
        ...audit,
        sales_stage: salesStageValue(audit),
        sales_stage_label: salesStageLabel(salesStageValue(audit)),
        economic_impact: economicImpactExportBlock(audit),
        readout: readoutExportBlock(audit),
        proposal: proposalExportBlock(audit),
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
          <button
            className="audit-history-btn"
            type="button"
            onClick={exportAll}
            disabled={!sortedAudits.some((audit) => !isGeoAudit(audit))}
          >
            <FileJson /> Export advisor audits
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
              const isGeo = isGeoAudit(audit);
              const followupEmail = audit.followup_email || audit.followupEmail || '';
              const qText = questionsText(audit);
              const pText = proposalText(audit);
              const rText = readoutGuideText(audit);
              const baseName = safeFileName(`${audit.client_name}-${typeLabel(audit)}`);
              const econ = economicCardData(audit);
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
                    <td><span className="audit-history-tag">{lifecycleStatus(audit)}</span></td>
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
                                    `${baseName}-${isGeo ? 'geo-optimization-brief' : 'report'}.md`,
                                    reportText,
                                    'text/markdown',
                                  );
                                }}
                              >
                                <Download /> {isGeo ? 'Download GEO markdown' : 'Download report'}
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
                                <Clipboard /> {isGeo ? 'Copy GEO markdown' : 'Copy report'}
                              </button>
                              {!isGeo && (
                                <>
                                  <button
                                    className="audit-history-btn"
                                    type="button"
                                    disabled={!audit.report || savingStageId === audit.id}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      generateReadoutGuide(audit);
                                    }}
                                  >
                                    <RefreshCw /> {rText ? 'Regenerate Readout Guide' : 'Generate Readout Guide'}
                                  </button>
                                  <a
                                    className="audit-history-btn"
                                    href={`/admin/audit?auditId=${encodeURIComponent(audit.id)}`}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <ExternalLink /> {audit.readout?.readout_transcript_text ? 'Continue Readout' : 'Paste Readout Transcript'}
                                  </a>
                                  <button
                                    className="audit-history-btn"
                                    type="button"
                                    disabled={!audit.readout?.readout_transcript_text || savingStageId === audit.id}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      generateProposal(audit);
                                    }}
                                  >
                                    <RefreshCw /> {pText ? 'Regenerate Proposal' : 'Generate Proposal'}
                                  </button>
                                  <button
                                    className="audit-history-btn"
                                    type="button"
                                    disabled={!pText}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      downloadText(`${baseName}-proposal.md`, pText, 'text/markdown');
                                    }}
                                  >
                                    <Download /> Download Proposal
                                  </button>
                                  <button
                                    className="audit-history-btn"
                                    type="button"
                                    disabled={!pText}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      copyText(pText, `${audit.id}-proposal`);
                                    }}
                                  >
                                    <Clipboard /> Copy Proposal
                                  </button>
                                </>
                              )}
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

                            {isSuperuser && (
                            <div className="audit-history-econ" onClick={(event) => event.stopPropagation()}>
                              <div className="audit-history-econ-head">
                                <div className="audit-history-econ-title">
                                  <TrendingUp /> Economic Opportunity
                                </div>
                                <span className={`audit-history-econ-badge ${econ.status}`}>
                                  {econ.validated && econ.status === 'estimated' ? 'Validated' : econ.statusLabel}
                                </span>
                              </div>
                              {econ.hasAny ? (
                                <>
                                  <div className="audit-history-econ-grid">
                                    <div className="audit-history-econ-stat">
                                      <div className="audit-history-econ-stat-label">Annual cost</div>
                                      <div className="audit-history-econ-stat-value">
                                        {econ.annualCost !== null
                                          ? formatEconMoney(econ.annualCost, econ.currency)
                                          : '—'}
                                      </div>
                                    </div>
                                    <div className="audit-history-econ-stat">
                                      <div className="audit-history-econ-stat-label">Savings range / yr</div>
                                      <div className="audit-history-econ-stat-value">
                                        {econ.savingsRange || '—'}
                                      </div>
                                    </div>
                                    <div className="audit-history-econ-stat">
                                      <div className="audit-history-econ-stat-label">Confidence</div>
                                      <div className={`audit-history-econ-stat-value${econ.confidence ? '' : ' muted'}`}>
                                        {econ.confidence ? econ.confidence.charAt(0).toUpperCase() + econ.confidence.slice(1) : 'Not set'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="audit-history-econ-actions">
                                    <button
                                      className="audit-history-btn"
                                      type="button"
                                      disabled={!econ.row}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openEconModal(audit);
                                      }}
                                    >
                                      <Pencil /> View / Edit
                                    </button>
                                    <button
                                      className="audit-history-btn"
                                      type="button"
                                      disabled={!econ.row}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        // Wired in Phase 3.6 — adds economics to the readout assistant Card 3.
                                      }}
                                    >
                                      <CheckCircle2 /> Add to Readout
                                    </button>
                                    <button
                                      className="audit-history-btn"
                                      type="button"
                                      disabled={!econ.row}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        // Wired in Phase 4 — includes the value case in the proposal.
                                      }}
                                    >
                                      <FilePlus /> Include in Proposal
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p className="audit-history-econ-empty">
                                  Economic impact not yet quantified for this audit. Run the discovery transcript through
                                  the economic extraction step to populate annual cost, savings range, and confidence.
                                </p>
                              )}
                            </div>
                            )}
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
                            {!isGeo && (
                              <div className="audit-history-checks">
                                {OUTCOME_FLAGS.map(([key, label]) => (
                                  <label className="audit-history-check" key={key}>
                                    <input
                                      type="checkbox"
                                      checked={Boolean(audit.readout?.[key] || audit[key])}
                                      disabled={savingStageId === audit.id}
                                      onChange={(event) => toggleOutcome(audit, key, event.target.checked)}
                                    />
                                    {label}
                                  </label>
                                ))}
                              </div>
                            )}
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

      {editingEcon && econDraft && (
        <div
          className="econ-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeEconModal();
          }}
        >
          <div className="econ-modal" onClick={(event) => event.stopPropagation()}>
            <div className="econ-modal-head">
              <div className="econ-modal-title">
                <TrendingUp /> Edit Economic Opportunity
              </div>
              <button className="econ-modal-close" type="button" onClick={closeEconModal}>
                Close
              </button>
            </div>
            <div className="econ-modal-body">
              <div className="econ-modal-row-3">
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Annual cost (USD)</label>
                  <input
                    className="econ-modal-input"
                    type="number"
                    value={econDraft.annual_cost_estimate}
                    onChange={(event) => updateEconField('annual_cost_estimate', event.target.value)}
                  />
                </div>
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Savings low (USD)</label>
                  <input
                    className="econ-modal-input"
                    type="number"
                    value={econDraft.annual_savings_low}
                    onChange={(event) => updateEconField('annual_savings_low', event.target.value)}
                  />
                </div>
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Savings high (USD)</label>
                  <input
                    className="econ-modal-input"
                    type="number"
                    value={econDraft.annual_savings_high}
                    onChange={(event) => updateEconField('annual_savings_high', event.target.value)}
                  />
                </div>
              </div>

              <div className="econ-modal-row">
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Confidence</label>
                  <select
                    className="econ-modal-input"
                    value={econDraft.confidence}
                    onChange={(event) => updateEconField('confidence', event.target.value)}
                  >
                    <option value="">Not set</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Status</label>
                  <select
                    className="econ-modal-input"
                    value={econDraft.status}
                    onChange={(event) => updateEconField('status', event.target.value)}
                  >
                    <option value="estimated">Estimated</option>
                    <option value="insufficient_data">Insufficient data</option>
                    <option value="validated">Validated</option>
                    <option value="revised">Revised</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="econ-modal-totals">
                <div>
                  <div className="econ-modal-total-label">Annual cost</div>
                  <div className={`econ-modal-total-value${econDraft.annual_cost_estimate === '' ? ' muted' : ''}`}>
                    {econDraft.annual_cost_estimate !== '' ? formatEconMoney(econDraft.annual_cost_estimate) : '—'}
                  </div>
                </div>
                <div>
                  <div className="econ-modal-total-label">Savings range / yr</div>
                  <div className={`econ-modal-total-value${!econDraft.annual_savings_low && !econDraft.annual_savings_high ? ' muted' : ''}`}>
                    {formatEconRange(econDraft.annual_savings_low, econDraft.annual_savings_high) || '—'}
                  </div>
                </div>
                <div>
                  <div className="econ-modal-total-label">Net (high − cost)</div>
                  <div
                    className={`econ-modal-total-value${
                      econDraft.annual_cost_estimate === '' || econDraft.annual_savings_high === '' ? ' muted' : ''
                    }`}
                  >
                    {econDraft.annual_cost_estimate !== '' && econDraft.annual_savings_high !== ''
                      ? formatEconMoney(Number(econDraft.annual_savings_high) - Number(econDraft.annual_cost_estimate))
                      : '—'}
                  </div>
                </div>
              </div>

              <div className="econ-modal-field">
                <label className="econ-modal-label">Improvement target</label>
                <input
                  className="econ-modal-input"
                  type="text"
                  value={econDraft.improvement_target}
                  onChange={(event) => updateEconField('improvement_target', event.target.value)}
                />
              </div>

              <div className="econ-modal-field">
                <label className="econ-modal-label">Formula</label>
                <input
                  className="econ-modal-input"
                  type="text"
                  value={econDraft.formula}
                  disabled
                  title="Formula is extracted by the LLM and shown read-only"
                />
              </div>

              <div className="econ-modal-row">
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Assumptions (one per line)</label>
                  <textarea
                    className="econ-modal-input econ-modal-textarea"
                    value={econDraft.assumptions}
                    onChange={(event) => updateEconField('assumptions', event.target.value)}
                  />
                </div>
                <div className="econ-modal-field">
                  <label className="econ-modal-label">Missing inputs (one per line)</label>
                  <textarea
                    className="econ-modal-input econ-modal-textarea"
                    value={econDraft.missing_inputs}
                    onChange={(event) => updateEconField('missing_inputs', event.target.value)}
                  />
                </div>
              </div>

              <div className="econ-modal-field">
                <label className="econ-modal-label">Client validation notes</label>
                <textarea
                  className="econ-modal-input econ-modal-textarea"
                  value={econDraft.client_validation_notes}
                  onChange={(event) => updateEconField('client_validation_notes', event.target.value)}
                  placeholder="Notes from the readout conversation about whether the client confirmed or revised these numbers…"
                />
              </div>
            </div>

            {econError && <div className="econ-modal-error">{econError}</div>}

            <div className="econ-modal-actions">
              <button className="econ-modal-close" type="button" onClick={closeEconModal} disabled={savingEcon}>
                Cancel
              </button>
              <button className="econ-modal-save" type="button" onClick={saveEcon} disabled={savingEcon}>
                {savingEcon ? 'Saving…' : 'Save revisions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
