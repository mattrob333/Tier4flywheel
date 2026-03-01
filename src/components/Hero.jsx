import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

const Hero = () => {
    const containerRef = useRef(null);
    const elementsRef = useRef([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Staggered fade up for text elements
            gsap.fromTo(elementsRef.current,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1.5,
                    stagger: 0.2,
                    ease: 'power3.out',
                    delay: 0.1
                }
            );

            // Staggered fade in for stat chips with a delay
            gsap.fromTo('.stat-chip',
                { opacity: 0, x: 20 },
                { opacity: 1, x: 0, duration: 1, stagger: 0.2, delay: 1.2, ease: 'power2.out' }
            );

        }, containerRef);
        return () => ctx.revert();
    }, []);

    const addToRefs = (el) => {
        if (el && !elementsRef.current.includes(el)) {
            elementsRef.current.push(el);
        }
    };

    return (
        <section ref={containerRef} id="home" className="relative w-full h-[100dvh] bg-navy-deep flex items-end">
            {/* Background image & gradient */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/ai-hero-bg.png')" }}
            >
                {/* Dark server room/abstract data visualization feeling */}
            </div>
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-navy-deep via-navy-deep/80 to-transparent"></div>

            {/* Floating Stat Chips */}
            <div className="absolute top-1/4 right-[8%] z-10 hidden lg:flex flex-col space-y-4">
                <div className="stat-chip font-mono text-sm px-4 py-2 rounded-full border border-champagne text-champagne backdrop-blur-md bg-navy-deep/40">
                    +113% EBITDA
                </div>
                <div className="stat-chip font-mono text-sm px-4 py-2 rounded-full border border-brand-green text-ghost-white backdrop-blur-md bg-navy-deep/40 translate-x-4">
                    &lt;6mo Payback
                </div>
                <div className="stat-chip font-mono text-sm px-4 py-2 rounded-full border border-champagne text-champagne backdrop-blur-md bg-navy-deep/40">
                    4.0x+ MOIC
                </div>
                <div className="font-sans text-xs text-ghost-white/50 text-right mt-2 mr-2">
                    Deployed across 40+ PE-backed service companies
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-7xl mx-auto pl-[8%] pb-[12%]">

                {/* Eyebrow */}
                <div ref={addToRefs} className="flex items-center space-x-3 mb-6">
                    <span className="w-2 h-2 rounded-full bg-champagne animate-pulse"></span>
                    <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-champagne">
                        AI-Powered Growth for Service Businesses
                    </span>
                </div>

                {/* Headline */}
                <h1 className="flex flex-col mb-8 leading-none">
                    <span ref={addToRefs} className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl text-white tracking-tight uppercase">
                        Automation is the
                    </span>
                    <span ref={addToRefs} className="font-serif italic text-7xl md:text-8xl lg:text-[140px] text-brand-green leading-[0.9] mt-2 lg:mt-4 text-glow">
                        Multiplier.
                    </span>
                </h1>

                {/* Subheadline */}
                <p ref={addToRefs} className="font-sans text-ghost-white text-lg md:text-xl font-normal max-w-[600px] leading-relaxed mb-10">
                    More leads. More booked jobs. More 5-star reviews. We build and run the AI systems that make it happen — without adding a single person to your payroll.
                </p>

                {/* CTA Button */}
                <div ref={addToRefs} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <a href="#the-flywheel" className="magnetic-btn bg-brand-green text-white font-bold text-lg px-8 py-4 rounded-full flex items-center space-x-2 shadow-[0_0_30px_rgba(94,192,138,0.3)]">
                        <span>See How It Works</span>
                        <span className="text-xl leading-none">&darr;</span>
                    </a>
                    <a href="#contact" className="magnetic-btn bg-transparent border border-white/20 text-white font-bold text-lg px-8 py-4 rounded-full flex items-center space-x-2 hover:border-white/40 transition-colors">
                        <span>Book a Strategy Call</span>
                    </a>
                </div>

            </div>
        </section>
    );
};

export default Hero;
