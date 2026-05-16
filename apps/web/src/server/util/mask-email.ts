import "server-only";

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) {
    return "***";
  }
  const safeLocal = local ?? "";
  const head = safeLocal.slice(0, 2);
  return `${head}***@${domain}`;
}
