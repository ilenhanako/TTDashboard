"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { ISO3_TO_COUNTRY, ASEAN_COUNTRIES } from "./constants";
import { HEAT_API_URL } from "./heat-constants";
import type { HeatContextType, CountryHeatData, HeatDataPoint } from "./heat-types";

const HeatContext = createContext<HeatContextType | null>(null);

interface WorldBankResponse {
  page: number;
  pages: number;
  per_page: number;
  total: number;
}

interface WorldBankDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
}

export function HeatProvider({ children }: { children: ReactNode }) {
  const [heatData, setHeatData] = useState<CountryHeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHeatData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(HEAT_API_URL);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const json = await response.json();

        // World Bank API returns [metadata, data[]]
        if (!Array.isArray(json) || json.length < 2) {
          throw new Error("Invalid API response format");
        }

        const dataPoints: WorldBankDataPoint[] = json[1] || [];

        // Group by country
        const countryMap = new Map<string, HeatDataPoint[]>();

        dataPoints.forEach((point) => {
          if (point.value === null) return;

          const iso3 = point.countryiso3code;
          if (!countryMap.has(iso3)) {
            countryMap.set(iso3, []);
          }
          countryMap.get(iso3)!.push({
            year: parseInt(point.date),
            value: point.value,
          });
        });

        // Convert to CountryHeatData array
        const processedData: CountryHeatData[] = [];

        countryMap.forEach((data, iso3) => {
          const countryName = ISO3_TO_COUNTRY[iso3];
          if (!countryName) return;

          // Sort by year
          data.sort((a, b) => a.year - b.year);

          processedData.push({
            iso3,
            country: countryName,
            isASEAN: ASEAN_COUNTRIES.includes(countryName),
            data,
          });
        });

        // Sort by country name
        processedData.sort((a, b) => a.country.localeCompare(b.country));

        setHeatData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch heat data");
        console.error("Heat data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatData();
  }, []);

  // Get all unique years from the data
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    heatData.forEach((country) => {
      country.data.forEach((point) => yearSet.add(point.year));
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [heatData]);

  // Get heat index for 2020 (or latest available year)
  const getHeat2020 = useCallback(() => {
    return heatData
      .map((country) => {
        const point = country.data.find((d) => d.year === 2020);
        return {
          country: country.country,
          iso3: country.iso3,
          value: point?.value ?? 0,
          isASEAN: country.isASEAN,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [heatData]);

  // Get heat index for a specific year
  const getHeatByYear = useCallback(
    (year: number) => {
      return heatData
        .map((country) => {
          const point = country.data.find((d) => d.year === year);
          return {
            country: country.country,
            iso3: country.iso3,
            value: point?.value ?? 0,
            isASEAN: country.isASEAN,
          };
        })
        .sort((a, b) => b.value - a.value);
    },
    [heatData]
  );

  // Get time series for a specific country
  const getCountryTimeSeries = useCallback(
    (iso3: string) => {
      const country = heatData.find((c) => c.iso3 === iso3);
      return country?.data || [];
    },
    [heatData]
  );

  // Calculate moving average
  const getMovingAverage = useCallback(
    (iso3: string, window: number = 5) => {
      const data = getCountryTimeSeries(iso3);
      if (data.length < window) return data;

      const result: HeatDataPoint[] = [];
      for (let i = window - 1; i < data.length; i++) {
        const windowData = data.slice(i - window + 1, i + 1);
        const avg = windowData.reduce((sum, d) => sum + d.value, 0) / window;
        result.push({ year: data[i].year, value: avg });
      }
      return result;
    },
    [getCountryTimeSeries]
  );

  // Calculate decade averages
  const getDecadeAverages = useCallback(() => {
    const decades = ["1970s", "1980s", "1990s", "2000s", "2010s"];
    const decadeRanges: Record<string, [number, number]> = {
      "1970s": [1970, 1979],
      "1980s": [1980, 1989],
      "1990s": [1990, 1999],
      "2000s": [2000, 2009],
      "2010s": [2010, 2019],
    };

    return decades.map((decade) => {
      const [start, end] = decadeRanges[decade];

      let aseanSum = 0;
      let aseanCount = 0;
      let nonAseanSum = 0;
      let nonAseanCount = 0;

      heatData.forEach((country) => {
        country.data.forEach((point) => {
          if (point.year >= start && point.year <= end) {
            if (country.isASEAN) {
              aseanSum += point.value;
              aseanCount++;
            } else {
              nonAseanSum += point.value;
              nonAseanCount++;
            }
          }
        });
      });

      return {
        decade,
        asean: aseanCount > 0 ? aseanSum / aseanCount : 0,
        nonAsean: nonAseanCount > 0 ? nonAseanSum / nonAseanCount : 0,
      };
    });
  }, [heatData]);

  // Calculate growth rates (1980-2020)
  const getGrowthRates = useCallback(() => {
    return heatData
      .map((country) => {
        const start = country.data.find((d) => d.year === 1980);
        const end = country.data.find((d) => d.year === 2020);

        let growth = 0;
        if (start && end && start.value > 0) {
          growth = ((end.value - start.value) / start.value) * 100;
        }

        return {
          country: country.country,
          iso3: country.iso3,
          growth,
          isASEAN: country.isASEAN,
        };
      })
      .sort((a, b) => b.growth - a.growth);
  }, [heatData]);

  // Calculate group averages over time
  const getGroupAverages = useCallback(() => {
    const yearMap = new Map<
      number,
      { aseanSum: number; aseanCount: number; nonAseanSum: number; nonAseanCount: number }
    >();

    heatData.forEach((country) => {
      country.data.forEach((point) => {
        if (!yearMap.has(point.year)) {
          yearMap.set(point.year, {
            aseanSum: 0,
            aseanCount: 0,
            nonAseanSum: 0,
            nonAseanCount: 0,
          });
        }
        const entry = yearMap.get(point.year)!;
        if (country.isASEAN) {
          entry.aseanSum += point.value;
          entry.aseanCount++;
        } else {
          entry.nonAseanSum += point.value;
          entry.nonAseanCount++;
        }
      });
    });

    return Array.from(yearMap.entries())
      .map(([year, data]) => ({
        year,
        asean: data.aseanCount > 0 ? data.aseanSum / data.aseanCount : 0,
        nonAsean: data.nonAseanCount > 0 ? data.nonAseanSum / data.nonAseanCount : 0,
      }))
      .sort((a, b) => a.year - b.year);
  }, [heatData]);

  const value: HeatContextType = {
    heatData,
    loading,
    error,
    getHeat2020,
    getHeatByYear,
    getCountryTimeSeries,
    getMovingAverage,
    getDecadeAverages,
    getGrowthRates,
    getGroupAverages,
    years,
  };

  return <HeatContext.Provider value={value}>{children}</HeatContext.Provider>;
}

export function useHeat() {
  const context = useContext(HeatContext);
  if (!context) {
    throw new Error("useHeat must be used within HeatProvider");
  }
  return context;
}
