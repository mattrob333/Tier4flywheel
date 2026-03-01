import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STAGES_DATA = [
    {
        num: "01",
        title: "Programmatic SEO & AI Web Presence",
        desc: "Your website shows up when people search \"plumber near me\" or \"best HVAC in [city].\" We auto-generate 500–2,000+ hyper-local pages on your existing domain. LLM.txt optimization means your business gets cited by AI search engines like ChatGPT and Perplexity — not just indexed by Google. Shifts your lead mix from 50%+ paid to 30% organic — permanently.",
        statMain: "70%",
        statLabel: "reduction in cost-per-lead",
        uiType: "seo"
    },
    {
        num: "02",
        title: "Meta Ads & Paid Lead Generation",
        desc: "Targeted Facebook, Instagram, and Google ads put your business in front of homeowners who need your service right now. We build the campaigns, manage the spend, and optimize daily. Every dollar works harder because the rest of the flywheel (AI answering, lead scoring, review loop) makes each lead more likely to convert and each customer more likely to refer.",
        statMain: "$18",
        statLabel: "average cost per qualified lead",
        uiType: "ads"
    },
    {
        num: "03",
        title: "AI Voice & Chat Agents",
        desc: "Every call answered. Every chat engaged. Every after-hours lead captured. Our AI agents speak naturally, qualify leads, book appointments, and sync directly to your existing field service platform — 24/7/365. No missed revenue. No voicemail. No excuses.",
        statMain: "95%+",
        statLabel: "answer rate — every call, every time",
        uiType: "telemetry"
    },
    {
        num: "04",
        title: "Lead Scoring, Routing & Smart Dispatch",
        desc: "A 10-minute delay drops lead qualification by 400%. Our system responds in under 2 minutes. Every lead gets scored, prioritized, and routed to the right technician — automatically. AI dispatch reads the job, the tech's skill profile, and the route to make the optimal match instantly. Adds 'virtual trucks' to your fleet without a single hire.",
        statMain: "+12%",
        statLabel: "average ticket size increase",
        uiType: "dispatch"
    },
    {
        num: "05",
        title: "Reputation & Review Engine",
        desc: "After every completed job, the system sends a friendly review request. Happy customers get routed to Google. Unhappy customers get intercepted for resolution before they go public. AI writes personalized responses seeded with local SEO keywords. More 5-star reviews → higher rankings → more organic leads → the flywheel accelerates.",
        statMain: "4.8★",
        statLabel: "avg client rating — feeds back into Stage 1",
        uiType: "reputation"
    }
];

// Micro UI Components (Simplified for demonstration, but structured exactly as spec)
const MicroUI = ({ type }) => {
    if (type === 'seo') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto">
                <div className="space-y-4">
                    <div className="h-16 rounded-lg bg-slate-dark border border-white/5 p-3 flex justify-between items-center opacity-50">
                        <div><div className="w-24 h-4 bg-white/10 rounded mb-2"></div><div className="flex space-x-1"><span className="text-champagne text-xs">★★★★☆</span></div></div>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Ad</span>
                    </div>
                    <div className="h-16 rounded-lg bg-slate-dark border border-white/5 p-3 flex justify-between items-center opacity-50">
                        <div><div className="w-20 h-4 bg-white/10 rounded mb-2"></div><div className="flex space-x-1"><span className="text-champagne text-xs">★★★★☆</span></div></div>
                        <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">Ad</span>
                    </div>
                    <div className="h-20 rounded-lg bg-brand-green/10 border border-brand-green/30 p-4 flex justify-between items-center shadow-[0_0_15px_rgba(94,192,138,0.2)]">
                        <div>
                            <div className="text-white font-bold mb-1">Your Business</div>
                            <div className="flex space-x-1"><span className="text-champagne text-xs">★★★★★</span></div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded mb-1">Organic</span>
                            <span className="font-mono text-brand-green text-xs">$0/lead</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'ads') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto relative">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold text-xl">f</div>
                    <div>
                        <div className="text-white text-sm font-bold">Active Campaign</div>
                        <div className="text-xs text-blue-400">Meta Ads Manager</div>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="bg-slate-dark p-3 rounded-lg border border-white/5 flex justify-between text-xs">
                        <span className="text-ghost-white/60">Impressions</span>
                        <span className="text-white">124.5k</span>
                    </div>
                    <div className="bg-slate-dark p-3 rounded-lg border border-white/5 flex justify-between text-xs">
                        <span className="text-ghost-white/60">Conversion Rate</span>
                        <span className="text-brand-green">4.8% &uarr;</span>
                    </div>
                    <div className="bg-brand-green/10 p-4 rounded-lg border border-brand-green/30 flex justify-between items-center text-sm shadow-[0_0_15px_rgba(94,192,138,0.15)]">
                        <span className="text-brand-green font-bold">Cost per Lead</span>
                        <span className="text-brand-green font-mono font-bold">$18.40 &darr;</span>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'telemetry') {
        return (
            <div className="bg-[#0F0F14] rounded-2xl p-6 border border-white/5 w-full font-mono text-xs text-ghost-white/70 max-w-sm ml-auto">
                <div className="flex justify-between mb-4">
                    <span className="text-white">TELEMETRY</span>
                    <span className="flex items-center text-green-400"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse mr-2"></span>LIVE</span>
                </div>
                <div className="space-y-2">
                    <div><span className="text-ghost-white/40">[11:47 PM]</span> Inbound call — Alpharetta, GA</div>
                    <div><span className="text-ghost-white/40">[11:47 PM]</span> AI Agent answered in 0.8s</div>
                    <div><span className="text-ghost-white/40">[11:47 PM]</span> Intent: Emergency HVAC repair</div>
                    <div className="text-brand-green"><span className="text-ghost-white/40">[11:47 PM]</span> Appointment booked: Tomorrow 8AM</div>
                    <div className="text-green-400"><span className="text-ghost-white/40">[11:47 PM]</span> CRM ticket created ✓</div>
                    <div className="text-green-400"><span className="text-ghost-white/40">[11:48 PM]</span> SMS confirmation sent to homeowner ✓</div>
                    <div className="mt-2 animate-pulse text-brand-green">_</div>
                </div>
            </div>
        );
    }

    if (type === 'scoring') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full font-sans max-w-sm ml-auto relative">
                <div className="absolute top-4 right-4 bg-slate-dark text-white font-mono text-xs px-2 py-1 rounded">0:00 &rarr; 1:47</div>
                <div className="text-white font-bold mb-4">New Lead Detected</div>
                <div className="bg-slate-dark p-4 rounded-xl border border-white/5 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-brand-green w-[90%]"></div>
                    <div className="text-sm text-ghost-white/80 mb-2">Emergency AC Repair needed. System completely down.</div>
                    <div className="flex justify-between items-end">
                        <span className="text-xs text-ghost-white/50">Est. Value: $4,500</span>
                        <span className="text-xs font-bold text-brand-green">URGENCY: HIGH</span>
                    </div>
                </div>
                <div className="flex justify-center my-2 text-ghost-white/30">&darr;</div>
                <div className="bg-brand-green/10 p-4 rounded-xl border border-brand-green/30 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-white font-bold">TC</div>
                    <div>
                        <div className="text-sm font-bold text-white">Top Closer Assigned</div>
                        <div className="text-xs text-brand-green">94% close rate</div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'dispatch') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full max-w-sm ml-auto font-mono text-sm relative">
                <div className="mb-4 text-ghost-white/60">LIVE ROUTE OPTIMIZATION</div>

                {/* Decorative Grid/Map */}
                <div className="h-32 bg-[#0F0F14] rounded-lg mb-6 relative overflow-hidden border border-white/5">
                    <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                    {/* Dots and lines */}
                    <svg className="w-full h-full absolute inset-0 text-brand-green z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 20 20 L 80 50 L 30 80" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_3s_linear_infinite]" />
                        <circle cx="20" cy="20" r="4" fill="currentColor" />
                        <circle cx="80" cy="50" r="4" fill="currentColor" />
                        <circle cx="30" cy="80" r="4" fill="currentColor" />
                    </svg>
                </div>

                <div className="space-y-3">
                    <div className="bg-slate-dark p-3 rounded-lg border border-white/5 flex justify-between text-xs">
                        <span>Drive Time</span>
                        <span className="text-green-400">47m &rarr; 38m ✓</span>
                    </div>
                    <div className="bg-slate-dark p-3 rounded-lg border border-white/5 flex justify-between text-xs">
                        <span>Utilization</span>
                        <span className="text-green-400">71% &rarr; 83% ✓</span>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'reputation') {
        return (
            <div className="bg-navy-deep rounded-2xl p-6 border border-white/5 w-full max-w-sm ml-auto relative">
                <div className="bg-ivory rounded-xl p-4 mb-6 shadow-xl relative z-10">
                    <div className="flex mb-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="text-[#C9A84C] fill-[#C9A84C] w-4 h-4 mr-1" />)}
                    </div>
                    <p className="text-xs text-navy-deep font-sans mb-2 font-medium">"Fastest response ever. Fixed my AC in the middle of the night. Highly recommend to anyone in Alpharetta."</p>
                    <div className="text-[10px] text-navy-deep/50 uppercase tracing-wider">Google Review</div>
                </div>

                <div className="bg-slate-dark p-3 rounded-lg border border-brand-green/30 flex justify-between items-center text-xs font-mono relative z-10">
                    <span className="text-white">Local Search Rank</span>
                    <span className="text-green-400">#4 &rarr; #1 ✓</span>
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
        <section ref={containerRef} className="relative w-full bg-[#0B1426] pb-32">
            {STAGES_DATA.map((stage, i) => (
                <div
                    key={stage.num}
                    ref={addToRefs}
                    className="w-full h-screen sticky top-0 flex items-center justify-center will-change-transform z-10"
                >
                    <div className="w-[95%] max-w-7xl h-[85vh] bg-slate-dark rounded-[3rem] border border-white/5 flex flex-col lg:flex-row overflow-hidden shadow-2xl">

                        {/* Left Box (Content) */}
                        <div className="w-full lg:w-[50%] p-10 lg:p-20 relative flex flex-col justify-center overflow-hidden">
                            <div className="absolute top-0 left-0 -translate-x-[20%] -translate-y-[20%] font-mono text-[180px] lg:text-[240px] leading-none text-champagne opacity-10 select-none z-0">
                                {stage.num}
                            </div>
                            <div className="relative z-10">
                                <div className="font-mono text-sm tracking-widest text-champagne mb-6 uppercase">
                                    Stage {stage.num}
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
                        <div className="w-full lg:w-[50%] bg-[#0B1426]/50 p-10 lg:p-20 flex items-center justify-center relative border-l border-white/5">
                            <MicroUI type={stage.uiType} />
                        </div>

                    </div>
                </div>
            ))}
        </section>
    );
};

export default StageCards;
