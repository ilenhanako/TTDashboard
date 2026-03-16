"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/context";
import { DiseaseCompositionPieChart } from "@/components/charts/PieChart";
import { AgeChart } from "@/components/charts/AgeChart";
import { CategoryBar } from "@/components/charts/CategoryBar";
import {
  shortenCountryName,
  CATEGORY_SHORT_NAMES,
  AGE_GROUPS,
  ASEAN_COUNTRIES,
  isASEANCountry,
} from "@/lib/constants";

type DrillLevel = 0 | 1;
type RegionFilter = "all" | "asean" | "non-asean";

export default function ByCountryPage() {
  const { loading, selectedYear, getYearData, getWorldDalyRate, data } = useDashboard();
  const worldDalyRate = getWorldDalyRate();

  const yearData = getYearData();
  const countries = yearData?.countries || {};
  const countryNames = Object.keys(countries);
  const colors = data?.constants?.colors || {};

  const [selectedCountry, setSelectedCountry] = useState(
    countryNames[0] || "India",
  );
  const [level, setLevel] = useState<DrillLevel>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");

  // Filter countries based on region selection
  const filteredCountryNames = countryNames.filter((name) => {
    if (regionFilter === "asean") return isASEANCountry(name);
    if (regionFilter === "non-asean") return !isASEANCountry(name);
    return true;
  });

  // Update selected country when data loads
  useEffect(() => {
    if (countryNames.length > 0 && !countryNames.includes(selectedCountry)) {
      setSelectedCountry(countryNames[0]);
    }
  }, [countryNames, selectedCountry]);

  if (loading) return <div className="text-secondary">Loading...</div>;

  if (!yearData) {
    return (
      <div className="text-warning">No data available for {selectedYear}</div>
    );
  }

  const countryOptions = filteredCountryNames.map((name) => ({
    value: name,
    label: shortenCountryName(name),
    isASEAN: isASEANCountry(name),
  }));

  const countryData = countries[selectedCountry];

  if (!countryData) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-trust-navy font-heading">By Country</h1>
        <p className="text-secondary">Select a country to view details.</p>
      </div>
    );
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setLevel(0);
    setSelectedCategory(null);
  };

  const goToLevel0 = () => {
    setLevel(0);
    setSelectedCategory(null);
  };

  const goToLevel1 = (category: string) => {
    setLevel(1);
    setSelectedCategory(category);
  };

  // Prepare pie chart data
  const pieData = Object.entries(countryData.diseases)
    .filter(([_, d]) => d.pct > 0.1)
    .map(([name, d]) => ({
      name,
      value: d.pct,
    }));

  // Age data for selected country
  const ageGroups = yearData.ageGroups || {};
  const ageData: Record<string, number> = {};
  AGE_GROUPS.forEach((ag) => {
    ageData[ag] = ageGroups[ag]?.[selectedCountry] || 0;
  });

  // Get max percentage for table progress bars
  const maxPct = Math.max(
    ...Object.values(countryData.diseases).map((d) => d.pct || 0),
  );

  // ─────────────────────────────────────────────────────────────
  // Level 0: Country Overview
  // ─────────────────────────────────────────────────────────────
  if (level === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-trust-navy font-heading">By Country</h1>
          <p className="text-secondary mt-1">
            Select a country to explore its disease profile
          </p>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary">Region:</span>
          <div className="flex gap-2">
            {[
              { value: "all" as RegionFilter, label: "All Countries" },
              { value: "asean" as RegionFilter, label: "ASEAN" },
              { value: "non-asean" as RegionFilter, label: "Non-ASEAN" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRegionFilter(opt.value)}
                className={`px-3 py-1 rounded text-sm transition-all ${
                  regionFilter === opt.value
                    ? "bg-trust-blue text-white"
                    : "bg-gray-100 text-secondary hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Country Pills */}
        <div className="flex flex-wrap gap-2">
          {countryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleCountryChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedCountry === opt.value
                  ? "bg-trust-blue text-white"
                  : regionFilter !== "all" && opt.isASEAN
                    ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                    : "bg-trust-light text-primary hover:bg-trust-accent hover:text-white"
              }`}
            >
              {opt.label}
              {regionFilter !== "all" && opt.isASEAN && selectedCountry !== opt.value && (
                <span className="ml-1 text-xs opacity-60">ASEAN</span>
              )}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="kpi">
              <div className="text-xs text-secondary uppercase tracking-wide mb-1">
                Total DALYs
              </div>
              <div className="text-2xl font-bold text-primary font-serif">
                {(countryData.total / 1000).toFixed(0)}M
              </div>
              <div className="text-xs text-secondary"></div>
            </div>
            <div className="kpi">
              <div className="text-xs text-secondary uppercase tracking-wide mb-1">
                Population
              </div>
              <div className="text-2xl font-bold text-primary font-serif">
                {(countryData.population / 1000).toFixed(1)}M
              </div>
              <div className="text-xs text-secondary"></div>
            </div>
            <div className="kpi">
              <div className="text-xs text-secondary uppercase tracking-wide mb-1">
                DALY Rate
              </div>
              <div className="text-2xl font-bold text-primary font-serif">
                {countryData.dalyRate.toFixed(0)}
              </div>
              <div className="text-xs text-secondary">
                per 1,000 pop · world avg: {worldDalyRate}
              </div>
            </div>
            <div className="kpi">
              <div className="text-xs text-secondary uppercase tracking-wide mb-1">
                vs World Average
              </div>
              <div
                className="text-2xl font-bold font-serif"
                style={{
                  color:
                    countryData.dalyRate > worldDalyRate
                      ? "#f85149"
                      : "#3fb950",
                }}
              >
                {countryData.dalyRateVsWorld.toFixed(0)}%
              </div>
              <div className="text-xs text-secondary">
                {countryData.dalyRate > worldDalyRate ? "above" : "below"}{" "}
                world average
              </div>
            </div>
          </div>
        </div>

        {/* Charts: Pie + Age */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="section-title">Disease composition</h3>
            <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
              <div>
                <DiseaseCompositionPieChart data={pieData} compact />
              </div>
              <div className="space-y-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: colors[item.name] || "#546E7A",
                      }}
                    />
                    <span className="text-xs text-secondary flex-1 truncate">
                      {CATEGORY_SHORT_NAMES[item.name] || item.name}
                    </span>
                    <span className="text-xs font-medium">
                      {item.value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Age profile</h3>
            <AgeChart data={ageData} />
          </div>
        </div>

        {/* Disease Table with Progress Bars */}
        <div className="card">
          <h3 className="section-title">
            Click a disease category to drill down to sub-diseases
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide">
                    Category
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-secondary uppercase tracking-wide">
                    DALYs (k)
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-secondary uppercase tracking-wide">
                    %
                  </th>
                  <th className="py-2 px-3 w-[40%]"></th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(countryData.diseases)
                  .filter(
                    (cat) =>
                      cat !== "Unclassified" &&
                      countryData.diseases[cat]?.pct > 0,
                  )
                  .sort(
                    (a, b) =>
                      (countryData.diseases[b]?.value || 0) -
                      (countryData.diseases[a]?.value || 0),
                  )
                  .map((cat) => {
                    const d = countryData.diseases[cat];
                    const barWidth = (d.pct / maxPct) * 100;
                    const color = colors[cat] || "#546E7A";

                    return (
                      <tr
                        key={cat}
                        className="border-b border-border cursor-pointer hover:bg-trust-light transition-colors"
                        onClick={() => goToLevel1(cat)}
                      >
                        <td className="py-2.5 px-3">
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm">
                            {CATEGORY_SHORT_NAMES[cat] || cat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm text-secondary">
                          {d.value.toFixed(0)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-sm font-medium">
                          {d.pct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="bg-gray-100 rounded h-2 overflow-hidden">
                            <div
                              className="h-full rounded transition-all"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Level 1: Sub-disease breakdown for selected category
  // ─────────────────────────────────────────────────────────────
  if (level === 1 && selectedCategory) {
    const catData = countryData.diseases[selectedCategory];
    const subs = catData?.sub || {};

    const subData = Object.entries(subs)
      .map(([name, d]) => ({
        name,
        value: d.value,
        pct: d.pct,
      }))
      .sort((a, b) => b.value - a.value);

    const absChartData = subData.map((d) => ({
      name: d.name,
      value: d.value,
      color: colors[selectedCategory] || "#4472C4",
    }));

    const pctChartData = subData.map((d) => ({
      name: d.name,
      value: d.pct,
      color: `${colors[selectedCategory] || "#4472C4"}AA`,
    }));

    const categoryShort =
      CATEGORY_SHORT_NAMES[selectedCategory] || selectedCategory;
    const countryShort = shortenCountryName(selectedCountry);

    return (
      <div className="space-y-6">
        {/* Country Pills (keep them at top) */}
        <div className="flex flex-wrap gap-2">
          {countryOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleCountryChange(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                selectedCountry === opt.value
                  ? "bg-trust-blue text-white"
                  : "bg-trust-light text-primary hover:bg-trust-accent hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button
            onClick={goToLevel0}
            className="text-trust-accent hover:underline"
          >
            {countryShort} Overview
          </button>
          <span className="text-secondary mx-2">›</span>
          <span className="font-medium">{selectedCategory}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="section-title">
              {countryShort} — {categoryShort} sub-disease breakdown
            </h2>
            {absChartData.length > 0 ? (
              <CategoryBar
                data={absChartData}
                title="DALYs (thousands)"
                horizontal
              />
            ) : (
              <p className="text-secondary">No sub-disease data available</p>
            )}
          </div>

          <div className="card">
            <h2 className="section-title">% of {countryShort} total DALYs</h2>
            {pctChartData.length > 0 ? (
              <CategoryBar
                data={pctChartData}
                title="% of Total DALYs"
                horizontal
              />
            ) : (
              <p className="text-secondary">No sub-disease data available</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
