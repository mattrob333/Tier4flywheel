import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Globe, Megaphone, Headphones, Navigation, Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STAGES = [
    {
        number: 1,
        name: "Get Found",
        icon: Globe,
        desc: "SEO + AI search — rank everywhere customers look",
        metric: "70% reduction in cost-per-lead",
        next: "Feeds into Meta Ads"
    },
    {
        number: 2,
        name: "Get Leads",
        icon: Megaphone,
        desc: "Meta Ads + Google Ads fill your pipeline",
        metric: "$18 avg cost per qualified lead",
        next: "Feeds into Capture"
    },
    {
        number: 3,
        name: "Capture Every Lead",
        icon: Headphones,
        desc: "AI voice, text & chat — 24/7, no lead missed",
        metric: "95%+ answer rate",
        next: "Feeds into Routing"
    },
    {
        number: 4,
        name: "Close the Job",
        icon: Navigation,
        desc: "Smart routing — right tech, right job, every time",
        metric: "+12% avg ticket size increase",
        next: "Feeds into Reviews"
    },
    {
        number: 5,
        name: "Get Reviews",
        icon: Star,
        desc: "Automated reviews feed back into Stage 1",
        metric: "4.8★ average rating",
        next: "Feeds back into Get Found"
    }
];

const Flywheel = () => {
    const containerRef = useRef(null);
    const ringRef = useRef(null);
    const statsRef = useRef([]);
    const [activeStage, setActiveStage] = useState(0);
    const [ebitdaCount, setEbitdaCount] = useState(0);

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

    // EBITDA counter effect
    useEffect(() => {
        const interval = setInterval(() => {
            setEbitdaCount(prev => (prev < 113 ? prev + 1 : 113));
        }, 20); // ticks up quickly
        return () => clearInterval(interval);
    }, []);

    const addToStatsRef = (el) => {
        if (el && !statsRef.current.includes(el)) statsRef.current.push(el);
    };

    return (
        <section ref={containerRef} id="the-flywheel" className="py-32 px-6 bg-slate-dark text-ghost-white overflow-hidden">

            {/* Intro */}
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center px-4 mb-20 relative z-10">
                <span className="font-mono text-xs md:text-sm tracking-widest text-champagne mb-4 uppercase">
                    THE GROWTH FLYWHEEL
                </span>
                <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mb-6">
                    Five Systems. One Flywheel. Growth That Compounds.
                </h2>
                <p className="font-sans text-lg md:text-xl text-ghost-white/70 max-w-[700px] mb-8">
                    Every stage feeds the next. More visibility brings more leads. More leads mean more jobs. More jobs mean more reviews. More reviews bring more visibility. One system — always accelerating.
                </p>
                <div className="font-mono text-sm text-ghost-white/40 max-w-[600px] border border-ghost-white/10 rounded-xl px-4 py-3 bg-navy-deep/20 mb-16">
                    Integrates with ServiceTitan, Housecall Pro, Jobber, FieldEdge, and other field service platforms.
                </div>

                {/* Stat Blocks moved here from bottom */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {[
                        { stat: "+113%", title: "EBITDA Expansion", detail: "Year 1 ($10M baseline)" },
                        { stat: "< 6 mo", title: "Full Payback", detail: "Implementation cost recovered" },
                        { stat: "4.0x+", title: "Portfolio MOIC", detail: "3-year hold, 5+ companies" }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            ref={addToStatsRef}
                            className="bg-navy-deep/50 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm"
                        >
                            <div className="font-mono text-3xl text-champagne mb-2">{item.stat}</div>
                            <div className="font-sans font-bold text-base text-white mb-1">{item.title}</div>
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
                            <span className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-mono mb-1">EBITDA</span>
                            <span className="font-sans font-extrabold text-4xl md:text-5xl text-champagne">+{ebitdaCount}%</span>
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
                                    <span className="font-mono text-champagne text-xs block mb-1">STAGE 0{STAGES[activeStage].number}</span>
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
                            Hover over a stage to view system telemetry.
                        </div>
                    )}
                </div>
            </div>

            {/* Closing Quote */}
            <div className="max-w-4xl mx-auto text-center relative z-10 pb-12">
                <p className="font-serif italic text-2xl md:text-3xl text-brand-green/80">
                    "Every closed job makes the next one easier."
                </p>
            </div>

        </section>
    );
};

export default Flywheel;
