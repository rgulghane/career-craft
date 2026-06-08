/** 12-week program curriculum — week by week breakdown. */

export const CURRICULUM_PAGE = {
  eyebrow: "12-week AI & business analytics program",
  title: "Week by week curriculum",
  subtitle:
    "Live Saturday sessions, recordings within 24 hours, and hands-on projects from AI tools through career launch.",
} as const;

export const CURRICULUM_WEEKS = [
  {
    week: 1,
    title: "Introduction to AI Tools & Professional Digital Presence",
    tools: ["ChatGPT", "Claude AI", "Gemini", "LinkedIn Setup"],
    description: "How LLMs work, prompting basics, AI landscape",
    details: {
      liveSession: "Saturday · 2 hrs · Foundations lab",
      topics: [
        "How ChatGPT, Claude & Gemini differ and when to use each",
        "Setting up your professional LinkedIn profile from scratch",
        "Writing your first AI prompts for real academic & career tasks",
        "Responsible AI use: fact-checking, bias & attribution habits",
      ],
      handsOn:
        "Set up LinkedIn profile + run the same task across ChatGPT, Claude & Gemini and compare outputs.",
      deliverable: "Completed LinkedIn profile + 1-page AI tool comparison report",
    },
  },
  {
    week: 2,
    title: "Mastering Prompt Engineering for Real World Workflows",
    tools: ["Prompt Design", "Chain-of-Thought", "Few-Shot"],
    description: "Chain-of-thought, role prompting, prompt libraries",
    details: {
      liveSession: "Saturday · 2 hrs · Prompt workshop",
      topics: [
        "Anatomy of a great prompt: role, context, format & constraints",
        "Chain-of-thought prompting for multi-step business problems",
        "Few-shot examples to dramatically improve output quality",
        "Building a reusable prompt library for everyday work tasks",
      ],
      handsOn:
        "Build a 10-prompt library covering emails, reports, data summaries & research briefs.",
      deliverable: "Personal prompt library doc with before/after output samples",
    },
  },
  {
    week: 3,
    title: "Data Analysis with Excel & Python Fundamentals",
    tools: ["Microsoft Excel", "Power Query", "AI Formulas", "Python Basics"],
    description: "VLOOKUP, Pivot Tables, Python basics, AI-assisted formulas",
    details: {
      liveSession: "Saturday · 2 hrs · Data sprint",
      topics: [
        "VLOOKUP, XLOOKUP & pivot tables for business datasets",
        "Power Query: automating data cleaning & transformation",
        "Python basics: variables, loops & pandas for data analysis",
        "Using AI Copilot to generate and debug formulas & code",
      ],
      handsOn:
        "Clean a messy sales dataset in Excel + write a Python script to summarise revenue by region.",
      deliverable: "Excel workbook with 3 pivots + Python notebook with revenue summary",
    },
  },
  {
    week: 4,
    title: "SQL for Data-Driven Business Decision Making",
    tools: ["SQL", "PostgreSQL", "BigQuery"],
    description: "JOINs, aggregations, window functions, real sales data",
    details: {
      liveSession: "Saturday · 2 hrs · SQL lab",
      topics: [
        "SELECT, WHERE, GROUP BY & ORDER BY for business queries",
        "INNER & LEFT JOINs to connect customer, sales & product tables",
        "Window functions: RANK, ROW_NUMBER & running totals",
        "Running queries on BigQuery with real e-commerce datasets",
      ],
      handsOn:
        "Answer 8 business questions on a PostgreSQL retail database — churn, AOV, top products.",
      deliverable: "SQL script file + annotated screenshot of key query results",
    },
  },
  {
    week: 5,
    title: "Business Intelligence & Executive Dashboard Design",
    tools: ["Power BI", "DAX", "Power Query"],
    description: "DAX measures, live dashboards, executive storytelling",
    details: {
      liveSession: "Saturday · 2 hrs · Dashboard build",
      topics: [
        "Connecting Power BI to SQL & Excel data sources",
        "DAX measures: SUM, CALCULATE, DIVIDE & time intelligence",
        "Designing executive dashboards: KPI tiles, slicers & drill-through",
        "Publishing & sharing live dashboards with stakeholders",
      ],
      handsOn:
        "Build a 4-KPI executive dashboard from a sales dataset with regional drill-through.",
      deliverable: "Power BI .pbix file + 2-min recorded walkthrough of your dashboard",
    },
  },
  {
    week: 6,
    title: "Visual Storytelling & AI-Powered Design for Business",
    tools: ["Canva", "Adobe Express", "Midjourney"],
    description: "Brand kits, infographics, AI-generated visuals",
    details: {
      liveSession: "Saturday · 2 hrs · Design studio",
      topics: [
        "Building brand kits & visual systems in Canva for business use",
        "Designing data infographics that tell a clear story",
        "Using Adobe Express for social, email & presentation assets",
        "AI image generation with Midjourney for decks & campaigns",
      ],
      handsOn:
        "Design a 5-slide pitch deck with a Canva brand kit + one Midjourney-generated hero visual.",
      deliverable: "Canva pitch deck (5 slides) + 3 exported social/presentation PNGs",
    },
  },
  {
    week: 7,
    title: "Workflow Automation & No-Code AI Productivity Systems",
    tools: ["Make.com", "Zapier", "Notion AI", "DALL-E"],
    description: "Workflow automation, document AI, no-code productivity",
    details: {
      liveSession: "Saturday · 2 hrs · Automation lab",
      topics: [
        "Building trigger → action workflows in Make.com & Zapier",
        "Connecting Gmail, Sheets, Slack & Forms without code",
        "Notion AI for meeting notes, task management & SOPs",
        "DALL-E for generating quick visual assets in workflows",
      ],
      handsOn:
        "Build a Make.com automation: form response → Notion task → DALL-E image → Slack notification.",
      deliverable: "Live automation screenshot + workflow diagram with all steps labelled",
    },
  },
  {
    week: 8,
    title: "Applied AI in Industry — Real-World Case Study Analysis",
    tools: ["Case Study Method", "Miro", "Google Slides"],
    description: "Flipkart, CRED, Amazon — dissecting real AI strategies",
    details: {
      liveSession: "Saturday · 2 hrs · Case jam",
      topics: [
        "Case study method: problem → data → insight → recommendation",
        "How Flipkart uses AI for demand forecasting & personalisation",
        "CRED & Amazon: AI-driven growth loops and decision systems",
        "Mapping findings on Miro & presenting on Google Slides",
      ],
      handsOn:
        "Group case jam: analyse a real Indian startup's AI strategy on Miro, present 5-slide deck on Google Slides.",
      deliverable: "Case study deck (max 6 slides) + Miro board screenshot + peer scores",
    },
  },
  {
    week: 9,
    title: "AI-Powered Personal Branding, Resume & Career Positioning",
    tools: ["Teal HQ", "JAM — Just A Minute", "Picture Presentation", "Bootcamp"],
    description: "ATS resume, LinkedIn brand, AI-powered career tools",
    details: {
      liveSession: "Saturday · 2 hrs · Personal brand clinic",
      topics: [
        "Building an ATS-friendly resume using Teal HQ & AI assistance",
        "JAM (Just A Minute) — 60-sec structured speaking for communication development",
        "Picture Presentation: visual storytelling for your career profile",
        "Bootcamp-style peer critique & rapid resume iteration",
      ],
      handsOn:
        "Rebuild resume in Teal HQ + deliver a JAM (Just A Minute) self-intro to the cohort + create a Picture Presentation slide.",
      deliverable:
        "ATS-optimised PDF resume + JAM (Just A Minute) script + LinkedIn featured visual card",
    },
  },
  {
    week: 10,
    title: "Interview Mastery — AI Mock Drills, GD & Communication",
    tools: ["Interview AI", "J5M — Just 5 Minutes", "GD"],
    description: "AI mock drills, group discussion, STAR frameworks",
    details: {
      liveSession: "Saturday · 2 hrs · Mock interview day",
      topics: [
        "STAR framework for behavioural & situational answers",
        "J5M (Just 5 Minutes) — structured 5-min talk for communication development",
        "AI-powered mock interview drills with instant feedback",
        "Group Discussion (GD): structuring arguments & turn-taking strategy",
      ],
      handsOn:
        "Two AI mock rounds + one J5M (Just 5 Minutes) structured talk + live GD session with cohort peers.",
      deliverable:
        "Interview answer bank (5 STAR stories) + J5M (Just 5 Minutes) script + GD self-assessment",
    },
  },
  {
    week: 11,
    title: "Capstone Project — End-to-End Industry Build & Portfolio",
    tools: ["Project Pipeline", "Portfolio Showcase"],
    description: "Full industry project: data → insight → story → portfolio",
    details: {
      liveSession: "Saturday · 2 hrs · Capstone review",
      topics: [
        "Scoping a real business problem with a north-star success metric",
        "End-to-end project pipeline: data → analysis → viz → narrative",
        "Packaging your work into a Portfolio Showcase for employers",
        "Peer review rubric: clarity, depth, design & business impact",
      ],
      handsOn:
        "Submit capstone project v1 through Pipeline; receive mentor comments; iterate for demo day showcase.",
      deliverable: "Capstone deck + live portfolio link + 8-minute demo video",
    },
  },
  {
    week: 12,
    title: "Career Launch — Placements, Network & Industry Activation",
    tools: ["LinkedIn", "Naukri", "Internshala"],
    description: "Placements, referrals, job alerts, alumni network",
    details: {
      liveSession: "Saturday · 2 hrs · Placement kickoff",
      topics: [
        "Setting up smart job alerts on LinkedIn, Naukri & Internshala",
        "Warm outreach scripts that get replies from recruiters & alumni",
        "Leveraging the alumni referral network for priority interviews",
        "30-60-90 day post-program placement action plan",
      ],
      handsOn:
        "Apply to 5 curated roles on Naukri/Internshala + send 3 personalised LinkedIn outreach messages live.",
      deliverable: "Placement tracker sheet + 30-day outreach & application action plan",
    },
  },
] as const;
