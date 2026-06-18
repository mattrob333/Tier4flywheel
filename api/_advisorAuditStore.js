import { randomUUID } from 'node:crypto';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const err = new Error('Supabase audit storage is not configured.');
    err.statusCode = 503;
    err.errorCode = 'SUPABASE_NOT_CONFIGURED';
    throw err;
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
  };
}

async function supabaseFetch(path, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const err = new Error(data?.message || data?.error || 'Supabase request failed.');
    err.statusCode = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

function clean(value, max = 2000) {
  return typeof value === 'string' ? value.slice(0, max).trim() : '';
}

function reportScore(report) {
  const score = Number(report?.overall);
  return Number.isFinite(score) ? score : null;
}

function tableAuditFromPayload(auth, payload, id) {
  const client = payload.client || {};
  const research = payload.research || null;
  const report = payload.report || null;

  return {
    id,
    owner_clerk_user_id: auth.userId,
    owner_email: auth.email || '',
    owner_name: auth.name || '',
    client_name: clean(client.name, 250),
    client_url: clean(client.url, 500),
    client_desc: clean(client.desc, 4000),
    audit_type_key: clean(client.typeKey, 80) || 'discovery',
    audit_type_name: clean(client.typeName, 160),
    author_name: clean(client.author, 160),
    research: research?.research || null,
    questions: Array.isArray(research?.questions) ? research.questions : null,
    transcript: clean(payload.transcript, 120000) || null,
    report,
    followup_email: clean(payload.followup, 12000) || null,
    overall_score: reportScore(report),
    score_band: clean(report?.band, 100) || null,
    status: clean(payload.status, 80) || 'draft',
    updated_at: new Date().toISOString(),
  };
}

export async function upsertAdvisorProfile(auth) {
  if (!auth.userId) return null;

  const rows = await supabaseFetch('advisor_profiles?on_conflict=clerk_user_id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([
      {
        clerk_user_id: auth.userId,
        email: auth.email || '',
        name: auth.name || '',
        role: auth.isSuperuser ? 'superuser' : 'advisor',
        updated_at: new Date().toISOString(),
      },
    ]),
  });

  return rows?.[0] || null;
}

export async function saveAdvisorAudit(auth, payload) {
  await upsertAdvisorProfile(auth);

  const requestedId = clean(payload.id, 80);
  const id = requestedId || randomUUID();
  const existing = requestedId ? await getAdvisorAudit(auth, requestedId, { allowMissing: true }) : null;

  if (existing && existing.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You can only update audits you own.');
    err.statusCode = 403;
    throw err;
  }

  const row = tableAuditFromPayload(auth, payload, id);
  const rows = await supabaseFetch('advisor_audits?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify([row]),
  });

  return rows?.[0] || row;
}

export async function listAdvisorAudits(auth) {
  const path = auth.isSuperuser
    ? 'advisor_audits?select=*&order=updated_at.desc'
    : `advisor_audits?select=*&owner_clerk_user_id=eq.${encodeURIComponent(auth.userId)}&order=updated_at.desc`;

  return supabaseFetch(path, { method: 'GET' });
}

export async function getAdvisorAudit(auth, id, options = {}) {
  const rows = await supabaseFetch(`advisor_audits?select=*&id=eq.${encodeURIComponent(id)}&limit=1`, {
    method: 'GET',
  });
  const row = rows?.[0] || null;

  if (!row) {
    if (options.allowMissing) return null;
    const err = new Error('Audit was not found.');
    err.statusCode = 404;
    throw err;
  }

  if (!auth.isSuperuser && row.owner_clerk_user_id !== auth.userId) {
    const err = new Error('You do not have access to this audit.');
    err.statusCode = 403;
    throw err;
  }

  return row;
}
