"""
Preprocessing script for:
  - heat.csv          (World Bank ESG Heat Index 35 data)
  - ghe202daly_categorised.xlsx  (WHO DALY categorised by cause)
  - ghe2021_daly_bycountry_2021.xlsx  (WHO DALY by country)

Outputs:
  - heat_apac.csv             : Heat index time series for 15 APAC countries
  - daly_categorised_apac.csv : DALY by disease category for 15 APAC countries
  - daly_bycountry_apac.csv   : Full WHO DALY by country/cause for 15 APAC countries
  - combined_apac.csv         : Merged heat + top-level DALY categories (wide format)

Usage:
  python preprocess_heat_daly.py
  # Output files are written to ./output/
"""

import pandas as pd
import numpy as np
import os

OUTPUT_DIR = "./output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Country mappings ──────────────────────────────────────────────────────────

APAC_COUNTRIES = {
    "BGD": "Bangladesh",
    "BRN": "Brunei",
    "KHM": "Cambodia",
    "CHN": "China",
    "IND": "India",
    "IDN": "Indonesia",
    "JPN": "Japan",
    "LAO": "Lao PDR",
    "MYS": "Malaysia",
    "MMR": "Myanmar",
    "PHL": "Philippines",
    "THA": "Thailand",
    "KOR": "Republic of Korea",
    "SGP": "Singapore",
    "VNM": "Viet Nam",
}

# ASEAN membership (10 members; of our 15, these 10 are ASEAN)
ASEAN_CODES = {"BRN", "KHM", "IDN", "LAO", "MYS", "MMR", "PHL", "SGP", "THA", "VNM"}
NON_ASEAN_CODES = {"BGD", "CHN", "IND", "JPN", "KOR"}

# Map from WHO spreadsheet country labels to ISO-3 codes
WHO_COUNTRY_LABEL_TO_ISO = {
    "Bangladesh":                        "BGD",
    "Brunei Darussalam":                 "BRN",
    "Cambodia":                          "KHM",
    "China":                             "CHN",
    "India":                             "IND",
    "Indonesia":                         "IDN",
    "Japan":                             "JPN",
    "Lao People's Democratic Republic":  "LAO",
    "Malaysia":                          "MYS",
    "Myanmar":                           "MMR",
    "Philippines":                       "PHL",
    "Republic of Korea":                 "KOR",
    "Singapore":                         "SGP",
    "Viet Nam":                          "VNM",
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Heat Index data
# ─────────────────────────────────────────────────────────────────────────────

def process_heat(filepath: str) -> pd.DataFrame:
    """
    Reads the World Bank ESG heat.csv.
    Returns long-format DataFrame: [iso3, country, group, year, heat_index]
    where group is 'ASEAN' or 'Non-ASEAN'.
    """
    df = pd.read_csv(filepath)

    # Filter to APAC countries
    apac_df = df[df["REF_AREA"].isin(APAC_COUNTRIES.keys())].copy()

    # Year columns are the numeric column names (1970..2020)
    year_cols = [c for c in apac_df.columns if str(c).isdigit()]

    # Melt to long format
    long = apac_df.melt(
        id_vars=["REF_AREA", "REF_AREA_LABEL"],
        value_vars=year_cols,
        var_name="year",
        value_name="heat_index",
    )

    long = long.rename(columns={"REF_AREA": "iso3", "REF_AREA_LABEL": "country_wb"})
    long["year"] = long["year"].astype(int)

    # Standardise country name and add group
    long["country"] = long["iso3"].map(APAC_COUNTRIES)
    long["group"] = long["iso3"].apply(lambda x: "ASEAN" if x in ASEAN_CODES else "Non-ASEAN")

    # Drop rows with missing heat index (shouldn't be many)
    long = long.dropna(subset=["heat_index"])
    long = long.sort_values(["iso3", "year"]).reset_index(drop=True)

    # Derived columns
    long["decade"] = (long["year"] // 10 * 10).astype(str) + "s"

    out_cols = ["iso3", "country", "group", "year", "decade", "heat_index"]
    result = long[out_cols]
    result.to_csv(f"{OUTPUT_DIR}/heat_apac.csv", index=False)
    print(f"[heat]  Saved {len(result)} rows → {OUTPUT_DIR}/heat_apac.csv")
    return result


# ─────────────────────────────────────────────────────────────────────────────
# 2. WHO DALY – Categorised (ghe202daly_categorised.xlsx → CategorisedPersons)
# ─────────────────────────────────────────────────────────────────────────────

def process_daly_categorised(filepath: str) -> pd.DataFrame:
    """
    Parses the CategorisedPersons sheet.
    Row 6: country headers start at col 7 (index).
    Rows 10+: Persons rows contain cause + DALY values per country.
    Returns long-format DataFrame: [iso3, country, group, cause_code, cause, daly_000]
    """
    raw = pd.read_excel(filepath, sheet_name="CategorisedPersons", header=None)

    # ── Identify country columns ──────────────────────────────────────────────
    header_row = raw.iloc[6]
    iso_row    = raw.iloc[7]

    country_cols = {}  # col_index -> iso3
    for col_idx in range(len(header_row)):
        iso = iso_row[col_idx]
        if isinstance(iso, str) and iso in WHO_COUNTRY_LABEL_TO_ISO.values():
            country_cols[col_idx] = iso

    # ── Parse cause rows ──────────────────────────────────────────────────────
    records = []
    for i in range(10, len(raw)):
        row = raw.iloc[i]
        if not (isinstance(row[0], str) and row[0].strip() == "Persons"):
            continue

        # Extract cause name from cols 3, 4, 5 (take last non-null)
        cause = None
        for j in [3, 4, 5]:
            val = row[j]
            if isinstance(val, str) and val.strip():
                cause = val.strip().replace("\xa0", " ")

        if cause is None:
            continue

        # Extract GHE code (col 1)
        code = row[1] if pd.notna(row[1]) else None

        for col_idx, iso3 in country_cols.items():
            daly_val = row[col_idx]
            if pd.notna(daly_val):
                records.append({
                    "iso3":       iso3,
                    "country":    APAC_COUNTRIES[iso3],
                    "group":      "ASEAN" if iso3 in ASEAN_CODES else "Non-ASEAN",
                    "cause_code": code,
                    "cause":      cause,
                    "daly_000":   float(daly_val),
                })

    df = pd.DataFrame(records)

    # Per-capita DALY rate (per 100 000 population) — needs population row
    pop_row = raw.iloc[9]
    pop_map = {}
    for col_idx, iso3 in country_cols.items():
        pval = pop_row[col_idx]
        if pd.notna(pval):
            pop_map[iso3] = float(pval)   # population in thousands

    df["pop_000"] = df["iso3"].map(pop_map)
    # daly_000 / pop_000 * 100 = DALY per 100 000 people
    df["daly_per_100k"] = (df["daly_000"] / df["pop_000"] * 100).round(2)

    df.to_csv(f"{OUTPUT_DIR}/daly_categorised_apac.csv", index=False)
    print(f"[daly]  Saved {len(df)} rows → {OUTPUT_DIR}/daly_categorised_apac.csv")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 3. WHO DALY – By Country (ghe2021_daly_bycountry_2021.xlsx → All ages)
# ─────────────────────────────────────────────────────────────────────────────

def process_daly_bycountry(filepath: str) -> pd.DataFrame:
    """
    Parses the 'All ages' sheet of the by-country DALY file.
    Returns long-format DataFrame with full cause hierarchy for APAC countries.
    """
    raw = pd.read_excel(filepath, sheet_name="All ages", header=None)

    # Header row 6 contains country names, row 7 contains ISO-3 codes
    header_row = raw.iloc[6]

    # Find which columns correspond to our 15 APAC countries
    country_cols = {}  # col_idx -> iso3
    for col_idx, val in enumerate(header_row):
        if isinstance(val, str) and val.strip() in WHO_COUNTRY_LABEL_TO_ISO:
            iso3 = WHO_COUNTRY_LABEL_TO_ISO[val.strip()]
            country_cols[col_idx] = iso3

    if not country_cols:
        # Fallback: use ISO row (row 7) to match
        iso_row = raw.iloc[7]
        for col_idx, val in enumerate(iso_row):
            if isinstance(val, str) and val.strip() in APAC_COUNTRIES:
                country_cols[col_idx] = val.strip()

    records = []
    for i in range(10, len(raw)):
        row = raw.iloc[i]
        if not (isinstance(row[0], str) and row[0].strip() == "Persons"):
            continue

        # Reconstruct hierarchical cause from cols 3-6
        cause_parts = []
        for j in [3, 4, 5, 6]:
            v = row[j]
            if isinstance(v, str) and v.strip():
                cause_parts.append(v.strip().replace("\xa0", " "))
        if not cause_parts:
            continue
        cause = " > ".join(cause_parts)
        cause_leaf = cause_parts[-1]
        code = row[1] if pd.notna(row[1]) else None

        for col_idx, iso3 in country_cols.items():
            daly_val = row[col_idx]
            if pd.notna(daly_val):
                records.append({
                    "iso3":       iso3,
                    "country":    APAC_COUNTRIES[iso3],
                    "group":      "ASEAN" if iso3 in ASEAN_CODES else "Non-ASEAN",
                    "cause_code": code,
                    "cause_full": cause,
                    "cause":      cause_leaf,
                    "daly_000":   float(daly_val),
                })

    df = pd.DataFrame(records)
    df.to_csv(f"{OUTPUT_DIR}/daly_bycountry_apac.csv", index=False)
    print(f"[daly]  Saved {len(df)} rows → {OUTPUT_DIR}/daly_bycountry_apac.csv")
    return df


# ─────────────────────────────────────────────────────────────────────────────
# 4. Combined dataset (heat 2020 + top DALY categories)
# ─────────────────────────────────────────────────────────────────────────────

def build_combined(heat_df: pd.DataFrame, daly_cat_df: pd.DataFrame) -> pd.DataFrame:
    """
    Merges 2020 heat index with DALY categories (2021) per country.
    Pivots DALY categories to wide format for easy correlation analysis.
    """
    # Heat for year 2020
    heat_2020 = (
        heat_df[heat_df["year"] == 2020][["iso3", "country", "group", "heat_index"]]
        .rename(columns={"heat_index": "heat_index_2020"})
    )

    # Top-level DALY categories only (broad groupings)
    TOP_LEVEL_CAUSES = [
        "All Causes",
        "Communicable, maternal, perinatal and nutritional conditions",
        "Noncommunicable diseases",
        "Injuries incl War",
        "Cardiovascular diseases",
        "Diabetes mellitus",
        "Malaria",
        "Dengue",
        "Diarrhoeal diseases",
        "Respiratory Infectious",
        "Chronic obstructive pulmonary disease",
    ]
    daly_top = daly_cat_df[daly_cat_df["cause"].isin(TOP_LEVEL_CAUSES)].copy()

    # Pivot to wide
    daly_wide = daly_top.pivot_table(
        index="iso3", columns="cause", values="daly_per_100k", aggfunc="first"
    ).reset_index()
    daly_wide.columns.name = None
    # Clean column names
    daly_wide.columns = [
        c if c == "iso3" else f"daly_{c.lower().replace(' ','_').replace(',','').replace('/','_')[:40]}"
        for c in daly_wide.columns
    ]

    combined = heat_2020.merge(daly_wide, on="iso3", how="left")
    combined.to_csv(f"{OUTPUT_DIR}/combined_apac.csv", index=False)
    print(f"[combo] Saved {len(combined)} rows → {OUTPUT_DIR}/combined_apac.csv")
    return combined


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Processing Heat Index ===")
    heat_df = process_heat("heat.csv")

    print("\n=== Processing WHO DALY (Categorised) ===")
    daly_cat_df = process_daly_categorised("ghe202daly_categorised.xlsx")

    print("\n=== Processing WHO DALY (By Country) ===")
    daly_bc_df = process_daly_bycountry("ghe2021_daly_bycountry_2021.xlsx")

    print("\n=== Building Combined Dataset ===")
    combined_df = build_combined(heat_df, daly_cat_df)

    print("\n=== Summary ===")
    print(f"Heat rows       : {len(heat_df)}")
    print(f"DALY cat rows   : {len(daly_cat_df)}")
    print(f"DALY country rows: {len(daly_bc_df)}")
    print(f"Combined rows   : {len(combined_df)}")
    print("\nDone! Outputs in ./output/")
