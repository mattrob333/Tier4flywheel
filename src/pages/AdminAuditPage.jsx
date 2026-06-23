import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SignIn, UserButton, useAuth } from '@clerk/react';
import { ArrowLeft, ArrowRight, Clipboard, Download, Mail, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import AdvisorGate from '../components/AdvisorGate';
import Markdown from '../components/Markdown';
import { isAdvisorAuthBypass } from '../lib/advisorAuthBypass';
import { AUDIT_TYPES, getAuditType } from '../lib/advisorAuditTypes';
import { normalizeReport } from '../lib/reportShape';

const STYLE = `
:root{--t4-ink:#0B1426;--t4-panel:#1A1F2E;--t4-panel2:#0F172A;--t4-line:rgba(255,255,255,.1);--t4-txt:#F0F2F5;--t4-mut:rgba(240,242,245,.62);--t4-amber:#C9A84C;--t4-amber-dim:rgba(201,168,76,.76);--t4-steel:#5EC08A;--t4-good:#5EC08A;--t4-warn:#C9A84C;--t4-bad:#d66a6a;--t4-r:8px}
.t4-root{background:var(--t4-ink);color:var(--t4-txt);min-height:100vh;font-family:Inter,system-ui,sans-serif;line-height:1.5}
.t4-root *{box-sizing:border-box}
.t4-wrap{max-width:920px;margin:0 auto;padding:28px 20px 80px}
.t4-mono{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
.t4-top{display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--t4-line);padding-bottom:16px;margin-bottom:22px}
.t4-brand-icon{width:44px;height:44px;object-fit:contain;flex:0 0 44px;filter:drop-shadow(0 0 16px rgba(94,192,138,.3))}
.t4-top h1{font-size:18px;font-weight:700;margin:0;letter-spacing:-.01em;color:#fff}
.t4-top p{margin:0;font-size:12px;color:var(--t4-mut)}
.t4-user{margin-left:auto;display:flex;align-items:center;gap:10px}
.t4-dashboard-row{display:flex;justify-content:flex-start;margin:-8px 0 22px}
.t4-dashboard-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:38px;border-radius:var(--t4-r);border:1px solid rgba(94,192,138,.34);background:rgba(94,192,138,.1);color:var(--t4-txt);font-size:13px;font-weight:800;text-decoration:none;padding:8px 13px;box-shadow:0 0 24px rgba(94,192,138,.08)}
.t4-dashboard-link:hover{background:rgba(94,192,138,.16);border-color:var(--t4-steel);transform:translateY(-1px)}
.t4-dashboard-link svg{width:16px;height:16px}
.t4-steps{display:flex;gap:6px;margin-bottom:26px;flex-wrap:wrap}
.t4-step{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t4-mut);padding:7px 12px;border:1px solid var(--t4-line);border-radius:20px}
.t4-step .num{font-family:"IBM Plex Mono",ui-monospace,monospace;width:18px;height:18px;border-radius:50%;background:var(--t4-line);color:var(--t4-txt);display:flex;align-items:center;justify-content:center;font-size:11px}
.t4-step.act{border-color:var(--t4-good);color:var(--t4-txt)}
.t4-step.act .num{background:var(--t4-good);color:#fff}
.t4-step.done .num{background:var(--t4-good);color:var(--t4-ink)}
.t4-eyebrow{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--t4-amber-dim);margin-bottom:8px}
.t4-h2{font-size:24px;font-weight:700;margin:0 0 6px;color:#fff;letter-spacing:-.02em}
.t4-sub{color:var(--t4-mut);font-size:14px;margin:0 0 24px;max-width:64ch}
.t4-field{margin-bottom:18px}
.t4-field label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
.t4-field .hint{color:var(--t4-mut);font-weight:400;font-size:12px}
.t4-input,.t4-area{width:100%;background:var(--t4-panel2);border:1px solid var(--t4-line);color:var(--t4-txt);border-radius:var(--t4-r);padding:10px 12px;font-size:14px;font-family:inherit}
.t4-area{min-height:90px;resize:vertical;line-height:1.55}
.t4-area.big{min-height:260px}
.t4-input:focus,.t4-area:focus{outline:none;border-color:var(--t4-good)}
.t4-row{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:600px){.t4-row{grid-template-columns:1fr 1fr}}
.t4-btn,.t4-ghost{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:var(--t4-r);cursor:pointer;font-family:inherit;transition:.15s;min-height:40px}
.t4-btn{background:var(--t4-good);color:#fff;border:none;font-weight:700;font-size:14px;padding:11px 18px;box-shadow:0 0 24px rgba(94,192,138,.2)}
.t4-btn:hover{background:#6dcc98}
.t4-btn:disabled{opacity:.5;cursor:not-allowed}
.t4-ghost{background:none;border:1px solid var(--t4-line);color:var(--t4-mut);font-size:13px;padding:9px 14px}
.t4-ghost:hover{color:var(--t4-txt);border-color:var(--t4-steel)}
.t4-ghost.danger{color:#FF8A8A;border-color:rgba(255,122,122,.34)}
.t4-ghost.danger:hover{color:#FFB0B0;border-color:rgba(255,122,122,.72);background:rgba(255,122,122,.08)}
.t4-btn svg,.t4-ghost svg{width:16px;height:16px}
.t4-btnrow{display:flex;gap:10px;align-items:center;margin-top:18px;flex-wrap:wrap}
.t4-load{text-align:center;padding:70px 0}
.t4-spin{width:34px;height:34px;border:3px solid var(--t4-line);border-top-color:var(--t4-amber);border-radius:50%;margin:0 auto 18px;animation:t4spin 1s linear infinite}
@keyframes t4spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion){.t4-spin{animation:none}}
.t4-load p{color:var(--t4-mut);font-size:14px}
.t4-err{background:var(--t4-panel);border:1px solid var(--t4-bad);border-left-width:3px;border-radius:var(--t4-r);padding:14px 16px;font-size:13px;margin:16px 0}
.t4-brief{background:var(--t4-panel);border:1px solid var(--t4-line);border-left:3px solid var(--t4-steel);border-radius:0 var(--t4-r) var(--t4-r) 0;padding:14px 18px;margin-bottom:20px}
.t4-brief .glab{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--t4-steel);margin-bottom:6px}
.t4-brief p{font-size:14px;margin:0}
.t4-qlist{counter-reset:q;list-style:none;padding:0;margin:0}
.t4-qlist li{background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:12px 14px 12px 44px;margin-bottom:8px;position:relative;font-size:14px}
.t4-qlist li::before{counter-increment:q;content:counter(q);position:absolute;left:12px;top:12px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:12px;color:var(--t4-amber);background:var(--t4-panel2);width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center}
.t4-toast{font-size:12px;color:var(--t4-good);margin-left:8px}
.t4-copybox{width:100%;min-height:130px;background:var(--t4-panel2);border:1px solid var(--t4-steel);color:var(--t4-txt);border-radius:var(--t4-r);padding:10px 12px;font-size:12px;font-family:"IBM Plex Mono",ui-monospace,monospace;line-height:1.45;margin-top:10px}
.t4-rep-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:22px}
.t4-score-big{text-align:center;background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:16px 22px;min-width:140px}
.t4-score-big .n{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:40px;font-weight:700;color:var(--t4-good);line-height:1}
.t4-score-big .b{font-size:12px;color:var(--t4-mut);margin-top:4px;letter-spacing:.08em;text-transform:uppercase}
.t4-sec{margin:24px 0}
.t4-sec h3{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--t4-amber-dim);border-bottom:1px solid var(--t4-line);padding-bottom:8px;margin:0 0 14px;font-weight:700}
.t4-geo-grid{display:grid;grid-template-columns:1fr;gap:10px}
@media(min-width:720px){.t4-geo-grid{grid-template-columns:1fr 1fr}}
.t4-geo-metric{background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:12px 14px}
.t4-geo-metric .gm-label{font-size:12px;color:var(--t4-mut);margin-bottom:5px}
.t4-geo-metric .gm-value{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:18px;color:#fff}
.t4-codeblock{background:var(--t4-panel2);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:12px;max-height:300px;overflow:auto;font-size:12px;color:var(--t4-mut);white-space:pre-wrap}
.t4-gauge{display:flex;align-items:center;gap:10px;margin:6px 0}
.t4-gauge .gn{font-size:13px;flex:1}
.t4-bars{display:flex;gap:3px}
.t4-pip{width:18px;height:8px;border-radius:2px;background:var(--t4-line)}
.t4-pip.on{background:var(--t4-good)}
.t4-gauge .gv{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:13px;color:var(--t4-good);width:30px;text-align:right}
.t4-finding{background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:14px 16px;margin-bottom:10px}
.t4-finding .ft{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;gap:12px}
.t4-finding h4{font-size:14px;margin:0;color:#fff;font-weight:700}
.t4-finding p{font-size:13px;margin:4px 0}
.t4-finding .lab{color:var(--t4-mut);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
.t4-tbl{width:100%;border-collapse:collapse;font-size:13px}
.t4-tbl th{text-align:left;color:var(--t4-mut);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.06em;padding:8px 10px;border-bottom:1px solid var(--t4-line)}
.t4-tbl td{padding:9px 10px;border-bottom:1px solid var(--t4-line);vertical-align:top}
.t4-tag{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;padding:2px 7px;border-radius:4px;display:inline-block}
.tag-High{background:rgba(95,179,126,.16);color:var(--t4-good)}
.tag-Med{background:rgba(217,139,84,.16);color:var(--t4-warn)}
.tag-Medium{background:rgba(217,139,84,.16);color:var(--t4-warn)}
.tag-Low{background:rgba(139,151,168,.16);color:var(--t4-mut)}
.t4-rec-title{font-weight:700;color:#fff;margin-bottom:4px}
.t4-rec-copy{color:var(--t4-mut);font-size:12.5px;margin-top:4px}
.t4-phase{border-left:2px solid var(--t4-good);padding-left:16px;margin-bottom:16px}
.t4-phase .pt{font-weight:700;font-size:14px;margin-bottom:6px;color:#fff}
.t4-phase ul{margin:0;padding-left:18px;font-size:13px}
.t4-emailbox{background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:16px 18px;white-space:pre-wrap;font-size:13px;margin-top:12px}
.t4-note{font-size:12px;color:var(--t4-mut);margin-top:26px;border-top:1px solid var(--t4-line);padding-top:14px}
.t4-save-note{font-size:12px;color:var(--t4-warn);margin:12px 0 0}
.t4-typegrid{display:flex;flex-direction:column;gap:10px}
.t4-typecard{display:flex;gap:12px;align-items:flex-start;text-align:left;background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:14px 16px;cursor:pointer;transition:.15s;width:100%;font-family:inherit;color:var(--t4-txt)}
.t4-typecard:hover{border-color:var(--t4-steel)}
.t4-typecard.sel{border-color:var(--t4-good);background:rgba(94,192,138,.08)}
.t4-typecard .tc-radio{width:16px;height:16px;border-radius:50%;border:2px solid var(--t4-line);margin-top:3px;flex-shrink:0}
.t4-typecard.sel .tc-radio{border-color:var(--t4-good);background:radial-gradient(circle,var(--t4-good) 0 5px,transparent 5px)}
.t4-typecard .tc-name{font-size:15px;font-weight:700;color:#fff}
.t4-typecard .tc-tag{font-size:12px;color:var(--t4-good);margin:2px 0 5px}
.t4-typecard .tc-desc{font-size:12.5px;color:var(--t4-mut);line-height:1.5}
.t4-checkgrid{display:grid;grid-template-columns:1fr;gap:8px;margin:10px 0 0}
@media(min-width:680px){.t4-checkgrid{grid-template-columns:1fr 1fr}}
.t4-check{display:flex;gap:8px;align-items:center;background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:9px 10px;font-size:13px;color:var(--t4-mut)}
.t4-check input{accent-color:var(--t4-good)}
.t4-select{width:100%;background:var(--t4-panel2);border:1px solid var(--t4-line);color:var(--t4-txt);border-radius:var(--t4-r);padding:10px 12px;font-size:14px;font-family:inherit}
.t4-status-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.t4-status{border:1px solid var(--t4-line);background:var(--t4-panel);color:var(--t4-mut);border-radius:999px;padding:7px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
.t4-status.active{border-color:var(--t4-good);color:#fff;background:rgba(94,192,138,.14)}
.t4-auth{max-width:460px;margin:0 auto;padding:72px 20px;text-align:center}
.t4-auth h1{font-size:24px;color:#fff;margin:0 0 8px}
.t4-auth p{color:var(--t4-mut);font-size:14px;margin:0 0 22px}
.t4-md{font-size:14px;color:var(--t4-txt)}
.t4-md h1{font-size:18px;color:#fff;margin:14px 0 8px}
.t4-md h2{font-size:16px;color:#fff;margin:14px 0 6px}
.t4-md h3{font-size:14px;color:var(--t4-amber-dim);margin:12px 0 4px;text-transform:uppercase;letter-spacing:.08em}
.t4-md p{margin:6px 0}
.t4-md ul,.t4-md ol{margin:6px 0;padding-left:20px}
.t4-md li{margin:3px 0}
.t4-md strong{color:#fff}
.t4-internal{border:1px dashed var(--t4-amber-dim);border-radius:var(--t4-r);background:rgba(201,168,76,.06);padding:14px 16px;margin-top:18px}
.t4-internal>summary{cursor:pointer;font-weight:800;color:var(--t4-amber);font-size:13px;letter-spacing:.04em}
.t4-internal .lab{color:var(--t4-amber-dim)}
.t4-readout{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}
@media(max-width:760px){.t4-readout{grid-template-columns:1fr}}
.t4-card{border:1px solid var(--t4-line);border-radius:var(--t4-r);background:var(--t4-panel2);padding:14px 16px;margin-bottom:12px}
.t4-card h4{margin:0 0 6px;font-size:13px;color:#fff;text-transform:uppercase;letter-spacing:.06em}
.t4-card p{margin:6px 0;font-size:13px}
.t4-card ul{margin:6px 0;padding-left:18px;font-size:13px}
.t4-card li{margin:4px 0}
.t4-card .cost{font-size:18px;font-weight:800;color:var(--t4-amber)}
.t4-card details>summary{cursor:pointer;color:var(--t4-mut);font-size:12px;margin-top:6px}
.t4-readout-hint{font-size:12.5px;color:var(--t4-mut);margin:0 0 16px}
.t4-gap{display:flex;gap:12px;align-items:flex-start;border:1px solid var(--t4-line);border-left:3px solid var(--t4-steel);border-radius:0 var(--t4-r) var(--t4-r) 0;background:var(--t4-panel2);padding:13px 15px;margin-bottom:10px}
.t4-gap-num{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:rgba(94,192,138,.14);color:var(--t4-steel);font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px}
.t4-gap-body{flex:1;min-width:0}
.t4-gap-topic{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--t4-amber-dim);font-weight:700;margin-bottom:4px}
.t4-gap-q{font-size:14.5px;color:#fff;font-weight:600;margin:0 0 5px;line-height:1.45}
.t4-gap-why{font-size:12.5px;color:var(--t4-mut);margin:0;line-height:1.5}
`;

const STEPS = ['Client', 'Questions', 'Discovery', 'Report', 'Readout', 'Proposal', 'Dev Package'];
const AGREEMENT_LEVELS = ['Unknown', 'Strongly agree', 'Mostly agree', 'Mixed', 'Mostly disagree'];
const INTEREST_LEVELS = ['Unknown', 'High', 'Medium', 'Low', 'None'];
const NEXT_STEPS = [
  'No Next Step Yet',
  'Strategy & Roadmap',
  'Focused AI Pilot',
  'GEO/SEO Package',
  'Agent Governance Demo',
  'Custom Build PRD',
  'Training/Enablement',
  'Other',
];
const PROPOSAL_TYPES = [
  'AI recommend',
  'Strategy & Roadmap Proposal',
  'Focused AI Pilot Proposal',
  'GEO/SEO Optimization Package Proposal',
  'Agent Governance Demo Proposal',
  'Custom Build Proposal',
  'Training & Enablement Proposal',
  'PRD / Technical Scoping Proposal',
];
const OUTCOME_FLAGS = [
  ['proposal_requested', 'Proposal requested'],
  ['prd_requested', 'PRD requested'],
  ['geo_package_discussed', 'GEO/SEO package discussed'],
  ['pedigree_demo_discussed', 'Pedigree demo discussed'],
  ['budget_discussed', 'Budget discussed'],
  ['decision_maker_identified', 'Decision maker identified'],
  ['timeline_discussed', 'Timeline discussed'],
];

const REPORT_POLL_INTERVAL_MS = 3000;
const REPORT_MAX_WAIT_MS = 9 * 60 * 1000;

const getEmptyAuthHeaders = async () => ({});

function parseMaybeJSON(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
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

  const raw = await res.text();
  const data = parseMaybeJSON(raw);
  if (!res.ok) {
    const fallback =
      res.status === 504
        ? 'The report request timed out while starting or checking the background job. Please try again.'
        : raw.slice(0, 180) || 'Request failed.';
    const error = new Error(data.error || fallback);
    error.status = res.status;
    throw error;
  }
  return data;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isRetryablePostError(error) {
  const status = Number(error?.status);
  if ([408, 429, 500, 502, 503, 504].includes(status)) return true;
  return /failed to fetch|network|timeout|did not parse cleanly|non-json/i.test(error?.message || '');
}

async function postJSONWithRetry(path, payload, getAuthHeaders, attempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await postJSON(path, payload, getAuthHeaders);
    } catch (error) {
      lastError = error;
      if (attempt >= attempts || !isRetryablePostError(error)) break;
      await wait(700 * attempt);
    }
  }
  throw lastError;
}

function formatElapsed(ms) {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainder = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
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

  const raw = await res.text();
  const data = parseMaybeJSON(raw);
  if (!res.ok) throw new Error(data.error || raw.slice(0, 180) || 'Request failed.');
  return data;
}

async function getJSON(path, getAuthHeaders) {
  const authHeaders = getAuthHeaders ? await getAuthHeaders() : {};
  const res = await fetch(path, {
    headers: authHeaders,
    credentials: 'include',
  });

  const raw = await res.text();
  const data = parseMaybeJSON(raw);
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

  const raw = await res.text();
  const data = parseMaybeJSON(raw);
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function auditRowToClient(row) {
  return {
    name: row.client_name || '',
    url: row.client_url || '',
    desc: row.client_desc || '',
    typeKey: row.audit_type_key || 'discovery',
    author: row.author_name || '',
    typeName: row.audit_type_name || '',
  };
}

function auditRowToResearch(row) {
  if (!row.research && !Array.isArray(row.questions)) return null;
  return {
    research: row.research || '',
    questions: Array.isArray(row.questions) ? row.questions : [],
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildClientReadyEmailHtml(questions) {
  const items = questions
    .map((q) => `<li style="margin:0 0 10px;padding-left:4px;">${escapeHtml(q)}</li>`)
    .join('');

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#202124;">
  <p style="margin:0 0 14px;">Hi there,</p>
  <p style="margin:0 0 14px;">Ahead of our conversation, here are the areas we'll cover. No prep required; we'll walk through them together.</p>
  <ol style="margin:0 0 18px 22px;padding:0;">
    ${items}
  </ol>
  <p style="margin:0;">Looking forward to it.</p>
</div>`;
}

function copyPlainWithSelection(value) {
  const el = document.createElement('textarea');
  el.value = value;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  el.style.top = '0';
  document.body.appendChild(el);
  el.focus();
  el.select();
  el.setSelectionRange(0, el.value.length);
  const copied = document.execCommand('copy');
  document.body.removeChild(el);
  if (!copied) throw new Error('Clipboard command was blocked.');
}

function copyHtmlWithSelection(html, plainText) {
  const el = document.createElement('div');
  el.setAttribute('contenteditable', 'true');
  el.style.position = 'fixed';
  el.style.left = '-9999px';
  el.style.top = '0';
  el.style.whiteSpace = 'normal';
  el.innerHTML = html;
  document.body.appendChild(el);

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);

  const copied = document.execCommand('copy');
  selection.removeAllRanges();
  document.body.removeChild(el);

  if (!copied) {
    copyPlainWithSelection(plainText);
  }
}

async function writeClipboard({ text, html }) {
  const plainText = text || '';

  if (html && navigator.clipboard?.write && window.ClipboardItem) {
    const item = new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plainText], { type: 'text/plain' }),
    });
    await navigator.clipboard.write([item]);
    return;
  }

  if (navigator.clipboard?.writeText && !html) {
    await navigator.clipboard.writeText(plainText);
    return;
  }

  if (html) {
    copyHtmlWithSelection(html, plainText);
    return;
  }

  copyPlainWithSelection(plainText);
}

function fmtMoney(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return `$${number.toLocaleString('en-US')}`;
}

function ValueCaseCard({ valueCase: vc }) {
  if (!vc) return null;
  const cost = fmtMoney(vc.annual_cost_estimate);
  const savingsLow = fmtMoney(vc.annual_savings_low);
  const savingsHigh = fmtMoney(vc.annual_savings_high);
  const invLow = fmtMoney(vc.investment_low);
  const invHigh = fmtMoney(vc.investment_high);
  const payback = (vc.payback_months_low != null || vc.payback_months_high != null)
    ? `${vc.payback_months_low ?? '—'} – ${vc.payback_months_high ?? '—'} mo`
    : null;
  const confidenceColor = vc.confidence === 'High' ? '#16a34a' : vc.confidence === 'Medium' ? '#d97706' : '#6b7280';

  return (
    <div className="t4-sec" style={{ background: 'var(--t4-surface, #111)', border: '1px solid var(--t4-border, #2a2a2a)', borderRadius: 10, padding: '14px 16px', margin: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong style={{ fontSize: 14 }}>Value Case</strong>
        {vc.confidence && (
          <span style={{ fontSize: 11, fontWeight: 600, color: confidenceColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {vc.confidence} confidence
          </span>
        )}
      </div>
      {vc.headline && <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--t4-text, #e5e5e5)' }}>{vc.headline}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, fontSize: 12 }}>
        {cost && <div><span style={{ color: 'var(--t4-mut, #888)' }}>Annual problem cost</span><br /><strong>{cost}</strong></div>}
        {(savingsLow || savingsHigh) && <div><span style={{ color: 'var(--t4-mut, #888)' }}>Annual savings</span><br /><strong>{savingsLow || '—'} – {savingsHigh || '—'}</strong></div>}
        {(invLow || invHigh) && <div><span style={{ color: 'var(--t4-mut, #888)' }}>Investment</span><br /><strong>{invLow || '—'} – {invHigh || '—'}</strong></div>}
        {payback && <div><span style={{ color: 'var(--t4-mut, #888)' }}>Payback</span><br /><strong>{payback}</strong></div>}
      </div>
      {vc.directional_note && <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--t4-mut, #888)', fontStyle: 'italic' }}>{vc.directional_note}</p>}
      {vc.basis && <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--t4-mut, #888)' }}>{vc.basis}</p>}
    </div>
  );
}

function CopyBtn({ text, html, label, icon: Icon = Clipboard }) {
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const [manualCopy, setManualCopy] = useState(false);
  const copyRef = useRef(null);

  useEffect(() => {
    if (!manualCopy || !copyRef.current) return;
    copyRef.current.focus();
    copyRef.current.select();
  }, [manualCopy]);

  async function copy() {
    const value = text || '';

    try {
      await writeClipboard({ text: value, html });

      setManualCopy(false);
      setFailed(false);
      setDone(true);
      window.setTimeout(() => setDone(false), 1800);
    } catch {
      setDone(false);
      setFailed(true);
      setManualCopy(true);
      window.setTimeout(() => setFailed(false), 2400);
    }
  }

  return (
    <>
      <button className="t4-ghost" type="button" onClick={copy} disabled={!text}>
        {Icon ? <Icon /> : null} {label}
      </button>
      {done && <span className="t4-toast">Copied</span>}
      {failed && <span className="t4-toast" style={{ color: 'var(--t4-bad)' }}>Select text below and press Ctrl+C</span>}
      {manualCopy && (
        <textarea
          ref={copyRef}
          className="t4-copybox"
          readOnly
          value={text || ''}
          onFocus={(event) => event.target.select()}
        />
      )}
    </>
  );
}

function safeFileName(value) {
  return String(value || 'tier4-audit')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80) || 'tier4-audit';
}

function downloadText(filename, text, type = 'text/markdown') {
  const blob = new Blob([text || ''], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Gauge({ name, score }) {
  const value = Number(score) || 0;
  return (
    <div className="t4-gauge">
      <span className="gn">{name}</span>
      <span className="t4-bars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`t4-pip${n <= Math.round(value) ? ' on' : ''}`} />
        ))}
      </span>
      <span className="gv">{value.toFixed(1)}</span>
    </div>
  );
}

function tagClass(value) {
  return String(value || 'Medium').replace(/\s+/g, '');
}

function domainWhy(domain) {
  return domain?.why_it_matters || domain?.rationale || '';
}

function recommendationTitle(recommendation) {
  return recommendation?.title || recommendation?.text || '';
}

function recommendationAction(recommendation) {
  return recommendation?.client_action || recommendation?.text || '';
}

function recommendationReason(recommendation) {
  return recommendation?.business_reason || '';
}

function cleanList(items) {
  return Array.isArray(items) ? items.filter(Boolean) : [];
}

function listText(items) {
  return cleanList(items).map((item) => `- ${item}`).join('\n');
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

function geoIssues(rep) {
  const issues = rep?.geo?.issues;
  return Array.isArray(issues) ? issues.map((item) => item?.text || item).filter(Boolean) : [];
}

function geoWins(rep) {
  const wins = rep?.geo?.wins;
  return Array.isArray(wins) ? wins.filter(Boolean) : [];
}

function buildGeoMarkdown(rep, client) {
  const geo = rep?.geo || {};
  const metadata = geo.meta || {};
  const domain = client.name || geo.domain || 'the audited website';
  const finalUrl = geo.url || metadata.finalUrl || client.url || domain;
  const issues = geoIssues(rep);
  const wins = geoWins(rep);

  return [
    `# GEO Website Optimization Brief: ${domain}`,
    '',
    'Use this markdown as source material for a coding agent improving the website for AI search visibility, citability, and technical crawl readiness.',
    '',
    '## Audit Context',
    '',
    '- Audit type: AI Search / GEO Audit',
    `- Domain: ${domain}`,
    `- Final URL: ${finalUrl}`,
    `- Generated: ${metadata.auditGeneratedAt || new Date().toISOString()}`,
    `- Overall score: ${Math.round(Number(rep?.overall) || 0)}/100${rep?.band ? ` (${rep.band})` : ''}`,
    '',
    '## AI Agent Objective',
    '',
    `Improve ${domain} so AI search systems can clearly crawl, understand, cite, and recommend the company. Prioritize changes that increase machine-readable context, structured data, content clarity, technical crawl access, and authority signals.`,
    '',
    '## Score Breakdown',
    '',
    scoreBreakdownText(geo.scores),
    '',
    rep?.executive_summary ? `## Summary\n\n${rep.executive_summary}\n` : '',
    rep?.business_risk ? `## Business Risk\n\n${rep.business_risk}\n` : '',
    wins.length ? `## What Is Working\n\n${listText(wins)}\n` : '',
    issues.length ? `## Issues To Fix\n\n${listText(issues)}\n` : '',
    '## Recommended Optimization Plan',
    '',
    '1. Confirm crawler accessibility for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and major search crawlers.',
    '2. Add or improve `llms.txt` and `llms-full.txt` so AI systems have concise and expanded machine-readable summaries.',
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

function defaultReadoutFields() {
  return {
    readout_call_date: '',
    participants: '',
    advisor_notes: '',
    client_agreement_level: 'Unknown',
    client_interest_level: 'Unknown',
    selected_next_step: 'No Next Step Yet',
    proposal_requested: false,
    prd_requested: false,
    geo_package_discussed: false,
    pedigree_demo_discussed: false,
    budget_discussed: false,
    decision_maker_identified: false,
    timeline_discussed: false,
    objections_raised: false,
  };
}

function readoutToFields(readout) {
  return {
    ...defaultReadoutFields(),
    readout_call_date: readout?.readout_call_date || '',
    participants: readout?.participants || '',
    advisor_notes: readout?.advisor_notes || '',
    client_agreement_level: readout?.client_agreement_level || 'Unknown',
    client_interest_level: readout?.client_interest_level || 'Unknown',
    selected_next_step: readout?.selected_next_step || 'No Next Step Yet',
    proposal_requested: Boolean(readout?.proposal_requested),
    prd_requested: Boolean(readout?.prd_requested),
    geo_package_discussed: Boolean(readout?.geo_package_discussed),
    pedigree_demo_discussed: Boolean(readout?.pedigree_demo_discussed),
    budget_discussed: Boolean(readout?.budget_discussed),
    decision_maker_identified: Boolean(readout?.decision_maker_identified),
    timeline_discussed: Boolean(readout?.timeline_discussed),
    objections_raised: Array.isArray(readout?.objections) && readout.objections.length > 0,
  };
}

function roadmapTitle(report) {
  if (report?.roadmap && !Array.isArray(report.roadmap) && report.roadmap.title) return report.roadmap.title;
  return '90-Day Roadmap';
}

function roadmapPhases(report) {
  if (Array.isArray(report?.roadmap)) {
    return report.roadmap.map((phase) => ({
      period: phase.phase || '',
      theme: phase.title || '',
      actions: Array.isArray(phase.items) ? phase.items : [],
    }));
  }

  if (Array.isArray(report?.roadmap?.phases)) {
    return report.roadmap.phases.map((phase) => ({
      period: phase.period || '',
      theme: phase.theme || '',
      actions: Array.isArray(phase.actions) ? phase.actions : [],
    }));
  }

  return [];
}

// Client-facing markdown export. Product-neutral by design: no Pedigree,
// governance signal, or internal mapping is ever included here.
function buildMarkdown(rep, client, type) {
  if (rep?.geo_audit) return buildGeoMarkdown(rep, client);

  const r = normalizeReport(rep).client || {};
  const nextSteps = cleanList(r.next_step_options);

  return `# ${type.name} - ${client.name}
Overall: ${Number(r.overall).toFixed(1)}/5 - ${r.band}

## Executive Summary
${r.execSummary}

${r.business_risk ? `## Business Risk\n${r.business_risk}\n` : ''}

${r.recommended_first_pilot ? `## Recommended First Pilot
${r.recommended_first_pilot.title}
${r.recommended_first_pilot.why_this_first}

Target users:
${cleanList(r.recommended_first_pilot.target_users).map((item) => `- ${item}`).join('\n')}

Required data sources:
${cleanList(r.recommended_first_pilot.required_data_sources).map((item) => `- ${item}`).join('\n')}

Success metrics:
${cleanList(r.recommended_first_pilot.success_metrics).map((item) => `- ${item}`).join('\n')}

Risk controls:
${cleanList(r.recommended_first_pilot.risk_controls).map((item) => `- ${item}`).join('\n')}
` : ''}

Top findings:
${(r.topFindings || []).map((f) => `- ${f}`).join('\n')}

## Scorecard
${(r.domains || []).map((d) => `- ${d.name}: ${d.score}/5`).join('\n')}

## Findings
${(r.domains || [])
  .map((d) => `### ${d.name} - ${d.score}/5
${d.finding}
Means: ${d.meaning}
Why it matters: ${domainWhy(d)}
Evidence: ${d.evidence || 'Not included in this saved report.'}`)
  .join('\n\n')}

## Recommendations
${(r.recommendations || [])
  .map((x, i) => {
    const reason = recommendationReason(x) ? ` Reason: ${recommendationReason(x)}` : '';
    return `${i + 1}. ${recommendationTitle(x)} - ${recommendationAction(x)}${reason} Effort: ${x.effort} | Impact: ${x.impact} | Owner: ${x.owner}`;
  })
  .join('\n')}

## ${roadmapTitle(r)}
${roadmapPhases(r)
  .map((p) => `${p.period} - ${p.theme}
${(p.actions || []).map((it) => `  - ${it}`).join('\n')}`)
  .join('\n')}

${nextSteps.length ? `## Next Step Options\n${nextSteps.map((s) => `- ${s}`).join('\n')}\n` : ''}
${r.closing || ''}`;
}

function GeoReport({ rep, client }) {
  const markdown = useMemo(() => buildGeoMarkdown(rep, client), [rep, client]);
  const geo = rep.geo || {};
  const metadata = geo.meta || {};
  const issues = geoIssues(rep);
  const wins = geoWins(rep);
  const domain = client.name || geo.domain || 'the audited website';
  const finalUrl = geo.url || metadata.finalUrl || client.url || domain;

  return (
    <div>
      <div className="t4-rep-head">
        <div>
          <div className="t4-eyebrow">
            GEO Audit | {new Date().toLocaleDateString()}
          </div>
          <h2 className="t4-h2">AI Search / GEO Audit</h2>
          <p className="t4-sub" style={{ marginBottom: 0 }}>
            Optimization brief for {domain}
          </p>
        </div>
        <div className="t4-score-big">
          <div className="n">{Math.round(Number(rep.overall) || 0)}</div>
          <div className="b">{rep.band || 'Score'} / 100</div>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Summary</h3>
        <p style={{ fontSize: 14 }}>{rep.executive_summary || 'No summary was stored with this GEO audit.'}</p>
      </div>

      {rep.business_risk && (
        <div className="t4-sec">
          <h3>Business Risk</h3>
          <p style={{ fontSize: 14 }}>{rep.business_risk}</p>
        </div>
      )}

      <div className="t4-sec">
        <h3>Score Breakdown</h3>
        {(Object.entries(geo.scores || {}).length ? Object.entries(geo.scores || {}) : []).map(([key, value]) => (
          <Gauge
            key={key}
            name={key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
            score={((Number(value?.score) || 0) / Math.max(Number(value?.max) || 1, 1)) * 5}
          />
        ))}
      </div>

      {wins.length > 0 && (
        <div className="t4-sec">
          <h3>What Is Working</h3>
          <ul style={{ fontSize: 13, paddingLeft: 18 }}>
            {wins.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {issues.length > 0 && (
        <div className="t4-sec">
          <h3>Issues To Fix</h3>
          <ul style={{ fontSize: 13, paddingLeft: 18 }}>
            {issues.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="t4-sec">
        <h3>AI Agent Optimization Brief</h3>
        <div className="t4-finding">
          <h4>Primary objective</h4>
          <p>
            Improve {domain} so AI search systems can clearly crawl, understand, cite, and recommend the company.
          </p>
          <p style={{ color: 'var(--t4-mut)' }}>
            <span className="lab">Use this for | </span>
            Claude Code, Codex, or another website optimization agent.
          </p>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Recommended Optimization Plan</h3>
        <div className="t4-phase">
          <div className="pt">Technical crawl readiness</div>
          <ul>
            <li>Confirm crawler access for major AI and search crawlers.</li>
            <li>Add or improve llms.txt and llms-full.txt.</li>
            <li>Make important pages crawlable, indexed, and internally linked.</li>
          </ul>
        </div>
        <div className="t4-phase">
          <div className="pt">Machine-readable context</div>
          <ul>
            <li>Add Organization, service, FAQ, sameAs, and location schema where appropriate.</li>
            <li>Strengthen title, meta description, H1, service copy, and proof points.</li>
            <li>Create citation-ready copy blocks that explain who the company serves and why it is credible.</li>
          </ul>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Crawl Evidence</h3>
        <div className="t4-geo-grid">
          <div className="t4-geo-metric">
            <div className="gm-label">Final URL</div>
            <div className="gm-value" style={{ fontSize: 13 }}>{finalUrl}</div>
          </div>
          <div className="t4-geo-metric">
            <div className="gm-label">Visible words</div>
            <div className="gm-value">{metadata.visibleWords ?? '-'}</div>
          </div>
          <div className="t4-geo-metric">
            <div className="gm-label">Title</div>
            <div className="gm-value" style={{ fontSize: 13 }}>{metadata.title || '-'}</div>
          </div>
          <div className="t4-geo-metric">
            <div className="gm-label">H1</div>
            <div className="gm-value" style={{ fontSize: 13 }}>{metadata.h1 || '-'}</div>
          </div>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Raw GEO Audit JSON</h3>
        <pre className="t4-codeblock">{JSON.stringify(geo, null, 2)}</pre>
      </div>

      <div className="t4-btnrow">
        <CopyBtn text={markdown} label="Copy GEO markdown" />
        <button
          className="t4-ghost"
          type="button"
          onClick={() => downloadText(`${safeFileName(domain)}-geo-optimization-brief.md`, markdown)}
        >
          <Download /> Download GEO markdown
        </button>
      </div>
    </div>
  );
}

function AdvisorIntelligence({ advisor }) {
  if (!advisor) return null;
  const signals = cleanList(advisor.next_step_signals);
  const objections = cleanList(advisor.objections_to_explore);
  const mapping = Array.isArray(advisor.internal_solution_mapping) ? advisor.internal_solution_mapping : [];
  const legacyFit = advisor.legacy_pedigree_fit;
  const hasAny =
    advisor.ai_governance_signal ||
    signals.length ||
    advisor.proposal_type_suggestion ||
    advisor.prd_readiness ||
    objections.length ||
    mapping.length ||
    legacyFit;
  if (!hasAny) return null;

  return (
    <details className="t4-internal">
      <summary>Advisor Intelligence (internal - not shown to client or exported)</summary>
      <div style={{ marginTop: 12, fontSize: 13 }}>
        {advisor.ai_governance_signal && (
          <p>
            <span className="lab">AI governance signal | </span>
            {advisor.ai_governance_signal}
          </p>
        )}
        {advisor.proposal_type_suggestion && (
          <p>
            <span className="lab">Proposal type suggestion | </span>
            {advisor.proposal_type_suggestion}
          </p>
        )}
        {advisor.prd_readiness && (
          <p>
            <span className="lab">PRD readiness | </span>
            {advisor.prd_readiness}
          </p>
        )}
        {signals.length > 0 && (
          <>
            <p className="lab">Next-step signals</p>
            <ul style={{ paddingLeft: 18 }}>
              {signals.map((s, k) => (
                <li key={k}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {objections.length > 0 && (
          <>
            <p className="lab">Objections to explore</p>
            <ul style={{ paddingLeft: 18 }}>
              {objections.map((s, k) => (
                <li key={k}>{s}</li>
              ))}
            </ul>
          </>
        )}
        {mapping.length > 0 && (
          <>
            <p className="lab">Internal solution mapping</p>
            <ul style={{ paddingLeft: 18 }}>
              {mapping.map((m, k) => (
                <li key={k}>
                  {[m.recommendation, m.signal, m.internal_note].filter(Boolean).join(' - ')}
                </li>
              ))}
            </ul>
          </>
        )}
        {legacyFit && (
          <p style={{ color: 'var(--t4-mut)' }}>
            <span className="lab">Legacy fit note | </span>
            {legacyFit.fit_level} fit - {legacyFit.reason}
          </p>
        )}
      </div>
    </details>
  );
}

function Report({ rep, client, type, economic = null, advanced = false }) {
  const markdown = useMemo(() => buildMarkdown(rep, client, type), [rep, client, type]);
  const norm = useMemo(() => normalizeReport(rep), [rep]);

  if (rep?.geo_audit) return <GeoReport rep={rep} client={client} />;

  const r = norm.client || {};
  const nextSteps = cleanList(r.next_step_options);
  // Economic opportunity + advisor-intelligence are internal-only surfaces.
  const economicToShow = advanced ? (economic || norm.economic) : null;

  return (
    <div>
      <div className="t4-rep-head">
        <div>
          <div className="t4-eyebrow">
            {client.name} | {new Date().toLocaleDateString()}
          </div>
          <h2 className="t4-h2">{type.name}</h2>
          <p className="t4-sub" style={{ marginBottom: 0 }}>
            Prepared by {client.author || 'Tier 4 Intelligence'}
          </p>
        </div>
        <div className="t4-score-big">
          <div className="n">{Number(r.overall).toFixed(1)}</div>
          <div className="b">{r.band}</div>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Executive Summary</h3>
        <p style={{ fontSize: 14 }}>{r.execSummary}</p>
        <ol style={{ fontSize: 13, paddingLeft: 18, marginTop: 10 }}>
          {(r.topFindings || []).map((f, k) => (
            <li key={k} style={{ margin: '4px 0' }}>
              {f}
            </li>
          ))}
        </ol>
      </div>

      {r.business_risk && (
        <div className="t4-sec">
          <h3>Business Risk</h3>
          <p style={{ fontSize: 14 }}>{r.business_risk}</p>
        </div>
      )}

      {economicToShow && <EconomicOpportunity economic={economicToShow} />}

      {r.recommended_first_pilot && (
        <div className="t4-sec">
          <h3>Recommended First Pilot</h3>
          <div className="t4-finding">
            <div className="ft">
              <h4>{r.recommended_first_pilot.title}</h4>
            </div>
            <p>{r.recommended_first_pilot.why_this_first}</p>
            <div className="t4-row" style={{ marginTop: 12 }}>
              <div>
                <p className="lab">Target users</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(r.recommended_first_pilot.target_users).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Data sources</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(r.recommended_first_pilot.required_data_sources).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Success metrics</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(r.recommended_first_pilot.success_metrics).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Risk controls</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(r.recommended_first_pilot.risk_controls).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="t4-sec">
        <h3>Scorecard</h3>
        {(r.domains || []).map((d, k) => (
          <Gauge key={k} name={d.name} score={d.score} />
        ))}
      </div>

      <div className="t4-sec">
        <h3>Domain Findings</h3>
        {(r.domains || []).map((d, k) => (
          <div className="t4-finding" key={k}>
            <div className="ft">
              <h4>{d.name}</h4>
              <span className="t4-tag tag-Med">{d.score}/5</span>
            </div>
            <p>{d.finding}</p>
            <p>
              <span className="lab">Means | </span>
              {d.meaning}
            </p>
            <p style={{ color: 'var(--t4-mut)' }}>
              <span className="lab">Why it matters | </span>
              {domainWhy(d)}
            </p>
            {d.evidence && (
              <p style={{ color: 'var(--t4-mut)' }}>
                <span className="lab">Evidence | </span>
                {d.evidence}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="t4-sec">
        <h3>Recommendations</h3>
        <table className="t4-tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Impact</th>
              <th>Effort</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {(r.recommendations || []).map((rec, k) => (
              <tr key={k}>
                <td className="t4-mono">{k + 1}</td>
                <td>
                  <div className="t4-rec-title">{recommendationTitle(rec)}</div>
                  <div>{recommendationAction(rec)}</div>
                  {recommendationReason(rec) && <div className="t4-rec-copy">{recommendationReason(rec)}</div>}
                </td>
                <td>
                  <span className={`t4-tag tag-${tagClass(rec.impact)}`}>{rec.impact}</span>
                </td>
                <td>
                  <span className={`t4-tag tag-${tagClass(rec.effort)}`}>{rec.effort}</span>
                </td>
                <td style={{ color: 'var(--t4-mut)' }}>{rec.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="t4-sec">
        <h3>{roadmapTitle(r)}</h3>
        {roadmapPhases(r).map((p, k) => (
          <div className="t4-phase" key={k}>
            <div className="pt">
              {p.period} - {p.theme}
            </div>
            <ul>
              {(p.actions || []).map((it, j) => (
                <li key={j}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {nextSteps.length > 0 && (
        <div className="t4-sec">
          <h3>Next Step Options</h3>
          <ul style={{ fontSize: 14, paddingLeft: 18 }}>
            {nextSteps.map((s, k) => (
              <li key={k} style={{ margin: '4px 0' }}>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.closing && (
        <div className="t4-sec">
          <h3>Closing</h3>
          <p style={{ fontSize: 14 }}>{r.closing}</p>
        </div>
      )}

      <div className="t4-btnrow">
        <CopyBtn text={markdown} label="Copy client report as Markdown" />
      </div>

      {advanced && <AdvisorIntelligence advisor={norm.advisor} />}
    </div>
  );
}

function money(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value);
  return `$${num.toLocaleString('en-US')}`;
}

// Renders the client-facing Economic Opportunity Assessment when economics
// have been quantified. Phase 2 populates this; renders nothing until then.
function EconomicOpportunity({ economic }) {
  if (!economic) return null;
  const insufficient =
    economic.status === 'insufficient_data' || economic.status === 'not_assessed';

  return (
    <div className="t4-sec">
      <h3>Economic Opportunity Assessment</h3>
      {insufficient ? (
        <div className="t4-finding">
          <p>Economic impact was not fully quantified in this call.</p>
          {cleanList(economic.suggested_follow_up_questions).length > 0 && (
            <>
              <p className="lab">Suggested follow-up questions</p>
              <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                {cleanList(economic.suggested_follow_up_questions).map((q, k) => (
                  <li key={k}>{q}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="t4-finding">
          {economic.annual_cost_estimate != null && (
            <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--t4-amber)' }}>
              {money(economic.annual_cost_estimate)} / year estimated
            </p>
          )}
          {economic.calculation_basis && (
            <p>
              <span className="lab">Basis | </span>
              {economic.calculation_basis}
            </p>
          )}
          {economic.formula && (
            <p className="t4-mono" style={{ fontSize: 13 }}>
              {economic.formula}
            </p>
          )}
          {cleanList(economic.inputs).length > 0 && (
            <>
              <p className="lab">Inputs</p>
              <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                {cleanList(economic.inputs).map((input, k) => (
                  <li key={k}>
                    {input.label}: {input.value}
                    {input.source ? ` (${String(input.source).replace(/_/g, ' ')})` : ''}
                  </li>
                ))}
              </ul>
            </>
          )}
          {cleanList(economic.cost_drivers).length > 0 && (
            <>
              <p className="lab">Cost drivers</p>
              <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                {cleanList(economic.cost_drivers).map((d, k) => (
                  <li key={k}>{d}</li>
                ))}
              </ul>
            </>
          )}
          {economic.improvement_target && (
            <p>
              <span className="lab">Improvement target | </span>
              {economic.improvement_target}
            </p>
          )}
          {(economic.annual_savings_low != null || economic.annual_savings_high != null) && (
            <p>
              <span className="lab">Potential recaptured value | </span>
              {money(economic.annual_savings_low)}
              {economic.annual_savings_high != null ? ` to ${money(economic.annual_savings_high)}` : ''} / year
            </p>
          )}
          {economic.confidence && (
            <p>
              <span className="lab">Confidence | </span>
              {economic.confidence}
            </p>
          )}
          {cleanList(economic.assumptions).length > 0 && (
            <>
              <p className="lab">Assumptions</p>
              <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                {cleanList(economic.assumptions).map((a, k) => (
                  <li key={k}>{a}</li>
                ))}
              </ul>
            </>
          )}
          {cleanList(economic.missing_inputs).length > 0 && (
            <>
              <p className="lab">Missing inputs</p>
              <ul style={{ fontSize: 13, paddingLeft: 18 }}>
                {cleanList(economic.missing_inputs).map((m, k) => (
                  <li key={k}>{m}</li>
                ))}
              </ul>
            </>
          )}
          {economic.validation_question && (
            <p style={{ color: 'var(--t4-mut)' }}>
              <span className="lab">Validate on the next call | </span>
              {economic.validation_question}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionList({ items }) {
  const list = cleanList(items);
  if (!list.length) return null;
  return (
    <ul>
      {list.map((q, k) => (
        <li key={k}>{q}</li>
      ))}
    </ul>
  );
}

// Card 3 capture: lets the advisor record the client's economic validation
// outcome during the readout call and persist it via /api/audit-economic-validate.
function EconomicValidationControls({ auditId, impactId, readoutId, getAuthHeaders, economic, onValidated }) {
  const [status, setStatus] = useState('');
  const [revisedCost, setRevisedCost] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  if (!auditId || !impactId) return null;

  async function save() {
    if (!status) {
      setNote('Pick a validation outcome first.');
      return;
    }
    setSaving(true);
    setNote('');
    try {
      const payload = {
        audit_id: auditId,
        impact_id: impactId,
        validation_status: status,
        client_economic_feedback: feedback || undefined,
      };
      if (readoutId) payload.readout_id = readoutId;
      if (status === 'revised' && revisedCost !== '') payload.revised_annual_cost = Number(revisedCost);
      const result = await postJSON('/api/audit-economic-validate', payload, getAuthHeaders);
      setNote(result.economics_revised ? 'Revised economics saved.' : 'Validation saved.');
      if (onValidated) onValidated(result);
    } catch (error) {
      setNote(error.message || 'Could not save validation.');
    } finally {
      setSaving(false);
    }
  }

  const currentStatus = economic?.status;

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--t4-line, #eee)', paddingTop: 12 }}>
      {currentStatus && (
        <p className="lab" style={{ marginBottom: 8 }}>
          Current: <strong>{currentStatus}</strong>
        </p>
      )}
      <div className="t4-row">
        <div className="t4-field">
          <label>Client validation outcome</label>
          <select
            className="t4-input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={saving}
          >
            <option value="">Select…</option>
            <option value="validated">Validated — client confirmed the number</option>
            <option value="revised">Revised — number changed with the client</option>
            <option value="rejected">Rejected — client disagreed, no number agreed</option>
          </select>
        </div>
        {status === 'revised' && (
          <div className="t4-field">
            <label>Revised annual cost ($/yr)</label>
            <input
              className="t4-input"
              type="number"
              min="0"
              value={revisedCost}
              onChange={(e) => setRevisedCost(e.target.value)}
              disabled={saving}
              placeholder="e.g. 250000"
            />
          </div>
        )}
      </div>
      <div className="t4-field">
        <label>Client feedback / notes</label>
        <textarea
          className="t4-input"
          rows={2}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={saving}
          placeholder="What did the client say about the economics?"
        />
      </div>
      <div className="t4-btnrow">
        <button className="t4-btn" type="button" onClick={save} disabled={saving || !status}>
          {saving ? 'Saving…' : 'Save validation'}
        </button>
        {note && <span className="t4-sub" style={{ alignSelf: 'center' }}>{note}</span>}
      </div>
    </div>
  );
}

// Compact, live-call readout assistant. Renders the structured guide JSON as
// cards instead of a long Markdown blob.
function priorityTagClass(priority) {
  if (priority === 'MVP') return 'tag-High';
  if (priority === 'Phase 2') return 'tag-Med';
  return 'tag-Low';
}

function SimpleList({ label, items }) {
  const list = cleanList(items);
  if (!list.length) return null;
  return (
    <>
      {label && <p className="lab">{label}</p>}
      <ul style={{ fontSize: 13, paddingLeft: 18, margin: '6px 0 14px' }}>
        {list.map((item, k) => (
          <li key={k} style={{ margin: '4px 0' }}>{item}</li>
        ))}
      </ul>
    </>
  );
}

// Developer build package: product spec + technical spec + build plan, rendered
// for a third-party developer to scope and quote. Not gated by advanced - this
// is a core client deliverable.
function BuildPackage({ pkg }) {
  if (!pkg) return null;
  const product = pkg.product_spec || {};
  const tech = pkg.tech_spec || {};
  const plan = pkg.build_plan || {};
  const features = Array.isArray(product.core_features) ? product.core_features.filter(Boolean) : [];
  const components = Array.isArray(tech.components) ? tech.components.filter(Boolean) : [];
  const phases = Array.isArray(plan.phases) ? plan.phases.filter(Boolean) : [];

  return (
    <div>
      {pkg.overview && (
        <div className="t4-sec">
          <h3>Overview</h3>
          <p style={{ fontSize: 14 }}>{pkg.overview}</p>
        </div>
      )}

      <div className="t4-sec">
        <h3>Product Spec</h3>
        {product.problem && (
          <div className="t4-finding">
            <h4>Problem</h4>
            <p>{product.problem}</p>
          </div>
        )}
        <SimpleList label="Goals" items={product.goals} />
        <SimpleList label="Target users" items={product.target_users} />
        {features.length > 0 && (
          <>
            <p className="lab">Core features</p>
            <table className="t4-tbl">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, k) => (
                  <tr key={k}>
                    <td>
                      <div className="t4-rec-title">{f.name}</div>
                      <div>{f.description}</div>
                    </td>
                    <td><span className={`t4-tag ${priorityTagClass(f.priority)}`}>{f.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <div style={{ marginTop: 14 }}>
          <SimpleList label="User flows" items={product.user_flows} />
          <SimpleList label="Out of scope" items={product.out_of_scope} />
          <SimpleList label="Success metrics" items={product.success_metrics} />
        </div>
      </div>

      <div className="t4-sec">
        <h3>Technical Spec</h3>
        {tech.recommended_architecture && (
          <div className="t4-finding">
            <h4>Recommended architecture</h4>
            <p>{tech.recommended_architecture}</p>
          </div>
        )}
        {components.length > 0 && (
          <>
            <p className="lab">Components</p>
            <ul style={{ fontSize: 13, paddingLeft: 18, margin: '6px 0 14px' }}>
              {components.map((c, k) => (
                <li key={k} style={{ margin: '4px 0' }}>
                  <strong style={{ color: '#fff' }}>{c.name}</strong> - {c.responsibility}
                </li>
              ))}
            </ul>
          </>
        )}
        <SimpleList label="Integrations" items={tech.integrations} />
        <SimpleList label="Data model" items={tech.data_model} />
        <SimpleList label="AI components" items={tech.ai_components} />
        <SimpleList label="Security and compliance" items={tech.security_and_compliance} />
        <SimpleList label="Infrastructure" items={tech.infrastructure} />
      </div>

      <div className="t4-sec">
        <h3>Build Plan</h3>
        {phases.map((p, k) => (
          <div className="t4-phase" key={k}>
            <div className="pt">
              {p.name}
              {p.duration_estimate ? ` - ${p.duration_estimate}` : ''}
            </div>
            <ul>
              {cleanList(p.deliverables).map((d, j) => (
                <li key={j}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
        {plan.effort_estimate && (
          <p style={{ fontSize: 13 }}>
            <span className="lab">Effort estimate | </span>
            {plan.effort_estimate}
          </p>
        )}
        <SimpleList label="Milestones" items={plan.milestones} />
        <SimpleList label="Team roles" items={plan.team_roles} />
        <SimpleList label="Assumptions" items={plan.assumptions} />
        <SimpleList label="Risks" items={plan.risks} />
      </div>

      {cleanList(pkg.open_questions).length > 0 && (
        <div className="t4-sec">
          <h3>Open Questions</h3>
          <SimpleList items={pkg.open_questions} />
        </div>
      )}

      <p className="t4-save-note">
        Phase and effort estimates are preliminary planning ranges, subject to the developer's own estimate.
      </p>
    </div>
  );
}

// Normalizes both the current gap-based readout shape and any older saved
// guides (opening_script/confirm_report_questions/...) into a simple list of
// gaps so the second-call view stays conversational, never a script.
function readoutGaps(guide) {
  if (!guide) return [];
  if (Array.isArray(guide.gaps) && guide.gaps.length) {
    return guide.gaps.filter(Boolean);
  }
  // Legacy fallback: fold old question lists into plain topics.
  const legacy = [
    ...cleanList(guide.confirm_report_questions),
    ...cleanList(guide.priority_questions),
  ];
  return legacy.map((q) => ({ topic: '', why_it_matters: '', suggested_question: q }));
}

function ReadoutAssistant({ guide }) {
  const gaps = readoutGaps(guide);

  if (!guide || !gaps.length) {
    return (
      <p className="t4-sub" style={{ marginTop: 0 }}>
        Generate a short list of things worth asking on the second call - the gaps the first call left open.
      </p>
    );
  }

  return (
    <div>
      {guide.call_focus && (
        <p className="t4-sub" style={{ marginTop: 0 }}>
          {guide.call_focus}
        </p>
      )}
      <p className="t4-readout-hint">
        Share the report on the call and talk it through together. Work these in where they fit - no script.
      </p>
      {gaps.map((gap, k) => (
        <div className="t4-gap" key={k}>
          <div className="t4-gap-num">{k + 1}</div>
          <div className="t4-gap-body">
            {gap.topic && <div className="t4-gap-topic">{gap.topic}</div>}
            {gap.suggested_question && <p className="t4-gap-q">&ldquo;{gap.suggested_question}&rdquo;</p>}
            {gap.why_it_matters && <p className="t4-gap-why">{gap.why_it_matters}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditPipeline({ getAuthHeaders, devMode = false, userSlot = null, advanced = false }) {
  const initialAuditId = useMemo(() => new URLSearchParams(window.location.search).get('auditId') || '', []);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(Boolean(initialAuditId));
  const [err, setErr] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [reportProgress, setReportProgress] = useState('');
  const [auditId, setAuditId] = useState(initialAuditId);
  const [client, setClient] = useState({
    name: '',
    url: '',
    desc: '',
    typeKey: 'discovery',
    author: '',
  });
  const [research, setResearch] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [report, setReport] = useState(null);
  const [followup, setFollowup] = useState('');
  const [readoutId, setReadoutId] = useState('');
  const [readoutGuide, setReadoutGuide] = useState(null);
  const [readoutGuideText, setReadoutGuideText] = useState('');
  const [readoutTranscript, setReadoutTranscript] = useState('');
  const [readoutFields, setReadoutFields] = useState(defaultReadoutFields);
  const [proposalId, setProposalId] = useState('');
  const [proposalType, setProposalType] = useState('AI recommend');
  const [proposalText, setProposalText] = useState('');
  const [proposalJson, setProposalJson] = useState(null);
  const [proposalStatus, setProposalStatus] = useState('draft');
  const [proposalEditing, setProposalEditing] = useState(false);
  const [economic, setEconomic] = useState(null);
  const [buildPackage, setBuildPackage] = useState(null);
  const [buildPackageText, setBuildPackageText] = useState('');

  const type = getAuditType(client.typeKey);

  useEffect(() => {
    if (!initialAuditId) return;

    let cancelled = false;
    async function loadSavedAudit() {
      setErr('');
      setLoadingSaved(true);
      try {
        const data = await getJSON(`/api/advisor-audits?id=${encodeURIComponent(initialAuditId)}`, getAuthHeaders);
        const row = data.audit;
        if (!row || cancelled) return;

        const nextResearch = auditRowToResearch(row);
        setAuditId(row.id);
        setClient(auditRowToClient(row));
        setResearch(nextResearch);
        setTranscript(row.transcript || '');
        setReport(row.report || null);
        setFollowup(row.followup_email || '');
        setReadoutId(row.readout?.id || '');
        setReadoutGuide(row.readout?.readout_guide_json || null);
        setReadoutGuideText(row.readout?.readout_guide_text || '');
        setReadoutTranscript(row.readout?.readout_transcript_text || '');
        setReadoutFields(readoutToFields(row.readout));
        setProposalId(row.proposal?.id || '');
        setProposalType(row.proposal?.proposal_type || 'AI recommend');
        setProposalText(row.proposal?.proposal_text || '');
        setProposalJson(row.proposal?.proposal_json || null);
        setProposalStatus(row.proposal?.proposal_status || 'draft');
        const savedPackage = row.proposal?.proposal_json?.build_package || null;
        setBuildPackage(savedPackage);
        setBuildPackageText(row.proposal?.proposal_json?.build_package_text || '');
        setStep(
          savedPackage ? 7 : row.proposal ? 6 : row.readout ? 5 : row.report ? 4 : nextResearch ? 2 : 1,
        );

        if (row.report && !row.report.geo_audit) {
          try {
            const econ = await getJSON(
              `/api/audit-economic-impact?audit_id=${encodeURIComponent(row.id)}`,
              getAuthHeaders,
            );
            if (!cancelled) {
              setEconomic(econ.economic || null);
            }
          } catch {
            // economics are optional; ignore load failures
          }
        }
      } catch (error) {
        if (!cancelled) setErr(error.message || 'Could not load that saved audit.');
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    }

    loadSavedAudit();
    return () => {
      cancelled = true;
    };
  }, [initialAuditId, getAuthHeaders]);

  function reset() {
    setStep(1);
    setAuditId('');
    setClient({ name: '', url: '', desc: '', typeKey: 'discovery', author: '' });
    setResearch(null);
    setTranscript('');
    setReport(null);
    setFollowup('');
    setReadoutId('');
    setReadoutGuide(null);
    setReadoutGuideText('');
    setReadoutTranscript('');
    setReadoutFields(defaultReadoutFields());
    setProposalId('');
    setProposalType('AI recommend');
    setProposalText('');
    setProposalJson(null);
    setProposalStatus('draft');
    setEconomic(null);
    setBuildPackage(null);
    setBuildPackageText('');
    setErr('');
    setSaveNote('');
    setReportProgress('');
    if (window.location.search.includes('auditId=')) {
      window.history.replaceState(null, '', '/admin/audit');
    }
  }

  async function runStep(action) {
    setErr('');
    setBusy(true);
    try {
      await action();
    } catch (error) {
      setErr(error.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function saveAuditMilestone(status, patch = {}) {
    try {
      const payload = {
        id: auditId || undefined,
        client: { ...(patch.client || client), typeName: type.name },
        research: patch.research === undefined ? research : patch.research,
        transcript: patch.transcript === undefined ? transcript : patch.transcript,
        report: patch.report === undefined ? report : patch.report,
        followup: patch.followup === undefined ? followup : patch.followup,
        status,
      };
      const saved = await postJSON('/api/advisor-audits', payload, getAuthHeaders);
      if (saved.audit?.id) setAuditId(saved.audit.id);
      setSaveNote('');
      return saved.audit || null;
    } catch (error) {
      console.warn('[advisor-audit-save]', error);
      setSaveNote('Generated, but audit history is not connected yet.');
      return null;
    }
  }

  async function deleteCurrentAudit() {
    if (!auditId) return;

    const label = client.name || 'this audit';
    const ok = window.confirm(`Delete ${label}? This removes the saved audit report from Supabase.`);
    if (!ok) return;

    await runStep(async () => {
      await deleteJSON(`/api/advisor-audits?id=${encodeURIComponent(auditId)}`, getAuthHeaders);
      window.location.href = '/admin';
    });
  }

  const doResearch = () =>
    runStep(async () => {
      const result = await postJSON('/api/audit-research', { client }, getAuthHeaders);
      setResearch(result);
      await saveAuditMilestone('questions_ready', { research: result });
      setStep(2);
    });

  const doReport = () =>
    runStep(async () => {
      setReportProgress('');
      try {
        const cleanTranscript = transcript.trim();
        const startedAt = Date.now();

        setReportProgress('Starting the background audit report...');
        const started = await postJSON(
          '/api/audit-report-start',
          { client, transcript: cleanTranscript },
          getAuthHeaders,
        );

        if (!started.response_id) {
          throw new Error('The report job did not return a background response id.');
        }

        let result = null;
        let responseId = started.response_id;
        let repairAttempted = false;
        while (!result) {
          await wait(REPORT_POLL_INTERVAL_MS);
          const elapsed = Date.now() - startedAt;
          if (elapsed > REPORT_MAX_WAIT_MS) {
            throw new Error('The report is still running after several minutes. Refresh the page and reopen this saved audit before trying again.');
          }

          setReportProgress(
            repairAttempted
              ? `Cleaning up the audit report in the background (${formatElapsed(elapsed)} elapsed)...`
              : `Writing the audit report in the background (${formatElapsed(elapsed)} elapsed)...`,
          );
          const status = await postJSONWithRetry(
            '/api/audit-report-status',
            {
              response_id: responseId,
              client,
              transcriptMeta: { original_chars: cleanTranscript.length },
              repair_attempted: repairAttempted,
            },
            getAuthHeaders,
            2,
          );

          if (status.status === 'completed' && status.report) {
            result = status.report;
          } else if (status.status === 'repairing' && status.response_id) {
            responseId = status.response_id;
            repairAttempted = true;
            setReportProgress(`Cleaning up the audit report in the background (${formatElapsed(elapsed)} elapsed)...`);
          } else if (!['queued', 'in_progress'].includes(status.status)) {
            throw new Error(`The background report ended with status ${status.status || 'unknown'}.`);
          }
        }

        setReport(result);
        setFollowup('');
        setReadoutId('');
        setReadoutGuide(null);
        setReadoutGuideText('');
        setReadoutTranscript('');
        setReadoutFields(defaultReadoutFields());
        setProposalId('');
        setProposalText('');
        setProposalJson(null);
        setProposalStatus('draft');
        setEconomic(null);
        setBuildPackage(null);
        setBuildPackageText('');
        await saveAuditMilestone('report_ready', { report: result, followup: '' });
        setStep(4);
      } finally {
        setReportProgress('');
      }
    });

  const doFollowup = () =>
    runStep(async () => {
      const result = await postJSON('/api/audit-followup', { client, report }, getAuthHeaders);
      setFollowup(result.email);
      await saveAuditMilestone('followup_ready', { followup: result.email });
    });

  const doEconomicExtract = () =>
    runStep(async () => {
      let nextAuditId = auditId;
      if (!nextAuditId) {
        const saved = await saveAuditMilestone('report_ready');
        nextAuditId = saved?.id || '';
      }
      if (!nextAuditId) throw new Error('Save the audit before extracting economics.');
      const result = await postJSON('/api/audit-economic-extract', { audit_id: nextAuditId }, getAuthHeaders);
      setEconomic(result.economic || null);
    });

  const doReadoutGuide = () =>
    runStep(async () => {
      let nextAuditId = auditId;
      if (!nextAuditId) {
        const saved = await saveAuditMilestone('report_ready');
        nextAuditId = saved?.id || '';
      }
      if (!nextAuditId) throw new Error('Save the audit before generating a readout guide.');
      const result = await postJSON(
        '/api/audit-readout-guide',
        { audit_id: nextAuditId, readout_id: readoutId || undefined },
        getAuthHeaders,
      );
      setReadoutId(result.readout?.id || readoutId);
      setReadoutGuide(result.guide || null);
      setReadoutGuideText(result.guide_text || '');
      setStep(5);
    });

  const saveReadoutTranscript = () =>
    runStep(async () => {
      const result = await postJSON(
        '/api/audit-readout-transcript',
        {
          audit_id: auditId,
          readout_id: readoutId || undefined,
          readout_guide_json: readoutGuide,
          readout_guide_text: readoutGuideText,
          readout_transcript_text: readoutTranscript,
          advisor_notes: readoutFields.advisor_notes,
          readout_call_date: readoutFields.readout_call_date || null,
          participants: readoutFields.participants,
          client_agreement_level: readoutFields.client_agreement_level,
          client_interest_level: readoutFields.client_interest_level,
          selected_next_step: readoutFields.selected_next_step,
          proposal_requested: readoutFields.proposal_requested,
          prd_requested: readoutFields.prd_requested,
          geo_package_discussed: readoutFields.geo_package_discussed,
          pedigree_demo_discussed: readoutFields.pedigree_demo_discussed,
          budget_discussed: readoutFields.budget_discussed,
          decision_maker_identified: readoutFields.decision_maker_identified,
          timeline_discussed: readoutFields.timeline_discussed,
          objections: readoutFields.objections_raised ? ['Objections raised during readout'] : [],
        },
        getAuthHeaders,
      );
      setReadoutId(result.readout?.id || readoutId);
      setReadoutFields(readoutToFields(result.readout));
      setStep(6);
    });

  const doProposal = () =>
    runStep(async () => {
      const result = await postJSON(
        '/api/audit-proposal',
        {
          audit_id: auditId,
          readout_id: readoutId,
          proposal_type: proposalType,
        },
        getAuthHeaders,
      );
      setProposalId(result.proposal?.id || '');
      setProposalType(result.proposal?.proposal_type || result.proposal_json?.proposal_type || proposalType);
      setProposalJson(result.proposal_json || null);
      setProposalText(result.proposal_text || '');
      setProposalStatus(result.proposal?.proposal_status || 'draft');
    });

  const saveProposal = (nextStatus = proposalStatus) =>
    runStep(async () => {
      const result = await patchJSON(
        '/api/audit-proposal',
        {
          audit_id: auditId,
          proposal_id: proposalId || undefined,
          readout_id: readoutId,
          proposal_type: proposalType,
          proposal_title: proposalJson?.proposal_title || `${client.name || 'Client'} Proposal`,
          proposal_json: proposalJson,
          proposal_text: proposalText,
          proposal_status: nextStatus,
          pricing_notes: proposalJson?.pricing_notes || '',
        },
        getAuthHeaders,
      );
      setProposalId(result.proposal?.id || proposalId);
      setProposalStatus(result.proposal?.proposal_status || nextStatus);
    });

  const doBuildPackage = () =>
    runStep(async () => {
      const result = await postJSON(
        '/api/audit-build-package',
        { audit_id: auditId, readout_id: readoutId || undefined },
        getAuthHeaders,
      );
      setBuildPackage(result.build_package || null);
      setBuildPackageText(result.build_package_text || '');
      if (result.proposal?.proposal_json) setProposalJson(result.proposal.proposal_json);
    });

  const clientNote = research
    ? `Hi there,

Ahead of our conversation, here are the areas we'll cover. No prep required; we'll walk through them together.

${research.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Looking forward to it.`
    : '';
  const clientNoteHtml = research ? buildClientReadyEmailHtml(research.questions) : '';
  const isGeoReport = Boolean(report?.geo_audit);

  return (
    <div className="t4-root">
      <style>{STYLE}</style>
      <div className="t4-wrap">
        <div className="t4-top">
          <img className="t4-brand-icon" src="/brand/tier4-icon-color.png" alt="Tier 4" />
          <div style={{ flex: 1 }}>
            <h1>{isGeoReport ? 'AI Search / GEO Audit' : 'Advisor Audit Pipeline'}</h1>
            <p>{isGeoReport ? 'Tier 4 Intelligence | website optimization' : 'Tier 4 Intelligence | internal'}</p>
          </div>
          {devMode && <span className="t4-tag tag-Med">Dev bypass</span>}
          {step > 1 && (
            <button className="t4-ghost" type="button" onClick={reset}>
              <RotateCcw /> Start over
            </button>
          )}
          {auditId && (
            <button className="t4-ghost danger" type="button" onClick={deleteCurrentAudit}>
              <Trash2 /> Delete audit
            </button>
          )}
          {userSlot}
        </div>

        <div className="t4-dashboard-row">
          <a className="t4-dashboard-link" href="/admin">
            <ArrowLeft /> Advisor Dashboard
          </a>
        </div>

        <div className="t4-steps">
          {STEPS.map((s, i) => (
            <div key={s} className={`t4-step${step === i + 1 ? ' act' : step > i + 1 ? ' done' : ''}`}>
              <span className="num">{step > i + 1 ? 'ok' : i + 1}</span>
              {s}
            </div>
          ))}
        </div>

        {err && <div className="t4-err">{err}</div>}
        {saveNote && <div className="t4-save-note">{saveNote}</div>}

        {loadingSaved && (
          <div className="t4-load">
            <div className="t4-spin" />
            <p>Loading saved audit...</p>
          </div>
        )}

        {busy && !loadingSaved && (
          <div className="t4-load">
            <div className="t4-spin" />
            <p>
              {reportProgress ||
                (step === 1
                ? 'Researching the company and writing tailored questions...'
                : step === 3
                  ? 'Reading the call and scoring the report...'
                  : 'Working...')}
            </p>
          </div>
        )}

        {!busy && !loadingSaved && step === 1 && (
          <div>
            <div className="t4-eyebrow">Step 1 | New Client</div>
            <h2 className="t4-h2">Who are we meeting?</h2>
            <p className="t4-sub">
              Enter whatever you have. Name plus a URL or a sentence is enough. The tool researches them and builds the
              questions you'll lead the call with.
            </p>

            <div className="t4-row">
              <div className="t4-field">
                <label>Company name</label>
                <input
                  className="t4-input"
                  value={client.name}
                  onChange={(e) => setClient({ ...client, name: e.target.value })}
                  placeholder="e.g. Acme Distributors"
                />
              </div>
              <div className="t4-field">
                <label>
                  Website <span className="hint">optional</span>
                </label>
                <input
                  className="t4-input"
                  value={client.url}
                  onChange={(e) => setClient({ ...client, url: e.target.value })}
                  placeholder="acme.com"
                />
              </div>
            </div>

            <div className="t4-field">
              <label>
                Anything you know <span className="hint">optional - a sentence helps</span>
              </label>
              <textarea
                className="t4-area"
                value={client.desc}
                onChange={(e) => setClient({ ...client, desc: e.target.value })}
                placeholder="Who they are, why they reached out, who you're meeting..."
              />
            </div>

            <div className="t4-field">
              <label>
                Your name <span className="hint">signs the report</span>
              </label>
              <input
                className="t4-input"
                value={client.author}
                onChange={(e) => setClient({ ...client, author: e.target.value })}
                placeholder="e.g. Matt"
              />
            </div>

            <div className="t4-field">
              <label>
                Audit type <span className="hint">pick the conversation that fits this prospect</span>
              </label>
              <div className="t4-typegrid">
                {Object.entries(AUDIT_TYPES).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={`t4-typecard${client.typeKey === key ? ' sel' : ''}`}
                    onClick={() => setClient({ ...client, typeKey: key })}
                  >
                    <div className="tc-radio" />
                    <div>
                      <div className="tc-name">{item.name}</div>
                      <div className="tc-tag">{item.tagline}</div>
                      <div className="tc-desc">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="t4-btnrow">
              <button className="t4-btn" type="button" disabled={!client.name.trim()} onClick={doResearch}>
                Research & build questions <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {!busy && !loadingSaved && step === 2 && research && (
          <div>
            <div className="t4-eyebrow">Step 2 | Your Call Questions</div>
            <h2 className="t4-h2">
              {client.name} - {type.name}
            </h2>
            <p className="t4-sub">
              Lead the call with these. Ask, then listen. Send them to the client beforehand if you like so they can come
              prepared.
            </p>

            <div className="t4-brief">
              <div className="glab">What we found</div>
              <p>{research.research}</p>
            </div>

            <ol className="t4-qlist">
              {research.questions.map((q, k) => (
                <li key={k}>{q}</li>
              ))}
            </ol>

            <div className="t4-btnrow">
              <CopyBtn text={research.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')} label="Copy questions" />
              <CopyBtn text={clientNote} html={clientNoteHtml} label="Copy client-ready version" />
              <button className="t4-ghost" type="button" onClick={doResearch}>
                <RefreshCw /> Regenerate
              </button>
              <button className="t4-btn" type="button" onClick={() => setStep(3)}>
                I've had the call <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {!busy && !loadingSaved && step === 3 && (
          <div>
            <div className="t4-eyebrow">Step 3 | Paste The Transcript</div>
            <h2 className="t4-h2">Drop in the call transcript</h2>
            <p className="t4-sub">
              Paste the full transcript from Fireflies, Google Meet, or Teams. The tool reads it, scores each area, and
              writes the report.
            </p>
            <div className="t4-field">
              <textarea
                className="t4-area big"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the full call transcript here..."
              />
              <p className="t4-save-note">
                Reports run as background jobs, so longer calls can finish without holding one server request open.
              </p>
            </div>
            <div className="t4-btnrow">
              <button className="t4-ghost" type="button" onClick={() => setStep(2)}>
                <ArrowLeft /> Back to questions
              </button>
              <button className="t4-btn" type="button" disabled={transcript.trim().length < 40} onClick={doReport}>
                Generate audit report <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {!busy && !loadingSaved && step === 4 && report && (
          <div>
            <div className="t4-eyebrow">Step 4 | Report</div>
            <Report rep={report} client={client} type={type} economic={economic} advanced={advanced} />
            {advanced && !report.geo_audit && (
              <div className="t4-sec">
                <h3>Economic Opportunity</h3>
                <p className="t4-sub" style={{ marginTop: 0 }}>
                  Quantify the cost of the problem from the discovery call. Numbers come only from what the client said
                  or what follows from it - nothing is invented.
                </p>
                <div className="t4-btnrow">
                  <button className="t4-ghost" type="button" onClick={doEconomicExtract}>
                    {economic ? <><RefreshCw /> Re-run economic extraction</> : 'Extract economic opportunity'}
                  </button>
                </div>
              </div>
            )}
            {!report.geo_audit && (
              <div className="t4-sec">
                <h3>Post-Call Email</h3>
                {followup ? (
                  <>
                    <div className="t4-emailbox">{followup}</div>
                    <div className="t4-btnrow">
                      <CopyBtn text={followup} label="Copy email" icon={Mail} />
                      <button className="t4-ghost" type="button" onClick={doFollowup}>
                        <RefreshCw /> Redraft
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="t4-btnrow">
                    <button className="t4-ghost" type="button" onClick={doFollowup}>
                      <Mail /> Draft a follow-up email
                    </button>
                  </div>
                )}
              </div>
            )}
            {!report.geo_audit && (
              <div className="t4-btnrow">
                <button className="t4-btn" type="button" onClick={readoutGuideText ? () => setStep(5) : doReadoutGuide}>
                  {readoutGuideText ? 'Continue to readout' : 'Generate Readout Guide'} <ArrowRight />
                </button>
              </div>
            )}
          </div>
        )}

        {!busy && !loadingSaved && step === 5 && report && !report.geo_audit && (
          <div>
            <div className="t4-eyebrow">Step 5 | Second Call</div>
            <h2 className="t4-h2">Review the report together</h2>
            <p className="t4-sub">
              Share the report on the call and talk it through. On the right are a few high-leverage things worth
              asking - the gaps the first call left open. Then paste the second-call transcript below.
            </p>

            <div className="t4-readout">
              <div className="t4-sec" style={{ marginTop: 0 }}>
                <h3>The report (share this on the call)</h3>
                <Report rep={report} client={client} type={type} economic={economic} advanced={advanced} />
              </div>

              <div className="t4-sec" style={{ marginTop: 0 }}>
                <h3>Worth asking on this call</h3>
                {readoutGuide ? (
                  <>
                    <ReadoutAssistant guide={readoutGuide} />
                    <div className="t4-btnrow">
                      {readoutGuideText && <CopyBtn text={readoutGuideText} label="Copy notes" />}
                      {readoutGuideText && (
                        <button
                          className="t4-ghost"
                          type="button"
                          onClick={() => downloadText(`${safeFileName(client.name)}-talking-points.md`, readoutGuideText)}
                        >
                          <Download /> Download
                        </button>
                      )}
                      <button className="t4-ghost" type="button" onClick={doReadoutGuide}>
                        <RefreshCw /> Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="t4-btn" type="button" onClick={doReadoutGuide}>
                    Get talking points <ArrowRight />
                  </button>
                )}
              </div>
            </div>

            <div className="t4-row">
              <div className="t4-field">
                <label>Readout call date</label>
                <input
                  className="t4-input"
                  type="date"
                  value={readoutFields.readout_call_date}
                  onChange={(e) => setReadoutFields({ ...readoutFields, readout_call_date: e.target.value })}
                />
              </div>
              <div className="t4-field">
                <label>Participants</label>
                <input
                  className="t4-input"
                  value={readoutFields.participants}
                  onChange={(e) => setReadoutFields({ ...readoutFields, participants: e.target.value })}
                  placeholder="Names, roles, decision makers..."
                />
              </div>
            </div>

            {advanced && (
              <>
                <div className="t4-row">
                  <div className="t4-field">
                    <label>Client agreed with findings</label>
                    <select
                      className="t4-select"
                      value={readoutFields.client_agreement_level}
                      onChange={(e) => setReadoutFields({ ...readoutFields, client_agreement_level: e.target.value })}
                    >
                      {AGREEMENT_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                  <div className="t4-field">
                    <label>Client interest level</label>
                    <select
                      className="t4-select"
                      value={readoutFields.client_interest_level}
                      onChange={(e) => setReadoutFields({ ...readoutFields, client_interest_level: e.target.value })}
                    >
                      {INTEREST_LEVELS.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </div>
                </div>

                <div className="t4-field">
                  <label>Selected next step</label>
                  <select
                    className="t4-select"
                    value={readoutFields.selected_next_step}
                    onChange={(e) => setReadoutFields({ ...readoutFields, selected_next_step: e.target.value })}
                  >
                    {NEXT_STEPS.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>

                <div className="t4-field">
                  <label>Outcome signals</label>
                  <div className="t4-checkgrid">
                    {OUTCOME_FLAGS.map(([key, label]) => (
                      <label className="t4-check" key={key}>
                        <input
                          type="checkbox"
                          checked={Boolean(readoutFields[key])}
                          onChange={(e) => setReadoutFields({ ...readoutFields, [key]: e.target.checked })}
                        />
                        {label}
                      </label>
                    ))}
                    <label className="t4-check">
                      <input
                        type="checkbox"
                        checked={Boolean(readoutFields.objections_raised)}
                        onChange={(e) => setReadoutFields({ ...readoutFields, objections_raised: e.target.checked })}
                      />
                      Objections raised
                    </label>
                  </div>
                </div>
              </>
            )}

            <div className="t4-field">
              <label>Advisor notes</label>
              <textarea
                className="t4-area"
                value={readoutFields.advisor_notes}
                onChange={(e) => setReadoutFields({ ...readoutFields, advisor_notes: e.target.value })}
                placeholder="What mattered, what they challenged, budget/timeline hints, objections..."
              />
            </div>

            <div className="t4-field">
              <label>Readout call transcript</label>
              <textarea
                className="t4-area big"
                value={readoutTranscript}
                onChange={(e) => setReadoutTranscript(e.target.value)}
                placeholder="Paste the second/readout call transcript here..."
              />
            </div>

            <div className="t4-btnrow">
              <button className="t4-ghost" type="button" onClick={() => setStep(4)}>
                <ArrowLeft /> Back to report
              </button>
              <button className="t4-btn" type="button" disabled={readoutTranscript.trim().length < 40} onClick={saveReadoutTranscript}>
                Save readout and continue <ArrowRight />
              </button>
            </div>
          </div>
        )}

        {!busy && !loadingSaved && step === 6 && report && !report.geo_audit && (
          <div>
            <div className="t4-eyebrow">Step 6 | Proposal</div>
            <h2 className="t4-h2">Turn the readout into a proposal</h2>
            <p className="t4-sub">
              Generate a business-facing next step from the discovery call, audit report, readout guide, and second call
              transcript. Edit it before sending.
            </p>

            <div className="t4-field">
              <label>Proposal type</label>
              <select className="t4-select" value={proposalType} onChange={(e) => setProposalType(e.target.value)}>
                {PROPOSAL_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="t4-btnrow">
              <button className="t4-ghost" type="button" onClick={() => setStep(5)}>
                <ArrowLeft /> Back to readout
              </button>
              <button className="t4-btn" type="button" disabled={readoutTranscript.trim().length < 40} onClick={doProposal}>
                {proposalText ? 'Regenerate Proposal' : 'Generate Proposal'} <ArrowRight />
              </button>
            </div>

            {proposalText && (
              <div className="t4-sec">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0 }}>Proposal</h3>
                  <button
                    className="t4-ghost"
                    type="button"
                    onClick={() => setProposalEditing((v) => !v)}
                  >
                    {proposalEditing ? 'Preview' : 'Edit'}
                  </button>
                </div>
                {proposalEditing ? (
                  <textarea
                    className="t4-area big"
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                  />
                ) : (
                  <Markdown>{proposalText}</Markdown>
                )}
                {advanced && proposalJson?.value_case && (
                  <ValueCaseCard valueCase={proposalJson.value_case} />
                )}
                <div className="t4-status-row">
                  {['draft', 'reviewed', 'sent', 'accepted', 'lost'].map((status) => (
                    <button
                      key={status}
                      className={`t4-status${proposalStatus === status ? ' active' : ''}`}
                      type="button"
                      onClick={() => {
                        setProposalStatus(status);
                        saveProposal(status);
                      }}
                    >
                      {status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
                <div className="t4-btnrow">
                  <CopyBtn text={proposalText} label="Copy proposal" />
                  <button
                    className="t4-ghost"
                    type="button"
                    onClick={() => downloadText(`${safeFileName(client.name)}-proposal.md`, proposalText)}
                  >
                    <Download /> Download proposal
                  </button>
                  <button className="t4-ghost" type="button" onClick={() => saveProposal(proposalStatus)}>
                    Save edits
                  </button>
                </div>
                <div className="t4-btnrow">
                  <button
                    className="t4-btn"
                    type="button"
                    onClick={buildPackage ? () => setStep(7) : doBuildPackage}
                  >
                    {buildPackage ? 'Open developer build package' : 'Create developer build package'} <ArrowRight />
                  </button>
                </div>
                <p className="t4-save-note">
                  The build package turns this into a tech spec, product spec, and build plan you can hand a
                  third-party developer for a scope and quote.
                </p>
              </div>
            )}
          </div>
        )}

        {!busy && !loadingSaved && step === 7 && report && !report.geo_audit && (
          <div>
            <div className="t4-eyebrow">Step 7 | Developer Build Package</div>
            <h2 className="t4-h2">Hand-off for a third-party developer</h2>
            <p className="t4-sub">
              A product spec, technical spec, and build plan generated from the calls, the report, and the proposal.
              Share it with a development shop to get a scope and a quote. Estimates are preliminary planning ranges.
            </p>

            <div className="t4-btnrow">
              <button className="t4-ghost" type="button" onClick={() => setStep(6)}>
                <ArrowLeft /> Back to proposal
              </button>
              <button className="t4-btn" type="button" onClick={doBuildPackage}>
                {buildPackage ? <><RefreshCw /> Regenerate build package</> : <>Generate build package <ArrowRight /></>}
              </button>
            </div>

            {buildPackage && (
              <>
                <BuildPackage pkg={buildPackage} />
                <div className="t4-btnrow">
                  {buildPackageText && <CopyBtn text={buildPackageText} label="Copy full package" />}
                  {buildPackageText && (
                    <button
                      className="t4-ghost"
                      type="button"
                      onClick={() => downloadText(`${safeFileName(client.name)}-build-package.md`, buildPackageText)}
                    >
                      <Download /> Download package
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="t4-note">
          Drafts are starting points, not final deliverables or legal advice. Review the report and confirm scores
          against the transcript before anything goes to the client.
        </div>
      </div>
    </div>
  );
}

function MissingAuthConfig() {
  return (
    <div className="t4-root">
      <style>{STYLE}</style>
      <div className="t4-auth">
        <h1>Advisor audit is not configured yet</h1>
        <p>
          Add Clerk keys or set <span className="t4-mono">VITE_AUDIT_AUTH_BYPASS=true</span> for local UI testing.
        </p>
      </div>
    </div>
  );
}

function ClerkAuditShell() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [advanced, setAdvanced] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch('/api/advisor-audits?profile=1', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setAdvanced(Boolean(data.isSuperuser));
      } catch {
        // Default to the streamlined (non-advanced) view on any failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getAuthHeaders]);

  if (!isLoaded) {
    return (
      <div className="t4-auth">
        <h1>Loading advisor sign-in</h1>
        <p>Checking your advisor session.</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="t4-auth">
        <h1>Tier 4 advisor sign-in</h1>
        <p>Sign in to run internal AI audit workflows.</p>
        <SignIn routing="hash" forceRedirectUrl="/admin/audit" fallbackRedirectUrl="/admin/audit" />
      </div>
    );
  }

  return (
    <AuditPipeline
      getAuthHeaders={getAuthHeaders}
      advanced={advanced}
      userSlot={
        <div className="t4-user">
          <UserButton afterSignOutUrl="/admin/audit" />
        </div>
      }
    />
  );
}

export default function AdminAuditPage() {
  const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const devBypass = isAdvisorAuthBypass();

  if (devBypass) {
    return <AuditPipeline devMode advanced getAuthHeaders={getEmptyAuthHeaders} />;
  }

  if (!clerkKey) {
    return <MissingAuthConfig />;
  }

  return (
    <AdvisorGate>
      <div className="t4-root">
        <style>{STYLE}</style>
        <ClerkAuditShell />
      </div>
    </AdvisorGate>
  );
}
