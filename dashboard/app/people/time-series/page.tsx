"use client";

import { useState, useMemo, useEffect } from "react";
import { useDashboard } from "@/lib/context";
import { MetricCard } from "@/components/MetricCard";
import { TrendChart } from "@/components/charts/TrendChart";
import {
  shortenCountryName,
  DISEASE_CATEGORIES,
  CATEGORY_SHORT_NAMES,
  ASEAN_COUNTRIES,
  isASEANCountry,
} from "@/lib/constants";

type RegionFilter = "all" | "asean" | "non-asean";

export default function TimeSeriesPage() {
  const { loading, data, availableYears, getYearData } = useDashboard();
  const colors = data?.constants?.colors || {};

  // Default to first 5 countries
  const allCountries = data?.constants?.countries || [];
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    allCountries.slice(0, 5),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DISEASE_CATEGORIES.slice(0, 3),
  );
  const [year1, setYear1] = useState(
    availableYears[availableYears.length - 1] || "",
  );
  const [year2, setYear2] = useState(availableYears[0] || "");
  const [regionFilter, setRegionFilter] = useState<RegionFilter>("all");
  const [includeWorld, setIncludeWorld] = useState(true);

  // Filter countries based on region selection
  const filteredCountries = allCountries.filter((name: string) => {
    if (regionFilter === "asean") return isASEANCountry(name);
    if (regionFilter === "non-asean") return !isASEANCountry(name);
    return true;
  });

  // Auto-select countries when region filter changes
  const handleRegionChange = (newFilter: RegionFilter) => {
    setRegionFilter(newFilter);
    if (newFilter === "asean") {
      // Select all ASEAN countries
      const aseanInData = allCountries.filter((c: string) => isASEANCountry(c));
      setSelectedCountries(aseanInData);
    } else if (newFilter === "non-asean") {
      // Select all non-ASEAN countries
      const nonAseanInData = allCountries.filter((c: string) => !isASEANCountry(c));
      setSelectedCountries(nonAseanInData);
    }
    // For "all", keep current selection
  };

  // Build time series data from available years
  const timeSeriesData = useMemo(() => {
    if (!data) return { dalyRates: {}, categoryTotals: {}, worldRates: {} };

    const dalyRates: Record<string, Record<string, number>> = {};
    const categoryTotals: Record<string, Record<string, number>> = {};
    const worldRates: Record<string, number> = {};

    // For each country, build year -> rate mapping
    allCountries.forEach((country: string) => {
      dalyRates[country] = {};
      availableYears.forEach((year) => {
        const yearData = data.data?.byYear?.[year];
        if (yearData?.countries?.[country]) {
          dalyRates[country][year] = yearData.countries[country].dalyRate;
        }
      });
    });

    // Get world DALY rates from global data (convert from per 1M to per 1K)
    const globalData = data.data?.global;
    if (globalData?.worldDalyRates) {
      availableYears.forEach((year) => {
        if (globalData.worldDalyRates[year]) {
          worldRates[year] = globalData.worldDalyRates[year] / 1000;
        }
      });
    }

    // For each category, build year -> total mapping
    DISEASE_CATEGORIES.forEach((cat) => {
      categoryTotals[cat] = {};
      availableYears.forEach((year) => {
        const yearData = data.data?.byYear?.[year];
        if (yearData?.countries) {
          let total = 0;
          selectedCountries.forEach((country) => {
            total += yearData.countries[country]?.diseases?.[cat]?.value || 0;
          });
          categoryTotals[cat][year] = total;
        }
      });
    });

    return { dalyRates, categoryTotals, worldRates };
  }, [data, availableYears, allCountries, selectedCountries]);

  if (loading) return <div className="text-secondary">Loading...</div>;

  if (availableYears.length < 2) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-trust-navy font-heading">
          Time Series Analysis
        </h1>
        <div className="card">
          <p className="text-secondary">
            Time series analysis requires data for multiple years. Currently
            only {availableYears.length} year(s) available.
          </p>
        </div>
      </div>
    );
  }

  // Filter trend data for selected countries
  const filteredRates: Record<string, Record<string, number>> = {};
  selectedCountries.forEach((country) => {
    if (timeSeriesData.dalyRates[country]) {
      filteredRates[country] = timeSeriesData.dalyRates[country];
    }
  });

  // Add World data if requested
  if (includeWorld && Object.keys(timeSeriesData.worldRates).length > 0) {
    filteredRates["World"] = timeSeriesData.worldRates;
  }

  // Filter category trends
  const filteredCategories: Record<string, Record<string, number>> = {};
  selectedCategories.forEach((cat) => {
    if (timeSeriesData.categoryTotals[cat]) {
      filteredCategories[CATEGORY_SHORT_NAMES[cat] || cat] =
        timeSeriesData.categoryTotals[cat];
    }
  });

  // Calculate change summary
  const changes = selectedCountries
    .filter((c) => filteredRates[c]?.[year1] && filteredRates[c]?.[year2])
    .map((country) => {
      const rate1 = filteredRates[country][year1];
      const rate2 = filteredRates[country][year2];
      const change = rate1 > 0 ? ((rate2 - rate1) / rate1) * 100 : 0;
      return { country, rate1, rate2, change };
    })
    .sort((a, b) => a.change - b.change);

  const avgChange =
    changes.length > 0
      ? changes.reduce((sum, c) => sum + c.change, 0) / changes.length
      : 0;
  const improved = changes.filter((c) => c.change < 0).length;
  const worsened = changes.filter((c) => c.change > 0).length;

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country],
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-navy font-heading">
          Time Series Analysis
        </h1>
        <p className="text-secondary mt-1">
          Track DALY trends across {availableYears.join(", ")}
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="section-title">Filters</h2>
        <div className="space-y-4">
          {/* Region Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Region
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all" as RegionFilter, label: "All Countries" },
                { value: "asean" as RegionFilter, label: "ASEAN Only" },
                { value: "non-asean" as RegionFilter, label: "Non-ASEAN Only" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleRegionChange(opt.value)}
                  className={`px-3 py-1 rounded text-sm transition-all ${
                    regionFilter === opt.value
                      ? "bg-trust-blue text-white"
                      : "bg-gray-100 text-secondary hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <label className="flex items-center gap-2 ml-4">
                <input
                  type="checkbox"
                  checked={includeWorld}
                  onChange={(e) => setIncludeWorld(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-secondary">Include World</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Countries ({filteredCountries.length} shown)
            </label>
            <div className="flex flex-wrap gap-2">
              {filteredCountries.map((country: string) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`pill ${
                    selectedCountries.includes(country)
                      ? "pill-active"
                      : "pill-default"
                  }`}
                >
                  {shortenCountryName(country)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Disease Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {DISEASE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`pill ${
                    selectedCategories.includes(cat)
                      ? "pill-active"
                      : "pill-default"
                  }`}
                  style={
                    selectedCategories.includes(cat)
                      ? { backgroundColor: colors[cat] }
                      : {}
                  }
                >
                  {CATEGORY_SHORT_NAMES[cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DALY Rate Trends */}
      {(selectedCountries.length > 0 || includeWorld) && (
        <div className="card">
          <h2 className="section-title">DALY Trends</h2>
          <p className="text-sm text-secondary mb-4">
            DALY per 1,000 population over time
            {includeWorld && " (purple line = World average)"}
          </p>
          <TrendChart
            data={filteredRates}
            years={availableYears}
            formatLabel={shortenCountryName}
            colors={{ World: "#6366F1" }}
          />
        </div>
      )}

      {/* Category Trends */}
      {selectedCategories.length > 0 && selectedCountries.length > 0 && (
        <div className="card">
          <h2 className="section-title">Disease Category Trends</h2>
          <p className="text-sm text-secondary mb-4">
            Total DALYs for selected countries
          </p>
          <TrendChart
            data={filteredCategories}
            years={availableYears}
            colors={Object.fromEntries(
              selectedCategories.map((cat) => [
                CATEGORY_SHORT_NAMES[cat] || cat,
                colors[cat] || "#546E7A",
              ]),
            )}
          />
        </div>
      )}

      {/* Year Comparison */}
      <div className="card">
        <h2 className="section-title">Year Comparison</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Year 1
            </label>
            <select
              value={year1}
              onChange={(e) => setYear1(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Year 2
            </label>
            <select
              value={year2}
              onChange={(e) => setYear2(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Change Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            label="Average Change"
            value={`${avgChange > 0 ? "+" : ""}${avgChange.toFixed(1)}%`}
            deltaType={
              avgChange < 0
                ? "positive"  // Negative change = improvement = green
                : avgChange > 0
                  ? "negative"  // Positive change = worsening = red
                  : "neutral"
            }
            highlightBox={true}
          />
          <MetricCard
            label="Countries Improved"
            value={improved}
            deltaType="positive"  // Green for improvement
            highlightBox={true}
          />
          <MetricCard
            label="Countries Worsened"
            value={worsened}
            deltaType="negative"  // Red for worsening
            highlightBox={true}
          />
        </div>

        {/* Change Table */}
        {changes.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-sm font-medium text-secondary">
                  Country
                </th>
                <th className="py-3 px-4 text-sm font-medium text-secondary text-right">
                  {year1}
                </th>
                <th className="py-3 px-4 text-sm font-medium text-secondary text-right">
                  {year2}
                </th>
                <th className="py-3 px-4 text-sm font-medium text-secondary text-right">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {changes.map((row) => (
                <tr
                  key={row.country}
                  className="border-b border-border hover:bg-trust-light"
                >
                  <td className="py-3 px-4 font-medium">
                    {shortenCountryName(row.country)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.rate1.toFixed(1)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {row.rate2.toFixed(1)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      row.change < 0 ? "text-success" : "text-warning"
                    }`}
                  >
                    {row.change > 0 ? "+" : ""}
                    {row.change.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
