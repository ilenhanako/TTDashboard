"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AGE_GROUPS, AGE_COLORS } from "@/lib/constants";

interface AgeChartProps {
  data: Record<string, number>;
}

export function AgeChart({ data }: AgeChartProps) {
  const chartData = AGE_GROUPS.map((age, index) => ({
    name: age,
    value: data[age] || 0,
    color: AGE_COLORS[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#1F2328", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "% of DALYs"]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
