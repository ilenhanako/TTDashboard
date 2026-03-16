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
import { WORLD_DALY_RATE, shortenCountryName } from "@/lib/constants";

interface DALYRateChartProps {
  data: { name: string; rate: number }[];
}

export function DALYRateChart({ data }: DALYRateChartProps) {
  const chartData = data
    .map((d) => ({
      name: shortenCountryName(d.name),
      rate: d.rate,
    }))
    .sort((a, b) => b.rate - a.rate);

  return (
    <ResponsiveContainer width="100%" height={400}>
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
          formatter={(value: number) => [`${value.toFixed(0)}/1000`, "DALY Rate"]}
        />
        <ReferenceLine
          x={WORLD_DALY_RATE}
          stroke="#0066CC"
          strokeDasharray="5 5"
          label={{
            value: `World: ${WORLD_DALY_RATE}`,
            position: "top",
            fill: "#0066CC",
            fontSize: 11,
          }}
        />
        <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.rate > WORLD_DALY_RATE ? "#CF222E" : "#0066CC"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
