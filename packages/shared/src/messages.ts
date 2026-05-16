/**
 * Central copy for UI and API responses. Extend with i18n keys later if needed.
 */
export const messages = {
  app: {
    title: "CareerCraft Referrals",
    tagline: "Enroll, share your code, earn when friends join — after the refund window.",
    metaTitle: "CareerCraft AI — 12-Week Industry Accelerator",
    metaDescription:
      "Master Power BI, AI tools, Canva, SQL, and more in 12 weeks. Live Saturday classes, govt-backed certs, placement support, and a student referral program.",
  },
  nav: {
    home: "Home",
    enroll: "Enroll",
    dashboard: "Dashboard",
    signIn: "Sign in",
    signOut: "Sign out",
    register: "Create account",
  },
  auth: {
    emailLabel: "Email",
    passwordLabel: "Password",
    fullNameLabel: "Full name",
    signInHeading: "Welcome back",
    registerHeading: "Create your account",
    signInCta: "Sign in",
    registerCta: "Create account",
    continueEnrollCta: "Continue to enrollment",
    invalidCredentials: "Invalid email or password.",
    registerSuccess: "Account created. You can sign in now.",
    signedOut: "You have been signed out.",
  },
  enroll: {
    pageEyebrow: "Cohort 4 enrollment",
    welcome: (name: string) => `Welcome, ${name} — secure your seat below.`,
    heading: "Complete enrollment",
    referralLabel: "Referral code (optional)",
    referralHint: "Valid codes unlock the discounted price automatically.",
    payCta: "Create enrollment",
    success: "Enrollment created. In production, redirect to your payment provider.",
  },
  dashboard: {
    heading: "Your referral hub",
    yourCode: "Your referral code",
    shareLink: "Share link",
    copyLink: "Copy link",
    stats: "Progress",
    qualified: "Qualified",
    pending: "Pending",
    totalReferrals: "Total attributed",
    milestones: "Milestones",
    nextSteps: "Share your link with classmates and colleagues.",
    notEnrolled: "Complete enrollment to unlock your referral code.",
    pricingLabelEnrolled: "Enrolled",
    pricingLabelPending: "Complete payment on the Enroll page to unlock your referral code.",
  },
  errors: {
    generic: "Something went wrong. Try again.",
    unauthorized: "Please sign in to continue.",
    validation: "Check the form and try again.",
    network: "Could not reach the server.",
  },
  footer: {
    note: "Demo monorepo — replace mock payment with your gateway webhooks.",
  },
} as const;

export type Messages = typeof messages;
