import React from 'react';
import LeadCaptureForm from './LeadCaptureForm';

const CTASection = () => {
    return (
        <section id="contact" className="py-32 px-6 bg-navy-deep flex flex-col items-center text-center relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6 leading-tight">
                    Ready to Find Where AI Creates Value?
                </h2>
                <p className="font-sans text-xl text-ghost-white/70 mb-10">
                    Start with an AI Opportunity Audit and discover the opportunities, risks, and priorities that matter most for your organization.
                </p>
                <div className="font-mono text-xs md:text-sm text-brand-green/80 flex flex-wrap justify-center gap-x-4 gap-y-2 mb-12">
                    You'll leave with: A clear view of where AI fits &bull; The highest-value opportunities &bull; Key risks to manage &bull; A practical, prioritized place to start
                </div>

                <LeadCaptureForm />


                <p className="font-mono text-sm text-ghost-white/40 mb-12">
                    Or email directly: info@tier4intelligence.com
                </p>

                {/* Micro Stats */}
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 text-sm font-mono text-ghost-white/60">
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne"></span>
                        <span>Practical</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne"></span>
                        <span>Outcome-driven</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-champagne"></span>
                        <span>Governed</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
