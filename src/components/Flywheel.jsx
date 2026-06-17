import React, { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Map, PenTool, Hammer, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
    {
        number: 1,
        name: "Understand",
        icon: Search,
        desc: "Learn how the business operates today — the people, workflows, decisions, and realities behind the work.",
        metric: "Grounded in how work actually happens",
        next: "Leads into Map"
    },
    {
        number: 2,
        name: "Map",
        icon: Map,
        desc: "Identify workflows, bottlenecks, opportunities, and decision points where AI can create meaningful value.",
        metric: "Opportunities, prioritized by impact",
        next: "Leads into Design"
    },
    {
        number: 3,
        name: "Design",
        icon: PenTool,
        desc: "Create a practical implementation plan that aligns goals, workflows, technology, and priorities.",
        metric: "A clear, sequenced blueprint",
        next: "Leads into Build"
    },
    {
        number: 4,
        name: "Build",
        icon: Hammer,
        desc: "Deploy solutions that improve capability and efficiency, and that support the people who use them.",
        metric: "Working systems, in production",
        next: "Leads into Scale"
    },
    {
        number: 5,
        name: "Scale",
        icon: TrendingUp,
        desc: "Measure outcomes and expand what works through governance, training, and continuous improvement.",
        metric: "What works, expanded with confidence",
        next: "Refines back into Understand"
    }
];

const Flywheel = () => {
    const containerRef = useRef(null);
    const ringRef = useRef(null);
    const statsRef = useRef([]);
    const [activeStage, setActiveStage] = useState(0);

    // Geometry for SVG
    const radius = 180;
    const cx = 250;
    const cy = 250;

    const getSegmentPath = (index, total) => {
        const startAngle = (index * 360) / total - 90;
        const endAngle = ((index + 1) * 360) / total - 90;
        const padding = 2; // small gap between segments

        const startRad = (startAngle + padding) * (Math.PI / 180);
        const endRad = (endAngle - padding) * (Math.PI / 180);

        const x1 = cx + radius * Math.cos(startRad);
        const y1 = cy + radius * Math.sin(startRad);
        const x2 = cx + radius * Math.cos(endRad);
        const y2 = cy + radius * Math.sin(endRad);

        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    };

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Rotate the entire ring slowly
            gsap.to(ringRef.current, {
                rotation: 360,
                duration: 90,
                repeat: -1,
                ease: "none"
            });

            // Stats entrance & counting
            statsRef.current.forEach((el, index) => {
                gsap.fromTo(el,
                    { y: 40, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.8,
                        delay: index * 0.15,
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top 60%"
                        }
                    }
                );
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const addToStatsRef = (el) => {
        if (el && !statsRef.current.includes(el)) statsRef.current.push(el);
    };

    return (
        <section ref={containerRef} id="how-we-work" className="py-32 px-6 bg-slate-dark text-ghost-white overflow-hidden">

            {/* Intro */}
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-4 mb-20 relative z-10">
                <span className="font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
                    OUR PROCESS
                </span>
                <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
                    From Understanding to Outcomes.
                </h2>
                <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-[700px] mb-8">
                    A clear, repeatable process for finding where AI belongs and building it well — five steps that turn understanding into measurable results.
                </p>
                <div className="font-mono text-sm text-ghost-white/40 max-w-[600px] border border-ghost-white/10 rounded-xl px-4 py-3 bg-navy-deep/20 mb-16">
                    Grounded in how your teams actually work.
                </div>

                {/* Qualitative principle cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {[
                        { title: "Grounded in real workflows", detail: "We start with how work actually happens." },
                        { title: "Practical over theoretical", detail: "Plans you can act on, not slide decks." },
                        { title: "Built with your team", detail: "Capability that stays after we're done." }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            ref={addToStatsRef}
                            className="bg-navy-deep/50 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <div className="font-sans font-bold text-base text-white mb-2">{item.title}</div>
                            <div className="font-sans text-xs text-ghost-white/50">{item.detail}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flywheel Container */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 lg:gap-20 mb-32 z-10 relative">

                {/* SVG Diagram */}
                <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] shrink-0">

                    {/* Inner static circle/text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                        <div className="w-[180px] h-[180px] md:w-[260px] md:h-[260px] bg-navy-deep rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(94,192,138,0.15)] border border-brand-green/20 backdrop-blur-md">
                            <span className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-mono mb-2">Our Process</span>
                            <span className="font-serif italic text-2xl md:text-3xl text-champagne text-center px-6 leading-tight">Understand to Outcomes</span>
                        </div>
                    </div>

                    <svg
                        ref={ringRef}
                        viewBox="0 0 500 500"
                        className="w-full h-full drop-shadow-2xl opacity-90"
                    >
                        {STAGES.map((stage, idx) => {
                            const path = getSegmentPath(idx, STAGES.length);
                            const isActive = activeStage === idx;
                            const isHoveredAny = activeStage !== null;

                            // Compute icon position
                            const angle = (idx * 360) / STAGES.length + (360 / STAGES.length / 2) - 90;
                            const rad = angle * (Math.PI / 180);
                            const iconR = 215; // inside the segment
                            const x = cx + iconR * Math.cos(rad);
                            const y = cy + iconR * Math.sin(rad);

                            return (
                                <g
                                    key={stage.number}
                                    onMouseEnter={() => setActiveStage(idx)}
                                    className="cursor-pointer transition-all duration-300 origin-center"
                                >
                                    <path
                                        d={path}
                                        fill={isActive ? 'rgba(94,192,138,0.3)' : (isHoveredAny ? '#0B1426' : '#0B1426')}
                                        stroke={isActive ? '#5EC08A' : 'rgba(255,255,255,0.05)'}
                                        strokeWidth="2"
                                        className="transition-colors duration-300"
                                    />
                                    <g transform={`translate(${x - 12}, ${y - 12}) rotate(${-angle + 90}, 12, 12)`} className="pointer-events-none transition-colors duration-300" stroke={isActive ? 'white' : 'rgba(255,255,255,0.3)'}>
                                        <stage.icon size={24} strokeWidth={1.5} />
                                    </g>
                                </g>
                            );
                        })}

                        {/* Cut out the inner circle visually */}
                        <circle cx="250" cy="250" r="140" fill="#1A1F2E" className="pointer-events-none" />
                    </svg>

                </div>

                {/* Details Panel */}
                <div className="w-full lg:w-[450px] min-h-[300px] flex items-center bg-navy-deep/40 rounded-3xl p-8 lg:p-12 border border-white/5 backdrop-blur-lg">
                    {activeStage !== null ? (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 fill-mode-forwards">
                            <div className="flex items-center space-x-4 mb-6">
                                <span className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center border border-brand-green/30 text-brand-green">
                                    {React.createElement(STAGES[activeStage].icon, { size: 20 })}
                                </span>
                                <div>
                                    <span className="font-mono text-champagne text-xs block mb-1">STEP 0{STAGES[activeStage].number}</span>
                                    <h3 className="font-sans font-bold text-2xl text-white">{STAGES[activeStage].name}</h3>
                                </div>
                            </div>
                            <p className="text-ghost-white/80 text-lg leading-relaxed mb-6 font-sans">
                                {STAGES[activeStage].desc}
                            </p>
                            <div className="bg-navy-deep rounded-xl p-4 border border-white/5 mb-6">
                                <span className="block font-mono text-champagne text-sm">{STAGES[activeStage].metric}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-ghost-white/50 text-sm font-mono">
                                <span className="w-4 h-[1px] bg-ghost-white/20"></span>
                                <span>{STAGES[activeStage].next}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center w-full text-ghost-white/30 font-sans italic">
                            Hover over a step to explore our process.
                        </div>
                    )}
                </div>
            </div>

            {/* Closing Quote */}
            <div className="max-w-4xl mx-auto text-center relative z-10 pb-12">
                <p className="font-serif italic text-2xl md:text-3xl text-brand-green/80">
                    "Start where the value is clearest."
                </p>
            </div>

        </section>
    );
};

export default Flywheel;
