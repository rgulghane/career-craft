export type ToolBrand = {
  name: string;
  slug: string;
  /** Brand hex without # — used for icon tile background */
  color: string;
};

export const TOOL_BRANDS: ToolBrand[] = [
  { name: "Power BI", slug: "powerbi", color: "F2C811" },
  { name: "Excel", slug: "microsoftexcel", color: "217346" },
  { name: "SQL", slug: "postgresql", color: "4169E1" },
  { name: "Canva", slug: "canva", color: "00C4CC" },
  { name: "ChatGPT", slug: "openai", color: "412991" },
  { name: "Claude", slug: "anthropic", color: "CC9B7A" },
  { name: "Gemini", slug: "googlegemini", color: "8E75B2" },
  { name: "Google Analytics", slug: "googleanalytics", color: "E37400" },
  { name: "LinkedIn", slug: "linkedin", color: "0A66C2" },
  { name: "Zapier", slug: "zapier", color: "FF4A00" },
  { name: "Notion", slug: "notion", color: "000000" },
  { name: "Slack", slug: "slack", color: "4A154B" },
  { name: "Figma", slug: "figma", color: "F24E1E" },
  { name: "Python", slug: "python", color: "3776AB" },
  { name: "Tableau", slug: "tableau", color: "E97627" },
  { name: "GitHub", slug: "github", color: "181717" },
  { name: "HubSpot", slug: "hubspot", color: "FF7A59" },
  { name: "Jira", slug: "jira", color: "0052CC" },
];

export type ToolColumn = {
  top: ToolBrand;
  bottom: ToolBrand | null;
};

export function buildToolColumns(tools: ToolBrand[] = TOOL_BRANDS): ToolColumn[] {
  const columns: ToolColumn[] = [];
  for (let i = 0; i < tools.length; i += 2) {
    columns.push({
      top: tools[i]!,
      bottom: tools[i + 1] ?? null,
    });
  }
  return columns;
}

export function toolBrandIconUrl(slug: string): string {
  return `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
}
