import React from 'react';

const BeyondHomeServices = () => {
    return (
        <section id="solutions" className="py-24 px-6 bg-slate-dark text-center flex flex-col items-center">
            <div className="max-w-[700px] flex flex-col items-center">
                <span className="font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
                    Featured Solutions
                </span>
                <h3 className="font-sans font-bold text-2xl md:text-3xl text-white mb-6">
                    Solutions Built for the Human-AI Era
                </h3>
                <p className="font-sans text-lg text-ghost-white/70 leading-relaxed mb-8">
                    Tier 4 Intelligence develops products, frameworks, and systems that help organizations operate more intelligently. Current and future offerings will be featured here as the portfolio grows.
                </p>
                <a href="#contact" className="font-sans font-medium text-brand-green hover:text-white transition-colors duration-300 link-lift">
                    Talk with our team &rarr;
                </a>
            </div>
        </section>
    );
};

export default BeyondHomeServices;
