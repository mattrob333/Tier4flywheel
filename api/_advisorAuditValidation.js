const MARKDOWN_HEADING = /^#{1,6}\s/m;
const PRODUCT_TITLE = /\b(Tier 4|Pedigree|Discover|Govern|Enforce|SKU)\b/i;
const INCOMPLETE_ENDING = /(?:[,;:]|\b(?:for|and|or|to|with|of|the|a|an|where usable)\.?)$/i;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function wordCount(value) {
  return text(value).split(/\s+/).filter(Boolean).length;
}

function looksTruncated(value) {
  const clean = text(value);
  if (clean.length < 16 || wordCount(clean) < 3) return false;
  return INCOMPLETE_ENDING.test(clean);
}

function hasNonAscii(value) {
  return Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return code !== 9 && code !== 10 && code !== 13 && (code < 32 || code > 126);
  });
}

function visitStrings(value, visitor, path = 'root') {
  if (typeof value === 'string') {
    visitor(value, path);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => visitStrings(item, visitor, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => visitStrings(item, visitor, `${path}.${key}`));
  }
}

function expectedOverall(domains) {
  if (!Array.isArray(domains) || !domains.length) return null;
  const scores = domains.map((domain) => Number(domain?.score)).filter(Number.isFinite);
  if (scores.length !== domains.length) return null;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Number(mean.toFixed(1));
}

function validateRoadmap(cr, errors) {
  const roadmap = cr?.roadmap;
  if (!roadmap || typeof roadmap !== 'object' || Array.isArray(roadmap)) {
    errors.push('roadmap must be an object with title and phases.');
    return;
  }

  const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];
  const periods = phases.map((phase) => text(phase?.period));
  const hasLatePhase = periods.includes('91-180 days');

  if (hasLatePhase && roadmap.title !== '180-Day Roadmap') {
    errors.push('roadmap title must be 180-Day Roadmap when a 91-180 days phase is present.');
  }

  if (!hasLatePhase && roadmap.title === '180-Day Roadmap') {
    errors.push('roadmap title is 180-Day Roadmap but no 91-180 days phase is present.');
  }
}

function validateRecommendations(cr, errors) {
  const recommendations = Array.isArray(cr?.recommendations) ? cr.recommendations : [];

  recommendations.forEach((recommendation, index) => {
    const title = text(recommendation?.title);
    const action = text(recommendation?.client_action);

    if (!title) {
      errors.push(`recommendations[${index}].title is empty.`);
    }

    if (title.endsWith('/')) {
      errors.push(`recommendations[${index}].title ends with a slash.`);
    }

    if (PRODUCT_TITLE.test(title)) {
      errors.push(`recommendations[${index}].title contains internal product language.`);
    }

    if (wordCount(`${title} ${action}`) < 8) {
      errors.push(`recommendations[${index}] is too short to be client-ready.`);
    }
  });
}

function validatePilot(cr, errors) {
  const pilot = cr?.recommended_first_pilot;
  if (!pilot || typeof pilot !== 'object') {
    errors.push('recommended_first_pilot is required.');
    return;
  }

  if (!text(pilot.title)) {
    errors.push('recommended_first_pilot.title is empty.');
  }

  if (/strategy\s*&?\s*roadmap/i.test(text(pilot.title))) {
    errors.push('recommended_first_pilot.title must be more concrete than Strategy & Roadmap.');
  }

  if (!text(pilot.why_this_first)) {
    errors.push('recommended_first_pilot.why_this_first is empty.');
  }

  ['target_users', 'required_data_sources', 'success_metrics', 'risk_controls'].forEach((field) => {
    if (!Array.isArray(pilot[field]) || pilot[field].length < 2) {
      errors.push(`recommended_first_pilot.${field} needs at least two items.`);
    }
  });
}

function validateClientCleanliness(cr, errors) {
  visitStrings(cr, (value, path) => {
    if (PRODUCT_TITLE.test(value)) {
      errors.push(`client_report${path.replace(/^root/, '')} contains internal product language.`);
    }
  });
}

function validateDomains(cr, errors) {
  const domains = Array.isArray(cr?.scorecard) ? cr.scorecard : [];

  domains.forEach((domain, index) => {
    if (!text(domain?.finding)) {
      errors.push(`scorecard[${index}].finding is empty.`);
    }
    if (!text(domain?.meaning)) {
      errors.push(`scorecard[${index}].meaning is empty.`);
    }
    if (!text(domain?.why_it_matters)) {
      errors.push(`scorecard[${index}].why_it_matters is empty.`);
    }
    if (!text(domain?.evidence)) {
      errors.push(`scorecard[${index}].evidence is empty.`);
    }
  });
}

export function validateAdvisorReport(report) {
  const errors = [];

  // Accept both the new nested shape and the legacy flat shape.
  const cr =
    report && typeof report.client_report === 'object' && report.client_report
      ? report.client_report
      : report || {};

  visitStrings(report, (value, path) => {
    if (hasNonAscii(value)) {
      errors.push(`${path} contains non-ASCII characters.`);
    }
    if (MARKDOWN_HEADING.test(value)) {
      errors.push(`${path} contains a Markdown heading.`);
    }
    if (looksTruncated(value)) {
      errors.push(`${path} appears to end mid-sentence.`);
    }
  });

  if (!text(cr?.business_risk)) {
    errors.push('client_report.business_risk is required.');
  }

  const expected = expectedOverall(cr?.scorecard);
  const actual = Number(cr?.overall);
  if (expected !== null && Number.isFinite(actual) && Math.abs(Number(actual.toFixed(1)) - expected) > 0.05) {
    errors.push(`client_report.overall must equal the one-decimal mean of scorecard scores (${expected}).`);
  }

  validateClientCleanliness(cr, errors);
  validateDomains(cr, errors);
  validateRecommendations(cr, errors);
  validatePilot(cr, errors);
  validateRoadmap(cr, errors);

  return errors;
}
