// SDI Dashboard data types

export interface SDIDataPoint {
  year: number;
  value: number;
}

export interface CountrySDIData {
  country: string;
  shortName: string;
  isASEAN: boolean;
  color: string;
  data: number[]; // SDI values from 1990 to 2023 (34 years)
}

export interface WorldRegionData {
  region: string;
  data: number[]; // SDI values from 1990 to 2023
  color: string;
}

export interface GlobalRankEntry {
  name: string;
  sdi: number;
  rank: number;
  isAPAC: boolean;
}

export interface SDITier {
  label: string;
  className: string;
}

export type SDIHighlightFilter = "all" | "ASEAN" | "non-ASEAN" | string;
