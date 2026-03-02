import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-charcoal pt-24 pb-12 px-6 rounded-t-[4rem] text-ghost-white relative z-20">
            <div className="max-w-7xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    {/* Col 1 */}
                    <div className="md:col-span-1">
                        <div className="font-sans font-extrabold tracking-tight text-xl text-white mb-2">
                            TIER <span className="text-brand-green">4</span>
                        </div>
                        <div className="font-sans font-normal tracking-[0.1em] text-xs mb-4 text-ghost-white/50 uppercase">
                            Intelligence
                        </div>
                        <p className="font-sans text-sm text-ghost-white/50 max-w-[200px]">
                            Automation is the Multiplier. AI growth systems for service businesses.
                        </p>
                    </div>

                    {/* Col 2 */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="font-sans font-bold text-white mb-2">Navigate</h4>
                        {['The Flywheel', 'How It Works', 'Results', 'Contact'].map(link => (
                            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-ghost-white/50 hover:text-white transition-colors link-lift">
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Col 3 */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="font-sans font-bold text-white mb-2">Contact</h4>
                        <a href="mailto:info@tier4intelligence.com" className="text-sm text-ghost-white/50 hover:text-white transition-colors link-lift">
                            info@tier4intelligence.com
                        </a>
                        <a href="https://www.linkedin.com/company/tier-4-intelligence" target="_blank" rel="noopener noreferrer" className="text-sm text-ghost-white/50 hover:text-white transition-colors link-lift">
                            LinkedIn
                        </a>
                    </div>

                    {/* Col 4 */}
                    <div className="flex flex-col space-y-3">
                        <h4 className="font-sans font-bold text-white mb-2">Legal</h4>
                        <a href="#" className="text-sm text-ghost-white/50 hover:text-white transition-colors link-lift">Privacy Policy</a>
                        <a href="#" className="text-sm text-ghost-white/50 hover:text-white transition-colors link-lift">Terms of Service</a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-3 bg-[#0B1426] px-4 py-2 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="font-mono text-xs text-green-400 uppercase tracking-widest">System Operational — Agents Active</span>
                    </div>
                    <div className="font-sans text-xs text-ghost-white/30">
                        &copy; {new Date().getFullYear()} Tier 4 Intelligence. Alpharetta, GA.
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;
