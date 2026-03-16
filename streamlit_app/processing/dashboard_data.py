"""
Dashboard data generator.
Combines country and global processed data into dashboard-ready JSON format.
"""

import json
from typing import Dict, List, Any, Optional
from pathlib import Path
from datetime import datetime

from .constants import (
    TARGET_COUNTRIES,
    DISEASE_CATEGORIES,
    COLORS,
    AGE_GROUPS,
    AGE_COLORS,
    CATEGORY_SHORT_NAMES,
    WORLD_DALY_RATE,
    AVAILABLE_YEARS,
)
from .country_processor import CountryProcessor
from .global_processor import GlobalProcessor


class DashboardDataGenerator:
    """Generate dashboard-ready JSON from processed DALY data."""

    def __init__(self, output_dir: str = "data/processed", load_existing: bool = True):
        """
        Initialize the generator.

        Args:
            output_dir: Directory to save processed JSON files
            load_existing: If True, load existing data to merge with new data
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.country_data: Dict[str, Dict] = {}  # year -> country data
        self.global_data: Optional[Dict] = None
        self.metadata: Dict = {
            "created": None,
            "updated": None,
            "years_processed": [],
            "source_files": [],
        }

        # Load existing data to preserve previous years
        if load_existing:
            self._load_existing_data()

    def _load_existing_data(self):
        """Load existing dashboard data to preserve previous years when adding new data."""
        file_path = self.output_dir / "dashboard_data.json"
        if not file_path.exists():
            return

        try:
            with open(file_path, "r") as f:
                existing = json.load(f)

            # Restore country data by year
            by_year = existing.get("data", {}).get("byYear", {})
            for year, year_data in by_year.items():
                self.country_data[year] = {
                    "year": year,
                    "countries": year_data.get("countries", {}),
                    "ageGroups": year_data.get("ageGroups", {}),
                    "gender": year_data.get("gender", {}),
                }

            # Restore global data
            if "global" in existing.get("data", {}):
                self.global_data = existing["data"]["global"]

            # Restore metadata
            existing_meta = existing.get("metadata", {})
            if existing_meta.get("created"):
                self.metadata["created"] = existing_meta["created"]
            self.metadata["years_processed"] = existing_meta.get("years_processed", [])
            self.metadata["source_files"] = existing_meta.get("source_files", [])

        except Exception as e:
            print(f"Warning: Could not load existing data: {e}")

    def process_country_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process a single country DALY file.

        Args:
            file_path: Path to the country Excel file

        Returns:
            Processed data for that year
        """
        processor = CountryProcessor(file_path)
        processor.process_all_sheets()
        data = processor.to_dashboard_format()

        year = data["year"]
        self.country_data[year] = data

        self.metadata["source_files"].append({
            "type": "country",
            "path": str(file_path),
            "year": year,
            "processed": datetime.now().isoformat(),
        })

        if year not in self.metadata["years_processed"]:
            self.metadata["years_processed"].append(year)
            self.metadata["years_processed"].sort()

        return data

    def process_global_file(self, file_path: str) -> Dict[str, Any]:
        """
        Process the global DALY file.

        Args:
            file_path: Path to the global Excel file

        Returns:
            Processed global data
        """
        processor = GlobalProcessor(file_path)
        processor.process_all_years()
        self.global_data = processor.to_dashboard_format()

        self.metadata["source_files"].append({
            "type": "global",
            "path": str(file_path),
            "years": self.global_data["years"],
            "processed": datetime.now().isoformat(),
        })

        return self.global_data

    def process_multiple_files(self, country_files: List[str],
                                global_file: Optional[str] = None) -> Dict[str, Any]:
        """
        Process multiple country files and optionally a global file.

        Args:
            country_files: List of paths to country Excel files
            global_file: Optional path to global Excel file

        Returns:
            Combined dashboard data
        """
        for file_path in country_files:
            try:
                self.process_country_file(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")

        if global_file:
            try:
                self.process_global_file(global_file)
            except Exception as e:
                print(f"Error processing global file: {e}")

        return self.generate_dashboard_json()

    def generate_dashboard_json(self) -> Dict[str, Any]:
        """
        Generate the complete dashboard JSON structure.

        Returns:
            Complete dashboard data dictionary
        """
        # Get the most recent year's data as default
        years_available = sorted(self.country_data.keys(), reverse=True)
        default_year = years_available[0] if years_available else "2021"

        dashboard = {
            "metadata": {
                **self.metadata,
                "updated": datetime.now().isoformat(),
            },
            "config": {
                "defaultYear": default_year,
                "availableYears": years_available,
                "worldDalyRate": WORLD_DALY_RATE,
            },
            "constants": {
                "countries": TARGET_COUNTRIES,
                "categories": DISEASE_CATEGORIES,
                "categoryShortNames": CATEGORY_SHORT_NAMES,
                "colors": COLORS,
                "ageGroups": AGE_GROUPS,
                "ageColors": AGE_COLORS,
            },
            "data": {
                "byYear": {},
            },
        }

        # Add country data by year
        for year, year_data in self.country_data.items():
            dashboard["data"]["byYear"][year] = {
                "countries": year_data.get("countries", {}),
                "ageGroups": year_data.get("ageGroups", {}),
                "gender": year_data.get("gender", {}),
            }

        # Add global data
        if self.global_data:
            dashboard["data"]["global"] = self.global_data
            dashboard["data"]["worldDiseaseMix"] = self.global_data.get(
                "worldDiseaseMix", {}
            ).get(default_year, {})
        else:
            # Estimate world disease mix from country data if no global file
            dashboard["data"]["worldDiseaseMix"] = self._estimate_world_mix(default_year)

        # Add time series data for trends
        dashboard["data"]["timeSeries"] = self._build_time_series()

        return dashboard

    def _estimate_world_mix(self, year: str) -> Dict[str, float]:
        """Estimate world disease mix from country data when global data unavailable."""
        if year not in self.country_data:
            return {}

        year_data = self.country_data[year]
        total_by_cat = {cat: 0.0 for cat in DISEASE_CATEGORIES}
        grand_total = 0.0

        for country, c_data in year_data.get("countries", {}).items():
            grand_total += c_data.get("total", 0)
            for cat, cat_data in c_data.get("diseases", {}).items():
                total_by_cat[cat] = total_by_cat.get(cat, 0) + cat_data.get("value", 0)

        if grand_total == 0:
            return {}

        return {
            cat: round((val / grand_total) * 100, 1)
            for cat, val in total_by_cat.items()
            if val > 0
        }

    def _build_time_series(self) -> Dict[str, Any]:
        """Build time series data for trend analysis."""
        time_series = {
            "dalyRates": {},  # country -> {year: rate}
            "categoryTotals": {},  # category -> {year: {country: value}}
            "totalDalys": {},  # country -> {year: total}
        }

        for country in TARGET_COUNTRIES:
            time_series["dalyRates"][country] = {}
            time_series["totalDalys"][country] = {}

            for year, year_data in self.country_data.items():
                c_data = year_data.get("countries", {}).get(country, {})
                time_series["dalyRates"][country][year] = c_data.get("dalyRate", 0)
                time_series["totalDalys"][country][year] = c_data.get("total", 0)

        for category in DISEASE_CATEGORIES:
            time_series["categoryTotals"][category] = {}
            for year in self.country_data.keys():
                time_series["categoryTotals"][category][year] = {}
                for country in TARGET_COUNTRIES:
                    c_data = self.country_data[year].get("countries", {}).get(country, {})
                    cat_data = c_data.get("diseases", {}).get(category, {})
                    time_series["categoryTotals"][category][year][country] = cat_data.get("value", 0)

        return time_series

    def save(self, filename: str = "dashboard_data.json") -> str:
        """
        Save dashboard data to JSON file.

        Returns:
            Path to saved file
        """
        dashboard = self.generate_dashboard_json()
        output_path = self.output_dir / filename

        with open(output_path, "w") as f:
            json.dump(dashboard, f, indent=2)

        # Also save metadata separately
        meta_path = self.output_dir / "metadata.json"
        with open(meta_path, "w") as f:
            json.dump(self.metadata, f, indent=2)

        return str(output_path)

    def load(self, filename: str = "dashboard_data.json") -> Optional[Dict[str, Any]]:
        """
        Load existing dashboard data from JSON file.

        Returns:
            Dashboard data dictionary or None if not found
        """
        file_path = self.output_dir / filename
        if not file_path.exists():
            return None

        with open(file_path, "r") as f:
            return json.load(f)

    def get_single_year_data(self, year: str) -> Optional[Dict[str, Any]]:
        """
        Get dashboard data for a single year.

        Useful for the main dashboard views.
        """
        if year not in self.country_data:
            return None

        year_data = self.country_data[year]

        return {
            "countries": year_data.get("countries", {}),
            "ageGroups": year_data.get("ageGroups", {}),
            "gender": year_data.get("gender", {}),
            "worldDiseaseMix": self.global_data.get("worldDiseaseMix", {}).get(year, {})
            if self.global_data else self._estimate_world_mix(year),
            "colors": COLORS,
        }


def load_dashboard_data(data_dir: str = "data/processed") -> Optional[Dict[str, Any]]:
    """
    Convenience function to load existing dashboard data.

    Args:
        data_dir: Directory containing processed data

    Returns:
        Dashboard data dictionary or None
    """
    generator = DashboardDataGenerator(data_dir)
    return generator.load()


def process_and_save(country_files: List[str],
                     global_file: Optional[str] = None,
                     output_dir: str = "data/processed") -> str:
    """
    Convenience function to process files and save dashboard data.

    Args:
        country_files: List of country Excel file paths
        global_file: Optional global Excel file path
        output_dir: Output directory for JSON files

    Returns:
        Path to saved dashboard data file
    """
    generator = DashboardDataGenerator(output_dir)
    generator.process_multiple_files(country_files, global_file)
    return generator.save()
