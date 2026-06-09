/**
 * Brand → SimpleIcons slug map used to build default company icon URLs.
 *
 * Kept in a plain (non-"use client") module so it can be imported by both the
 * client `MentorCompanyLogo` component and server-side services (e.g. seeding
 * the CompanyLogo collection) without pulling a client component into the
 * server bundle.
 *
 * Note: SimpleIcons no longer serves some big-brand slugs (Microsoft, Amazon,
 * Flipkart, …). Those are intentionally omitted — admins can upload proper
 * icons on the Mentor companies page, and unknown companies fall back to text.
 */
export const COMPANY_LOGO_SLUGS: Record<string, string> = {
  "Google India": "google",
  Google: "google",
  TCS: "tcs",
  Swiggy: "swiggy",
  Razorpay: "razorpay",
  PhonePe: "phonepe",
  Zomato: "zomato",
  Meta: "meta",
  Facebook: "facebook",
  Paytm: "paytm",
  Unilever: "unilever",
  Infosys: "infosys",
  Apple: "apple",
  Netflix: "netflix",
  Intel: "intel",
  NVIDIA: "nvidia",
  Samsung: "samsung",
  Sony: "sony",
  Spotify: "spotify",
  Uber: "uber",
  Airbnb: "airbnb",
  Atlassian: "atlassian",
  Stripe: "stripe",
  PayPal: "paypal",
  Shopify: "shopify",
  Tesla: "tesla",
  Dropbox: "dropbox",
  GitHub: "github",
  GitLab: "gitlab",
  Cisco: "cisco",
  Dell: "dell",
  HP: "hp",
  Qualcomm: "qualcomm",
  Accenture: "accenture",
  Wipro: "wipro",
  SAP: "sap",
  Zoho: "zoho",
  MongoDB: "mongodb",
  Snowflake: "snowflake",
  Databricks: "databricks",
  Notion: "notion",
  Figma: "figma",
  Zerodha: "zerodha",
};

/** Favicon fallback when SimpleIcons does not host the brand (404). */
const COMPANY_LOGO_DOMAINS: Record<string, string> = {
  Flipkart: "flipkart.com",
  CRED: "cred.club",
  "Amazon India": "amazon.in",
  Amazon: "amazon.com",
  Nykaa: "nykaa.com",
  Myntra: "myntra.com",
  Microsoft: "microsoft.com",
  Deloitte: "deloitte.com",
  KPMG: "kpmg.com",
  Freshworks: "freshworks.com",
  Capgemini: "capgemini.com",
  Groww: "groww.in",
  Atlan: "atlan.com",
  Canva: "canva.com",
  IBM: "ibm.com",
};

const KNOWN_SIMPLE_ICON_SLUGS = new Set(Object.values(COMPANY_LOGO_SLUGS));

function lookupKey<T>(map: Record<string, T>, company: string): T | undefined {
  const trimmed = company.trim();
  if (map[trimmed] !== undefined) {
    return map[trimmed];
  }
  const lower = trimmed.toLowerCase();
  const match = Object.entries(map).find(([name]) => name.toLowerCase() === lower);
  return match?.[1];
}

/** jsDelivr mirror — same source as tool icons on the landing page. */
export function simpleIconsJsdelivrUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function isSimpleIconsCdnUrl(url: string): boolean {
  return /^https:\/\/cdn\.simpleicons\.org\//i.test(url);
}

function slugFromSimpleIconsCdnUrl(url: string): string | null {
  const match = url.match(/^https:\/\/cdn\.simpleicons\.org\/([^/?#]+)/i);
  return match?.[1] ?? null;
}

/** Built-in logo URLs for a company (jsDelivr slug, then domain favicon). */
export function builtInCompanyLogoUrls(company: string): string[] {
  const urls: string[] = [];
  const slug = lookupKey(COMPANY_LOGO_SLUGS, company);
  if (slug) {
    urls.push(simpleIconsJsdelivrUrl(slug));
  }
  const domain = lookupKey(COMPANY_LOGO_DOMAINS, company);
  if (domain) {
    urls.push(faviconUrl(domain));
  }
  return urls;
}

/** Case-insensitive lookup in an admin-managed `company → logoUrl` map. */
export function lookupStoredLogoUrl(
  company: string,
  map: Record<string, string>,
): string | null {
  const key = company.trim().toLowerCase();
  if (map[key]) {
    return map[key];
  }
  const match = Object.entries(map).find(([name]) => name.toLowerCase() === key);
  return match?.[1] ?? null;
}

/**
 * Ordered logo URLs to try for a company.
 *
 * Custom uploads (Azure, etc.) first, then reliable built-ins. Legacy
 * `cdn.simpleicons.org` seeds from the DB are only kept when the slug is known —
 * broken links for Myntra/Nykaa-style brands were blocking favicon fallbacks.
 */
export function resolveCompanyLogoUrls(company: string, explicitUrl?: string | null): string[] {
  const urls: string[] = [];
  const add = (url: string) => {
    const trimmed = url.trim();
    if (trimmed && !urls.includes(trimmed)) {
      urls.push(trimmed);
    }
  };

  const explicit = explicitUrl?.trim();
  const explicitIsSimpleIconsCdn = explicit ? isSimpleIconsCdnUrl(explicit) : false;

  // Custom uploads (Azure blob, etc.) — highest priority.
  if (explicit && !explicitIsSimpleIconsCdn) {
    add(explicit);
  }

  // jsDelivr slugs + Google favicons for domain-only brands.
  for (const url of builtInCompanyLogoUrls(company)) {
    add(url);
  }

  // Legacy DB seeds on cdn.simpleicons.org — only when the slug is in our map.
  if (explicit && explicitIsSimpleIconsCdn) {
    const slug = slugFromSimpleIconsCdnUrl(explicit);
    if (slug && KNOWN_SIMPLE_ICON_SLUGS.has(slug)) {
      add(simpleIconsJsdelivrUrl(slug));
      add(explicit);
    }
  }

  return urls;
}

export function mentorCompanyLogoUrl(company: string): string | null {
  const urls = builtInCompanyLogoUrls(company);
  return urls[0] ?? null;
}
