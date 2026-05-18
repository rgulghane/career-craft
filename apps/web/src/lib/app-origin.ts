import { getSiteOrigin } from "@career-craft/shared";

/**
 * Public app origin for redirects behind reverse proxies (Render, Fly, etc.).
 * Safe in middleware and server routes — does not import server-only modules.
 */

export function getPublicAppOrigin(fallbackOrigin?: string): string {
  const configured = getSiteOrigin();
  if (configured) {
    return configured;
  }
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, "");
  }
  return "";
}

/** Build an absolute URL on the public origin (never 0.0.0.0 / internal bind address). */
export function absolutePublicUrl(path: string, fallbackOrigin?: string): string {
  const base = getPublicAppOrigin(fallbackOrigin);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
