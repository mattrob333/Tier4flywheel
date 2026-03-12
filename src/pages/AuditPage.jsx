import React from 'react';
import AIReadinessAudit from '../components/AIReadinessAudit';

const AuditPage = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      <div className="mb-8 text-ghost-white text-center">
        <span className="font-sans font-extrabold tracking-tight text-xl">
          TIER <span className="text-brand-green">4</span>
        </span>
        <span className="font-sans font-normal tracking-[0.15em] text-sm ml-2">
          INTELLIGENCE
        </span>
      </div>
      <AIReadinessAudit />
    </div>
  );
};

export default AuditPage;
