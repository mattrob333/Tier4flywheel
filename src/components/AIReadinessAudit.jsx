import React, { useState } from 'react';

const AUDIT_STATS = [
  {
    stat: '25–45',
    label: 'Average AI Score for home services businesses',
  },
  {
    stat: '80+',
    label: 'Where Tier 4 clients score after the flywheel',
  },
  {
    stat: '60 sec',
    label: 'Time to generate your free report',
  },
];

const normalizeDomainInput = (value) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
  const withoutWww = withoutProtocol.replace(/^www\./i, '');
  const [domain] = withoutWww.split(/[/?#]/);

  return domain.trim().replace(/\/$/, '');
};

const AIReadinessAudit = () => {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanedDomain = normalizeDomainInput(domain);

    if (!cleanedDomain) {
      setError('Enter your domain to continue');
      return;
    }

    setError('');
    setDomain(cleanedDomain);
    window.location.assign(`/api/report?domain=${encodeURIComponent(cleanedDomain)}`);
  };

  return (
    <section id="ai-readiness-audit" className="py-32 px-6 bg-slate-dark text-ghost-white">
      <div className="max-w-6xl mx-auto text-center">
        <span className="block font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
          AI Readiness Audit
        </span>
        <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
          Your AI Score Is Where the Flywheel Starts.
        </h2>
        <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-4xl mx-auto mb-5 leading-relaxed">
          Before we build anything, we run a diagnostic. Your AI Readiness Score measures how visible your business is to AI search engines like ChatGPT and Perplexity, what's preventing Google from fully indexing your site, and where leads are slipping through the cracks in your digital presence.
        </p>
        <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-4xl mx-auto leading-relaxed">
          Most home services businesses score between 25 and 45 out of 100. Every point below 70 is revenue you're leaving on the table. The flywheel starts by closing that gap.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-10">
          {AUDIT_STATS.map((item) => (
            <div
              key={item.stat}
              className="bg-navy-deep/50 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm"
            >
              <div className="font-mono text-3xl text-champagne mb-2">{item.stat}</div>
              <div className="font-sans font-bold text-base text-white max-w-[240px]">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-10 max-w-3xl mx-auto rounded-[2rem] border border-white/10 bg-navy-deep/50 p-8 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <form onSubmit={handleSubmit} action="/api/report" method="get" className="mx-auto flex max-w-2xl flex-col gap-4 md:flex-row" noValidate>
            <input
              aria-label="Domain"
              autoComplete="url"
              name="domain"
              placeholder="yourdomain.com"
              required
              type="text"
              value={domain}
              onChange={(event) => {
                setDomain(event.target.value);
                if (error) {
                  setError('');
                }
              }}
              className="w-full md:flex-1 bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-4 text-white focus:outline-none focus:border-brand-green/50 transition-colors"
            />
            <button
              type="submit"
              className="magnetic-btn bg-brand-green text-white font-bold text-lg px-8 py-4 rounded-full flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(94,192,138,0.3)] whitespace-nowrap"
            >
              <span>Get My Free AI Score</span>
              <span>&rarr;</span>
            </button>
          </form>
          {error ? (
            <div className="mt-4 max-w-2xl mx-auto text-left rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
          <p className="mt-4 text-sm text-ghost-white/55">Free. Instant. No signup required.</p>
        </div>
        <p className="mt-6 text-sm text-ghost-white/55">Used as the first step in every Tier 4 client engagement.</p>
      </div>
    </section>
  );
};

export default AIReadinessAudit;
