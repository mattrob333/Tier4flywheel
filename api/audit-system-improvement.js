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
import { listAdvisorAudits } from './_advisorAuditStore.js';

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
    const investmentLow = proposal?.investment_low ?? null;
    const investmentHigh = proposal?.investment_high ?? null;
    const estimatedValue = proposal?.estimated_value ?? null;

    // Use midpoint of investment range if available, otherwise estimated_value
    let investment = null;
    if (investmentLow !== null && investmentHigh !== null) {
      investment = (Number(investmentLow) + Number(investmentHigh)) / 2;
    } else if (investmentLow !== null) {
      investment = Number(investmentLow);
    } else if (investmentHigh !== null) {
      investment = Number(investmentHigh);
    } else if (estimatedValue !== null) {
      investment = Number(estimatedValue);
    }

    if (annualCost !== null && investment !== null && Number(annualCost) > 0) {
      ratioSamples.push(Number(investment) / Number(annualCost));
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

export default async function handler(req, res) {
  try {
    const auth = await requireAdvisorAuth(req);

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const audits = await listAdvisorAudits(auth);
    const metrics = computeSystemMetrics(audits);

    return res.status(200).json({
      generated_at: new Date().toISOString(),
      scope: auth.isSuperuser ? 'all_advisors' : 'own_audits',
      metrics,
    });
  } catch (error) {
    return handleApiError(res, error, 'System improvement audit failed.');
  }
}
