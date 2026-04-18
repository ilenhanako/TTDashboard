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
import { HEAT_COLORS } from "@/lib/heat-constants";
import { shortenCountryName } from "@/lib/constants";

interface GrowthData {
  country: string;
  growth: number;
  isASEAN: boolean;
}

interface GrowthChartProps {
  data: GrowthData[];
  height?: number;
}

export function GrowthChart({ data, height = 240 }: GrowthChartProps) {
  const chartData = data.map((d) => ({
    name: shortenCountryName(d.country),
    growth: d.growth,
    isASEAN: d.isASEAN,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#57606A", fontSize: 10 }}
          axisLine={{ stroke: "#E1E4E8" }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => `${v.toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, "Growth"]}
        />
        <Bar dataKey="growth" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.growth > 100 ? HEAT_COLORS.red : entry.growth > 50 ? HEAT_COLORS.heat1 : HEAT_COLORS.green}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
