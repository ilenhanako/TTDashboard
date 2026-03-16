"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const pillars = [
  { id: "planet", label: "PLANET", href: "/planet", available: false },
  { id: "people", label: "PEOPLE", href: "/people", available: true },
  { id: "peace", label: "PEACE", href: "/peace", available: false },
  { id: "progress", label: "PROGRESS", href: "/progress", available: false },
];

const categories = [
  {
    title: "GLOBAL HEALTH",
    items: [],
  },
  {
    title: "LIFELONG HEALTH & WELL-BEING",
    items: [
      {
        label: "WHO Global Health Estimates: Causes of DALYs",
        href: "/people/daly-dashboard",
        available: true,
      },
    ],
  },
  {
    title: "INCLUSIVE DEVELOPMENT",
    items: [],
  },
];

export default function PeoplePage() {
  const pathname = usePathname();

  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Pillars Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {pillars.map((pillar) => {
              const isActive = pillar.id === "people";
              return (
                <Link
                  key={pillar.id}
                  href={pillar.available ? pillar.href : "#"}
                  className={`relative py-4 text-sm md:text-base font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-trust-navy"
                      : pillar.available
                        ? "text-secondary hover:text-trust-navy"
                        : "text-secondary/50 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (!pillar.available) e.preventDefault();
                  }}
                >
                  {pillar.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-trust-navy" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Image */}
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#9C5B8D]">
            {/* Decorative 3D-like elements */}
            <svg
              viewBox="0 0 400 500"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Background */}
              <rect width="400" height="500" fill="#9C5B8D" />

              {/* Curved shapes */}
              <ellipse
                cx="200"
                cy="300"
                rx="180"
                ry="180"
                fill="rgba(0,0,0,0.08)"
              />
              <ellipse
                cx="200"
                cy="300"
                rx="140"
                ry="140"
                fill="rgba(0,0,0,0.06)"
              />

              {/* Heart-like curve at top */}
              <path
                d="M100 200 Q200 100 300 200 Q200 280 100 200"
                fill="rgba(0,0,0,0.1)"
              />

              {/* Metallic spheres */}
              <defs>
                <radialGradient id="sphere1" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#D4A5C9" />
                  <stop offset="50%" stopColor="#9C5B8D" />
                  <stop offset="100%" stopColor="#6B3A5E" />
                </radialGradient>
                <radialGradient id="sphere2" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#C99BBE" />
                  <stop offset="50%" stopColor="#8B4F7A" />
                  <stop offset="100%" stopColor="#5A3250" />
                </radialGradient>
              </defs>

              {/* Main sphere */}
              <circle cx="200" cy="320" r="35" fill="url(#sphere1)" />
              <ellipse
                cx="188"
                cy="308"
                rx="8"
                ry="6"
                fill="rgba(255,255,255,0.4)"
              />

              {/* Smaller sphere */}
              <circle cx="120" cy="420" r="25" fill="url(#sphere2)" />
              <ellipse
                cx="112"
                cy="412"
                rx="5"
                ry="4"
                fill="rgba(255,255,255,0.3)"
              />

              {/* Shadow under spheres */}
              <ellipse
                cx="200"
                cy="360"
                rx="30"
                ry="8"
                fill="rgba(0,0,0,0.15)"
              />
              <ellipse
                cx="120"
                cy="448"
                rx="20"
                ry="5"
                fill="rgba(0,0,0,0.15)"
              />
            </svg>
          </div>

          {/* Right: Content */}
          <div className="py-4 lg:py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-trust-navy font-heading mb-4">
              Uplifting Communities
            </h1>
            <p className="text-lg text-secondary mb-8">
              We are committed to unlocking human potential and nurturing
              resilient communities.
            </p>

            {/* Categories */}
            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category.title}>
                  <h2 className="text-sm font-bold text-trust-navy tracking-wide mb-3">
                    {category.title}
                  </h2>
                  {category.items.length > 0 ? (
                    <ul className="space-y-2 ml-1">
                      {category.items.map((item) => (
                        <li key={item.label} className="flex items-start gap-2">
                          <span className="text-trust-navy mt-1.5">•</span>
                          {item.available ? (
                            <Link
                              href={item.href}
                              className="text-trust-navy hover:text-trust-blue hover:underline transition-colors"
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span className="text-secondary">{item.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-secondary/60 italic ml-4">
                      Coming soon
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
