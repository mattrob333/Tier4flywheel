import { createClerkClient, verifyToken } from '@clerk/backend';
import OpenAI from 'openai';

const OPENAI_MODEL = process.env.OPENAI_AUDIT_MODEL || 'gpt-5.5';
const OPENAI_REPORT_MODEL = process.env.OPENAI_AUDIT_REPORT_MODEL || OPENAI_MODEL;
const OPENAI_PARSE_MODEL = process.env.OPENAI_AUDIT_PARSE_MODEL || process.env.OPENAI_AUDIT_CHUNK_MODEL || 'gpt-5.4-mini';
const MANY_SPACES = /[ \t]{2,}/g;

let openaiClient;
let clerkClient;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    const err = new Error('Missing OPENAI_API_KEY');
    err.statusCode = 500;
    throw err;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getClerk() {
  if (!clerkClient) {
    clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return clerkClient;
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export function requirePost(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return false;
  }
  return true;
}

function getBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const match = String(auth).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : '';
}

function listEnv(name) {
  return String(process.env[name] || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
}

export function isAuditSuperuserEmail(email) {
  if (!email) return false;
  return listEnv('AUDIT_SUPERUSER_EMAILS')
    .map((x) => x.toLowerCase())
    .includes(String(email).toLowerCase());
}

function getPrimaryEmail(user) {
  const primary =
    user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId) ||
    user.emailAddresses[0];
  return primary?.emailAddress?.toLowerCase() || '';
}

function getDisplayName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || '';
}

async function getAdvisorProfile(userId) {
  const user = await getClerk().users.getUser(userId);
  return {
    userId,
    email: getPrimaryEmail(user),
    name: getDisplayName(user),
  };
}

function assertAllowedEmail(profile) {
  const allowedDomains = listEnv('AUDIT_ALLOWED_EMAIL_DOMAINS').map((x) => x.toLowerCase());
  const allowedEmails = listEnv('AUDIT_ALLOWED_EMAILS').map((x) => x.toLowerCase());
  if (!allowedDomains.length && !allowedEmails.length) return;

  if (!profile.email) {
    const err = new Error('No verified user email found.');
    err.statusCode = 403;
    throw err;
  }

  const domain = profile.email.split('@')[1] || '';
  if (allowedEmails.includes(profile.email) || allowedDomains.includes(domain)) {
    return;
  }

  const err = new Error('This account is not allowed to use the advisor audit.');
  err.statusCode = 403;
  throw err;
}

export async function requireAdvisorAuth(req) {
  const isTestPreviewBypass =
    process.env.VERCEL_ENV === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'test/advisor-audit-no-texture';

  if (
    (process.env.NODE_ENV !== 'production' && process.env.AUDIT_AUTH_BYPASS === 'true') ||
    isTestPreviewBypass
  ) {
    return {
      userId: 'local-dev',
      email: 'local-dev@tier4intelligence.com',
      name: 'Local Dev',
      isSuperuser: true,
    };
  }

  if (!process.env.CLERK_SECRET_KEY) {
    const err = new Error('Missing CLERK_SECRET_KEY');
    err.statusCode = 500;
    throw err;
  }

  const token = getBearerToken(req);
  if (!token) {
    const err = new Error('Missing Clerk bearer token.');
    err.statusCode = 401;
    throw err;
  }

  const authorizedParties = listEnv('CLERK_AUTHORIZED_PARTIES');
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY,
    ...(authorizedParties.length ? { authorizedParties } : {}),
  });

  const requiredOrgId = process.env.CLERK_ALLOWED_ORG_ID;
  if (requiredOrgId && payload.org_id !== requiredOrgId) {
    const err = new Error('This Clerk organization is not allowed to use the advisor audit.');
    err.statusCode = 403;
    throw err;
  }

  const profile = await getAdvisorProfile(payload.sub);
  assertAllowedEmail(profile);
  return { ...profile, isSuperuser: isAuditSuperuserEmail(profile.email) };
}

function sanitizeText(value) {
  return Array.from(value)
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    })
    .join('')
    .replace(MANY_SPACES, ' ')
    .trim();
}

function sanitizeStructuredOutput(value) {
  if (typeof value === 'string') return sanitizeText(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeStructuredOutput(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeStructuredOutput(item)]),
    );
  }
  return value;
}

async function requestStructuredOutput({
  instructions,
  input,
  schema,
  schemaName,
  webSearch,
  maxOutputTokens,
  model,
  parseModel,
  reportModel,
}) {
  return getOpenAI().responses.create({
    model: model || (parseModel ? OPENAI_PARSE_MODEL : reportModel ? OPENAI_REPORT_MODEL : OPENAI_MODEL),
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
    ...(webSearch
      ? {
          tools: [
            {
              type: 'web_search',
              search_context_size: 'medium',
              user_location: {
                type: 'approximate',
                city: 'Alpharetta',
                region: 'Georgia',
                country: 'US',
                timezone: 'America/New_York',
              },
            },
          ],
        }
      : {}),
    text: {
      format: {
        type: 'json_schema',
        name: schemaName,
        strict: true,
        schema,
      },
    },
  });
}

function parseStructuredOutput(response) {
  try {
    return sanitizeStructuredOutput(JSON.parse(response.output_text));
  } catch (error) {
    error.message = `OpenAI returned non-JSON output: ${error.message}`;
    error.rawOutput = response.output_text;
    throw error;
  }
}

function validationError(errors) {
  const error = new Error(`OpenAI returned report JSON that failed validation: ${errors.join(' ')}`);
  error.statusCode = 502;
  return error;
}

export async function createStructuredResponse({
  instructions,
  input,
  schema,
  schemaName,
  webSearch = false,
  maxOutputTokens = 2500,
  model,
  parseModel = false,
  reportModel = false,
  validate,
  repairInstructions,
}) {
  const response = await requestStructuredOutput({
    instructions,
    input,
    schema,
    schemaName,
    webSearch,
    maxOutputTokens,
    model,
    parseModel,
    reportModel,
  });

  let parsed;
  let errors = [];
  try {
    parsed = parseStructuredOutput(response);
  } catch (error) {
    if (!repairInstructions) throw error;
    errors = [error.message];
  }

  if (parsed && validate) {
    errors = validate(parsed);
  }

  if (!errors.length) return parsed;
  if (!repairInstructions) throw validationError(errors);

  const repairInput = [
    'Validation errors:',
    ...errors.map((error) => `- ${error}`),
    '',
    'Original JSON or raw output:',
    parsed ? JSON.stringify(parsed, null, 2) : String(response.output_text || ''),
  ].join('\n');

  const repaired = await requestStructuredOutput({
    instructions: repairInstructions,
    input: repairInput,
    schema,
    schemaName: `${schemaName}_repair`,
    webSearch: false,
    maxOutputTokens,
    model,
    parseModel,
    reportModel,
  });

  const repairedParsed = parseStructuredOutput(repaired);
  const repairedErrors = validate ? validate(repairedParsed) : [];
  if (repairedErrors.length) throw validationError(repairedErrors);

  return repairedParsed;
}

export async function createTextResponse({ instructions, input, maxOutputTokens = 800 }) {
  const response = await getOpenAI().responses.create({
    model: OPENAI_MODEL,
    instructions,
    input,
    max_output_tokens: maxOutputTokens,
  });

  return response.output_text.trim();
}

export function handleApiError(res, error, fallback = 'Request failed') {
  const status = error.statusCode || error.status || 500;
  const errorCode =
    error.errorCode ||
    (error.message === 'Missing OPENAI_API_KEY'
      ? 'OPENAI_API_KEY_MISSING'
      : error.message === 'Missing CLERK_SECRET_KEY'
        ? 'CLERK_SECRET_KEY_MISSING'
        : undefined);
  const safeMessage =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? fallback
      : error.message || fallback;

  if (status >= 500) {
    console.error('[advisor-audit]', error);
  }

  return res.status(status).json({ error: safeMessage, ...(errorCode ? { errorCode } : {}) });
}
