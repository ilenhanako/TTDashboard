"use client";

import Link from "next/link";
import { DISEASE_NOTES, CATEGORY_SHORT_NAMES, TARGET_COUNTRIES, COUNTRY_SHORT_NAMES } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="breadcrumb mb-4">
          <Link href="/" className="text-trust-accent hover:underline">
            Home
          </Link>
          <span className="text-secondary mx-2">›</span>
          <span className="font-medium">About This Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold text-trust-navy font-heading">About This Dashboard</h1>
        <p className="text-secondary mt-1">
          Understanding the WHO DALY data and disease categories
        </p>
      </div>

      {/* What is DALY */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">What is DALY?</h2>
        <p className="text-secondary mb-4">
          <strong className="text-primary">DALY (Disability-Adjusted Life Year)</strong> is a measure of overall disease burden,
          expressed as the number of years lost due to ill-health, disability or early death. One DALY represents the loss of
          the equivalent of one year of full health.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-trust-light/50 p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-2">Years of Life Lost (YLL)</h3>
            <p className="text-sm text-secondary">
              Years lost due to premature mortality, calculated from the age at death against a standard life expectancy.
            </p>
          </div>
          <div className="bg-trust-light/50 p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-2">Years Lived with Disability (YLD)</h3>
            <p className="text-sm text-secondary">
              Years lived in less than full health, weighted by the severity of the disability.
            </p>
          </div>
        </div>
        <p className="text-sm text-secondary mt-4 italic">
          DALY = YLL + YLD
        </p>
      </div>

      {/* Data Source */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">Data Source</h2>
        <p className="text-secondary mb-4">
          This dashboard uses data from the <strong className="text-primary">WHO Global Health Estimates (GHE)</strong>,
          which provide comprehensive and comparable health statistics for all WHO Member States. The GHE synthesize
          multiple data sources to produce internally consistent estimates of disease burden.
        </p>
        <div className="bg-trust-light/50 p-4 rounded-lg">
          <h3 className="font-medium text-primary mb-2">Countries Covered ({TARGET_COUNTRIES.length})</h3>
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
        <h2 className="text-xl font-semibold text-primary mb-6">Disease Category Reference Guide</h2>
        <p className="text-secondary mb-6">
          The WHO categorizes diseases into the following major groups for DALY estimation:
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

      {/* Methodology Notes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">Methodology Notes</h2>
        <ul className="space-y-3 text-secondary">
          <li className="flex gap-2">
            <span className="text-trust-accent">•</span>
            <span>
              <strong className="text-primary">DALY Rate</strong> is expressed as DALYs per 1,000 population,
              allowing for comparison between countries of different sizes.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">•</span>
            <span>
              <strong className="text-primary">World Average</strong> DALY rate of ~380 per 1,000 is used as
              a benchmark for comparison.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">•</span>
            <span>
              <strong className="text-primary">Age-specific</strong> data shows the distribution of disease
              burden across different life stages.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-trust-accent">•</span>
            <span>
              <strong className="text-primary">Gender-disaggregated</strong> data reveals differences in
              disease burden between males and females.
            </span>
          </li>
        </ul>
      </div>

      {/* Back Link */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="px-6 py-2 bg-trust-blue text-white rounded-md hover:bg-trust-accent transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
