"""
DALY Dashboard - Streamlit App
==============================
Main entry point for the WHO DALY Analysis Dashboard.
"""

import streamlit as st
from pathlib import Path
import sys

# Add the app directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from components.data_loader import load_data, data_exists
from components.upload import (
    render_main_upload_section,
    render_year_selector,
    render_data_status_main,
)


# Page configuration
st.set_page_config(
    page_title="DALY Dashboard",
    page_icon="",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for dark theme
st.markdown("""
<style>
    /* Dark theme overrides */
    .stApp {
        background-color: #0d1117;
    }

    .stSidebar {
        background-color: #161b22;
    }

    /* Card styling */
    .metric-card {
        background-color: #161b22;
        border: 1px solid #21262d;
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
    }

    .metric-value {
        font-size: 28px;
        font-weight: bold;
        color: #e6edf3;
    }

    .metric-label {
        font-size: 12px;
        color: #8b949e;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* Breadcrumb */
    .breadcrumb {
        color: #8b949e;
        font-size: 14px;
        margin-bottom: 16px;
    }

    .breadcrumb a {
        color: #58a6ff;
        text-decoration: none;
    }

    /* Pills */
    .country-pill {
        display: inline-block;
        padding: 6px 12px;
        margin: 4px;
        background-color: #21262d;
        border-radius: 16px;
        cursor: pointer;
        font-size: 13px;
    }

    .country-pill.active {
        background-color: #238636;
        color: white;
    }

    /* Hide Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)


def main():
    """Main application entry point."""

    # Minimal sidebar - just navigation info
    st.sidebar.title("DALY Dashboard")
    st.sidebar.markdown("*Asia Pacific Region*")
    st.sidebar.divider()

    # Main content
    st.title("DALY Burden Dashboard")
    st.markdown("### Asia Pacific Region — WHO Global Health Estimates")

    # Upload section on main page
    render_main_upload_section()

    st.markdown("---")

    if not data_exists():
        st.info("""
        **Welcome to the DALY Dashboard!**

        Upload your data files above to get started. The expected formats are:
        - **Country files**: WHO GHE DALY Excel files (raw or categorised)
        - **Global file**: WHO GHE global DALY file (optional)

        You can upload multiple years to enable time series analysis.
        """)

        col1, col2 = st.columns(2)
        with col1:
            st.markdown("""
            **Sample Data Location:**
            ```
            GHE_DALYOriginal/
            ├── country/
            │   ├── ghe2021_daly_*.xlsx
            │   └── ...
            └── global/
                └── ghe2021daly_global.xlsx
            ```
            """)

        with col2:
            st.markdown("""
            **Dashboard Features:**
            - Overview charts and comparisons
            - Disease category drill-down
            - Country-level analysis
            - Time series trends
            """)

    else:
        # Data status
        render_data_status_main()

        st.markdown("---")

        # Year selector
        st.markdown("### Select Year for Analysis")
        selected_year = render_year_selector()

        st.markdown("---")

        # Show quick stats
        data = load_data()
        if data and selected_year:
            year_data = data.get("data", {}).get("byYear", {}).get(selected_year, {})
            countries = year_data.get("countries", {})

            if countries:
                st.markdown(f"### Quick Stats ({selected_year})")

                col1, col2, col3, col4 = st.columns(4)

                total_dalys = sum(c.get("total", 0) for c in countries.values())
                total_pop = sum(c.get("population", 0) for c in countries.values())
                avg_rate = (total_dalys / total_pop * 1000) if total_pop > 0 else 0

                with col1:
                    st.metric("Countries", len(countries))

                with col2:
                    st.metric("Total DALYs", f"{total_dalys/1000:.0f}M")

                with col3:
                    st.metric("Total Population", f"{total_pop/1000:.0f}M")

                with col4:
                    st.metric("Avg DALY Rate", f"{avg_rate:.0f}/1000")

        # Navigation hint
        st.markdown("---")
        st.markdown("""
        **Navigate using the sidebar pages for detailed analysis:**
        Overview | By Disease | By Country | Time Series
        """)


if __name__ == "__main__":
    main()
