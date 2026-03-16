"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DISEASE_COLORS, CATEGORY_SHORT_NAMES } from "@/lib/constants";

interface PieChartProps {
  data: { name: string; value: number }[];
  compact?: boolean;
}

export function DiseaseCompositionPieChart({ data, compact = false }: PieChartProps) {
  const chartData = data.map((d) => ({
    name: CATEGORY_SHORT_NAMES[d.name] || d.name,
    fullName: d.name,
    value: d.value,
    color: DISEASE_COLORS[d.name] || "#546E7A",
  }));

  const height = compact ? 180 : 300;
  const innerRadius = compact ? 40 : 60;
  const outerRadius = compact ? 70 : 100;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          label={compact ? undefined : ({ name, value }) => `${name}: ${value.toFixed(1)}%`}
          labelLine={compact ? false : { stroke: "#57606A" }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            name,
          ]}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
