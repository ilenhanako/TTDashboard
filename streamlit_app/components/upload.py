"""
File upload and processing component for the Streamlit dashboard.
"""

import streamlit as st
from pathlib import Path
from typing import List, Tuple, Optional
import tempfile
import os

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from processing import (
    validate_country_file,
    validate_global_file,
    DashboardDataGenerator,
)
from .data_loader import get_data_dir, clear_cache


def render_upload_section():
    """Render the file upload section in the sidebar."""
    st.sidebar.header("Data Upload")

    with st.sidebar.expander("Upload New Data", expanded=False):
        st.markdown("**Country Data Files**")
        st.caption("Upload one or more country DALY Excel files")

        country_files = st.file_uploader(
            "Country files",
            type=["xlsx"],
            accept_multiple_files=True,
            key="country_upload",
            label_visibility="collapsed",
        )

        st.markdown("**Global Data File**")
        st.caption("Upload the global DALY Excel file (optional)")

        global_file = st.file_uploader(
            "Global file",
            type=["xlsx"],
            accept_multiple_files=False,
            key="global_upload",
            label_visibility="collapsed",
        )

        if st.button("Process Files", type="primary", use_container_width=True):
            if country_files or global_file:
                with st.spinner("Processing files..."):
                    success, message = process_uploaded_files(country_files, global_file)

                if success:
                    st.success(message)
                    clear_cache()
                    st.rerun()
                else:
                    st.error(message)
            else:
                st.warning("Please upload at least one file")


def process_uploaded_files(
    country_files: List,
    global_file: Optional = None
) -> Tuple[bool, str]:
    """
    Process uploaded files and generate dashboard data.

    Args:
        country_files: List of uploaded country file objects
        global_file: Optional uploaded global file object

    Returns:
        Tuple of (success, message)
    """
    temp_dir = tempfile.mkdtemp()
    country_paths = []
    global_path = None

    try:
        # Save country files to temp location
        for uploaded_file in country_files:
            temp_path = os.path.join(temp_dir, uploaded_file.name)
            with open(temp_path, "wb") as f:
                f.write(uploaded_file.getbuffer())

            # Validate
            is_valid, msg = validate_country_file(temp_path)
            if not is_valid:
                return False, f"Invalid country file '{uploaded_file.name}': {msg}"

            country_paths.append(temp_path)

        # Save global file to temp location
        if global_file is not None:
            temp_path = os.path.join(temp_dir, global_file.name)
            with open(temp_path, "wb") as f:
                f.write(global_file.getbuffer())

            # Validate
            is_valid, msg = validate_global_file(temp_path)
            if not is_valid:
                return False, f"Invalid global file '{global_file.name}': {msg}"

            global_path = temp_path

        if not country_paths and not global_path:
            return False, "No valid files to process"

        # Process files
        output_dir = get_data_dir()
        generator = DashboardDataGenerator(str(output_dir))

        years_processed = []
        for path in country_paths:
            data = generator.process_country_file(path)
            years_processed.append(data.get("year", "unknown"))

        if global_path:
            generator.process_global_file(global_path)

        # Save results
        output_path = generator.save()

        return True, f"Successfully processed {len(country_paths)} country file(s) for years: {', '.join(years_processed)}"

    except Exception as e:
        return False, f"Error processing files: {str(e)}"

    finally:
        # Clean up temp files
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)


def render_data_status():
    """Render the current data status in the sidebar."""
    from .data_loader import data_exists, get_metadata, get_available_years

    st.sidebar.header("Data Status")

    if data_exists():
        metadata = get_metadata()
        years = get_available_years()

        st.sidebar.success("Data loaded")
        st.sidebar.caption(f"Years available: {', '.join(years)}")

        if metadata:
            updated = metadata.get("updated", "Unknown")
            if updated and updated != "Unknown":
                # Format the date
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(updated)
                    updated = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            st.sidebar.caption(f"Last updated: {updated}")
    else:
        st.sidebar.warning("No data loaded")
        st.sidebar.caption("Upload files to get started")


def render_main_upload_section():
    """Render the file upload section on the main page."""
    with st.expander("Upload Data Files", expanded=True):
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("**Country Data Files**")
            st.caption("Upload one or more country DALY Excel files (raw or categorised)")

            country_files = st.file_uploader(
                "Country files",
                type=["xlsx"],
                accept_multiple_files=True,
                key="country_upload_main",
                label_visibility="collapsed",
            )

        with col2:
            st.markdown("**Global Data File** (optional)")
            st.caption("Upload the global DALY Excel file for world comparisons")

            global_file = st.file_uploader(
                "Global file",
                type=["xlsx"],
                accept_multiple_files=False,
                key="global_upload_main",
                label_visibility="collapsed",
            )

        if st.button("Process Files", type="primary"):
            if country_files or global_file:
                with st.spinner("Processing files..."):
                    success, message = process_uploaded_files(country_files, global_file)

                if success:
                    st.success(message)
                    clear_cache()
                    st.rerun()
                else:
                    st.error(message)
            else:
                st.warning("Please upload at least one file")


def render_year_selector():
    """Render year selector on main page and return selected year."""
    from .data_loader import data_exists, get_available_years

    if not data_exists():
        return None

    years = get_available_years()
    if not years:
        return None

    # Use columns to make it compact
    col1, col2, col3 = st.columns([1, 2, 1])

    with col2:
        selected_year = st.selectbox(
            "Select Year",
            years,
            index=0,
            key="year_selector_main",
        )
        st.session_state["selected_year"] = selected_year

    return selected_year


def render_data_status_main():
    """Render data status on main page."""
    from .data_loader import data_exists, get_metadata, get_available_years

    if data_exists():
        metadata = get_metadata()
        years = get_available_years()

        col1, col2, col3 = st.columns(3)

        with col1:
            st.metric("Status", "Data Loaded")

        with col2:
            st.metric("Years Available", ", ".join(years))

        with col3:
            updated = metadata.get("updated", "Unknown") if metadata else "Unknown"
            if updated and updated != "Unknown":
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(updated)
                    updated = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            st.metric("Last Updated", updated)
