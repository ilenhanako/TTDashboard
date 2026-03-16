"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { CATEGORY_SHORT_NAMES, DISEASE_COLORS } from "@/lib/constants";

interface DualPieChartProps {
  regionalMix: Record<string, number>;
  worldMix: Record<string, number>;
  colors?: Record<string, string>;
}

export function DualPieChart({ regionalMix, worldMix, colors = {} }: DualPieChartProps) {
  const getColor = (category: string) => {
    return colors[category] || DISEASE_COLORS[category] || "#546E7A";
  };

  const regionalData = Object.entries(regionalMix)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: CATEGORY_SHORT_NAMES[name] || name,
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const worldData = Object.entries(worldMix)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: CATEGORY_SHORT_NAMES[name] || name,
      fullName: name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Regional Chart */}
      <div>
        <h3 className="text-center text-sm font-semibold text-primary mb-2">
          14 Asian Countries (Regional)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={regionalData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {regionalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.fullName)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              contentStyle={{
                backgroundColor: "#FAFBFC",
                border: "1px solid #E1E4E8",
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* World Chart */}
      <div>
        <h3 className="text-center text-sm font-semibold text-primary mb-2">
          Global (World)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={worldData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {worldData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.fullName)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name]}
              contentStyle={{
                backgroundColor: "#FAFBFC",
                border: "1px solid #E1E4E8",
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Shared Legend */}
      <div className="md:col-span-2 flex flex-wrap justify-center gap-4 mt-2">
        {regionalData.map((entry) => (
          <div key={entry.fullName} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getColor(entry.fullName) }}
            />
            <span className="text-xs text-secondary">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
