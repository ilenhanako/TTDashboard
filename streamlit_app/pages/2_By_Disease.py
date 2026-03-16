"""
By Disease Page - Disease category drill-down.
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
    create_composition_chart,
    hex_to_rgba,
)
from processing import (
    COLORS,
    CATEGORY_SHORT_NAMES,
    DISEASE_CATEGORIES,
    COUNTRY_SHORT_NAMES,
)


st.set_page_config(
    page_title="By Disease | DALY Dashboard",
    page_icon="🦠",
    layout="wide",
)

st.title("By Disease")

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

# Initialize session state for drill-down
if "disease_level" not in st.session_state:
    st.session_state.disease_level = 0
if "selected_category" not in st.session_state:
    st.session_state.selected_category = None
if "selected_sub" not in st.session_state:
    st.session_state.selected_sub = None


def go_to_level0():
    st.session_state.disease_level = 0
    st.session_state.selected_category = None
    st.session_state.selected_sub = None


def go_to_level1(category):
    st.session_state.disease_level = 1
    st.session_state.selected_category = category
    st.session_state.selected_sub = None


def go_to_level2(sub):
    st.session_state.disease_level = 2
    st.session_state.selected_sub = sub


def shorten(name):
    return COUNTRY_SHORT_NAMES.get(name, name)


# ─────────────────────────────────────────────────────────────
# Level 0: Category Overview
# ─────────────────────────────────────────────────────────────
if st.session_state.disease_level == 0:
    st.markdown("### Disease Category Overview")
    st.caption("Click a category card to drill down")

    # Calculate category totals
    cat_totals = {}
    for cat in DISEASE_CATEGORIES:
        total = sum(
            c_data.get("diseases", {}).get(cat, {}).get("value", 0)
            for c_data in countries_data.values()
        )
        cat_totals[cat] = total

    # Category cards
    col1, col2 = st.columns(2)
    for i, cat in enumerate(DISEASE_CATEGORIES):
        with col1 if i % 2 == 0 else col2:
            total_m = cat_totals[cat] / 1000
            color = COLORS.get(cat, "#546E7A")
            short_name = CATEGORY_SHORT_NAMES.get(cat, cat)

            # Styled card with category color
            st.markdown(f"""
            <div style="
                background-color: #161b22;
                border-left: 4px solid {color};
                border-radius: 8px;
                padding: 16px;
                margin: 8px 0;
            ">
                <div style="color: {color}; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
                    {short_name}
                </div>
                <div style="color: #e6edf3; font-size: 28px; font-weight: bold; margin: 8px 0;">
                    {total_m:.0f}M
                </div>
                <div style="color: #8b949e; font-size: 12px;">
                    DALYs (thousands)
                </div>
            </div>
            """, unsafe_allow_html=True)

            if st.button(
                f"View {short_name} →",
                key=f"cat_{cat}",
                use_container_width=True,
            ):
                go_to_level1(cat)
                st.rerun()

    st.markdown("---")

    # Bar chart of categories
    st.subheader("Category Comparison")
    cat_data = {CATEGORY_SHORT_NAMES.get(k, k): v for k, v in cat_totals.items()}
    cat_colors = {CATEGORY_SHORT_NAMES.get(k, k): COLORS.get(k, "#546E7A") for k in cat_totals.keys()}
    fig = create_category_bar(cat_data, "Total DALYs by Category (thousands)", colors=cat_colors)
    st.plotly_chart(fig, use_container_width=True, key="cat_comparison_bar")

    # Composition chart
    st.markdown("---")
    st.subheader("Disease Mix by Country")
    fig_comp = create_composition_chart(year_data)
    st.plotly_chart(fig_comp, use_container_width=True)

    # Bar chart of categories with matching colors
    st.subheader("Category Comparison")
    cat_data = {CATEGORY_SHORT_NAMES.get(k, k): v for k, v in cat_totals.items()}
    # Create color mapping using short names
    cat_colors = {CATEGORY_SHORT_NAMES.get(k, k): COLORS.get(k, "#546E7A") for k in cat_totals.keys()}
    fig = create_category_bar(cat_data, "Total DALYs by Category (thousands)", colors=cat_colors)
    st.plotly_chart(fig, use_container_width=True, key="cat_comparison_bar")

    # Composition chart
    st.markdown("---")
    st.subheader("Disease Mix by Country")
    fig_comp = create_composition_chart(year_data)
    st.plotly_chart(fig_comp, use_container_width=True)


# ─────────────────────────────────────────────────────────────
# Level 1: Category Detail
# ─────────────────────────────────────────────────────────────
elif st.session_state.disease_level == 1:
    cat = st.session_state.selected_category

    # Breadcrumb
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown(f"[All Categories](#) > **{cat}**")
    with col2:
        if st.button("← Back to Categories"):
            go_to_level0()
            st.rerun()

    st.markdown(f"### {cat}")

    # Get sub-diseases for this category
    # Collect from first country that has this category
    sub_diseases = {}
    for c_name, c_data in countries_data.items():
        cat_data = c_data.get("diseases", {}).get(cat, {})
        subs = cat_data.get("sub", {})
        if subs:
            for sub_name, sub_data in subs.items():
                if sub_name not in sub_diseases:
                    sub_diseases[sub_name] = 0
                sub_diseases[sub_name] += sub_data.get("value", 0)
            break

    # Calculate totals for all countries
    for c_name, c_data in countries_data.items():
        cat_data = c_data.get("diseases", {}).get(cat, {})
        for sub_name, sub_data in cat_data.get("sub", {}).items():
            if sub_name in sub_diseases:
                sub_diseases[sub_name] += sub_data.get("value", 0) - sub_diseases.get(sub_name, 0)

    # Recalculate properly
    sub_diseases = {}
    for c_name, c_data in countries_data.items():
        cat_data = c_data.get("diseases", {}).get(cat, {})
        for sub_name, sub_data in cat_data.get("sub", {}).items():
            sub_diseases[sub_name] = sub_diseases.get(sub_name, 0) + sub_data.get("value", 0)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Sub-diseases")
        st.caption("Click a bar to see country breakdown")

        if sub_diseases:
            # Create clickable options
            selected_sub = st.selectbox(
                "Select sub-disease to drill down:",
                options=list(sub_diseases.keys()),
                key="sub_select",
            )

            fig_sub = create_category_bar(
                sub_diseases,
                "DALYs by Sub-disease (thousands)",
                color=COLORS.get(cat, "#4472C4"),
            )
            st.plotly_chart(fig_sub, use_container_width=True)

            if st.button("View Country Breakdown →"):
                go_to_level2(selected_sub)
                st.rerun()
        else:
            st.info("No sub-disease data available")

    with col2:
        st.subheader(f"{CATEGORY_SHORT_NAMES.get(cat, cat)} by Country")

        # Country breakdown for this category
        country_vals = {}
        for c_name, c_data in countries_data.items():
            cat_data = c_data.get("diseases", {}).get(cat, {})
            country_vals[shorten(c_name)] = cat_data.get("pct", 0)

        fig_ctry = create_category_bar(
            country_vals,
            "% of Country Total DALYs",
            orientation="h",
            color=COLORS.get(cat, "#4472C4"),
        )
        st.plotly_chart(fig_ctry, use_container_width=True)


# ─────────────────────────────────────────────────────────────
# Level 2: Sub-disease by Country
# ─────────────────────────────────────────────────────────────
elif st.session_state.disease_level == 2:
    cat = st.session_state.selected_category
    sub = st.session_state.selected_sub

    # Breadcrumb
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown(f"[All Categories](#) > [{cat}](#) > **{sub}**")
    with col2:
        if st.button("← Back"):
            go_to_level1(cat)
            st.rerun()

    st.markdown(f"### {sub}")
    st.caption(f"Part of {cat}")

    # Get values for this sub-disease across countries
    abs_vals = {}
    pct_vals = {}

    for c_name, c_data in countries_data.items():
        cat_data = c_data.get("diseases", {}).get(cat, {})
        sub_data = cat_data.get("sub", {}).get(sub, {})
        abs_vals[shorten(c_name)] = sub_data.get("value", 0)
        pct_vals[shorten(c_name)] = sub_data.get("pct", 0)

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Absolute DALYs")
        fig_abs = create_category_bar(
            abs_vals,
            f"{sub} - DALYs by Country (thousands)",
            color=COLORS.get(cat, "#4472C4"),
        )
        st.plotly_chart(fig_abs, use_container_width=True)

    with col2:
        st.subheader("% of Country Total")
        fig_pct = create_category_bar(
            pct_vals,
            f"{sub} - % of Total DALYs",
            color=hex_to_rgba(COLORS.get(cat, "#4472C4"), 0.67),
        )
        st.plotly_chart(fig_pct, use_container_width=True)