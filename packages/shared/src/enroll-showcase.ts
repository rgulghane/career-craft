/** Enroll page curriculum showcase — slides & copy. */

export const ENROLL_SHOWCASE = {
  title: "Your 12-week journey",
  subtitle: "Live Saturday classes · Recordings within 24 hours · Capstone demo day",
  slides: [
    {
      id: "foundations",
      phase: "Phase 1",
      weeks: "Weeks 1–4",
      title: "Digital Foundations",
      caption: "Master workplace tools before you touch analytics or AI.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Students collaborating on laptops in a classroom",
      tools: ["MS Office", "Google Workspace", "Notion", "Slack", "LinkedIn"],
    },
    {
      id: "skills",
      phase: "Phase 2",
      weeks: "Weeks 5–9",
      title: "Professional Skills",
      caption: "Design, automate, and present like an industry analyst.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Analytics dashboard on a computer screen",
      tools: ["Canva", "ChatGPT", "Power BI", "Prompt engineering"],
    },
    {
      id: "career",
      phase: "Phase 3",
      weeks: "Weeks 10–12",
      title: "Career Readiness",
      caption: "Ship a capstone, polish your profile, and practice interviews.",
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Professional team meeting in a modern office",
      tools: ["SQL", "Zapier", "ATS resume", "LinkedIn AI"],
    },
  ],
} as const;
