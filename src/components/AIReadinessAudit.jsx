import React from 'react';

const AUDIT_STATS = [
  {
    stat: 'Opportunities',
    label: 'Where AI can create the greatest impact',
  },
  {
    stat: 'Risks',
    label: 'What to watch for before you invest',
  },
  {
    stat: 'Priorities',
    label: 'A clear, ranked place to start',
  },
];

const AIReadinessAudit = () => {
  return (
    <section id="audit" className="py-32 px-6 bg-slate-dark text-ghost-white">
      <div className="max-w-6xl mx-auto text-center">
        <span className="block font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
          AI Opportunity Audit
        </span>
        <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
          Find Where AI Creates Value.
        </h2>
        <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-4xl mx-auto mb-5 leading-relaxed">
          A structured assessment that surfaces the opportunities, risks, and priorities that matter most for your organization — before you invest in building anything.
        </p>
        <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-4xl mx-auto leading-relaxed">
          We map how work happens across your teams and systems, then turn that understanding into a practical, prioritized starting point.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mt-10">
          {AUDIT_STATS.map((item) => (
            <div
              key={item.stat}
              className="bg-navy-deep/50 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm"
            >
              <div className="font-sans font-extrabold text-2xl text-champagne mb-2">{item.stat}</div>
              <div className="font-sans text-base text-ghost-white/70 max-w-[240px]">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center gap-4">
          <a
            href="#contact"
            className="magnetic-btn bg-brand-green text-white font-bold text-lg px-8 py-4 rounded-full inline-flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(94,192,138,0.3)]"
          >
            <span>Start an AI Opportunity Audit</span>
            <span>&rarr;</span>
          </a>
          <p className="text-sm text-ghost-white/55">A practical first step — no commitment required.</p>
        </div>
      </div>
    </section>
  );
};

export default AIReadinessAudit;
