const TEST_PREVIEW_HOST_PREFIX = 'tier4flywheel2-git-test-advisor';

export function isAdvisorAuthBypass() {
  if (import.meta.env.DEV && import.meta.env.VITE_AUDIT_AUTH_BYPASS === 'true') return true;
  if (typeof window === 'undefined') return false;
  return window.location.hostname.startsWith(TEST_PREVIEW_HOST_PREFIX);
}
