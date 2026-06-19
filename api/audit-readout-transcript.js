import {
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import { saveAuditReadout } from './_advisorAuditStore.js';

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

    const transcript = clean(body.readout_transcript_text);
    const readout = await saveAuditReadout(auth, auditId, {
      ...body,
      readout_transcript_text: transcript,
      status: transcript ? 'readout_transcript_added' : 'readout_guide_ready',
    });

    return res.status(200).json({ readout });
  } catch (error) {
    return handleApiError(res, error, 'Readout transcript request failed.');
  }
}
