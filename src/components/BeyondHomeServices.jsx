import React from 'react';

const BeyondHomeServices = () => {
    return (
        <section className="py-24 px-6 bg-slate-dark text-center flex flex-col items-center">
            <div className="max-w-[700px] flex flex-col items-center">
                <span className="font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
                    For PE Operating Partners
                </span>
                <h3 className="font-sans font-bold text-2xl md:text-3xl text-white mb-6">
                    Your Portfolio Goes Beyond Home Services. So Do We.
                </h3>
                <p className="font-sans text-lg text-ghost-white/70 leading-relaxed mb-8">
                    The Growth Flywheel is our most deployed configuration — but the agentic platform underneath it isn't limited to one vertical. The same autonomous agent infrastructure powers automation systems across logistics, healthcare operations, financial services, and professional services. If your portfolio extends beyond home services, we extend with it.
                </p>
                <a href="#contact" className="font-sans font-medium text-brand-green hover:text-white transition-colors duration-300 link-lift">
                    Talk to us about your vertical &rarr;
                </a>
            </div>
        </section>
    );
};

export default BeyondHomeServices;
