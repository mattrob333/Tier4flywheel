import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 't4_advisor_gate';
const MAX_AGE_SECONDS = 60 * 60 * 12;

function getSecret() {
  const secret = process.env.ADVISOR_GATE_COOKIE_SECRET;
  if (!secret || secret.length < 32) {
    const err = new Error('Missing ADVISOR_GATE_COOKIE_SECRET.');
    err.statusCode = 500;
    throw err;
  }
  return secret;
}

function sign(value) {
  return createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

function parseCookies(req) {
  const raw = req.headers.cookie || req.headers.Cookie || '';
  return String(raw)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const index = part.indexOf('=');
      if (index === -1) return acc;
      acc[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1));
      return acc;
    }, {});
}

function cookieOptions(maxAge = MAX_AGE_SECONDS) {
  const parts = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function isGateCookieValid(req) {
  try {
    const token = parseCookies(req)[COOKIE_NAME];
    if (!token) return false;

    const [expiresAt, signature] = token.split('.');
    if (!expiresAt || !signature || Number(expiresAt) <= Date.now()) return false;

    return safeEqual(signature, sign(expiresAt));
  } catch {
    return false;
  }
}

export function setGateCookie(res) {
  const expiresAt = String(Date.now() + MAX_AGE_SECONDS * 1000);
  const token = `${expiresAt}.${sign(expiresAt)}`;
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieOptions()}`);
}

export function clearGateCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; ${cookieOptions(0)}`);
}

export function verifyGatePassword(password) {
  const expected = process.env.ADVISOR_GATE_PASSWORD;
  if (!expected) {
    const err = new Error('Missing ADVISOR_GATE_PASSWORD.');
    err.statusCode = 500;
    throw err;
  }

  const normalizedInput = String(password || '').trim();
  const normalizedExpected = String(expected).trim().replace(/^["']|["']$/g, '');
  return safeEqual(normalizedInput, normalizedExpected);
}
