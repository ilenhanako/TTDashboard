"""
Streamlit app components.
"""

from .data_loader import load_data, get_year_data, get_available_years
from .upload import render_upload_section, process_uploaded_files
from .charts import (
    create_rate_chart,
    create_pie_chart,
    create_age_chart,
    create_gender_chart,
    create_composition_chart,
    create_category_bar,
    create_trend_chart,
)

__all__ = [
    'load_data',
    'get_year_data',
    'get_available_years',
    'render_upload_section',
    'process_uploaded_files',
    'create_rate_chart',
    'create_pie_chart',
    'create_age_chart',
    'create_gender_chart',
    'create_composition_chart',
    'create_category_bar',
    'create_trend_chart',
]
