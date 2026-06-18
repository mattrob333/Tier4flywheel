import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STAGES_DATA = [
    {
        num: "01",
        title: "AI Opportunity Audit",
        desc: "A structured assessment that identifies where AI can create the greatest impact across your organization. We map how work happens today, then surface the opportunities, risks, and priorities worth acting on — before you invest in building anything.",
        statMain: "Clarity",
        statLabel: "on where to start",
        uiType: "audit"
    },
    {
        num: "02",
        title: "AI Strategy & Blueprint",
        desc: "A practical roadmap that aligns business goals, workflows, technology, and implementation priorities. You get a clear, sequenced plan for what to build, in what order, and how each initiative connects to measurable outcomes.",
        statMain: "Roadmap",
        statLabel: "aligned to your goals",
        uiType: "blueprint"
    },
    {
        num: "03",
        title: "Custom AI Solutions",
        desc: "Internal tools, assistants, automations, knowledge systems, and workflow enhancements tailored to your business. We design and implement solutions that support people, improve how work gets done, and create results you can measure.",
        statMain: "Solutions",
        statLabel: "built around your workflows",
        uiType: "solutions"
    },
    {
        num: "04",
        title: "AI Enablement & Training",
        desc: "Help leaders and teams build confidence, develop new capabilities, and adopt AI effectively. We meet people where they are and turn AI from an abstract mandate into practical, everyday capability.",
        statMain: "Capability",
        statLabel: "across leaders and teams",
        uiType: "enablement"
    },
    {
        num: "05",
        title: "Fractional AI Leadership",
        desc: "Strategic guidance for organizations that need ongoing support navigating AI adoption and execution. We provide senior, hands-on leadership that keeps initiatives grounded, governed, and connected to real business value.",
        statMain: "Guidance",
        statLabel: "from strategy to execution",
        uiType: "leadership"
    }
];

// Neutral, on-theme panels per service — workflow / diagram style, no busy dashboards.
const MicroUI = ({ type }) => {
    if (type === 'audit') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto">
                <div className="font-mono text-xs tracking-widest text-ghost-white/50 uppercase mb-5">Opportunity Map</div>
                <div className="space-y-3">
                    {[
                        { label: "Customer support workflows", val: "92%", high: true },
                        { label: "Knowledge & documentation", val: "78%", high: false },
                        { label: "Reporting & analysis", val: "61%", high: false },
                        { label: "Onboarding & training", val: "44%", high: false }
                    ].map((row) => (
                        <div key={row.label} className={`p-3 rounded-lg border ${row.high ? 'bg-brand-green/10 border-brand-green/30 shadow-[0_0_15px_rgba(94,192,138,0.15)]' : 'bg-slate-dark border-white/5'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-ghost-white/80">{row.label}</span>
                                <span className={`text-xs font-mono ${row.high ? 'text-brand-green' : 'text-ghost-white/50'}`}>{row.val}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div className={`h-full rounded-full ${row.high ? 'bg-brand-green' : 'bg-white/20'}`} style={{ width: row.val }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'blueprint') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto">
                <div className="font-mono text-xs tracking-widest text-ghost-white/50 uppercase mb-5">Implementation Roadmap</div>
                <div className="space-y-4">
                    {["Discover", "Prioritize", "Build", "Scale"].map((phase, i) => (
                        <div key={phase} className="flex items-center space-x-3">
                            <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-mono text-xs ${i === 0 ? 'bg-brand-green text-white' : 'bg-slate-dark border border-white/10 text-ghost-white/60'}`}>
                                {String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-white font-medium">{phase}</div>
                                <div className="h-1 mt-1.5 rounded-full bg-white/5 overflow-hidden">
                                    <div className="h-full bg-brand-green/60 rounded-full" style={{ width: `${100 - i * 22}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'solutions') {
        return (
            <div className="bg-[#0F0F14] rounded-2xl p-6 border border-white/5 w-full max-w-sm ml-auto">
                <div className="font-mono text-xs tracking-widest text-ghost-white/50 uppercase mb-5">Workflow</div>
                <div className="relative h-44">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:22px_22px] rounded-lg"></div>
                    <svg className="w-full h-full absolute inset-0 text-brand-green" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 15 25 L 50 50 L 85 25 M 50 50 L 50 85" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="animate-[dash_4s_linear_infinite]" opacity="0.7" />
                        <circle cx="15" cy="25" r="3.5" fill="currentColor" />
                        <circle cx="85" cy="25" r="3.5" fill="currentColor" />
                        <circle cx="50" cy="85" r="3.5" fill="currentColor" />
                    </svg>
                    <div className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-green/15 border border-brand-green/40 rounded-lg px-3 py-2 text-center shadow-[0_0_20px_rgba(94,192,138,0.2)]">
                        <div className="text-[10px] font-mono text-brand-green">AI ASSIST</div>
                        <div className="text-xs text-white">in the loop</div>
                    </div>
                </div>
                <div className="mt-4 text-xs text-ghost-white/60">People and systems, working together.</div>
            </div>
        );
    }

    if (type === 'enablement') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto">
                <div className="font-mono text-xs tracking-widest text-ghost-white/50 uppercase mb-5">Team Enablement</div>
                <div className="space-y-4">
                    {[
                        { label: "Leadership", val: 86 },
                        { label: "Operations", val: 72 },
                        { label: "Frontline teams", val: 64 }
                    ].map((row) => (
                        <div key={row.label}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-ghost-white/80">{row.label}</span>
                                <span className="text-brand-green font-mono">confident</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-brand-green rounded-full" style={{ width: `${row.val}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-5 bg-brand-green/10 border border-brand-green/30 rounded-lg p-3 text-xs text-brand-green">
                    Capability that compounds over time.
                </div>
            </div>
        );
    }

    if (type === 'leadership') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto">
                <div className="font-mono text-xs tracking-widest text-ghost-white/50 uppercase mb-5">Strategic Guidance</div>
                <div className="space-y-3">
                    {[
                        "Aligned to business priorities",
                        "Grounded in real workflows",
                        "Governed and risk-aware",
                        "Measured against outcomes"
                    ].map((item) => (
                        <div key={item} className="flex items-center space-x-3 bg-slate-dark border border-white/5 rounded-lg p-3">
                            <span className="w-2 h-2 rounded-full bg-brand-green shrink-0"></span>
                            <span className="text-xs text-ghost-white/80">{item}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};

const StageCards = () => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Stacking scale/blur logic
            cardsRef.current.forEach((card, i) => {
                if (i < cardsRef.current.length) {
                    if (i > 0) {
                        // When this card scrolls in, animate the previous one down
                        gsap.to(cardsRef.current[i - 1], {
                            scale: 0.92,
                            opacity: 0.4,
                            filter: 'blur(16px)',
                            duration: 1,
                            ease: "none",
                            scrollTrigger: {
                                trigger: card,
                                start: "top bottom",
                                end: "top top",
                                scrub: true,
                            }
                        });
                    }
                }
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const addToRefs = (el) => {
        if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
    };

    return (
        <section ref={containerRef} id="services" className="relative w-full bg-[#0B1426] pb-32">
            {STAGES_DATA.map((stage) => (
                <div
                    key={stage.num}
                    ref={addToRefs}
                    className="w-full h-screen sticky top-0 flex items-center justify-center will-change-transform z-10"
                >
                    <div className="w-[95%] max-w-7xl h-auto lg:h-[85vh] bg-slate-dark rounded-[2rem] lg:rounded-[3rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl">

                        {/* Left Box (Content) */}
                        <div className="w-full lg:w-[50%] p-6 md:p-10 lg:p-20 relative flex flex-col justify-center overflow-hidden">
                            <div className="absolute top-0 left-0 -translate-x-[20%] -translate-y-[20%] font-mono text-[180px] lg:text-[240px] leading-none text-champagne opacity-10 select-none z-0">
                                {stage.num}
                            </div>
                            <div className="relative z-10">
                                <div className="font-mono text-sm tracking-widest text-champagne mb-6 uppercase">
                                    Service {stage.num} — From Opportunity to Implementation
                                </div>
                                <h3 className="font-sans font-bold text-4xl md:text-5xl text-white tracking-tight mb-8">
                                    {stage.title}
                                </h3>
                                <p className="font-sans text-lg md:text-xl text-ghost-white/70 leading-relaxed max-w-md mb-8">
                                    {stage.desc}
                                </p>
                                {stage.statMain && (
                                    <div className="inline-block border border-champagne/30 rounded-xl px-4 py-3 bg-navy-deep/60 backdrop-blur-md">
                                        <div className="font-mono text-xl text-brand-green">{stage.statMain}</div>
                                        <div className="font-sans text-xs text-ghost-white/60 uppercase tracking-wider">{stage.statLabel}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Box (Micro UI) */}
                        <div className="w-full lg:w-[50%] bg-[#0B1426]/50 p-6 md:p-10 lg:p-20 flex items-center justify-center relative lg:border-l border-t lg:border-t-0 border-white/5">
                            <MicroUI type={stage.uiType} />
                        </div>

                    </div>
                </div>
            ))}
        </section>
    );
};

export default StageCards;
