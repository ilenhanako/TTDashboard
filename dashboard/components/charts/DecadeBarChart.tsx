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
import { HEAT_COLORS } from "@/lib/heat-constants";

interface DecadeData {
  decade: string;
  asean: number;
  nonAsean: number;
}

interface DecadeBarChartProps {
  data: DecadeData[];
  height?: number;
}

export function DecadeBarChart({ data, height = 240 }: DecadeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="decade"
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
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
        />
        <Legend
          wrapperStyle={{ paddingTop: "5px" }}
          formatter={(value) => <span style={{ color: "#1F2328", fontSize: 12 }}>{value}</span>}
        />
        <Bar dataKey="asean" name="ASEAN" fill={HEAT_COLORS.asean} radius={[4, 4, 0, 0]} />
        <Bar dataKey="nonAsean" name="Non-ASEAN" fill={HEAT_COLORS.nonAsean} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
