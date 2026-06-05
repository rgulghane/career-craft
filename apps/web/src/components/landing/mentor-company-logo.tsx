const COMPANY_LOGO_SLUGS: Record<string, string> = {
  Flipkart: "flipkart",
  CRED: "cred",
  "Amazon India": "amazon",
  Nykaa: "nykaa",
  "Google India": "google",
  TCS: "tcs",
  Myntra: "myntra",
  Deloitte: "deloitte",
  Swiggy: "swiggy",
  Razorpay: "razorpay",
  PhonePe: "phonepe",
  Zomato: "zomato",
  Meta: "meta",
  Facebook: "facebook",
  Paytm: "paytm",
  Microsoft: "microsoft",
  Unilever: "unilever",
  IBM: "ibm",
  Infosys: "infosys",
  KPMG: "kpmg",
  Freshworks: "freshworks",
};

export function mentorCompanyLogoUrl(company: string): string | null {
  const slug = COMPANY_LOGO_SLUGS[company];
  if (!slug) {
    return null;
  }
  return `https://cdn.simpleicons.org/${slug}`;
}

export function MentorCompanyLogo({ company }: { company: string }) {
  const logoUrl = mentorCompanyLogoUrl(company);

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={company}
        width={96}
        height={28}
        className="mx-auto h-8 w-auto max-w-[9rem] object-contain sm:h-9"
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <p className="text-base font-semibold tracking-tight text-slate-800">{company}</p>
  );
}
