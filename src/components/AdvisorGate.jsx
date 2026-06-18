import React, { useEffect, useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { isAdvisorAuthBypass } from '../lib/advisorAuthBypass';

const STYLE = `
.advisor-gate-root{min-height:100vh;background:#0B1426;color:#F0F2F5;font-family:Inter,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:32px 20px}
.advisor-gate-card{width:100%;max-width:420px;background:#1A1F2E;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:28px;box-shadow:0 30px 90px rgba(0,0,0,.34)}
.advisor-gate-mark{width:46px;height:46px;border-radius:12px;background:rgba(94,192,138,.1);border:1px solid rgba(94,192,138,.34);color:#5EC08A;display:flex;align-items:center;justify-content:center;margin-bottom:18px}
.advisor-gate-mark svg{width:22px;height:22px}
.advisor-gate-card h1{font-size:24px;line-height:1.08;letter-spacing:-.03em;font-weight:900;color:#fff;margin:0 0 8px}
.advisor-gate-card p{font-size:14px;line-height:1.6;color:rgba(240,242,245,.62);margin:0 0 22px}
.advisor-gate-label{display:block;color:#F0F2F5;font-weight:750;font-size:13px;margin-bottom:7px}
.advisor-gate-input{width:100%;min-height:44px;background:#0B1426;border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#F0F2F5;font-size:15px;padding:10px 12px}
.advisor-gate-input:focus{outline:none;border-color:#5EC08A;box-shadow:0 0 0 3px rgba(94,192,138,.14)}
.advisor-gate-btn{width:100%;min-height:44px;border:0;border-radius:8px;background:#5EC08A;color:#0B1426;font-weight:900;font-size:14px;margin-top:14px;cursor:pointer}
.advisor-gate-btn:disabled{opacity:.58;cursor:not-allowed}
.advisor-gate-error{border:1px solid rgba(214,106,106,.72);background:rgba(214,106,106,.08);border-radius:8px;padding:10px 12px;color:#F0F2F5;font-size:13px;margin-top:14px}
.advisor-gate-load{color:rgba(240,242,245,.62);font-size:14px}
`;

export default function AdvisorGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(isAdvisorAuthBypass());
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (unlocked) return;

    let cancelled = false;
    async function checkGate() {
      try {
        const res = await fetch('/api/advisor-gate/status', {
          credentials: 'include',
        });
        const data = await res.json().catch(() => ({}));
        if (!cancelled) setUnlocked(Boolean(data.ok));
      } catch {
        if (!cancelled) setUnlocked(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkGate();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await fetch('/api/advisor-gate', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || 'Advisor access was not accepted.');
      setPassword('');
      setUnlocked(true);
    } catch (err) {
      setError(err.message || 'Advisor access was not accepted.');
    } finally {
      setBusy(false);
    }
  }

  if (unlocked) return children;

  return (
    <div className="advisor-gate-root">
      <style>{STYLE}</style>
      <form className="advisor-gate-card" onSubmit={submit}>
        <div className="advisor-gate-mark">
          <LockKeyhole />
        </div>
        <h1>Advisor access</h1>
        <p>Enter the advisor access password to continue.</p>

        {checking ? (
          <div className="advisor-gate-load">Checking advisor access...</div>
        ) : (
          <>
            <label className="advisor-gate-label" htmlFor="advisor-gate-password">
              Password
            </label>
            <input
              id="advisor-gate-password"
              className="advisor-gate-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              autoFocus
            />
            <button className="advisor-gate-btn" type="submit" disabled={busy || !password}>
              Continue
            </button>
          </>
        )}

        {error && <div className="advisor-gate-error">{error}</div>}
      </form>
    </div>
  );
}
