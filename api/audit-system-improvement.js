/**
 * System Improvement Audit endpoint.
 *
 * GET /api/audit-system-improvement
 *   Reviews completed advisor audits in batch and computes aggregate
 *   metrics for the learning loop:
 *     - Economic Capture Rate (audits with an economic extraction)
 *     - Validation Rate (economics validated / discussed)
 *     - Value-Case Rate (proposals with value_case block / total proposals)
 *     - Proposal Conversion Rate (proposals generated / audits reaching readout)
 *     - Price-to-Problem-Cost Ratio (estimated investment / annual cost estimate)
 *
 * No LLM calls — pure computation from stored data.  Auth-gated (superuser
 * sees all; non-superuser sees only own audits).
 */
import {
  handleApiError,
  requireAdvisorAuth,
} from './_advisorAuditServer.js';
import { listAdvisorAudits, saveMetricSnapshot, listMetricSnapshots } from './_advisorAuditStore.js';

function toFiniteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

/**
 * @param {any[]} audits  Audits with attached readout/proposal/economic_impact
 * @returns {object}      Aggregate metrics object
 */
export function computeSystemMetrics(audits) {
  const total = audits.length;

  if (total === 0) {
    return {
      total_audits: 0,
      economic_capture: { count: 0, rate: null },
      validation: { discussed: 0, validated: 0, revised: 0, rejected: 0, rate: null },
      value_case: { proposals_with_value_case: 0, total_proposals: 0, rate: null },
      conversion: {
        readout_reached: 0,
        proposal_generated: 0,
        proposal_requested: 0,
        proposal_rate: null,
        request_rate: null,
      },
      price_to_problem_cost: { samples: [], median: null, mean: null },
      sales_stage_breakdown: {},
    };
  }

  // --- Economic Capture Rate ---
  const withEconomic = audits.filter(
    (a) => Boolean(a.economic_impact) || Boolean(a.economic_impact_status),
  );
  const economicCount = withEconomic.length;
  const economicCaptureRate = total > 0 ? economicCount / total : null;

  // --- Validation Rate ---
  const economicDiscussed = audits.filter(
    (a) => Boolean(a.readout?.economics_discussed),
  ).length;
  const economicValidated = audits.filter(
    (a) => Boolean(a.readout?.economics_validated),
  ).length;
  const economicRevised = audits.filter(
    (a) => Boolean(a.readout?.economics_revised),
  ).length;
  const economicRejected = economicDiscussed - economicValidated;
  const validationRate = economicDiscussed > 0 ? economicValidated / economicDiscussed : null;

  // --- Value-Case Rate ---
  const proposals = audits.filter((a) => Boolean(a.proposal));
  const totalProposals = proposals.length;
  const proposalsWithValueCase = proposals.filter(
    (a) =>
      Boolean(a.proposal?.includes_value_case) ||
      Boolean(a.proposal?.proposal_json?.value_case),
  ).length;
  const valueCaseRate = totalProposals > 0 ? proposalsWithValueCase / totalProposals : null;

  // --- Conversion Rates ---
  const readoutReached = audits.filter(
    (a) => Boolean(a.readout) || Boolean(a.readout?.readout_guide_json),
  ).length;
  const proposalGenerated = totalProposals;
  const proposalRequested = audits.filter(
    (a) => Boolean(a.readout?.proposal_requested) || Boolean(a.proposal_requested),
  ).length;

  const proposalRate = readoutReached > 0 ? proposalGenerated / readoutReached : null;
  const requestRate = readoutReached > 0 ? proposalRequested / readoutReached : null;

  // --- Price-to-Problem-Cost Ratio ---
  // For each audit where we have both an estimated investment (from proposal)
  // and an annual cost estimate (from economic impact), compute the ratio.
  const ratioSamples = [];
  for (const audit of audits) {
    const annualCost =
      audit.economic_impact?.annual_cost_estimate ?? audit.economic_annual_cost_estimate ?? null;
    const proposal = audit.proposal;
    const investmentLow = toFiniteNumber(proposal?.proposal_investment_low ?? proposal?.investment_low);
    const investmentHigh = toFiniteNumber(proposal?.proposal_investment_high ?? proposal?.investment_high);
    const estimatedValue = toFiniteNumber(proposal?.estimated_value);

    // Use midpoint of investment range if available, otherwise estimated_value
    let investment = null;
    if (investmentLow !== null && investmentHigh !== null) {
      investment = (investmentLow + investmentHigh) / 2;
    } else if (investmentLow !== null) {
      investment = investmentLow;
    } else if (investmentHigh !== null) {
      investment = investmentHigh;
    } else if (estimatedValue !== null) {
      investment = estimatedValue;
    }

    const cost = toFiniteNumber(annualCost);
    if (cost !== null && cost > 0 && investment !== null) {
      ratioSamples.push(investment / cost);
    }
  }

  ratioSamples.sort((a, b) => a - b);
  const ratioMedian = ratioSamples.length > 0
    ? ratioSamples[Math.floor(ratioSamples.length / 2)]
    : null;
  const ratioMean = ratioSamples.length > 0
    ? ratioSamples.reduce((sum, r) => sum + r, 0) / ratioSamples.length
    : null;

  // --- Sales Stage Breakdown ---
  const salesStageBreakdown = {};
  for (const audit of audits) {
    const report = audit.report || {};
    const stage = report.sales_stage || 'not_started';
    salesStageBreakdown[stage] = (salesStageBreakdown[stage] || 0) + 1;
  }

  return {
    total_audits: total,
    economic_capture: {
      count: economicCount,
      rate: round4(economicCaptureRate),
    },
    validation: {
      discussed: economicDiscussed,
      validated: economicValidated,
      revised: economicRevised,
      rejected: Math.max(0, economicRejected),
      rate: round4(validationRate),
    },
    value_case: {
      proposals_with_value_case: proposalsWithValueCase,
      total_proposals: totalProposals,
      rate: round4(valueCaseRate),
    },
    conversion: {
      readout_reached: readoutReached,
      proposal_generated: proposalGenerated,
      proposal_requested: proposalRequested,
      proposal_rate: round4(proposalRate),
      request_rate: round4(requestRate),
    },
    price_to_problem_cost: {
      samples: ratioSamples.length,
      median: round4(ratioMedian),
      mean: round4(ratioMean),
    },
    sales_stage_breakdown: salesStageBreakdown,
  };
}

function round4(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return Math.round(value * 10000) / 10000;
}

/**
 * Quality scoring categories for the Evaluation Agent.
 * Each category produces a 0–100 score, a letter grade, and a qualitative
 * assessment so the learning loop can identify where prompts/process need
 * improvement.
 *
 * @param {object} metrics  Output of computeSystemMetrics()
 * @returns {object}        Scoring categories + overall score
 */
export function computeQualityScores(metrics) {
  const categories = {
    prompt_effectiveness: scoreCategory(
      'Prompt Effectiveness',
      'How well does the discovery prompt extract economic data from the call?',
      metrics.economic_capture.rate,
      'Discovery prompts are capturing economic impact data in most audits.',
      'Discovery prompts are missing economic data in many audits — review question wording.',
    ),
    report_completeness: scoreCategory(
      'Report Completeness',
      'Percentage of audits that reach readout and proposal stages.',
      metrics.conversion.readout_reached > 0 && metrics.total_audits > 0
        ? metrics.conversion.readout_reached / metrics.total_audits
        : null,
      'Most audits are progressing through the full pipeline.',
      'Audits are stalling before reaching readout — check report quality and advisor workflow.',
    ),
    economic_accuracy: scoreCategory(
      'Economic Accuracy',
      'How often are estimated economic numbers validated by the client?',
      metrics.validation.rate,
      'Economic estimates are being validated in readouts.',
      'Economic estimates are frequently rejected or not discussed — review extraction quality.',
    ),
    value_case_quality: scoreCategory(
      'Value-Case Quality',
      'Percentage of proposals that include a structured value case block.',
      metrics.value_case.rate,
      'Proposals consistently include value-case framing.',
      'Proposals are missing value-case blocks — check proposal prompt and schema.',
    ),
    conversion_health: scoreCategory(
      'Conversion Health',
      'How effectively do readouts convert to proposals?',
      metrics.conversion.proposal_rate,
      'Readouts are converting to proposals at a healthy rate.',
      'Readout-to-proposal conversion is low — review readout flow and next-step prompts.',
    ),
  };

  const scores = Object.values(categories).map((c) => c.score);
  const validScores = scores.filter((s) => s !== null);
  const overall = validScores.length > 0
    ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
    : null;

  return {
    categories,
    overall_score: overall,
    overall_grade: gradeForScore(overall),
    improvement_priorities: prioritiseImprovements(categories),
  };
}

function scoreCategory(name, description, rate, goodNote, badNote) {
  const score = rate !== null ? Math.round(rate * 100) : null;
  return {
    name,
    description,
    score,
    grade: gradeForScore(score),
    rate: round4(rate),
    assessment: score === null ? 'Insufficient data.' : score >= 60 ? goodNote : badNote,
  };
}

function gradeForScore(score) {
  if (score === null) return 'N/A';
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function prioritiseImprovements(categories) {
  return Object.entries(categories)
    .filter(([, c]) => c.score !== null && c.score < 60)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([key, c]) => ({
      key,
      name: c.name,
      score: c.score,
      grade: c.grade,
      assessment: c.assessment,
    }));
}

/**
 * Compute trend direction (improving / declining / stable / insufficient)
 * from a list of snapshots.  Compares the most recent snapshot to the
 * one before it (or the first if only 2 exist).
 *
 * @param {object[]} snapshots  Oldest-first array of snapshot rows
 * @returns {object}            Trend indicators per metric
 */
export function computeTrends(snapshots) {
  if (!snapshots || snapshots.length < 2) {
    return { status: 'insufficient_data', comparisons: [] };
  }

  const prev = snapshots[snapshots.length - 2];
  const curr = snapshots[snapshots.length - 1];

  const fields = [
    'economic_capture_rate',
    'validation_rate',
    'value_case_rate',
    'proposal_rate',
    'request_rate',
    'overall_score',
  ];

  const comparisons = fields
    .map((field) => {
      const prevVal = prev[field];
      const currVal = curr[field];
      if (prevVal === null || currVal === null || prevVal === undefined || currVal === undefined) {
        return null;
      }
      const delta = Number(currVal) - Number(prevVal);
      // 2% threshold to filter noise
      const direction = Math.abs(delta) < 0.02 ? 'stable' : delta > 0 ? 'improving' : 'declining';
      return { field, prev: prevVal, curr: currVal, delta: Math.round(delta * 1000) / 1000, direction };
    })
    .filter(Boolean);

  // Overall trend
  const improvingCount = comparisons.filter((c) => c.direction === 'improving').length;
  const decliningCount = comparisons.filter((c) => c.direction === 'declining').length;
  const status = improvingCount > decliningCount
    ? 'improving'
    : decliningCount > improvingCount
      ? 'declining'
      : 'stable';

  return {
    status,
    comparisons,
    previous_snapshot_at: prev.created_at,
    current_snapshot_at: curr.created_at,
    snapshot_count: snapshots.length,
  };
}

export default async function handler(req, res) {
  try {
    const auth = await requireAdvisorAuth(req);

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const audits = await listAdvisorAudits(auth);
    const metrics = computeSystemMetrics(audits);
    const scores = computeQualityScores(metrics);

    // Trend tracking: fetch prior snapshots and save a new one.
    let trends = { status: 'insufficient_data', comparisons: [] };
    let snapshots = [];
    try {
      snapshots = await listMetricSnapshots(auth, 20);
      trends = computeTrends(snapshots);
    } catch {
      // Snapshot table may not be migrated yet — trends are non-critical.
    }

    // Save a new snapshot (non-blocking failure — don't break the endpoint).
    // Debounced: refreshing the dashboard shouldn't pile up near-identical
    // snapshots, which would make trend comparisons meaningless.
    const SNAPSHOT_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;
    const latestSnapshot = snapshots[snapshots.length - 1];
    const latestSnapshotAge = latestSnapshot?.created_at
      ? Date.now() - new Date(latestSnapshot.created_at).getTime()
      : Infinity;
    if (latestSnapshotAge >= SNAPSHOT_MIN_INTERVAL_MS) {
      try {
        await saveMetricSnapshot(auth, metrics, scores);
      } catch {
        // Table may not exist yet on this environment.
      }
    }

    return res.status(200).json({
      generated_at: new Date().toISOString(),
      scope: auth.isSuperuser ? 'all_advisors' : 'own_audits',
      metrics,
      scores,
      trends,
      snapshots: snapshots.slice(-10),  // most recent 10, oldest-first
    });
  } catch (error) {
    return handleApiError(res, error, 'System improvement audit failed.');
  }
}
