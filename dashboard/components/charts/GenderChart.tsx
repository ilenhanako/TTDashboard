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
import { shortenCountryName } from "@/lib/constants";

interface GenderChartProps {
  genderData: {
    malePct: Record<string, number>;
    femalePct: Record<string, number>;
    malePopPct: Record<string, number>;
    femalePopPct: Record<string, number>;
  };
  countries: string[];
}

export function GenderChart({ genderData, countries }: GenderChartProps) {
  const chartData = countries.map((country) => ({
    name: shortenCountryName(country),
    "Male DALY%": genderData.malePct?.[country] || 0,
    "Female DALY%": genderData.femalePct?.[country] || 0,
    "Male Pop%": genderData.malePopPct?.[country] || 0,
    "Female Pop%": genderData.femalePopPct?.[country] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#1F2328", fontSize: 11 }}
          axisLine={{ stroke: "#E1E4E8" }}
          height={60}
          angle={-35}
          textAnchor="end"
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
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
        <Bar dataKey="Male DALY%" stackId="daly" fill="#3b82f6" />
        <Bar dataKey="Female DALY%" stackId="daly" fill="#ec4899" />
        <Bar dataKey="Male Pop%" stackId="pop" fill="#1d4ed8" />
        <Bar dataKey="Female Pop%" stackId="pop" fill="#be185d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
