/** Build `/enroll` path with optional referral code and auto-continue flag. */
export function buildEnrollPath(ref?: string, continueFlow = false): string {
  const params = new URLSearchParams();
  const code = ref?.trim().toUpperCase();
  if (code) {
    params.set("ref", code);
  }
  if (continueFlow) {
    params.set("continue", "1");
  }
  const query = params.toString();
  return query ? `/enroll?${query}` : "/enroll";
}

/** Build `/register` path preserving referral code from an enroll link. */
export function buildRegisterPath(ref?: string): string {
  const code = ref?.trim().toUpperCase();
  if (!code) {
    return "/register";
  }
  return `/register?ref=${encodeURIComponent(code)}`;
}

/** Build `/login` path that returns to enroll after sign-in. */
export function buildLoginPath(ref?: string, continueFlow = true): string {
  const next = buildEnrollPath(ref, continueFlow);
  return `/login?next=${encodeURIComponent(next)}`;
}
