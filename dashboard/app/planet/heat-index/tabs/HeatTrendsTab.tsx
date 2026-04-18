"use client";

import { useState, useMemo } from "react";
import { useHeat } from "@/lib/heat-context";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { DecadeBarChart } from "@/components/charts/DecadeBarChart";
import { GrowthChart } from "@/components/charts/GrowthChart";
import { HEAT_COLORS } from "@/lib/heat-constants";
import { shortenCountryName, ASEAN_COUNTRIES } from "@/lib/constants";
import type { GroupFilter, SmoothingMode } from "@/lib/heat-types";

export function HeatTrendsTab() {
  const {
    heatData,
    getCountryTimeSeries,
    getMovingAverage,
    getDecadeAverages,
    getGrowthRates,
  } = useHeat();

  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    heatData.map((c) => c.country)
  );
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [smoothing, setSmoothing] = useState<SmoothingMode>("raw");

  // Handle group filter change
  const handleGroupFilter = (filter: GroupFilter) => {
    setGroupFilter(filter);
    if (filter === "all") {
      setSelectedCountries(heatData.map((c) => c.country));
    } else if (filter === "ASEAN") {
      setSelectedCountries(heatData.filter((c) => c.isASEAN).map((c) => c.country));
    } else {
      setSelectedCountries(heatData.filter((c) => !c.isASEAN).map((c) => c.country));
    }
  };

  // Toggle individual country
  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) => {
      if (prev.includes(country)) {
        return prev.filter((c) => c !== country);
      } else {
        return [...prev, country];
      }
    });
    setGroupFilter("all"); // Reset group filter when manually selecting
  };

  // Build time series data for the chart
  const timeSeriesData = useMemo(() => {
    const data: { [country: string]: { year: number; value: number }[] } = {};

    selectedCountries.forEach((country) => {
      const countryData = heatData.find((c) => c.country === country);
      if (!countryData) return;

      if (smoothing === "ma5") {
        data[country] = getMovingAverage(countryData.iso3, 5);
      } else {
        data[country] = getCountryTimeSeries(countryData.iso3);
      }
    });

    return data;
  }, [selectedCountries, heatData, smoothing, getMovingAverage, getCountryTimeSeries]);

  const decadeAverages = getDecadeAverages();
  const growthRates = getGrowthRates();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-bold text-trust-navy">
          Heat Index Trends — 1970 to 2020
        </h2>
        <p className="text-sm text-secondary mt-1">
          Annual days with heat index ≥ 35°C. Increases signal growing population
          exposure to dangerous heat stress.
        </p>
      </div>

      {/* Main Trends Chart */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: HEAT_COLORS.heat1 }}
          ></span>
          Select Countries to Compare
        </h3>

        {/* Country Checkboxes */}
        <div className="flex flex-wrap gap-2 mb-4">
          {heatData.map((country) => {
            const isSelected = selectedCountries.includes(country.country);
            return (
              <label
                key={country.iso3}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs cursor-pointer border transition-colors ${
                  isSelected
                    ? "border-[#ff6b35] bg-orange-50 text-[#ff6b35]"
                    : "border-border bg-gray-50 text-secondary hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCountry(country.country)}
                  className="sr-only"
                />
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSelected ? "bg-[#ff6b35]" : "bg-gray-300"
                  }`}
                ></span>
                {shortenCountryName(country.country)}
              </label>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Group:</span>
            <div className="flex border border-border rounded-md overflow-hidden">
              {(["all", "ASEAN", "Non-ASEAN"] as GroupFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleGroupFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${
                    groupFilter === filter
                      ? "bg-[#ff6b35] text-white"
                      : "bg-background text-secondary hover:bg-gray-100"
                  }`}
                >
                  {filter === "all" ? "All 15" : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary">Smoothing:</span>
            <div className="flex border border-border rounded-md overflow-hidden">
              <button
                onClick={() => setSmoothing("raw")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  smoothing === "raw"
                    ? "bg-[#ff6b35] text-white"
                    : "bg-background text-secondary hover:bg-gray-100"
                }`}
              >
                Raw
              </button>
              <button
                onClick={() => setSmoothing("ma5")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  smoothing === "ma5"
                    ? "bg-[#ff6b35] text-white"
                    : "bg-background text-secondary hover:bg-gray-100"
                }`}
              >
                5-yr MA
              </button>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        {selectedCountries.length > 0 ? (
          <MultiLineChart data={timeSeriesData} selectedCountries={selectedCountries} />
        ) : (
          <div className="h-[380px] flex items-center justify-center text-secondary">
            Select at least one country to view trends
          </div>
        )}
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat1 }}
            ></span>
            Decade Averages
          </h3>
          <DecadeBarChart data={decadeAverages} />
        </div>

        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-secondary uppercase tracking-wide mb-4 flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: HEAT_COLORS.heat2 }}
            ></span>
            Heat Index Growth Rate (1980–2020 change)
          </h3>
          <GrowthChart data={growthRates} />
        </div>
      </div>
    </div>
  );
}
