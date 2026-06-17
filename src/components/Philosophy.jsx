import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Philosophy = () => {
    const containerRef = useRef(null);
    const wordsRef = useRef([]);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Split text reveal for the big statements
            gsap.fromTo(wordsRef.current,
                { opacity: 0, y: 30, filter: 'blur(10px)' },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1,
                    stagger: 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 60%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const addToWords = (el) => {
        if (el && !wordsRef.current.includes(el)) wordsRef.current.push(el);
    };

    return (
        <section ref={containerRef} id="why-us" className="relative py-40 px-6 bg-navy-deep overflow-hidden flex flex-col items-center justify-center min-h-screen">

            {/* Background Graphic / Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle at 50% 50%, #2563eb 0%, transparent 60%)",
                    backgroundSize: "100% 100%"
                }}>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">

                <p className="font-sans text-ghost-white/60 text-base md:text-xl mb-4 max-w-2xl text-center px-2">
                    Successful AI initiatives begin with understanding people, workflows, decisions, and operational realities.
                </p>

                <h2 className="flex flex-col items-center leading-[1.1] mb-16 mt-8">
                    <span ref={addToWords} className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-ghost-white text-center">
                        Technology matters.
                    </span>
                    <br />
                    <span ref={addToWords} className="font-serif italic text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-brand-green text-glow text-center">
                        Business context matters more.
                    </span>
                </h2>

                <p className="font-sans text-ghost-white/80 text-base md:text-2xl max-w-3xl leading-relaxed text-center px-2">
                    We help organizations move beyond experimentation by connecting AI initiatives to real business outcomes. Every recommendation, workflow, and solution is grounded in how work actually gets done.
                </p>
            </div>

        </section>
    );
};

export default Philosophy;
