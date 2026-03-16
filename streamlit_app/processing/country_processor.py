"""
Country-level DALY data processor.
Refactored from categorise_daly_country.py for use in Streamlit app.
Supports both raw WHO files and pre-processed categorised files.
"""

import pandas as pd
from typing import Dict, List, Tuple, Any
from pathlib import Path

from .constants import (
    TARGET_COUNTRIES,
    AGE_GROUPS,
    GHE_TO_CATEGORY,
    CATEGORY_SUB_DISEASES,
    CATEGORY_PARENT_CODES,
    CATEGORY_LEAF_CODES,
    NCD_PARENT_CODE,
    NCD_EXCLUDED_CODES,
    EXCLUDED_FROM_TOTAL_CODES,
)


# Sheet name mappings for different file formats
RAW_SHEET_NAMES = {
    "All ages": "All ages",
    "0-4": "0-4",
    "5-14": "5-14",
    "15-29": "15-29",
    "30-49": "30-49",
    "50-59": "50-59",
    "60-69": "60-69",
    "70+": "70+",
}

CATEGORISED_SHEET_NAMES = {
    "All ages": "All ages Persons Categorised",
    "0-4": "Categorised(0-4)",
    "5-14": "Categorised(5-14)",
    "15-29": "Categorised(15-29)",
    "30-49": "Categorised(30-49)",
    "50-59": "Categorised(50-59)",
    "60-69": "Categorised(60-69)",
    "70+": "Categorised(70+)",
}

# Gender data sheet for categorised files
CATEGORISED_GENDER_SHEET = "All ages Gender Categorised"


class CountryProcessor:
    """Process WHO GHE DALY country-level Excel files (raw or categorised)."""

    def __init__(self, file_path: str):
        """
        Initialize processor with path to Excel file.

        Args:
            file_path: Path to DALY Excel file (raw or categorised)
        """
        self.file_path = Path(file_path)
        self.year = self._detect_year()
        self.data_by_sheet: Dict[str, Dict] = {}
        self.population: Dict[str, Dict[str, float]] = {}
        self.file_type = self._detect_file_type()
        self.sheet_mapping = (
            CATEGORISED_SHEET_NAMES if self.file_type == "categorised"
            else RAW_SHEET_NAMES
        )

    def _detect_year(self) -> str:
        """Detect year from filename."""
        name = self.file_path.stem
        # Try to extract year from filename
        for year in ["2000", "2010", "2015", "2019", "2020", "2021"]:
            if year in name:
                return year
        return "unknown"

    def _detect_file_type(self) -> str:
        """Detect if file is raw or categorised format."""
        try:
            xl = pd.ExcelFile(self.file_path)
            sheet_names = xl.sheet_names

            # Check for categorised file indicators
            if "All ages Persons Categorised" in sheet_names:
                return "categorised"
            elif "Categorised(0-4)" in sheet_names:
                return "categorised"
            else:
                return "raw"
        except Exception:
            return "raw"

    def _get_actual_sheet_name(self, logical_name: str) -> str:
        """Get the actual sheet name in the file for a logical sheet name."""
        return self.sheet_mapping.get(logical_name, logical_name)

    def load_sheet(self, logical_sheet_name: str) -> Tuple[List[List], Dict[str, int], Dict, Dict]:
        """
        Load one sheet from the Excel file.

        Args:
            logical_sheet_name: Logical name of sheet (e.g., 'All ages', '0-4', etc.)

        Returns:
            header_rows: List of lists (rows 0-8, all columns)
            country_cols: Dict mapping country_name -> column index
            data_lookup: Dict mapping (sex, ghe_code) -> {country_name: value}
            pop_lookup: Dict mapping sex -> {country_name: population}
        """
        actual_sheet_name = self._get_actual_sheet_name(logical_sheet_name)
        df = pd.read_excel(self.file_path, sheet_name=actual_sheet_name, header=None)

        header_row_idx = 6
        country_row = df.iloc[header_row_idx]

        country_cols = {}
        for ci, val in enumerate(country_row):
            if pd.notna(val) and ci > 6:
                country_cols[str(val).strip()] = ci

        data_lookup = {}
        pop_lookup = {}

        for ri in range(9, len(df)):
            row = df.iloc[ri]
            sex = row.iloc[0]
            ghe_raw = row.iloc[1]
            col3 = row.iloc[3]

            if pd.isna(sex):
                continue
            sex = str(sex).strip()

            # Population row
            if pd.isna(ghe_raw) and pd.notna(col3) and str(col3).startswith('Population'):
                country_vals = {}
                for cn, ci in country_cols.items():
                    val = row.iloc[ci]
                    country_vals[cn] = float(val) if pd.notna(val) else 0.0
                pop_lookup[sex] = country_vals
                continue

            if pd.isna(ghe_raw):
                continue

            try:
                ghe_code = int(float(ghe_raw))
            except (ValueError, TypeError):
                continue

            country_vals = {}
            for cn, ci in country_cols.items():
                v = row.iloc[ci]
                country_vals[cn] = float(v) if pd.notna(v) else 0.0

            data_lookup[(sex, ghe_code)] = country_vals

        header_rows = [list(df.iloc[ri]) for ri in range(min(9, len(df)))]

        return header_rows, country_cols, data_lookup, pop_lookup

    def process_all_sheets(self) -> Dict[str, Any]:
        """
        Process all relevant sheets from the Excel file.

        Returns:
            Dictionary with processed data for all sheets
        """
        sheets_to_process = ["All ages"] + AGE_GROUPS

        for sheet_name in sheets_to_process:
            try:
                header_rows, country_cols, data_lookup, pop_lookup = self.load_sheet(sheet_name)
                self.data_by_sheet[sheet_name] = {
                    "header_rows": header_rows,
                    "country_cols": country_cols,
                    "data_lookup": data_lookup,
                    "pop_lookup": pop_lookup,
                }
                if sheet_name == "All ages":
                    self.population = pop_lookup
            except Exception as e:
                print(f"Warning: Could not load sheet '{sheet_name}': {e}")

        # For categorised files, also load gender data from separate sheet
        if self.file_type == "categorised":
            try:
                self._load_gender_sheet()
            except Exception as e:
                print(f"Warning: Could not load gender sheet: {e}")

        return self.data_by_sheet

    def _load_gender_sheet(self):
        """Load gender data from the categorised gender sheet."""
        df = pd.read_excel(self.file_path, sheet_name=CATEGORISED_GENDER_SHEET, header=None)

        header_row_idx = 6
        country_row = df.iloc[header_row_idx]

        country_cols = {}
        for ci, val in enumerate(country_row):
            if pd.notna(val) and ci > 6:
                country_cols[str(val).strip()] = ci

        # Store gender data in data_by_sheet for get_gender_split to use
        gender_data = {"Males": {}, "Females": {}}
        pop_data = {"Males": {}, "Females": {}}

        for ri in range(9, len(df)):
            row = df.iloc[ri]
            sex = row.iloc[0]
            ghe_raw = row.iloc[1]
            col3 = row.iloc[3]

            if pd.isna(sex):
                continue
            sex = str(sex).strip()

            if sex not in ["Males", "Females"]:
                continue

            # Population row
            if pd.isna(ghe_raw) and pd.notna(col3) and str(col3).startswith('Population'):
                for cn, ci in country_cols.items():
                    val = row.iloc[ci]
                    pop_data[sex][cn] = float(val) if pd.notna(val) else 0.0
                continue

            if pd.isna(ghe_raw):
                continue

            try:
                ghe_code = int(float(ghe_raw))
            except (ValueError, TypeError):
                continue

            # Only care about total DALYs (GHE code 0)
            if ghe_code == 0:
                for cn, ci in country_cols.items():
                    v = row.iloc[ci]
                    gender_data[sex][cn] = float(v) if pd.notna(v) else 0.0

        self.data_by_sheet["gender"] = {
            "data": gender_data,
            "population": pop_data,
        }

    def get_country_data(self, country: str, sheet: str = "All ages") -> Dict[str, float]:
        """
        Get all GHE values for a specific country.

        Args:
            country: Country name
            sheet: Sheet name (default: 'All ages')

        Returns:
            Dict mapping ghe_code -> value
        """
        if sheet not in self.data_by_sheet:
            return {}

        data_lookup = self.data_by_sheet[sheet]["data_lookup"]
        result = {}

        for (sex, ghe_code), country_vals in data_lookup.items():
            if sex == "Persons" and country in country_vals:
                result[ghe_code] = country_vals[country]

        return result

    def get_population(self, country: str, sex: str = "Persons") -> float:
        """Get population for a country."""
        if sex in self.population and country in self.population[sex]:
            return self.population[sex][country]
        return 0.0

    def get_total_dalys(self, country: str, sheet: str = "All ages") -> float:
        """Get total DALYs (GHE code 0) for a country."""
        data = self.get_country_data(country, sheet)
        return data.get(0, 0.0)

    def get_adjusted_total_dalys(self, country: str, sheet: str = "All ages") -> float:
        """
        Get adjusted total DALYs for a country.

        Subtracts the removed/excluded GHE codes from the total to get
        the correct base for percentage calculations.
        """
        data = self.get_country_data(country, sheet)
        total = data.get(0, 0.0)
        excluded = sum(data.get(code, 0.0) for code in EXCLUDED_FROM_TOTAL_CODES)
        return total - excluded

    def get_category_totals(self, country: str, sheet: str = "All ages") -> Dict[str, float]:
        """
        Calculate totals for each disease category.

        Uses parent codes for categories that have them (to avoid double-counting),
        and sums leaf codes for categories without a parent code.
        NCD is handled specially: code 600 minus Mental, SA, and Others codes.

        Returns:
            Dict mapping category name -> total DALYs
        """
        data = self.get_country_data(country, sheet)
        totals = {}

        # Categories with parent codes - use the parent code directly
        for category, parent_code in CATEGORY_PARENT_CODES.items():
            if parent_code in data:
                totals[category] = data[parent_code]

        # Categories without parent codes - sum the leaf codes
        for category, leaf_codes in CATEGORY_LEAF_CODES.items():
            total = sum(data.get(code, 0.0) for code in leaf_codes)
            if total > 0:
                totals[category] = total

        # NCD needs special handling: code 600 minus codes shown in other categories
        if NCD_PARENT_CODE in data:
            ncd_total = data[NCD_PARENT_CODE]
            excluded_total = sum(data.get(code, 0.0) for code in NCD_EXCLUDED_CODES)
            ncd_adjusted = ncd_total - excluded_total
            if ncd_adjusted > 0:
                totals["Noncommunicable Diseases"] = ncd_adjusted

        return totals

    def get_sub_disease_values(self, country: str, category: str,
                                sheet: str = "All ages") -> Dict[str, float]:
        """
        Get values for sub-diseases within a category.

        Returns:
            Dict mapping sub-disease name -> value
        """
        data = self.get_country_data(country, sheet)
        sub_diseases = CATEGORY_SUB_DISEASES.get(category, {})

        result = {}
        for name, ghe_code in sub_diseases.items():
            result[name] = data.get(ghe_code, 0.0)

        return result

    def get_age_distribution(self, country: str) -> Dict[str, float]:
        """
        Get DALY distribution across age groups for a country.

        Returns:
            Dict mapping age group -> percentage of total
        """
        total = self.get_total_dalys(country, "All ages")
        if total == 0:
            return {ag: 0.0 for ag in AGE_GROUPS}

        distribution = {}
        for age_group in AGE_GROUPS:
            age_total = self.get_total_dalys(country, age_group)
            distribution[age_group] = (age_total / total) * 100

        return distribution

    def get_gender_split(self, country: str) -> Dict[str, float]:
        """
        Get DALY split between males and females.

        Returns:
            Dict with male_pct, female_pct, male_pop_pct, female_pop_pct
        """
        default_result = {
            "male_pct": 50.0, "female_pct": 50.0,
            "male_pop_pct": 50.0, "female_pop_pct": 50.0
        }

        # For categorised files, use the separate gender sheet data
        if "gender" in self.data_by_sheet:
            gender_data = self.data_by_sheet["gender"]["data"]
            pop_data = self.data_by_sheet["gender"]["population"]

            male_total = gender_data.get("Males", {}).get(country, 0.0)
            female_total = gender_data.get("Females", {}).get(country, 0.0)
            total = male_total + female_total

            male_pop = pop_data.get("Males", {}).get(country, 0.0)
            female_pop = pop_data.get("Females", {}).get(country, 0.0)
            total_pop = male_pop + female_pop

            return {
                "male_pct": (male_total / total * 100) if total > 0 else 50.0,
                "female_pct": (female_total / total * 100) if total > 0 else 50.0,
                "male_pop_pct": (male_pop / total_pop * 100) if total_pop > 0 else 50.0,
                "female_pop_pct": (female_pop / total_pop * 100) if total_pop > 0 else 50.0,
            }

        # For raw files, use the All ages sheet data
        if "All ages" not in self.data_by_sheet:
            return default_result

        data_lookup = self.data_by_sheet["All ages"]["data_lookup"]

        male_total = data_lookup.get(("Males", 0), {}).get(country, 0.0)
        female_total = data_lookup.get(("Females", 0), {}).get(country, 0.0)
        total = male_total + female_total

        male_pop = self.population.get("Males", {}).get(country, 0.0)
        female_pop = self.population.get("Females", {}).get(country, 0.0)
        total_pop = male_pop + female_pop

        return {
            "male_pct": (male_total / total * 100) if total > 0 else 50.0,
            "female_pct": (female_total / total * 100) if total > 0 else 50.0,
            "male_pop_pct": (male_pop / total_pop * 100) if total_pop > 0 else 50.0,
            "female_pop_pct": (female_pop / total_pop * 100) if total_pop > 0 else 50.0,
        }

    def to_dashboard_format(self) -> Dict[str, Any]:
        """
        Convert processed data to dashboard-ready format.

        Returns:
            Dict matching the structure expected by the Streamlit dashboard
        """
        result = {
            "year": self.year,
            "countries": {},
            "ageGroups": {ag: {} for ag in AGE_GROUPS},
            "gender": {
                "malePct": {},
                "femalePct": {},
                "malePopPct": {},
                "femalePopPct": {},
            },
        }

        # Get the country columns from whichever "All ages" equivalent we loaded
        all_ages_data = self.data_by_sheet.get("All ages", {})
        available_countries = all_ages_data.get("country_cols", {})

        for country in TARGET_COUNTRIES:
            if country not in available_countries:
                continue

            total = self.get_total_dalys(country)
            population = self.get_population(country)
            daly_rate = (total / population * 1000) if population > 0 else 0.0

            # Category data with sub-diseases
            diseases = {}
            category_totals = self.get_category_totals(country)

            # Use sum of all categories as denominator to ensure percentages add to 100%
            categorized_sum = sum(category_totals.values())

            for cat, cat_total in category_totals.items():
                pct = (cat_total / categorized_sum * 100) if categorized_sum > 0 else 0.0
                sub_values = self.get_sub_disease_values(country, cat)

                sub_data = {}
                for sub_name, sub_value in sub_values.items():
                    sub_pct = (sub_value / categorized_sum * 100) if categorized_sum > 0 else 0.0
                    sub_data[sub_name] = {"value": sub_value, "pct": sub_pct}

                diseases[cat] = {
                    "value": cat_total,
                    "pct": pct,
                    "sub": sub_data,
                }

            result["countries"][country] = {
                "total": total,
                "population": population,
                "dalyRate": round(daly_rate, 2),
                "dalyRateVsWorld": round((daly_rate / 380.0) * 100, 1),
                "diseases": diseases,
            }

            # Age distribution
            age_dist = self.get_age_distribution(country)
            for ag, pct in age_dist.items():
                result["ageGroups"][ag][country] = round(pct, 2)

            # Gender split
            gender = self.get_gender_split(country)
            result["gender"]["malePct"][country] = round(gender["male_pct"], 2)
            result["gender"]["femalePct"][country] = round(gender["female_pct"], 2)
            result["gender"]["malePopPct"][country] = round(gender["male_pop_pct"], 2)
            result["gender"]["femalePopPct"][country] = round(gender["female_pop_pct"], 2)

        return result


def validate_country_file(file_path: str) -> Tuple[bool, str]:
    """
    Validate that a file is a valid country DALY Excel file.
    Supports both raw WHO files and pre-processed categorised files.

    Returns:
        Tuple of (is_valid, message)
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return False, f"File not found: {file_path}"

        if not path.suffix.lower() == ".xlsx":
            return False, "File must be an Excel (.xlsx) file"

        # Check for required sheets (either raw or categorised format)
        xl = pd.ExcelFile(file_path)
        sheet_names = xl.sheet_names

        # Check for raw format
        has_raw_format = "All ages" in sheet_names

        # Check for categorised format
        has_categorised_format = "All ages Persons Categorised" in sheet_names

        if not has_raw_format and not has_categorised_format:
            return False, (
                f"Missing required sheets. Expected 'All ages' (raw format) or "
                f"'All ages Persons Categorised' (categorised format). Found: {sheet_names[:5]}..."
            )

        # Determine which sheet to test
        test_sheet = "All ages" if has_raw_format else "All ages Persons Categorised"

        # Try to load a sample
        df = pd.read_excel(file_path, sheet_name=test_sheet, header=None, nrows=15)
        if len(df) < 10:
            return False, "File appears to have insufficient data rows"

        file_type = "raw" if has_raw_format else "categorised"
        return True, f"Valid country DALY file ({file_type} format)"

    except Exception as e:
        return False, f"Error validating file: {str(e)}"
