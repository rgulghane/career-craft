/** Enroll page curriculum showcase — slides & copy. */

export const ENROLL_SHOWCASE = {
  title: "Your 12-week journey",
  subtitle: "Live Saturday classes · Recordings within 24 hours · Capstone demo day",
  slides: [
    {
      id: "foundations",
      phase: "Phase 1",
      weeks: "Weeks 1–4",
      title: "AI & Data Foundations",
      caption: "AI tools, prompt engineering, Excel, Python, and SQL for business decisions.",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Students collaborating on laptops in a classroom",
      tools: ["ChatGPT", "Claude AI", "Excel", "Python", "SQL"],
    },
    {
      id: "skills",
      phase: "Phase 2",
      weeks: "Weeks 5–8",
      title: "Analytics & Applied AI",
      caption: "Dashboards, visual storytelling, automation, and real industry case studies.",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Analytics dashboard on a computer screen",
      tools: ["Power BI", "Canva", "Make.com", "Case studies"],
    },
    {
      id: "career",
      phase: "Phase 3",
      weeks: "Weeks 9–12",
      title: "Career Launch",
      caption: "Personal branding, interview mastery, capstone portfolio, and placement activation.",
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
      imageAlt: "Professional team meeting in a modern office",
      tools: ["Teal HQ", "JAM & GD", "Portfolio", "LinkedIn"],
    },
  ],
} as const;
