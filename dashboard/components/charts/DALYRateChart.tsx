"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { shortenCountryName } from "@/lib/constants";

interface DALYRateChartProps {
  data: { name: string; rate: number }[];
  worldDalyRate: number;
  includeWorld?: boolean;
}

export function DALYRateChart({ data, worldDalyRate, includeWorld = true }: DALYRateChartProps) {
  let chartData = data
    .map((d) => ({
      name: shortenCountryName(d.name),
      rate: d.rate,
      isWorld: false,
    }))
    .sort((a, b) => b.rate - a.rate);

  // Add World as a separate bar if requested
  if (includeWorld) {
    chartData = [
      ...chartData,
      { name: "World", rate: worldDalyRate, isWorld: true },
    ].sort((a, b) => b.rate - a.rate);
  }

  // Dynamic height based on number of countries
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
          formatter={(value: number) => [`${value.toFixed(1)}/1,000`, "DALY Rate"]}
        />
        <ReferenceLine
          x={worldDalyRate}
          stroke="#0066CC"
          strokeDasharray="5 5"
          label={{
            value: `World Avg: ${worldDalyRate.toFixed(1)}`,
            position: "top",
            fill: "#0066CC",
            fontSize: 11,
          }}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.isWorld
                  ? "#6366F1" // Purple for World
                  : entry.rate > worldDalyRate
                    ? "#CF222E" // Red if above world
                    : "#0066CC" // Blue if below world
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
