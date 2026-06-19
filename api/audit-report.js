import {
  getAuditType,
  reportRepairPrompt,
  reportPrompt,
  reportSchema,
} from './_advisorAuditPrompts.js';
import {
  createStructuredResponse,
  handleApiError,
  readJson,
  requireAdvisorAuth,
  requirePost,
} from './_advisorAuditServer.js';
import { validateAdvisorReport } from './_advisorAuditValidation.js';

function clean(value, max = 200000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function clipAroundWords(value, maxChars) {
  if (value.length <= maxChars) return value;
  const clipped = value.slice(0, maxChars);
  const lastBreak = Math.max(clipped.lastIndexOf('\n'), clipped.lastIndexOf('. '), clipped.lastIndexOf(' '));
  return clipped.slice(0, lastBreak > 1200 ? lastBreak : maxChars).trim();
}

function transcriptStats(transcript) {
  const speakers = new Set();
  for (const line of transcript.split('\n')) {
    const match = line.trim().match(/^([A-Z][A-Za-z .'-]{1,60})(?:\\s*[-:]|\\s+\\d{1,2}:\\d{2})/);
    if (match) speakers.add(match[1].trim());
    if (speakers.size >= 12) break;
  }

  return [
    `Original transcript characters: ${transcript.length}`,
    speakers.size ? `Detected speakers: ${Array.from(speakers).join(', ')}` : 'Detected speakers: not clearly labeled',
  ].join('\n');
}

function middleSamples(transcript, sampleCount = 4, sampleSize = 2400) {
  if (transcript.length < 18000) return '';
  const usableStart = Math.floor(transcript.length * 0.2);
  const usableEnd = Math.floor(transcript.length * 0.78);
  const span = Math.max(usableEnd - usableStart, sampleSize);
  const samples = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const anchor = usableStart + Math.floor((span * (index + 1)) / (sampleCount + 1));
    const start = Math.max(0, anchor - Math.floor(sampleSize / 2));
    samples.push(`MIDDLE SAMPLE ${index + 1}:\n${clipAroundWords(transcript.slice(start, start + sampleSize), sampleSize)}`);
  }
  return samples.join('\n\n');
}

function evidenceDigestForReport(value) {
  const transcript = clean(value, 220000);
  const maxChars = 26000;
  if (transcript.length <= maxChars) return transcript;

  const opening = clipAroundWords(transcript.slice(0, 9000), 9000);
  const samples = middleSamples(transcript);
  const closing = transcript.slice(-9000);
  return [
    'TRANSCRIPT EVIDENCE DIGEST FOR LONG CALL',
    transcriptStats(transcript),
    '',
    'Use this digest as the evidence source. If a topic is not represented here, say evidence is thin rather than inventing detail.',
    '',
    'OPENING / CONTEXT:',
    opening,
    '',
    samples,
    '',
    'CLOSING / PRIORITIES / NEXT STEPS:',
    closing,
  ].join('\n');
}

export default async function handler(req, res) {
  if (!requirePost(req, res)) return;

  try {
    await requireAdvisorAuth(req);
    const body = await readJson(req);
    const client = body.client || {};
    const transcript = evidenceDigestForReport(body.transcript);

    if (!clean(client.name, 200)) {
      return res.status(400).json({ error: 'Client name is required.' });
    }

    if (transcript.length < 40) {
      return res.status(400).json({ error: 'Paste a longer transcript before generating the report.' });
    }

    const t = getAuditType(client.typeKey);
    const input = [
      `Client: ${clean(client.name, 200)}`,
      `Assessment: ${t.name}`,
      '',
      'CALL TRANSCRIPT:',
      transcript,
    ].join('\n');

    const result = await createStructuredResponse({
      instructions: reportPrompt(t),
      input,
      schema: reportSchema,
      schemaName: 'advisor_audit_report',
      maxOutputTokens: 3600,
      reportModel: true,
      validate: validateAdvisorReport,
      repairInstructions: reportRepairPrompt(t),
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleApiError(res, error, "Report didn't come back cleanly.");
  }
}
