"use client";

import { useDashboard } from "@/lib/context";
import { MetricCard } from "@/components/MetricCard";
import Link from "next/link";

export default function HomePage() {
  const { data, loading, error, selectedYear, getYearData } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-trust-blue">
          DALY Burden Dashboard
        </h1>
        <div className="card border-warning/50">
          <h2 className="text-lg font-semibold text-warning mb-2">
            Data Not Found
          </h2>
          <p className="text-secondary mb-4">
            No dashboard data is currently loaded. You can upload WHO GHE Excel
            files to generate the data.
          </p>
          <Link
            href="/upload"
            className="inline-block px-4 py-2 bg-trust-blue text-white rounded-md hover:bg-trust-accent transition-colors"
          >
            Upload Data Files
          </Link>
        </div>
      </div>
    );
  }

  const yearData = getYearData();
  const countries = yearData?.countries || {};
  const countryCount = Object.keys(countries).length;

  // Calculate totals
  const totalDALYs = Object.values(countries).reduce(
    (sum, c) => sum + c.total,
    0,
  );
  const totalPop = Object.values(countries).reduce(
    (sum, c) => sum + c.population,
    0,
  );
  const avgRate = totalPop > 0 ? (totalDALYs / totalPop) * 1000 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-blue">
          DALY Burden Dashboard
        </h1>
        <p className="text-secondary mt-1">
          Asia Pacific Region — WHO Global Health Estimates
        </p>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="section-title">Quick Stats ({selectedYear})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Countries" value={countryCount} />
          <MetricCard
            label="Total DALYs"
            value={`${(totalDALYs / 1000).toFixed(0)}M`}
          />
          <MetricCard
            label="Total Population"
            value={`${(totalPop / 1000).toFixed(0)}M`}
          />
          <MetricCard
            label="Avg DALY Rate"
            value={`${avgRate.toFixed(0)}/1000`}
            delta={avgRate > 380 ? "Above world avg" : "Below world avg"}
            deltaType={avgRate > 380 ? "negative" : "positive"}
          />
        </div>
      </div>

      {/* Navigation Cards */}
      <div>
        <h2 className="section-title">Explore the Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/overview"
            className="card hover:border-trust-accent transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                  Overview
                </h3>
                <p className="text-sm text-secondary mt-1">
                  DALY charts, age distribution, gender comparison, and disease
                  composition across the region.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/by-disease"
            className="card hover:border-trust-accent transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🦠</span>
              <div>
                <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                  By Disease
                </h3>
                <p className="text-sm text-secondary mt-1">
                  3-level drill-down from disease categories to sub-diseases to
                  country breakdown.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/by-country"
            className="card hover:border-trust-accent transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌏</span>
              <div>
                <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                  By Country
                </h3>
                <p className="text-sm text-secondary mt-1">
                  Country-specific analysis with KPIs, disease pie charts, and
                  age profiles.
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/time-series"
            className="card hover:border-trust-accent transition-colors group"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">📈</span>
              <div>
                <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                  Time Series
                </h3>
                <p className="text-sm text-secondary mt-1">
                  Trend analysis across years with DALY rate comparisons and
                  change summaries.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/upload"
          className="card hover:border-trust-accent transition-colors group bg-trust-light/30"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">📤</span>
            <div>
              <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                Upload Data
              </h3>
              <p className="text-sm text-secondary mt-1">
                Upload new WHO GHE Excel files to update the dashboard with
                fresh data.
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/about"
          className="card hover:border-trust-accent transition-colors group bg-trust-light/30"
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-primary group-hover:text-trust-blue">
                About This Dashboard
              </h3>
              <p className="text-sm text-secondary mt-1">
                Learn about DALYs, disease categories, data sources, and
                methodology.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
