import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Identity from './components/Identity';
import AIReadinessAudit from './components/AIReadinessAudit';
import Flywheel from './components/Flywheel';
import StageCards from './components/StageCards';
import Philosophy from './components/Philosophy';
import SocialProof from './components/SocialProof';
import BeyondHomeServices from './components/BeyondHomeServices';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef(null);

  useLayoutEffect(() => {
    // Setup global GSAP context
    let ctx = gsap.context(() => {
      // Global animations can go here if needed
    }, appRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={appRef} className="relative w-full min-h-screen">
      <Navbar />
      <Hero />
      <Identity />
      <AIReadinessAudit />
      <Flywheel />
      <StageCards />
      <Philosophy />
      <SocialProof />
      <BeyondHomeServices />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default App;
