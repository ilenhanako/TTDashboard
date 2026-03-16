"""
Time Series Page - Trend analysis and year comparisons.
"""

import streamlit as st
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from components.data_loader import (
    load_data,
    get_year_data,
    get_available_years,
    get_time_series_data,
    data_exists,
)
from components.charts import (
    create_trend_chart,
    create_comparison_charts,
    create_category_bar,
)
from processing import (
    COLORS,
    CATEGORY_SHORT_NAMES,
    DISEASE_CATEGORIES,
    COUNTRY_SHORT_NAMES,
    TARGET_COUNTRIES,
)


st.set_page_config(
    page_title="Time Series | DALY Dashboard",
    page_icon="📈",
    layout="wide",
)

st.title("Time Series Analysis")

if not data_exists():
    st.warning("No data loaded. Please upload data files from the main page.")
    st.stop()

# Get data
data = load_data()
years = get_available_years(data)
time_series = get_time_series_data(data)

if len(years) < 2:
    st.info("Time series analysis requires data for multiple years. Please upload more data files.")
    st.stop()

if not time_series:
    st.warning("Time series data not available. Please reprocess the data files.")
    st.stop()


def shorten(name):
    return COUNTRY_SHORT_NAMES.get(name, name)


# ─────────────────────────────────────────────────────────────
# Filters
# ─────────────────────────────────────────────────────────────
st.sidebar.header("Filters")

# Country selection
available_countries = list(time_series.get("dalyRates", {}).keys())
selected_countries = st.sidebar.multiselect(
    "Select Countries",
    options=available_countries,
    default=available_countries[:5],  # Default to first 5
    format_func=shorten,
)

# Category selection
selected_categories = st.sidebar.multiselect(
    "Select Categories",
    options=DISEASE_CATEGORIES,
    default=DISEASE_CATEGORIES[:3],
    format_func=lambda x: CATEGORY_SHORT_NAMES.get(x, x),
)

st.markdown("---")

# ─────────────────────────────────────────────────────────────
# Trend Line Charts
# ─────────────────────────────────────────────────────────────
st.subheader("DALY Rate Trends")
st.caption("DALY rate per 1,000 population over time")

if selected_countries:
    daly_rates = time_series.get("dalyRates", {})
    trend_data = {
        country: daly_rates.get(country, {})
        for country in selected_countries
        if country in daly_rates
    }

    if trend_data:
        fig_trend = create_trend_chart(
            trend_data,
            "DALY Rate Trends by Country",
            y_label="DALYs per 1,000 population",
        )
        st.plotly_chart(fig_trend, use_container_width=True)
    else:
        st.info("No DALY rate data available for selected countries")
else:
    st.info("Please select at least one country")

st.markdown("---")

# ─────────────────────────────────────────────────────────────
# Category Trends
# ─────────────────────────────────────────────────────────────
st.subheader("Disease Category Trends")
st.caption("Total DALYs by category across all selected countries")

if selected_categories and selected_countries:
    category_totals = time_series.get("categoryTotals", {})

    # Sum across selected countries for each year
    cat_trend_data = {}
    for cat in selected_categories:
        cat_data = category_totals.get(cat, {})
        cat_trend_data[CATEGORY_SHORT_NAMES.get(cat, cat)] = {}

        for year in years:
            year_data = cat_data.get(year, {})
            total = sum(
                year_data.get(c, 0)
                for c in selected_countries
                if c in year_data
            )
            cat_trend_data[CATEGORY_SHORT_NAMES.get(cat, cat)][year] = total

    if cat_trend_data:
        # Create color mapping for shortened names
        cat_colors = {
            CATEGORY_SHORT_NAMES.get(cat, cat): COLORS.get(cat, "#546E7A")
            for cat in selected_categories
        }

        fig_cat = create_trend_chart(
            cat_trend_data,
            "Disease Category Trends",
            y_label="Total DALYs (thousands)",
            colors=cat_colors,
        )
        st.plotly_chart(fig_cat, use_container_width=True)
else:
    st.info("Please select at least one country and one category")

st.markdown("---")

# ─────────────────────────────────────────────────────────────
# Year Comparison Slider
# ─────────────────────────────────────────────────────────────
st.subheader("Year Comparison")
st.caption("Compare DALY burden between two years")

col1, col2 = st.columns(2)

with col1:
    year1 = st.select_slider(
        "Select Year 1",
        options=sorted(years),
        value=sorted(years)[0],
        key="year1",
    )

with col2:
    year2 = st.select_slider(
        "Select Year 2",
        options=sorted(years),
        value=sorted(years)[-1],
        key="year2",
    )

if year1 and year2:
    data1 = get_year_data(year1, data)
    data2 = get_year_data(year2, data)

    if data1 and data2:
        # Show side-by-side comparison
        fig_compare = create_comparison_charts(data1, data2, year1, year2)
        st.plotly_chart(fig_compare, use_container_width=True)

        # Change statistics
        st.markdown("### Change Summary")

        countries1 = data1.get("countries", {})
        countries2 = data2.get("countries", {})

        changes = []
        for country in selected_countries:
            if country in countries1 and country in countries2:
                rate1 = countries1[country].get("dalyRate", 0)
                rate2 = countries2[country].get("dalyRate", 0)
                change = ((rate2 - rate1) / rate1 * 100) if rate1 > 0 else 0
                changes.append({
                    "Country": shorten(country),
                    f"Rate ({year1})": f"{rate1:.1f}",
                    f"Rate ({year2})": f"{rate2:.1f}",
                    "Change": f"{change:+.1f}%",
                    "_change": change,
                })

        if changes:
            # Sort by change
            changes.sort(key=lambda x: x["_change"])

            # Display as table
            import pandas as pd
            df = pd.DataFrame(changes)
            df = df.drop("_change", axis=1)

            st.dataframe(
                df,
                use_container_width=True,
                hide_index=True,
            )

            # Summary stats
            avg_change = sum(c["_change"] for c in changes) / len(changes)
            improved = sum(1 for c in changes if c["_change"] < 0)
            worsened = sum(1 for c in changes if c["_change"] > 0)

            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Average Change", f"{avg_change:+.1f}%")
            with col2:
                st.metric("Countries Improved", improved)
            with col3:
                st.metric("Countries Worsened", worsened)
    else:
        st.error("Could not load data for selected years")

st.markdown("---")

# ─────────────────────────────────────────────────────────────
# Total DALYs Trend
# ─────────────────────────────────────────────────────────────
st.subheader("Total DALY Burden Over Time")

if selected_countries:
    total_dalys = time_series.get("totalDalys", {})
    total_trend = {
        country: total_dalys.get(country, {})
        for country in selected_countries
        if country in total_dalys
    }

    if total_trend:
        fig_total = create_trend_chart(
            total_trend,
            "Total DALYs by Country",
            y_label="Total DALYs (thousands)",
        )
        st.plotly_chart(fig_total, use_container_width=True)
