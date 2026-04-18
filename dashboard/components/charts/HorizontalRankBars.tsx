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

interface RankData {
  country: string;
  value: number;
  isASEAN: boolean;
}

interface HorizontalRankBarsProps {
  data: RankData[];
  title?: string;
  valueLabel?: string;
  valueFormatter?: (value: number) => string;
  height?: number;
}

export function HorizontalRankBars({
  data,
  title,
  valueLabel = "Value",
  valueFormatter = (v) => v.toFixed(1),
  height,
}: HorizontalRankBarsProps) {
  const chartData = data.map((d) => ({
    name: shortenCountryName(d.country),
    value: d.value,
    isASEAN: d.isASEAN,
  }));

  const chartHeight = height || Math.max(300, chartData.length * 30);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
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
          tick={{ fill: "#1F2328", fontSize: 11 }}
          axisLine={{ stroke: "#E1E4E8" }}
          width={75}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [valueFormatter(value), valueLabel]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isASEAN ? HEAT_COLORS.asean : HEAT_COLORS.nonAsean}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
