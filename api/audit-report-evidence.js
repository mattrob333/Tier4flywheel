import {
  chunkEvidenceSchema,
  evidenceMergePrompt,
  getAuditType,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const client = body.client || {};
    const evidencePackets = Array.isArray(body.evidencePackets) ? body.evidencePackets : [];
    const passIndex = number(body.passIndex, 1);
    const groupIndex = number(body.groupIndex, 0);
    const totalGroups = number(body.totalGroups, 1);

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (!evidencePackets.length) {
      return res.status(400).json({ error: 'Evidence packets are required.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Assessment: ${t.name}`,
      `Merge pass: ${passIndex}`,
      `Evidence group: ${groupIndex + 1} of ${totalGroups}`,
      '',
      'EVIDENCE PACKETS:',
      JSON.stringify(evidencePackets, null, 2),
    ].join('\n');

    const result = await createStructuredResponse({
      instructions: evidenceMergePrompt(t),
      input,
      schema: chunkEvidenceSchema,
      schemaName: 'advisor_audit_merged_evidence',
      maxOutputTokens: 2600,
      parseModel: true,
    });

    return res.status(200).json({
      ...result,
      chunk_index: groupIndex + 1,
      total_chunks: totalGroups,
      merged_from_packets: evidencePackets.length,
    });
  } catch (error) {
    return handleApiError(res, error, 'Transcript evidence did not merge cleanly.');
  }
}
