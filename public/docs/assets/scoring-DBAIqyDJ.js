const n={frontmatter:{title:"Scoring Breakdown",description:"How each section of the AI Readiness score is calculated.",hidden:!1},html:`<h1 id="scoring-breakdown"><a class="heading-anchor" aria-hidden tabindex="-1" href="#scoring-breakdown"><span class="icon icon-link"></span></a>Scoring Breakdown</h1>
<h2 id="geo-signal-0-30-points"><a class="heading-anchor" aria-hidden tabindex="-1" href="#geo-signal-0-30-points"><span class="icon icon-link"></span></a>GEO Signal (0-30 points)</h2>
<p>The highest-weight section because it's the most directly tied to AI search visibility.</p>
<table>
<thead>
<tr>
<th>Check</th>
<th>Points</th>
<th>What we look for</th>
</tr>
</thead>
<tbody>
<tr>
<td>llms.txt present</td>
<td>5</td>
<td>File at /llms.txt describing your business for AI crawlers</td>
</tr>
<tr>
<td>Structured schema</td>
<td>8</td>
<td>JSON-LD with Organization, LocalBusiness, Service, FAQ types</td>
</tr>
<tr>
<td>Semantic HTML</td>
<td>4</td>
<td>Proper heading hierarchy, landmark elements, descriptive alt text</td>
</tr>
<tr>
<td>Entity signals</td>
<td>5</td>
<td>Business name, location, and category mentioned consistently</td>
</tr>
<tr>
<td>AI-friendly content</td>
<td>8</td>
<td>FAQ sections, direct answer patterns, question-format headings</td>
</tr>
</tbody>
</table>
<h2 id="technical-foundation-0-30-points"><a class="heading-anchor" aria-hidden tabindex="-1" href="#technical-foundation-0-30-points"><span class="icon icon-link"></span></a>Technical Foundation (0-30 points)</h2>
<table>
<thead>
<tr>
<th>Check</th>
<th>Points</th>
</tr>
</thead>
<tbody>
<tr>
<td>HTTPS + valid SSL</td>
<td>5</td>
</tr>
<tr>
<td>Mobile responsive</td>
<td>5</td>
</tr>
<tr>
<td>Page load under 3s</td>
<td>5</td>
</tr>
<tr>
<td>sitemap.xml</td>
<td>4</td>
</tr>
<tr>
<td>Canonical tags</td>
<td>4</td>
</tr>
<tr>
<td>Open Graph tags</td>
<td>4</td>
</tr>
<tr>
<td>robots.txt</td>
<td>3</td>
</tr>
</tbody>
</table>
<h2 id="content-quality-0-20-points"><a class="heading-anchor" aria-hidden tabindex="-1" href="#content-quality-0-20-points"><span class="icon icon-link"></span></a>Content Quality (0-20 points)</h2>
<table>
<thead>
<tr>
<th>Check</th>
<th>Points</th>
</tr>
</thead>
<tbody>
<tr>
<td>FAQ schema on page</td>
<td>6</td>
</tr>
<tr>
<td>Clear value proposition</td>
<td>4</td>
</tr>
<tr>
<td>Service area coverage</td>
<td>5</td>
</tr>
<tr>
<td>Contact information visible</td>
<td>5</td>
</tr>
</tbody>
</table>
<h2 id="brand-authority-0-20-points"><a class="heading-anchor" aria-hidden tabindex="-1" href="#brand-authority-0-20-points"><span class="icon icon-link"></span></a>Brand Authority (0-20 points)</h2>
<Callout type="warning">
  Brand Authority checks are partially manual and may not reflect real-time data for all businesses.
</Callout>
<table>
<thead>
<tr>
<th>Check</th>
<th>Points</th>
</tr>
</thead>
<tbody>
<tr>
<td>External citations</td>
<td>8</td>
</tr>
<tr>
<td>Review platform presence</td>
<td>6</td>
</tr>
<tr>
<td>Social proof signals</td>
<td>6</td>
</tr>
</tbody>
</table>`,headings:[{depth:2,text:"GEO Signal (0-30 points)",id:"geo-signal-0-30-points"},{depth:2,text:"Technical Foundation (0-30 points)",id:"technical-foundation-0-30-points"},{depth:2,text:"Content Quality (0-20 points)",id:"content-quality-0-20-points"},{depth:2,text:"Brand Authority (0-20 points)",id:"brand-authority-0-20-points"}],raw:`
# Scoring Breakdown

## GEO Signal (0-30 points)

The highest-weight section because it's the most directly tied to AI search visibility.

| Check | Points | What we look for |
|-------|--------|-----------------|
| llms.txt present | 5 | File at /llms.txt describing your business for AI crawlers |
| Structured schema | 8 | JSON-LD with Organization, LocalBusiness, Service, FAQ types |
| Semantic HTML | 4 | Proper heading hierarchy, landmark elements, descriptive alt text |
| Entity signals | 5 | Business name, location, and category mentioned consistently |
| AI-friendly content | 8 | FAQ sections, direct answer patterns, question-format headings |

## Technical Foundation (0-30 points)

| Check | Points |
|-------|--------|
| HTTPS + valid SSL | 5 |
| Mobile responsive | 5 |
| Page load under 3s | 5 |
| sitemap.xml | 4 |
| Canonical tags | 4 |
| Open Graph tags | 4 |
| robots.txt | 3 |

## Content Quality (0-20 points)

| Check | Points |
|-------|--------|
| FAQ schema on page | 6 |
| Clear value proposition | 4 |
| Service area coverage | 5 |
| Contact information visible | 5 |

## Brand Authority (0-20 points)

<Callout type="warning">
  Brand Authority checks are partially manual and may not reflect real-time data for all businesses.
</Callout>

| Check | Points |
|-------|--------|
| External citations | 8 |
| Review platform presence | 6 |
| Social proof signals | 6 |
`};export{n as default};
