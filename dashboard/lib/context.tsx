"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { DashboardData, YearData } from "./types";

interface DashboardContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  availableYears: string[];
  getYearData: (year?: string) => YearData | null;
  getWorldDalyRate: (year?: string) => number;
  getWorldDiseaseMix: (year?: string) => Record<string, number>;
  refreshData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("2021");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/data/dashboard_data.json", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Failed to load data");
      const json = await response.json();
      setData(json);

      // Set default year from config
      const defaultYear = json.config?.defaultYear || json.config?.availableYears?.[0];
      if (defaultYear) setSelectedYear(defaultYear);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const availableYears = data?.config?.availableYears || [];

  const getYearData = (year?: string): YearData | null => {
    const targetYear = year || selectedYear;
    return data?.data?.byYear?.[targetYear] || null;
  };

  const getWorldDalyRate = (year?: string): number => {
    const targetYear = year || selectedYear;
    const globalData = data?.data?.global;
    if (globalData?.worldDalyRates?.[targetYear]) {
      // World rates are stored per 1,000,000 population, convert to per 1,000
      return globalData.worldDalyRates[targetYear] / 1000;
    }
    // Fallback to config value
    return data?.config?.worldDalyRate || 380.0;
  };

  const getWorldDiseaseMix = (year?: string): Record<string, number> => {
    const targetYear = year || selectedYear;
    const globalData = data?.data?.global;
    if (globalData?.worldDiseaseMix?.[targetYear]) {
      return globalData.worldDiseaseMix[targetYear];
    }
    // Fallback to top-level worldDiseaseMix
    return data?.data?.worldDiseaseMix || {};
  };

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        error,
        selectedYear,
        setSelectedYear,
        availableYears,
        getYearData,
        getWorldDalyRate,
        getWorldDiseaseMix,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
}
