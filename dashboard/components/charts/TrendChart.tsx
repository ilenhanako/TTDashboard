"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { shortenCountryName } from "@/lib/constants";

// Predefined colors for lines
const LINE_COLORS = [
  "#003366",
  "#0066CC",
  "#70AD47",
  "#C00000",
  "#FFC000",
  "#7030A0",
  "#9B59B6",
  "#546E7A",
  "#ef4444",
  "#22c55e",
  "#3b82f6",
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
];

interface TrendChartProps {
  data: Record<string, Record<string, number>>; // entity -> year -> value
  years: string[];
  colors?: Record<string, string>;
  formatLabel?: (label: string) => string;
}

export function TrendChart({
  data,
  years,
  colors = {},
  formatLabel = (l) => l,
}: TrendChartProps) {
  const entities = Object.keys(data);

  // Transform data for Recharts: [{ year: "2021", Entity1: val, Entity2: val }, ...]
  const chartData = years
    .slice()
    .sort()
    .map((year) => {
      const row: Record<string, string | number> = { year };
      entities.forEach((entity) => {
        row[formatLabel(entity)] = data[entity]?.[year] || 0;
      });
      return row;
    });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#1F2328", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [
            typeof value === "number"
              ? value >= 1000
                ? `${(value / 1000).toFixed(1)}k`
                : value.toFixed(1)
              : value,
            "",
          ]}
        />
        <Legend />
        {entities.map((entity, index) => {
          const label = formatLabel(entity);
          const color = colors[label] || colors[entity] || LINE_COLORS[index % LINE_COLORS.length];
          return (
            <Line
              key={entity}
              type="monotone"
              dataKey={label}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
