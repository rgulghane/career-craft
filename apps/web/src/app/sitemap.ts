import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@career-craft/shared";

/** Only publicly indexable marketing pages. */
const PUBLIC_ROUTES: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "weekly", priority: 1 },
  { url: "/curriculum", changeFrequency: "monthly", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  if (!origin) {
    return [];
  }

  const lastModified = new Date();

  return PUBLIC_ROUTES.map((entry) => ({
    ...entry,
    url: `${origin}${entry.url === "/" ? "" : entry.url}`,
    lastModified,
  }));
}
