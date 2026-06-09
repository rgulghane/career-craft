import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@career-craft/shared";
import { ROBOTS_DISALLOW } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...ROBOTS_DISALLOW],
    },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
