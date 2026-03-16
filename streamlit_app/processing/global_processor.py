"""
Global DALY data processor.
Refactored from categorise_daly_global.py for use in Streamlit app.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Any, Optional
from pathlib import Path

from .constants import (
    AVAILABLE_YEARS,
    GLOBAL_COLUMNS,
    GHE_LABEL_MAP,
    GHE_TO_CATEGORY,
    DISEASE_CATEGORIES,
)


class GlobalProcessor:
    """Process WHO GHE DALY global Excel files (multi-year)."""

    # Year sheets in the global file
    YEAR_SHEETS = [
        ("Global 2000", "2000"),
        ("Global 2010", "2010"),
        ("Global 2015", "2015"),
        ("Global 2019", "2019"),
        ("Global 2020", "2020"),
        ("Global 2021", "2021"),
    ]

    N_COLS = len(GLOBAL_COLUMNS)  # 19 columns
    DATA_COL_START = 6  # 0-based index of first value column

    def __init__(self, file_path: str):
        """
        Initialize processor with path to raw global Excel file.

        Args:
            file_path: Path to ghe2021daly_global.xlsx file
        """
        self.file_path = Path(file_path)
        self.data_by_year: Dict[str, Dict] = {}
        self.population_by_year: Dict[str, List[float]] = {}

    def load_year_sheet(self, sheet_name: str) -> Tuple[List[List], Dict[int, List[float]], List[float], str]:
        """
        Load one 'Global YYYY' sheet from the raw WHO file.

        Returns:
            header_rows: List of 9 lists (raw rows 0-8)
            data_lookup: Dict mapping ghe_code -> [19 float values]
            pop_vals: List of 19 floats (population in thousands)
            year_str: Year as string
        """
        df = pd.read_excel(self.file_path, sheet_name=sheet_name, header=None)

        header_rows = [list(df.iloc[ri]) for ri in range(9)]

        # Year string from row 4 (0-indexed row 3), column F (0-based index 5)
        year_raw = df.iloc[3].iloc[5]
        year_str = str(int(year_raw)) if pd.notna(year_raw) else sheet_name.split()[-1]

        # Population (row 8, 0-indexed row 7)
        pop_row = df.iloc[7]
        pop_vals = [
            float(pop_row.iloc[self.DATA_COL_START + ci])
            if pd.notna(pop_row.iloc[self.DATA_COL_START + ci])
            else 0.0
            for ci in range(self.N_COLS)
        ]

        # Cause data (rows 10+, 0-indexed 9+)
        data_lookup = {}
        for ri in range(9, len(df)):
            row = df.iloc[ri]
            ghe_raw = row.iloc[0]
            if pd.isna(ghe_raw):
                continue
            try:
                ghe_code = int(float(ghe_raw))
            except (ValueError, TypeError):
                continue

            vals = [
                float(row.iloc[self.DATA_COL_START + ci])
                if pd.notna(row.iloc[self.DATA_COL_START + ci])
                else 0.0
                for ci in range(self.N_COLS)
            ]
            data_lookup[ghe_code] = vals

        return header_rows, data_lookup, pop_vals, year_str

    def process_all_years(self) -> Dict[str, Any]:
        """
        Process all year sheets from the global file.

        Returns:
            Dictionary with data for all years
        """
        for sheet_name, year_hint in self.YEAR_SHEETS:
            try:
                header_rows, data_lookup, pop_vals, year_str = self.load_year_sheet(sheet_name)
                self.data_by_year[year_str] = {
                    "header_rows": header_rows,
                    "data_lookup": data_lookup,
                    "population": pop_vals,
                }
                self.population_by_year[year_str] = pop_vals
            except Exception as e:
                print(f"Warning: Could not load sheet '{sheet_name}': {e}")

        return self.data_by_year

    def get_both_sexes_total(self, year: str, ghe_code: int) -> float:
        """Get Both sexes, Total value for a GHE code in a year."""
        if year not in self.data_by_year:
            return 0.0
        data_lookup = self.data_by_year[year]["data_lookup"]
        vals = data_lookup.get(ghe_code, [0.0] * self.N_COLS)
        return vals[0]  # Index 0 = Both sexes, Total

    def get_male_total(self, year: str, ghe_code: int) -> float:
        """Get Male Total value for a GHE code in a year."""
        if year not in self.data_by_year:
            return 0.0
        data_lookup = self.data_by_year[year]["data_lookup"]
        vals = data_lookup.get(ghe_code, [0.0] * self.N_COLS)
        return vals[1]  # Index 1 = Male, Total

    def get_female_total(self, year: str, ghe_code: int) -> float:
        """Get Female Total value for a GHE code in a year."""
        if year not in self.data_by_year:
            return 0.0
        data_lookup = self.data_by_year[year]["data_lookup"]
        vals = data_lookup.get(ghe_code, [0.0] * self.N_COLS)
        return vals[2]  # Index 2 = Female, Total

    def get_category_total(self, year: str, category: str) -> float:
        """
        Get total DALYs for a disease category in a year.
        """
        if year not in self.data_by_year:
            return 0.0

        data_lookup = self.data_by_year[year]["data_lookup"]
        total = 0.0

        for ghe_code, vals in data_lookup.items():
            if GHE_TO_CATEGORY.get(ghe_code) == category:
                total += vals[0]  # Both sexes, Total

        return total

    def get_world_disease_mix(self, year: str = "2021") -> Dict[str, float]:
        """
        Calculate global disease category percentages.

        Returns:
            Dict mapping category -> percentage of total
        """
        total_dalys = self.get_both_sexes_total(year, 0)  # GHE 0 = All Causes
        if total_dalys == 0:
            return {}

        mix = {}
        for category in DISEASE_CATEGORIES:
            cat_total = self.get_category_total(year, category)
            pct = (cat_total / total_dalys) * 100
            if pct > 0.1:  # Only include categories with > 0.1%
                mix[category] = round(pct, 1)

        return mix

    def get_trends_data(self) -> Dict[str, Dict[str, float]]:
        """
        Get trend data across all years for key GHE codes.

        Returns:
            Dict mapping year -> {ghe_code: value}
        """
        trends = {}
        key_codes = [0, 10, 20, 600, 1510]  # Summary codes

        for year in self.data_by_year.keys():
            trends[year] = {}
            for ghe_code in key_codes:
                trends[year][ghe_code] = self.get_both_sexes_total(year, ghe_code)

        return trends

    def get_category_trends(self) -> Dict[str, Dict[str, float]]:
        """
        Get trend data for each disease category across years.

        Returns:
            Dict mapping category -> {year: total}
        """
        trends = {cat: {} for cat in DISEASE_CATEGORIES}

        for year in self.data_by_year.keys():
            for category in DISEASE_CATEGORIES:
                trends[category][year] = self.get_category_total(year, category)

        return trends

    def get_world_population(self, year: str = "2021") -> float:
        """Get world population for a year (in thousands)."""
        if year not in self.population_by_year:
            return 0.0
        return self.population_by_year[year][0]  # Both sexes, Total

    def get_world_daly_rate(self, year: str = "2021") -> float:
        """Calculate world DALY rate per 1,000 population."""
        total_dalys = self.get_both_sexes_total(year, 0)
        population = self.get_world_population(year)
        if population == 0:
            return 0.0
        return (total_dalys / population) * 1000

    def to_dashboard_format(self) -> Dict[str, Any]:
        """
        Convert processed data to dashboard-ready format.

        Returns:
            Dict with global data for dashboard
        """
        result = {
            "years": list(self.data_by_year.keys()),
            "worldDiseaseMix": {},
            "worldTrends": {},
            "categoryTrends": {},
            "worldDalyRates": {},
        }

        # World disease mix for each year
        for year in self.data_by_year.keys():
            result["worldDiseaseMix"][year] = self.get_world_disease_mix(year)
            result["worldDalyRates"][year] = round(self.get_world_daly_rate(year), 2)

        # Category trends
        result["categoryTrends"] = self.get_category_trends()

        # World trends for key indicators
        result["worldTrends"] = self.get_trends_data()

        return result


def validate_global_file(file_path: str) -> Tuple[bool, str]:
    """
    Validate that a file is a valid global DALY Excel file.

    Returns:
        Tuple of (is_valid, message)
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return False, f"File not found: {file_path}"

        if not path.suffix.lower() == ".xlsx":
            return False, "File must be an Excel (.xlsx) file"

        # Check for required sheets
        xl = pd.ExcelFile(file_path)
        expected_sheets = ["Global 2021", "Global 2020"]
        found = [s for s in expected_sheets if s in xl.sheet_names]
        if len(found) == 0:
            return False, "No 'Global YYYY' sheets found - this may not be a global DALY file"

        return True, f"Valid global DALY file with {len(found)} year sheets"

    except Exception as e:
        return False, f"Error validating file: {str(e)}"