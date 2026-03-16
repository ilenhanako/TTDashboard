"""
Overview Page - Regional comparisons and summary charts.
"""

import streamlit as st
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from components.data_loader import (
    load_data,
    get_year_data,
    get_available_years,
    data_exists,
)
from components.charts import (
    create_rate_chart,
    create_pie_chart,
    create_age_chart,
    create_gender_chart,
    create_composition_chart,
)
from processing import COLORS, CATEGORY_SHORT_NAMES


st.set_page_config(
    page_title="Overview | DALY Dashboard",
    page_icon="",
    layout="wide",
)

st.title("Overview")
st.markdown("### Regional DALY Burden Comparison")

if not data_exists():
    st.warning("No data loaded. Please upload data files from the main page.")
    st.stop()

# Get data
data = load_data()
years = get_available_years(data)

if not years:
    st.error("No years available in the data.")
    st.stop()

# Year selector
selected_year = st.session_state.get("selected_year", years[0])
if selected_year not in years:
    selected_year = years[0]

year_data = get_year_data(selected_year, data)

if year_data is None:
    st.error(f"No data available for {selected_year}")
    st.stop()

# ─────────────────────────────────────────────────────────────
# Chart 1: DALY Rate Comparison
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("DALY Rate by Country")
st.caption("Countries above world average shown in red")

fig_rate = create_rate_chart(year_data)
st.plotly_chart(fig_rate, use_container_width=True, key="rate_chart")

# ─────────────────────────────────────────────────────────────
# Chart 2: Disease Mix - Dual Pie Charts
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("Disease Category Distribution")

col1, col2 = st.columns(2)

with col1:
    st.markdown("**Regional Mix (14 Countries)**")

    # Calculate regional totals
    countries = year_data.get("countries", {})
    cat_totals = {}
    grand_total = 0

    for country, c_data in countries.items():
        grand_total += c_data.get("total", 0)
        for cat, cat_data in c_data.get("diseases", {}).items():
            cat_totals[cat] = cat_totals.get(cat, 0) + cat_data.get("value", 0)

    regional_mix = {}
    for cat, val in cat_totals.items():
        pct = (val / grand_total * 100) if grand_total > 0 else 0
        if pct > 0.1:
            regional_mix[cat] = round(pct, 1)

    fig_regional = create_pie_chart(regional_mix, "", COLORS)
    st.plotly_chart(fig_regional, use_container_width=True, key="pie_regional")

with col2:
    st.markdown("**World Average**")
    world_mix = year_data.get("worldDiseaseMix", {})
    if world_mix:
        fig_world = create_pie_chart(world_mix, "", COLORS)
        st.plotly_chart(fig_world, use_container_width=True, key="pie_world")
    else:
        st.info("World data not available")

# ─────────────────────────────────────────────────────────────
# Chart 3: Age Distribution
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("Age Group Distribution")
st.caption("Percentage of total DALYs by age group for each country")

fig_age = create_age_chart(year_data)
st.plotly_chart(fig_age, use_container_width=True, key="age_chart")

# ─────────────────────────────────────────────────────────────
# Chart 4: Gender Distribution
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("Gender Distribution")
st.caption("DALY burden vs population split by gender")

fig_gender = create_gender_chart(year_data)
st.plotly_chart(fig_gender, use_container_width=True, key="gender_chart")

# ─────────────────────────────────────────────────────────────
# Chart 5: Disease Composition
# ─────────────────────────────────────────────────────────────
st.markdown("---")
st.subheader("Disease Category Composition by Country")
st.caption("100% stacked bar showing disease burden breakdown")

fig_comp = create_composition_chart(year_data)
st.plotly_chart(fig_comp, use_container_width=True, key="composition_chart")