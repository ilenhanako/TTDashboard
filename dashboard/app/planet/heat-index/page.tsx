"use client";

import { useState } from "react";
import Link from "next/link";
import { useHeat } from "@/lib/heat-context";
import { OverviewTab } from "./tabs/OverviewTab";
import { HeatTrendsTab } from "./tabs/HeatTrendsTab";
import { ASEANComparisonTab } from "./tabs/ASEANComparisonTab";

const tabs = [
  { id: "overview", label: "Overview", icon: "1" },
  { id: "trends", label: "Heat Trends", icon: "2" },
  { id: "asean", label: "ASEAN vs Non-ASEAN", icon: "3" },
];

export default function HeatIndexPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { loading, error } = useHeat();

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading heat data: {error}</p>
          <Link href="/planet" className="text-trust-blue hover:underline">
            Return to Planet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/planet"
              className="text-secondary hover:text-trust-navy transition-colors"
            >
              Planet
            </Link>
            <span className="text-secondary">/</span>
            <span className="text-trust-navy font-semibold">Heat Index 35</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-trust-navy">
            Heat Index 35 Dashboard
          </h1>
          <p className="text-secondary text-sm mt-1">
            Heat Stress Exposure (days with heat index ≥ 35°C) | World Bank ESG Data 1970-2020
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-[#ff6b35] border-[#ff6b35]"
                    : "text-secondary border-transparent hover:text-trust-navy hover:border-gray-300"
                }`}
              >
                <span className="mr-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-xs">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
              <p className="text-secondary">Loading heat data from World Bank API...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "trends" && <HeatTrendsTab />}
            {activeTab === "asean" && <ASEANComparisonTab />}
          </>
        )}
      </div>
    </div>
  );
}
