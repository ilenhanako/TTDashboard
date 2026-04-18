"use client";

import { useState, useMemo } from "react";
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
  Cell,
} from "recharts";
import {
  APAC_SDI,
  SDI_YEARS,
  SDI_SHORT_NAMES,
  SDI_COUNTRY_COLORS,
  IS_ASEAN,
  APAC_KEYS,
  SDI_COLORS,
} from "@/lib/sdi-constants";
import type { SDIHighlightFilter } from "@/lib/sdi-types";

export function APACTrendsTab() {
  const [highlightFilter, setHighlightFilter] = useState<SDIHighlightFilter>("all");

  // Time series data
  const timeSeriesData = useMemo(() => {
    return SDI_YEARS.map((year, i) => {
      const row: Record<string, number | string> = { year };
      APAC_KEYS.forEach((k) => {
        row[SDI_SHORT_NAMES[k]] = APAC_SDI[k][i];
      });
      return row;
    });
  }, []);

  // Determine which countries to highlight
  const getLineOpacity = (country: string) => {
    if (highlightFilter === "all") return 1;
    if (highlightFilter === "ASEAN") return IS_ASEAN[country] ? 1 : 0.15;
    if (highlightFilter === "non-ASEAN") return !IS_ASEAN[country] ? 1 : 0.15;
    return country === highlightFilter ? 1 : 0.15;
  };

  // Gain data (sorted)
  const gainData = useMemo(() => {
    return APAC_KEYS.map((k) => ({
      name: SDI_SHORT_NAMES[k],
      gain: APAC_SDI[k][33] - APAC_SDI[k][0],
      isASEAN: IS_ASEAN[k],
    })).sort((a, b) => b.gain - a.gain);
  }, []);

  // Distribution 2023 data (sorted ascending)
  const distData = useMemo(() => {
    return APAC_KEYS.map((k) => ({
      name: SDI_SHORT_NAMES[k],
      sdi: APAC_SDI[k][33],
      isASEAN: IS_ASEAN[k],
    })).sort((a, b) => a.sdi - b.sdi);
  }, []);

  // Growth rate data (CAGR)
  const growthData = useMemo(() => {
    return APAC_KEYS.map((k) => ({
      name: SDI_SHORT_NAMES[k],
      rate: (Math.pow(APAC_SDI[k][33] / APAC_SDI[k][0], 1 / 33) - 1) * 100,
      isASEAN: IS_ASEAN[k],
    })).sort((a, b) => b.rate - a.rate);
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">Asia-Pacific SDI Trajectories - 1990-2023</h2>
        <p className="text-sm text-secondary mt-1">
          All 15 focus countries over 34 years. Data from IHME GBD 2023 SDI dataset.
        </p>
      </div>

      {/* Main Time Series Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          All 15 APAC Countries - SDI Time Series
        </h3>

        {/* Highlight Selector */}
        <div className="mb-4">
          <label className="text-xs text-secondary mr-2">Highlight:</label>
          <select
            value={highlightFilter}
            onChange={(e) => setHighlightFilter(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-md text-sm bg-background"
          >
            <option value="all">All countries</option>
            <option value="ASEAN">ASEAN members only</option>
            <option value="non-ASEAN">Non-ASEAN only</option>
            <optgroup label="Individual">
              {APAC_KEYS.map((k) => (
                <option key={k} value={k}>
                  {SDI_SHORT_NAMES[k]}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
            <XAxis
              dataKey="year"
              tick={{ fill: "#57606A", fontSize: 11 }}
              tickFormatter={(v) => (v % 5 === 0 ? v : "")}
            />
            <YAxis domain={[0.2, 0.95]} tick={{ fill: "#57606A", fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
              formatter={(value: number) => [value.toFixed(3), ""]}
            />
            {APAC_KEYS.map((k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={SDI_SHORT_NAMES[k]}
                stroke={SDI_COUNTRY_COLORS[k]}
                strokeWidth={highlightFilter === k ? 2.5 : 1.8}
                strokeOpacity={getLineOpacity(k)}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {APAC_KEYS.map((k) => (
            <div key={k} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-4 h-1 rounded"
                style={{ backgroundColor: SDI_COUNTRY_COLORS[k] }}
              ></div>
              {SDI_SHORT_NAMES[k]}
            </div>
          ))}
        </div>
      </div>

      {/* Gain + Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Absolute SDI Gain */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Absolute SDI Gain - 1990 → 2023
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gainData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis type="number" tick={{ fill: "#57606A", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#57606A", fontSize: 11 }} width={75} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [`+${value.toFixed(3)}`, "SDI Gain"]}
              />
              <Bar dataKey="gain" radius={[0, 4, 4, 0]}>
                {gainData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isASEAN ? "rgba(125, 211, 176, 0.6)" : "rgba(192, 132, 252, 0.6)"}
                    stroke={entry.isASEAN ? "#7dd3b0" : "#c084fc"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* SDI Distribution 2023 */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            SDI Distribution - 2023 (APAC 15)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
              <XAxis type="number" domain={[0.4, 0.95]} tick={{ fill: "#57606A", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#57606A", fontSize: 11 }} width={75} />
              <Tooltip
                contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
                formatter={(value: number) => [value.toFixed(3), "SDI"]}
              />
              <Bar dataKey="sdi" radius={[0, 4, 4, 0]}>
                {distData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isASEAN ? "rgba(125, 211, 176, 0.6)" : "rgba(192, 132, 252, 0.6)"}
                    stroke={entry.isASEAN ? "#7dd3b0" : "#c084fc"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-4 h-1 rounded" style={{ backgroundColor: "#7dd3b0" }}></div>
              ASEAN
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-4 h-1 rounded" style={{ backgroundColor: "#c084fc" }}></div>
              Non-ASEAN
            </div>
          </div>
        </div>
      </div>

      {/* Growth Rate Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          Average Annual SDI Growth Rate - 1990-2023 (%/yr)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E1E4E8" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#57606A", fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: "#57606A", fontSize: 11 }} tickFormatter={(v) => `${v.toFixed(1)}%`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#FAFBFC", border: "1px solid #E1E4E8", borderRadius: 8 }}
              formatter={(value: number) => [`${value.toFixed(2)}% / yr`, "CAGR"]}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
              {growthData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isASEAN ? "rgba(125, 211, 176, 0.6)" : "rgba(192, 132, 252, 0.6)"}
                  stroke={entry.isASEAN ? "#7dd3b0" : "#c084fc"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-secondary mt-2 bg-blue-50 border-l-2 border-blue-400 px-3 py-2 rounded-r">
          Computed as: (SDI_2023 / SDI_1990)^(1/33) - 1. Countries starting from a lower base tend to
          show higher growth rates.
        </p>
      </div>
    </div>
  );
}
