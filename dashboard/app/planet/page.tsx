"use client";

import Link from "next/link";

const pillars = [
  { id: "planet", label: "PLANET", href: "/planet", available: true },
  { id: "people", label: "PEOPLE", href: "/people", available: true },
  { id: "peace", label: "PEACE", href: "/peace", available: false },
  { id: "progress", label: "PROGRESS", href: "/progress", available: false },
];

const categories = [
  {
    title: "GREENHOUSE GAS MITIGATION",
    items: [],
  },
  {
    title: "URBAN LIVEABILITY",
    items: [
      { label: "Heat Index 35", href: "/planet/heat-index", available: true },
    ],
  },
  {
    title: "SUSTAINABLE NATURAL ECOSYSTEMS",
    items: [],
  },
];

export default function PlanetPage() {
  return (
    <div className="min-h-[calc(100vh-80px)]">
      {/* Pillars Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-8 md:gap-16">
            {pillars.map((pillar) => {
              const isActive = pillar.id === "planet";
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
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Image */}
          <div className="relative aspect-[4/3] max-h-[400px] rounded-lg overflow-hidden bg-[#4CAF50]">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Background */}
              <rect width="400" height="300" fill="#4CAF50" />

              {/* Concentric curved rings */}
              <ellipse
                cx="150"
                cy="200"
                rx="180"
                ry="180"
                fill="none"
                stroke="rgba(0,0,0,0.12)"
                strokeWidth="25"
              />
              <ellipse
                cx="150"
                cy="200"
                rx="130"
                ry="130"
                fill="none"
                stroke="rgba(0,0,0,0.10)"
                strokeWidth="25"
              />
              <ellipse
                cx="150"
                cy="200"
                rx="80"
                ry="80"
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="25"
              />

              {/* Metallic spheres */}
              <defs>
                <radialGradient id="greenSphere1" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#7CB342" />
                  <stop offset="50%" stopColor="#4CAF50" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </radialGradient>
                <radialGradient id="greenSphere2" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#81C784" />
                  <stop offset="50%" stopColor="#43A047" />
                  <stop offset="100%" stopColor="#1B5E20" />
                </radialGradient>
              </defs>

              {/* Spheres on the rings */}
              <circle cx="330" cy="80" r="18" fill="url(#greenSphere1)" />
              <ellipse
                cx="324"
                cy="74"
                rx="4"
                ry="3"
                fill="rgba(255,255,255,0.4)"
              />

              <circle cx="280" cy="150" r="22" fill="url(#greenSphere2)" />
              <ellipse
                cx="273"
                cy="143"
                rx="5"
                ry="4"
                fill="rgba(255,255,255,0.4)"
              />

              <circle cx="80" cy="100" r="16" fill="url(#greenSphere1)" />
              <ellipse
                cx="75"
                cy="95"
                rx="3"
                ry="2"
                fill="rgba(255,255,255,0.3)"
              />

              <circle cx="50" cy="220" r="14" fill="url(#greenSphere2)" />
              <ellipse
                cx="46"
                cy="216"
                rx="3"
                ry="2"
                fill="rgba(255,255,255,0.3)"
              />

              {/* Shadows */}
              <ellipse
                cx="330"
                cy="100"
                rx="12"
                ry="4"
                fill="rgba(0,0,0,0.15)"
              />
              <ellipse
                cx="280"
                cy="175"
                rx="15"
                ry="5"
                fill="rgba(0,0,0,0.15)"
              />
            </svg>
          </div>

          {/* Right: Content */}
          <div className="py-4 lg:py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-trust-navy font-heading mb-4">
              Protecting Planet
            </h1>
            <p className="text-lg text-secondary mb-8">
              Our planet is our home. Responsible stewardship starts with
              protecting it for present and future generations.
            </p>

            {/* Categories */}
            <div className="space-y-8">
              {categories.map((category) => (
                <div key={category.title}>
                  <h2 className="text-sm font-bold text-trust-navy tracking-wide mb-3">
                    {category.title}
                  </h2>
                  {category.items.length > 0 ? (
                    <ul className="space-y-2 ml-4">
                      {category.items.map((item: any) => (
                        <li key={item.label} className="flex items-center gap-3">
                          <span className="text-trust-navy text-lg leading-none">•</span>
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
