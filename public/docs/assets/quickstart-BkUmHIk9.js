const n={frontmatter:{title:"Quickstart",description:"Get up and running with Tome in under 5 minutes — from installation to deployment.",icon:"rocket",hidden:!1},html:`<h1 id="quickstart"><a class="heading-anchor" aria-hidden tabindex="-1" href="#quickstart"><span class="icon icon-link"></span></a>Quickstart</h1>
<p>This guide walks you through setting up a Tome documentation site from scratch, configuring it, and deploying it to production.</p>
<h2 id="prerequisites"><a class="heading-anchor" aria-hidden tabindex="-1" href="#prerequisites"><span class="icon icon-link"></span></a>Prerequisites</h2>
<p>Before you begin, make sure you have:</p>
<ul>
<li><strong>Node.js 18</strong> or later installed (<a href="https://nodejs.org">download</a>)</li>
<li>A package manager: <code>npm</code>, <code>yarn</code>, or <code>pnpm</code></li>
<li>A terminal and a code editor</li>
</ul>
<h2 id="1-install-dependencies"><a class="heading-anchor" aria-hidden tabindex="-1" href="#1-install-dependencies"><span class="icon icon-link"></span></a>1. Install Dependencies</h2>
<p>After running <code>tome init</code>, install your project dependencies:</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#005CC5;--shiki-dark:#79B8FF">cd</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> scaffold-preview</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">npm</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> install</span></span></code></pre>
<h2 id="2-start-the-dev-server"><a class="heading-anchor" aria-hidden tabindex="-1" href="#2-start-the-dev-server"><span class="icon icon-link"></span></a>2. Start the Dev Server</h2>
<p>Launch the local development server with hot reloading:</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">npm</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> run</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> dev</span></span></code></pre>
<p>Open <a href="http://localhost:3000">http://localhost:3000</a> in your browser. Every time you save a file, the page updates instantly.</p>
<h2 id="3-write-your-first-page"><a class="heading-anchor" aria-hidden tabindex="-1" href="#3-write-your-first-page"><span class="icon icon-link"></span></a>3. Write Your First Page</h2>
<p>Create a new file in the <code>pages/</code> directory. Each <code>.md</code> or <code>.mdx</code> file becomes a page on your site.</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">---</span></span>
<span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">title</span><span style="color:#24292E;--shiki-dark:#E1E4E8">: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">My New Page</span></span>
<span class="line"><span style="color:#22863A;--shiki-dark:#85E89D">description</span><span style="color:#24292E;--shiki-dark:#E1E4E8">: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">A brief summary for search and navigation</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">---</span></span>
<span class="line"></span>
<span class="line"><span style="color:#005CC5;font-weight:bold;--shiki-dark:#79B8FF;--shiki-dark-font-weight:bold"># My New Page</span></span>
<span class="line"></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">Write your content using standard </span><span style="color:#24292E;font-weight:bold;--shiki-dark:#E1E4E8;--shiki-dark-font-weight:bold">**Markdown**</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> syntax.</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">You can use headings, lists, tables, code blocks, and more.</span></span></code></pre>
<h3 id="frontmatter-reference"><a class="heading-anchor" aria-hidden tabindex="-1" href="#frontmatter-reference"><span class="icon icon-link"></span></a>Frontmatter Reference</h3>
<p>Every page can include YAML frontmatter at the top:</p>
<table>
<thead>
<tr>
<th>Field</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>title</code></td>
<td>string</td>
<td>Page title shown in sidebar and browser tab</td>
</tr>
<tr>
<td><code>description</code></td>
<td>string</td>
<td>Short summary for SEO and navigation</td>
</tr>
<tr>
<td><code>icon</code></td>
<td>string</td>
<td>Icon name displayed next to the title in the sidebar</td>
</tr>
<tr>
<td><code>sidebarTitle</code></td>
<td>string</td>
<td>Override the title shown in the sidebar</td>
</tr>
<tr>
<td><code>hidden</code></td>
<td>boolean</td>
<td>Hide this page from the sidebar navigation</td>
</tr>
<tr>
<td><code>tags</code></td>
<td>string[]</td>
<td>Tags for search and categorization</td>
</tr>
</tbody>
</table>
<h2 id="4-configure-your-site"><a class="heading-anchor" aria-hidden tabindex="-1" href="#4-configure-your-site"><span class="icon icon-link"></span></a>4. Configure Your Site</h2>
<p>Edit <code>tome.config.js</code> to customize your documentation site:</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#D73A49;--shiki-dark:#F97583">export</span><span style="color:#D73A49;--shiki-dark:#F97583"> default</span><span style="color:#24292E;--shiki-dark:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  name: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"scaffold-preview"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  theme: {</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    preset: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"amber"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,    </span><span style="color:#6A737D;--shiki-dark:#6A737D">// Theme preset: "amber" or "editorial"</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    accent: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"#e8a845"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,  </span><span style="color:#6A737D;--shiki-dark:#6A737D">// Custom accent color (hex)</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    mode: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"auto"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,       </span><span style="color:#6A737D;--shiki-dark:#6A737D">// Color mode: "light", "dark", or "auto"</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  navigation: [</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    {</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">      group: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"Getting Started"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">      pages: [</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"index"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">, </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"quickstart"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">, </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"components"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    },</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  ],</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">};</span></span></code></pre>
<h3 id="navigation"><a class="heading-anchor" aria-hidden tabindex="-1" href="#navigation"><span class="icon icon-link"></span></a>Navigation</h3>
<p>The <code>navigation</code> array controls your sidebar. Each group has a label and a list of page IDs (the filename without the extension):</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">navigation</span><span style="color:#24292E;--shiki-dark:#E1E4E8">: [</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  {</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    group: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"Getting Started"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    pages: [</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"index"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">, </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"quickstart"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  {</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    group: </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"Reference"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">,</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">    pages: [</span><span style="color:#032F62;--shiki-dark:#9ECBFF">"components"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">, </span><span style="color:#032F62;--shiki-dark:#9ECBFF">"api"</span><span style="color:#24292E;--shiki-dark:#E1E4E8">],</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">],</span></span></code></pre>
<h2 id="5-using-mdx-components"><a class="heading-anchor" aria-hidden tabindex="-1" href="#5-using-mdx-components"><span class="icon icon-link"></span></a>5. Using MDX Components</h2>
<p>Tome includes a set of built-in components you can use in <code>.mdx</code> files without any imports. See the <a href="/components">Components</a> page for a full showcase.</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x26;#x3C;!-- Use a callout in any .mdx file --></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x26;#x3C;Callout type="tip" title="Pro Tip"></span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">  Components are automatically available — no import needed.</span></span>
<span class="line"><span style="color:#24292E;--shiki-dark:#E1E4E8">&#x26;#x3C;/Callout></span></span></code></pre>
<h2 id="6-build-and-deploy"><a class="heading-anchor" aria-hidden tabindex="-1" href="#6-build-and-deploy"><span class="icon icon-link"></span></a>6. Build and Deploy</h2>
<p>When you are ready to publish, build your site into static files:</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">npm</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> run</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> build</span></span></code></pre>
<p>This outputs a production-ready static site to the <code>out/</code> directory. Deploy it to any static hosting provider:</p>
<pre class="shiki shiki-themes github-light github-dark" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D;--shiki-dark:#6A737D"># Vercel</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">vercel</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> deploy</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> ./out</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;--shiki-dark:#6A737D"># Netlify</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">netlify</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> deploy</span><span style="color:#005CC5;--shiki-dark:#79B8FF"> --dir=./out</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D;--shiki-dark:#6A737D"># Cloudflare Pages</span></span>
<span class="line"><span style="color:#6F42C1;--shiki-dark:#B392F0">wrangler</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> pages</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> deploy</span><span style="color:#032F62;--shiki-dark:#9ECBFF"> ./out</span></span></code></pre>
<hr>
<p>That is it! You now have a fully functional documentation site. Explore the <a href="/components">Components</a> page to see all the interactive elements you can add to your pages.</p>`,headings:[{depth:2,text:"Prerequisites",id:"prerequisites"},{depth:2,text:"1. Install Dependencies",id:"1-install-dependencies"},{depth:2,text:"2. Start the Dev Server",id:"2-start-the-dev-server"},{depth:2,text:"3. Write Your First Page",id:"3-write-your-first-page"},{depth:3,text:"Frontmatter Reference",id:"frontmatter-reference"},{depth:2,text:"4. Configure Your Site",id:"4-configure-your-site"},{depth:3,text:"Navigation",id:"navigation"},{depth:2,text:"5. Using MDX Components",id:"5-using-mdx-components"},{depth:2,text:"6. Build and Deploy",id:"6-build-and-deploy"}],raw:`
# Quickstart

This guide walks you through setting up a Tome documentation site from scratch, configuring it, and deploying it to production.

## Prerequisites

Before you begin, make sure you have:

- **Node.js 18** or later installed ([download](https://nodejs.org))
- A package manager: \`npm\`, \`yarn\`, or \`pnpm\`
- A terminal and a code editor

## 1. Install Dependencies

After running \`tome init\`, install your project dependencies:

\`\`\`bash
cd scaffold-preview
npm install
\`\`\`

## 2. Start the Dev Server

Launch the local development server with hot reloading:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser. Every time you save a file, the page updates instantly.

## 3. Write Your First Page

Create a new file in the \`pages/\` directory. Each \`.md\` or \`.mdx\` file becomes a page on your site.

\`\`\`markdown
---
title: My New Page
description: A brief summary for search and navigation
---

# My New Page

Write your content using standard **Markdown** syntax.
You can use headings, lists, tables, code blocks, and more.
\`\`\`

### Frontmatter Reference

Every page can include YAML frontmatter at the top:

| Field | Type | Description |
|-------|------|-------------|
| \`title\` | string | Page title shown in sidebar and browser tab |
| \`description\` | string | Short summary for SEO and navigation |
| \`icon\` | string | Icon name displayed next to the title in the sidebar |
| \`sidebarTitle\` | string | Override the title shown in the sidebar |
| \`hidden\` | boolean | Hide this page from the sidebar navigation |
| \`tags\` | string[] | Tags for search and categorization |

## 4. Configure Your Site

Edit \`tome.config.js\` to customize your documentation site:

\`\`\`javascript
export default {
  name: "scaffold-preview",
  theme: {
    preset: "amber",    // Theme preset: "amber" or "editorial"
    accent: "#e8a845",  // Custom accent color (hex)
    mode: "auto",       // Color mode: "light", "dark", or "auto"
  },
  navigation: [
    {
      group: "Getting Started",
      pages: ["index", "quickstart", "components"],
    },
  ],
};
\`\`\`

### Navigation

The \`navigation\` array controls your sidebar. Each group has a label and a list of page IDs (the filename without the extension):

\`\`\`javascript
navigation: [
  {
    group: "Getting Started",
    pages: ["index", "quickstart"],
  },
  {
    group: "Reference",
    pages: ["components", "api"],
  },
],
\`\`\`

## 5. Using MDX Components

Tome includes a set of built-in components you can use in \`.mdx\` files without any imports. See the [Components](/components) page for a full showcase.

\`\`\`markdown
<!-- Use a callout in any .mdx file -->
<Callout type="tip" title="Pro Tip">
  Components are automatically available — no import needed.
</Callout>
\`\`\`

## 6. Build and Deploy

When you are ready to publish, build your site into static files:

\`\`\`bash
npm run build
\`\`\`

This outputs a production-ready static site to the \`out/\` directory. Deploy it to any static hosting provider:

\`\`\`bash
# Vercel
vercel deploy ./out

# Netlify
netlify deploy --dir=./out

# Cloudflare Pages
wrangler pages deploy ./out
\`\`\`

---

That is it! You now have a fully functional documentation site. Explore the [Components](/components) page to see all the interactive elements you can add to your pages.
`};export{n as default};
