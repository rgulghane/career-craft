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
    details: {
      liveSession: "Saturday · 2 hrs · Foundations lab",
      topics: [
        "What LLMs are and how they differ from search engines",
        "Writing your first effective prompts (role, context, constraints)",
        "Comparing ChatGPT, Claude, and Gemini on the same task",
        "Responsible AI: hallucinations, privacy, and verification habits",
      ],
      handsOn: "Build a personal AI assistant prompt pack for college assignments and internships.",
      deliverable: "10-prompt library + 1-page AI use policy for your portfolio",
    },
  },
  {
    week: 2,
    title: "Advanced Prompt Engineering",
    tools: ["Prompt Design", "Chain-of-Thought", "Few-Shot"],
    description: "Chain-of-thought, role prompting, prompt libraries",
    details: {
      liveSession: "Saturday · 2 hrs · Prompt workshop",
      topics: [
        "Chain-of-thought and step-by-step reasoning prompts",
        "Few-shot examples that improve output quality",
        "Role stacking: analyst, editor, and critic in one workflow",
        "Saving and versioning prompts in a shared team library",
      ],
      handsOn: "Automate a weekly report: raw notes → structured summary → executive slide bullets.",
      deliverable: "Reusable prompt chain template with before/after samples",
    },
  },
  {
    week: 3,
    title: "Excel for Data Analysis",
    tools: ["Microsoft Excel", "Power Query", "AI Formulas"],
    description: "VLOOKUP, Pivot Tables, AI-assisted formulas",
    details: {
      liveSession: "Saturday · 2 hrs · Spreadsheet sprint",
      topics: [
        "VLOOKUP, XLOOKUP, and INDEX-MATCH for joining datasets",
        "Pivot tables and slicers for sales-style dashboards",
        "Power Query: clean messy CSV exports in minutes",
        "Using Copilot / AI formulas to speed up repetitive tasks",
      ],
      handsOn: "Analyse a sample e-commerce export: revenue by city, top SKUs, refund rate.",
      deliverable: "Excel workbook with 3 pivots + short insights memo",
    },
  },
  {
    week: 4,
    title: "SQL for Business Decisions",
    tools: ["SQL", "PostgreSQL", "BigQuery"],
    description: "JOINs, aggregations, real sales data",
    details: {
      liveSession: "Saturday · 2 hrs · SQL lab",
      topics: [
        "SELECT, WHERE, GROUP BY, and ORDER BY patterns",
        "INNER vs LEFT JOINs with a star-schema mindset",
        "Window functions intro (RANK, running totals)",
        "Writing queries a hiring manager would expect in interviews",
      ],
      handsOn: "Answer 8 business questions on a mock retail database (cohort retention, AOV, etc.).",
      deliverable: "SQL script file + screenshot of key result tables",
    },
  },
  {
    week: 5,
    title: "Power BI: Executive Dashboards",
    tools: ["Power BI", "DAX", "Power Query"],
    description: "DAX measures, live dashboards, storytelling",
    details: {
      liveSession: "Saturday · 2 hrs · Dashboard build",
      topics: [
        "Data model basics: facts, dimensions, and relationships",
        "DAX measures: SUM, CALCULATE, and time intelligence intro",
        "Design principles for executive one-pagers",
        "Publishing and sharing read-only dashboards",
      ],
      handsOn: "Create a 4-tile KPI dashboard with drill-through on regional performance.",
      deliverable: "Power BI .pbix + 2-minute Loom-style walkthrough script",
    },
  },
  {
    week: 6,
    title: "Design & Visual Storytelling (Canva)",
    tools: ["Canva", "Adobe Express", "Midjourney"],
    description: "Brand kits, infographics, AI-generated visuals",
    details: {
      liveSession: "Saturday · 2 hrs · Design studio",
      topics: [
        "Brand kits, typography, and colour systems in Canva",
        "Infographics that explain data to non-technical stakeholders",
        "AI image generation for presentations (dos and don'ts)",
        "Export formats for LinkedIn, decks, and print",
      ],
      handsOn: "Design a 5-slide pitch deck visual system for your capstone topic.",
      deliverable: "Canva template link + 3 exported slide PNGs",
    },
  },
  {
    week: 7,
    title: "Generative AI & No-Code Automation",
    tools: ["Make.com", "Zapier", "Notion AI", "DALL-E"],
    description: "Workflow automation, document AI, no-code tools",
    details: {
      liveSession: "Saturday · 2 hrs · Automation lab",
      topics: [
        "Trigger → action workflows in Zapier / Make",
        "Connecting Gmail, Sheets, and Slack without code",
        "Notion AI for meeting notes and task extraction",
        "When to automate vs when to keep humans in the loop",
      ],
      handsOn: "Build an automation: form submission → sheet row → AI summary email to team.",
      deliverable: "Working automation screenshot + flow diagram",
    },
  },
  {
    week: 8,
    title: "Industry Case Studies: AI at Scale",
    tools: ["Case Study Method", "Miro", "Google Slides"],
    description: "Flipkart, CRED, Amazon — real AI use cases",
    details: {
      liveSession: "Saturday · 2 hrs · Case jam",
      topics: [
        "How Flipkart uses ML for demand forecasting (simplified)",
        "CRED-style growth loops and data-driven experiments",
        "Amazon leadership principles applied to analytics stories",
        "Framework: problem → metric → analysis → recommendation",
      ],
      handsOn: "Break into groups; present a 5-minute case recommendation with one chart.",
      deliverable: "Case slide deck (max 6 slides) + peer feedback scores",
    },
  },
  {
    week: 9,
    title: "Resume & LinkedIn Built with AI",
    tools: ["Kickresume", "Teal HQ", "LinkedIn AI"],
    description: "ATS-optimised resume, LinkedIn that recruits you",
    details: {
      liveSession: "Saturday · 2 hrs · Personal brand clinic",
      topics: [
        "ATS-friendly resume structure for freshers and switchers",
        "Quantifying impact when you have limited work experience",
        "LinkedIn headline, About, and featured section optimisation",
        "AI-assisted tailoring per job description (ethically)",
      ],
      handsOn: "Rewrite resume + LinkedIn for one target role (analyst / marketing / ops).",
      deliverable: "PDF resume + public LinkedIn checklist (self-reviewed)",
    },
  },
  {
    week: 10,
    title: "Interview Prep with AI Mock Sessions",
    tools: ["Interview AI", "Pramp", "ChatGPT"],
    description: "Answer frameworks, AI-powered mock interviews",
    details: {
      liveSession: "Saturday · 2 hrs · Mock interview day",
      topics: [
        "STAR and CAR frameworks for behavioural questions",
        "SQL / Excel / case prompts common in analyst interviews",
        "Using AI as a mock interviewer (and spotting weak answers)",
        "Salary negotiation and follow-up email templates",
      ],
      handsOn: "Two 15-minute mock rounds with mentor feedback and recording review.",
      deliverable: "Interview Q&A doc with your best 2 STAR stories",
    },
  },
  {
    week: 11,
    title: "Capstone Project — Full Industry Build",
    tools: ["Power BI", "SQL", "Canva", "ChatGPT"],
    description: "End-to-end analytics + AI project, mentor review",
    details: {
      liveSession: "Saturday · 2 hrs · Capstone review",
      topics: [
        "Scoping a business problem with a clear north-star metric",
        "End-to-end pipeline: ingest → model → viz → narrative",
        "Peer review rubric: clarity, rigour, and design",
        "Preparing for demo day presentation structure",
      ],
      handsOn: "Submit capstone v1; receive mentor comments; iterate for demo day.",
      deliverable: "Capstone repo / deck + 8-minute demo recording",
    },
  },
  {
    week: 12,
    title: "Placement Week & Career Activation",
    tools: ["LinkedIn", "Naukri", "Internshala"],
    description: "Referrals, job alerts, alumni network launch",
    details: {
      liveSession: "Saturday · 2 hrs · Placement kickoff",
      topics: [
        "How placement support works for 6 months post-cohort",
        "Job board hygiene: alerts, trackers, and weekly targets",
        "Warm outreach scripts that get replies",
        "Alumni network intro and referral program recap ritesh",
      ],
      handsOn: "Set up job alerts, apply to 5 curated roles, schedule 2 informational chats.",
      deliverable: "Placement tracker sheet + 30-day action plan",
    },
  },
] as const;
