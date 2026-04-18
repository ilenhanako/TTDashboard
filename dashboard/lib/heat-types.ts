// Heat Index data types

export interface HeatDataPoint {
  year: number;
  value: number;
}

export interface CountryHeatData {
  iso3: string;
  country: string;
  isASEAN: boolean;
  data: HeatDataPoint[];
}

export interface HeatContextType {
  heatData: CountryHeatData[];
  loading: boolean;
  error: string | null;
  // Computed values
  getHeat2020: () => { country: string; iso3: string; value: number; isASEAN: boolean }[];
  getHeatByYear: (year: number) => { country: string; iso3: string; value: number; isASEAN: boolean }[];
  getCountryTimeSeries: (iso3: string) => HeatDataPoint[];
  getMovingAverage: (iso3: string, window?: number) => HeatDataPoint[];
  getDecadeAverages: () => {
    decade: string;
    asean: number;
    nonAsean: number;
  }[];
  getGrowthRates: () => { country: string; iso3: string; growth: number; isASEAN: boolean }[];
  getGroupAverages: () => { year: number; asean: number; nonAsean: number }[];
  years: number[];
}

export type GroupFilter = "all" | "ASEAN" | "Non-ASEAN";
export type SmoothingMode = "raw" | "ma5";
