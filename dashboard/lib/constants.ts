// Target countries for analysis (15 countries)
export const TARGET_COUNTRIES = [
  "Bangladesh",
  "Brunei Darussalam",
  "Cambodia",
  "China",
  "India",
  "Indonesia",
  "Japan",
  "Lao People's Democratic Republic",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Republic of Korea",
  "Singapore",
  "Thailand",
  "Viet Nam",
];

// Short display names for countries
export const COUNTRY_SHORT_NAMES: Record<string, string> = {
  "Lao People's Democratic Republic": "Lao PDR",
  "Republic of Korea": "South Korea",
  "Brunei Darussalam": "Brunei",
  "Viet Nam": "Vietnam",
};

// Disease categories
export const DISEASE_CATEGORIES = [
  "Infectious & Parasitic",
  "Maternal, Perinatal & Nutritional",
  "Noncommunicable Diseases",
  "Injuries",
  "Mental & Substance Disorders",
  "Substance Abuse",
  "Others",
] as const;

export type DiseaseCategory = (typeof DISEASE_CATEGORIES)[number];

// Short names for categories
export const CATEGORY_SHORT_NAMES: Record<string, string> = {
  "Infectious & Parasitic": "Infectious",
  "Maternal, Perinatal & Nutritional": "MPNc",
  "Noncommunicable Diseases": "NCDs",
  "Injuries": "Injuries",
  "Mental & Substance Disorders": "Mental",
  "Substance Abuse": "Substance",
  "Others": "Others",
};

// Color scheme for disease categories
export const DISEASE_COLORS: Record<string, string> = {
  "Infectious & Parasitic": "#4472C4",
  "Maternal, Perinatal & Nutritional": "#C00000",
  "Noncommunicable Diseases": "#70AD47",
  "Injuries": "#FFC000",
  "Mental & Substance Disorders": "#7030A0",
  "Substance Abuse": "#9B59B6",
  "Others": "#546E7A",
};

// Age groups and colors
export const AGE_GROUPS = ["0-4", "5-14", "15-29", "30-49", "50-59", "60-69", "70+"];

export const AGE_COLORS = [
  "#ef4444", // 0-4 (red)
  "#f97316", // 5-14 (orange)
  "#eab308", // 15-29 (yellow)
  "#22c55e", // 30-49 (green)
  "#06b6d4", // 50-59 (cyan)
  "#3b82f6", // 60-69 (blue)
  "#8b5cf6", // 70+ (purple)
];

// World average DALY rate per 1,000 population (fallback - use actual data when available)
export const WORLD_DALY_RATE = 380.0;

// ISO3 code mappings for World Bank API
export const ISO3_TO_COUNTRY: Record<string, string> = {
  BGD: "Bangladesh",
  BRN: "Brunei Darussalam",
  KHM: "Cambodia",
  CHN: "China",
  IND: "India",
  IDN: "Indonesia",
  JPN: "Japan",
  LAO: "Lao People's Democratic Republic",
  MYS: "Malaysia",
  MMR: "Myanmar",
  PHL: "Philippines",
  KOR: "Republic of Korea",
  SGP: "Singapore",
  THA: "Thailand",
  VNM: "Viet Nam",
};

export const COUNTRY_TO_ISO3: Record<string, string> = {
  Bangladesh: "BGD",
  "Brunei Darussalam": "BRN",
  Cambodia: "KHM",
  China: "CHN",
  India: "IND",
  Indonesia: "IDN",
  Japan: "JPN",
  "Lao People's Democratic Republic": "LAO",
  Malaysia: "MYS",
  Myanmar: "MMR",
  Philippines: "PHL",
  "Republic of Korea": "KOR",
  Singapore: "SGP",
  Thailand: "THA",
  "Viet Nam": "VNM",
};

// ASEAN member countries (10 countries)
export const ASEAN_COUNTRIES = [
  "Brunei Darussalam",
  "Cambodia",
  "Indonesia",
  "Lao People's Democratic Republic",
  "Malaysia",
  "Myanmar",
  "Philippines",
  "Singapore",
  "Thailand",
  "Viet Nam",
];

// Check if a country is ASEAN member
export function isASEANCountry(country: string): boolean {
  return ASEAN_COUNTRIES.includes(country);
}

// Available years
export const AVAILABLE_YEARS = ["2000", "2010", "2015", "2019", "2020", "2021"];

// Helper function to shorten country names
export function shortenCountryName(name: string): string {
  return COUNTRY_SHORT_NAMES[name] || name;
}

// Disease category reference notes
export const DISEASE_NOTES = [
  {
    category: "Infectious & Parasitic",
    color: "#4472C4",
    desc: "Diseases caused by pathogenic microorganisms — bacteria, viruses, parasites, and fungi — that can be transmitted directly or indirectly.",
    examples: "Tuberculosis (TB), diarrhoeal diseases, lower respiratory infections, HIV/AIDS, malaria, dengue, hepatitis B & C, meningitis",
  },
  {
    category: "Maternal, Perinatal & Nutritional",
    color: "#C00000",
    desc: "Conditions arising during pregnancy, childbirth, and the neonatal period, as well as nutritional deficiencies.",
    examples: "Maternal haemorrhage, preterm birth complications, birth asphyxia, neonatal sepsis, protein-energy malnutrition, iron-deficiency anaemia",
  },
  {
    category: "Noncommunicable Diseases",
    color: "#70AD47",
    desc: "Chronic, non-infectious conditions that progress slowly and persist over long periods. Leading cause of death globally.",
    examples: "Cardiovascular diseases, stroke, cancers (lung, liver, breast), diabetes, COPD, asthma",
  },
  {
    category: "Injuries",
    color: "#FFC000",
    desc: "Health loss from external causes — both unintentional accidents and deliberate acts of violence.",
    examples: "Road traffic accidents, falls, drowning, burns, interpersonal violence, collective violence and war",
  },
  {
    category: "Mental & Substance Disorders",
    color: "#7030A0",
    desc: "Conditions affecting mood, thinking, and behaviour, causing significant impairment in functioning.",
    examples: "Depressive disorders, anxiety disorders, self-harm, eating disorders, ADHD, conduct disorder",
  },
  {
    category: "Substance Abuse",
    color: "#9B59B6",
    desc: "Health burden from harmful use of psychoactive substances, including dependence and substance-induced damage.",
    examples: "Alcohol use disorders, drug use disorders (opioid, stimulant, cannabis)",
  },
  {
    category: "Others",
    color: "#546E7A",
    desc: "Residual category of diseases not in A–F, covering chronic non-communicable and organ-specific conditions.",
    examples: "Neurological (Alzheimer's, Parkinson's), musculoskeletal (osteoarthritis), digestive, sense organ diseases, skin diseases",
  },
];
