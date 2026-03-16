"use client";

import { useMemo } from "react";
import { shortenCountryName } from "@/lib/constants";

interface CountryData {
  name: string;
  dalyRate: number;
  total: number;
  population: number;
}

interface DALYHeatMapProps {
  data: CountryData[];
  worldDalyRate: number;
}

// Standard country abbreviations
const COUNTRY_ABBREV: Record<string, string> = {
  "Bangladesh": "BGD",
  "Cambodia": "KHM",
  "China": "CHN",
  "India": "IND",
  "Indonesia": "IDN",
  "Japan": "JPN",
  "Lao People's Democratic Republic": "LAO",
  "Malaysia": "MYS",
  "Mongolia": "MNG",
  "Myanmar": "MMR",
  "Philippines": "PHL",
  "Republic of Korea": "KOR",
  "Singapore": "SGP",
  "Thailand": "THA",
  "Viet Nam": "VNM",
};

function getCountryAbbrev(name: string): string {
  return COUNTRY_ABBREV[name] || name.slice(0, 3).toUpperCase();
}

export function DALYHeatMap({ data, worldDalyRate }: DALYHeatMapProps) {
  const { minRate, maxRate, colorScale } = useMemo(() => {
    const rates = data.map((d) => d.dalyRate);
    const min = Math.min(...rates);
    const max = Math.max(...rates);

    // Color scale from green (low) to yellow (medium) to red (high)
    const getColor = (rate: number) => {
      const normalized = (rate - min) / (max - min);

      if (normalized < 0.5) {
        // Green to Yellow
        const t = normalized * 2;
        const r = Math.round(34 + (250 - 34) * t);
        const g = Math.round(139 + (204 - 139) * t);
        const b = Math.round(34 + (0 - 34) * t);
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Yellow to Red
        const t = (normalized - 0.5) * 2;
        const r = Math.round(250 + (207 - 250) * t);
        const g = Math.round(204 + (34 - 204) * t);
        const b = Math.round(0 + (46 - 0) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
    };

    return { minRate: min, maxRate: max, colorScale: getColor };
  }, [data]);

  // Sort data by DALY rate (highest first)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.dalyRate - a.dalyRate);
  }, [data]);

  // Grid layout: 5 columns x 3 rows for 15 countries
  const cols = 5;
  const cellWidth = 18;
  const cellHeight = 24;
  const gap = 2;
  const padding = 4;

  return (
    <div className="space-y-4">
      {/* Heat Map Grid */}
      <div className="relative bg-trust-light/30 rounded-lg p-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${cols * (cellWidth + gap) + padding * 2} ${3 * (cellHeight + gap) + padding * 2 + 12}`}
          className="w-full h-auto"
          style={{ maxHeight: "350px" }}
        >
          {/* Background */}
          <rect
            x="0"
            y="0"
            width={cols * (cellWidth + gap) + padding * 2}
            height={3 * (cellHeight + gap) + padding * 2 + 12}
            fill="#f8fafc"
            rx="2"
          />

          {/* World Average Reference */}
          <g transform={`translate(${padding}, ${padding})`}>
            <rect
              x="0"
              y="0"
              width="28"
              height="10"
              fill="white"
              stroke="#e1e4e8"
              strokeWidth="0.5"
              rx="1"
            />
            <text x="14" y="4" textAnchor="middle" fontSize="3" fill="#57606A">
              World Avg
            </text>
            <text
              x="14"
              y="8"
              textAnchor="middle"
              fontSize="3.5"
              fill="#05006D"
              fontWeight="600"
            >
              {worldDalyRate.toFixed(0)}/1k
            </text>
          </g>

          {/* Country Grid */}
          <g transform={`translate(${padding}, ${padding + 14})`}>
            {sortedData.map((country, index) => {
              const row = Math.floor(index / cols);
              const col = index % cols;
              const x = col * (cellWidth + gap);
              const y = row * (cellHeight + gap);
              const color = colorScale(country.dalyRate);
              const isAboveWorld = country.dalyRate > worldDalyRate;

              return (
                <g key={country.name}>
                  <rect
                    x={x}
                    y={y}
                    width={cellWidth}
                    height={cellHeight}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1"
                    rx="2"
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                  <text
                    x={x + cellWidth / 2}
                    y={y + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3.5"
                    fill="#1F2328"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {getCountryAbbrev(country.name)}
                  </text>
                  <text
                    x={x + cellWidth / 2}
                    y={y + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="4"
                    fill="#1F2328"
                    fontWeight="700"
                    className="pointer-events-none"
                  >
                    {country.dalyRate.toFixed(0)}
                  </text>
                  <text
                    x={x + cellWidth / 2}
                    y={y + 20.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="3"
                    fill="#1F2328"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {isAboveWorld ? "▲" : "▼"}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-xs text-secondary">Lower DALY Rate</span>
        <div
          className="flex h-3 rounded overflow-hidden"
          style={{ width: "200px" }}
        >
          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                backgroundColor: colorScale(minRate + (maxRate - minRate) * t),
              }}
            />
          ))}
        </div>
        <span className="text-xs text-secondary">Higher DALY Rate</span>
      </div>

      {/* Indicator Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-secondary">
        <span className="flex items-center gap-1">
          <span className="text-primary">▲</span> Above world average
        </span>
        <span className="flex items-center gap-1">
          <span className="text-primary">▼</span> Below world average
        </span>
      </div>
    </div>
  );
}
