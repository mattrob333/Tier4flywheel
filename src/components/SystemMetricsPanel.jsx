import React, { useCallback, useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Dashboard metrics panel for the AdminHomePage.
 * Fetches aggregate pipeline metrics + quality scores from
 * GET /api/audit-system-improvement and renders a compact summary.
 *
 * Phase 5.4 — Learning Loop dashboard metrics.
 */
const STYLE = `
.metrics-panel{background:rgba(26,31,46,.82);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:24px;margin-bottom:18px;box-shadow:0 24px 70px rgba(0,0,0,.18)}
.metrics-head{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.metrics-head h2{font-size:18px;font-weight:800;color:#fff;margin:0}
.metrics-head p{margin:0;color:rgba(240,242,245,.5);font-size:12px}
.metrics-head .metrics-icon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(94,192,138,.1);border:1px solid rgba(94,192,138,.28);color:#5EC08A}
.metrics-head .metrics-icon svg{width:20px;height:20px}
.metrics-refresh{margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:6px 12px;color:rgba(240,242,245,.7);font-size:12px;font-weight:600;cursor:pointer;transition:.14s}
.metrics-refresh:hover{border-color:rgba(94,192,138,.4);color:#5EC08A}
.metrics-refresh:disabled{opacity:.5;cursor:default}
.metrics-refresh svg{width:14px;height:14px}
.metrics-refresh.spinning svg{animation:metrics-spin .8s linear infinite}
@keyframes metrics-spin{to{transform:rotate(360deg)}}
.metrics-loading{color:rgba(240,242,245,.5);font-size:13px;padding:20px 0;text-align:center}
.metrics-error{color:#E57373;font-size:13px;padding:12px 0}
.metrics-empty{color:rgba(240,242,245,.4);font-size:13px;padding:20px 0;text-align:center}
.metrics-overall{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:16px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08)}
.metrics-grade{font-size:36px;font-weight:900;line-height:1;min-width:48px;text-align:center}
.metrics-grade.A{color:#5EC08A}
.metrics-grade.B{color:#8DD17A}
.metrics-grade.C{color:#C9A84C}
.metrics-grade.D{color:#E8A858}
.metrics-grade.F{color:#E57373}
.metrics-grade.NA{color:rgba(240,242,245,.3);font-size:24px}
.metrics-overall-info h3{margin:0 0 4px;font-size:14px;font-weight:700;color:#fff}
.metrics-overall-info p{margin:0;font-size:12px;color:rgba(240,242,245,.5)}
.metrics-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:16px}
.metrics-stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:14px}
.metrics-stat .stat-label{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:rgba(240,242,245,.4);margin-bottom:6px}
.metrics-stat .stat-value{font-size:22px;font-weight:800;color:#fff;line-height:1.1}
.metrics-stat .stat-sub{font-size:11px;color:rgba(240,242,245,.4);margin-top:3px}
.metrics-priorities{border-top:1px solid rgba(255,255,255,.08);padding-top:14px}
.metrics-priorities h4{font-size:12px;font-weight:700;color:rgba(240,242,245,.5);margin:0 0 10px;display:flex;align-items:center;gap:6px}
.metrics-priorities h4 svg{width:14px;height:14px;color:#E8A858}
.metrics-priority{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px;color:rgba(240,242,245,.7)}
.metrics-priority .pri-score{font-size:11px;font-weight:800;min-width:28px;text-align:center;border-radius:4px;padding:2px 5px}
.metrics-priority .pri-score.F{background:rgba(229,115,115,.15);color:#E57373}
.metrics-priority .pri-score.D{background:rgba(232,168,88,.15);color:#E8A858}
.metrics-priority .pri-name{font-weight:600;color:rgba(240,242,245,.8)}
.metrics-priority .pri-note{font-size:11px;color:rgba(240,242,245,.4);margin-left:auto;text-align:right;max-width:260px}
.metrics-ok{font-size:13px;color:rgba(94,192,138,.6);padding:8px 0}
.metrics-trend{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;margin-left:10px}
.metrics-trend.improving{background:rgba(94,192,138,.15);color:#5EC08A}
.metrics-trend.declining{background:rgba(229,115,115,.15);color:#E57373}
.metrics-trend.stable{background:rgba(201,168,76,.15);color:#C9A84C}
.metrics-trend.insufficient{background:rgba(255,255,255,.06);color:rgba(240,242,245,.3)}
.metrics-trend svg{width:12px;height:12px}
.metrics-trend-section{border-top:1px solid rgba(255,255,255,.08);padding-top:14px;margin-top:14px}
.metrics-trend-section h4{font-size:12px;font-weight:700;color:rgba(240,242,245,.5);margin:0 0 10px;display:flex;align-items:center;gap:6px}
.metrics-trend-section h4 svg{width:14px;height:14px;color:#5EC08A}
.metrics-trend-row{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}
.metrics-trend-row .trend-label{color:rgba(240,242,245,.7);font-weight:600;min-width:140px}
.metrics-trend-row .trend-delta{font-size:12px;color:rgba(240,242,245,.4);margin-left:auto}
.metrics-trend-row .trend-arrow{font-size:14px;font-weight:800}
.metrics-trend-row .trend-arrow.improving{color:#5EC08A}
.metrics-trend-row .trend-arrow.declining{color:#E57373}
.metrics-trend-row .trend-arrow.stable{color:#C9A84C}
`;

function fmtPct(rate) {
  if (rate === null || rate === undefined) return '—';
  return `${Math.round(rate * 100)}%`;
}

export default function SystemMetricsPanel({ getAuthHeaders }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const headers = (await getAuthHeaders?.()) || {};
      const res = await fetch('/api/audit-system-improvement', { headers });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Failed to load metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const renderContent = () => {
    if (loading) return <div className="metrics-loading">Loading pipeline metrics…</div>;
    if (error) return <div className="metrics-error">⚠ {error}</div>;
    if (!data || !data.metrics) return <div className="metrics-empty">No metrics available.</div>;

    const { metrics, scores } = data;

    if (metrics.total_audits === 0) {
      return <div className="metrics-empty">No audits yet — metrics will appear once audits are run.</div>;
    }

    const overallGrade = scores?.overall_grade || 'N/A';
    const gradeClass = overallGrade === 'N/A' ? 'NA' : overallGrade;

    return (
      <>
        {scores && (
          <div className="metrics-overall">
            <div className={`metrics-grade ${gradeClass}`}>{overallGrade}</div>
            <div className="metrics-overall-info">
              <h3>Overall Quality Score: {scores.overall_score !== null ? `${scores.overall_score}/100` : 'N/A'}</h3>
              <p>{metrics.total_audits} audit{metrics.total_audits !== 1 ? 's' : ''} reviewed · {data.scope === 'all_advisors' ? 'all advisors' : 'your audits'}</p>
            </div>
          </div>
        )}

        <div className="metrics-grid">
          <div className="metrics-stat">
            <div className="stat-label">Economic Capture</div>
            <div className="stat-value">{fmtPct(metrics.economic_capture.rate)}</div>
            <div className="stat-sub">{metrics.economic_capture.count}/{metrics.total_audits} audits</div>
          </div>
          <div className="metrics-stat">
            <div className="stat-label">Validation Rate</div>
            <div className="stat-value">{fmtPct(metrics.validation.rate)}</div>
            <div className="stat-sub">{metrics.validation.validated}/{metrics.validation.discussed} discussed</div>
          </div>
          <div className="metrics-stat">
            <div className="stat-label">Value-Case Rate</div>
            <div className="stat-value">{fmtPct(metrics.value_case.rate)}</div>
            <div className="stat-sub">{metrics.value_case.proposals_with_value_case}/{metrics.value_case.total_proposals} proposals</div>
          </div>
          <div className="metrics-stat">
            <div className="stat-label">Proposal Rate</div>
            <div className="stat-value">{fmtPct(metrics.conversion.proposal_rate)}</div>
            <div className="stat-sub">{metrics.conversion.proposal_generated}/{metrics.conversion.readout_reached} readouts</div>
          </div>
          <div className="metrics-stat">
            <div className="stat-label">Price/Cost Ratio</div>
            <div className="stat-value">{metrics.price_to_problem_cost.median !== null ? `${metrics.price_to_problem_cost.median.toFixed(2)}×` : '—'}</div>
            <div className="stat-sub">{metrics.price_to_problem_cost.samples} sample{metrics.price_to_problem_cost.samples !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {scores && scores.improvement_priorities && scores.improvement_priorities.length > 0 && (
          <div className="metrics-priorities">
            <h4><AlertTriangle /> Improvement Priorities</h4>
            {scores.improvement_priorities.map((p) => (
              <div key={p.key} className="metrics-priority">
                <span className={`pri-score ${p.grade || 'F'}`}>{p.score}</span>
                <span className="pri-name">{p.name}</span>
                <span className="pri-note">{p.assessment}</span>
              </div>
            ))}
          </div>
        )}

        {scores && (!scores.improvement_priorities || scores.improvement_priorities.length === 0) && scores.overall_score !== null && scores.overall_score >= 60 && (
          <div className="metrics-ok">✓ All quality categories are at or above threshold.</div>
        )}

        {data.trends && data.trends.status !== 'insufficient_data' && (
          <div className="metrics-trend-section">
            <h4><TrendingUp /> Trend Tracking <span className={`metrics-trend ${data.trends.status}`}>{data.trends.status}</span></h4>
            {data.trends.comparisons.map((c) => (
              <div key={c.field} className="metrics-trend-row">
                <span className="trend-label">{c.field.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())}</span>
                <span className={`trend-arrow ${c.direction}`}>
                  {c.direction === 'improving' ? '↑' : c.direction === 'declining' ? '↓' : '→'}
                </span>
                <span className="trend-delta">
                  {c.prev !== null ? `${Math.round(c.prev * 100)}%` : '—'} → {c.curr !== null ? `${Math.round(c.curr * 100)}%` : '—'}
                  {c.field === 'overall_score' && ` (${c.delta > 0 ? '+' : ''}${c.delta} pts)`}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'rgba(240,242,245,.3)', marginTop: 8 }}>
              Based on {data.trends.snapshot_count} snapshot{data.trends.snapshot_count !== 1 ? 's' : ''} ·
              {' '}{data.snapshots?.length || 0} total recorded
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="metrics-panel">
      <style>{STYLE}</style>
      <div className="metrics-head">
        <span className="metrics-icon"><Activity /></span>
        <div>
          <h2>Pipeline Metrics</h2>
          <p>Aggregate performance across the audit lifecycle</p>
        </div>
        <button
          className={`metrics-refresh${refreshing ? ' spinning' : ''}`}
          onClick={fetchMetrics}
          disabled={refreshing}
        >
          <RefreshCw /> {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
