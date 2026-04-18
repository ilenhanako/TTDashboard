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
import { HEAT_LINE_COLORS } from "@/lib/heat-constants";
import { shortenCountryName } from "@/lib/constants";

interface TimeSeriesData {
  [country: string]: { year: number; value: number }[];
}

interface MultiLineChartProps {
  data: TimeSeriesData;
  selectedCountries: string[];
  height?: number;
  formatYAxis?: (value: number) => string;
}

export function MultiLineChart({
  data,
  selectedCountries,
  height = 380,
  formatYAxis = (v) => v.toFixed(0),
}: MultiLineChartProps) {
  // Build chart data: [{ year: 1970, Country1: val, Country2: val }, ...]
  const years = new Set<number>();
  Object.values(data).forEach((series) => {
    series.forEach((point) => years.add(point.year));
  });

  const sortedYears = Array.from(years).sort((a, b) => a - b);

  const chartData = sortedYears.map((year) => {
    const row: Record<string, number | string> = { year };
    selectedCountries.forEach((country) => {
      const series = data[country];
      const point = series?.find((p) => p.year === year);
      if (point) {
        row[shortenCountryName(country)] = point.value;
      }
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
          tickFormatter={formatYAxis}
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
          formatter={(value) => <span style={{ color: "#1F2328", fontSize: 11 }}>{value}</span>}
        />
        {selectedCountries.map((country, index) => (
          <Line
            key={country}
            type="monotone"
            dataKey={shortenCountryName(country)}
            stroke={HEAT_LINE_COLORS[index % HEAT_LINE_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
