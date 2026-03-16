"""
Data loading utilities for the Streamlit dashboard.
"""

import json
import streamlit as st
from pathlib import Path
from typing import Dict, Any, Optional, List

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from processing import (
    load_dashboard_data,
    TARGET_COUNTRIES,
    DISEASE_CATEGORIES,
    COLORS,
    AGE_GROUPS,
    CATEGORY_SHORT_NAMES,
    WORLD_DALY_RATE,
)


def get_data_dir() -> Path:
    """Get the path to the data directory."""
    return Path(__file__).parent.parent / "data" / "processed"


@st.cache_data(ttl=300)  # Cache for 5 minutes
def load_data() -> Optional[Dict[str, Any]]:
    """
    Load dashboard data from JSON file.

    Returns:
        Dashboard data dictionary or None if not found
    """
    data_dir = get_data_dir()
    data_file = data_dir / "dashboard_data.json"

    if not data_file.exists():
        return None

    try:
        with open(data_file, "r") as f:
            return json.load(f)
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None


def get_available_years(data: Optional[Dict] = None) -> List[str]:
    """Get list of available years from the data."""
    if data is None:
        data = load_data()

    if data is None:
        return []

    years = data.get("config", {}).get("availableYears", [])
    return sorted(years, reverse=True)


def get_year_data(year: str, data: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
    """
    Get dashboard data for a specific year.

    Args:
        year: Year string (e.g., "2021")
        data: Optional pre-loaded data

    Returns:
        Year-specific data dictionary
    """
    if data is None:
        data = load_data()

    if data is None:
        return None

    year_data = data.get("data", {}).get("byYear", {}).get(year)
    if year_data is None:
        return None

    # Add constants and global data
    return {
        **year_data,
        "colors": COLORS,
        "categoryShortNames": CATEGORY_SHORT_NAMES,
        "worldDalyRate": WORLD_DALY_RATE,
        "worldDiseaseMix": data.get("data", {}).get("worldDiseaseMix", {}),
    }


def get_time_series_data(data: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
    """Get time series data for trend analysis."""
    if data is None:
        data = load_data()

    if data is None:
        return None

    return data.get("data", {}).get("timeSeries", {})


def get_country_list() -> List[str]:
    """Get list of target countries."""
    return TARGET_COUNTRIES


def get_category_list() -> List[str]:
    """Get list of disease categories."""
    return DISEASE_CATEGORIES


def get_colors() -> Dict[str, str]:
    """Get color mapping for categories."""
    return COLORS


def get_age_groups() -> List[str]:
    """Get list of age groups."""
    return AGE_GROUPS


def data_exists() -> bool:
    """Check if processed data exists."""
    data_dir = get_data_dir()
    data_file = data_dir / "dashboard_data.json"
    return data_file.exists()


def get_metadata() -> Optional[Dict[str, Any]]:
    """Get metadata about processed data."""
    data = load_data()
    if data is None:
        return None
    return data.get("metadata", {})


def clear_cache():
    """Clear the data cache."""
    load_data.clear()
