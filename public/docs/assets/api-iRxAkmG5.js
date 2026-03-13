const n={frontmatter:{title:"Report API",description:"Programmatic access to AI Readiness Audit reports.",hidden:!1},html:`<h1 id="report-api"><a class="heading-anchor" aria-hidden tabindex="-1" href="#report-api"><span class="icon icon-link"></span></a>Report API</h1>
<p>The audit report is available via a simple REST API. This is the same endpoint that powers the audit widget on tier4intelligence.com.</p>
<h2 id="endpoint"><a class="heading-anchor" aria-hidden tabindex="-1" href="#endpoint"><span class="icon icon-link"></span></a>Endpoint</h2>
<pre><code>GET https://tier4intelligence.com/api/report
</code></pre>
<h2 id="parameters"><a class="heading-anchor" aria-hidden tabindex="-1" href="#parameters"><span class="icon icon-link"></span></a>Parameters</h2>
<table>
<thead>
<tr>
<th>Parameter</th>
<th>Required</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>domain</code></td>
<td>Yes</td>
<td>Domain to audit (e.g., <code>tiglazing.com</code>)</td>
</tr>
<tr>
<td><code>source</code></td>
<td>No</td>
<td>Set to <code>outbound</code> to bypass the email capture gate</td>
</tr>
</tbody>
</table>
<h2 id="examples"><a class="heading-anchor" aria-hidden tabindex="-1" href="#examples"><span class="icon icon-link"></span></a>Examples</h2>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D;--shiki-dark:#6A737D"># Standard audit (shows email gate for inbound visitors)</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">curl</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> "https://tier4intelligence.com/api/report?domain=yourbusiness.com"</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;--shiki-dark:#6A737D"># Outbound bypass (for direct links in your own emails/proposals)</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">curl</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> "https://tier4intelligence.com/api/report?domain=yourbusiness.com&#x26;#x26;source=outbound"</span></span></code></pre>
<h2 id="response"><a class="heading-anchor" aria-hidden tabindex="-1" href="#response"><span class="icon icon-link"></span></a>Response</h2>
<p>Returns a full HTML audit report including:</p>
<ul>
<li>Overall score (0-100)</li>
<li>Breakdown by category</li>
<li>Specific failing checks with remediation steps</li>
<li>Book-a-call CTA</li>
</ul>
<Callout type="info">
  For API integration or white-label audit reports, contact matt@tier4intelligence.com.
</Callout>`,headings:[{depth:2,text:"Endpoint",id:"endpoint"},{depth:2,text:"Parameters",id:"parameters"},{depth:2,text:"Examples",id:"examples"},{depth:2,text:"Response",id:"response"}],raw:`
# Report API

The audit report is available via a simple REST API. This is the same endpoint that powers the audit widget on tier4intelligence.com.

## Endpoint

\`\`\`
GET https://tier4intelligence.com/api/report
\`\`\`

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| \`domain\` | Yes | Domain to audit (e.g., \`tiglazing.com\`) |
| \`source\` | No | Set to \`outbound\` to bypass the email capture gate |

## Examples

\`\`\`bash
# Standard audit (shows email gate for inbound visitors)
curl "https://tier4intelligence.com/api/report?domain=yourbusiness.com"

# Outbound bypass (for direct links in your own emails/proposals)
curl "https://tier4intelligence.com/api/report?domain=yourbusiness.com&source=outbound"
\`\`\`

## Response

Returns a full HTML audit report including:
- Overall score (0-100)
- Breakdown by category
- Specific failing checks with remediation steps
- Book-a-call CTA

<Callout type="info">
  For API integration or white-label audit reports, contact matt@tier4intelligence.com.
</Callout>
`};export{n as default};
