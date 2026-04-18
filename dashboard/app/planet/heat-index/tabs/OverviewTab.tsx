"use client";

import { useMemo } from "react";
import { useHeat } from "@/lib/heat-context";
import { HorizontalRankBars } from "@/components/charts/HorizontalRankBars";
import { HEAT_COLORS } from "@/lib/heat-constants";
import { shortenCountryName } from "@/lib/constants";

export function OverviewTab() {
  const { getHeat2020, getGrowthRates, heatData } = useHeat();

  const heat2020 = getHeat2020();
  const growthRates = getGrowthRates();

  // Calculate KPIs
  const kpis = useMemo(() => {
    const heatSorted = [...heat2020].sort((a, b) => b.value - a.value);
    const maxHeat = heatSorted[0];
    const minHeat = heatSorted[heatSorted.length - 1];
    const avgHeat =
      heat2020.reduce((sum, c) => sum + c.value, 0) / heat2020.length;

    // ASEAN vs Non-ASEAN averages
    const aseanCountries = heat2020.filter((c) => c.isASEAN);
    const nonAseanCountries = heat2020.filter((c) => !c.isASEAN);
    const aseanAvg =
      aseanCountries.reduce((sum, c) => sum + c.value, 0) / aseanCountries.length;
    const nonAseanAvg =
      nonAseanCountries.reduce((sum, c) => sum + c.value, 0) / nonAseanCountries.length;

    return { maxHeat, minHeat, avgHeat, aseanAvg, nonAseanAvg };
  }, [heat2020]);

  // Heat bar chart data
  const heatBarData = heat2020.map((c) => ({
    country: c.country,
    value: c.value,
    isASEAN: c.isASEAN,
  }));

  // Growth rate data for second chart
  const growthBarData = growthRates.map((c) => ({
    country: c.country,
    value: c.growth,
    isASEAN: c.isASEAN,
  }));

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">
          Regional Overview — Heat Exposure
        </h2>
        <p className="text-sm text-secondary mt-1">
          Heat Index 35 = annual days population is exposed to heat index ≥ 35°C.
          World Bank ESG Data 1970-2020.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div
            className="text-2xl md:text-3xl font-bold font-mono"
            style={{ color: HEAT_COLORS.heat1 }}
          >
            {kpis.maxHeat?.value.toFixed(1) ?? "–"}
          </div>
          <div className="text-xs text-secondary mt-1">Max Heat Index (2020)</div>
          <div className="text-xs text-secondary font-mono">
            {shortenCountryName(kpis.maxHeat?.country ?? "")}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div
            className="text-2xl md:text-3xl font-bold font-mono"
            style={{ color: HEAT_COLORS.green }}
          >
            {kpis.minHeat?.value.toFixed(1) ?? "–"}
          </div>
          <div className="text-xs text-secondary mt-1">Min Heat Index (2020)</div>
          <div className="text-xs text-secondary font-mono">
            {shortenCountryName(kpis.minHeat?.country ?? "")}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div
            className="text-2xl md:text-3xl font-bold font-mono"
            style={{ color: HEAT_COLORS.asean }}
          >
            {kpis.aseanAvg.toFixed(1)}
          </div>
          <div className="text-xs text-secondary mt-1">ASEAN Avg (2020)</div>
          <div className="text-xs text-secondary font-mono">10 countries</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div
            className="text-2xl md:text-3xl font-bold font-mono"
            style={{ color: HEAT_COLORS.nonAsean }}
          >
            {kpis.nonAseanAvg.toFixed(1)}
          </div>
          <div className="text-xs text-secondary mt-1">Non-ASEAN Avg (2020)</div>
          <div className="text-xs text-secondary font-mono">5 countries</div>
        </div>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat1 }}
            ></span>
            Heat Index 2020 — by Country
          </h3>
          <HorizontalRankBars
            data={heatBarData}
            valueLabel="Heat Index"
            valueFormatter={(v) => `${v.toFixed(1)} days`}
          />
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat2 }}
            ></span>
            Heat Index Growth (1980-2020)
          </h3>
          <HorizontalRankBars
            data={growthBarData}
            valueLabel="Growth"
            valueFormatter={(v) => `${v.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-card border border-border rounded-lg p-4 overflow-x-auto">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: HEAT_COLORS.green }}
          ></span>
          Country Summary Table
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">
                Rank
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">
                Country
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-secondary uppercase">
                Group
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-secondary uppercase">
                Heat Index 2020
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-secondary uppercase">
                Growth (1980-2020)
              </th>
            </tr>
          </thead>
          <tbody>
            {heat2020.map((row, index) => {
              const growth = growthRates.find((g) => g.iso3 === row.iso3);
              return (
                <tr key={row.iso3} className="border-b border-border/50 hover:bg-gray-50">
                  <td className="py-2 px-3 font-mono text-secondary">{index + 1}</td>
                  <td className="py-2 px-3 font-medium">
                    {shortenCountryName(row.country)}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        row.isASEAN
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "bg-purple-50 text-purple-600 border border-purple-200"
                      }`}
                    >
                      {row.isASEAN ? "ASEAN" : "Non-ASEAN"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {row.value.toFixed(1)}
                    <span
                      className="inline-block ml-2 h-1.5 rounded"
                      style={{
                        width: `${Math.min(100, (row.value / 150) * 100)}px`,
                        background: `linear-gradient(90deg, ${HEAT_COLORS.heat1}, #ff9f00)`,
                      }}
                    ></span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    <span
                      style={{
                        color:
                          (growth?.growth ?? 0) > 100
                            ? HEAT_COLORS.red
                            : (growth?.growth ?? 0) > 50
                              ? HEAT_COLORS.heat1
                              : HEAT_COLORS.green,
                      }}
                    >
                      {growth ? `${growth.growth.toFixed(1)}%` : "–"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
