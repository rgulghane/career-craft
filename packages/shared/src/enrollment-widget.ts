/** Copy & config for the enrollment pricing card (matches product spec). */

export const ENROLLMENT_WIDGET = {
  listPriceInPaise: 1_000_000, // ₹10,000 after deadline
  emiMonths: 12,
  seats: { total: 120, remaining: 4 },
  viewingCount: {
    initial: 47,
    min: 20,
    max: 80,
    /** Random tick interval (ms) — short enough to feel live. */
    updateEveryMs: { min: 4_000, max: 11_000 },
  },
  features: [
    "12 weeks live + recorded sessions",
    "6 industry projects + capstone",
    "1:1 mentor sessions (2/month)",
    "Resume + LinkedIn AI makeover",
    "6-month placement support",
    "5 govt-backed certifications",
    "Referral agent perks on joining",
  ],
  trust: "Secure payment · 7-day refund · EMI available",
  referralPlaceholder: "e.g. CC-RAHUL7821",
} as const;
