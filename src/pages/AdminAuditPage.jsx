import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SignIn, UserButton, useAuth } from '@clerk/react';
import { ArrowLeft, ArrowRight, Clipboard, Download, Mail, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import AdvisorGate from '../components/AdvisorGate';
import { isAdvisorAuthBypass } from '../lib/advisorAuthBypass';
import { AUDIT_TYPES, getAuditType } from '../lib/advisorAuditTypes';

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
`;

const STEPS = ['Client', 'Questions', 'Discovery', 'Report', 'Readout', 'Proposal'];
const AGREEMENT_LEVELS = ['Unknown', 'Strongly agree', 'Mostly agree', 'Mixed', 'Mostly disagree'];
const INTEREST_LEVELS = ['Unknown', 'High', 'Medium', 'Low', 'None'];
const NEXT_STEPS = [
  'No Next Step Yet',
  'Strategy & Roadmap',
  'Focused AI Pilot',
  'GEO/SEO Package',
  'Pedigree Demo',
  'Custom Build PRD',
  'Training/Enablement',
  'Other',
];
const PROPOSAL_TYPES = [
  'AI recommend',
  'Strategy & Roadmap Proposal',
  'Focused AI Pilot Proposal',
  'GEO/SEO Optimization Package Proposal',
  'Pedigree Demo / Agent Governance Proposal',
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
        ? 'The report took too long to generate. Try again with a shorter transcript or remove unrelated sections.'
        : raw.slice(0, 180) || 'Request failed.';
    throw new Error(data.error || fallback);
  }
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

function recommendationMapping(recommendation) {
  return recommendation?.internal_solution_mapping || '';
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

function buildMarkdown(rep, client, type) {
  if (rep?.geo_audit) return buildGeoMarkdown(rep, client);

  return `# ${type.name} - ${client.name}
Overall: ${Number(rep.overall).toFixed(1)}/5 - ${rep.band}

## Executive Summary
${rep.execSummary}

${rep.business_risk ? `## Business Risk\n${rep.business_risk}\n` : ''}

${rep.primary_opportunity ? `## Primary Opportunity\n${rep.primary_opportunity}\n` : ''}

${rep.recommended_first_pilot ? `## Recommended First Pilot
${rep.recommended_first_pilot.title}
${rep.recommended_first_pilot.why_this_first}

Target users:
${cleanList(rep.recommended_first_pilot.target_users).map((item) => `- ${item}`).join('\n')}

Required data sources:
${cleanList(rep.recommended_first_pilot.required_data_sources).map((item) => `- ${item}`).join('\n')}

Success metrics:
${cleanList(rep.recommended_first_pilot.success_metrics).map((item) => `- ${item}`).join('\n')}

Risk controls:
${cleanList(rep.recommended_first_pilot.risk_controls).map((item) => `- ${item}`).join('\n')}
` : ''}

${rep.ai_use_case_governance_signal ? `## AI Use Case Governance Signal\n${rep.ai_use_case_governance_signal}\n` : ''}

${rep.pedigree_fit ? `## Pedigree Fit
Fit level: ${rep.pedigree_fit.fit_level}
Reason: ${rep.pedigree_fit.reason}
Suggested next step: ${rep.pedigree_fit.suggested_next_step}
` : ''}

Top findings:
${(rep.topFindings || []).map((f) => `- ${f}`).join('\n')}

## Scorecard
${(rep.domains || []).map((d) => `- ${d.name}: ${d.score}/5`).join('\n')}

## Findings
${(rep.domains || [])
  .map((d) => `### ${d.name} - ${d.score}/5
${d.finding}
Means: ${d.meaning}
Why it matters: ${domainWhy(d)}
Evidence: ${d.evidence || 'Not included in this saved report.'}`)
  .join('\n\n')}

## Recommendations
${(rep.recommendations || [])
  .map((x, i) => {
    const reason = recommendationReason(x) ? ` Reason: ${recommendationReason(x)}` : '';
    const mapping = recommendationMapping(x) ? ` Internal mapping: ${recommendationMapping(x)}.` : '';
    return `${i + 1}. ${recommendationTitle(x)} - ${recommendationAction(x)}${reason}${mapping} Effort: ${x.effort} | Impact: ${x.impact} | Owner: ${x.owner}`;
  })
  .join('\n')}

## ${roadmapTitle(rep)}
${roadmapPhases(rep)
  .map((p) => `${p.period} - ${p.theme}
${(p.actions || []).map((it) => `  - ${it}`).join('\n')}`)
  .join('\n')}

${rep.closing}`;
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

function Report({ rep, client, type }) {
  const markdown = useMemo(() => buildMarkdown(rep, client, type), [rep, client, type]);

  if (rep?.geo_audit) return <GeoReport rep={rep} client={client} />;

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
          <div className="n">{Number(rep.overall).toFixed(1)}</div>
          <div className="b">{rep.band}</div>
        </div>
      </div>

      <div className="t4-sec">
        <h3>Executive Summary</h3>
        <p style={{ fontSize: 14 }}>{rep.execSummary}</p>
        <ol style={{ fontSize: 13, paddingLeft: 18, marginTop: 10 }}>
          {(rep.topFindings || []).map((f, k) => (
            <li key={k} style={{ margin: '4px 0' }}>
              {f}
            </li>
          ))}
        </ol>
      </div>

      {rep.business_risk && (
        <div className="t4-sec">
          <h3>Business Risk</h3>
          <p style={{ fontSize: 14 }}>{rep.business_risk}</p>
        </div>
      )}

      {rep.primary_opportunity && (
        <div className="t4-sec">
          <h3>Primary Opportunity</h3>
          <p style={{ fontSize: 14 }}>{rep.primary_opportunity}</p>
        </div>
      )}

      {rep.recommended_first_pilot && (
        <div className="t4-sec">
          <h3>Recommended First Pilot</h3>
          <div className="t4-finding">
            <div className="ft">
              <h4>{rep.recommended_first_pilot.title}</h4>
            </div>
            <p>{rep.recommended_first_pilot.why_this_first}</p>
            <div className="t4-row" style={{ marginTop: 12 }}>
              <div>
                <p className="lab">Target users</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(rep.recommended_first_pilot.target_users).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Data sources</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(rep.recommended_first_pilot.required_data_sources).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Success metrics</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(rep.recommended_first_pilot.success_metrics).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="lab">Risk controls</p>
                <ul style={{ fontSize: 13, paddingLeft: 18, marginTop: 6 }}>
                  {cleanList(rep.recommended_first_pilot.risk_controls).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {rep.ai_use_case_governance_signal && (
        <div className="t4-sec">
          <h3>AI Use Case Governance Signal</h3>
          <p style={{ fontSize: 14 }}>{rep.ai_use_case_governance_signal}</p>
        </div>
      )}

      {rep.pedigree_fit && (
        <div className="t4-sec">
          <h3>Pedigree Fit</h3>
          <div className="t4-finding">
            <div className="ft">
              <h4>{rep.pedigree_fit.fit_level} fit</h4>
              <span className="t4-tag tag-Medium">Internal</span>
            </div>
            <p>{rep.pedigree_fit.reason}</p>
            <p style={{ color: 'var(--t4-mut)' }}>
              <span className="lab">Next step | </span>
              {rep.pedigree_fit.suggested_next_step}
            </p>
          </div>
        </div>
      )}

      <div className="t4-sec">
        <h3>Scorecard</h3>
        {(rep.domains || []).map((d, k) => (
          <Gauge key={k} name={d.name} score={d.score} />
        ))}
      </div>

      <div className="t4-sec">
        <h3>Domain Findings</h3>
        {(rep.domains || []).map((d, k) => (
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
              <th>Internal</th>
              <th>Impact</th>
              <th>Effort</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {(rep.recommendations || []).map((r, k) => (
              <tr key={k}>
                <td className="t4-mono">{k + 1}</td>
                <td>
                  <div className="t4-rec-title">{recommendationTitle(r)}</div>
                  <div>{recommendationAction(r)}</div>
                  {recommendationReason(r) && <div className="t4-rec-copy">{recommendationReason(r)}</div>}
                </td>
                <td style={{ color: 'var(--t4-mut)' }}>{recommendationMapping(r) || 'Not mapped'}</td>
                <td>
                  <span className={`t4-tag tag-${tagClass(r.impact)}`}>{r.impact}</span>
                </td>
                <td>
                  <span className={`t4-tag tag-${tagClass(r.effort)}`}>{r.effort}</span>
                </td>
                <td style={{ color: 'var(--t4-mut)' }}>{r.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="t4-sec">
        <h3>{roadmapTitle(rep)}</h3>
        {roadmapPhases(rep).map((p, k) => (
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

      <div className="t4-sec">
        <h3>Closing</h3>
        <p style={{ fontSize: 14 }}>{rep.closing}</p>
      </div>

      <div className="t4-btnrow">
        <CopyBtn text={markdown} label="Copy report as Markdown" />
      </div>
    </div>
  );
}

function AuditPipeline({ getAuthHeaders, devMode = false, userSlot = null }) {
  const initialAuditId = useMemo(() => new URLSearchParams(window.location.search).get('auditId') || '', []);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [loadingSaved, setLoadingSaved] = useState(Boolean(initialAuditId));
  const [err, setErr] = useState('');
  const [saveNote, setSaveNote] = useState('');
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
        setStep(row.proposal ? 6 : row.readout ? 5 : row.report ? 4 : nextResearch ? 2 : 1);
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
    setErr('');
    setSaveNote('');
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
      const result = await postJSON('/api/audit-report', { client, transcript }, getAuthHeaders);
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
      await saveAuditMilestone('report_ready', { report: result, followup: '' });
      setStep(4);
    });

  const doFollowup = () =>
    runStep(async () => {
      const result = await postJSON('/api/audit-followup', { client, report }, getAuthHeaders);
      setFollowup(result.email);
      await saveAuditMilestone('followup_ready', { followup: result.email });
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
              {step === 1
                ? 'Researching the company and writing tailored questions...'
                : step === 3
                  ? 'Reading the call and scoring the report...'
                  : 'Working...'}
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
            <Report rep={report} client={client} type={type} />
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
            <div className="t4-eyebrow">Step 5 | Readout</div>
            <h2 className="t4-h2">Run the second call</h2>
            <p className="t4-sub">
              Use the readout guide to pressure-test the audit, then paste the second call transcript and capture buying
              signals.
            </p>

            <div className="t4-sec">
              <h3>Readout Guide</h3>
              {readoutGuideText ? (
                <>
                  <div className="t4-emailbox">{readoutGuideText}</div>
                  <div className="t4-btnrow">
                    <CopyBtn text={readoutGuideText} label="Copy readout guide" />
                    <button
                      className="t4-ghost"
                      type="button"
                      onClick={() => downloadText(`${safeFileName(client.name)}-readout-guide.md`, readoutGuideText)}
                    >
                      <Download /> Download guide
                    </button>
                    <button className="t4-ghost" type="button" onClick={doReadoutGuide}>
                      <RefreshCw /> Regenerate guide
                    </button>
                  </div>
                </>
              ) : (
                <button className="t4-btn" type="button" onClick={doReadoutGuide}>
                  Generate Readout Guide <ArrowRight />
                </button>
              )}
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
                <h3>Editable Proposal</h3>
                <textarea
                  className="t4-area big"
                  value={proposalText}
                  onChange={(e) => setProposalText(e.target.value)}
                />
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
                <p className="t4-save-note">
                  PRD generation and DevShop quote requests come after proposal approval in the next phase.
                </p>
              </div>
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

  const getAuthHeaders = useCallback(async () => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

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
    return <AuditPipeline devMode getAuthHeaders={getEmptyAuthHeaders} />;
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
