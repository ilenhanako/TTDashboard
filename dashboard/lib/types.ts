export interface SubDiseaseData {
  value: number;
  pct: number;
}

export interface DiseaseData {
  value: number;
  pct: number;
  sub?: Record<string, SubDiseaseData>;
}

export interface CountryData {
  total: number;
  population: number;
  dalyRate: number;
  dalyRateVsWorld: number;
  diseases: Record<string, DiseaseData>;
}

export interface YearData {
  countries: Record<string, CountryData>;
  ageGroups?: Record<string, Record<string, number>>;
  genderSplit?: {
    male: number;
    female: number;
  };
  worldDiseaseMix?: Record<string, number>;
}

export interface TimeSeriesData {
  dalyRates: Record<string, Record<string, number>>;
  totalDalys: Record<string, Record<string, number>>;
  categoryTotals: Record<string, Record<string, Record<string, number>>>;
}

export interface DashboardConfig {
  defaultYear: string;
  availableYears: string[];
  worldDalyRate: number;
}

export interface DashboardConstants {
  countries: string[];
  categories: string[];
  categoryShortNames: Record<string, string>;
  colors: Record<string, string>;
  ageGroups: string[];
  ageColors: string[];
}

export interface DashboardData {
  metadata: {
    created: string | null;
    updated: string;
    years_processed: string[];
  };
  config: DashboardConfig;
  constants: DashboardConstants;
  data: {
    byYear: Record<string, YearData>;
    timeSeries?: TimeSeriesData;
    worldDiseaseMix?: Record<string, number>;
  };
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}
