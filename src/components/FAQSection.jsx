import React from 'react';

const FAQ_ITEMS = [
  {
    question: 'Do you replace our existing marketing agency, CSR team, or dispatch platform?',
    answer: 'No. We build on top of the stack you already run. In some cases we replace narrow vendor work, but the goal is not disruption for its own sake. The goal is a cleaner system that coordinates acquisition, response, routing, and reputation more effectively.',
  },
  {
    question: 'Are you only for home services companies?',
    answer: 'Home services is the most proven operating environment for the AI Growth Flywheel because the economics are clear and the workflow loops are strong. The underlying platform can extend into other service-based or logistics-heavy operating models when the process and data quality are a fit.',
  },
  {
    question: 'What happens after the first 90 days?',
    answer: 'We continue operating the system. That includes monitoring response performance, refining automations, expanding page coverage, reviewing lead-quality data, and keeping the full flywheel aligned to business priorities and market conditions.',
  },
  {
    question: 'What should a first conversation include?',
    answer: 'Bring your current lead sources, after-hours response challenges, call handling assumptions, scheduling constraints, service-area footprint, and the KPIs leadership cares about most. We use that to identify where the highest-value automation layer should start.',
  },
  {
    question: 'What is an AI Readiness Score?',
    answer: 'An AI Readiness Score measures how visible and citable your website is to AI search engines like ChatGPT, Perplexity, and Google AI Overviews. It evaluates technical health, content quality, schema markup, llms.txt configuration, and brand authority signals. Most home services businesses score between 25 and 45 out of 100, and Tier 4 Intelligence offers a free AI Readiness Audit at tier4intelligence.com/api/report.',
  },
  {
    question: 'How does the AI Growth Flywheel work for HVAC companies?',
    answer: 'The flywheel connects hyper-local SEO pages, targeted Meta and Google ads, AI voice agents that answer every call 24/7, automated lead scoring and dispatch, and a reputation engine that helps HVAC businesses generate more 5-star reviews. Each stage feeds the next so the gains compound over time.',
  },
  {
    question: 'How long does it take to implement the AI Growth Flywheel?',
    answer: 'Full deployment takes 90 days. Days 1-15 focus on the AI Readiness Audit and system integration mapping. Days 15-45 launch SEO pages, ads, and AI voice agents. Days 45-75 activate lead scoring and smart dispatch. Days 75-90 connect the reputation engine and the full flywheel, after which Tier 4 continues managing the system.',
  },
  {
    question: 'Does the AI Growth Flywheel work with ServiceTitan?',
    answer: 'Yes. The Tier 4 Intelligence AI Growth Flywheel integrates natively with ServiceTitan, Housecall Pro, Jobber, FieldEdge, and other major field service platforms. No rip-and-replace required. The system layers on top of your existing tools.',
  },
];

const FAQSection = () => {
  return (
    <section className="py-32 px-6 bg-navy-deep text-ghost-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="block font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
            Frequently Asked Questions
          </span>
          <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
            The operational questions we get before the flywheel goes live.
          </h2>
          <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-3xl mx-auto leading-relaxed">
            If you are evaluating Tier 4 Intelligence, these are the questions that usually matter most before the first rollout begins.
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
