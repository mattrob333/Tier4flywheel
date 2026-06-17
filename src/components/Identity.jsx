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
        <section ref={sectionRef} id="problem" className="py-24 px-6 bg-ivory text-navy-deep flex justify-center">
            <div className="identity-content max-w-[800px] mx-auto text-center flex flex-col items-center">

                <h2 className="font-sans text-xl md:text-2xl text-navy-deep/60 mb-2 font-normal">
                    Most organizations don't need more AI tools.
                </h2>

                <h3 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-6xl mb-8 tracking-tight text-navy-deep">
                    They need more clarity.
                </h3>

                <p className="font-sans text-lg md:text-xl leading-relaxed text-navy-deep/80 mb-12">
                    Companies are under pressure to adopt AI, but many struggle to determine where it fits, which opportunities matter, and how to move forward without creating unnecessary complexity. The challenge is not access to AI — it's understanding where it creates meaningful value.
                </p>

                {/* Positioning Pills */}
                <div className="flex flex-wrap justify-center gap-4">
                    {['Clarity', 'Prioritization', 'Practical Execution'].map((pill) => (
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
