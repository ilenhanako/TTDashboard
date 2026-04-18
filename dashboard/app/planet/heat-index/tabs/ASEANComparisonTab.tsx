"use client";

import { useMemo } from "react";
import { useHeat } from "@/lib/heat-context";
import { GroupTrendChart } from "@/components/charts/GroupTrendChart";
import { HorizontalRankBars } from "@/components/charts/HorizontalRankBars";
import { DecadeBarChart } from "@/components/charts/DecadeBarChart";
import { HEAT_COLORS } from "@/lib/heat-constants";
import { shortenCountryName } from "@/lib/constants";

export function ASEANComparisonTab() {
  const { getHeat2020, getGroupAverages, getDecadeAverages, getGrowthRates } = useHeat();

  const heat2020 = getHeat2020();
  const groupAverages = getGroupAverages();
  const decadeAverages = getDecadeAverages();
  const growthRates = getGrowthRates();

  // Calculate group KPIs
  const groupKPIs = useMemo(() => {
    const aseanCountries = heat2020.filter((c) => c.isASEAN);
    const nonAseanCountries = heat2020.filter((c) => !c.isASEAN);

    const aseanHeatAvg =
      aseanCountries.reduce((sum, c) => sum + c.value, 0) / aseanCountries.length;
    const nonAseanHeatAvg =
      nonAseanCountries.reduce((sum, c) => sum + c.value, 0) / nonAseanCountries.length;

    const aseanHeatMax = Math.max(...aseanCountries.map((c) => c.value));
    const nonAseanHeatMax = Math.max(...nonAseanCountries.map((c) => c.value));
    const aseanHeatMin = Math.min(...aseanCountries.map((c) => c.value));
    const nonAseanHeatMin = Math.min(...nonAseanCountries.map((c) => c.value));

    // Growth stats
    const aseanGrowth = growthRates.filter((g) => g.isASEAN);
    const nonAseanGrowth = growthRates.filter((g) => !g.isASEAN);
    const aseanGrowthAvg =
      aseanGrowth.reduce((sum, g) => sum + g.growth, 0) / aseanGrowth.length;
    const nonAseanGrowthAvg =
      nonAseanGrowth.reduce((sum, g) => sum + g.growth, 0) / nonAseanGrowth.length;

    return {
      asean: {
        count: aseanCountries.length,
        heatAvg: aseanHeatAvg,
        heatMax: aseanHeatMax,
        heatMin: aseanHeatMin,
        growthAvg: aseanGrowthAvg,
      },
      nonAsean: {
        count: nonAseanCountries.length,
        heatAvg: nonAseanHeatAvg,
        heatMax: nonAseanHeatMax,
        heatMin: nonAseanHeatMin,
        growthAvg: nonAseanGrowthAvg,
      },
    };
  }, [heat2020, growthRates]);

  // Box plot approximation data
  const boxData = useMemo(() => {
    const aseanValues = heat2020.filter((c) => c.isASEAN).map((c) => c.value);
    const nonAseanValues = heat2020.filter((c) => !c.isASEAN).map((c) => c.value);

    const getStats = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const median = sorted[Math.floor(sorted.length / 2)];
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      return { min, max, median, q1, q3, avg };
    };

    return {
      asean: getStats(aseanValues),
      nonAsean: getStats(nonAseanValues),
    };
  }, [heat2020]);

  // Ranking data
  const rankingData = heat2020.map((c) => ({
    country: c.country,
    value: c.value,
    isASEAN: c.isASEAN,
  }));

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">
          ASEAN vs Non-ASEAN Comparison
        </h2>
        <p className="text-sm text-secondary mt-1">
          ASEAN members: Brunei, Cambodia, Indonesia, Lao PDR, Malaysia, Myanmar,
          Philippines, Singapore, Thailand, Viet Nam
          <br />
          Non-ASEAN (APAC): Bangladesh, China, India, Japan, Republic of Korea
        </p>
      </div>

      {/* Group KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASEAN KPIs */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.asean }}
            ></span>
            ASEAN — Group Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-blue-600">
                {groupKPIs.asean.heatAvg.toFixed(1)}
              </div>
              <div className="text-xs text-secondary">Avg Heat Index</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-blue-600">
                {groupKPIs.asean.heatMax.toFixed(1)}
              </div>
              <div className="text-xs text-secondary">Max Heat Index</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-blue-600">
                {groupKPIs.asean.growthAvg.toFixed(1)}%
              </div>
              <div className="text-xs text-secondary">Avg Growth (1980-2020)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-blue-600">
                {groupKPIs.asean.count}
              </div>
              <div className="text-xs text-secondary">Countries</div>
            </div>
          </div>
        </div>

        {/* Non-ASEAN KPIs */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.nonAsean }}
            ></span>
            Non-ASEAN — Group Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-purple-600">
                {groupKPIs.nonAsean.heatAvg.toFixed(1)}
              </div>
              <div className="text-xs text-secondary">Avg Heat Index</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-purple-600">
                {groupKPIs.nonAsean.heatMax.toFixed(1)}
              </div>
              <div className="text-xs text-secondary">Max Heat Index</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-purple-600">
                {groupKPIs.nonAsean.growthAvg.toFixed(1)}%
              </div>
              <div className="text-xs text-secondary">Avg Growth (1980-2020)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold font-mono text-purple-600">
                {groupKPIs.nonAsean.count}
              </div>
              <div className="text-xs text-secondary">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Box Plot + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heat Distribution Box */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat1 }}
            ></span>
            Heat Index Distribution (2020)
          </h3>
          <div className="space-y-6 py-4">
            {/* ASEAN Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: HEAT_COLORS.asean }}>
                  ASEAN
                </span>
                <span className="text-xs text-secondary font-mono">
                  Range: {boxData.asean.min.toFixed(1)} - {boxData.asean.max.toFixed(1)}
                </span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded">
                <div
                  className="absolute top-1 bottom-1 rounded"
                  style={{
                    left: `${(boxData.asean.q1 / 150) * 100}%`,
                    width: `${((boxData.asean.q3 - boxData.asean.q1) / 150) * 100}%`,
                    background: HEAT_COLORS.asean,
                    opacity: 0.6,
                  }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${(boxData.asean.median / 150) * 100}%`,
                    background: HEAT_COLORS.asean,
                  }}
                ></div>
                <div
                  className="absolute top-2 bottom-2 w-0.5 bg-gray-400"
                  style={{ left: `${(boxData.asean.min / 150) * 100}%` }}
                ></div>
                <div
                  className="absolute top-2 bottom-2 w-0.5 bg-gray-400"
                  style={{ left: `${(boxData.asean.max / 150) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-secondary mt-1 font-mono">
                <span>Med: {boxData.asean.median.toFixed(1)}</span>
                <span>Avg: {boxData.asean.avg.toFixed(1)}</span>
              </div>
            </div>

            {/* Non-ASEAN Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: HEAT_COLORS.nonAsean }}>
                  Non-ASEAN
                </span>
                <span className="text-xs text-secondary font-mono">
                  Range: {boxData.nonAsean.min.toFixed(1)} - {boxData.nonAsean.max.toFixed(1)}
                </span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded">
                <div
                  className="absolute top-1 bottom-1 rounded"
                  style={{
                    left: `${(boxData.nonAsean.q1 / 150) * 100}%`,
                    width: `${((boxData.nonAsean.q3 - boxData.nonAsean.q1) / 150) * 100}%`,
                    background: HEAT_COLORS.nonAsean,
                    opacity: 0.6,
                  }}
                ></div>
                <div
                  className="absolute top-0 bottom-0 w-0.5"
                  style={{
                    left: `${(boxData.nonAsean.median / 150) * 100}%`,
                    background: HEAT_COLORS.nonAsean,
                  }}
                ></div>
                <div
                  className="absolute top-2 bottom-2 w-0.5 bg-gray-400"
                  style={{ left: `${(boxData.nonAsean.min / 150) * 100}%` }}
                ></div>
                <div
                  className="absolute top-2 bottom-2 w-0.5 bg-gray-400"
                  style={{ left: `${(boxData.nonAsean.max / 150) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-secondary mt-1 font-mono">
                <span>Med: {boxData.nonAsean.median.toFixed(1)}</span>
                <span>Avg: {boxData.nonAsean.avg.toFixed(1)}</span>
              </div>
            </div>

            {/* Scale */}
            <div className="flex justify-between text-xs text-secondary pt-2 border-t">
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150 days</span>
            </div>
          </div>
        </div>

        {/* Group Trend */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.red }}
            ></span>
            Heat Trend by Group (average)
          </h3>
          <GroupTrendChart data={groupAverages} />
        </div>
      </div>

      {/* Decade Averages + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decade Averages */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat2 }}
            ></span>
            Decade Averages — Group Comparison
          </h3>
          <DecadeBarChart data={decadeAverages} height={320} />
        </div>

        {/* Country Ranking */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.green }}
            ></span>
            Country Ranking — Heat Index 2020
          </h3>
          <HorizontalRankBars
            data={rankingData}
            valueLabel="Heat Index"
            valueFormatter={(v) => `${v.toFixed(1)} days`}
            height={400}
          />
        </div>
      </div>
    </div>
  );
}
