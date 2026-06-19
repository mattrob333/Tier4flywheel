import {
  chunkAnalysisPrompt,
  chunkEvidenceSchema,
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

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
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
    const chunk = text(body.chunk);
    const chunkIndex = number(body.chunkIndex, 1);
    const totalChunks = number(body.totalChunks, 1);
    const charStart = number(body.charStart, 0);
    const charEnd = number(body.charEnd, charStart + chunk.length);

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (chunk.length < 20) {
      return res.status(400).json({ error: 'Transcript chunk is too short to parse.' });
    }

    if (chunk.length > 18000) {
      return res.status(400).json({ error: 'Transcript chunk is too large. Split it into smaller parts and try again.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Website: ${clean(client.url, 500) || '(none given)'}`,
      `Assessment: ${t.name}`,
      `Chunk: ${chunkIndex} of ${totalChunks}`,
      `Character range: ${charStart}-${charEnd}`,
      '',
      'TRANSCRIPT CHUNK:',
      chunk,
    ].join('\n');

    const result = await createStructuredResponse({
      instructions: chunkAnalysisPrompt(t),
      input,
      schema: chunkEvidenceSchema,
      schemaName: 'advisor_audit_chunk_evidence',
      maxOutputTokens: 2200,
      parseModel: true,
    });

    return res.status(200).json({
      ...result,
      chunk_index: chunkIndex,
      total_chunks: totalChunks,
      char_start: charStart,
      char_end: charEnd,
    });
  } catch (error) {
    return handleApiError(res, error, 'Transcript chunk did not parse cleanly.');
  }
}
