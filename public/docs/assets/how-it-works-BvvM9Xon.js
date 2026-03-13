const n={frontmatter:{title:"How the Audit Works",description:"Technical details on how the AI Readiness Audit analyzes your site.",hidden:!1},html:`<h1 id="how-the-audit-works"><a class="heading-anchor" aria-hidden tabindex="-1" href="#how-the-audit-works"><span class="icon icon-link"></span></a>How the Audit Works</h1>
<p>The audit runs a multi-pass analysis on your domain using JS-rendered crawling, structured data extraction, and a 30-point technical checklist.</p>
<h2 id="analysis-pipeline"><a class="heading-anchor" aria-hidden tabindex="-1" href="#analysis-pipeline"><span class="icon icon-link"></span></a>Analysis Pipeline</h2>
<ol>
<li><strong>Domain normalization</strong> -- Strips protocol and www, resolves to canonical domain</li>
<li><strong>Full-page JS render</strong> -- Fetches the page with a headless browser to capture content that requires JavaScript execution (the same way AI crawlers see your site)</li>
<li><strong>Structured data extraction</strong> -- Parses JSON-LD, OpenGraph, Twitter cards, and HTML meta tags</li>
<li><strong>Technical checks</strong> -- 30 automated checks across HTTPS, mobile, speed, schema, sitemap, canonical, and Core Web Vitals</li>
<li><strong>GEO signal checks</strong> -- Detects llms.txt, AI-facing content patterns, entity signals, FAQ schema</li>
<li><strong>Score aggregation</strong> -- Weighted scoring across 4 categories, normalized to 0-100</li>
</ol>
<h2 id="what-the-scores-mean"><a class="heading-anchor" aria-hidden tabindex="-1" href="#what-the-scores-mean"><span class="icon icon-link"></span></a>What the Scores Mean</h2>
<table>
<thead>
<tr>
<th>Score</th>
<th>Status</th>
<th>What it means</th>
</tr>
</thead>
<tbody>
<tr>
<td>80-100</td>
<td>Excellent</td>
<td>AI search engines can find, understand, and recommend you</td>
</tr>
<tr>
<td>60-79</td>
<td>Good</td>
<td>Solid foundation with specific gaps to close</td>
</tr>
<tr>
<td>40-59</td>
<td>Fair</td>
<td>Missing key signals -- AI search visibility is limited</td>
</tr>
<tr>
<td>0-39</td>
<td>Poor</td>
<td>Significant gaps -- largely invisible to AI-powered search</td>
</tr>
</tbody>
</table>`,headings:[{depth:2,text:"Analysis Pipeline",id:"analysis-pipeline"},{depth:2,text:"What the Scores Mean",id:"what-the-scores-mean"}],raw:`
# How the Audit Works

The audit runs a multi-pass analysis on your domain using JS-rendered crawling, structured data extraction, and a 30-point technical checklist.

## Analysis Pipeline

1. **Domain normalization** -- Strips protocol and www, resolves to canonical domain
2. **Full-page JS render** -- Fetches the page with a headless browser to capture content that requires JavaScript execution (the same way AI crawlers see your site)
3. **Structured data extraction** -- Parses JSON-LD, OpenGraph, Twitter cards, and HTML meta tags
4. **Technical checks** -- 30 automated checks across HTTPS, mobile, speed, schema, sitemap, canonical, and Core Web Vitals
5. **GEO signal checks** -- Detects llms.txt, AI-facing content patterns, entity signals, FAQ schema
6. **Score aggregation** -- Weighted scoring across 4 categories, normalized to 0-100

## What the Scores Mean

| Score | Status | What it means |
|-------|--------|---------------|
| 80-100 | Excellent | AI search engines can find, understand, and recommend you |
| 60-79 | Good | Solid foundation with specific gaps to close |
| 40-59 | Fair | Missing key signals -- AI search visibility is limited |
| 0-39 | Poor | Significant gaps -- largely invisible to AI-powered search |
`};export{n as default};
