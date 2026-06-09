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
};

function lookupKey<T>(map: Record<string, T>, company: string): T | undefined {
  const trimmed = company.trim();
  if (map[trimmed] !== undefined) {
    return map[trimmed];
  }
  const lower = trimmed.toLowerCase();
  const match = Object.entries(map).find(([name]) => name.toLowerCase() === lower);
  return match?.[1];
}

function simpleIconsUrl(slug: string): string {
  return `https://cdn.simpleicons.org/${slug}`;
}

function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

/** Built-in logo URLs for a company (SimpleIcons first, then domain favicon). */
export function builtInCompanyLogoUrls(company: string): string[] {
  const urls: string[] = [];
  const slug = lookupKey(COMPANY_LOGO_SLUGS, company);
  if (slug) {
    urls.push(simpleIconsUrl(slug));
  }
  const domain = lookupKey(COMPANY_LOGO_DOMAINS, company);
  if (domain) {
    urls.push(faviconUrl(domain));
  }
  return urls;
}

/**
 * Ordered logo URLs to try for a company: explicit (DB/admin) first, then built-in
 * fallbacks. De-duplicated.
 */
export function resolveCompanyLogoUrls(company: string, explicitUrl?: string | null): string[] {
  const urls: string[] = [];
  const explicit = explicitUrl?.trim();
  if (explicit) {
    urls.push(explicit);
  }
  for (const url of builtInCompanyLogoUrls(company)) {
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }
  return urls;
}

export function mentorCompanyLogoUrl(company: string): string | null {
  const urls = builtInCompanyLogoUrls(company);
  return urls[0] ?? null;
}
