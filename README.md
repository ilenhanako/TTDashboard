# Health Data Dashboard

## SUTD Computational Data Science

A comprehensive data visualization platform built with Next.js, featuring interactive dashboards for global health metrics, socio-demographic indices, and climate indicators across Asia-Pacific countries.

## Overview

This project provides data-driven insights organized around four key impact areas (the 4Ps):

- **Planet** - Environmental and climate indicators
- **People** - Health and socio-demographic metrics
- **Peace** - Social cohesion indicators (coming soon)
- **Progress** - Development metrics (coming soon)

## Features

### People Dashboards

#### WHO Global Health Estimates: Causes of DALYs

- Disability-Adjusted Life Years (DALY) analysis
- Country-by-country comparisons
- Disease category breakdowns
- Time series trends

#### Socio-Demographic Index (SDI) Dashboard

Interactive 5-tab dashboard analyzing SDI across 15 Asia-Pacific countries:

| Tab                | Description                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| Overview           | Regional snapshot with KPI cards, world region trends, APAC benchmarks |
| World Context      | Global ranking of 186 countries, SDI distribution, tier analysis       |
| APAC Trends        | 34-year time series (1990-2023) with filtering and growth analysis     |
| ASEAN vs Non-ASEAN | Group comparison trajectories, averages, and summary tables            |
| Upload Data        | File upload interface for updating SDI data                            |

### Planet Dashboards

#### Heat Index 35 Dashboard

Climate heat exposure analysis with World Bank API integration:

| Tab              | Description                                      |
| ---------------- | ------------------------------------------------ |
| Overview         | KPIs, country rankings, summary tables           |
| Heat Trends      | Multi-country time series with smoothing options |
| ASEAN Comparison | Group-level heat exposure analysis               |

## Tech Stack

| Technology   | Version | Purpose                         |
| ------------ | ------- | ------------------------------- |
| Next.js      | 14.2    | React framework with App Router |
| React        | 18      | UI library                      |
| TypeScript   | 5       | Type safety                     |
| Tailwind CSS | 3.4     | Styling                         |
| Recharts     | 2.12    | Data visualization              |

## Project Structure

```
ttdata/
├── dashboard/              # Next.js application
│   ├── app/
│   │   ├── page.tsx       # Landing page (4Ps)
│   │   ├── people/        # People dashboards
│   │   │   ├── sdi/       # SDI dashboard
│   │   │   ├── daly-dashboard/
│   │   │   └── upload/
│   │   └── planet/        # Planet dashboards
│   │       └── heat-index/
│   ├── components/        # Reusable chart components
│   └── lib/               # Constants, types, contexts
├── data_processing/       # Python preprocessing scripts
├── datasets/              # Source data files
├── draft_dashboards/      # HTML prototypes
├── streamlit_app/         # Streamlit prototype
└── models/                # Data models
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ttdata.git
cd ttdata/dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
npm run build
npm start
```

## Data Sources

| Dataset    | Source                                                             | Coverage                     |
| ---------- | ------------------------------------------------------------------ | ---------------------------- |
| SDI        | [IHME Global Burden of Disease 2023](https://ghdx.healthdata.org/) | 186 countries, 1990-2023     |
| DALY       | [WHO Global Health Estimates](https://www.who.int/data/gho/)       | 15 APAC countries            |
| Heat Index | [World Bank Climate API](https://data.worldbank.org/)              | 15 APAC countries, 1970-2020 |

### Focus Countries (15 APAC)

**ASEAN (10):** Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Vietnam

**Non-ASEAN (5):** Bangladesh, China, India, Japan, South Korea

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

## Data Processing

Python scripts for preprocessing raw datasets are located in `data_processing/`. See `INSTRUCTIONS.md` for detailed preprocessing workflows.

```bash
# Example: Preprocess SDI data
python data_processing/preprocess_heat_daly.py
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-dashboard`)
3. Commit changes (`git commit -m 'Add new dashboard'`)
4. Push to branch (`git push origin feature/new-dashboard`)
5. Open a Pull Request

## License

This project is private and intended for internal use.

## Acknowledgments

- [Institute for Health Metrics and Evaluation (IHME)](https://www.healthdata.org/) for SDI data
- [World Health Organization](https://www.who.int/) for DALY estimates
- [World Bank](https://data.worldbank.org/) for climate indicators
