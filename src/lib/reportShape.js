// Normalizes advisor audit reports into a single working shape for the UI.
//
// Reports now use a three-layer shape:
//   { client_report, advisor_intelligence, system_metadata }
// Older saved reports were flat (execSummary, domains, pedigree_fit, ...).
// This adapter accepts either and returns:
//   { isGeo, client, advisor, economic, meta }
// where `client` is product-neutral and carries legacy field aliases so the
// existing report UI keeps working. The client layer never includes Pedigree.

function aliasClientLayer(cr) {
  if (!cr || typeof cr !== 'object') return cr;
  return {
    ...cr,
    // legacy aliases used by the existing report UI / markdown builder
    execSummary: cr.executive_summary ?? cr.execSummary ?? '',
    topFindings: cr.top_findings ?? cr.topFindings ?? [],
    domains: cr.scorecard ?? cr.domains ?? [],
  };
}

function advisorFromLegacy(raw) {
  const mapping = (Array.isArray(raw.recommendations) ? raw.recommendations : [])
    .filter((r) => r && r.internal_solution_mapping && r.internal_solution_mapping !== 'None')
    .map((r) => ({
      recommendation: r.title || '',
      signal: '',
      internal_note: r.internal_solution_mapping,
    }));

  return {
    ai_governance_signal: raw.ai_use_case_governance_signal || '',
    next_step_signals: [],
    proposal_type_suggestion: '',
    prd_readiness: '',
    objections_to_explore: [],
    internal_solution_mapping: mapping,
    // surface legacy pedigree_fit internally only (never client-facing)
    legacy_pedigree_fit: raw.pedigree_fit || null,
  };
}

export function normalizeReport(raw) {
  if (!raw || typeof raw !== 'object') {
    return { isGeo: false, client: null, advisor: null, economic: null, meta: null };
  }

  if (raw.geo_audit) {
    return { isGeo: true, client: raw, advisor: null, economic: null, meta: null };
  }

  const hasNew = raw.client_report && typeof raw.client_report === 'object';

  if (hasNew) {
    const cr = aliasClientLayer(raw.client_report);
    return {
      isGeo: false,
      client: cr,
      advisor: raw.advisor_intelligence || null,
      economic: raw.client_report.economic_opportunity || null,
      meta: raw.system_metadata || null,
    };
  }

  // legacy flat report
  return {
    isGeo: false,
    client: aliasClientLayer(raw),
    advisor: advisorFromLegacy(raw),
    economic: raw.economic_opportunity || null,
    meta: null,
  };
}

export function hasInternalMapping(advisor) {
  if (!advisor) return false;
  const mapping = advisor.internal_solution_mapping;
  return Array.isArray(mapping) && mapping.length > 0;
}
