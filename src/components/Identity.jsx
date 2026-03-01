import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Identity = () => {
    const sectionRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            gsap.fromTo('.identity-content > *',
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    }
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 px-6 bg-ivory text-navy-deep flex justify-center">
            <div className="identity-content max-w-[800px] mx-auto text-center flex flex-col items-center">

                <h2 className="font-sans text-xl md:text-2xl text-navy-deep/60 mb-2 font-normal">
                    We're not another marketing agency.
                </h2>

                <h3 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight text-navy-deep">
                    We're an automation company.
                </h3>

                <p className="font-sans text-lg md:text-xl leading-relaxed text-navy-deep/80 mb-12">
                    Tier 4 Intelligence builds and permanently operates AI growth systems — autonomous agents that handle your website, ads, phone calls, lead routing, dispatch, and reputation around the clock. Powered by proprietary agentic frameworks including OpenClaw, our platform orchestrates multi-agent systems that integrate with your existing tools. No rip-and-replace. No 300-page strategy decks. Working systems that run while you sleep.
                </p>

                {/* Identity Pills */}
                <div className="flex flex-wrap justify-center gap-4">
                    {['Agentic AI Systems', 'Permanent Operations', 'Works With Your Existing Tools'].map((pill) => (
                        <div
                            key={pill}
                            className="px-6 py-2 rounded-full border border-navy-deep/20 text-sm font-semibold tracking-wide uppercase shadow-sm"
                        >
                            {pill}
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default Identity;
