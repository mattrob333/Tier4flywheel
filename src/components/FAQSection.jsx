import React from 'react';

const FAQ_ITEMS = [
  {
    question: 'AI Strategy',
    answer: 'How leaders decide where AI belongs — connecting business goals, workflows, and technology into a plan worth acting on.',
  },
  {
    question: 'Human-AI Collaboration',
    answer: 'Designing work so AI makes people more capable, not less essential — keeping humans in the loop on the decisions that matter.',
  },
  {
    question: 'Business Process Design',
    answer: 'Rethinking how work actually happens, so AI is applied to the right steps, bottlenecks, and decision points.',
  },
  {
    question: 'Organizational Intelligence',
    answer: 'Turning scattered knowledge, data, and expertise into systems an organization can actually use.',
  },
  {
    question: 'AI Governance',
    answer: 'Practical guidance on risk, oversight, and responsible adoption — so initiatives stay accountable as they scale.',
  },
  {
    question: 'Executive Briefings',
    answer: 'Clear, jargon-free perspective for leaders who need to make good decisions about AI without becoming AI experts.',
  },
  {
    question: 'Industry Use Cases',
    answer: 'Real examples of where AI is creating value across functions and sectors — and what made them work.',
  },
];

const FAQSection = () => {
  return (
    <section id="insights" className="py-32 px-6 bg-navy-deep text-ghost-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="block font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
            Intelligence Hub
          </span>
          <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
            Insights for leaders navigating AI adoption.
          </h2>
          <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-3xl mx-auto leading-relaxed">
            Research, frameworks, and practical guidance across the topics that matter most for organizations putting AI to work.
          </p>
        </div>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-2xl border border-white/5 bg-slate-dark/80 p-6">
              <summary className="cursor-pointer list-none font-sans text-lg md:text-xl font-semibold text-white">
                {item.question}
              </summary>
              <p className="mt-4 font-sans text-base md:text-lg text-ghost-white/70 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
