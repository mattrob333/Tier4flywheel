import React, { useState } from 'react';

const LeadCaptureForm = () => {
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            // Posting to our internal serverless function which routes to Zoho
            const response = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-slate-dark/50 border border-brand-green/30 rounded-2xl p-8 text-center backdrop-blur-md">
                <div className="w-16 h-16 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-sans font-bold text-2xl text-white mb-2">Request Received</h3>
                <p className="font-sans text-ghost-white/70">Our systems are processing your information. We will touch base shortly.</p>
                <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm text-brand-green hover:text-white transition-colors"
                >
                    Submit another request
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-[#0B1426]/80 p-8 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] backdrop-blur-xl w-full max-w-xl mx-auto text-left relative overflow-hidden">
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-green to-transparent opacity-50"></div>

            <h3 className="font-sans font-bold text-2xl text-white mb-6 text-center">
                Request Your Growth Assessment
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-1">
                    <label htmlFor="firstName" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">First Name *</label>
                    <input required type="text" id="firstName" name="firstName" autoComplete="given-name" value={formData.firstName} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors" />
                </div>
                <div className="col-span-1">
                    <label htmlFor="lastName" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">Last Name *</label>
                    <input required type="text" id="lastName" name="lastName" autoComplete="family-name" value={formData.lastName} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors" />
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="email" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">Work Email *</label>
                <input required type="email" id="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-1">
                    <label htmlFor="company" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">Company</label>
                    <input type="text" id="company" name="company" autoComplete="organization" value={formData.company} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors" />
                </div>
                <div className="col-span-1">
                    <label htmlFor="phone" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">Phone Number</label>
                    <input type="tel" id="phone" name="phone" autoComplete="tel" value={formData.phone} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors" />
                </div>
            </div>

            <div className="mb-8">
                <label htmlFor="message" className="block font-mono text-xs uppercase tracking-widest text-ghost-white/50 mb-2">How can we help?</label>
                <textarea id="message" name="message" rows="3" value={formData.message} onChange={handleChange} className="w-full bg-[#0F0F14] border border-white/5 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green/50 transition-colors resize-none"></textarea>
            </div>

            {status === 'error' && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans flex items-start">
                    <span className="mr-2">⚠️</span>
                    <span>An error occurred while sending your request. Please try again or email us directly.</span>
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full magnetic-btn bg-brand-green text-white font-bold text-lg px-8 py-4 rounded-xl flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(94,192,138,0.2)] hover:shadow-[0_0_30px_rgba(94,192,138,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                        <span>Request Assessment</span>
                        <span>&rarr;</span>
                    </>
                )}
            </button>
        </form>
    );
};

export default LeadCaptureForm;
