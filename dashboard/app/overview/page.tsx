"use client";

import { useDashboard } from "@/lib/context";
import { DALYRateChart } from "@/components/charts/DALYRateChart";
import { DualPieChart } from "@/components/charts/DualPieChart";
import { AgeStackedChart } from "@/components/charts/AgeStackedChart";
import { GenderChart } from "@/components/charts/GenderChart";
import { CompositionChart } from "@/components/charts/CompositionChart";

export default function OverviewPage() {
  const { loading, selectedYear, getYearData, getWorldDalyRate, getWorldDiseaseMix, data } = useDashboard();
  const worldDalyRate = getWorldDalyRate();

  if (loading) {
    return <div className="text-secondary">Loading...</div>;
  }

  const yearData = getYearData();
  if (!yearData) {
    return (
      <div className="text-warning">No data available for {selectedYear}</div>
    );
  }

  const countries = yearData.countries;
  const countryNames = Object.keys(countries);
  const colors = data?.constants?.colors || {};

  // DALY Rate data
  const rateData = Object.entries(countries).map(([name, d]) => ({
    name,
    rate: d.dalyRate,
  }));

  // Regional disease mix
  const catTotals: Record<string, number> = {};
  let grandTotal = 0;
  Object.values(countries).forEach((c) => {
    grandTotal += c.total;
    Object.entries(c.diseases).forEach(([cat, catData]) => {
      catTotals[cat] = (catTotals[cat] || 0) + catData.value;
    });
  });

  const regionalMix: Record<string, number> = {};
  Object.entries(catTotals).forEach(([cat, val]) => {
    const pct = (val / grandTotal) * 100;
    if (pct > 0.05) regionalMix[cat] = parseFloat(pct.toFixed(1));
  });

  const worldMix = getWorldDiseaseMix();

  // Gender data
  const genderData = (data?.data?.byYear?.[selectedYear] as any)?.gender || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-navy font-heading">Overview</h1>
        <p className="text-secondary mt-1">
          WHO Global Health Estimates {selectedYear} — 15 Asian Countries · All
          values in DALYs (thousands)
        </p>
      </div>

      {/* Graph 1: DALY Rate */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
          DALYs per 1,000 population — compared to world average (
          {worldDalyRate.toFixed(1)})
        </h2>
        <div className="flex items-center gap-2 text-sm text-secondary mb-3 px-3 py-2 bg-trust-light/50 rounded-md border-l-3 border-trust-accent">
          <span>ℹ️</span>
          <span>
            World average DALY:{" "}
            <strong className="text-primary">
              {worldDalyRate.toFixed(1)} per 1,000
            </strong>{" "}
            · Bars are coloured red if above world average, blue if below, purple for World
          </span>
        </div>
        <DALYRateChart data={rateData} worldDalyRate={worldDalyRate} />
        <p className="text-xs text-secondary mt-3 italic">
          Source: WHO GHE {selectedYear}. Population from UN World Population
          Prospects 2022.
        </p>
      </div>

      {/* Graph 2: Dual Pie */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
          Proportion of DALYs by disease category
        </h2>
        <DualPieChart
          regionalMix={regionalMix}
          worldMix={worldMix}
          colors={colors}
        />
        <p className="text-xs text-secondary mt-3 italic">
          Regional figures computed from the 15 countries in this dataset.
          Global figures from WHO GHE {selectedYear}.
        </p>
      </div>

      {/* Graph 3: Age Distribution */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
          Age profile of DALY burden (% of each country's total)
        </h2>
        <AgeStackedChart yearData={yearData} />
        <p className="text-xs text-secondary mt-3 italic">
          Each bar represents 100% of that country's total DALYs distributed
          across age bands.
        </p>
      </div>

      {/* Graph 4: Gender */}
      {genderData.malePct && (
        <div className="card">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
            DALY burden vs population by sex (%) — two bars per country
          </h2>
          <GenderChart genderData={genderData} countries={countryNames} />
          <p className="text-xs text-secondary mt-3 italic">
            For each country, left bar = % split of DALYs. Right bar = % split
            of population. Divergence highlights sex-based disparity in disease
            burden.
          </p>
        </div>
      )}

      {/* Graph 5: Disease Composition */}
      <div className="card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
          Disease category composition — all countries + World (% of total DALYs)
        </h2>
        <CompositionChart yearData={yearData} colors={colors} worldDiseaseMix={worldMix} />
      </div>
    </div>
  );
}
