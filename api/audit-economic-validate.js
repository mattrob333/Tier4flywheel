import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import { isValidValidationStatus } from './_economicImpact.js';
import { validateEconomicImpact } from './_advisorAuditStore.js';

// POST /api/audit-economic-validate
// Accepts the outcome of the readout "Validate Economics" (Card 3) conversation
// and persists validation status across audit_economic_impacts, audit_readouts,
// and advisor_audits (lifecycle).
//
// Body:
//   audit_id               (required) the audit being validated
//   validation_status      (required) 'validated' | 'revised' | 'rejected'
//   impact_id              (optional) specific economic impact row; latest used if omitted
//   readout_id             (optional) specific readout row; latest used (or created) if omitted
//   validated_annual_cost  (optional) confirmed annual cost on 'validated'
//   revised_annual_cost    (optional) revised annual cost on 'revised'
//   annual_cost_estimate   (optional) revised impact number on 'revised'
//   annual_savings_low     (optional) revised savings low on 'revised'
//   annual_savings_high    (optional) revised savings high on 'revised'
//   confidence             (optional) revised confidence on 'revised'
//   client_economic_feedback (optional) free-text notes from the client conversation
function clean(value, max = 120000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    const auth = await requireAdvisorAuth(req);
    const body = await readJson(req);
    const auditId = clean(body.audit_id, 80);
    if (!auditId) return res.status(400).json({ error: 'Audit id is required.' });

    const validationStatus = clean(body.validation_status, 40);
    if (!isValidValidationStatus(validationStatus)) {
      return res.status(400).json({
        error: "validation_status must be one of: 'validated', 'revised', 'rejected'.",
      });
    }

    const result = await validateEconomicImpact(auth, auditId, {
      validation_status: validationStatus,
      impact_id: clean(body.impact_id, 80),
      readout_id: clean(body.readout_id, 80),
      validated_annual_cost: body.validated_annual_cost,
      revised_annual_cost: body.revised_annual_cost,
      annual_cost_estimate: body.annual_cost_estimate,
      annual_savings_low: body.annual_savings_low,
      annual_savings_high: body.annual_savings_high,
      confidence: clean(body.confidence, 40),
      client_economic_feedback: clean(body.client_economic_feedback, 10000),
    });

    return res.status(200).json({
      validation_status: result.validation_status,
      impact_id: result.impact?.id || null,
      readout_id: result.readout?.id || null,
      economics_validated: result.validation_status !== 'rejected',
      economics_revised: result.validation_status === 'revised',
    });
  } catch (error) {
    return handleApiError(res, error, 'Economic validation failed.');
  }
}
