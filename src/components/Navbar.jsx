import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {
    const navRef = useRef(null);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            ScrollTrigger.create({
                start: 'top -50',
                end: 99999,
                toggleClass: {
                    className: 'scrolled',
                    targets: navRef.current
                }
            });
        });
        return () => ctx.revert();
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center mt-6 px-4">
            <nav
                ref={navRef}
                aria-label="Main navigation"
                className="
          flex items-center justify-between
          px-6 py-3 rounded-full
          transition-all duration-300 ease-in-out
          w-full max-w-5xl
          text-ghost-white
          bg-navy-deep/40 backdrop-blur-md border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]
          [&.scrolled]:bg-navy-deep/90 [&.scrolled]:backdrop-blur-xl [&.scrolled]:border-white/10 [&.scrolled]:shadow-xl
        "
            >
                {/* Logo */}
                <a href="#home" className="flex items-center cursor-pointer link-lift no-underline text-ghost-white shrink-0">
                    <img
                        src="/brand/tier4-logo-color-dark.svg"
                        alt="Tier 4 Intelligence"
                        className="h-9 w-auto max-w-[132px] object-contain"
                    />
                </a>

                {/* Links */}
                <div className="hidden md:flex space-x-8 text-sm font-medium">
                    {['Approach', 'Services', 'Why Us', 'Insights'].map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                            className="hover:text-brand-green transition-colors duration-200 link-lift"
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <a href="#contact" className="inline-block magnetic-btn bg-brand-green text-white font-bold text-sm px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(94,192,138,0.3)]">
                    Start an Audit
                </a>
            </nav>
        </div>
    );
};

export default Navbar;
