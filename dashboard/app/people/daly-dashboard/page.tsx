"use client";

import { useDashboard } from "@/lib/context";
import { MetricCard } from "@/components/MetricCard";
import { DALYHeatMap } from "@/components/charts/DALYHeatMap";
import Link from "next/link";
import {
  DISEASE_NOTES,
  CATEGORY_SHORT_NAMES,
  TARGET_COUNTRIES,
  COUNTRY_SHORT_NAMES,
} from "@/lib/constants";

export default function PeopleDashboardPage() {
  const { data, loading, error, selectedYear, getYearData, getWorldDalyRate } =
    useDashboard();

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
        <h1 className="text-3xl font-bold text-trust-navy font-heading">
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
            href="/people/upload"
            className="inline-block px-4 py-2 bg-trust-blue text-white rounded-md hover:bg-trust-accent transition-colors"
          >
            Upload Data Files
          </Link>
          <Link
            href="/people"
            className="inline-block ml-3 px-4 py-2 border border-trust-blue text-trust-blue rounded-md hover:bg-trust-light transition-colors"
          >
            ← Back to People
          </Link>
        </div>
      </div>
    );
  }

  const yearData = getYearData();
  const countries = yearData?.countries || {};
  const countryCount = Object.keys(countries).length;
  const worldDalyRate = getWorldDalyRate();

  // Calculate totals
  const totalDALYs = Object.values(countries).reduce(
    (sum, c) => sum + c.total,
    0
  );
  const totalPop = Object.values(countries).reduce(
    (sum, c) => sum + c.population,
    0
  );
  const avgRate = totalPop > 0 ? (totalDALYs / totalPop) * 1000 : 0;

  // Prepare heat map data
  const heatMapData = Object.entries(countries).map(([name, d]) => ({
    name,
    dalyRate: d.dalyRate,
    total: d.total,
    population: d.population,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-trust-navy font-heading">
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
            delta={
              avgRate > worldDalyRate ? "Above world avg" : "Below world avg"
            }
            deltaType={avgRate > worldDalyRate ? "negative" : "positive"}
          />
        </div>
      </div>

      {/* Heat Map */}
      <div className="card">
        <h2 className="section-title">DALYS by Country ({selectedYear})</h2>
        <p className="text-sm text-secondary mb-4">
          Regional overview showing disease burden intensity. Countries are
          colored by their DALY per 1,000 population.
        </p>
        <DALYHeatMap data={heatMapData} worldDalyRate={worldDalyRate} />
      </div>

      {/* About Section - What is DALY */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4 font-heading">
          What is DALY?
        </h2>
        <p className="text-secondary mb-4">
          <strong className="text-primary">
            DALY (Disability-Adjusted Life Year)
          </strong>{" "}
          is a measure of overall disease burden, expressed as the number of
          years lost due to ill-health, disability or early death. One DALY
          represents the loss of the equivalent of one year of full health.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-trust-light/50 p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-2">
              Years of Life Lost (YLL)
            </h3>
            <p className="text-sm text-secondary">
              Years lost due to premature mortality, calculated from the age at
              death against a standard life expectancy.
            </p>
          </div>
          <div className="bg-trust-light/50 p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-2">
              Years Lived with Disability (YLD)
            </h3>
            <p className="text-sm text-secondary">
              Years lived in less than full health, weighted by the severity of
              the disability.
            </p>
          </div>
        </div>
        <p className="text-sm text-secondary mt-4 italic">DALY = YLL + YLD</p>
      </div>

      {/* Data Source */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4 font-heading">
          Data Source
        </h2>
        <p className="text-secondary mb-4">
          This dashboard uses data from the{" "}
          <strong className="text-primary">
            WHO Global Health Estimates (GHE)
          </strong>
          , which provide comprehensive and comparable health statistics for all
          WHO Member States. The GHE synthesize multiple data sources to produce
          internally consistent estimates of disease burden.
        </p>
        <div className="bg-trust-light/50 p-4 rounded-lg">
          <h3 className="font-medium text-primary mb-2">
            Countries Covered ({TARGET_COUNTRIES.length})
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {TARGET_COUNTRIES.map((country) => (
              <span
                key={country}
                className="px-2 py-1 bg-white border border-border rounded text-sm"
              >
                {COUNTRY_SHORT_NAMES[country] || country}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Disease Category Reference Guide */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-6 font-heading">
          Disease Category Reference Guide
        </h2>
        <p className="text-secondary mb-6">
          The WHO categorizes diseases into the following major groups for DALY
          estimation:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DISEASE_NOTES.map((note) => (
            <div
              key={note.category}
              className="bg-card border border-border rounded-lg p-4 border-l-4"
              style={{ borderLeftColor: note.color }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: note.color }}
                />
                <span className="text-sm font-semibold text-primary">
                  {CATEGORY_SHORT_NAMES[note.category] || note.category}
                </span>
              </div>
              <p className="text-xs text-secondary mb-2">{note.desc}</p>
              <p className="text-xs">
                <strong className="text-secondary">Key examples:</strong>{" "}
                <span className="text-trust-accent">{note.examples}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
