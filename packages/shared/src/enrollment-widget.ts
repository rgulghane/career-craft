/** Copy & config for the enrollment pricing card (matches product spec). */

export const ENROLLMENT_WIDGET = {
  listPriceInRupees: 10_000, // after deadline
  emiMonths: 12,
  cohortLabel: "2026 Summer batch",
  seats: { total: 200, remaining: 27 },
  viewingCount: {
    initial: 47,
    min: 20,
    max: 80,
    /** Random tick interval (ms) — short enough to feel live. */
    updateEveryMs: { min: 4_000, max: 11_000 },
  },
  highlightsHeading: "Program Highlights",
  highlights: [
    {
      icon: "🎓",
      title: "College-Friendly",
      description:
        "12 weeks of weekend, part-time classes designed to fit around your degree. 100% online.",
    },
    {
      icon: "🚀",
      title: "Master 15+ Modern Tools",
      description:
        "Learn fresh 2026 tech — build websites via chat, create custom AI assistants, and generate AI videos.",
    },
    {
      icon: "🌐",
      title: "For Every Field",
      description:
        "Universal AI, design, and data skills built for all backgrounds, not just engineering.",
    },
    {
      icon: "🛠️",
      title: "Learn by Doing",
      description:
        "Build a practical portfolio through weekly assignments and a personalized Capstone Project.",
    },
    {
      icon: "🏆",
      title: "UniConnect Gold Certificate",
      description:
        "Graduate with an industry-recognized credential that proves your skills.",
    },
    {
      icon: "💼",
      title: "500+ Career Opportunities",
      description:
        "Get exclusive access to internships and jobs across 100+ partner companies.",
    },
    {
      icon: "🤝",
      title: "Ongoing Mentorship",
      description:
        "Dedicated handholding and advanced upskilling support for your career outcomes.",
    },
  ],
  trust: "Secure payment · 30-day no-questions-asked refund",
  referralPlaceholder: "e.g. ABC123",
} as const;
