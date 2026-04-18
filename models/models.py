# =============================================================================
# CDS3 2026 — Epidemiological Transition Analysis
# Models: OLS Regression · K-Means Clustering · Anomaly Detection
#
# Datasets required (place in the same directory):
#   - ghe2021_daly_bycountry_2021.xlsx   (WHO GHE 2021)
#   - SDI.csv                            (IHME Socio-Demographic Index)
#
# Dependencies:
#   pip install pandas numpy openpyxl scipy scikit-learn matplotlib seaborn
# =============================================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import warnings
warnings.filterwarnings("ignore")

# =============================================================================
# SECTION 1 — DATA LOADING & PREPROCESSING
# =============================================================================

# ── 1.1  Load WHO GHE 2021 DALY data ─────────────────────────────────────────
#
# The spreadsheet has a complex multi-row header. The relevant rows are:
#   Row 6  (0-indexed) : country names
#   Row 7              : ISO-3 codes
#   Row 9              : population ('000)
#   Row 10             : All Causes  — total DALYs ('000)
#   Row 11             : Communicable, maternal, perinatal & nutritional
#   Row 73             : Non-communicable diseases
#   Row 210            : Injuries
# Columns 7 onwards correspond to individual countries.

daly_raw = pd.read_excel(
    "ghe2021_daly_bycountry_2021.xlsx",
    sheet_name="All ages",
    header=None
)

# Identify columns that contain country data (row 6 = country names)
country_cols = [
    i + 7
    for i, v in enumerate(daly_raw.iloc[6, 7:])
    if pd.notna(v)
]
countries = [str(daly_raw.iloc[6, c]).strip() for c in country_cols]
iso_codes = [str(daly_raw.iloc[7, c]).strip() for c in country_cols]


def extract_row(row_idx):
    """Extract a numeric array from a single row across all country columns."""
    return np.array([
        pd.to_numeric(daly_raw.iloc[row_idx, c], errors="coerce")
        for c in country_cols
    ])


pop_vals  = extract_row(9)    # population in thousands
all_vals  = extract_row(10)   # all-cause DALYs ('000)
comm_vals = extract_row(11)   # communicable DALYs ('000)
ncd_vals  = extract_row(73)   # NCD DALYs ('000)
inj_vals  = extract_row(210)  # injury DALYs ('000)

# ── 1.2  Normalise to DALYs per 1,000 population ─────────────────────────────
#
# Both pop and DALY values are in units of thousands, so dividing cancels the
# thousands and multiplying by 1,000 gives DALYs per 1,000 population.
#
# Assumption: population and DALY values share the same '000 scaling.

daly_df = pd.DataFrame({
    "country":   countries,
    "iso":       iso_codes,
    "pop_k":     pop_vals,
    "all_rate":  all_vals  / pop_vals * 1000,
    "comm_rate": comm_vals / pop_vals * 1000,
    "ncd_rate":  ncd_vals  / pop_vals * 1000,
    "inj_rate":  inj_vals  / pop_vals * 1000,
}).dropna()

print(f"DALY dataset: {len(daly_df)} countries after removing NaN rows")

# ── 1.3  Load IHME SDI data ───────────────────────────────────────────────────
#
# Filter to: year = 2021, age group = "All Ages", sex = "Both".
# This gives a single SDI value per country for the reference year.

sdi_raw = pd.read_csv("SDI.csv")

sdi_2021 = (
    sdi_raw[
        (sdi_raw["year_id"] == 2021) &
        (sdi_raw["age_group_name"] == "All Ages") &
        (sdi_raw["sex"] == "Both")
    ]
    [["location_name", "mean_value"]]
    .copy()
    .rename(columns={"location_name": "country", "mean_value": "sdi"})
)

print(f"SDI dataset: {len(sdi_2021)} locations for 2021")

# ── 1.4  Merge on country name ────────────────────────────────────────────────
#
# Assumption: country names are consistent between datasets. Some countries
# may be silently dropped if names differ (e.g. "Türkiye" vs "Turkey").

df = daly_df.merge(sdi_2021, on="country", how="inner").reset_index(drop=True)
print(f"Merged dataset: {len(df)} countries")
print(df[["country", "sdi", "comm_rate", "ncd_rate", "inj_rate"]].head())


# =============================================================================
# SECTION 2 — OLS REGRESSION
# =============================================================================
#
# Model:   y = β₀ + β₁·SDI + ε
#
# Three independent OLS regressions are fit using scipy.stats.linregress:
#   (a) communicable disease DALY rate ~ SDI
#   (b) NCD DALY rate ~ SDI
#   (c) injury DALY rate ~ SDI
#
# R² quantifies the share of cross-national variance explained by SDI alone.
# Residuals from regression (a) are saved as the anomaly score.
#
# Assumptions:
#   - Linear relationship between SDI and DALY rates
#   - SDI is exogenous (causal direction flows SDI → DALYs)
#   - Residuals are approximately normally distributed with constant variance
#     (homoscedasticity) — not formally tested here

print("\n" + "="*60)
print("SECTION 2 — OLS REGRESSION")
print("="*60)

# Fit regressions
slope_c, int_c, r_c, p_c, se_c = stats.linregress(df["sdi"], df["comm_rate"])
slope_n, int_n, r_n, p_n, se_n = stats.linregress(df["sdi"], df["ncd_rate"])
slope_i, int_i, r_i, p_i, se_i = stats.linregress(df["sdi"], df["inj_rate"])

print(f"\nCommunicable ~ SDI")
print(f"  slope     = {slope_c:.2f}  (DALYs per 1,000 per unit SDI increase)")
print(f"  intercept = {int_c:.2f}")
print(f"  R²        = {r_c**2:.3f}")
print(f"  p-value   = {p_c:.2e}")

print(f"\nNCD ~ SDI")
print(f"  slope     = {slope_n:.2f}")
print(f"  intercept = {int_n:.2f}")
print(f"  R²        = {r_n**2:.3f}")
print(f"  p-value   = {p_n:.2e}")

print(f"\nInjuries ~ SDI")
print(f"  slope     = {slope_i:.2f}")
print(f"  intercept = {int_i:.2f}")
print(f"  R²        = {r_i**2:.3f}")
print(f"  p-value   = {p_i:.2e}")

# Compute predicted values and residuals for communicable model
df["comm_pred"]  = slope_c * df["sdi"] + int_c
df["comm_resid"] = df["comm_rate"] - df["comm_pred"]
resid_sd = df["comm_resid"].std()
print(f"\nCommunicable residual SD = {resid_sd:.2f} DALYs/1k")

# ── Plot: Regression scatter plots ───────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(16, 5))
fig.suptitle("OLS Regression: SDI vs Disease Burden Components", fontsize=13, fontweight="bold")

plot_cfg = [
    ("comm_rate", slope_c, int_c, r_c, "#E24B4A", "Communicable"),
    ("ncd_rate",  slope_n, int_n, r_n, "#60A5FA", "NCD"),
    ("inj_rate",  slope_i, int_i, r_i, "#4ADE80", "Injuries"),
]

for ax, (col, slope, intercept, r_val, color, title) in zip(axes, plot_cfg):
    ax.scatter(df["sdi"], df[col], color=color, alpha=0.55, s=28, edgecolors="none")
    x_line = np.linspace(df["sdi"].min(), df["sdi"].max(), 200)
    ax.plot(x_line, slope * x_line + intercept, color="black", lw=1.5, ls="--")
    ax.set_xlabel("SDI", fontsize=10)
    ax.set_ylabel("DALYs per 1,000 population", fontsize=10)
    ax.set_title(f"{title}  (R² = {r_val**2:.3f})", fontsize=11, fontweight="bold")
    ax.text(0.97, 0.97, f"y = {slope:.0f}·SDI + {intercept:.0f}",
            transform=ax.transAxes, ha="right", va="top", fontsize=9,
            bbox=dict(boxstyle="round,pad=0.3", facecolor="white", alpha=0.7))
    ax.grid(True, linewidth=0.4, alpha=0.5)
    ax.spines[["top", "right"]].set_visible(False)

plt.tight_layout()
plt.savefig("regression_scatter.png", dpi=150, bbox_inches="tight")
plt.show()
print("Saved: regression_scatter.png")

# ── Plot: Residual plot ───────────────────────────────────────────────────────
df_sorted = df.sort_values("sdi").reset_index(drop=True)

fig, ax = plt.subplots(figsize=(13, 4))
colors = ["#E24B4A" if r > 0 else "#60A5FA" for r in df_sorted["comm_resid"]]
ax.bar(range(len(df_sorted)), df_sorted["comm_resid"], color=colors, width=1.0, alpha=0.8)
ax.axhline(0, color="black", lw=1)
ax.axhline( 1.5 * resid_sd, color="#E24B4A", lw=1.2, ls="--", label="+1.5 SD")
ax.axhline(-1.5 * resid_sd, color="#60A5FA", lw=1.2, ls="--", label="−1.5 SD")
ax.set_xlabel("Countries (sorted by ascending SDI)", fontsize=10)
ax.set_ylabel("Residual ε = y − ŷ  (DALYs/1k)", fontsize=10)
ax.set_title("Communicable Burden Residuals — OLS Regression", fontsize=12, fontweight="bold")
ax.set_xticks([])
ax.legend(fontsize=9)
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("regression_residuals.png", dpi=150, bbox_inches="tight")
plt.show()
print("Saved: regression_residuals.png")


# =============================================================================
# SECTION 3 — K-MEANS CLUSTERING
# =============================================================================
#
# Feature space: [SDI, communicable rate, NCD rate, injury rate]
# Preprocessing: z-score standardisation (StandardScaler) so that all four
#                dimensions contribute equally regardless of their raw scale.
# k = 4 chosen via elbow method (WCSS across k ∈ {2, …, 8}).
#
# After fitting, clusters are relabelled by ascending mean SDI so that:
#   C0 = lowest SDI (communicable-dominant, pre-transition)
#   C1 = mid-low SDI (dual burden, early transition)
#   C2 = mid-high SDI (NCD-emerging, late transition)
#   C3 = highest SDI (NCD-dominant, post-transition)
#
# Assumptions:
#   - Euclidean distance in z-score space is an appropriate similarity metric
#   - k = 4 is appropriate — justified by elbow method below
#   - Clusters are approximately spherical and similarly sized (KMeans assumption)

print("\n" + "="*60)
print("SECTION 3 — K-MEANS CLUSTERING")
print("="*60)

FEATURES = ["sdi", "comm_rate", "ncd_rate", "inj_rate"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[FEATURES].values)

# ── Elbow method: plot WCSS for k = 2..8 ─────────────────────────────────────
wcss = []
k_range = range(2, 9)
for k in k_range:
    km_tmp = KMeans(n_clusters=k, random_state=42, n_init=20)
    km_tmp.fit(X_scaled)
    wcss.append(km_tmp.inertia_)

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(k_range, wcss, marker="o", color="#60A5FA", lw=2, markersize=7)
ax.axvline(4, color="#E24B4A", ls="--", lw=1.2, label="k = 4 (selected)")
ax.set_xlabel("Number of clusters k", fontsize=10)
ax.set_ylabel("Within-cluster sum of squares (WCSS)", fontsize=10)
ax.set_title("Elbow Method for Optimal k", fontsize=12, fontweight="bold")
ax.legend(fontsize=9)
ax.grid(True, linewidth=0.4, alpha=0.5)
ax.spines[["top", "right"]].set_visible(False)
plt.tight_layout()
plt.savefig("kmeans_elbow.png", dpi=150, bbox_inches="tight")
plt.show()
print("Saved: kmeans_elbow.png")

# ── Fit final model with k = 4 ────────────────────────────────────────────────
km = KMeans(n_clusters=4, random_state=42, n_init=20)
df["cluster_raw"] = km.fit_predict(X_scaled)

# Relabel clusters by ascending mean SDI
sdi_order = df.groupby("cluster_raw")["sdi"].mean().sort_values().index.tolist()
remap = {old: new for new, old in enumerate(sdi_order)}
df["cluster"] = df["cluster_raw"].map(remap)

# Cluster profiles
cluster_profiles = df.groupby("cluster")[FEATURES].mean().round(3)
cluster_counts   = df.groupby("cluster").size().rename("n_countries")
cluster_labels   = {0: "C0 Low SDI", 1: "C1 Mid-Low", 2: "C2 Mid-High", 3: "C3 High SDI"}

print("\nCluster profiles (mean values, sorted by ascending SDI):")
print(pd.concat([cluster_counts, cluster_profiles], axis=1).to_string())

# ── Plot: cluster scatter ─────────────────────────────────────────────────────
CLUSTER_COLORS = ["#E24B4A", "#FB923C", "#4ADE80", "#60A5FA"]

fig, axes = plt.subplots(1, 2, figsize=(14, 5))
fig.suptitle("K-Means Clustering (k=4) — Epidemiological Transition Profiles", fontsize=13, fontweight="bold")

# Scatter: SDI vs communicable rate
ax = axes[0]
for ci in range(4):
    mask = df["cluster"] == ci
    ax.scatter(df.loc[mask, "sdi"], df.loc[mask, "comm_rate"],
               color=CLUSTER_COLORS[ci], s=50, alpha=0.8,
               label=f"{cluster_labels[ci]} (n={mask.sum()})",
               edgecolors="none")
ax.set_xlabel("SDI", fontsize=10)
ax.set_ylabel("Communicable DALYs per 1,000", fontsize=10)
ax.set_title("Cluster Assignment: SDI vs Communicable Burden", fontsize=11, fontweight="bold")
ax.legend(fontsize=9, framealpha=0.6)
ax.grid(True, linewidth=0.4, alpha=0.5)
ax.spines[["top", "right"]].set_visible(False)

# Stacked bar: mean profile per cluster
ax2 = axes[1]
x = np.arange(4)
w = 0.55
b_comm = cluster_profiles["comm_rate"].values
b_ncd  = cluster_profiles["ncd_rate"].values
b_inj  = cluster_profiles["inj_rate"].values
ax2.bar(x, b_comm, w, color="#E24B4A", alpha=0.85, label="Communicable")
ax2.bar(x, b_ncd,  w, bottom=b_comm, color="#60A5FA", alpha=0.85, label="NCD")
ax2.bar(x, b_inj,  w, bottom=b_comm+b_ncd, color="#4ADE80", alpha=0.85, label="Injuries")
ax2.set_xticks(x)
ax2.set_xticklabels([cluster_labels[i] for i in range(4)], fontsize=9)
ax2.set_ylabel("Mean DALYs per 1,000", fontsize=10)
ax2.set_title("Mean Disease Burden Profile per Cluster", fontsize=11, fontweight="bold")
ax2.legend(fontsize=9, framealpha=0.6)
ax2.grid(True, linewidth=0.4, alpha=0.5, axis="y")
ax2.spines[["top", "right"]].set_visible(False)

plt.tight_layout()
plt.savefig("kmeans_clusters.png", dpi=150, bbox_inches="tight")
plt.show()
print("Saved: kmeans_clusters.png")


# =============================================================================
# SECTION 4 — ANOMALY DETECTION
# =============================================================================
#
# Method: residual-based threshold detection on the communicable OLS regression.
#
# For each country i:
#   ε_i = comm_rate_i − (slope_c * SDI_i + int_c)
#
# Flagging rule:
#   ε_i >  +1.5 * σ  →  anomaly = +1  ("underperformer": higher burden than expected)
#   ε_i <  −1.5 * σ  →  anomaly = −1  ("overperformer":  lower  burden than expected)
#   otherwise         →  anomaly =  0  (within expected range)
#
# σ = standard deviation of all residuals (computed in Section 2).
#
# Assumptions:
#   - 1.5 SD is an appropriate threshold (more lenient than the conventional 2 SD)
#   - Residuals are approximately normally distributed
#   - Anomalies reflect genuine health-system effects, not just data quality issues

print("\n" + "="*60)
print("SECTION 4 — ANOMALY DETECTION")
print("="*60)

# Residuals were already computed in Section 2
THRESHOLD = 1.5  # SD multiplier

df["anomaly"] = 0
df.loc[df["comm_resid"] >  THRESHOLD * resid_sd, "anomaly"] =  1
df.loc[df["comm_resid"] < -THRESHOLD * resid_sd, "anomaly"] = -1

n_under = (df["anomaly"] ==  1).sum()
n_over  = (df["anomaly"] == -1).sum()
n_ok    = (df["anomaly"] ==  0).sum()

print(f"\nThreshold:      ±{THRESHOLD} × σ  (σ = {resid_sd:.1f} DALYs/1k)")
print(f"Band:           [{-THRESHOLD*resid_sd:.1f},  +{THRESHOLD*resid_sd:.1f}] DALYs/1k")
print(f"Within band:    {n_ok} countries")
print(f"Underperformers (ε > +{THRESHOLD}σ): {n_under} countries")
print(f"Overperformers  (ε < -{THRESHOLD}σ): {n_over} countries")

# ── Print ranked tables ───────────────────────────────────────────────────────
underperformers = (
    df[df["anomaly"] == 1]
    [["country", "sdi", "comm_rate", "comm_resid"]]
    .sort_values("comm_resid", ascending=False)
    .reset_index(drop=True)
)
overperformers = (
    df[df["anomaly"] == -1]
    [["country", "sdi", "comm_rate", "comm_resid"]]
    .sort_values("comm_resid")
    .reset_index(drop=True)
)

print("\nUnderperformers (burden HIGHER than SDI predicts):")
print(underperformers.to_string(index=False))

print("\nOverperformers (burden LOWER than SDI predicts):")
print(overperformers.to_string(index=False))

# ── Plot: anomaly scatter ─────────────────────────────────────────────────────
x_line = np.linspace(df["sdi"].min(), df["sdi"].max(), 200)
y_line = slope_c * x_line + int_c

fig, ax = plt.subplots(figsize=(12, 6))

# Within-band countries
mask_ok   = df["anomaly"] == 0
mask_over = df["anomaly"] == 1
mask_low  = df["anomaly"] == -1

ax.scatter(df.loc[mask_ok, "sdi"], df.loc[mask_ok, "comm_rate"],
           color="#9CA3AF", s=35, alpha=0.5, edgecolors="none", label="Expected", zorder=2)
ax.scatter(df.loc[mask_over, "sdi"], df.loc[mask_over, "comm_rate"],
           color="#E24B4A", s=80, alpha=0.9, marker="^",
           label=f"Underperformer (n={n_under})", zorder=4)
ax.scatter(df.loc[mask_low, "sdi"], df.loc[mask_low, "comm_rate"],
           color="#60A5FA", s=80, alpha=0.9, marker="v",
           label=f"Overperformer (n={n_over})", zorder=4)

# Regression line
ax.plot(x_line, y_line, color="black", lw=1.5, ls="--", zorder=3, label="OLS fit")

# ±1.5 SD band
ax.fill_between(x_line,
                y_line - THRESHOLD * resid_sd,
                y_line + THRESHOLD * resid_sd,
                alpha=0.08, color="grey", label=f"±{THRESHOLD} SD band")

# Label anomalous countries
for _, row in pd.concat([underperformers, overperformers]).iterrows():
    color = "#E24B4A" if row["comm_resid"] > 0 else "#60A5FA"
    ax.annotate(
        row["country"][:14],
        (row["sdi"], row["comm_rate"]),
        textcoords="offset points", xytext=(5, 3),
        fontsize=7.5, color=color, alpha=0.9
    )

ax.set_xlabel("Socio-Demographic Index (SDI)", fontsize=10)
ax.set_ylabel("Communicable Disease DALYs per 1,000 population", fontsize=10)
ax.set_title(
    f"Anomaly Detection — Countries with Unexpected Communicable Disease Burden\n"
    f"(threshold: ±{THRESHOLD} SD from OLS regression line, σ = {resid_sd:.1f} DALYs/1k)",
    fontsize=11, fontweight="bold"
)
ax.legend(fontsize=9, framealpha=0.7)
ax.grid(True, linewidth=0.4, alpha=0.4)
ax.spines[["top", "right"]].set_visible(False)

plt.tight_layout()
plt.savefig("anomaly_detection.png", dpi=150, bbox_inches="tight")
plt.show()
print("Saved: anomaly_detection.png")


# =============================================================================
# SECTION 5 — COMBINED SUMMARY OUTPUT
# =============================================================================

print("\n" + "="*60)
print("SECTION 5 — FINAL ANNOTATED DATASET")
print("="*60)

output_cols = [
    "country", "iso", "sdi",
    "comm_rate", "ncd_rate", "inj_rate", "all_rate",
    "comm_pred", "comm_resid",
    "cluster", "anomaly"
]

df_out = df[output_cols].copy()
df_out["cluster_label"] = df_out["cluster"].map(cluster_labels)
df_out["anomaly_label"] = df_out["anomaly"].map({
     1: "underperformer",
    -1: "overperformer",
     0: "expected"
})
df_out = df_out.sort_values("sdi").reset_index(drop=True)

print(df_out.head(10).to_string(index=False))
df_out.to_csv("model_output.csv", index=False)
print(f"\nFull results saved to: model_output.csv ({len(df_out)} rows)")

print("\n" + "="*60)
print("ALL MODELS COMPLETE")
print("="*60)
print(f"  OLS Communicable R²   : {r_c**2:.3f}")
print(f"  OLS NCD R²            : {r_n**2:.3f}")
print(f"  OLS Injuries R²       : {r_i**2:.3f}")
print(f"  K-Means clusters (k)  : 4")
print(f"  Countries clustered   : {len(df)}")
print(f"  Anomalies flagged     : {n_under + n_over}  ({n_under} under + {n_over} over)")
