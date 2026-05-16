/** Marketing / landing page content (CareerCraft AI accelerator). */

export const LANDING = {
  hero: {
    badge: "Cohort 4 · Live Saturdays",
    title: "Master Industry AI Tools in",
    titleAccent: "12 Weeks",
    subtitle:
      "Bridge the gap between college and industry. Built for Tier II & III students, freshers, and career switchers — no prerequisites.",
    poweredBy: "Powered by UniConnect · TechnoSpectra EdTech",
  },
  stats: [
    { value: "60+", label: "Live hours" },
    { value: "12 mo", label: "Recorded access" },
    { value: "89%", label: "Placement support*" },
    { value: "5", label: "Govt-backed certs" },
  ],
  tools: [
    "Power BI",
    "Excel",
    "SQL",
    "Canva",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Google Analytics",
    "LinkedIn AI",
    "Zapier",
  ],
  mentors: [
    "Flipkart",
    "CRED",
    "Amazon India",
    "Nykaa",
    "Google India",
    "TCS",
    "Myntra",
    "Deloitte",
  ],
  certifications: ["MSME", "Skill India", "BFSI", "ISO 9001:2015", "FICCI"],
  studentStories: {
    eyebrow: "Student stories",
    title: "Real results. Real people.",
    items: [
      {
        name: "Rahul Sharma",
        initials: "RS",
        avatarClass: "bg-rose-500",
        role: "BBA Graduate — Now: Analyst @ FinPe",
        quote:
          "CareerCraft gave me the tools I never learned in college. Got hired at FinPe within 2 months of completing the program.",
      },
      {
        name: "Anjali Kulkarni",
        initials: "AK",
        avatarClass: "bg-teal-500",
        role: "Commerce Graduate — Placed @ Delhivery",
        quote:
          "The live sessions and mentor network made all the difference. I went from confused to confident in 12 weeks.",
      },
      {
        name: "Priya Menon",
        initials: "PM",
        avatarClass: "bg-amber-500",
        role: "B.Com — Referral Agent + Analyst",
        quote:
          "Best investment of ₹5,000 I ever made. The referral program paid for my next month's rent!",
      },
    ],
  },
  certificationsSection: {
    title: "5 Government-Backed Certifications",
    subtitle: "Recognised by India's top organisations — every HR knows these logos.",
    badges: [
      { name: "MSME", icon: "🏛️" },
      { name: "Skill India", icon: "🇮🇳" },
      { name: "BFSI", icon: "🏦" },
      { name: "ISO 9001:2015", icon: "🔵" },
      { name: "FICCI", icon: "📋" },
    ],
  },
  phases: [
    {
      phase: "Phase 1",
      weeks: "Weeks 1–4",
      theme: "Digital Foundations",
      items: ["MS Office & Google Workspace", "Notion, Slack, Trello", "Professional email & LinkedIn"],
    },
    {
      phase: "Phase 2",
      weeks: "Weeks 5–9",
      theme: "Professional Skills",
      items: ["Canva & AI tools", "Prompt engineering", "Power BI & digital marketing"],
    },
    {
      phase: "Phase 3",
      weeks: "Weeks 10–12",
      theme: "Career Readiness",
      items: ["SQL & no-code automation", "ATS resume + LinkedIn AI", "Capstone demo day"],
    },
  ],
  schedule: {
    live: "Saturdays · 2:00 – 4:00 PM IST",
    note: "Recordings within 24 hours on the UniConnect app",
  },
  referral: {
    perReferral: "₹500",
    milestones: [
      { count: 50, reward: "Internship certificate" },
      { count: 100, reward: "Latest iPhone" },
      { count: 500, reward: "₹5,00,000 bonus" },
    ],
  },
  legal: {
    placementNote: "*Placement support for 6 months; outcomes vary by cohort and effort.",
    refund: "7-day full refund · Secure payments · No hidden charges",
  },
} as const;
