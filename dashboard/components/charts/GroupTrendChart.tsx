"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HEAT_COLORS } from "@/lib/heat-constants";

interface GroupTrendData {
  year: number;
  asean: number;
  nonAsean: number;
}

interface GroupTrendChartProps {
  data: GroupTrendData[];
  height?: number;
}

export function GroupTrendChart({ data, height = 280 }: GroupTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#57606A", fontSize: 11 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => (v % 10 === 0 ? v.toString() : "")}
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) => v.toFixed(0)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [value.toFixed(1), ""]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Legend
          wrapperStyle={{ paddingTop: "10px" }}
          formatter={(value) => <span style={{ color: "#1F2328", fontSize: 12 }}>{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="asean"
          name="ASEAN Avg"
          stroke={HEAT_COLORS.asean}
          fill={HEAT_COLORS.asean}
          fillOpacity={0.3}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="nonAsean"
          name="Non-ASEAN Avg"
          stroke={HEAT_COLORS.nonAsean}
          fill={HEAT_COLORS.nonAsean}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
