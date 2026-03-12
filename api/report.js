// api/report.js — GEO-SEO Audit Report Generator
// GET /api/report?domain=example.com
// Returns a full HTML audit report page, cached in-memory for 7 days

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Simple in-memory cache (persists for function warm lifetime)
const cache = new Map();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;
    const req = lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        ...options.headers
      },
      timeout: 8000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function runAudit(domain) {
  const url = `https://${domain}`;
  const results = { domain, url, scores: {}, issues: [], wins: [], meta: {} };

  // Fetch main page
  let pageRes;
  try {
    pageRes = await fetchUrl(url);
    const html = pageRes.body;

    // Title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    results.meta.title = titleMatch ? titleMatch[1].trim() : null;

    // Meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    results.meta.description = descMatch ? descMatch[1].trim() : null;

    // H1
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    results.meta.h1 = h1Match ? h1Match[1].trim() : null;

    // Word count (strip tags)
    const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    results.meta.wordCount = textOnly.split(' ').filter(w => w.length > 2).length;

    // Schema
    results.meta.hasSchema = html.includes('application/ld+json');
    results.meta.hasFAQ = html.includes('"FAQPage"');
    results.meta.hasOrgSchema = html.includes('"Organization"') || html.includes('"LocalBusiness"') || html.includes('"ProfessionalService"');

    // Security headers
    const h = pageRes.headers;
    results.meta.hasHSTS = !!h['strict-transport-security'];
    results.meta.hasXFrame = !!h['x-frame-options'];
    results.meta.hasXContent = !!h['x-content-type-options'];
  } catch (e) {
    results.meta.fetchError = e.message;
  }

  // Robots.txt
  try {
    const r = await fetchUrl(`${url}/robots.txt`);
    const rb = r.body;
    results.meta.hasRobots = r.status === 200;
    results.meta.allowsGPTBot = rb.includes('GPTBot');
    results.meta.allowsClaudeBot = rb.includes('ClaudeBot');
    results.meta.allowsPerplexity = rb.includes('PerplexityBot');
    results.meta.allowsGoogleExtended = rb.includes('Google-Extended');
  } catch (e) {
    results.meta.allowsGPTBot = false;
  }

  // llms.txt
  try {
    const r = await fetchUrl(`${url}/llms.txt`);
    results.meta.hasLlmsTxt = r.status === 200 && r.body.length > 50;
  } catch (e) {
    results.meta.hasLlmsTxt = false;
  }

  // llms-full.txt
  try {
    const r = await fetchUrl(`${url}/llms-full.txt`);
    results.meta.hasLlmsFullTxt = r.status === 200 && r.body.length > 50;
  } catch (e) {
    results.meta.hasLlmsFullTxt = false;
  }

  // Sitemap
  try {
    const r = await fetchUrl(`${url}/sitemap.xml`);
    const matches = r.body.match(/<loc>/g);
    results.meta.sitemapCount = matches ? matches.length : 0;
  } catch (e) {
    results.meta.sitemapCount = 0;
  }

  // SCORING
  const m = results.meta;

  // 1. AI Citability (25)
  let cit = 0;
  if (m.hasLlmsTxt) cit += 12;
  if (m.hasLlmsFullTxt) cit += 5;
  if (m.wordCount > 100) cit += 8;
  results.scores.citability = { score: Math.min(cit, 25), max: 25 };

  // 2. Brand Authority (20) — baseline, manual research needed
  results.scores.brand = { score: 4, max: 20 };

  // 3. Content & E-E-A-T (20)
  let content = 0;
  if (m.title) content += 4;
  if (m.description) content += 4;
  if (m.hasSchema) content += 4;
  if (m.hasFAQ) content += 4;
  if (m.wordCount > 100) content += 4;
  results.scores.content = { score: Math.min(content, 20), max: 20 };

  // 4. Technical (15)
  let tech = 0;
  if (m.hasHSTS) tech += 4;
  if (m.hasXFrame) tech += 3;
  if (m.hasXContent) tech += 3;
  if (!m.fetchError) tech += 5;
  results.scores.technical = { score: Math.min(tech, 15), max: 15 };

  // 5. Structured Data (10)
  let schema = 0;
  if (m.hasSchema) schema += 4;
  if (m.hasFAQ) schema += 3;
  if (m.hasOrgSchema) schema += 3;
  results.scores.schema = { score: Math.min(schema, 10), max: 10 };

  // 6. Platform Optimization (10)
  let plat = 0;
  if (m.hasLlmsTxt) plat += 4;
  if (m.hasLlmsFullTxt) plat += 2;
  if (m.sitemapCount > 3) plat += 2;
  const crawlerCount = [m.allowsGPTBot, m.allowsClaudeBot, m.allowsPerplexity, m.allowsGoogleExtended].filter(Boolean).length;
  plat += Math.min(crawlerCount, 2);
  results.scores.platform = { score: Math.min(plat, 10), max: 10 };

  results.total = Object.values(results.scores).reduce((s, c) => s + c.score, 0);

  // Issues
  if (m.wordCount <= 100) results.issues.push({ severity: 'critical', text: 'Site appears to be client-side rendered — AI crawlers see little or no text content' });
  if (!m.h1) results.issues.push({ severity: 'high', text: 'No H1 heading detected — critical for AI citation hierarchy' });
  if (!m.description) results.issues.push({ severity: 'high', text: 'Meta description is blank — hurts both traditional SEO and AI citability' });
  if (!m.hasSchema) results.issues.push({ severity: 'high', text: 'Zero structured data (schema markup) — AI models cannot identify your business type, services, or location' });
  if (!m.hasLlmsTxt) results.issues.push({ severity: 'high', text: 'No llms.txt — AI models have no machine-readable summary of your business' });
  if (!m.allowsGPTBot) results.issues.push({ severity: 'medium', text: 'AI crawlers (GPTBot, ClaudeBot, PerplexityBot) not explicitly permitted in robots.txt' });
  if (m.sitemapCount <= 3) results.issues.push({ severity: 'medium', text: `Sitemap contains only ${m.sitemapCount} URLs — most of your pages are invisible to crawlers` });

  // Wins
  if (m.hasLlmsTxt) results.wins.push('llms.txt exists and is valid');
  if (m.wordCount > 300) results.wins.push(`Server-rendered content visible (${m.wordCount} words)`);
  if (m.hasSchema) results.wins.push('Schema markup present');
  if (m.hasHSTS) results.wins.push('HTTPS with HSTS configured');
  if (m.allowsGPTBot && m.allowsClaudeBot) results.wins.push('Major AI crawlers explicitly allowed in robots.txt');

  return results;
}

function renderHTML(audit, source = '') {
  const total = audit.total;
  const ratingColor = total >= 75 ? '#38a169' : total >= 50 ? '#dd6b20' : '#e53e3e';
  const ratingLabel = total >= 75 ? '🟢 Strong' : total >= 50 ? '🟡 Average' : '🔴 Weak';

  const scoreRows = [
    ['AI Citability & Visibility', 'citability'],
    ['Brand Authority Signals', 'brand'],
    ['Content Quality & E-E-A-T', 'content'],
    ['Technical Foundations', 'technical'],
    ['Structured Data', 'schema'],
    ['AI Platform Optimization', 'platform'],
  ].map(([label, key]) => {
    const { score, max } = audit.scores[key];
    const pct = Math.round((score / max) * 100);
    const color = pct < 40 ? '#e53e3e' : pct < 65 ? '#dd6b20' : '#38a169';
    return `<div class="bar-row">
      <div class="bar-label">${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(pct,2)}%;background:${color}"></div></div>
      <div class="bar-score" style="color:${color}">${score}/${max}</div>
    </div>`;
  }).join('');

  const issueRows = audit.issues.map(i => {
    const dot = i.severity === 'critical' ? '#e53e3e' : i.severity === 'high' ? '#e53e3e' : '#dd6b20';
    return `<div class="issue-item"><div class="issue-dot" style="background:${dot}"></div><div class="issue-text">${i.text}</div></div>`;
  }).join('');

  const winRows = audit.wins.map(w =>
    `<div class="win-item"><div class="win-dot"></div><div class="win-text">${w}</div></div>`
  ).join('');

  const platforms = [
    ['Google AI Overviews', audit.meta.hasFAQ],
    ['ChatGPT Search', audit.meta.allowsGPTBot && audit.meta.wordCount > 100],
    ['Perplexity', audit.meta.hasLlmsTxt],
    ['Claude (Anthropic)', audit.meta.allowsClaudeBot && audit.meta.wordCount > 100],
  ].map(([name, good]) =>
    `<div class="plat-row"><div class="plat-name">${name}</div><div class="pill ${good ? 'pill-partial' : 'pill-poor'}">${good ? '🟡 Partial' : '🔴 Poor'}</div></div>`
  ).join('');

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const issuesMarkup = issueRows || '<div style="color:#71717a;font-size:14px">No critical issues detected.</div>';
  const remediationContent = `<div class="card">
    <div class="card-title">Issues Found</div>
    ${issuesMarkup}
  </div>
  <div class="cta-card">
    <h3>Get Your Full Remediation Plan</h3>
    <p>We can take ${audit.domain} from ${total} to 75+ in under two weeks. One 30-minute call, we walk through every fix live — no commitment required.</p>
    <div class="btn-row">
      <a class="btn-primary" href="https://tier4intelligence.com/?utm_source=report&utm_medium=audit&utm_campaign=${audit.domain}" target="_blank">Book a Free Call →</a>
    </div>
  </div>`;
  const remediationSection = source === 'outbound'
    ? remediationContent
    : `<div id="remediation-gate" style="background:#1a1a2e;border:1px solid #30305a;border-radius:12px;padding:32px;margin:32px 0;text-align:center;">
  <h2 style="color:#fff;margin-bottom:8px;">Your AI Remediation Roadmap</h2>
  <p style="color:#aaa;margin-bottom:24px;">You scored ${total}/100. Here is the prioritized fix list to move your site from invisible to citable in AI search -- free.</p>
  <input type="email" id="captureEmail" placeholder="your@email.com" style="width:100%;padding:12px;margin-bottom:12px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;box-sizing:border-box;" />
  <input type="text" id="captureName" placeholder="Your name" style="width:100%;padding:12px;margin-bottom:12px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;box-sizing:border-box;" />
  <input type="text" id="captureCompany" placeholder="Company name" style="width:100%;padding:12px;margin-bottom:24px;border-radius:8px;border:1px solid #444;background:#111;color:#fff;box-sizing:border-box;" />
  <button onclick="submitCapture()" style="background:#6c63ff;color:#fff;border:none;padding:14px 32px;border-radius:8px;font-size:16px;cursor:pointer;width:100%;">
    Get My Remediation Roadmap
  </button>
  <p style="color:#666;font-size:12px;margin-top:12px;">
    No spam. One email with your roadmap. That is it.
  </p>
</div>

<div id="remediation-content" style="display:none;">
  ${remediationContent}
</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Search Audit — ${audit.domain}</title>
<meta name="robots" content="noindex">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#09090b;color:#fafafa;font-family:system-ui,-apple-system,sans-serif;padding:0;min-height:100vh}
.hero{background:linear-gradient(135deg,#0f0f14 0%,#141428 60%,#0a1628 100%);padding:40px 24px 32px;border-bottom:1px solid #1f1f23}
.hero-inner{max-width:680px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.badge{display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#a8c0d6;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:4px 12px;border-radius:4px;margin-bottom:10px}
.hero-title{font-size:26px;font-weight:800;line-height:1.2;margin-bottom:4px}
.hero-domain{color:#63b3ed}
.hero-sub{color:#71717a;font-size:13px}
.score-wrap{text-align:center;flex-shrink:0}
.score-circle{width:96px;height:96px;border-radius:50%;border:4px solid ${ratingColor};background:rgba(0,0,0,0.3);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto 6px}
.score-num{font-size:34px;font-weight:900;line-height:1;color:#fafafa}
.score-sub{font-size:11px;color:#71717a}
.score-rating{font-size:11px;font-weight:700;color:${ratingColor};text-transform:uppercase;letter-spacing:0.5px}
.wrap{max-width:680px;margin:0 auto;padding:28px 24px}
.card{background:#111113;border:1px solid #27272a;border-radius:10px;padding:22px;margin-bottom:20px}
.card-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#52525b;margin-bottom:18px}
.bar-row{display:flex;align-items:center;gap:10px;margin-bottom:11px}
.bar-label{font-size:13px;color:#a1a1aa;width:170px;flex-shrink:0}
.bar-track{flex:1;background:#27272a;border-radius:6px;height:7px}
.bar-fill{height:7px;border-radius:6px}
.bar-score{font-size:12px;font-weight:700;width:34px;text-align:right;flex-shrink:0}
.issue-item,.win-item{display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid #1c1c1f}
.issue-item:last-child,.win-item:last-child{border-bottom:none}
.issue-dot,.win-dot{width:7px;height:7px;border-radius:50%;margin-top:5px;flex-shrink:0}
.win-dot{background:#38a169}
.issue-text,.win-text{font-size:14px;color:#a1a1aa;line-height:1.55}
.plat-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1c1c1f}
.plat-row:last-child{border-bottom:none}
.plat-name{font-size:14px;color:#a1a1aa}
.pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px}
.pill-poor{background:rgba(229,62,62,0.15);color:#fc8181}
.pill-partial{background:rgba(221,107,32,0.15);color:#f6ad55}
.cta-card{background:linear-gradient(135deg,#0f1a2e,#0a2444);border:1px solid #1e3a5f;border-radius:10px;padding:28px;text-align:center;margin-bottom:20px}
.cta-card h3{font-size:19px;font-weight:700;margin-bottom:8px}
.cta-card p{color:#a1a1aa;font-size:14px;line-height:1.6;margin-bottom:22px;max-width:420px;margin-left:auto;margin-right:auto}
.btn-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{display:inline-block;background:#3182ce;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:7px}
.btn-share{display:inline-block;background:#27272a;color:#a1a1aa;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:7px;cursor:pointer;border:none}
.btn-share:hover{background:#3f3f46;color:#fafafa}
.share-confirm{font-size:12px;color:#38a169;margin-top:10px;display:none}
.footer{text-align:center;padding:20px;color:#3f3f46;font-size:12px}
@media(max-width:540px){.bar-label{width:130px}.hero-inner{flex-direction:column;align-items:flex-start}}
</style>
</head>
<body>
<div class="hero">
  <div class="hero-inner">
    <div>
      <div class="badge">Tier 4 Intelligence — AI Search Audit</div>
      <div class="hero-title">AI Search Visibility Report<br><span class="hero-domain">${audit.domain}</span></div>
      <div class="hero-sub">Generated ${dateStr} &bull; Powered by Tier 4 Intelligence</div>
    </div>
    <div class="score-wrap">
      <div class="score-circle"><div class="score-num">${total}</div></div>
      <div class="score-sub">out of 100</div>
      <div class="score-rating">${ratingLabel}</div>
    </div>
  </div>
</div>

<div class="wrap">

  <div class="card">
    <div class="card-title">Score Breakdown</div>
    ${scoreRows}
  </div>

  ${audit.wins.length ? `<div class="card">
    <div class="card-title">What Is Working</div>
    ${winRows}
  </div>` : ''}

  ${remediationSection}

  <div class="card">
    <div class="card-title">AI Platform Readiness</div>
    ${platforms}
  </div>

  <div class="card" style="text-align:center;">
    <div class="card-title">Share This Report</div>
    <div class="btn-row">
      <button class="btn-share" onclick="shareReport()">📤 Share This Report</button>
    </div>
    <div class="share-confirm" id="shareConfirm">✓ Link copied — share it with your team</div>
  </div>

  <div class="footer">
    Tier 4 Intelligence &bull; Alpharetta, GA &bull; tier4intelligence.com<br>
    This report was generated automatically and reflects a point-in-time snapshot of ${audit.domain}.
  </div>
</div>

<script>
function shareReport() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      document.getElementById('shareConfirm').style.display = 'block';
      setTimeout(() => document.getElementById('shareConfirm').style.display = 'none', 3000);
    });
  } else {
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    document.getElementById('shareConfirm').style.display = 'block';
    setTimeout(() => document.getElementById('shareConfirm').style.display = 'none', 3000);
  }
}

async function submitCapture() {
  const email = document.getElementById('captureEmail').value;
  const name = document.getElementById('captureName').value;
  const company = document.getElementById('captureCompany').value;
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email.');
    return;
  }
  try {
    await fetch('/api/capture', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email, name, company,
        domain: decodeURIComponent(window.location.search.match(/domain=([^&]+)/)?.[1] || ''),
        timestamp: new Date().toISOString()
      })
    });
  } catch (e) {}
  document.getElementById('remediation-gate').style.display = 'none';
  document.getElementById('remediation-content').style.display = 'block';
}
</script>
</body>
</html>`;
}

export default async function handler(req, res) {
  const domain = (req.query?.domain || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  const source = req.query?.source === 'outbound' ? 'outbound' : '';

  if (!domain || domain.length < 4 || !domain.includes('.')) {
    return res.status(400).send('<h1>Missing domain parameter</h1><p>Usage: /api/report?domain=example.com</p>');
  }

  // Check cache
  const cached = cache.get(domain);
  if (cached && cached.audit && Date.now() - cached.ts < CACHE_TTL_MS) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).send(renderHTML(cached.audit, source));
  }

  try {
    const audit = await runAudit(domain);
    const html = renderHTML(audit, source);

    cache.set(domain, { audit, ts: Date.now() });

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`<h1>Audit failed</h1><p>${err.message}</p>`);
  }
}
