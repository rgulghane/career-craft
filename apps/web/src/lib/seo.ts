import type { Metadata } from "next";
import { getSiteOrigin, messages, PROGRAM } from "@career-craft/shared";

export const SEO = {
  siteName: PROGRAM.name,
  defaultTitle: messages.app.metaTitle,
  defaultDescription: messages.app.metaDescription,
  locale: "en_IN",
  keywords: [
    "AI career course",
    "Power BI training",
    "SQL course India",
    "business analytics",
    "12 week accelerator",
    "AI tools training",
    "career launchpad",
  ],
} as const;

/** Paths that must never appear in search results. */
export const ROBOTS_DISALLOW = [
  "/admin",
  "/api/",
  "/dashboard",
  "/enroll",
  "/login",
  "/register",
] as const;

export function getMetadataBase(): URL | undefined {
  const origin = getSiteOrigin();
  if (!origin) {
    return undefined;
  }
  try {
    return new URL(origin);
  } catch {
    return undefined;
  }
}

export const NO_INDEX: Pick<Metadata, "robots"> = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description = SEO.defaultDescription,
  path,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const metadataBase = getMetadataBase();
  const canonical =
    path && metadataBase ? new URL(path, metadataBase).toString() : undefined;

  return {
    title,
    description,
    ...(noIndex ? NO_INDEX : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title,
      description,
      siteName: SEO.siteName,
      type: "website",
      locale: SEO.locale,
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function getOrganizationJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO.siteName,
    url: origin,
    description: SEO.defaultDescription,
  };
}

export function getCourseJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: SEO.siteName,
    description: SEO.defaultDescription,
    url: origin,
    provider: {
      "@type": "Organization",
      name: SEO.siteName,
      url: origin,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: "P12W",
    },
  };
}

export function getWebSiteJsonLd(origin: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteName,
    url: origin,
    description: SEO.defaultDescription,
  };
}
