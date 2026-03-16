"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useDashboard } from "@/lib/context";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/overview", label: "Overview", icon: "📊" },
  { href: "/by-disease", label: "By Disease", icon: "🦠" },
  { href: "/by-country", label: "By Country", icon: "🌏" },
  { href: "/time-series", label: "Time Series", icon: "📈" },
];

const secondaryNavItems = [
  { href: "/upload", label: "Upload Data", icon: "📤" },
  { href: "/about", label: "About", icon: "ℹ️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { selectedYear, setSelectedYear, availableYears, loading, data } = useDashboard();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo / Title */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-trust-blue">DALY Dashboard</h1>
        <p className="text-sm text-secondary mt-1">Asia Pacific Region</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "nav-link",
                    isActive && "nav-link-active"
                  )}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Secondary Navigation */}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="px-3 text-xs font-medium text-secondary uppercase tracking-wider mb-2">
            Settings
          </p>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={clsx(
                      "nav-link",
                      isActive && "nav-link-active"
                    )}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Year Selector */}
      <div className="p-4 border-t border-border">
        <label className="block text-sm font-medium text-secondary mb-2">
          Analysis Year
        </label>
        {loading ? (
          <div className="w-full h-10 bg-border/50 rounded-md animate-pulse" />
        ) : (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-border rounded-md text-primary focus:outline-none focus:ring-2 focus:ring-trust-accent"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Data Status */}
      <div className="p-4 border-t border-border">
        {loading ? (
          <p className="text-xs text-secondary">Loading data...</p>
        ) : data ? (
          <>
            <p className="text-xs text-success font-medium">Data loaded</p>
            <p className="text-xs text-secondary mt-1">
              {availableYears.length} years available
            </p>
            <p className="text-xs text-secondary">
              Source: WHO Global Health Estimates
            </p>
          </>
        ) : (
          <p className="text-xs text-warning">No data loaded</p>
        )}
      </div>
    </aside>
  );
}
