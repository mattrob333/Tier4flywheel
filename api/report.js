// api/report.js — GEO-SEO Audit Report Generator
// GET /api/report?domain=example.com
// Returns a deterministic technical crawl report. This is not an OpenAI-generated report.

import https from 'https';
import http from 'http';
import { URL } from 'url';

// Simple in-memory cache (persists for function warm lifetime)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_MAX_ENTRIES = 200;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB per fetched resource
const CRAWL_CHECKS = ['homepage', 'robots.txt', 'llms.txt', 'llms-full.txt', 'sitemap.xml'];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDuration(ms = 0) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatAge(ms = 0) {
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'less than a minute old';
  if (minutes === 1) return '1 minute old';
  return `${minutes} minutes old`;
}

function finishAudit(results, startedAt) {
  results.meta.auditGeneratedAt = new Date().toISOString();
  results.meta.crawlDurationMs = Date.now() - startedAt;
  results.meta.checksRun = CRAWL_CHECKS.length;
  results.meta.workflow = 'Automated technical crawl: homepage HTML, robots.txt, llms.txt, llms-full.txt, and sitemap.xml. No OpenAI or external search model is used in this report.';
  return results;
}

function fetchUrl(url, options = {}, redirectCount = 0) {
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
      const location = res.headers.location;
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && location && redirectCount < 5) {
        res.resume();
        const nextUrl = new URL(location, url).toString();
        resolve(fetchUrl(nextUrl, options, redirectCount + 1));
        return;
      }

      let data = '';
      let bytes = 0;
      res.on('data', chunk => {
        bytes += chunk.length;
        if (bytes > MAX_BODY_BYTES) {
          res.destroy();
          resolve({ status: res.statusCode, body: data, headers: res.headers, finalUrl: url, truncated: true });
          return;
        }
        data += chunk;
      });
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers, finalUrl: url }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function runAudit(domain) {
  const startedAt = Date.now();
  const url = `https://${domain}`;
  const results = { domain, url, scores: {}, issues: [], wins: [], meta: {} };

  // Fetch main page
  let pageRes;
  try {
    pageRes = await fetchUrl(url);
    if (pageRes.status >= 400) {
      throw new Error(`HTTP ${pageRes.status}`);
    }

    const html = pageRes.body;
    results.url = pageRes.finalUrl || url;

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

  // robots.txt, llms.txt, llms-full.txt, and sitemap.xml are independent — fetch in parallel
  const [robotsRes, llmsRes, llmsFullRes, sitemapRes] = await Promise.allSettled([
    fetchUrl(`${url}/robots.txt`),
    fetchUrl(`${url}/llms.txt`),
    fetchUrl(`${url}/llms-full.txt`),
    fetchUrl(`${url}/sitemap.xml`),
  ]);

  if (robotsRes.status === 'fulfilled') {
    const r = robotsRes.value;
    const rb = r.body;
    results.meta.hasRobots = r.status === 200;
    results.meta.allowsGPTBot = rb.includes('GPTBot');
    results.meta.allowsClaudeBot = rb.includes('ClaudeBot');
    results.meta.allowsPerplexity = rb.includes('PerplexityBot');
    results.meta.allowsGoogleExtended = rb.includes('Google-Extended');
  } else {
    results.meta.allowsGPTBot = false;
  }

  if (llmsRes.status === 'fulfilled') {
    const r = llmsRes.value;
    results.meta.hasLlmsTxt = r.status === 200 && r.body.length > 50;
  } else {
    results.meta.hasLlmsTxt = false;
  }

  if (llmsFullRes.status === 'fulfilled') {
    const r = llmsFullRes.value;
    results.meta.hasLlmsFullTxt = r.status === 200 && r.body.length > 50;
  } else {
    results.meta.hasLlmsFullTxt = false;
  }

  if (sitemapRes.status === 'fulfilled') {
    const matches = sitemapRes.value.body.match(/<loc>/g);
    results.meta.sitemapCount = matches ? matches.length : 0;
  } else {
    results.meta.sitemapCount = 0;
  }

  // SCORING
  const m = results.meta;

  if (m.fetchError) {
    results.scores = {
      citability: { score: 0, max: 25 },
      brand: { score: 0, max: 20 },
      content: { score: 0, max: 20 },
      technical: { score: 0, max: 15 },
      schema: { score: 0, max: 10 },
      platform: { score: 0, max: 10 },
    };
    results.total = 0;
    results.issues.push({
      severity: 'critical',
      text: `The audit could not crawl the homepage (${m.fetchError}). Confirm the domain is live and publicly reachable before trusting this score.`,
    });
    return finishAudit(results, startedAt);
  }

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

  return finishAudit(results, startedAt);
}

function renderHTML(audit, source = '') {
  const domain = escapeHtml(audit.domain);
  const finalUrl = escapeHtml(audit.url);
  const utmDomain = encodeURIComponent(audit.domain);
  const total = audit.total;
  const ratingColor = total >= 75 ? '#5EC08A' : total >= 50 ? '#C9A84C' : '#d66a6a';
  const ratingTone = total >= 75 ? 'Strong' : total >= 50 ? 'Average' : 'Weak';
  const ratingLabel = total >= 75 ? '🟢 Strong' : total >= 50 ? '🟡 Average' : '🔴 Weak';

  void ratingLabel;

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
    const color = pct < 40 ? '#d66a6a' : pct < 65 ? '#C9A84C' : '#5EC08A';
    return `<div class="bar-row">
      <div class="bar-label">${label}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${Math.max(pct,2)}%;background:${color}"></div></div>
      <div class="bar-score" style="color:${color}">${score}/${max}</div>
    </div>`;
  }).join('');

  const issueRows = audit.issues.map(i => {
    const dot = i.severity === 'critical' ? '#d66a6a' : i.severity === 'high' ? '#d66a6a' : '#C9A84C';
    return `<div class="issue-item"><div class="issue-dot" style="background:${dot}"></div><div class="issue-text">${escapeHtml(i.text)}</div></div>`;
  }).join('');

  const winRows = audit.wins.map(w =>
    `<div class="win-item"><div class="win-dot"></div><div class="win-text">${escapeHtml(w)}</div></div>`
  ).join('');

  const platforms = [
    ['Google AI Overviews', audit.meta.hasFAQ],
    ['ChatGPT Search', audit.meta.allowsGPTBot && audit.meta.wordCount > 100],
    ['Perplexity', audit.meta.hasLlmsTxt],
    ['Claude (Anthropic)', audit.meta.allowsClaudeBot && audit.meta.wordCount > 100],
  ].map(([name, good]) =>
    `<div class="plat-row"><div class="plat-name">${name}</div><div class="pill ${good ? 'pill-partial' : 'pill-poor'}">${good ? '🟡 Partial' : '🔴 Poor'}</div></div>`
  ).join('');

  void platforms;
  const platformRows = [
    ['Google AI Overviews', audit.meta.hasFAQ],
    ['ChatGPT Search', audit.meta.allowsGPTBot && audit.meta.wordCount > 100],
    ['Perplexity', audit.meta.hasLlmsTxt],
    ['Claude (Anthropic)', audit.meta.allowsClaudeBot && audit.meta.wordCount > 100],
  ].map(([name, good]) =>
    `<div class="plat-row"><div class="plat-name">${name}</div><div class="pill ${good ? 'pill-partial' : 'pill-poor'}"><span class="pill-dot"></span>${good ? 'Partial' : 'Poor'}</div></div>`
  ).join('');

  const generatedAt = audit.meta.auditGeneratedAt ? new Date(audit.meta.auditGeneratedAt) : new Date();
  const dateStr = generatedAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const cacheStatus = audit.meta.cacheStatus === 'HIT' ? 'Cached snapshot' : 'Fresh crawl';
  const cacheDetail = audit.meta.cacheStatus === 'HIT'
    ? `${formatAge(audit.meta.cacheAgeMs || 0)}`
    : 'Live crawl completed for this request';
  const reportModeLabel = source === 'outbound'
    ? 'Tier 4 Intelligence | internal report'
    : 'Tier 4 Intelligence | AI search report';
  const crawlEvidence = `<div class="card">
    <div class="card-title">Crawl Evidence</div>
    <div class="meta-row"><span>Workflow</span><strong>Technical crawl, not AI-generated</strong></div>
    <div class="meta-row"><span>Status</span><strong>${cacheStatus} - ${cacheDetail}</strong></div>
    <div class="meta-row"><span>Final URL</span><strong>${finalUrl}</strong></div>
    <div class="meta-row"><span>Checks run</span><strong>${audit.meta.checksRun || CRAWL_CHECKS.length}</strong></div>
    <div class="meta-row"><span>Crawl time</span><strong>${formatDuration(audit.meta.crawlDurationMs || 0)}</strong></div>
    <div class="meta-row"><span>Visible words</span><strong>${audit.meta.wordCount || 0}</strong></div>
    <div class="meta-note">${audit.meta.workflow}</div>
  </div>`;
  const issuesMarkup = issueRows || '<div style="color:#71717a;font-size:14px">No critical issues detected.</div>';
  const remediationContent = `<div class="card">
    <div class="card-title">Issues Found</div>
    ${issuesMarkup}
  </div>
  <div class="cta-card">
    <h3>Get Your Full Remediation Plan</h3>
    <p>We can take ${domain} from ${total} to 75+ in under two weeks. One 30-minute call, we walk through every fix live — no commitment required.</p>
    <div class="btn-row">
      <a class="btn-primary" href="https://tier4intelligence.com/?utm_source=report&utm_medium=audit&utm_campaign=${utmDomain}" target="_blank">Book a Free Call →</a>
    </div>
  </div>`;
  void remediationContent;
  const styledRemediationContent = `<div class="card">
    <div class="card-title">Issues Found</div>
    ${issuesMarkup}
  </div>
  <div class="cta-card">
    <h3>Get Your Full Remediation Plan</h3>
    <p>We can take ${domain} from ${total} to 75+ in under two weeks. One 30-minute call, we walk through every fix live - no commitment required.</p>
    <div class="btn-row">
      <a class="btn-primary" href="https://tier4intelligence.com/?utm_source=report&utm_medium=audit&utm_campaign=${utmDomain}" target="_blank">Book a Free Call -></a>
    </div>
  </div>`;
  const remediationSection = source === 'outbound'
    ? styledRemediationContent
    : `<div id="remediation-gate" class="capture-card">
  <h2 style="color:#fff;margin-bottom:8px;">Your AI Remediation Roadmap</h2>
  <p style="color:rgba(240,242,245,.62);margin-bottom:24px;">You scored ${total}/100. Here is the prioritized fix list to move your site from invisible to citable in AI search - free.</p>
  <input type="email" id="captureEmail" placeholder="your@email.com" />
  <input type="text" id="captureName" placeholder="Your name" />
  <input type="text" id="captureCompany" placeholder="Company name" />
  <button onclick="submitCapture()">
    Get My Remediation Roadmap
  </button>
  <p style="color:rgba(240,242,245,.42);font-size:12px;margin-top:12px;">
    No spam. One email with your roadmap. That is it.
  </p>
</div>

<div id="remediation-content" style="display:none;">
  ${styledRemediationContent}
</div>`;
  const advisorBackLink = source === 'outbound'
    ? '<div class="advisor-nav"><a class="advisor-back" href="/admin">Back to Advisor Dashboard</a><a class="advisor-back secondary" href="/admin/seo-audit">Run Another GEO Audit</a></div>'
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Search Audit — ${domain}</title>
<meta name="robots" content="noindex">
<style>
:root{--t4-ink:#0B1426;--t4-panel:#1A1F2E;--t4-panel2:#0F172A;--t4-line:rgba(255,255,255,.1);--t4-txt:#F0F2F5;--t4-mut:rgba(240,242,245,.62);--t4-amber:#C9A84C;--t4-steel:#5EC08A;--t4-good:#5EC08A;--t4-bad:#d66a6a;--t4-r:8px}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--t4-ink);color:var(--t4-txt);font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.5;padding:0;min-height:100vh}
.advisor-nav{max-width:920px;margin:0 auto;padding:28px 20px 0;display:flex;gap:10px;flex-wrap:wrap}
.advisor-back{display:inline-flex;align-items:center;justify-content:center;min-height:38px;border-radius:var(--t4-r);border:1px solid rgba(94,192,138,.34);background:rgba(94,192,138,.1);color:var(--t4-txt);text-decoration:none;font-size:13px;font-weight:800;padding:8px 13px;box-shadow:0 0 24px rgba(94,192,138,.08)}
.advisor-back:hover{background:rgba(94,192,138,.16);border-color:var(--t4-steel)}
.advisor-back.secondary{background:transparent;border-color:var(--t4-line);color:var(--t4-mut);box-shadow:none}
.advisor-back.secondary:hover{color:var(--t4-txt);border-color:var(--t4-steel)}
.hero{padding:22px 20px 24px;border-bottom:1px solid var(--t4-line)}
.hero-inner{max-width:920px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.hero-brand{display:flex;align-items:center;gap:12px;margin-bottom:24px}
.brand-icon{width:44px;height:44px;object-fit:contain;filter:drop-shadow(0 0 16px rgba(94,192,138,.3))}
.brand-title{font-size:18px;font-weight:800;color:#fff;letter-spacing:-.01em}
.brand-sub{font-size:12px;color:var(--t4-mut)}
.badge{display:inline-flex;width:fit-content;border:1px solid rgba(201,168,76,.3);background:rgba(201,168,76,.1);color:var(--t4-amber);font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;padding:6px 10px;border-radius:var(--t4-r);margin-bottom:12px}
.hero-title{font-size:28px;font-weight:900;line-height:1.08;margin-bottom:6px;letter-spacing:-.03em;color:#fff}
.hero-domain{color:var(--t4-steel)}
.hero-sub{color:var(--t4-mut);font-size:13px}
.score-wrap{text-align:center;flex-shrink:0;background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:16px 22px;min-width:146px}
.score-circle{width:auto;height:auto;border:none;background:transparent;display:block;margin:0}
.score-num{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:42px;font-weight:800;line-height:1;color:${ratingColor}}
.score-sub{font-size:11px;color:var(--t4-mut);margin-top:2px}
.score-rating{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:${ratingColor};text-transform:uppercase;letter-spacing:.08em;margin-top:6px}
.score-rating::before{content:"";width:7px;height:7px;border-radius:50%;background:${ratingColor};box-shadow:0 0 14px ${ratingColor}}
.wrap{max-width:920px;margin:0 auto;padding:28px 20px 80px}
.card{background:var(--t4-panel);border:1px solid var(--t4-line);border-radius:var(--t4-r);padding:22px;margin-bottom:20px}
.card-title{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.16em;color:rgba(201,168,76,.76);margin-bottom:18px}
.meta-row{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid var(--t4-line);font-size:13px}
.meta-row span{color:var(--t4-mut)}
.meta-row strong{color:var(--t4-txt);text-align:right;font-weight:600;max-width:560px;overflow-wrap:anywhere}
.meta-note{font-size:12px;line-height:1.55;color:var(--t4-mut);margin-top:14px}
.bar-row{display:grid;grid-template-columns:minmax(160px,220px) 1fr 48px;align-items:center;gap:12px;margin-bottom:12px}
.bar-label{font-size:13px;color:var(--t4-mut)}
.bar-track{background:rgba(255,255,255,.1);border-radius:6px;height:8px}
.bar-fill{height:8px;border-radius:6px}
.bar-score{font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:12px;font-weight:700;text-align:right;flex-shrink:0}
.issue-item,.win-item{display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid var(--t4-line)}
.issue-item:last-child,.win-item:last-child{border-bottom:none}
.issue-dot,.win-dot{width:7px;height:7px;border-radius:50%;margin-top:7px;flex-shrink:0}
.win-dot{background:var(--t4-good)}
.issue-text,.win-text{font-size:14px;color:var(--t4-mut);line-height:1.55}
.plat-row{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 0;border-bottom:1px solid var(--t4-line)}
.plat-row:last-child{border-bottom:none}
.plat-name{font-size:14px;color:var(--t4-mut)}
.pill{display:inline-flex;align-items:center;gap:6px;font-family:"IBM Plex Mono",ui-monospace,monospace;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px}
.pill-dot{width:7px;height:7px;border-radius:50%;background:currentColor}
.pill-poor{background:rgba(214,106,106,.14);color:var(--t4-bad)}
.pill-partial{background:rgba(201,168,76,.16);color:var(--t4-amber)}
.cta-card{background:rgba(94,192,138,.08);border:1px solid rgba(94,192,138,.34);border-radius:var(--t4-r);padding:28px;text-align:center;margin-bottom:20px;box-shadow:0 0 32px rgba(94,192,138,.08)}
.cta-card h3{font-size:20px;font-weight:800;margin-bottom:8px;color:#fff;letter-spacing:-.01em}
.cta-card p{color:var(--t4-mut);font-size:14px;line-height:1.65;margin-bottom:22px;max-width:520px;margin-left:auto;margin-right:auto}
.capture-card{background:var(--t4-panel);border:1px solid rgba(94,192,138,.34);border-radius:var(--t4-r);padding:28px;margin:24px 0;text-align:center}
.capture-card input{width:100%;min-height:42px;background:var(--t4-panel2);border:1px solid var(--t4-line);color:var(--t4-txt);border-radius:var(--t4-r);padding:10px 12px;font-size:14px;margin-bottom:12px}
.capture-card input:focus{outline:none;border-color:var(--t4-good)}
.capture-card button{width:100%;min-height:42px;background:var(--t4-good);color:#fff;border:none;border-radius:var(--t4-r);font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 0 24px rgba(94,192,138,.2)}
.capture-card button:hover{background:#6dcc98}
.btn-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-primary{display:inline-flex;align-items:center;justify-content:center;min-height:40px;background:var(--t4-good);color:#fff;font-size:14px;font-weight:800;text-decoration:none;padding:11px 18px;border-radius:var(--t4-r);box-shadow:0 0 24px rgba(94,192,138,.2)}
.btn-primary:hover{background:#6dcc98}
.btn-share{display:inline-flex;align-items:center;justify-content:center;min-height:40px;background:transparent;color:var(--t4-mut);font-size:0;font-weight:700;text-decoration:none;padding:9px 14px;border-radius:var(--t4-r);cursor:pointer;border:1px solid var(--t4-line)}
.btn-share::after{content:"Share This Report";font-size:13px}
.btn-share:hover{color:var(--t4-txt);border-color:var(--t4-steel)}
.share-confirm{font-size:12px;color:var(--t4-good);margin-top:10px;display:none}
.footer{text-align:center;padding:20px;color:rgba(240,242,245,.42);font-size:12px;border-top:1px solid var(--t4-line);margin-top:26px}
@media(max-width:640px){.hero-inner{align-items:flex-start}.score-wrap{width:100%;text-align:left}.bar-row{grid-template-columns:1fr;gap:6px}.bar-score{text-align:left}.meta-row{display:block}.meta-row strong{display:block;text-align:left;margin-top:3px}.hero-title{font-size:24px}}
</style>
</head>
<body>
${advisorBackLink}
<div class="hero">
  <div class="hero-inner">
    <div>
      <div class="hero-brand">
        <img class="brand-icon" src="/brand/tier4-icon-color.png" alt="Tier 4">
        <div>
          <div class="brand-title">AI Search / GEO Audit</div>
          <div class="brand-sub">${reportModeLabel}</div>
        </div>
      </div>
      <div class="badge">Tier 4 Intelligence — AI Search Audit</div>
      <div class="hero-title">AI Search Visibility Report<br><span class="hero-domain">${domain}</span></div>
      <div class="hero-sub">Generated ${dateStr} &bull; Powered by Tier 4 Intelligence</div>
    </div>
    <div class="score-wrap">
      <div class="score-circle"><div class="score-num">${total}</div></div>
      <div class="score-sub">out of 100</div>
      <div class="score-rating">${ratingTone}</div>
    </div>
  </div>
</div>

<div class="wrap">

  <div class="card">
    <div class="card-title">Score Breakdown</div>
    ${scoreRows}
  </div>

  ${crawlEvidence}

  ${audit.wins.length ? `<div class="card">
    <div class="card-title">What Is Working</div>
    ${winRows}
  </div>` : ''}

  ${remediationSection}

  <div class="card">
    <div class="card-title">AI Platform Readiness</div>
    ${platformRows}
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
    This report was generated automatically and reflects a point-in-time snapshot of ${domain}.
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

function queryFlag(value) {
  return ['1', 'true', 'yes', 'fresh', 'refresh'].includes(String(value || '').toLowerCase());
}

function setReportHeaders(res, { cacheStatus, noStore = false, contentType = 'text/html' }) {
  res.setHeader('Content-Type', contentType);
  res.setHeader('X-Cache', cacheStatus);
  res.setHeader('X-Audit-Workflow', 'technical-crawl');

  if (noStore) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=60');
}

export default async function handler(req, res) {
  const domain = (req.query?.domain || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim();
  const source = req.query?.source === 'outbound' ? 'outbound' : '';
  const wantsJson = req.query?.format === 'json';
  const forceFresh = source === 'outbound' || queryFlag(req.query?.refresh) || queryFlag(req.query?.fresh);

  if (!domain || domain.length < 4 || domain.length > 253 || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return res.status(400).send('<h1>Missing or invalid domain parameter</h1><p>Usage: /api/report?domain=example.com</p>');
  }

  // Check cache
  const cached = cache.get(domain);
  if (!forceFresh && cached && cached.audit && Date.now() - cached.ts < CACHE_TTL_MS) {
    const audit = {
      ...cached.audit,
      meta: {
        ...cached.audit.meta,
        cacheStatus: 'HIT',
        cacheAgeMs: Date.now() - cached.ts,
      },
    };
    setReportHeaders(res, { cacheStatus: 'HIT', contentType: wantsJson ? 'application/json' : 'text/html' });
    if (wantsJson) return res.status(200).json(audit);
    return res.status(200).send(renderHTML(audit, source));
  }

  try {
    const audit = await runAudit(domain);
    audit.meta.cacheStatus = forceFresh ? 'BYPASS' : 'MISS';
    audit.meta.cacheAgeMs = 0;
    const html = wantsJson ? '' : renderHTML(audit, source);

    if (!forceFresh) {
      if (cache.size >= CACHE_MAX_ENTRIES) {
        cache.delete(cache.keys().next().value);
      }
      cache.set(domain, { audit, ts: Date.now() });
    }

    setReportHeaders(res, {
      cacheStatus: audit.meta.cacheStatus,
      noStore: forceFresh,
      contentType: wantsJson ? 'application/json' : 'text/html',
    });
    if (wantsJson) return res.status(200).json(audit);
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`<h1>Audit failed</h1><p>${escapeHtml(err.message)}</p>`);
  }
}
