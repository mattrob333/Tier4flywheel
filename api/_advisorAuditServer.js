import { createClerkClient, verifyToken } from '@clerk/backend';
import OpenAI from 'openai';

const OPENAI_MODEL = process.env.OPENAI_AUDIT_MODEL || 'gpt-5.5';
const OPENAI_REPORT_MODEL = process.env.OPENAI_AUDIT_REPORT_MODEL || OPENAI_MODEL;

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

  if (process.env.AUDIT_AUTH_BYPASS === 'true' || isTestPreviewBypass) {
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

export async function createStructuredResponse({
  instructions,
  input,
  schema,
  schemaName,
  webSearch = false,
  maxOutputTokens = 2500,
  reportModel = false,
}) {
  const response = await getOpenAI().responses.create({
    model: reportModel ? OPENAI_REPORT_MODEL : OPENAI_MODEL,
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

  try {
    return JSON.parse(response.output_text);
  } catch (error) {
    error.message = `OpenAI returned non-JSON output: ${error.message}`;
    error.rawOutput = response.output_text;
    throw error;
  }
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
