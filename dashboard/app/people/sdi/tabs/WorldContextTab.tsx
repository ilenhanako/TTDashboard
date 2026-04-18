"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  GLOBAL_RANKS_2023,
  WORLD_SDI,
  SDI_YEARS,
  SDI_DIST_BINS,
  SDI_DIST_COUNTS,
  SDI_TIER_DATA,
  WORLD_REGION_COLORS,
  SDI_COLORS,
} from "@/lib/sdi-constants";

export function WorldContextTab() {
  // Global ranking data sorted by rank
  const rankingData = useMemo(() => {
    return [...GLOBAL_RANKS_2023].sort((a, b) => a.rank - b.rank);
  }, []);

  // Distribution histogram data
  const distData = SDI_DIST_BINS.map((bin, i) => ({
    bin,
    count: SDI_DIST_COUNTS[i],
  }));

  // Convergence chart data
  const convergenceData = SDI_YEARS.map((year, i) => ({
    year,
    "High-income": WORLD_SDI["High-income"][i],
    "East Asia": WORLD_SDI["East Asia"][i],
    Global: WORLD_SDI["Global"][i],
    "South Asia": WORLD_SDI["South Asia"][i],
    "Sub-Saharan Africa": WORLD_SDI["Sub-Saharan Africa"][i],
  }));

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">Global SDI Landscape - 2023</h2>
        <p className="text-sm text-secondary mt-1">
          186 countries ranked by 2023 SDI. APAC focus countries are highlighted within the global
          distribution. The SDI has risen globally since 1990, driven by gains in income,
          education, and fertility declines.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-blue-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Countries - High SDI (&gt;0.80)
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-500 font-mono">45</div>
          <div className="text-xs text-secondary mt-1">24% of 186 countries</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-amber-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Countries - Low SDI (&lt;0.45)
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-500 font-mono">24</div>
          <div className="text-xs text-secondary mt-1">All in Sub-Saharan Africa</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-teal-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Global SDI gain 1990-2023
          </div>
          <div className="text-2xl md:text-3xl font-bold text-teal-500 font-mono">+0.114</div>
          <div className="text-xs text-secondary mt-1">From 0.566 to 0.680</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-purple-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Lowest global SDI (2023)
          </div>
          <div className="text-2xl md:text-3xl font-bold text-purple-500 font-mono">0.203</div>
          <div className="text-xs text-secondary mt-1">Niger</div>
        </div>
      </div>

      {/* Global Ranking Bar */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Global SDI Ranking - All 186 Countries - 2023 (APAC highlighted)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rankingData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#57606A", fontSize: 9 }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis domain={[0.15, 0.97]} tick={{ fill: "#57606A", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
              formatter={(value: number, name: string, props: any) => [
                `${value.toFixed(3)} (Rank #${props.payload.rank})`,
                props.payload.name,
              ]}
            />
            <Bar dataKey="sdi" radius={[2, 2, 0, 0]}>
              {rankingData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isAPAC ? "#f0c040cc" : "#1c3050"}
                  stroke={entry.isAPAC ? "#f0c040" : "transparent"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-secondary mt-2 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r">
          Blue bars = all countries. Colored bars = the 15 APAC countries in this study. Rank 1 =
          Switzerland (0.946).
        </p>
      </div>

      {/* Distribution + Tier Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Histogram */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            Global SDI Distribution - 2023 (186 countries)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={distData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis dataKey="bin" tick={{ fill: "#57606A", fontSize: 11 }} />
              <YAxis tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [`${value} countries`, ""]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {distData.map((entry, index) => {
                  const colors = ["#ef5a5a", "#ef5a5a", "#f0c040", "#f0c040", "#60a5fa", "#60a5fa", "#4ade80", "#4ade80"];
                  return <Cell key={`cell-${index}`} fill={colors[index]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Doughnut */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Countries by SDI Tier - 2023
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={SDI_TIER_DATA}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                label={({ label, count }) => `${count}`}
                labelLine={false}
              >
                {SDI_TIER_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number, name: string, props: any) => [
                  `${value} countries`,
                  props.payload.label,
                ]}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span style={{ color: "#1F2328", fontSize: 11 }}>{entry.payload.label}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Convergence Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          SDI Convergence - World Regions - 1990-2023
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={convergenceData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#57606A", fontSize: 11 }}
              tickFormatter={(v) => (v % 5 === 0 ? v : "")}
            />
            <YAxis domain={[0.3, 0.9]} tick={{ fill: "#57606A", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
              formatter={(value: number) => [value.toFixed(3), ""]}
            />
            <Legend />
            <Line type="monotone" dataKey="High-income" stroke="#f0c040" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="East Asia" stroke="#22d3a5" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Global" stroke="#60a5fa" strokeWidth={2.5} strokeDasharray="5 3" dot={false} />
            <Line type="monotone" dataKey="South Asia" stroke="#fb923c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Sub-Saharan Africa" stroke="#ef5a5a" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-secondary mt-2 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r">
          The gap between the highest-SDI region (High-income) and lowest (Sub-Saharan Africa) narrowed
          from 0.408 pts in 1990 to 0.392 pts in 2023 - driven by rapid gains in East Asia and South Asia.
        </p>
      </div>
    </div>
  );
}
