"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DISEASE_CATEGORIES, CATEGORY_SHORT_NAMES, shortenCountryName } from "@/lib/constants";
import type { YearData } from "@/lib/types";

interface CompositionChartProps {
  yearData: YearData;
  colors: Record<string, string>;
  worldDiseaseMix?: Record<string, number>;
}

export function CompositionChart({ yearData, colors, worldDiseaseMix }: CompositionChartProps) {
  const countries = yearData.countries;

  // Build chart data: each country as a row with category percentages
  // Normalize percentages to ensure they sum to 100%
  const chartData = Object.entries(countries)
    .map(([name, data]) => {
      const row: Record<string, string | number> = {
        name: shortenCountryName(name),
      };

      // Calculate raw total to normalize
      let rawTotal = 0;
      DISEASE_CATEGORIES.forEach((cat) => {
        rawTotal += data.diseases[cat]?.pct || 0;
      });

      // Normalize each category
      DISEASE_CATEGORIES.forEach((cat) => {
        const rawPct = data.diseases[cat]?.pct || 0;
        row[CATEGORY_SHORT_NAMES[cat] || cat] = rawTotal > 0 ? (rawPct / rawTotal) * 100 : 0;
      });

      return row;
    })
    .sort((a, b) => {
      // Sort by NCD percentage (largest category)
      const ncdA = (a["NCDs"] as number) || 0;
      const ncdB = (b["NCDs"] as number) || 0;
      return ncdB - ncdA;
    });

  // Add World data if available
  if (worldDiseaseMix && Object.keys(worldDiseaseMix).length > 0) {
    const worldRow: Record<string, string | number> = { name: "World" };
    let worldTotal = 0;
    DISEASE_CATEGORIES.forEach((cat) => {
      worldTotal += worldDiseaseMix[cat] || 0;
    });
    DISEASE_CATEGORIES.forEach((cat) => {
      const rawPct = worldDiseaseMix[cat] || 0;
      worldRow[CATEGORY_SHORT_NAMES[cat] || cat] = worldTotal > 0 ? (rawPct / worldTotal) * 100 : 0;
    });
    chartData.push(worldRow);
  }

  // Dynamic height based on number of entries
  const chartHeight = Math.max(500, chartData.length * 32 + 60);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#1F2328", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, ""]}
        />
        <Legend />
        {DISEASE_CATEGORIES.map((cat) => (
          <Bar
            key={cat}
            dataKey={CATEGORY_SHORT_NAMES[cat] || cat}
            stackId="a"
            fill={colors[cat] || "#546E7A"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
