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

export function mentorCompanyLogoUrl(company: string): string | null {
  const slug = COMPANY_LOGO_SLUGS[company];
  if (!slug) {
    return null;
  }
  return `https://cdn.simpleicons.org/${slug}`;
}
