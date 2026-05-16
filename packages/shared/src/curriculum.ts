/** 12-week program curriculum — week by week breakdown. */

export const CURRICULUM_PAGE = {
  eyebrow: "12-week accelerator",
  title: "Week by week curriculum",
  subtitle:
    "Live Saturday sessions, recordings within 24 hours, and hands-on projects from AI foundations through placement week.",
} as const;

export const CURRICULUM_WEEKS = [
  {
    week: 1,
    title: "AI Foundations & ChatGPT Mastery",
    tools: ["ChatGPT", "Claude AI", "Gemini"],
    description: "How LLMs work, prompting basics, AI landscape",
  },
  {
    week: 2,
    title: "Advanced Prompt Engineering",
    tools: ["Prompt Design", "Chain-of-Thought", "Few-Shot"],
    description: "Chain-of-thought, role prompting, prompt libraries",
  },
  {
    week: 3,
    title: "Excel for Data Analysis",
    tools: ["Microsoft Excel", "Power Query", "AI Formulas"],
    description: "VLOOKUP, Pivot Tables, AI-assisted formulas",
  },
  {
    week: 4,
    title: "SQL for Business Decisions",
    tools: ["SQL", "PostgreSQL", "BigQuery"],
    description: "JOINs, aggregations, real sales data",
  },
  {
    week: 5,
    title: "Power BI: Executive Dashboards",
    tools: ["Power BI", "DAX", "Power Query"],
    description: "DAX measures, live dashboards, storytelling",
  },
  {
    week: 6,
    title: "Design & Visual Storytelling (Canva)",
    tools: ["Canva", "Adobe Express", "Midjourney"],
    description: "Brand kits, infographics, AI-generated visuals",
  },
  {
    week: 7,
    title: "Generative AI & No-Code Automation",
    tools: ["Make.com", "Zapier", "Notion AI", "DALL-E"],
    description: "Workflow automation, document AI, no-code tools",
  },
  {
    week: 8,
    title: "Industry Case Studies: AI at Scale",
    tools: ["Case Study Method", "Miro", "Google Slides"],
    description: "Flipkart, CRED, Amazon — real AI use cases",
  },
  {
    week: 9,
    title: "Resume & LinkedIn Built with AI",
    tools: ["Kickresume", "Teal HQ", "LinkedIn AI"],
    description: "ATS-optimised resume, LinkedIn that recruits you",
  },
  {
    week: 10,
    title: "Interview Prep with AI Mock Sessions",
    tools: ["Interview AI", "Pramp", "ChatGPT"],
    description: "Answer frameworks, AI-powered mock interviews",
  },
  {
    week: 11,
    title: "Capstone Project — Full Industry Build",
    tools: ["Power BI", "SQL", "Canva", "ChatGPT"],
    description: "End-to-end analytics + AI project, mentor review",
  },
  {
    week: 12,
    title: "Placement Week & Career Activation",
    tools: ["LinkedIn", "Naukri", "Internshala"],
    description: "Referrals, job alerts, alumni network launch",
  },
] as const;
