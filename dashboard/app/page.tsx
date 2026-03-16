"use client";

import Link from "next/link";
import Image from "next/image";

const impactAreas = [
  {
    id: "planet",
    title: "Planet",
    subtitle: "Protecting the Earth",
    color: "#4CAF50",
    href: "/planet",
    available: false,
  },
  {
    id: "people",
    title: "People",
    subtitle: "Uplifting Communities",
    color: "#9C5B8D",
    href: "/people",
    available: true,
  },
  {
    id: "peace",
    title: "Peace",
    subtitle: "Connecting People",
    color: "#2196F3",
    href: "/peace",
    available: false,
  },
  {
    id: "progress",
    title: "Progress",
    subtitle: "Advancing Capabilities",
    color: "#F57C00",
    href: "/progress",
    available: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col">
      {/* Hero Section */}
      <div className="py-12">
        <h1 className="text-4xl md:text-5xl font-bold text-trust-navy font-heading mb-4">
          Our Areas of Impact
        </h1>
        <p className="text-lg text-secondary max-w-2xl">
          We focus on where impact can be greatest - with Planet, People, Peace,
          and Progress.
        </p>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
        {impactAreas.map((area) => (
          <Link
            key={area.id}
            href={area.available ? area.href : "#"}
            className={`group relative overflow-hidden rounded-lg transition-all duration-500 ${
              area.available
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-90"
            }`}
            onClick={(e) => {
              if (!area.available) {
                e.preventDefault();
              }
            }}
          >
            {/* Card Background */}
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
              style={{ backgroundColor: area.color }}
            >
              {/* Decorative 3D-like elements */}
              <div className="absolute inset-0 opacity-20">
                <svg
                  viewBox="0 0 200 300"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {area.id === "planet" && (
                    <>
                      <circle cx="100" cy="200" r="80" fill="rgba(0,0,0,0.1)" />
                      <circle cx="100" cy="200" r="60" fill="rgba(0,0,0,0.1)" />
                      <circle cx="100" cy="200" r="40" fill="rgba(0,0,0,0.1)" />
                      <circle
                        cx="60"
                        cy="240"
                        r="15"
                        fill="rgba(255,255,255,0.3)"
                      />
                    </>
                  )}
                  {area.id === "people" && (
                    <>
                      <path
                        d="M50 150 Q100 100 150 150 Q100 200 50 150"
                        fill="rgba(0,0,0,0.1)"
                      />
                      <circle
                        cx="100"
                        cy="200"
                        r="20"
                        fill="rgba(255,255,255,0.3)"
                      />
                    </>
                  )}
                  {area.id === "peace" && (
                    <>
                      <path
                        d="M60 180 L140 180 L140 220 L60 220 Z"
                        fill="rgba(0,0,0,0.1)"
                      />
                      <circle
                        cx="80"
                        cy="200"
                        r="15"
                        fill="rgba(255,255,255,0.3)"
                      />
                      <circle
                        cx="120"
                        cy="200"
                        r="15"
                        fill="rgba(255,255,255,0.3)"
                      />
                    </>
                  )}
                  {area.id === "progress" && (
                    <>
                      <path
                        d="M60 250 L60 180 L100 180"
                        stroke="rgba(0,0,0,0.15)"
                        strokeWidth="20"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="160"
                        r="12"
                        fill="rgba(255,255,255,0.3)"
                      />
                      <circle
                        cx="110"
                        cy="190"
                        r="12"
                        fill="rgba(255,255,255,0.3)"
                      />
                      <circle
                        cx="140"
                        cy="220"
                        r="12"
                        fill="rgba(255,255,255,0.3)"
                      />
                    </>
                  )}
                </svg>
              </div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
            </div>

            {/* Card Content */}
            <div className="relative z-10 h-full min-h-[350px] md:min-h-[400px] flex flex-col items-center justify-start pt-12 px-6 text-white">
              <h2 className="text-2xl md:text-3xl font-bold font-heading italic mb-2 transition-transform duration-300 group-hover:-translate-y-2">
                {area.title}
              </h2>
              <p className="text-sm md:text-base opacity-90 transition-transform duration-300 group-hover:-translate-y-2">
                {area.subtitle}
              </p>

              {/* Coming Soon Badge */}
              {!area.available && (
                <div className="mt-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                  Coming Soon
                </div>
              )}

              {/* Hover Arrow */}
              {area.available && (
                <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>Explore</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </Link>
        ))}
      </div>

      {/* Footer text */}
      <div className="py-8 text-center">
        <p className="text-sm text-secondary">
          Temasek Trust Data Dashboard Ecosystem
        </p>
      </div>
    </div>
  );
}
