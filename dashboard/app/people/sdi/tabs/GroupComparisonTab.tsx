"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  APAC_SDI,
  WORLD_SDI,
  SDI_YEARS,
  SDI_SHORT_NAMES,
  SDI_COUNTRY_COLORS,
  IS_ASEAN,
  ASEAN_KEYS,
  NON_ASEAN_KEYS,
  getSDITier,
  avg,
  SDI_COLORS,
} from "@/lib/sdi-constants";

export function GroupComparisonTab() {
  // ASEAN trend data
  const aseanTrendData = useMemo(() => {
    return SDI_YEARS.map((year, i) => {
      const row: Record<string, number | string> = { year };
      ASEAN_KEYS.forEach((k) => {
        row[SDI_SHORT_NAMES[k]] = APAC_SDI[k][i];
      });
      return row;
    });
  }, []);

  // Non-ASEAN trend data
  const nonAseanTrendData = useMemo(() => {
    return SDI_YEARS.map((year, i) => {
      const row: Record<string, number | string> = { year };
      NON_ASEAN_KEYS.forEach((k) => {
        row[SDI_SHORT_NAMES[k]] = APAC_SDI[k][i];
      });
      return row;
    });
  }, []);

  // Group averages vs global
  const groupAvgData = useMemo(() => {
    return SDI_YEARS.map((year, i) => ({
      year,
      asean: avg(ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
      nonAsean: avg(NON_ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
      global: WORLD_SDI["Global"][i],
    }));
  }, []);

  // Range data (min/max per group)
  const rangeData = useMemo(() => {
    return SDI_YEARS.map((year, i) => ({
      year,
      aseanMax: Math.max(...ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
      aseanMin: Math.min(...ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
      nonAseanMax: Math.max(...NON_ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
      nonAseanMin: Math.min(...NON_ASEAN_KEYS.map((k) => APAC_SDI[k][i])),
    }));
  }, []);

  // Table data
  const aseanTableData = useMemo(() => {
    return ASEAN_KEYS.map((k) => ({
      country: SDI_SHORT_NAMES[k],
      sdi1990: APAC_SDI[k][0],
      sdi2023: APAC_SDI[k][33],
      gain: APAC_SDI[k][33] - APAC_SDI[k][0],
      tier: getSDITier(APAC_SDI[k][33]),
    })).sort((a, b) => b.sdi2023 - a.sdi2023);
  }, []);

  const nonAseanTableData = useMemo(() => {
    return NON_ASEAN_KEYS.map((k) => ({
      country: SDI_SHORT_NAMES[k],
      sdi1990: APAC_SDI[k][0],
      sdi2023: APAC_SDI[k][33],
      gain: APAC_SDI[k][33] - APAC_SDI[k][0],
      tier: getSDITier(APAC_SDI[k][33]),
    })).sort((a, b) => b.sdi2023 - a.sdi2023);
  }, []);

  // Range stats for note
  const aseanRange2023 = {
    max: Math.max(...ASEAN_KEYS.map((k) => APAC_SDI[k][33])),
    min: Math.min(...ASEAN_KEYS.map((k) => APAC_SDI[k][33])),
  };
  const nonAseanRange2023 = {
    max: Math.max(...NON_ASEAN_KEYS.map((k) => APAC_SDI[k][33])),
    min: Math.min(...NON_ASEAN_KEYS.map((k) => APAC_SDI[k][33])),
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">ASEAN vs Non-ASEAN Comparison</h2>
        <p className="text-sm text-secondary mt-1">
          Analysing within-group heterogeneity and cross-group SDI development pathways from 1990 to
          2023.
        </p>
      </div>

      {/* Group Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASEAN Trend */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: SDI_COLORS.asean }}></span>
            ASEAN Members - SDI Trajectories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={aseanTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => (v % 10 === 0 ? v : "")}
              />
              <YAxis domain={[0.25, 0.9]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              {ASEAN_KEYS.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={SDI_SHORT_NAMES[k]}
                  stroke={SDI_COUNTRY_COLORS[k]}
                  strokeWidth={1.8}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Non-ASEAN Trend */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: SDI_COLORS.nonAsean }}></span>
            Non-ASEAN APAC - SDI Trajectories
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={nonAseanTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => (v % 10 === 0 ? v : "")}
              />
              <YAxis domain={[0.25, 0.95]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), ""]}
              />
              <Legend wrapperStyle={{ fontSize: 9 }} />
              {NON_ASEAN_KEYS.map((k) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={SDI_SHORT_NAMES[k]}
                  stroke={SDI_COUNTRY_COLORS[k]}
                  strokeWidth={1.8}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Group Averages + Range */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Averages vs Global */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Group Averages vs Global - 1990-2023
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={groupAvgData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => (v % 10 === 0 ? v : "")}
              />
              <YAxis domain={[0.3, 0.85]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), ""]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="asean"
                name="ASEAN avg"
                stroke={SDI_COLORS.asean}
                fill={SDI_COLORS.asean}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="nonAsean"
                name="Non-ASEAN avg"
                stroke={SDI_COLORS.nonAsean}
                fill={SDI_COLORS.nonAsean}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="global"
                name="Global"
                stroke={SDI_COLORS.global}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Within-Group Range */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Within-Group SDI Range - 2023
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={rangeData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#57606A", fontSize: 11 }}
                tickFormatter={(v) => (v % 10 === 0 ? v : "")}
              />
              <YAxis domain={[0.2, 0.95]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), ""]}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="aseanMax"
                name="ASEAN max"
                stroke={SDI_COLORS.asean}
                fill={SDI_COLORS.asean}
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="aseanMin"
                name="ASEAN min"
                stroke={SDI_COLORS.asean}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="nonAseanMax"
                name="Non-ASEAN max"
                stroke={SDI_COLORS.nonAsean}
                fill={SDI_COLORS.nonAsean}
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
              <Line
                type="monotone"
                dataKey="nonAseanMin"
                name="Non-ASEAN min"
                stroke={SDI_COLORS.nonAsean}
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-secondary mt-2 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r">
            ASEAN internal range in 2023: {aseanRange2023.max.toFixed(3)} (Brunei) → {aseanRange2023.min.toFixed(3)} (Cambodia) ={" "}
            <strong className="text-teal-600">{(aseanRange2023.max - aseanRange2023.min).toFixed(3)} pts spread</strong>.
            Non-ASEAN range: {nonAseanRange2023.max.toFixed(3)} (Korea) → {nonAseanRange2023.min.toFixed(3)} (Bangladesh) ={" "}
            <strong className="text-purple-600">{(nonAseanRange2023.max - nonAseanRange2023.min).toFixed(3)} pts spread</strong>.
            Both groups are highly heterogeneous.
          </p>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASEAN Table */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: SDI_COLORS.asean }}></span>
            ASEAN Countries - Summary
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-xs font-semibold text-secondary uppercase">Country</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">SDI 1990</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">SDI 2023</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">Gain</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-secondary uppercase">Tier</th>
              </tr>
            </thead>
            <tbody>
              {aseanTableData.map((row) => (
                <tr key={row.country} className="border-b border-border/50 hover:bg-gray-50">
                  <td className="py-2 px-2 font-medium">{row.country}</td>
                  <td className="py-2 px-2 text-right font-mono">{row.sdi1990.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{row.sdi2023.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-green-500">+{row.gain.toFixed(3)}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${row.tier.className}`}>
                      {row.tier.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Non-ASEAN Table */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: SDI_COLORS.nonAsean }}></span>
            Non-ASEAN APAC - Summary
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-xs font-semibold text-secondary uppercase">Country</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">SDI 1990</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">SDI 2023</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-secondary uppercase">Gain</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-secondary uppercase">Tier</th>
              </tr>
            </thead>
            <tbody>
              {nonAseanTableData.map((row) => (
                <tr key={row.country} className="border-b border-border/50 hover:bg-gray-50">
                  <td className="py-2 px-2 font-medium">{row.country}</td>
                  <td className="py-2 px-2 text-right font-mono">{row.sdi1990.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono">{row.sdi2023.toFixed(3)}</td>
                  <td className="py-2 px-2 text-right font-mono text-purple-500">+{row.gain.toFixed(3)}</td>
                  <td className="py-2 px-2">
                    <span className={`text-xs px-2 py-0.5 rounded border ${row.tier.className}`}>
                      {row.tier.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
