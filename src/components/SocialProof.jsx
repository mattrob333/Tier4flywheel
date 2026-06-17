import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SocialProof = () => {
    const containerRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Timeline progress animation
            gsap.fromTo('.timeline-progress',
                { width: '0%' },
                {
                    width: '100%',
                    ease: 'power1.inOut',
                    scrollTrigger: {
                        trigger: '.timeline-container',
                        start: 'top 70%',
                        end: 'bottom 50%',
                        scrub: 1
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} id="approach" className="py-32 px-6 bg-ivory text-navy-deep">
            <div className="max-w-6xl mx-auto space-y-24">

                {/* Eyebrow */}
                <div className="opacity-80 flex flex-col items-center">
                    <p className="font-mono text-xs md:text-sm tracking-widest text-champagne uppercase">
                        How We Help
                    </p>
                </div>

                {/* A Practical Approach */}
                <div className="timeline-container relative">
                    <div className="text-center mb-16">
                        <h3 className="font-sans font-extrabold text-3xl md:text-5xl text-navy-deep mb-4 tracking-tight">A Practical Approach to AI Adoption</h3>
                        <p className="font-sans text-lg text-navy-deep/70">From understanding the work to scaling what works.</p>
                    </div>

                    <div className="relative hidden md:block w-full max-w-5xl mx-auto">
                        {/* Progress Bar background */}
                        <div className="absolute top-6 left-0 w-full h-1 bg-navy-deep/10 rounded-full"></div>
                        {/* Animated Progress Line */}
                        <div className="timeline-progress absolute top-6 left-0 h-1 bg-brand-green rounded-full width-0 max-w-full z-0"></div>

                        <div className="grid grid-cols-4 gap-6 relative z-10 pt-[50px]">
                            {[
                                { label: "01", title: "Discover", desc: "Understand how work actually happens across teams, systems, and processes." },
                                { label: "02", title: "Prioritize", desc: "Identify the highest-value opportunities for AI based on business impact, feasibility, and risk." },
                                { label: "03", title: "Build", desc: "Design and implement solutions that support people, improve workflows, and create measurable results." },
                                { label: "04", title: "Scale", desc: "Expand successful initiatives through governance, training, and continuous improvement." }
                            ].map((step, idx) => (
                                <div key={idx} className="relative">
                                    {/* Dot */}
                                    <div className="absolute top-[-38px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-ivory bg-brand-green"></div>
                                    <div className="text-center">
                                        <span className="font-mono text-xs font-bold text-brand-green block mb-2">{step.label}</span>
                                        <h4 className="font-sans font-bold text-base text-navy-deep mb-1">{step.title}</h4>
                                        <p className="font-sans text-xs text-navy-deep/60 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile version */}
                    <div className="md:hidden space-y-8 relative pl-6">
                        <div className="absolute top-0 bottom-0 left-[7px] w-1 bg-navy-deep/10 rounded-full"></div>
                        {[
                            { label: "01", title: "Discover", desc: "Understand how work actually happens across teams, systems, and processes." },
                            { label: "02", title: "Prioritize", desc: "Identify the highest-value opportunities for AI based on business impact, feasibility, and risk." },
                            { label: "03", title: "Build", desc: "Design and implement solutions that support people, improve workflows, and create measurable results." },
                            { label: "04", title: "Scale", desc: "Expand successful initiatives through governance, training, and continuous improvement." }
                        ].map((step, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute top-2 -left-[28px] w-4 h-4 rounded-full border-4 border-ivory bg-brand-green"></div>
                                <div>
                                    <span className="font-mono text-xs font-bold text-brand-green block mb-1">{step.label}</span>
                                    <h4 className="font-sans font-bold text-base text-navy-deep mb-1">{step.title}</h4>
                                    <p className="font-sans text-sm text-navy-deep/60 leading-relaxed max-w-[280px]">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Brand Statement */}
                <div className="max-w-4xl mx-auto text-center border-t border-navy-deep/10 pt-16">
                    <p className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-navy-deep leading-relaxed">
                        "AI should make people more capable."
                    </p>
                </div>

            </div>
        </section>
    );
};

export default SocialProof;
