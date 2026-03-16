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

interface CategoryBarProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  horizontal?: boolean;
}

export function CategoryBar({ data, title, horizontal = false }: CategoryBarProps) {
  const defaultColor = "#003366";

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 35)}>
        <BarChart
          data={data}
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
            formatter={(value: number) => [
              typeof value === "number" && value < 1
                ? `${value.toFixed(2)}%`
                : value.toLocaleString(),
              "",
            ]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || defaultColor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#1F2328", fontSize: 11 }}
          axisLine={{ stroke: "#E1E4E8" }}
          height={60}
          angle={-45}
          textAnchor="end"
        />
        <YAxis
          tick={{ fill: "#57606A", fontSize: 12 }}
          axisLine={{ stroke: "#E1E4E8" }}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString()
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FAFBFC",
            border: "1px solid #E1E4E8",
            borderRadius: 8,
          }}
          formatter={(value: number) => [value.toLocaleString(), ""]}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || defaultColor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
