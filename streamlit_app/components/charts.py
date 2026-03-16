"""
Plotly chart components for the DALY dashboard.
Replaces Chart.js visualizations from the HTML dashboard.
"""

import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from typing import Dict, List, Any, Optional
import pandas as pd

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from processing import (
    COLORS,
    AGE_COLORS,
    AGE_GROUPS,
    CATEGORY_SHORT_NAMES,
    WORLD_DALY_RATE,
    COUNTRY_SHORT_NAMES,
)


# Dark theme colors matching original dashboard
DARK_BG = "#0d1117"
DARK_PAPER = "#161b22"
DARK_GRID = "#21262d"
DARK_TEXT = "#e6edf3"
DARK_MUTED = "#8b949e"


def hex_to_rgba(hex_color: str, alpha: float = 1.0) -> str:
    """Convert hex color to rgba format with specified alpha."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) == 6:
        r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    else:
        r, g, b = 68, 114, 196  # fallback to default blue
    return f"rgba({r}, {g}, {b}, {alpha})"


def get_plotly_layout(title: str = "", height: int = 400) -> Dict:
    """Get common Plotly layout settings for dark theme."""
    return {
        "title": {"text": title, "font": {"color": DARK_TEXT}},
        "paper_bgcolor": DARK_PAPER,
        "plot_bgcolor": DARK_BG,
        "font": {"color": DARK_TEXT},
        "height": height,
        "margin": {"l": 60, "r": 20, "t": 40, "b": 60},
        "legend": {
            "bgcolor": "rgba(0,0,0,0)",
            "font": {"color": DARK_TEXT},
        },
    }


def shorten_country_name(name: str) -> str:
    """Shorten country names for display."""
    return COUNTRY_SHORT_NAMES.get(name, name)


def create_rate_chart(data: Dict[str, Any]) -> go.Figure:
    """
    Create DALY rate comparison chart (horizontal bar with world reference line).

    Args:
        data: Year data containing countries info

    Returns:
        Plotly figure
    """
    countries_data = data.get("countries", {})

    # Sort by DALY rate
    sorted_countries = sorted(
        countries_data.items(),
        key=lambda x: x[1].get("dalyRate", 0),
        reverse=True
    )

    names = [shorten_country_name(c[0]) for c in sorted_countries]
    rates = [c[1].get("dalyRate", 0) for c in sorted_countries]
    colors = ["#f85149" if r > WORLD_DALY_RATE else "#58a6ff" for r in rates]

    fig = go.Figure()

    fig.add_trace(go.Bar(
        y=names,
        x=rates,
        orientation='h',
        marker_color=colors,
        hovertemplate="%{y}: %{x:.1f} per 1,000<extra></extra>",
    ))

    # Add world average line
    fig.add_vline(
        x=WORLD_DALY_RATE,
        line_dash="dash",
        line_color="#58a6ff",
        annotation_text=f"World avg ({WORLD_DALY_RATE:.0f})",
        annotation_position="top right",
        annotation_font_color="#58a6ff",
    )

    layout = get_plotly_layout("DALY Rate per 1,000 Population", height=450)
    layout["xaxis"] = {
        "title": "DALYs per 1,000 population",
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_MUTED},
    }
    layout["yaxis"] = {
        "tickfont": {"color": DARK_TEXT},
        "autorange": "reversed",
    }

    fig.update_layout(**layout)
    return fig


def create_pie_chart(
    data: Dict[str, float],
    title: str = "",
    colors: Optional[Dict[str, str]] = None
) -> go.Figure:
    """
    Create a doughnut/pie chart.

    Args:
        data: Dict mapping labels to values
        title: Chart title
        colors: Optional color mapping

    Returns:
        Plotly figure
    """
    if colors is None:
        colors = COLORS

    labels = list(data.keys())
    values = list(data.values())
    marker_colors = [colors.get(l, "#546E7A") for l in labels]

    fig = go.Figure(data=[go.Pie(
        labels=[CATEGORY_SHORT_NAMES.get(l, l) for l in labels],
        values=values,
        hole=0.4,
        marker_colors=marker_colors,
        textinfo="percent",
        textfont_color=DARK_TEXT,
        hovertemplate="%{label}: %{value:.1f}%<extra></extra>",
    )])

    layout = get_plotly_layout(title, height=300)
    layout["showlegend"] = True
    layout["legend"] = {
        "orientation": "v",
        "yanchor": "middle",
        "y": 0.5,
        "xanchor": "left",
        "x": 1.02,
        "font": {"color": DARK_TEXT, "size": 10},
    }

    fig.update_layout(**layout)
    return fig


def create_age_chart(data: Dict[str, Any]) -> go.Figure:
    """
    Create stacked bar chart showing age distribution by country.

    Args:
        data: Year data containing ageGroups info

    Returns:
        Plotly figure
    """
    age_groups_data = data.get("ageGroups", {})
    countries = list(data.get("countries", {}).keys())

    fig = go.Figure()

    for i, age_group in enumerate(AGE_GROUPS):
        values = [age_groups_data.get(age_group, {}).get(c, 0) for c in countries]
        fig.add_trace(go.Bar(
            name=age_group,
            x=[shorten_country_name(c) for c in countries],
            y=values,
            marker_color=AGE_COLORS[i],
            hovertemplate=f"{age_group}: %{{y:.1f}}%<extra></extra>",
        ))

    layout = get_plotly_layout("Age Distribution by Country", height=400)
    layout["barmode"] = "stack"
    layout["xaxis"] = {
        "tickangle": -35,
        "tickfont": {"color": DARK_TEXT},
    }
    layout["yaxis"] = {
        "title": "% of Country Total DALYs",
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_MUTED},
        "ticksuffix": "%",
        "range": [0, 100],
    }
    layout["legend"] = {
        "orientation": "h",
        "yanchor": "bottom",
        "y": -0.3,
        "xanchor": "center",
        "x": 0.5,
        "font": {"color": DARK_TEXT},
    }

    fig.update_layout(**layout)
    return fig


def create_gender_chart(data: Dict[str, Any]) -> go.Figure:
    """
    Create gender comparison chart (DALY % and Population %).

    Args:
        data: Year data containing gender info

    Returns:
        Plotly figure
    """
    gender_data = data.get("gender", {})
    countries = list(data.get("countries", {}).keys())

    fig = go.Figure()

    # DALY percentages
    fig.add_trace(go.Bar(
        name="Male - DALY %",
        x=[shorten_country_name(c) for c in countries],
        y=[gender_data.get("malePct", {}).get(c, 50) for c in countries],
        marker_color="rgba(59, 130, 246, 0.67)",
        offsetgroup=0,
    ))
    fig.add_trace(go.Bar(
        name="Female - DALY %",
        x=[shorten_country_name(c) for c in countries],
        y=[gender_data.get("femalePct", {}).get(c, 50) for c in countries],
        marker_color="rgba(236, 72, 153, 0.6)",
        offsetgroup=0,
        base=[gender_data.get("malePct", {}).get(c, 50) for c in countries],
    ))

    # Population percentages (separate group)
    fig.add_trace(go.Bar(
        name="Male - Pop %",
        x=[shorten_country_name(c) for c in countries],
        y=[gender_data.get("malePopPct", {}).get(c, 50) for c in countries],
        marker_color="rgba(29, 78, 216, 0.67)",
        offsetgroup=1,
    ))
    fig.add_trace(go.Bar(
        name="Female - Pop %",
        x=[shorten_country_name(c) for c in countries],
        y=[gender_data.get("femalePopPct", {}).get(c, 50) for c in countries],
        marker_color="rgba(190, 24, 93, 0.6)",
        offsetgroup=1,
        base=[gender_data.get("malePopPct", {}).get(c, 50) for c in countries],
    ))

    layout = get_plotly_layout("Gender Distribution (DALY vs Population)", height=400)
    layout["barmode"] = "group"
    layout["xaxis"] = {
        "tickangle": -35,
        "tickfont": {"color": DARK_TEXT},
    }
    layout["yaxis"] = {
        "title": "% split (Male / Female)",
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_MUTED},
        "ticksuffix": "%",
        "range": [0, 100],
    }
    layout["legend"] = {
        "orientation": "h",
        "yanchor": "bottom",
        "y": -0.3,
        "xanchor": "center",
        "x": 0.5,
        "font": {"color": DARK_TEXT},
    }

    fig.update_layout(**layout)
    return fig


def create_composition_chart(data: Dict[str, Any]) -> go.Figure:
    """
    Create 100% stacked bar chart showing disease composition by country.

    Args:
        data: Year data containing countries info

    Returns:
        Plotly figure
    """
    countries_data = data.get("countries", {})
    countries = list(countries_data.keys())

    fig = go.Figure()

    for category in COLORS.keys():
        values = []
        for c in countries:
            cat_data = countries_data.get(c, {}).get("diseases", {}).get(category, {})
            values.append(cat_data.get("pct", 0))

        fig.add_trace(go.Bar(
            name=CATEGORY_SHORT_NAMES.get(category, category),
            x=[shorten_country_name(c) for c in countries],
            y=values,
            marker_color=COLORS[category],
            hovertemplate=f"{CATEGORY_SHORT_NAMES.get(category, category)}: %{{y:.1f}}%<extra></extra>",
        ))

    layout = get_plotly_layout("Disease Category Composition by Country", height=400)
    layout["barmode"] = "stack"
    layout["xaxis"] = {
        "tickangle": -35,
        "tickfont": {"color": DARK_TEXT},
    }
    layout["yaxis"] = {
        "title": "% of Total DALYs",
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_MUTED},
        "ticksuffix": "%",
        "range": [0, 100],
    }
    layout["legend"] = {
        "orientation": "h",
        "yanchor": "bottom",
        "y": -0.35,
        "xanchor": "center",
        "x": 0.5,
        "font": {"color": DARK_TEXT, "size": 10},
    }

    fig.update_layout(**layout)
    return fig


def create_category_bar(
    data: Dict[str, float],
    title: str = "",
    orientation: str = "h",
    color: Optional[str] = None,
    colors: Optional[Dict[str, str]] = None
) -> go.Figure:
    """
    Create a simple bar chart for category/sub-disease comparison.

    Args:
        data: Dict mapping labels to values
        title: Chart title
        orientation: 'h' for horizontal, 'v' for vertical
        color: Optional single bar color (used if colors dict not provided)
        colors: Optional dict mapping labels to individual colors

    Returns:
        Plotly figure
    """
    sorted_data = sorted(data.items(), key=lambda x: x[1], reverse=True)
    labels = [d[0] for d in sorted_data]
    values = [d[1] for d in sorted_data]

    # Determine bar colors
    if colors:
        bar_colors = [colors.get(label, color or "#4472C4") for label in labels]
    else:
        bar_colors = color or "#4472C4"

    if orientation == "h":
        fig = go.Figure(go.Bar(
            y=labels,
            x=values,
            orientation='h',
            marker_color=bar_colors,
            hovertemplate="%{y}: %{x:.1f}<extra></extra>",
        ))
        layout = get_plotly_layout(title, height=max(250, len(labels) * 28))
        layout["yaxis"] = {"autorange": "reversed", "tickfont": {"color": DARK_TEXT}}
        layout["xaxis"] = {"gridcolor": DARK_GRID, "tickfont": {"color": DARK_MUTED}}
    else:
        fig = go.Figure(go.Bar(
            x=labels,
            y=values,
            marker_color=bar_colors,
            hovertemplate="%{x}: %{y:.1f}<extra></extra>",
        ))
        layout = get_plotly_layout(title, height=350)
        layout["xaxis"] = {"tickangle": -35, "tickfont": {"color": DARK_TEXT}}
        layout["yaxis"] = {"gridcolor": DARK_GRID, "tickfont": {"color": DARK_MUTED}}

    fig.update_layout(**layout)
    return fig


def create_trend_chart(
    data: Dict[str, Dict[str, float]],
    title: str = "",
    y_label: str = "Value",
    colors: Optional[Dict[str, str]] = None
) -> go.Figure:
    """
    Create a line chart for trend analysis.

    Args:
        data: Dict mapping series name -> {year: value}
        title: Chart title
        y_label: Y-axis label
        colors: Optional color mapping for series

    Returns:
        Plotly figure
    """
    fig = go.Figure()

    for series_name, series_data in data.items():
        years = sorted(series_data.keys())
        values = [series_data[y] for y in years]

        color = None
        if colors:
            color = colors.get(series_name)

        fig.add_trace(go.Scatter(
            x=years,
            y=values,
            mode='lines+markers',
            name=shorten_country_name(series_name),
            line={"color": color} if color else {},
            hovertemplate=f"{shorten_country_name(series_name)}<br>%{{x}}: %{{y:.1f}}<extra></extra>",
        ))

    layout = get_plotly_layout(title, height=450)
    layout["xaxis"] = {
        "title": "Year",
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_TEXT},
    }
    layout["yaxis"] = {
        "title": y_label,
        "gridcolor": DARK_GRID,
        "tickfont": {"color": DARK_MUTED},
    }
    layout["legend"] = {
        "bgcolor": "rgba(0,0,0,0)",
        "font": {"color": DARK_TEXT, "size": 10},
    }
    layout["hovermode"] = "x unified"

    fig.update_layout(**layout)
    return fig


def create_comparison_charts(
    data1: Dict[str, Any],
    data2: Dict[str, Any],
    year1: str,
    year2: str
) -> go.Figure:
    """
    Create side-by-side comparison charts for two years.

    Args:
        data1: Data for year 1
        data2: Data for year 2
        year1: First year label
        year2: Second year label

    Returns:
        Plotly figure with subplots
    """
    fig = make_subplots(
        rows=1, cols=2,
        subplot_titles=[f"DALY Rates ({year1})", f"DALY Rates ({year2})"],
        horizontal_spacing=0.1,
    )

    # Year 1 data
    countries1 = data1.get("countries", {})
    sorted1 = sorted(countries1.items(), key=lambda x: x[1].get("dalyRate", 0), reverse=True)
    names1 = [shorten_country_name(c[0]) for c in sorted1]
    rates1 = [c[1].get("dalyRate", 0) for c in sorted1]

    fig.add_trace(go.Bar(
        y=names1,
        x=rates1,
        orientation='h',
        marker_color=["#f85149" if r > WORLD_DALY_RATE else "#58a6ff" for r in rates1],
        showlegend=False,
    ), row=1, col=1)

    # Year 2 data
    countries2 = data2.get("countries", {})
    sorted2 = sorted(countries2.items(), key=lambda x: x[1].get("dalyRate", 0), reverse=True)
    names2 = [shorten_country_name(c[0]) for c in sorted2]
    rates2 = [c[1].get("dalyRate", 0) for c in sorted2]

    fig.add_trace(go.Bar(
        y=names2,
        x=rates2,
        orientation='h',
        marker_color=["#f85149" if r > WORLD_DALY_RATE else "#58a6ff" for r in rates2],
        showlegend=False,
    ), row=1, col=2)

    layout = get_plotly_layout("", height=500)
    layout["yaxis"] = {"autorange": "reversed"}
    layout["yaxis2"] = {"autorange": "reversed"}

    fig.update_layout(**layout)
    return fig
