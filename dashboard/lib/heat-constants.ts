// Heat Index Dashboard constants

export const HEAT_COLORS = {
  heat1: "#ff6b35", // Primary accent (orange)
  heat2: "#f7c59f", // Secondary heat (light orange)
  asean: "#38bdf8", // ASEAN blue
  nonAsean: "#a78bfa", // Non-ASEAN purple
  green: "#4ade80", // Low/good
  red: "#f87171", // High/warning
} as const;

// Line colors for multi-country chart
export const HEAT_LINE_COLORS = [
  "#ff6b35", // orange
  "#38bdf8", // blue
  "#4ade80", // green
  "#f87171", // red
  "#a78bfa", // purple
  "#fbbf24", // yellow
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#84cc16", // lime
  "#f97316", // orange alt
  "#3b82f6", // blue alt
  "#8b5cf6", // violet
  "#10b981", // emerald
  "#ef4444", // red alt
  "#6366f1", // indigo
];

// World Bank API endpoint for Heat Index 35
export const HEAT_API_URL =
  "https://api.worldbank.org/v2/country/BGD;BRN;KHM;CHN;IND;IDN;JPN;LAO;MYS;MMR;PHL;THA;KOR;SGP;VNM/indicator/EN.CLC.HEAT.XD?format=json&per_page=1000";

// Decades for analysis
export const DECADES = ["1970s", "1980s", "1990s", "2000s", "2010s"] as const;

// Helper to get decade from year
export function getDecade(year: number): string {
  const decadeStart = Math.floor(year / 10) * 10;
  return `${decadeStart}s`;
}
