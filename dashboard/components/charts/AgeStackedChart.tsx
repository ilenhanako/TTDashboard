"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { shortenCountryName, AGE_COLORS, AGE_GROUPS } from "@/lib/constants";
import { YearData } from "@/lib/types";

interface AgeStackedChartProps {
  yearData: YearData;
  worldAgeData?: Record<string, number>;
}

export function AgeStackedChart({ yearData, worldAgeData }: AgeStackedChartProps) {
  const countries = Object.keys(yearData.countries);
  const ageGroups = yearData.ageGroups || {};

  // Transform data: each country has percentage breakdown by age band
  // Data structure is: ageGroups[ageGroup][countryName] = percentage
  const chartData = countries.map((countryName) => {
    const row: Record<string, string | number> = {
      name: shortenCountryName(countryName),
    };

    // Get raw values
    let rawTotal = 0;
    AGE_GROUPS.forEach((band) => {
      rawTotal += ageGroups[band]?.[countryName] || 0;
    });

    // Normalize to exactly 100% to prevent floating point issues
    AGE_GROUPS.forEach((band) => {
      const rawValue = ageGroups[band]?.[countryName] || 0;
      row[band] = rawTotal > 0 ? (rawValue / rawTotal) * 100 : 0;
    });

    return row;
  });

  // Add world data if available
  if (worldAgeData) {
    const worldRow: Record<string, string | number> = { name: "World" };
    let worldTotal = 0;
    AGE_GROUPS.forEach((band) => {
      worldTotal += worldAgeData[band] || 0;
    });
    AGE_GROUPS.forEach((band) => {
      const rawValue = worldAgeData[band] || 0;
      worldRow[band] = worldTotal > 0 ? (rawValue / worldTotal) * 100 : 0;
    });
    chartData.push(worldRow);
  }

  // Dynamic height based on number of entries
  const chartHeight = Math.max(400, chartData.length * 28 + 60);

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
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#1F2328", fontSize: 11 }}
          axisLine={{ stroke: "#E1E4E8" }}
          width={70}
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
        {AGE_GROUPS.map((band, index) => (
          <Bar
            key={band}
            dataKey={band}
            stackId="age"
            fill={AGE_COLORS[index] || "#546E7A"}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
