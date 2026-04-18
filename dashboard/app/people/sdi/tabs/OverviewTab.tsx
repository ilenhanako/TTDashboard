"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  APAC_SDI,
  WORLD_SDI,
  SDI_YEARS,
  SDI_SHORT_NAMES,
  SDI_COUNTRY_COLORS,
  WORLD_REGION_COLORS,
  IS_ASEAN,
  APAC_GLOBAL_RANKS,
  APAC_KEYS,
  getSDITier,
  SDI_COLORS,
} from "@/lib/sdi-constants";

export function OverviewTab() {
  // KPI calculations
  const kpis = useMemo(() => {
    const sdi2023 = APAC_KEYS.map((k) => ({
      country: k,
      value: APAC_SDI[k][33],
    })).sort((a, b) => b.value - a.value);

    const gains = APAC_KEYS.map((k) => ({
      country: k,
      gain: APAC_SDI[k][33] - APAC_SDI[k][0],
    })).sort((a, b) => b.gain - a.gain);

    const aseanAvg =
      APAC_KEYS.filter((k) => IS_ASEAN[k]).reduce((sum, k) => sum + APAC_SDI[k][33], 0) /
      APAC_KEYS.filter((k) => IS_ASEAN[k]).length;

    return {
      globalSDI: WORLD_SDI["Global"][33],
      highest: sdi2023[0],
      aseanAvg,
      fastestRiser: gains[0],
    };
  }, []);

  // World region trend data
  const regionTrendData = SDI_YEARS.map((year, i) => {
    const row: Record<string, number | string> = { year };
    Object.entries(WORLD_SDI).forEach(([region, data]) => {
      row[region] = data[i];
    });
    return row;
  });

  // APAC vs world benchmarks data
  const apacBenchmarkData = useMemo(() => {
    return APAC_KEYS.map((k) => ({
      name: SDI_SHORT_NAMES[k],
      sdi: APAC_SDI[k][33],
      color: SDI_COUNTRY_COLORS[k],
    })).sort((a, b) => b.sdi - a.sdi);
  }, []);

  // Reference table data
  const tableData = useMemo(() => {
    return APAC_KEYS.map((k) => ({
      country: k,
      shortName: SDI_SHORT_NAMES[k],
      isASEAN: IS_ASEAN[k],
      sdi2023: APAC_SDI[k][33],
      sdi1990: APAC_SDI[k][0],
      gain: APAC_SDI[k][33] - APAC_SDI[k][0],
      tier: getSDITier(APAC_SDI[k][33]),
      globalRank: APAC_GLOBAL_RANKS[k],
    })).sort((a, b) => b.sdi2023 - a.sdi2023);
  }, []);

  const maxSDI = Math.max(...tableData.map((d) => d.sdi2023));

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">Regional Snapshot - 2023</h2>
        <p className="text-sm text-secondary mt-1">
          The Socio-Demographic Index (SDI) is a composite of income per capita, educational
          attainment, and total fertility rate - rescaled 0 to 1. This dashboard contextualises
          15 Asia-Pacific countries within the global SDI landscape.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-blue-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Global SDI (2023)
          </div>
          <div className="text-2xl md:text-3xl font-bold text-blue-500 font-mono">
            {kpis.globalSDI.toFixed(3)}
          </div>
          <div className="text-xs text-secondary mt-1">From 0.566 in 1990</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-amber-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            APAC Highest - 2023
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-500 font-mono">
            {kpis.highest.value.toFixed(3)}
          </div>
          <div className="text-xs text-secondary mt-1">
            {SDI_SHORT_NAMES[kpis.highest.country]} - Rank #{APAC_GLOBAL_RANKS[kpis.highest.country]}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-teal-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            ASEAN Average - 2023
          </div>
          <div className="text-2xl md:text-3xl font-bold text-teal-500 font-mono">
            {kpis.aseanAvg.toFixed(3)}
          </div>
          <div className="text-xs text-secondary mt-1">= Global average</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 border-r-4 border-r-purple-400">
          <div className="text-xs font-semibold text-secondary uppercase tracking-wide mb-2">
            Fastest Riser 1990-2023
          </div>
          <div className="text-2xl md:text-3xl font-bold text-purple-500 font-mono">
            +{kpis.fastestRiser.gain.toFixed(3)}
          </div>
          <div className="text-xs text-secondary mt-1">
            {SDI_SHORT_NAMES[kpis.fastestRiser.country]}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* World Regions Trend */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            World Regions - SDI Trend 1990-2023
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={regionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => (v % 5 === 0 ? v : "")}
              />
              <YAxis
                domain={[0.2, 0.95]}
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              {Object.keys(WORLD_SDI).map((region) => (
                <Line
                  key={region}
                  type="monotone"
                  dataKey={region}
                  stroke={WORLD_REGION_COLORS[region]}
                  strokeWidth={region === "Global" ? 2.5 : 1.5}
                  strokeDasharray={region === "Global" ? "" : "4 3"}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* APAC vs World Benchmarks */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            APAC Countries vs World Benchmarks - 2023
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={apacBenchmarkData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#57606A", fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0.4, 0.95]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), "SDI"]}
              />
              <ReferenceLine y={0.68} stroke="#60a5fa" strokeDasharray="5 4" label={{ value: "Global 0.680", fill: "#60a5fa", fontSize: 9, position: "right" }} />
              <ReferenceLine y={0.867} stroke="#f0c040" strokeDasharray="5 4" label={{ value: "High-income 0.867", fill: "#f0c040", fontSize: 9, position: "right" }} />
              <ReferenceLine y={0.661} stroke="#7dd3b0" strokeDasharray="3 4" label={{ value: "SE Asia 0.661", fill: "#7dd3b0", fontSize: 9, position: "left" }} />
              <Bar dataKey="sdi" radius={[4, 4, 0, 0]}>
                {apacBenchmarkData.map((entry, index) => (
                  <Bar key={index} dataKey="sdi" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-secondary mt-2 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r">
            Horizontal reference lines mark Global (0.680), SE Asia (0.661), and High-income (0.867) averages.
          </p>
        </div>
      </div>

      {/* Reference Table */}
      <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
          Country Reference Table - APAC 15 - 2023
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">Country</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">Group</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-secondary uppercase">SDI 2023</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">SDI Tier</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-secondary uppercase">Global Rank</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-secondary uppercase">Change 1990-2023</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">SDI Index</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.country} className="border-b border-border/50 hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">{row.shortName}</td>
                <td className="py-2 px-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                      row.isASEAN
                        ? "bg-teal-50 text-teal-600 border border-teal-200"
                        : "bg-purple-50 text-purple-600 border border-purple-200"
                    }`}
                  >
                    {row.isASEAN ? "ASEAN" : "Non-ASEAN"}
                  </span>
                </td>
                <td className="py-2 px-3 text-right font-mono">{row.sdi2023.toFixed(3)}</td>
                <td className="py-2 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${row.tier.className}`}>
                    {row.tier.label}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">
                  <span className="text-amber-500 font-mono font-medium">#{row.globalRank}</span>
                  <span className="text-xs text-secondary ml-1">/ 186</span>
                </td>
                <td className="py-2 px-3 text-right font-mono" style={{ color: row.gain > 0.2 ? "#4ade80" : "#f0c040" }}>
                  +{row.gain.toFixed(3)}
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded">
                      <div
                        className="h-1.5 rounded"
                        style={{
                          width: `${(row.sdi2023 / maxSDI) * 100}%`,
                          backgroundColor: SDI_COUNTRY_COLORS[row.country],
                        }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono text-secondary w-12">{row.sdi2023.toFixed(3)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
