import "server-only";

import { absolutePublicUrl } from "@/lib/app-origin";

/** Absolute URL on APP_ORIGIN for API route redirects in production. */
export function absoluteAppUrl(path: string): string {
  return absolutePublicUrl(path);
}
