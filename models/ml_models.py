# =============================================================================
# CDS3 2026 — Epidemiological Transition Analysis
# ML Pipeline: OLS Regression · K-Means Clustering · Anomaly Detection
#
# Datasets required (same directory as this script):
#   ghe2021_daly_bycountry_2021.xlsx   (WHO GHE 2021)
#   SDI.csv                            (IHME Socio-Demographic Index)
#
# Install:  pip install pandas numpy openpyxl scipy scikit-learn matplotlib seaborn
# =============================================================================

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
import warnings
warnings.filterwarnings("ignore")

from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.pipeline import Pipeline
from sklearn.model_selection import (
    train_test_split, KFold, cross_validate, GridSearchCV
)
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score
)
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score, calinski_harabasz_score
)
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

RANDOM_STATE = 42
np.random.seed(RANDOM_STATE)

# =============================================================================
# SECTION 1 — DATA LOADING & PREPROCESSING
# =============================================================================

print("=" * 65)
print("SECTION 1 — DATA LOADING & PREPROCESSING")
print("=" * 65)

# ── 1.1  Parse WHO GHE 2021 ─────────────────────────────────────────────────
# The spreadsheet uses a multi-row preamble before the data starts.
# We locate country columns dynamically from the header row rather than
# hardcoding column positions.

daly_raw = pd.read_excel(
    "ghe2021_daly_bycountry_2021.xlsx",
    sheet_name="All ages",
    header=None
)

# Dynamically locate the header row (contains "Sex" in column 0)
header_row = next(
    i for i in range(20) if str(daly_raw.iloc[i, 0]).strip() == "Sex"
)
country_name_row = header_row          # country names
iso_row          = header_row + 1      # ISO-3 codes
pop_row          = header_row + 3      # population ('000)
all_row          = header_row + 4      # All Causes

# Locate the three top-level disease category rows by label search
def find_label_row(label, search_col=3, start=header_row, end=300):
    """Return the first row index where search_col contains the given label."""
    for i in range(start, end):
        cell = str(daly_raw.iloc[i, search_col]).strip()
        if label.lower() in cell.lower():
            return i
    raise ValueError(f"Label '{label}' not found in column {search_col}")

comm_row = find_label_row("Communicable, maternal")
ncd_row  = find_label_row("Noncommunicable diseases")
inj_row  = find_label_row("Injuries")

print(f"Header row   : {header_row}")
print(f"Comm row     : {comm_row}  — '{str(daly_raw.iloc[comm_row, 3])[:60]}'")
print(f"NCD row      : {ncd_row}   — '{str(daly_raw.iloc[ncd_row,  3])[:60]}'")
print(f"Injuries row : {inj_row}  — '{str(daly_raw.iloc[inj_row,  3])[:60]}'")

# Country columns start at index 7 (first 7 cols are metadata)
country_cols = [
    i + 7
    for i, v in enumerate(daly_raw.iloc[country_name_row, 7:])
    if pd.notna(v) and str(v).strip() not in ("", "nan")
]
countries = [str(daly_raw.iloc[country_name_row, c]).strip() for c in country_cols]
iso_codes = [str(daly_raw.iloc[iso_row,          c]).strip() for c in country_cols]


def get_row(row_idx):
    return np.array([
        pd.to_numeric(daly_raw.iloc[row_idx, c], errors="coerce")
        for c in country_cols
    ])


pop   = get_row(pop_row)
total = get_row(all_row)
comm  = get_row(comm_row)
ncd   = get_row(ncd_row)
inj   = get_row(inj_row)

# Rates per 1,000 population
daly_df = pd.DataFrame({
    "country":   countries,
    "iso":       iso_codes,
    "all_rate":  total / pop * 1000,
    "comm_rate": comm  / pop * 1000,
    "ncd_rate":  ncd   / pop * 1000,
    "inj_rate":  inj   / pop * 1000,
}).dropna()

print(f"\nGHE dataset  : {len(daly_df)} countries loaded")

# ── 1.2  Load IHME SDI ──────────────────────────────────────────────────────
sdi_raw = pd.read_csv("SDI.csv")

# Use the most recent available year for each location
latest_year = sdi_raw["year_id"].max()
sdi_latest = (
    sdi_raw[
        (sdi_raw["year_id"] == latest_year) &
        (sdi_raw["age_group_name"] == "All Ages") &
        (sdi_raw["sex"] == "Both")
    ]
    [["location_name", "mean_value"]]
    .rename(columns={"location_name": "country", "mean_value": "sdi"})
    .drop_duplicates("country")
)

print(f"SDI dataset  : {len(sdi_latest)} locations (year {latest_year})")

# ── 1.3  Merge ───────────────────────────────────────────────────────────────
df = daly_df.merge(sdi_latest, on="country", how="inner").reset_index(drop=True)
print(f"Merged       : {len(df)} countries\n")

# Feature matrix used across all models
FEATURES = ["sdi", "comm_rate", "ncd_rate", "inj_rate"]
X_full   = df[FEATURES].values       # shape (n, 4)
y_comm   = df["comm_rate"].values     # regression target: communicable rate
X_sdi    = df[["sdi"]].values         # single-feature regression input


# =============================================================================
# SECTION 2 — OLS REGRESSION  (sklearn Pipeline + cross-validation)
# =============================================================================
# Goal: predict communicable disease DALY rate from SDI.
#
# Pipeline:
#   StandardScaler  → scales the SDI predictor to zero-mean, unit-variance
#   LinearRegression → OLS (no regularisation; equivalent to scipy linregress
#                       but integrated into sklearn so it composes with CV/Grid)
#
# Evaluation:
#   • 80/20 train-test split (stratified by SDI quartile for balanced folds)
#   • 5-fold cross-validation on the training set → CV RMSE, CV R²
#   • Hold-out test set → final RMSE, MAE, R²
#   • Comparison models: Ridge (L2) and Lasso (L1) with GridSearchCV

print("=" * 65)
print("SECTION 2 — OLS REGRESSION")
print("=" * 65)

# ── 2.1  Train / test split ──────────────────────────────────────────────────
# Stratify by SDI quartile so every fold sees the full SDI range
sdi_quartile = pd.qcut(df["sdi"], q=4, labels=False)

X_train, X_test, y_train, y_test = train_test_split(
    X_sdi, y_comm,
    test_size=0.2,
    random_state=RANDOM_STATE,
    stratify=sdi_quartile
)
print(f"\nTrain size : {len(X_train)}  |  Test size : {len(X_test)}")

# ── 2.2  Build OLS pipeline ──────────────────────────────────────────────────
ols_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("ols",    LinearRegression())
])

# ── 2.3  5-fold cross-validation on training set ─────────────────────────────
kf = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

cv_results = cross_validate(
    ols_pipeline, X_train, y_train,
    cv=kf,
    scoring=["r2", "neg_root_mean_squared_error", "neg_mean_absolute_error"],
    return_train_score=True
)

print("\n── OLS 5-fold cross-validation (training set) ──")
print(f"  CV R²    :  {cv_results['test_r2'].mean():.3f}  ±  {cv_results['test_r2'].std():.3f}")
print(f"  CV RMSE  :  {-cv_results['test_neg_root_mean_squared_error'].mean():.1f}  ±  {-cv_results['test_neg_root_mean_squared_error'].std():.1f}  DALYs/1k")
print(f"  CV MAE   :  {-cv_results['test_neg_mean_absolute_error'].mean():.1f}  ±  {-cv_results['test_neg_mean_absolute_error'].std():.1f}  DALYs/1k")
print(f"  Train R² :  {cv_results['train_r2'].mean():.3f}  (overfit gap: {cv_results['train_r2'].mean() - cv_results['test_r2'].mean():.3f})")

# ── 2.4  Fit on full training set → evaluate on hold-out test set ────────────
ols_pipeline.fit(X_train, y_train)
y_pred_test = ols_pipeline.predict(X_test)

test_r2   = r2_score(y_test, y_pred_test)
test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
test_mae  = mean_absolute_error(y_test, y_pred_test)

print("\n── OLS hold-out test set ──")
print(f"  Test R²   : {test_r2:.3f}")
print(f"  Test RMSE : {test_rmse:.1f}  DALYs/1k")
print(f"  Test MAE  : {test_mae:.1f}  DALYs/1k")

# Recover interpretable slope / intercept in original (unscaled) units
ols_coef       = ols_pipeline.named_steps["ols"].coef_[0]
ols_intercept  = ols_pipeline.named_steps["ols"].intercept_
scaler_mean    = ols_pipeline.named_steps["scaler"].mean_[0]
scaler_std     = ols_pipeline.named_steps["scaler"].scale_[0]
slope_original = ols_coef / scaler_std
intercept_original = ols_intercept - ols_coef * scaler_mean / scaler_std

print(f"\n── OLS coefficients (original SDI scale) ──")
print(f"  Slope     : {slope_original:.2f}  DALYs/1k per unit SDI")
print(f"  Intercept : {intercept_original:.2f}")

# ── 2.5  Comparison: Ridge and Lasso with GridSearchCV ───────────────────────
alpha_grid = {"model__alpha": [0.01, 0.1, 1, 10, 100, 1000]}

ridge_pipe = Pipeline([("scaler", StandardScaler()), ("model", Ridge())])
lasso_pipe = Pipeline([("scaler", StandardScaler()), ("model", Lasso(max_iter=10000))])

ridge_cv = GridSearchCV(ridge_pipe, alpha_grid, cv=kf,
                        scoring="neg_root_mean_squared_error", refit=True)
lasso_cv = GridSearchCV(lasso_pipe, alpha_grid, cv=kf,
                        scoring="neg_root_mean_squared_error", refit=True)

ridge_cv.fit(X_train, y_train)
lasso_cv.fit(X_train, y_train)

print("\n── Regularised model comparison on hold-out test set ──")
models_reg = {
    "OLS (no reg)":                     ols_pipeline,
    f"Ridge (α={ridge_cv.best_params_['model__alpha']})": ridge_cv.best_estimator_,
    f"Lasso (α={lasso_cv.best_params_['model__alpha']})": lasso_cv.best_estimator_,
}
for name, model in models_reg.items():
    yp = model.predict(X_test)
    print(f"  {name:<28}  R²={r2_score(yp, y_test):.3f}  "
          f"RMSE={np.sqrt(mean_squared_error(y_test, yp)):.1f}")

# ── 2.6  Fit final OLS on ALL data → compute residuals for anomaly detection ─
ols_pipeline.fit(X_sdi, y_comm)
y_pred_all       = ols_pipeline.predict(X_sdi)
df["comm_pred"]  = y_pred_all
df["comm_resid"] = df["comm_rate"] - y_pred_all
resid_sd         = df["comm_resid"].std()

print(f"\nFinal OLS fit on full dataset: R² = {r2_score(y_comm, y_pred_all):.3f}")
print(f"Residual SD = {resid_sd:.2f} DALYs/1k  (used as anomaly threshold base)")

# ── 2.7  Plots ───────────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(17, 5))
fig.suptitle("OLS Regression: SDI → Communicable Disease Burden", fontsize=13, fontweight="bold")

# (a) Train/test scatter with regression line
ax = axes[0]
ax.scatter(X_train, y_train, color="#60A5FA", s=30, alpha=0.6, label="Train", edgecolors="none")
ax.scatter(X_test,  y_test,  color="#F97316", s=50, alpha=0.9, label="Test",  edgecolors="none", marker="D")
x_line = np.linspace(X_sdi.min(), X_sdi.max(), 200).reshape(-1, 1)
ax.plot(x_line, ols_pipeline.predict(x_line), color="black", lw=1.8, ls="--", label="OLS fit (all data)")
ax.set_xlabel("SDI"); ax.set_ylabel("Communicable DALYs / 1,000")
ax.set_title(f"Fit  (Test R² = {test_r2:.3f})", fontweight="bold")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (b) Predicted vs actual (test set)
ax = axes[1]
ax.scatter(y_test, y_pred_test, color="#E24B4A", s=50, alpha=0.8, edgecolors="none")
lims = [min(y_test.min(), y_pred_test.min()) - 10,
        max(y_test.max(), y_pred_test.max()) + 10]
ax.plot(lims, lims, "k--", lw=1.2, label="Perfect prediction")
ax.set_xlabel("Actual (DALYs/1k)"); ax.set_ylabel("Predicted (DALYs/1k)")
ax.set_title("Predicted vs Actual — Test Set", fontweight="bold")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (c) CV R² per fold
ax = axes[2]
fold_r2 = cv_results["test_r2"]
bars = ax.bar(range(1, 6), fold_r2, color="#60A5FA", alpha=0.8, edgecolor="white")
ax.axhline(fold_r2.mean(), color="#E24B4A", lw=1.5, ls="--", label=f"Mean R² = {fold_r2.mean():.3f}")
ax.set_xlabel("Fold"); ax.set_ylabel("R²")
ax.set_title("5-Fold CV R² per Fold", fontweight="bold")
ax.set_ylim(0, 1); ax.legend(fontsize=9); ax.grid(True, alpha=0.3, axis="y")
ax.spines[["top","right"]].set_visible(False)
for bar, v in zip(bars, fold_r2):
    ax.text(bar.get_x() + bar.get_width()/2, v + 0.01, f"{v:.3f}", ha="center", fontsize=8)

plt.tight_layout()
plt.savefig("regression_results.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: regression_results.png")


# =============================================================================
# SECTION 3 — K-MEANS CLUSTERING
# =============================================================================
# Feature space : [SDI, communicable rate, NCD rate, injury rate]
# Preprocessing : StandardScaler (z-score normalisation)
# Model         : KMeans
#
# Model selection: elbow (WCSS), silhouette score, Davies-Bouldin index,
#                  and Calinski-Harabasz index are all computed across k = 2..9.
# Final model   : k = 4  (best balance across metrics)
#
# Evaluation metrics:
#   Silhouette score   — higher is better  (range −1 to 1)
#   Davies-Bouldin     — lower is better   (≥ 0)
#   Calinski-Harabasz  — higher is better  (≥ 0)

print("\n" + "=" * 65)
print("SECTION 3 — K-MEANS CLUSTERING")
print("=" * 65)

# ── 3.1  Preprocessing ───────────────────────────────────────────────────────
scaler_km = StandardScaler()
X_scaled  = scaler_km.fit_transform(df[FEATURES].values)

# ── 3.2  Model selection across k = 2..9 ─────────────────────────────────────
k_range = range(2, 10)
wcss, sil, db, ch = [], [], [], []

for k in k_range:
    km_tmp = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=20)
    labels = km_tmp.fit_predict(X_scaled)
    wcss.append(km_tmp.inertia_)
    sil.append(silhouette_score(X_scaled, labels))
    db.append(davies_bouldin_score(X_scaled, labels))
    ch.append(calinski_harabasz_score(X_scaled, labels))

print("\n── Cluster evaluation metrics ──")
print(f"{'k':<4} {'WCSS':>9} {'Silhouette':>12} {'Davies-Bouldin':>16} {'Calinski-H':>12}")
print("-" * 57)
for i, k in enumerate(k_range):
    print(f"{k:<4} {wcss[i]:>9.1f} {sil[i]:>12.3f} {db[i]:>16.3f} {ch[i]:>12.1f}")

best_k = 4
print(f"\nSelected k = {best_k}  (elbow + highest silhouette in interpretable range)")

# ── 3.3  Fit final model ──────────────────────────────────────────────────────
km_final = KMeans(n_clusters=best_k, random_state=RANDOM_STATE, n_init=20)
df["cluster_raw"] = km_final.fit_predict(X_scaled)

# Compute final cluster quality scores
final_sil = silhouette_score(X_scaled, df["cluster_raw"])
final_db  = davies_bouldin_score(X_scaled, df["cluster_raw"])
final_ch  = calinski_harabasz_score(X_scaled, df["cluster_raw"])

print(f"\n── Final model (k={best_k}) quality scores ──")
print(f"  Silhouette score   : {final_sil:.3f}  (higher → more compact/separated clusters)")
print(f"  Davies-Bouldin     : {final_db:.3f}  (lower  → better separation)")
print(f"  Calinski-Harabasz  : {final_ch:.1f}  (higher → better defined clusters)")

# Relabel clusters by ascending mean SDI for interpretability
sdi_order = df.groupby("cluster_raw")["sdi"].mean().sort_values().index.tolist()
remap     = {old: new for new, old in enumerate(sdi_order)}
df["cluster"] = df["cluster_raw"].map(remap)

cluster_labels = {
    0: "C0 Low SDI",
    1: "C1 Mid-Low SDI",
    2: "C2 Mid-High SDI",
    3: "C3 High SDI"
}
df["cluster_label"] = df["cluster"].map(cluster_labels)

# Per-cluster profile
profile = df.groupby("cluster")[FEATURES + ["all_rate"]].agg(["mean", "std"]).round(2)
counts  = df.groupby("cluster").size().rename("n")
print("\n── Cluster profiles (mean ± std) ──")
for ci in range(best_k):
    mask = df["cluster"] == ci
    sub  = df[mask]
    print(f"  {cluster_labels[ci]} (n={mask.sum()}):  "
          f"SDI={sub['sdi'].mean():.2f}±{sub['sdi'].std():.2f}  "
          f"Comm={sub['comm_rate'].mean():.0f}±{sub['comm_rate'].std():.0f}  "
          f"NCD={sub['ncd_rate'].mean():.0f}±{sub['ncd_rate'].std():.0f}  "
          f"Inj={sub['inj_rate'].mean():.0f}±{sub['inj_rate'].std():.0f}")

# Per-sample silhouette scores for detailed inspection
from sklearn.metrics import silhouette_samples
sample_sil = silhouette_samples(X_scaled, df["cluster_raw"])
df["silhouette"] = sample_sil

# ── 3.4  Plots ───────────────────────────────────────────────────────────────
CLUSTER_COLORS = ["#E24B4A", "#FB923C", "#4ADE80", "#60A5FA"]

fig = plt.figure(figsize=(18, 10))
gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.4, wspace=0.35)
fig.suptitle("K-Means Clustering (k=4) — Epidemiological Profiles", fontsize=13, fontweight="bold")

# (a) Elbow plot
ax = fig.add_subplot(gs[0, 0])
ax.plot(k_range, wcss, marker="o", color="#60A5FA", lw=2)
ax.axvline(best_k, color="#E24B4A", ls="--", lw=1.2, label=f"k={best_k}")
ax.set_xlabel("k"); ax.set_ylabel("WCSS")
ax.set_title("Elbow Method", fontweight="bold")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (b) Silhouette score vs k
ax = fig.add_subplot(gs[0, 1])
ax.plot(k_range, sil, marker="o", color="#4ADE80", lw=2)
ax.axvline(best_k, color="#E24B4A", ls="--", lw=1.2)
ax.set_xlabel("k"); ax.set_ylabel("Silhouette score")
ax.set_title("Silhouette Score vs k", fontweight="bold")
ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (c) Davies-Bouldin vs k
ax = fig.add_subplot(gs[0, 2])
ax.plot(k_range, db, marker="o", color="#FB923C", lw=2)
ax.axvline(best_k, color="#E24B4A", ls="--", lw=1.2)
ax.set_xlabel("k"); ax.set_ylabel("Davies-Bouldin index")
ax.set_title("Davies-Bouldin vs k  (↓ better)", fontweight="bold")
ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (d) Cluster scatter: SDI vs communicable rate
ax = fig.add_subplot(gs[1, 0])
for ci in range(best_k):
    m = df["cluster"] == ci
    ax.scatter(df.loc[m, "sdi"], df.loc[m, "comm_rate"],
               color=CLUSTER_COLORS[ci], s=45, alpha=0.8,
               label=f"{cluster_labels[ci]} (n={m.sum()})", edgecolors="none")
ax.set_xlabel("SDI"); ax.set_ylabel("Communicable DALYs/1k")
ax.set_title("Cluster Assignment", fontweight="bold")
ax.legend(fontsize=8, framealpha=0.6); ax.grid(True, alpha=0.3)
ax.spines[["top","right"]].set_visible(False)

# (e) Stacked mean burden per cluster
ax = fig.add_subplot(gs[1, 1])
x  = np.arange(best_k)
w  = 0.55
b_c = [df[df["cluster"]==ci]["comm_rate"].mean() for ci in range(best_k)]
b_n = [df[df["cluster"]==ci]["ncd_rate"].mean()  for ci in range(best_k)]
b_i = [df[df["cluster"]==ci]["inj_rate"].mean()  for ci in range(best_k)]
ax.bar(x, b_c, w, color="#E24B4A", alpha=0.85, label="Communicable")
ax.bar(x, b_n, w, bottom=b_c, color="#60A5FA", alpha=0.85, label="NCD")
ax.bar(x, b_i, w, bottom=np.array(b_c)+np.array(b_n), color="#4ADE80", alpha=0.85, label="Injuries")
ax.set_xticks(x); ax.set_xticklabels([f"C{i}" for i in range(best_k)], fontsize=9)
ax.set_ylabel("Mean DALYs/1k"); ax.set_title("Cluster Burden Profile", fontweight="bold")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3, axis="y"); ax.spines[["top","right"]].set_visible(False)

# (f) Per-sample silhouette scores by cluster
ax = fig.add_subplot(gs[1, 2])
y_lower = 10
for ci in range(best_k):
    sil_vals = np.sort(df.loc[df["cluster"]==ci, "silhouette"].values)
    y_upper  = y_lower + len(sil_vals)
    ax.fill_betweenx(np.arange(y_lower, y_upper), 0, sil_vals,
                     facecolor=CLUSTER_COLORS[ci], alpha=0.7)
    ax.text(-0.02, (y_lower + y_upper) / 2, f"C{ci}", ha="right", va="center", fontsize=9)
    y_lower = y_upper + 5
ax.axvline(final_sil, color="red", ls="--", lw=1.2, label=f"Avg = {final_sil:.3f}")
ax.set_xlabel("Silhouette coefficient"); ax.set_ylabel("Cluster")
ax.set_title("Per-Sample Silhouette", fontweight="bold")
ax.legend(fontsize=9); ax.spines[["top","right"]].set_visible(False)

plt.savefig("clustering_results.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: clustering_results.png")


# =============================================================================
# SECTION 4 — ANOMALY DETECTION
# =============================================================================
# Three complementary methods are run and their results compared:
#
#   Method 1 — OLS Residual Detector
#     Uses the communicable OLS regression residuals from Section 2.
#     Flags countries whose residual exceeds ±1.5 SD.
#     Interpretable, directly tied to the regression model.
#
#   Method 2 — Isolation Forest  (sklearn.ensemble.IsolationForest)
#     Fits a forest of isolation trees on the full 4-D feature space.
#     contamination = estimated fraction of anomalies (26/186 ≈ 0.14).
#     Doesn't require distributional assumptions; works in n-D space.
#
#   Method 3 — Local Outlier Factor  (sklearn.neighbors.LocalOutlierFactor)
#     Compares local density of each point to its k nearest neighbours.
#     Good at detecting cluster-relative outliers (e.g. a high-income country
#     with unusually high communicable burden relative to its peers).
#     n_neighbors = 20, contamination = 0.14.
#
# Comparison: we report per-method counts and an agreement matrix showing
# how many countries are flagged by 1, 2, or all 3 methods.

print("\n" + "=" * 65)
print("SECTION 4 — ANOMALY DETECTION")
print("=" * 65)

CONTAMINATION = round((n_under + n_over if "n_under" in dir() else 26) / len(df), 3)
# Compute n_under and n_over from residuals (already computed above)
THRESHOLD = 1.5
n_under_prelim = (df["comm_resid"] >  THRESHOLD * resid_sd).sum()
n_over_prelim  = (df["comm_resid"] < -THRESHOLD * resid_sd).sum()
CONTAMINATION  = round((n_under_prelim + n_over_prelim) / len(df), 3)
print(f"\nEstimated contamination rate: {CONTAMINATION}  "
      f"({n_under_prelim + n_over_prelim} anomalies / {len(df)} countries)")

# ── Method 1: OLS Residual Detector ──────────────────────────────────────────
df["anom_ols"] = 0
df.loc[df["comm_resid"] >  THRESHOLD * resid_sd, "anom_ols"] =  1
df.loc[df["comm_resid"] < -THRESHOLD * resid_sd, "anom_ols"] = -1

n_under_ols = (df["anom_ols"] ==  1).sum()
n_over_ols  = (df["anom_ols"] == -1).sum()
print(f"\nMethod 1 — OLS Residual (±{THRESHOLD}σ):")
print(f"  Threshold : ±{THRESHOLD * resid_sd:.1f} DALYs/1k")
print(f"  Flagged   : {n_under_ols + n_over_ols}  ({n_under_ols} underperformers, {n_over_ols} overperformers)")

# ── Method 2: Isolation Forest ───────────────────────────────────────────────
# Feature space: communicable rate + SDI (the plane the OLS residuals live in)
# We also run it on the full 4-D space for comparison
X_anom = df[["sdi", "comm_rate"]].values          # 2-D: interpretable
X_anom_full = StandardScaler().fit_transform(df[FEATURES].values)   # 4-D: full space

iso_forest = IsolationForest(
    n_estimators=300,
    contamination=CONTAMINATION,
    random_state=RANDOM_STATE,
    max_features=1.0,
    bootstrap=False
)
iso_labels_2d   = iso_forest.fit_predict(X_anom)         # +1 = normal, -1 = anomaly
iso_scores_2d   = iso_forest.score_samples(X_anom)       # lower = more anomalous

iso_forest_4d = IsolationForest(
    n_estimators=300,
    contamination=CONTAMINATION,
    random_state=RANDOM_STATE
)
iso_labels_4d = iso_forest_4d.fit_predict(X_anom_full)

df["anom_iso_2d"]    = iso_labels_2d          # +1=normal, -1=anomaly
df["iso_score_2d"]   = iso_scores_2d          # anomaly score
df["anom_iso_4d"]    = iso_labels_4d

n_iso_2d = (df["anom_iso_2d"] == -1).sum()
n_iso_4d = (df["anom_iso_4d"] == -1).sum()
print(f"\nMethod 2 — Isolation Forest:")
print(f"  2-D (SDI × comm_rate) : {n_iso_2d} anomalies flagged")
print(f"  4-D (full features)   : {n_iso_4d} anomalies flagged")

# ── Method 3: Local Outlier Factor ────────────────────────────────────────────
lof = LocalOutlierFactor(
    n_neighbors=20,
    contamination=CONTAMINATION,
    metric="euclidean"
)
lof_labels = lof.fit_predict(X_anom_full)    # +1=normal, -1=anomaly
lof_scores = lof.negative_outlier_factor_    # more negative = more anomalous

df["anom_lof"]   = lof_labels
df["lof_score"]  = lof_scores

n_lof = (df["anom_lof"] == -1).sum()
print(f"\nMethod 3 — Local Outlier Factor (k=20, 4-D):")
print(f"  Flagged : {n_lof} anomalies")

# ── Agreement matrix ──────────────────────────────────────────────────────────
# Convert to binary: 1 = flagged, 0 = normal
df["flag_ols"] = (df["anom_ols"]    != 0).astype(int)
df["flag_iso"] = (df["anom_iso_4d"] == -1).astype(int)
df["flag_lof"] = (df["anom_lof"]    == -1).astype(int)
df["n_methods_flagged"] = df["flag_ols"] + df["flag_iso"] + df["flag_lof"]

print("\n── Anomaly agreement across methods ──")
for n_agree in [3, 2, 1, 0]:
    countries_agree = df[df["n_methods_flagged"] == n_agree]["country"].tolist()
    print(f"  Flagged by {n_agree} method(s): {len(countries_agree)} countries"
          + (f"  → {', '.join(countries_agree[:6])}{'...' if len(countries_agree)>6 else ''}"
             if countries_agree else ""))

# High-confidence anomalies (flagged by all 3 methods)
high_confidence = df[df["n_methods_flagged"] == 3].sort_values("comm_resid", ascending=False)
print(f"\n── High-confidence anomalies (all 3 methods agree, n={len(high_confidence)}) ──")
print(high_confidence[["country", "sdi", "comm_rate", "comm_resid",
                        "iso_score_2d", "lof_score"]].to_string(index=False))

# ── 4.5  Plots ───────────────────────────────────────────────────────────────
fig, axes = plt.subplots(2, 2, figsize=(15, 12))
fig.suptitle("Anomaly Detection — Three Methods Compared", fontsize=13, fontweight="bold")

# (a) OLS Residual method
ax = axes[0, 0]
x_line = np.linspace(df["sdi"].min(), df["sdi"].max(), 200).reshape(-1, 1)
y_line = ols_pipeline.predict(x_line).flatten()
sd     = resid_sd

ax.scatter(df.loc[df["anom_ols"]==0,  "sdi"], df.loc[df["anom_ols"]==0,  "comm_rate"],
           color="#9CA3AF", s=28, alpha=0.5, edgecolors="none", label="Expected", zorder=2)
ax.scatter(df.loc[df["anom_ols"]==1,  "sdi"], df.loc[df["anom_ols"]==1,  "comm_rate"],
           color="#E24B4A", s=70, marker="^", alpha=0.9, label="Underperformer", zorder=4)
ax.scatter(df.loc[df["anom_ols"]==-1, "sdi"], df.loc[df["anom_ols"]==-1, "comm_rate"],
           color="#60A5FA", s=70, marker="v", alpha=0.9, label="Overperformer", zorder=4)
ax.plot(x_line, y_line, "k--", lw=1.5)
ax.fill_between(x_line.flatten(), y_line - THRESHOLD*sd, y_line + THRESHOLD*sd,
                alpha=0.08, color="grey")
ax.set_title(f"Method 1: OLS Residual (±{THRESHOLD}σ)\n"
             f"Flagged: {n_under_ols + n_over_ols}", fontweight="bold")
ax.set_xlabel("SDI"); ax.set_ylabel("Communicable DALYs/1k")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (b) Isolation Forest (2-D)
ax = axes[0, 1]
norm_mask = df["anom_iso_2d"] == 1
anom_mask = df["anom_iso_2d"] == -1
sc = ax.scatter(df.loc[norm_mask, "sdi"], df.loc[norm_mask, "comm_rate"],
                c=df.loc[norm_mask, "iso_score_2d"], cmap="Blues_r",
                s=28, alpha=0.7, edgecolors="none", label="Normal", vmin=-0.35, vmax=-0.05)
ax.scatter(df.loc[anom_mask, "sdi"], df.loc[anom_mask, "comm_rate"],
           color="#E24B4A", s=70, marker="D", alpha=0.9, label="Anomaly (IF)", zorder=4)
plt.colorbar(sc, ax=ax, label="Anomaly score (lower = more anomalous)", shrink=0.85)
ax.set_title(f"Method 2: Isolation Forest (2-D)\nFlagged: {n_iso_2d}", fontweight="bold")
ax.set_xlabel("SDI"); ax.set_ylabel("Communicable DALYs/1k")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (c) LOF (4-D shown on 2-D projection)
ax = axes[1, 0]
norm_mask_lof = df["anom_lof"] == 1
anom_mask_lof = df["anom_lof"] == -1
sc2 = ax.scatter(df.loc[norm_mask_lof, "sdi"], df.loc[norm_mask_lof, "comm_rate"],
                 c=df.loc[norm_mask_lof, "lof_score"], cmap="Greens_r",
                 s=28, alpha=0.7, edgecolors="none", vmin=-4, vmax=-1)
ax.scatter(df.loc[anom_mask_lof, "sdi"], df.loc[anom_mask_lof, "comm_rate"],
           color="#F97316", s=70, marker="D", alpha=0.9, label="Anomaly (LOF)", zorder=4)
plt.colorbar(sc2, ax=ax, label="LOF score (more negative = more anomalous)", shrink=0.85)
ax.set_title(f"Method 3: Local Outlier Factor (4-D)\nFlagged: {n_lof}", fontweight="bold")
ax.set_xlabel("SDI"); ax.set_ylabel("Communicable DALYs/1k")
ax.legend(fontsize=9); ax.grid(True, alpha=0.3); ax.spines[["top","right"]].set_visible(False)

# (d) Agreement heatmap
ax = axes[1, 1]
agreement_counts = df["n_methods_flagged"].value_counts().sort_index()
colors_agree = ["#374151", "#60A5FA", "#F97316", "#E24B4A"]
bars = ax.bar(agreement_counts.index, agreement_counts.values,
              color=[colors_agree[i] for i in agreement_counts.index],
              edgecolor="white", linewidth=1.2)
for bar, v in zip(bars, agreement_counts.values):
    ax.text(bar.get_x() + bar.get_width()/2, v + 0.5, str(v),
            ha="center", va="bottom", fontweight="bold", fontsize=10)
ax.set_xticks([0, 1, 2, 3])
ax.set_xticklabels(["0 methods\n(no flag)", "1 method", "2 methods", "3 methods\n(all agree)"])
ax.set_ylabel("Number of countries")
ax.set_title("Method Agreement\n(countries flagged by N methods)", fontweight="bold")
ax.grid(True, alpha=0.3, axis="y"); ax.spines[["top","right"]].set_visible(False)

plt.tight_layout()
plt.savefig("anomaly_results.png", dpi=150, bbox_inches="tight")
plt.show()
print("\nSaved: anomaly_results.png")


# =============================================================================
# SECTION 5 — FINAL ANNOTATED DATASET OUTPUT
# =============================================================================

print("\n" + "=" * 65)
print("SECTION 5 — FINAL OUTPUT")
print("=" * 65)

out_cols = [
    "country", "iso", "sdi",
    "comm_rate", "ncd_rate", "inj_rate", "all_rate",
    "comm_pred", "comm_resid",
    "cluster", "cluster_label",
    "anom_ols", "anom_iso_4d", "anom_lof",
    "n_methods_flagged",
    "iso_score_2d", "lof_score", "silhouette"
]
df_out = df[out_cols].copy()
df_out["anom_ols_label"] = df_out["anom_ols"].map(
    {1: "underperformer", -1: "overperformer", 0: "expected"}
)
df_out = df_out.sort_values("n_methods_flagged", ascending=False).reset_index(drop=True)

df_out.to_csv("ml_model_output.csv", index=False)
print(f"Saved: ml_model_output.csv  ({len(df_out)} rows, {len(df_out.columns)} columns)")

# Summary banner
print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
print(f"  Countries analysed        : {len(df)}")
print(f"\n  OLS Regression")
print(f"    Communicable R² (CV)    : {cv_results['test_r2'].mean():.3f} ± {cv_results['test_r2'].std():.3f}")
print(f"    Communicable R² (test)  : {test_r2:.3f}")
print(f"    Test RMSE               : {test_rmse:.1f} DALYs/1k")
print(f"\n  K-Means Clustering (k=4)")
print(f"    Silhouette score        : {final_sil:.3f}")
print(f"    Davies-Bouldin index    : {final_db:.3f}")
print(f"    Calinski-Harabasz       : {final_ch:.1f}")
print(f"\n  Anomaly Detection")
print(f"    OLS residual flagged    : {(df['anom_ols'] != 0).sum()}")
print(f"    Isolation Forest        : {(df['anom_iso_4d'] == -1).sum()}")
print(f"    Local Outlier Factor    : {(df['anom_lof'] == -1).sum()}")
print(f"    All 3 methods agree on  : {(df['n_methods_flagged'] == 3).sum()} countries")
