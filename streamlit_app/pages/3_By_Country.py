"""
By Country Page - Country-specific analysis.
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
    create_category_bar,
    create_pie_chart,
    hex_to_rgba,
)
from processing import (
    COLORS,
    CATEGORY_SHORT_NAMES,
    DISEASE_CATEGORIES,
    AGE_GROUPS,
    AGE_COLORS,
    WORLD_DALY_RATE,
    COUNTRY_SHORT_NAMES,
)


st.set_page_config(
    page_title="By Country | DALY Dashboard",
    page_icon="🌏",
    layout="wide",
)

st.title("By Country")

if not data_exists():
    st.warning("No data loaded. Please upload data files from the main page.")
    st.stop()

# Get data
data = load_data()
years = get_available_years(data)
selected_year = st.session_state.get("selected_year", years[0] if years else None)

if not selected_year or selected_year not in years:
    selected_year = years[0] if years else None

if not selected_year:
    st.error("No data available")
    st.stop()

year_data = get_year_data(selected_year, data)
if year_data is None:
    st.error(f"No data available for {selected_year}")
    st.stop()

countries_data = year_data.get("countries", {})
countries_list = list(countries_data.keys())

# Initialize session state
if "selected_country" not in st.session_state:
    st.session_state.selected_country = countries_list[0] if countries_list else None
if "country_cat" not in st.session_state:
    st.session_state.country_cat = None


def shorten(name):
    return COUNTRY_SHORT_NAMES.get(name, name)


# ─────────────────────────────────────────────────────────────
# Country Selection
# ─────────────────────────────────────────────────────────────
st.markdown("### Select a Country")

# Create pill-style buttons
cols = st.columns(len(countries_list))
for i, country in enumerate(countries_list):
    with cols[i]:
        is_selected = st.session_state.selected_country == country
        btn_type = "primary" if is_selected else "secondary"
        if st.button(
            shorten(country),
            key=f"country_{country}",
            use_container_width=True,
            type=btn_type,
        ):
            st.session_state.selected_country = country
            st.session_state.country_cat = None
            st.rerun()

st.markdown("---")

# Get selected country data
selected_country = st.session_state.selected_country
if not selected_country or selected_country not in countries_data:
    st.info("Please select a country")
    st.stop()

c_data = countries_data[selected_country]


# ─────────────────────────────────────────────────────────────
# Level 0: Country Overview
# ─────────────────────────────────────────────────────────────
if st.session_state.country_cat is None:
    st.subheader(f"{selected_country} Overview")

    # KPI Cards
    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "Total DALYs",
            f"{c_data.get('total', 0)/1000:.0f}M",
            help="Total DALYs in thousands"
        )

    with col2:
        st.metric(
            "Population",
            f"{c_data.get('population', 0)/1000:.1f}M",
            help="Population in millions"
        )

    with col3:
        rate = c_data.get('dalyRate', 0)
        delta_color = "inverse" if rate > WORLD_DALY_RATE else "normal"
        st.metric(
            "DALY Rate",
            f"{rate:.0f}",
            delta=f"World avg: {WORLD_DALY_RATE:.0f}",
            delta_color=delta_color,
            help="DALYs per 1,000 population"
        )

    with col4:
        vs_world = c_data.get('dalyRateVsWorld', 100)
        direction = "above" if rate > WORLD_DALY_RATE else "below"
        st.metric(
            "vs World Average",
            f"{vs_world:.0f}%",
            delta=direction,
            delta_color="inverse" if direction == "above" else "normal",
        )

    st.markdown("---")

    # Disease composition and age profile
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Disease Composition")

        diseases = c_data.get("diseases", {})
        pie_data = {
            cat: d.get("pct", 0)
            for cat, d in diseases.items()
            if d.get("pct", 0) > 0.1
        }

        fig_pie = create_pie_chart(pie_data, "", COLORS)
        st.plotly_chart(fig_pie, use_container_width=True)

    with col2:
        st.subheader("Age Profile")

        age_data = year_data.get("ageGroups", {})
        age_vals = {
            ag: age_data.get(ag, {}).get(selected_country, 0)
            for ag in AGE_GROUPS
        }

        import plotly.graph_objects as go

        fig_age = go.Figure(go.Bar(
            x=list(age_vals.keys()),
            y=list(age_vals.values()),
            marker_color=AGE_COLORS,
        ))
        fig_age.update_layout(
            paper_bgcolor="#161b22",
            plot_bgcolor="#0d1117",
            font_color="#e6edf3",
            height=300,
            margin={"l": 40, "r": 20, "t": 20, "b": 40},
            yaxis={"title": "% of Total DALYs", "ticksuffix": "%"},
        )
        st.plotly_chart(fig_age, use_container_width=True)

    # Disease category table
    st.markdown("---")
    st.subheader("Disease Categories")
    st.caption("Click a category to see sub-disease breakdown")

    diseases = c_data.get("diseases", {})

    # Create table data
    table_data = []
    for cat in DISEASE_CATEGORIES:
        cat_data = diseases.get(cat, {})
        if cat_data.get("value", 0) > 0:
            table_data.append({
                "Category": CATEGORY_SHORT_NAMES.get(cat, cat),
                "DALYs (k)": f"{cat_data.get('value', 0):.0f}",
                "Percentage": f"{cat_data.get('pct', 0):.1f}%",
                "_cat": cat,
            })

    # Sort by value
    table_data.sort(key=lambda x: float(x["DALYs (k)"].replace(",", "")), reverse=True)

    # Display as clickable buttons
    for row in table_data:
        col1, col2, col3, col4 = st.columns([3, 2, 2, 1])
        with col1:
            color = COLORS.get(row["_cat"], "#546E7A")
            st.markdown(
                f'<span style="color:{color};">●</span> **{row["Category"]}**',
                unsafe_allow_html=True
            )
        with col2:
            st.write(row["DALYs (k)"])
        with col3:
            st.write(row["Percentage"])
        with col4:
            if st.button("→", key=f"go_{row['_cat']}"):
                st.session_state.country_cat = row["_cat"]
                st.rerun()


# ─────────────────────────────────────────────────────────────
# Level 1: Category Detail for Country
# ─────────────────────────────────────────────────────────────
else:
    cat = st.session_state.country_cat

    # Breadcrumb
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown(f"[{shorten(selected_country)} Overview](#) > **{cat}**")
    with col2:
        if st.button("← Back to Overview"):
            st.session_state.country_cat = None
            st.rerun()

    st.subheader(f"{shorten(selected_country)} — {CATEGORY_SHORT_NAMES.get(cat, cat)}")

    diseases = c_data.get("diseases", {})
    cat_data = diseases.get(cat, {})
    sub_data = cat_data.get("sub", {})

    if not sub_data:
        st.info("No sub-disease data available for this category")
    else:
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("**Absolute DALYs**")
            abs_vals = {name: d.get("value", 0) for name, d in sub_data.items()}
            fig_abs = create_category_bar(
                abs_vals,
                "DALYs (thousands)",
                color=COLORS.get(cat, "#4472C4"),
            )
            st.plotly_chart(fig_abs, use_container_width=True)

        with col2:
            st.markdown("**% of Total DALYs**")
            pct_vals = {name: d.get("pct", 0) for name, d in sub_data.items()}
            fig_pct = create_category_bar(
                pct_vals,
                "% of Country Total",
                color=hex_to_rgba(COLORS.get(cat, "#4472C4"), 0.67),
            )
            st.plotly_chart(fig_pct, use_container_width=True)