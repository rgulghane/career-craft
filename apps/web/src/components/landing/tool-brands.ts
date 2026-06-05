export type ToolBrand = {
  name: string;
  slug: string;
  /** Brand hex without # — used for icon tile background */
  color: string;
  /** Short line shown on landing tool cards */
  description: string;
};

export const TOOL_BRANDS: ToolBrand[] = [
  {
    name: "Power BI",
    slug: "powerbi",
    color: "F2C811",
    description: "Turn raw data into interactive dashboards and KPI reports that hiring teams expect in analyst and business roles.",
  },
  {
    name: "Excel",
    slug: "microsoftexcel",
    color: "217346",
    description: "Clean messy spreadsheets, build formulas, and analyse numbers—the everyday skill behind finance, ops, and business jobs.",
  },
  {
    name: "SQL",
    slug: "postgresql",
    color: "4169E1",
    description: "Pull answers from databases with queries, filters, and joins—the foundation of data-driven decision making at work.",
  },
  {
    name: "Canva",
    slug: "canva",
    color: "00C4CC",
    description: "Create polished slides, social posts, and visual decks quickly, even if you are not a trained designer.",
  },
  {
    name: "ChatGPT",
    slug: "openai",
    color: "412991",
    description: "Draft emails, summarise research, brainstorm ideas, and automate repetitive tasks with practical prompt workflows.",
  },
  {
    name: "Claude",
    slug: "anthropic",
    color: "CC9B7A",
    description: "Handle long documents, structured analysis, and thoughtful writing when you need depth beyond a quick chat reply.",
  },
  {
    name: "Gemini",
    slug: "googlegemini",
    color: "8E75B2",
    description: "Use Google’s AI inside Docs, Sheets, and search to speed up research, writing, and everyday workplace tasks.",
  },
  {
    name: "Google Analytics",
    slug: "googleanalytics",
    color: "E37400",
    description: "Track website traffic, user behaviour, and campaign performance so you can speak confidently about digital results.",
  },
  {
    name: "LinkedIn",
    slug: "linkedin",
    color: "0A66C2",
    description: "Build a credible professional profile, grow your network, and get discovered by recruiters and hiring managers.",
  },
  {
    name: "Zapier",
    slug: "zapier",
    color: "FF4A00",
    description: "Connect apps and automate handoffs between tools without writing code—ideal for ops, marketing, and admin work.",
  },
  {
    name: "Notion",
    slug: "notion",
    color: "000000",
    description: "Organise notes, project plans, and team wikis in one workspace that startups and modern companies rely on daily.",
  },
  {
    name: "Slack",
    slug: "slack",
    color: "4A154B",
    description: "Collaborate with teams in channels, share files, and keep projects moving—the communication hub in most workplaces.",
  },
  {
    name: "Figma",
    slug: "figma",
    color: "F24E1E",
    description: "Design interfaces, wireframes, and clickable prototypes used by product, marketing, and UX teams worldwide.",
  },
  {
    name: "Python",
    slug: "python",
    color: "3776AB",
    description: "Automate repetitive work, wrangle datasets, and build small scripts that make you faster in analytics-heavy roles.",
  },
  {
    name: "Tableau",
    slug: "tableau",
    color: "E97627",
    description: "Explore data visually, spot trends, and present insights in executive-ready charts and interactive stories.",
  },
  {
    name: "GitHub",
    slug: "github",
    color: "181717",
    description: "Store projects, track changes, and showcase your work—the standard portfolio and collaboration platform for builders.",
  },
  {
    name: "HubSpot",
    slug: "hubspot",
    color: "FF7A59",
    description: "Manage leads, email campaigns, and customer pipelines in the CRM stack used by growth and sales teams.",
  },
  {
    name: "Jira",
    slug: "jira",
    color: "0052CC",
    description: "Plan sprints, track tasks, and ship work on time in agile teams across tech, product, and project management.",
  },
];

export type ToolColumn = {
  top: ToolBrand;
  bottom: ToolBrand | null;
};

export function buildToolColumns(tools: ToolBrand[] = TOOL_BRANDS): ToolColumn[] {
  return tools.map((tool) => ({ top: tool, bottom: null }));
}

export function toolBrandIconUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
}
