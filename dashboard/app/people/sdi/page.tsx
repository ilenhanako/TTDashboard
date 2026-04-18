"use client";

import { useState } from "react";
import Link from "next/link";
import { OverviewTab } from "./tabs/OverviewTab";
import { WorldContextTab } from "./tabs/WorldContextTab";
import { APACTrendsTab } from "./tabs/APACTrendsTab";
import { GroupComparisonTab } from "./tabs/GroupComparisonTab";
import { UploadTab } from "./tabs/UploadTab";

const tabs = [
  { id: "overview", label: "Overview", icon: "1" },
  { id: "world", label: "World Context", icon: "2" },
  { id: "apac", label: "APAC Trends", icon: "3" },
  { id: "groups", label: "ASEAN vs Non-ASEAN", icon: "4" },
  { id: "upload", label: "Upload Data", icon: "↑" },
];

export default function SDIPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-2">
            <Link
              href="/people"
              className="text-secondary hover:text-trust-navy transition-colors"
            >
              People
            </Link>
            <span className="text-secondary">/</span>
            <span className="text-trust-navy font-semibold">SDI Dashboard</span>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-trust-navy">
                Socio-Demographic Index Dashboard
              </h1>
              <p className="text-secondary text-sm mt-1">
                IHME GBD 2023 | 1990-2023 | 186 Countries
              </p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-blue-50 text-blue-600 border border-blue-200">
                186 Countries
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-teal-50 text-teal-600 border border-teal-200">
                ASEAN x10
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-50 text-purple-600 border border-purple-200">
                Non-ASEAN x5
              </span>
            </div>
          </div>
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
                    ? "text-[#38bdf8] border-[#38bdf8]"
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
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "world" && <WorldContextTab />}
        {activeTab === "apac" && <APACTrendsTab />}
        {activeTab === "groups" && <GroupComparisonTab />}
        {activeTab === "upload" && <UploadTab />}
      </div>
    </div>
  );
}
