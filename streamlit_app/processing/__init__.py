"""
DALY Data Processing Module
============================
Refactored processing functions for WHO GHE DALY data.
"""

from .constants import (
    TARGET_COUNTRIES,
    DISEASE_CATEGORIES,
    COLORS,
    AGE_GROUPS,
    AGE_COLORS,
    GHE_LABEL_MAP,
    CATEGORY_SHORT_NAMES,
    MPNC_GHE_LABELS,
    MPNC_DISPLAY_ORDER,
    WORLD_DALY_RATE,
    COUNTRY_SHORT_NAMES,
    AVAILABLE_YEARS,
    CATEGORY_PARENT_CODES,
    CATEGORY_LEAF_CODES,
    NCD_PARENT_CODE,
    NCD_EXCLUDED_CODES,
    EXCLUDED_FROM_TOTAL_CODES,
)

from .country_processor import CountryProcessor, validate_country_file
from .global_processor import GlobalProcessor, validate_global_file
from .dashboard_data import (
    DashboardDataGenerator,
    load_dashboard_data,
    process_and_save,
)

__all__ = [
    # Constants
    'TARGET_COUNTRIES',
    'DISEASE_CATEGORIES',
    'COLORS',
    'AGE_GROUPS',
    'AGE_COLORS',
    'GHE_LABEL_MAP',
    'CATEGORY_SHORT_NAMES',
    'MPNC_GHE_LABELS',
    'MPNC_DISPLAY_ORDER',
    'WORLD_DALY_RATE',
    'COUNTRY_SHORT_NAMES',
    'AVAILABLE_YEARS',
    # Processors
    'CountryProcessor',
    'GlobalProcessor',
    'DashboardDataGenerator',
    # Validation
    'validate_country_file',
    'validate_global_file',
    # Convenience functions
    'load_dashboard_data',
    'process_and_save',
]
