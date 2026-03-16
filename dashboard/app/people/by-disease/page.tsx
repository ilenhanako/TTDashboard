"use client";

import { useState } from "react";
import { useDashboard } from "@/lib/context";
import { CategoryBar } from "@/components/charts/CategoryBar";
import { CompositionChart } from "@/components/charts/CompositionChart";
import {
  DISEASE_CATEGORIES,
  CATEGORY_SHORT_NAMES,
  shortenCountryName,
} from "@/lib/constants";

type DrillLevel = 0 | 1 | 2;

export default function ByDiseasePage() {
  const { loading, selectedYear, getYearData, getWorldDiseaseMix, data } =
    useDashboard();
  const worldMix = getWorldDiseaseMix();
  const [level, setLevel] = useState<DrillLevel>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  if (loading) return <div className="text-secondary">Loading...</div>;

  const yearData = getYearData();
  if (!yearData) return <div className="text-warning">No data available</div>;

  const countries = yearData.countries;
  const countryNames = Object.keys(countries);
  const colors = data?.constants?.colors || {};

  // Calculate category totals
  const catTotals: Record<string, number> = {};
  DISEASE_CATEGORIES.forEach((cat) => {
    catTotals[cat] = Object.values(countries).reduce(
      (sum, c) => sum + (c.diseases[cat]?.value || 0),
      0,
    );
  });

  const goToLevel0 = () => {
    setLevel(0);
    setSelectedCategory(null);
    setSelectedSub(null);
  };

  const goToLevel1 = (category: string) => {
    setLevel(1);
    setSelectedCategory(category);
    setSelectedSub(null);
  };

  const goToLevel2 = (sub: string) => {
    setLevel(2);
    setSelectedSub(sub);
  };

  // ─────────────────────────────────────────────────────────────
  // Level 0: Category Overview
  // ─────────────────────────────────────────────────────────────
  if (level === 0) {
    const chartData = Object.entries(catTotals)
      .map(([name, value]) => ({
        name: CATEGORY_SHORT_NAMES[name] || name,
        fullName: name,
        value,
        color: colors[name] || "#546E7A",
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-trust-navy font-heading">By Disease</h1>
          <p className="text-secondary mt-1">
            Explore disease categories and drill down to sub-diseases and
            geography
          </p>
        </div>

        {/* Grid: KPI Cards + Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Cards - Left side */}
          <div className="grid grid-cols-2 gap-3">
            {DISEASE_CATEGORIES.map((cat) => {
              const totalM = catTotals[cat] / 1000;
              const color = colors[cat] || "#546E7A";
              const shortName = CATEGORY_SHORT_NAMES[cat] || cat;

              return (
                <div
                  key={cat}
                  className="card cursor-pointer hover:border-trust-accent transition-all hover:shadow-md"
                  style={{ borderColor: `${color}55` }}
                  onClick={() => goToLevel1(cat)}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color }}
                  >
                    {shortName}
                  </div>
                  <div className="text-xl font-bold text-primary font-serif">
                    {totalM.toFixed(0)}M
                  </div>
                  <div className="text-xs text-secondary">DALYs</div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart - Right side */}
          <div className="card">
            <h2 className="section-title">Total DALYs by Category (Absolute Values)</h2>
            <p className="text-xs text-secondary mb-3">
              Absolute DALY values in thousands across all 15 countries
            </p>
            <CategoryBar
              data={chartData}
              title=""
              horizontal
            />
          </div>
        </div>

        {/* Composition Chart */}
        <div className="card">
          <h2 className="section-title">Disease category mix by country + World</h2>
          <CompositionChart
            yearData={yearData}
            colors={colors}
            worldDiseaseMix={worldMix}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Level 1: Category Detail (Sub-diseases)
  // ─────────────────────────────────────────────────────────────
  if (level === 1 && selectedCategory) {
    // Aggregate sub-diseases across all countries
    const subTotals: Record<string, number> = {};
    Object.values(countries).forEach((c) => {
      const catData = c.diseases[selectedCategory];
      if (catData?.sub) {
        Object.entries(catData.sub).forEach(([subName, subData]) => {
          subTotals[subName] = (subTotals[subName] || 0) + subData.value;
        });
      }
    });

    // Country breakdown for this category
    const countryTotals: Record<string, number> = {};
    const countryPct: Record<string, number> = {};
    Object.entries(countries).forEach(([name, c]) => {
      countryTotals[shortenCountryName(name)] =
        c.diseases[selectedCategory]?.value || 0;
      countryPct[shortenCountryName(name)] =
        c.diseases[selectedCategory]?.pct || 0;
    });

    const subChartData = Object.entries(subTotals)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[selectedCategory] || "#4472C4",
      }))
      .sort((a, b) => b.value - a.value);

    const countryChartData = Object.entries(countryPct)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[selectedCategory] || "#4472C4",
      }))
      .sort((a, b) => b.value - a.value);

    const categoryShort =
      CATEGORY_SHORT_NAMES[selectedCategory] || selectedCategory;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button
            onClick={goToLevel0}
            className="text-trust-accent hover:underline"
          >
            All Categories
          </button>
          <span className="text-secondary mx-2">›</span>
          <span className="font-medium">{selectedCategory}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sub-diseases - LEFT (clickable bars) */}
          <div className="card">
            <h2 className="section-title">
              Sub-diseases (click to see by country)
            </h2>
            {subChartData.length > 0 ? (
              <div className="space-y-2">
                {subChartData.map((item) => {
                  const maxVal = Math.max(...subChartData.map((d) => d.value));
                  const barWidth = (item.value / maxVal) * 100;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 cursor-pointer hover:bg-trust-light p-2 rounded-md transition-colors"
                      onClick={() => goToLevel2(item.name)}
                    >
                      <div
                        className="w-32 text-sm text-primary truncate"
                        title={item.name}
                      >
                        {item.name}
                      </div>
                      <div className="flex-1 bg-gray-100 rounded h-4 overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                      <div className="w-16 text-right text-sm text-secondary">
                        {(item.value / 1000).toFixed(0)}k
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-secondary">No sub-disease data available</p>
            )}
          </div>

          {/* Country breakdown - RIGHT */}
          <div className="card">
            <h2 className="section-title">{categoryShort} burden by country</h2>
            <CategoryBar
              data={countryChartData}
              title="% of Country Total DALYs"
              horizontal
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Level 2: Sub-disease by Country
  // ─────────────────────────────────────────────────────────────
  if (level === 2 && selectedCategory && selectedSub) {
    // Get values for this sub-disease across countries
    const absVals: Record<string, number> = {};
    const pctVals: Record<string, number> = {};

    Object.entries(countries).forEach(([name, c]) => {
      const catData = c.diseases[selectedCategory];
      const subData = catData?.sub?.[selectedSub];
      absVals[shortenCountryName(name)] = subData?.value || 0;
      pctVals[shortenCountryName(name)] = subData?.pct || 0;
    });

    const absChartData = Object.entries(absVals)
      .map(([name, value]) => ({
        name,
        value,
        color: colors[selectedCategory] || "#4472C4",
      }))
      .sort((a, b) => b.value - a.value);

    const pctChartData = Object.entries(pctVals)
      .map(([name, value]) => ({
        name,
        value,
        color: `${colors[selectedCategory] || "#4472C4"}AA`,
      }))
      .sort((a, b) => b.value - a.value);

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <button
            onClick={goToLevel0}
            className="text-trust-accent hover:underline"
          >
            All Categories
          </button>
          <span className="text-secondary mx-2">›</span>
          <button
            onClick={() => goToLevel1(selectedCategory)}
            className="text-trust-accent hover:underline"
          >
            {selectedCategory}
          </button>
          <span className="text-secondary mx-2">›</span>
          <span className="font-medium">{selectedSub}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="section-title">
              {selectedSub} — absolute DALYs by country
            </h2>
            <CategoryBar
              data={absChartData}
              title="DALYs (thousands)"
              horizontal
            />
          </div>

          <div className="card">
            <h2 className="section-title">
              {selectedSub} — % of country total
            </h2>
            <CategoryBar
              data={pctChartData}
              title="% of Total DALYs"
              horizontal
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
